```yml
created_at: 2026-05-08 05:35:00
project: IACT-UI
work_package: 2026-05-08-01-05-10-dashboard-cleanup-naming-conventions
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — dashboard-cleanup-naming-conventions

## Removed

- `src/redux/slices/dashboardSlice.js` — mock slice with 500ms fake delay,
  never called a real endpoint. Deprecated in favor of reportsSlice (T-004)
- `src/redux/selectors/dashboardSelectors.js` — stale selectors pointing to
  `state.dashboard` which no longer exists (T-005)
- `src/mocks/dashboardData.js` — getMockDashboardData() hardcoded mock (T-006)
- `src/mocks/dashboardMocks.js` — unused test mock file (T-007)
- `src/hooks/domain/useDashboard.js` — hook wrapping dashboardSlice; no
  longer needed after migration to reportsSlice (T-002)
- `tests/unit/reducers/dashboardSlice.test.js` — test for deleted slice (T-007)
- `tests/unit/selectors/dashboardSelectors.test.js` — test for deleted selectors (T-007)

## Changed

- `src/components/containers/Dashboard.jsx` — migrated from `fetchDashboardData`
  (mock) to `fetchDashboardMetrics` (reportsSlice, real API). Error handling via
  errorSlice. lastUpdate removed (not in reportsSlice) (T-001)
- `src/hooks/domain/useMetrics.js` — migrated from dashboardSlice/dashboardSelectors
  to reportsSlice selectors; updateMetricValue now dispatches updateMetrics (T-003)
- `src/redux/store.js` — removed dashboardReducer import and `dashboard:` key (T-004)
- `src/redux/selectors.js` — removed stale dashboard selector block (T-005)
- `src/hooks/domain/index.js`, `src/hooks/index.js` — removed useDashboard re-export (T-002)
- `src/services/alertManager.js` → `src/services/alertsGateway.js`:
  class AlertManager renamed to AlertsGateway (T-009..T-010)
- `src/redux/slices/alertsSlice.js` — updated import path to alertsGateway (T-011)
- `src/services/__tests__/alertManager.test.js` → `alertsGateway.test.js` (T-012)
- `src/services/securityService.js` — class CSRFManager → CSRFTokenProvider;
  class CSPHelper → ContentSecurityPolicyEnforcer (T-014..T-015)
- Single-letter vars replaced in 7 files:
  - `const q` → `const searchQuery` (UserManagement.jsx, AGRCatalogPage.jsx,
    FunctionCatalogPage.jsx) (T-017..T-019)
  - `const a` → `const downloadLink` (ExportPage.jsx, AccessAuditPage.jsx,
    AlertHistoryPage.jsx) (T-020..T-022)
  - `const v` → `const trimesterValue` (UniqueClientsReportPage.jsx) (T-023)
- `src/services/utils/cloneUtils.js` → `cloneDeep.js`; 3 import paths updated (T-024)
- `src/utils/reportShareUtils.js` → `reportShareUrl.js` (T-025)
- `src/components/features/SessionManagement/SessionManager.jsx` →
  `SessionProvider.jsx`; function renamed; index.js re-export updated;
  test updated (T-026)
- `src/components/pages/Analytics/ReportBuilder.jsx` → `CustomReportForm.jsx`;
  function renamed; AnalyticsDashboard.jsx import updated; index.js updated;
  test file renamed (T-027)
- `src/components/containers/__tests__/containerComponents.test.jsx` —
  removed dashboardSlice mock; removed dashboard key from buildStore (T-007)
- `tests/integration/dashboard.integration.test.js` — migrated to reportsSlice (T-007)
- `tests/integration/websocket.integration.test.js` — removed dashboardSlice dep (T-007)
- `.thyrox/context/technical-debt.md` — added TD-NM-001..006 (T-028)

## Added

- `src/services/alertsGateway.js` (renamed from alertManager.js)
- `src/services/utils/cloneDeep.js` (renamed from cloneUtils.js)
- `src/utils/reportShareUrl.js` (renamed from reportShareUtils.js)
- `src/components/features/SessionManagement/SessionProvider.jsx` (renamed)
- `src/components/pages/Analytics/CustomReportForm.jsx` (renamed)

## Commits

| SHA | Descripción |
|-----|-------------|
| `4ddf491` | Deprecate dashboardSlice — migrate Dashboard to reportsSlice |
| `6c8e6d6` | Rename AlertManager to AlertsGateway |
| `293bcb8` | Rename CSRFManager/CSPHelper to role-based class names |
| `26ce340` | Replace single-letter variables with descriptive names |
| `c8964c5` | Rename files with forbidden suffixes to intent-based names |
| `5d0f13a` | Document systemic naming debt TD-NM-001..006 |

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entradas candidatas:
- "Deprecate dashboardSlice — Dashboard now calls real API via reportsSlice"
- "Naming cleanup: AlertsGateway, CSRFTokenProvider, ContentSecurityPolicyEnforcer,
  SessionProvider, CustomReportForm"
