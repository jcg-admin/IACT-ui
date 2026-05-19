```yml
created_at: 2026-05-08 01:05:10
project: IACT-UI
work_package: 2026-05-08-01-05-10-dashboard-cleanup-naming-conventions
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
analysis_version: 1.0
```

# Phase 1 DISCOVER — dashboard-cleanup-naming-conventions

## Propósito

WP combinado de dos ejes:

1. **T-DT-002 (funcional):** `dashboardSlice.fetchDashboardData` usa `getMockDashboardData()`
   hardcodeado. `Dashboard.jsx` y `useDashboard.js` consumen datos falsos en producción.

2. **Naming violations:** Aplicación de `CLEAN_CODE_NAMING_PRINCIPLES.md` (backend Python)
   y `CLEAN_CODE_NAMING_PRINCIPLES — Frontend.md` al codebase IACT-UI. El documento
   frontend amplía el scope detectando violaciones sistémicas más profundas
   (*Page, *Slice, *Service, *Selector, aliases de Webpack, hooks técnicos, acronimoss).

---

## Contexto del usuario final

**Quién usa el sistema:** desarrolladores que mantienen y extienden IACT-UI.

**Qué quieren lograr:**
- `Dashboard.jsx` muestre KPIs IVR reales (no datos hardcodeados con setTimeout fake).
- El codebase siga convenciones de naming que permiten entender el rol de cada
  módulo sin leer su implementación.

**Restricciones no obvias:** los documentos de naming prohíben sufijos que están
actualmente **en todos los slices Redux** (`*Slice`), **en 56 archivos de páginas** (`*Page`),
**en 20 archivos de servicios** (`*Service`), y **en todos los aliases de Webpack**
(`@components`, `@utils`, `@services`). Aplicar el 100% del estándar en un solo WP
sería una refactorización masiva que rompería 1825 tests. Scope controlado es mandatorio.

---

## Hallazgos verificados (PROVEN)

### HAL-1: `dashboardSlice` usa mock hardcodeado `[PROVEN]`

`src/redux/slices/dashboardSlice.js:2` importa `getMockDashboardData` de `@mocks/dashboardData`.
`fetchDashboardData` thunk hace `await new Promise(resolve => setTimeout(resolve, 500))`
y llama `getMockDashboardData()` — nunca llama a ningún endpoint real.

Consumidores directos:
- `src/components/containers/Dashboard.jsx` — `useEffect(() => dispatch(fetchDashboardData()))` + `useSelector(state => state.dashboard)`
- `src/hooks/domain/useDashboard.js` — mismo thunk con auto-refresh cada 10s
- `src/hooks/domain/useMetrics.js` — importa `updateMetric` action (no el thunk mock)

`DashboardPage.jsx` (en `src/components/containers/`) YA fue migrado a `reportsSlice` en
WP previo. `Dashboard.jsx` (también en containers/) es un componente distinto — sigue sin migrar.

**Qué hace falta:** conectar `fetchDashboardData` a un endpoint real (`/api/reports/metrics/dashboard/`
ya existe en mockInterceptor). O bien: deprecar `dashboardSlice.fetchDashboardData` y
migrar `Dashboard.jsx` + `useDashboard.js` a `reportsSlice` (ya usado por `DashboardPage.jsx`).

---

### HAL-2: `AlertManager` — class + filename con sufijo `Manager` `[PROVEN]`

`src/services/alertManager.js` — clase `AlertManager` es un API client HTTP de alertas
(GET /alerts, POST /alerts, PUT /alerts/:id, DELETE /alerts/:id). `Manager` es vago —
no describe el rol de "cliente HTTP de alertas".

Consumidor único: `src/redux/slices/alertsSlice.js:8` lo importa como `alertsService`.

**Nota crítica del doc frontend §6.2:** `Service` también está prohibido como sufijo
("menuService.js — Service expone la capa técnica"). Por tanto el rename correcto
NO es `alertsService.js` sino un nombre de dominio: `alertsGateway.js` o (si
el archivo se coloca en un dominio propio) `alerts.js`.

