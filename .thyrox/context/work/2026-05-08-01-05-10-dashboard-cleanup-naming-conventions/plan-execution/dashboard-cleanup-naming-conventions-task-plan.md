```yml
created_at: 2026-05-08 01:15:00
project: IACT-UI
work_package: 2026-05-08-01-05-10-dashboard-cleanup-naming-conventions
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — dashboard-cleanup-naming-conventions

> **Alcance:** Deprecar `dashboardSlice` mock + 5 renames de naming (HAL-2..5) + registrar TD-NM-001..006
> **Ruta crítica:** Bloque I → II → III → IV → V → VI

---

## Bloque I — Deprecar `dashboardSlice` (HAL-1)

- [x] T-001 — Migrar `Dashboard.jsx` a `reportsSlice`: reemplazar import de `fetchDashboardData`/`state.dashboard` por `fetchDashboardMetrics`/selectors de `reportsSlice`. Eliminar línea de `lastUpdate` si no existe en reportsSlice.
- [x] T-002 — Eliminar `useDashboard.js`: borrar archivo + limpiar re-export en `hooks/domain/index.js` + `hooks/index.js`
- [x] T-003 — Migrar `useMetrics.js`: reemplazar `updateMetric` (dashboardSlice) por `updateMetrics` (reportsSlice); actualizar import de `dashboardSelectors` por selectors de `reportsSlice`
- [x] T-004 — Eliminar `dashboardSlice.js`: borrar archivo + quitar `dashboard: dashboardReducer` de `store.js` + quitar import en `store.js`
- [x] T-005 — Eliminar `dashboardSelectors.js` + limpiar re-exports en `redux/selectors.js` si los hay
- [x] T-006 — Eliminar `mocks/dashboardData.js` si 0 consumidores restantes (verificar con grep)
- [x] T-007 — Actualizar tests Bloque I: eliminar `dashboardSlice.test.js`; actualizar `containerComponents.test.jsx` (quitar mock de dashboardSlice, conservar reportsSlice mock)
- [x] T-008 — Verificar: `grep -rn "dashboardSlice\|getMockDashboardData\|fetchDashboardData" src/` → 0 hits en producción; `npm test` → 1825+ green

## Bloque II — Rename `AlertManager` → `AlertsGateway` (HAL-2)

- [x] T-009 — Renombrar clase `AlertManager` → `AlertsGateway` dentro de `alertManager.js`
- [x] T-010 — Renombrar archivo `alertManager.js` → `alertsGateway.js`
- [x] T-011 — Actualizar import en `alertsSlice.js`: `'../../services/alertManager'` → `'../../services/alertsGateway'`
- [x] T-012 — Renombrar test `alertManager.test.js` → `alertsGateway.test.js` + actualizar import interno
- [x] T-013 — Verificar `services/index.js`: si re-exporta `alertManager`, actualizar

## Bloque III — Rename `CSRFManager`/`CSPHelper` (HAL-3)

- [x] T-014 — Renombrar `class CSRFManager` → `class CSRFTokenProvider` dentro de `securityService.js`
- [x] T-015 — Renombrar `class CSPHelper` → `class ContentSecurityPolicyEnforcer` dentro de `securityService.js`
- [x] T-016 — Verificar que instancias exportadas (`csrfManager`, `cspHelper`) y re-exports de `services/index.js` no cambian

## Bloque IV — Variables de una sola letra (HAL-4)

- [x] T-017 — `UserManagement.jsx:46`: `const q` → `const searchQuery`
- [x] T-018 — `AGRCatalogPage.jsx:42`: `const q` → `const searchQuery`
- [x] T-019 — `FunctionCatalogPage.jsx:42`: `const q` → `const searchQuery`
- [x] T-020 — `ExportPage.jsx:50`: `const a` → `const downloadLink`
- [x] T-021 — `AccessAuditPage.jsx:108`: `const a` → `const downloadLink`
- [x] T-022 — `AlertHistoryPage.jsx:76`: `const a` → `const downloadLink`
- [x] T-023 — `UniqueClientsReportPage.jsx:75`: `const v` → `const trimesterValue` (actualizar también las referencias en el mismo bloque JSX)

## Bloque V — Filenames con sufijos prohibidos (HAL-5)

- [x] T-024 — Renombrar `cloneUtils.js` → `cloneDeep.js`; actualizar 3 imports (`createResilientService.js`, `PermissionsService.js`, `fetchWithFallback.js`)
- [x] T-025 — Renombrar `reportShareUtils.js` → `reportShareUrl.js` (0 imports externos — verificar con grep antes)
- [x] T-026 — Renombrar `SessionManager.jsx` → `SessionProvider.jsx`; actualizar re-export en `SessionManagement/index.js`; actualizar test `featuresComponents.test.jsx` si referencia el nombre
- [x] T-027 — Renombrar `ReportBuilder.jsx` → `CustomReportForm.jsx` + renombrar función `export default function ReportBuilder` → `CustomReportForm`; actualizar import en `AnalyticsDashboard.jsx`

## Bloque VI — Documentar deuda sistémica TD-NM-001..006

- [x] T-028 — Crear/actualizar `.thyrox/context/technical-debt.md` con TD-NM-001..006:
  - TD-NM-001: Renombrar 56 archivos `*Page.jsx` — sufijo `Page` prohibido (doc frontend §1.2)
  - TD-NM-002: Renombrar 16 archivos `*Slice.js` — sufijo `Slice` prohibido (doc frontend §3.1)
  - TD-NM-003: Renombrar 20 archivos `*Service.js` — sufijo `Service` prohibido (doc frontend §6.2)
  - TD-NM-004: Cambiar 8 aliases Webpack (`@components`, `@utils`, `@services`…) a nombres de dominio (doc frontend §9.2)
  - TD-NM-005: Renombrar hooks técnicos (`useAuth`, `useAPI`, `useWebSocket`…) a nombres de dominio (doc frontend §2.2)
  - TD-NM-006: Eliminar acrónimos en identifiers (`Auth`, `API`, `RBAC`, `SoD`) — doc frontend §7
- [x] T-029 — Commit final: verificar `npm test` → 0 failing; `bash .claude/scripts/validate-phase-completion.sh`

---

## DAG de dependencias

```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 → T-008
T-009 → T-010 → T-011 → T-012 → T-013
T-014 → T-015 → T-016
T-017..T-023 (paralelos entre sí)
T-024 → T-025 → T-026 → T-027
T-028 → T-029 (depende de todos los bloques anteriores [x])
```

## Estrategia de commits

| Commit | Tareas | Descripción |
|--------|--------|-------------|
| C-1 | T-001..T-008 | Deprecate dashboardSlice — migrate Dashboard.jsx to reportsSlice |
| C-2 | T-009..T-013 | Rename AlertManager to AlertsGateway |
| C-3 | T-014..T-016 | Rename CSRFManager/CSPHelper to role-based names |
| C-4 | T-017..T-023 | Replace single-letter variables with descriptive names |
| C-5 | T-024..T-027 | Rename files with forbidden suffixes |
| C-6 | T-028..T-029 | Document systemic naming debt TD-NM-001..006 |
