```yml
created_at: 2026-05-06 20:30:00
project: IACT-UI
work_package: 2026-05-06-19-34-24-rbac-v560-spec-analysis
phase: Phase 1 — DISCOVER
author: claude
status: Borrador
```

# Grafo de dependencias — Correcciones RBAC v5.6.0

Análisis de qué depende de qué para determinar el orden óptimo de ejecución
de los 19 gaps identificados en la auditoría de implementación.

---

## 1. Inventario de consumidores por artefacto

Antes del grafo, verificar quién consume cada artefacto modificado:

### `src/permissions/catalog.js`
- Importado por: `AppRouter.jsx`, `ProtectedRoute.test.jsx`, `AppRouter.test.jsx`,
  `catalog.test.js`
- **Riesgo de ruptura:** `catalog.test.js` valida `module:action` format con
  `it.each` → los cambios a catalog.js deben mantener el formato correcto
- `VIEW_CALLS` y `PERFORM_CALLS` son usadas **solo** en `catalog.js` (cero
  consumidores externos) → eliminación segura

### `src/mocks/permissions.json`
- Importado por: `PermissionsService.test.js`, `registry.js`
- `PermissionsService.test.js:33` referencia `nombre_completo` explícitamente
  → cambiar ese campo **rompe el test**
- `PermissionsService.test.js:30` valida `capacidades` exactamente →
  cambiar la lista de capacidades **rompe el test** (requiere update del test)

### `src/mocks/mockInterceptor.js`
- No tiene tests directos — se prueba vía integración en page tests
- `FunctionCatalogPage.test.jsx` y `AGRCatalogPage.test.jsx` mockean
  redux directamente → **no usan mockInterceptor** → cambios a interceptor
  son seguros sin tocar esos tests

### `src/pages/admin/FunctionCatalogPage.jsx`
- `FunctionCatalogPage.test.jsx` no testea CODENAME_REGEX directamente →
  hay que agregar test para el fix G-B1

### `src/router/AppRouter.jsx`
- `AppRouter.test.jsx` no verifica los guards granulares de logs/realtime →
  cambios a guards son seguros

---

## 2. Grafo de dependencias (DAG)

```
CAPA 0 — Sin dependencias (raíces)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
G-A3  catalog.js: eliminar VIEW_CALLS/PERFORM_CALLS (RESERVADO)
G-A4  catalog.js: agregar CREATE_SEPARATION_RULE = 'adm:create_sod'
G-A5  catalog.js: actualizar comentario v5.4.0 → v5.6.0
G-A2  catalog.js: agregar VIEW_INFRA_LOGS, VIEW_SYSTEM_HEALTH, VIEW_TECHNICAL_METRICS
G-A1  catalog.js: agregar SAVE_VIEW = 'reports:save_view'
G-B1  FunctionCatalogPage: corregir CODENAME_REGEX (regex change + test)
G-C1  permissions.json: alinear capacidades con composición AGR-002+004
      [requiere update PermissionsService.test.js]
G-C4  permissions.json: marcar AGR-011/012 como RESERVADO en grupos
G-E1  AppRouter: /logs/etl → VIEW_PIPELINE_LOGS (constante ya existe)
G-E3  AppRouter: /reports/realtime → VIEW_METRICS (constante ya existe)

CAPA 1 — Dependen de CAPA 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
G-D1  mockInterceptor: GET /api/admin/functions/ handler
      [no deps de código; datos mock son independientes]

G-D2  mockInterceptor: GET /api/admin/agr/ handler
      [no deps de código; datos mock son independientes]

G-E2  AppRouter: guards granulares logs/infra/status/metrics
      [depende de G-A2 → constantes deben existir antes]

G-E4  AppRouter: ruta /reports/saved + SavedViewsPage (nueva)
      [depende de G-A1 → SAVE_VIEW debe existir antes]
      [es la tarea más grande — nueva página completa]

CAPA 2 — Dependen de CAPA 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
G-D3  mockInterceptor: POST/PATCH /api/admin/functions/ y /agr/
      [depende de G-D1/D2 → estructura de datos debe estar definida]

G-C5  permissions.json: escenario usuario admin (adm:manage_catalog)
      [depende de G-D1/D2 → endpoints deben existir para que el escenario
       sea testeable]

CAPA 3 — Dependen de CAPA 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
G-C2  permissions.json: renombrar nombre_completo → module
      [depende de G-C1 → mejor hacer ambos en el mismo bloque
       para actualizar PermissionsService.test.js una sola vez]

G-C3  permissions.json: expandir funciones_accesibles (6 → 14)
      [depende de G-C1 → la corrección de capacidades define la base]

G-B2  AGRCatalogPage: agregar validación de codename snake_case
      [independiente de código, pero lógicamente después de que
       G-D2 proporcione datos reales de AGR para testear]
```

