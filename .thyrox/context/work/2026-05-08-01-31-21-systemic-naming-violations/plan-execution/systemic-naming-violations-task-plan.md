```yml
created_at: 2026-05-08 05:55:00
project: IACT-UI
work_package: 2026-05-08-01-31-21-systemic-naming-violations
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — systemic-naming-violations

> **Alcance:** HAL-1..6 — 57 Page renames, 17 Slice renames, 20 Service renames,
> 5 alias renames (374 refs), 5 hook renames, acronym cleanup
> **Orden crítico:** HAL-5 → HAL-1 → HAL-2 → HAL-3 → HAL-6 → HAL-4

---

## Bloque I — HAL-5: Hook renames (5 hooks)

- [x] T-001 — `useAuth.js`: rename function `useAuth` → `useIdentity`; rename file to `useIdentity.js`; update export in `hooks/domain/index.js`; update all 14 consumer imports (grep: `useAuth\b`)
- [x] T-002 — `useAPI.js`: rename function `useAPI` → `useRequest`; rename file to `useRequest.js`; update re-export; update all consumers (grep: `useAPI\b`)
- [x] T-003 — `useWebSocket.js`: rename function `useWebSocket` → `useRealTimeChannel`; rename file to `useRealTimeChannel.js`; update re-export; update consumers
- [x] T-004 — `useJobPolling.js`: rename function `useJobPolling` → `useJobStatus`; rename file to `useJobStatus.js`; update re-export; update consumers
- [x] T-005 — `useAlertPolling.js`: rename function `useAlertPolling` → `useAlertFeed`; rename file to `useAlertFeed.js`; update re-export; update consumers
- [x] T-006 — Verify: `grep -rn "useAuth\b\|useAPI\b\|useWebSocket\b\|useJobPolling\b\|useAlertPolling\b" src/` → 0 hits (excluding own file); `npm test` → 1799+ green

## Bloque II — HAL-1: Page renames (57 files, drop `Page` suffix)

### Group A — containers/ (conflict: Dashboard.jsx already exists)
- [x] T-007 — `containers/DashboardPage.jsx` → `DashboardMain.jsx`; function `DashboardPage` → `DashboardMain`; update router lazy import; update containerComponents.test.jsx
- [x] T-008 — `containers/LoginPage.jsx` → `Login.jsx`; function rename; update router
- [x] T-009 — `features/Settings/SettingsPage.jsx` → `Settings.jsx` (check if already imported as Settings elsewhere)

### Group B — pages/Access/ and pages/Alerts/
- [x] T-010 — `pages/access/AccessAuditPage.jsx` → `AccessAudit.jsx`; update router + index
- [x] T-011 — `pages/access/AssignFunctionsPage.jsx` → `AssignFunctions.jsx`
- [x] T-012 — `pages/access/AssignGroupPage.jsx` → `AssignGroup.jsx`
- [x] T-013 — `pages/access/GroupCompositionPage.jsx` → `GroupComposition.jsx`
- [x] T-014 — `pages/access/GroupManagementPage.jsx` → `GroupManagement.jsx`
- [x] T-015 — `pages/access/GroupersPage.jsx` → `Groupers.jsx`
- [x] T-016 — `pages/access/PermissionsAuditPage.jsx` → `PermissionsAudit.jsx`
- [x] T-017 — `pages/access/PermissionsPage.jsx` → `Permissions.jsx`
- [x] T-018 — `pages/access/SegmentsPage.jsx` → `Segments.jsx`
- [x] T-019 — `pages/access/SeparationRulesPage.jsx` → `SeparationRules.jsx`
- [x] T-020 — `pages/access/TemporaryPermissionsPage.jsx` → `TemporaryPermissions.jsx`
- [x] T-021 — `pages/admin/AGRCatalogPage.jsx` → `AGRCatalog.jsx`
- [x] T-022 — `pages/admin/FunctionCatalogPage.jsx` → `FunctionCatalog.jsx`
- [x] T-023 — `pages/alerts/AlertConfigPage.jsx` → `AlertConfig.jsx`
- [x] T-024 — `pages/alerts/AlertHistoryPage.jsx` → `AlertHistory.jsx`
- [x] T-025 — `pages/alerts/AlertsPage.jsx` → `AlertsDirectory.jsx` (conflict: pages/Alerts/AlertsPage also exists — rename src/pages/alerts/AlertsPage.jsx → AlertsOverview.jsx)
- [x] T-026 — `pages/alerts/SubscriptionsPage.jsx` → `Subscriptions.jsx`
- [x] T-027 — `pages/alerts/TemplatesPage.jsx` → `Templates.jsx`
- [x] T-028 — `pages/audit/AuditPage.jsx` → `AuditLog.jsx` (conflict: pages/Audit/AuditPage also exists)
- [x] T-029 — `pages/audit/AuditSearchPage.jsx` → `AuditSearch.jsx`
- [x] T-030 — `pages/audit/ComplianceReportPage.jsx` → `ComplianceReport.jsx`
- [x] T-031 — `pages/audit/ExportPage.jsx` → `Export.jsx`
- [x] T-032 — `pages/auth/ChangePasswordPage.jsx` → `ChangePassword.jsx`
- [x] T-033 — `pages/auth/RecoverPasswordPage.jsx` → `RecoverPassword.jsx`
- [x] T-034 — `pages/errors/AccessDeniedPage.jsx` → `AccessDenied.jsx`
- [x] T-035 — `pages/errors/NotFoundPage.jsx` → `NotFound.jsx`
- [x] T-036 — `pages/errors/ServerErrorPage.jsx` → `ServerError.jsx`
- [x] T-037 — `pages/errors/ServiceUnavailablePage.jsx` → `ServiceUnavailable.jsx`
- [x] T-038 — `pages/logs/ETLAvailabilityPage.jsx` → `ETLAvailability.jsx`
- [x] T-039 — `pages/logs/ETLLogsPage.jsx` → `ETLLogs.jsx`
- [x] T-040 — `pages/logs/InfraLogsPage.jsx` → `InfraLogs.jsx`
- [x] T-041 — `pages/logs/LogExportPage.jsx` → `LogExport.jsx`
- [x] T-042 — `pages/logs/LogSearchPage.jsx` → `LogSearch.jsx`
- [x] T-043 — `pages/logs/LogsPage.jsx` → `Logs.jsx`
- [x] T-044 — `pages/logs/PerformanceMetricsPage.jsx` → `PerformanceMetrics.jsx`
- [x] T-045 — `pages/logs/PipelineStatusPage.jsx` → `PipelineStatus.jsx`
- [x] T-046 — `pages/logs/SystemStatusPage.jsx` → `SystemStatus.jsx`
- [x] T-047 — `pages/permissions/RevokeGroupPage.jsx` → `RevokeGroup.jsx`
- [x] T-048 — `pages/reports/AgentsReportPage.jsx` → `AgentsReport.jsx`
- [x] T-049 — `pages/reports/CampaignsReportPage.jsx` → `CampaignsReport.jsx`
- [x] T-050 — `pages/reports/HistoricalReportsPage.jsx` → `HistoricalReports.jsx`
- [x] T-051 — `pages/reports/IVRMenusReportPage.jsx` → `IVRMenusReport.jsx`
- [x] T-052 — `pages/reports/QueuesReportPage.jsx` → `QueuesReport.jsx`
- [x] T-053 — `pages/reports/RealTimeMetricsPage.jsx` → `RealTimeMetrics.jsx`
- [x] T-054 — `pages/reports/ReportExportPage.jsx` → `ReportExport.jsx`
- [x] T-055 — `pages/reports/SavedViewsPage.jsx` → `SavedViews.jsx`
- [x] T-056 — `pages/reports/ScheduledReportPage.jsx` → `ScheduledReport.jsx`
- [x] T-057 — `pages/reports/TransfersReportPage.jsx` → `TransfersReport.jsx`
- [x] T-058 — `pages/reports/UniqueClientsReportPage.jsx` → `UniqueClientsReport.jsx`
- [x] T-059 — `pages/HomePage.jsx` → `Home.jsx`
- [x] T-060 — `components/pages/Access/AccessPage.jsx` → `Access.jsx`
- [x] T-061 — `components/pages/Alerts/AlertsPage.jsx` → `AlertsHub.jsx`
- [x] T-062 — `components/pages/Audit/AuditPage.jsx` → `AuditHub.jsx`
- [x] T-063 — `components/pages/Profile/ProfilePage.jsx` → `Profile.jsx`
- [x] T-064 — Verify HAL-1: `find src/ -name "*Page.jsx" | wc -l` → 0; `npm test` → 1799+ green

## Bloque III — HAL-2: Slice renames (17 files, drop `Slice` suffix)

- [x] T-065 — `authSlice.js` → `auth.js`; update store.js + all imports
- [x] T-066 — `uiSlice.js` → `ui.js`; update store.js + all imports
- [x] T-067 — `userSlice.js` → `user.js`; update store.js + all imports
- [x] T-068 — `sessionSlice.js` → `session.js`; update store.js + all imports
- [x] T-069 — `accessSlice.js` → `access.js`; update store.js + all imports
- [x] T-070 — `alertsSlice.js` → `alerts.js`; update store.js + all imports
- [x] T-071 — `auditSlice.js` → `audit.js`; update store.js + all imports
- [x] T-072 — `formSlice.js` → `form.js`; update store.js + all imports
- [x] T-073 — `reportsSlice.js` → `reports.js`; update store.js + all imports
- [x] T-074 — `errorSlice.js` → `error.js`; update store.js + all imports
- [x] T-075 — `adminSlice.js` → `admin.js`; update store.js + all imports
- [x] T-076 — `logsSlice.js` → `logs.js`; update store.js + all imports
- [x] T-077 — `savedFiltersSlice.js` → `savedFilters.js`; update store.js + all imports
- [x] T-078 — `loadingSlice.js` → `loading.js`; update store.js + all imports
- [x] T-079 — `modules/home/state/homeSlice.js` → `home.js`; update local imports
- [x] T-080 — `state/slices/appConfigSlice.js` → `appConfig.js`; update imports
- [x] T-081 — `state/slices/healthSlice.js` → `health.js`; update imports
- [x] T-082 — Verify HAL-2: `find src/ -name "*Slice.js" | wc -l` → 0; `npm test` → 1799+ green

## Bloque IV — HAL-3: Service renames (20 files)

- [x] T-083 — `accessService.js` → `accessGateway.js`; update all imports
- [x] T-084 — `adminService.js` → `adminGateway.js`; update all imports
- [x] T-085 — `alertService.js` → `alertGateway.js`; update all imports
- [x] T-086 — `apiService.js` → `apiClient.js`; update all imports
- [x] T-087 — `auditService.js` → `auditGateway.js`; update all imports
- [x] T-088 — `authService.js` → `authGateway.js`; update all imports
- [x] T-089 — `services/calls/CallsService.js` → `calls/CallsGateway.js`; update imports
- [x] T-090 — `services/config/AppConfigService.js` → `config/AppConfig.js`; update imports
- [x] T-091 — `createResilientService.js` → `createResilient.js`; update imports
- [x] T-092 — `exportService.js` → `exportGateway.js`; update imports
- [x] T-093 — `services/health/HealthService.js` → `health/HealthGateway.js`; update imports
- [x] T-094 — `jobService.js` → `jobGateway.js`; update imports
- [x] T-095 — `logsService.js` → `logsGateway.js`; update imports
- [x] T-096 — `notificationService.js` → `notificationGateway.js`; update imports
- [x] T-097 — `services/permissions/PermissionsService.js` → `permissions/Permissions.js`; update imports
- [x] T-098 — `reportsService.js` → `reportsGateway.js`; update imports
- [x] T-099 — `securityService.js` → `security.js`; update imports
- [x] T-100 — `transactionService.js` → `transactionGateway.js`; update imports
- [x] T-101 — `userService.js` → `userGateway.js`; update imports
- [x] T-102 — `websocketService.js` → `websocketGateway.js`; update imports
- [x] T-103 — Verify HAL-3: `find src/ -name "*Service.js" | wc -l` → 0; `npm test` → 1799+ green

## Bloque V — HAL-6: Acronym cleanup

- [x] T-104 — Replace `Auth` → `Identity` in class/function names (not string literals):
  grep targets: `UserAuth`, `authGateway` (already done by HAL-3)
  Main target: `src/facades/UserAuth.js` → `src/facades/UserIdentity.js`
- [x] T-105 — Replace `API` → `Http` or `Request` in identifiers: `APIError`, `ApiError`, etc.
- [x] T-106 — Replace `RBAC` → `RolePermissions` in component/variable names (not permission code strings)
- [x] T-107 — Verify HAL-6: `npm test` → 1799+ green

## Bloque VI — HAL-4: Webpack alias renames (LAST — highest blast radius)

- [x] T-108 — Rename `@components` → `@ui` in webpack.config.js + jest.config.cjs + all 59 src/ imports
- [x] T-109 — Rename `@services` → `@api` in webpack.config.js + jest.config.cjs + all 114 src/ imports
- [x] T-110 — Rename `@redux` → `@store` in webpack.config.js + jest.config.cjs + all 61 src/ imports + 11 tests/ imports
- [x] T-111 — Rename `@utils` → `@shared` in webpack.config.js + jest.config.cjs + all 12 src/ imports
- [x] T-112 — Rename `@pages` → `@screens` in webpack.config.js + jest.config.cjs + all 44 src/ imports
- [x] T-113 — Keep `@hooks` as-is (hooks is a domain term, acceptable)
- [x] T-114 — Verify HAL-4: build passes, `npm test` → 1799+ green
- [x] T-115 — Final commit + validate-phase-completion.sh

---

## DAG de dependencias

```
T-001..T-006 (HAL-5 hooks — paralelos entre sí)
    ↓
T-007..T-064 (HAL-1 pages — secuencial dentro del bloque, paralelos por grupo)
    ↓
T-065..T-082 (HAL-2 slices — secuencial)
    ↓
T-083..T-103 (HAL-3 services — secuencial)
    ↓
T-104..T-107 (HAL-6 acronyms — paralelos)
    ↓
T-108..T-115 (HAL-4 aliases — ÚLTIMO, depende de todos los renames anteriores)
```

## Estrategia de commits

| Commit | Tareas | Descripción |
|--------|--------|-------------|
| C-1 | T-001..T-006 | Rename technical-name hooks to domain names |
| C-2 | T-007..T-064 | Drop Page suffix from 57 components |
| C-3 | T-065..T-082 | Drop Slice suffix from 17 Redux slices |
| C-4 | T-083..T-103 | Rename Service files to Gateway/Client names |
| C-5 | T-104..T-107 | Replace acronyms in identifiers |
| C-6 | T-108..T-115 | Rename Webpack aliases to domain names |
