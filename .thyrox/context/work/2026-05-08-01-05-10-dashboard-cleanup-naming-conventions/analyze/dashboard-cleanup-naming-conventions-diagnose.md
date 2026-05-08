```yml
created_at: 2026-05-08 01:15:00
project: IACT-UI
work_package: 2026-05-08-01-05-10-dashboard-cleanup-naming-conventions
phase: Phase 3 — ANALYZE
author: NestorMonroy
status: Borrador
```

# Phase 3 ANALYZE — dashboard-cleanup-naming-conventions

## Mapa de dependencias de `dashboardSlice` (condición de scope SP-02)

### Consumidores en producción

| Archivo | Qué usa | Tipo |
|---------|---------|------|
| `src/components/containers/Dashboard.jsx` | `fetchDashboardData` thunk + `state.dashboard` via `useSelector` | Componente principal |
| `src/hooks/domain/useDashboard.js` | `fetchDashboardData`, `updateMetric`, todos los selectors de `dashboardSelectors` | Hook wrapper |
| `src/hooks/domain/useMetrics.js` | `updateMetric` action + selectors de `dashboardSelectors` | Hook de métricas |
| `src/components/pages/Analytics/AnalyticsDashboard.jsx` | `updateMetrics` (de `reportsSlice` — **NO de dashboardSlice**) | Solo `reportsSlice` |
| `src/redux/selectors/dashboardSelectors.js` | `state.dashboard` base selector | Selectors derivados |
| `src/redux/store.js` | `dashboardReducer` en `reducer.dashboard` | Store wiring |

**Consumidores reales de `dashboardSlice`: 3** (Dashboard.jsx, useDashboard.js, useMetrics.js).
`AnalyticsDashboard.jsx` usa `updateMetrics` de `reportsSlice` — no es consumidor.

→ Condición de scope cumplida: ≤3 consumidores. **Opción B se ejecuta en este WP.**

### Observación crítica: `useMetrics` + `updateMetric`

`useMetrics.js` despacha `updateMetric` (action de `dashboardSlice`) para actualizar métricas
localmente sin pasar por el servidor. `AnalyticsDashboard.jsx` usa `updateMetrics` de
`reportsSlice` (action diferente) para lo mismo vía WebSocket.

Esto revela una inconsistencia: hay dos acciones de "actualizar métricas" en dos slices distintos.
La migración debe elegir UNA: `updateMetrics` de `reportsSlice` (ya existe, ya tiene tests).
`updateMetric` de `dashboardSlice` se elimina con el slice.

---

## Estrategia confirmada: Opción B — Deprecar `dashboardSlice`

### Qué se hace

1. **`Dashboard.jsx`** → migrar a `reportsSlice`:
   - Reemplazar `fetchDashboardData` → `fetchDashboardMetrics` (mismo thunk que usa `DashboardPage.jsx`)
   - Reemplazar `state.dashboard.metrics/loading/error` → selectors de `reportsSlice`
   - Reemplazar `state.dashboard.lastUpdate` → `null` (no existe en reportsSlice — omitir o no mostrar)

2. **`useDashboard.js`** → deprecar el hook:
   - El hook no tiene consumidores externos (solo re-exportado en `hooks/domain/index.js`)
   - Eliminar el archivo; limpiar el re-export en `index.js`

3. **`useMetrics.js`** → migrar `updateMetric` → `updateMetrics` de `reportsSlice`:
   - El hook tampoco tiene consumidores externos detectados
   - Evaluar si conservar o también eliminar

4. **`dashboardSlice.js`** → vaciar el thunk mock y conservar solo si las actions
   `setMetrics`/`setCharts`/`updateMetric` tienen tests que no se pueden migrar fácil.
   → Si no hay consumidores externos de las actions: eliminar el thunk, conservar el
   slice mínimo solo si `store.js` lo requiere, luego eliminarlo del store.

5. **`dashboardSelectors.js`** → eliminar o marcar como deprecated.
   Los selectors de `reportsSlice` ya cubren `selectMetrics`, `selectReportsLoading`.