Rename recomendado: `class AlertsGateway` → `src/services/alertsGateway.js`

---

### HAL-3: `CSRFManager` / `CSPHelper` en `securityService.js` `[PROVEN]`

`src/services/securityService.js:166` — `class CSRFManager` gestiona token CSRF.
`src/services/securityService.js:206` — `class CSPHelper` aplica Content Security Policy.

Ambas exportadas via `src/services/index.js` como `csrfManager` / `cspHelper`.
Sin consumidores externos confirmados en `src/` (solo re-exportadas en index).

Renames recomendados:
- `CSRFManager` → `CSRFTokenProvider` (describe el rol: provee el token)
- `CSPHelper` → `ContentSecurityPolicyEnforcer` o `CSPEnforcer`

---

### HAL-4: Variables de una sola letra fuera de iteradores `[PROVEN]`

| Archivo | Línea | Variable | Contexto | Correcto |
|---------|-------|----------|----------|---------|
| `UserManagement.jsx` | 46 | `const q` | `search.toLowerCase()` | `searchQuery` |
| `AGRCatalogPage.jsx` | 42 | `const q` | `search.toLowerCase()` | `searchQuery` |
| `FunctionCatalogPage.jsx` | 42 | `const q` | `search.toLowerCase()` | `searchQuery` |
| `ExportPage.jsx` | 50 | `const a` | `document.createElement('a')` | `downloadLink` |
| `AccessAuditPage.jsx` | 108 | `const a` | `document.createElement('a')` | `downloadLink` |
| `AlertHistoryPage.jsx` | 76 | `const a` | `document.createElement('a')` | `downloadLink` |
| `UniqueClientsReportPage.jsx` | 75 | `const v` | `e.target.value` en onChange | `selectedTrimestre` |

---

### HAL-5: Archivos con sufijos prohibidos (in-scope) `[PROVEN]`

| Archivo | Sufijo violado | Rename | Consumidores impactados |
|---------|---------------|--------|------------------------|
| `src/services/alertManager.js` | `Manager` | `alertsGateway.js` | 1 (`alertsSlice.js`) |
| `src/services/utils/cloneUtils.js` | `Utils` | `cloneDeep.js` | 3 (`createResilientService`, `PermissionsService`, `fetchWithFallback`) |
| `src/utils/reportShareUtils.js` | `Utils` | `reportShareUrl.js` | 0 externos (solo define `buildShareUrl`) |
| `src/components/features/SessionManagement/SessionManager.jsx` | `Manager` | `SessionGuard.jsx` | 1 (re-exportado en `index.js`) |
| `src/components/pages/Analytics/ReportBuilder.jsx` | `Builder` (implica fluent interface) | `CustomReportForm.jsx` | 1 (`AnalyticsDashboard.jsx`) |

---

### HAL-6: Violaciones sistémicas — FUERA DE SCOPE de este WP `[PROVEN]`

El doc frontend revela violaciones masivas que requieren WPs separados:

| Categoría | Cantidad | Archivos ejemplo | WP sugerido |
|-----------|----------|-----------------|-------------|
| `*Page` suffix en componentes | 56 archivos | `DashboardPage.jsx`, `LoginPage.jsx`, `AlertsPage.jsx`… | `naming-pages-migration` |
| `*Slice` en Redux | 16 archivos | `authSlice.js`, `reportsSlice.js`, `loadingSlice.js`… | `naming-redux-migration` |
| `*Service` en servicios | 20 archivos | `authService.js`, `reportsService.js`… | `naming-services-migration` |
| Aliases Webpack técnicos | 8 aliases | `@components`, `@utils`, `@services`, `@hooks`… | `naming-webpack-aliases` |
| Hooks con nombre técnico | `useAPI`, `useAuth`, `useWebSocket`, `useLocalStorage`… | 10+ hooks | `naming-hooks-migration` |
| Acrónimos (`Auth`, `API`, `RBAC`) | spread codebase | `UserAuth`, `useAuth`, `APIService`… | `naming-acronyms-migration` |

