```yml
created_at: 2026-05-08 22:25:00
project: THYROX
work_package: 2026-05-08-21-54-06-reports-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — reports-uc-audit

## L-01: URL es parte del contrato API — no es un detalle de implementación

**Hallazgo:** `savedFilters.js` usaba `/api/reports/saved-filters/` cuando el spec
define `/api/me/filters/`. La URL es el identificador del recurso en REST —
un cambio de URL es un cambio de contrato, no una refactorización interna.

**Lección:** Al auditar la alineación frontend↔spec, la URL es el primer
campo a verificar. Si el frontend y el backend usan rutas distintas, las requests
en integración llegarán a un 404 aunque la lógica sea correcta. El mock oculta
este error porque responde a la URL incorrecta.

**Anti-patrón:** Mock que registra un handler para la URL incorrecta — testea
la implementación contra sí misma, no contra el spec.

## L-02: Los mocks deben tener estado mutable para simular CRUD real

**Hallazgo:** El mock de saved-filters no existía. Al crearlo, se estableció
`_savedFiltersStore` como array mutable en el constructor (no fixture hardcoded),
con `_savedFiltersNextId` para ids auto-incrementales.

**Lección:** Un mock con fixture inmutable no puede simular POST+GET (el item
creado en POST no aparece en el siguiente GET). Para CRUD completo, el store
del mock debe ser mutable. El patrón correcto: `this._resourceStore = [...]`
en el constructor + `this._resourceNextId = N` para ids.

**Contraste con fixture-only:** Los mocks de read-only (lista de usuarios, catálogo)
pueden usar fixtures estáticos. Los mocks de CRUD necesitan estado mutable.

## L-03: Mock routing — orden importa cuando los patrones se solapan

**Hallazgo:** El routing original de `/api/reports/scheduled/` tenía:
```javascript
if (url.match(/\/scheduled\/\d+\//) && method !== 'GET') → sub-action
if (url.match(/\/scheduled\/\d+\/runs\//)) → history
if (url.includes('/scheduled/')) → list
```
Una GET a `/scheduled/1/runs/` correctamente caía en el segundo check.
Pero si el orden hubiera puesto el tercer check antes del segundo, la GET a
`/scheduled/1/runs/` habría caído en el list handler.

**Lección:** En mock routing con patrones que se solapan, poner los patrones
más específicos primero. El patrón `/runs/` es más específico que `/{id}/` —
debe ir primero. La regla: específico → general.

**Fix aplicado:** Mover el check de `/runs/` antes del check de `/{id}/`.

## L-04: `useEffect` para auto-apply en panel — dependencia en `savedFilters`

**Hallazgo:** UC_RPT_09 FA-04 requiere que al abrir el reporte, el filtro
default se aplique automáticamente. La implementación correcta es un `useEffect`
con `[savedFilters, onApply]` como dependencias: ejecuta cuando los filtros
cargan (async desde fetchSavedFilters), no en el mount inicial cuando el array
está vacío.

**Lección:** Para lógica que depende de datos async cargados en otro
`useEffect`, usar dos `useEffect` separados: uno para el fetch y otro
para la lógica de aplicación. El segundo solo corre cuando los datos
ya están en el store, evitando llamar `onApply([])` en el mount.

## L-05: GAP-09 (UC_RPT_11) — scope extraction es la decisión correcta

**Hallazgo:** ShareReportModal hace copy-URL-to-clipboard. El spec UC_RPT_11
define un sistema de ShareEntry con POST al backend, targets por user/AGR,
expires_at, mailbox notification y scope del receptor (CNST-008). Son dos
features completamente distintas con una UX superficialmente similar.

**Lección:** Cuando una implementación existente y el spec describen
comportamientos fundamentalmente distintos (client-side copy vs. backend
share), no es un "gap a cerrar" — es un WP separado. Intentar transformar
una implementación client-side en un feature backend dentro del mismo WP
diluye el scope y crea riesgo. La decisión correcta: dejar la implementación
existente como placeholder de UX (FA-05: "rápida aplicación") y crear WP
`reports-share-backend` para la feature real.