6. **`mocks/dashboardData.js`** → eliminar si no hay otros consumidores.

### Tests afectados

| Test file | Qué mockea/testa | Acción |
|-----------|-----------------|--------|
| `dashboardSlice.test.js` | `setMetrics`, `setCharts`, `fetchDashboardData` | Eliminar con el slice |
| `containerComponents.test.jsx` | Mockea `dashboardSlice` con `setMetrics`/`setCharts`/`fetchDashboardData` | Actualizar: ya mockea `reportsSlice`, solo eliminar el mock de `dashboardSlice` |
| `pagesComponents.test.jsx` | Usa `updateMetrics` de `reportsSlice` (ya correcto) | Sin cambios |

---

## Análisis de naming HAL-2..5

### HAL-2: Rename correcto para `AlertManager`

Doc frontend §6.2 prohíbe `Service`. Doc backend §1.2 prohíbe `Manager`.
La clase hace HTTP para alertas — el rol es de "gateway" o "client" al backend de alertas.

**Decisión:** `class AlertsGateway` → archivo `alertsGateway.js`

Consumidores: 1 (`alertsSlice.js:8` — import como `alertsService`, nombre de variable correcto).
El archivo de test `alertManager.test.js` → `alertsGateway.test.js`.

### HAL-3: Renames en `securityService.js`

| Clase actual | Rol real | Nombre correcto |
|-------------|----------|----------------|
| `CSRFManager` | Provee y valida el token CSRF | `CSRFTokenProvider` |
| `CSPHelper` | Aplica Content Security Policy headers | `ContentSecurityPolicyEnforcer` |

Las instancias exportadas (`csrfManager`, `cspHelper`) mantienen sus nombres — son
variables de instancia, no clases. Cambiarlas rompería `services/index.js` sin ganancia.

### HAL-4: Variables de una sola letra — nombres aprobados

| Variable | Contexto | Nombre aprobado |
|----------|----------|-----------------|
| `const q` (×3) | `search.toLowerCase()` | `const searchQuery` |
| `const a` (×3) | `document.createElement('a')` | `const downloadLink` |
| `const v` (×1) | `e.target.value` en onChange handler | `const trimesterValue` |

### HAL-5: Filenames — decisiones finales

| Archivo | Rename | Nombre de instancia/export |
|---------|--------|--------------------------|
| `alertManager.js` | `alertsGateway.js` | export default sigue siendo instancia anónima |
| `cloneUtils.js` | `cloneDeep.js` | `cloneData` función — se mantiene el nombre |
| `reportShareUtils.js` | `reportShareUrl.js` | `buildShareUrl` — se mantiene |
| `SessionManager.jsx` | `SessionProvider.jsx` | `SessionContext` export se mantiene |
| `ReportBuilder.jsx` | `CustomReportForm.jsx` | `default export` se renombra a `CustomReportForm` |

**Nota `SessionProvider`:** mejor que `SessionGuard` porque el componente NO bloquea
acceso — siempre renderiza `{children}` mientras gestiona el contexto. Un Provider
describe el rol exactamente.

---

## Mapa epistémico

| Categoría | Claims |
|-----------|--------|
| **PROVEN** | 3 consumidores de dashboardSlice en producción (grep verificado). `useDashboard` sin consumidores externos (grep vacío). `useMetrics` sin consumidores externos (grep vacío). `updateMetrics` en reportsSlice ya existe y tiene tests (Read verificado). `AnalyticsDashboard` usa `reportsSlice`, no `dashboardSlice` (Read verificado). |
| **INFERRED** | Eliminar `dashboardSlice` del store requiere quitar `dashboard: dashboardReducer` de `store.js` — inferido de `store.js:39`. `lastUpdate` de `dashboardSlice` no tiene equivalente en `reportsSlice` — `Dashboard.jsx` mostrará `lastUpdate: null` o se omite la línea. |
| **SPECULATIVE** | Ninguno. |

**Ratio: 5 PROVEN + 2 INFERRED / 7 = 100% (0 SPECULATIVE)**