**Representación visual:**

```
G-A3 ─┐
G-A4 ─┤
G-A5 ─┼─── catalog.js (sin tests que rompan) ──► G-E2 (usa G-A2)
G-A2 ─┤                                           G-E4 (usa G-A1)
G-A1 ─┘

G-B1 ───── FunctionCatalogPage regex fix (independiente)

G-C1 ──── permissions.json capacidades ──► G-C2, G-C3 (misma sesión)
G-C4 ──── permissions.json AGR reservados (independiente)

G-D1 ──┐
G-D2 ──┼─── mockInterceptor GET handlers ──► G-D3 (POST/PATCH)
       └──────────────────────────────────── G-C5 (admin scenario)

G-E1, G-E3 ── AppRouter guards (constantes ya existen, sin deps)
```

---

## 3. Agrupación en ITERs (1 ITER = 1 commit)

Criterio de agrupación: afinidad de artefacto + dependencias + riesgo de
ruptura de tests.

### ITER-A — catalog.js cleanup + FunctionCatalogPage fix
**Gaps:** G-A3, G-A4, G-A5, G-B1
**Artefactos:** `src/permissions/catalog.js`, `FunctionCatalogPage.jsx`,
`FunctionCatalogPage.test.jsx`, `catalog.test.js`
**Riesgo tests:** `catalog.test.js` valida count ≥25 y formato `module:action`
→ eliminar G-A3 (2 entries) reduce count; agregar G-A4 (1 entry) compensa →
neto: sin ruptura. G-B1 necesita test nuevo.
**Por qué juntos:** todos tocan la capa de definición de permisos y se
pueden hacer sin esperar a nadie. G-B1 es el CRÍTICO — va en el primer ITER.

### ITER-B — catalog.js completitud + AppRouter guards
**Gaps:** G-A2, G-A1, G-E1, G-E2, G-E3
**Artefactos:** `catalog.js`, `AppRouter.jsx`
**Riesgo tests:** `AppRouter.test.jsx` no valida guards de logs/realtime →
sin ruptura. `catalog.test.js` pasa si se agrega en formato correcto.
**Por qué juntos:** G-A2 habilita G-E2; G-A1 habilita la constante para G-E4
(página save_view va en ITER separado). G-E1/E3 son simples re-asignaciones.
**Excluye G-E4:** nuevo componente — va solo en ITER-E.

### ITER-C — mockInterceptor GET handlers
**Gaps:** G-D1, G-D2
**Artefactos:** `src/mocks/mockInterceptor.js`
**Riesgo tests:** ninguno directo (page tests mockean redux). Agregar handlers
solo mejora la integración.
**Datos mock a incluir:**
- `GET /api/admin/functions/` → 10 funciones representativas del catálogo v5.6.0
  (cubriendo los 9 módulos activos + MOD_Admin)
- `GET /api/admin/agr/` → 10 AGRs activos (AGR-001..010, excluyendo 011/012)
**Por qué separado:** Es la base para ITER-D y ITER-F.

