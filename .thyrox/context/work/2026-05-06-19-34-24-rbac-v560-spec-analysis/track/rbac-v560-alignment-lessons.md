```yml
created_at: 2026-05-06 23:15:00
project: IACT-ui
work_package: 2026-05-06-19-34-24-rbac-v560-spec-analysis
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Lessons Learned — RBAC v5.6.0 Alignment

---

## L-01: Thunks simétricos requieren verificación explícita de completitud

**Contexto:** ITER-F implementó `adminService.deactivateAGR(id)` en la capa de servicio pero no
agregó el thunk correspondiente en `adminSlice.js`. El componente `AGRCatalogPage.jsx` importaba
`deactivateAGR` del slice, lo que producía `undefined` en runtime — un TypeError silencioso hasta
que el usuario hacía click en Desactivar.

**Lección:** Cuando se implementa un patrón simétrico (función A del módulo X → replicar en módulo Y),
generar un checklist explícito de todos los artefactos que el patrón requiere:
service method → thunk export → extraReducers fulfilled → extraReducers rejected → import en componente.
Un solo paso omitido no produce error en compilación, solo en runtime.

**Acción preventiva:** Para cada nuevo thunk, verificar que el componente que lo consume puede
importarlo sin `undefined`. Agregar test TDD que verifica `typeof export === 'function'` antes
de implementar (PAT-001: TDD red force-checks existence, not just behavior).

---

## L-02: Mock data model invertido produce bugs silenciosos de UI

**Contexto:** El array AGRS en `mockInterceptor.js` tenía `codename: 'AGR-001'` (formato ID) y
`name: 'basic_operator_group'` (codename snake_case) — exactamente invertido respecto al spec.
El componente AGRCatalogPage mostraba `agr.codename` en la tabla: el usuario veía `'AGR-001'`
como si fuera el identificador técnico correcto, cuando en realidad era un ID ficticio.

Además, `state: 'ACTIVE'` (string) en lugar de `active: true` (boolean) hacía que la lógica
`agr.active ? 'ACTIVE' : 'INACTIVE'` siempre resultara truthy para cualquier string no vacío —
el badge INACTIVE nunca aparecía aunque se simulara desactivación.

**Lección:** Los datos de mock deben replicar exactamente el contrato del modelo, no una
interpretación aproximada. Antes de crear un mock, leer el componente que lo consume para
identificar exactamente qué campos y tipos se esperan. Los tests TDD de mock
(mockInterceptor-agr.test.js) deben verificar tipos (`typeof agr.active === 'boolean'`),
no solo presencia del campo.

---

## L-03: TDD red-phase revela gaps de contrato antes que el runtime

**Contexto:** T-001 escribió tests para `deactivateAGR` antes de que existiera el thunk. Los tests
fallaron con `TypeError: deactivateAGR is not a function` — exactamente el error que habría ocurrido
en producción. El red-phase capturó G-F1 antes de que llegara a un usuario.

Del mismo modo, T-003 falló en `agrs[0].codename` con `'AGR-001'` !== `'basic_operator_group'`,
revelando G-F2 sin necesidad de arrancar el servidor de desarrollo.

**Lección:** La fase RED del TDD no es solo un ritual — es un detector de contratos rotos.
Cuando los tests TDD se escriben contra el contrato esperado (no contra la implementación existente),
actúan como especificación ejecutable que falla de forma significativa. El costo del red-phase es
bajo; el costo de un TypeError en runtime es alto (requiere reproducción manual, afecta usuarios).

---

## L-04: Constantes de catálogo con granularidad insuficiente generan brechas de seguridad

**Contexto:** Tres rutas (`/logs/search`, `/logs/export`, `/logs/etl/availability`) usaban
`VIEW_LOGS` (`logs:view_app`) en lugar de sus constantes específicas. Esto significa que un usuario
con solo `logs:view_app` podía acceder a rutas de búsqueda y exportación de logs, que tienen mayor
impacto de privacidad.

Del mismo modo, `/permissions/revoke-group` y `/permissions/temp-permissions` usaban `MANAGE_ACCESS`
(`access:assign`) en lugar de `access:revoke_group` y `access:grant_exceptional`. El spec define
estas como funciones separadas (UC_PERM_02, UC_PERM_03) con distintos principios de autorización.

**Lección:** Cada ruta con semántica de autorización distinta debe tener su propia constante de
catálogo. La reutilización de constantes por conveniencia ("ya tiene una constante de logs, sirve")
viola el principio de mínimo privilegio. El proceso correcto: spec → constante específica →
ProtectedRoute. Nunca: constante existente similar → ProtectedRoute (aproximación).

---

## L-05: Los gaps "identificados pero no en scope" necesitan T-NNN de cierre

**Contexto:** G-C5 (escenario de usuario admin para mock) fue identificado en Phase 1 del WP pero
marcado como "no estaba en scope original" y postergado sin una tarea asignada. Esto lo hizo
invisible al sistema de tracking — no aparecía como `- [ ]` en el task plan, por lo que no había
presión para cerrarlo.

Al llegar a Phase 10 y generar el task plan expandido, G-C5 fue detectado nuevamente y finalmente
asignado como T-009. Si el WP hubiera cerrado sin T-009, el gap habría migrado como deuda técnica
al backlog con menor visibilidad.

**Lección:** Todo gap identificado en Phase 1 debe tener exactamente una de estas resoluciones:
(a) tarea T-NNN en el task plan del WP actual, (b) tarea T-NNN en un WP futuro específico con
referencia cruzada, (c) decisión explícita documentada de no-acción con razón técnica. Ningún gap
puede quedar sin categoría — "no en scope" sin T-NNN es deuda técnica invisible.

---

## L-06: Instanciación de mocks en tests requiere verificar el contrato de exports

**Contexto:** Los tests de `mockInterceptor-agr.test.js` inicialmente fallaron porque importaban
`MockInterceptor` como export default (`import MockInterceptor from '../mockInterceptor'`) cuando
el archivo exporta la clase como named export (`export { MockInterceptor }`) y el singleton como
default. La llamada a `new MockInterceptor()` resultaba en `TypeError: not a constructor`.

Segundo problema: el constructor inicializa `this.enabled` desde `process.env.REACT_APP_USE_MOCKS`,
que es `undefined` en tests. Sin `interceptor.enabled = true`, `intercept()` retornaba `null`.

**Lección:** Al escribir tests para mocks con estado (singletons, instancias con env vars), siempre:
(1) Leer el archivo fuente para verificar el patrón de export antes de importar,
(2) Revisar el constructor para identificar dependencias de `process.env` o estado externo,
(3) Mockear o sobrescribir explícitamente las propiedades de entorno (`interceptor.enabled = true`).
No asumir que `import X from 'module'` da la clase — puede dar el singleton.