**Decisión de scope:** estos se registran como deuda técnica (TD-NM-001..006) pero
**no se tocan en este WP**. Aplicarlos requeriría renombrar 100+ archivos con miles
de cambios de import — riesgo de regresión inaceptable para un WP de tamaño mediano.

---

## Los 8 aspectos de DISCOVER

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Eliminar mock hardcodeado de `dashboardSlice` + aplicar naming in-scope (HAL-2..5) |
| **Stakeholders** | Desarrolladores — corrección funcional + legibilidad inmediata |
| **Uso operacional** | `Dashboard.jsx` muestra KPIs IVR — datos reales necesarios en producción |
| **Atributos de calidad** | Corrección > legibilidad > 0 regressions de tests |
| **Restricciones** | 1825 tests verdes; renaming = actualizar imports + tests; `*Page`/`*Slice` fuera de scope |
| **Sistemas vecinos** | `reportsSlice`, `dashboardSelectors`, `store.js`, `services/index.js`, `alertsSlice.js`, `AnalyticsDashboard.jsx` |
| **Fuera de alcance** | HAL-6 (naming sistémico: 56 pages, 16 slices, 20 services, aliases) |
| **Criterios de éxito** | 0 refs a `getMockDashboardData` en producción; HAL-2..5 corregidos; 1825+ tests green |

---

## Tamaño del WP: Mediano

Fases activas: **1 → 3 → 8 → 10 → 11**

- Phase 3 ANALYZE: análisis de impacto de las dos estrategias para HAL-1
  (¿deprecar `dashboardSlice.fetchDashboardData` o conectarlo al endpoint real?)
- Phase 8 PLAN EXECUTION: task plan T-NNN
- Phase 10 IMPLEMENT: ejecución con TDD
- Phase 11 TRACK/EVALUATE: lessons learned + changelog

---

## Mapa epistémico

| Categoría | Claims |
|-----------|--------|
| **PROVEN** | HAL-1: `dashboardSlice.js:2` importa `getMockDashboardData` (Read verificado). HAL-2: `alertManager.js:9` `class AlertManager`, 1 consumidor en `alertsSlice.js` (grep verificado). HAL-3: `securityService.js:166,206` — `CSRFManager`/`CSPHelper` (grep verificado). HAL-4: 7 single-letter variables en 7 archivos (grep + línea verificada). HAL-5: 5 archivos con sufijos prohibidos + consumidor count (grep verificado). HAL-6: 56 `*Page` files, 16 `*Slice` files, 20 `*Service` files, 8 aliases (find + grep verificado). |
| **INFERRED** | `Dashboard.jsx` no tiene tests dedicados en `containerComponents.test.jsx` — inferido de la ausencia de describe('Dashboard') en el test file. El endpoint `/api/reports/metrics/dashboard/` ya existe en mockInterceptor (de WP anterior T-001) — conectar `fetchDashboardData` a él es factible sin nueva infraestructura. |
| **SPECULATIVE** | Ninguno. |

**Ratio de calibración:** 6 PROVEN + 2 INFERRED / 8 total = 100% (0 SPECULATIVE)

---

## Stopping Point Manifest

| ID | Fase | Tipo | Evento | Acción requerida |
|----|------|------|--------|-----------------|
| SP-01 | Phase 1 → Phase 3 | gate-fase | Análisis completo con HAL-1..6 documentados | Aprobar este documento |
| SP-02 | Phase 3 → Phase 8 | gate-decision | Estrategia para HAL-1: ¿deprecar `fetchDashboardData` o conectarlo al endpoint? | Decisión humana explícita |
| SP-03 | Phase 8 → Phase 10 | gate-fase | Task plan T-NNN completo con dependencias | Aprobar task plan |
| SP-04 | Phase 10 → Phase 11 | gate-fase | Todos los T-NNN `[x]`, tests green, commit pusheado | Revisar y aprobar |