### ITER-D — mockInterceptor CRUD + permissions.json alineación
**Gaps:** G-D3, G-C1, G-C4, G-C5, G-C2, G-C3
**Artefactos:** `mockInterceptor.js`, `permissions.json`,
`PermissionsService.test.js`
**Riesgo tests:** G-C1 (cambiar capacidades) y G-C2 (renombrar
`nombre_completo`) **rompen** `PermissionsService.test.js` → se actualiza
en el mismo commit.
**Por qué juntos:** todos tocan el estado del mock. Agrupar las roturas de
`PermissionsService.test.js` en un solo commit evita commits intermedios
con tests rojos.

### ITER-E — UC_RPT_10 save_view (nueva feature)
**Gaps:** G-E4, G-A1 (ya aplicado en ITER-B)
**Artefactos:** `src/pages/reports/SavedViewsPage.jsx` (nuevo),
`src/pages/reports/__tests__/SavedViewsPage.test.jsx` (nuevo),
`AppRouter.jsx`, `reportsService.js` (mock handler)
**Nota:** G-A1 ya estará en catalog.js desde ITER-B. Este ITER solo agrega
la página, el test, la ruta y el mock handler para `/api/reports/saved-views/`.
**Estimación:** mayor esfuerzo — nueva página completa con TDD.

### ITER-F — AGRCatalogPage codename validation
**Gaps:** G-B2
**Artefactos:** `AGRCatalogPage.jsx`, `AGRCatalogPage.test.jsx`
**Por qué al final:** bajo riesgo, baja severidad; requiere G-D2 para tener
datos AGR reales que probar. Se hace último cuando todo lo demás está verde.

---

## 4. Orden óptimo (DAG topológico)

```
ITER-A ──► ITER-B ──► ITER-C ──► ITER-D ──► ITER-E
  │                                             │
  │                                             └── ITER-F (puede ir
  └── (ITER-B puede ir en paralelo con ITER-A         paralelo con ITER-E)
      si catalog.js no tiene conflictos — sí
      los tiene → secuencial)
```

**Orden final:**

| Orden | ITER | Gaps | Artefactos clave | Riesgo tests |
|-------|------|------|-----------------|--------------|
| 1 | ITER-A | G-A3, G-A4, G-A5, G-B1 | catalog.js, FunctionCatalogPage | bajo (1 test nuevo) |
| 2 | ITER-B | G-A2, G-A1, G-E1, G-E2, G-E3 | catalog.js, AppRouter | mínimo |
| 3 | ITER-C | G-D1, G-D2 | mockInterceptor | ninguno |
| 4 | ITER-D | G-D3, G-C1..G-C5 | mockInterceptor, permissions.json | medio (update test) |
| 5 | ITER-E | G-E4 | SavedViewsPage (nuevo), AppRouter | bajo (test nuevo) |
| 6 | ITER-F | G-B2 | AGRCatalogPage | bajo (test nuevo) |

---

## 5. Invariantes para todos los ITERs

1. **TDD:** test antes de implementación en cada gap
2. **No romper tests existentes:** cada ITER debe pasar `npm test` antes del commit
3. **Tim Pope commits:** subject imperativo ≤50 chars + body con QUÉ/POR QUÉ
4. **Un ITER = un commit** (salvo ITER-E que puede necesitar 2 si SavedViewsPage es grande)
5. **Verificar count del catálogo:** `catalog.test.js` exige `≥25` constantes.
   Estado actual: 33 constantes. Después de ITER-A: −2 (G-A3) +1 (G-A4) = 32 ≥ 25 ✅

---

## 6. Stopping points

- **SP-02** (gate humano, este documento): grafo aprobado → avanzar a Phase 8 PLAN EXECUTION
- **SP-03** (gate técnico por ITER): tests verdes antes de cada commit
- **SP-04** (gate humano final): cierre Phase 11 TRACK ordenado por el ejecutor
