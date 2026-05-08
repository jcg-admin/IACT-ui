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

- [ ] T-001 — `useAuth.js`: rename function `useAuth` → `useIdentity`; rename file to `useIdentity.js`; update export in `hooks/domain/index.js`; update all 14 consumer imports (grep: `useAuth\b`)
- [ ] T-002 — `useAPI.js`: rename function `useAPI` → `useRequest`; rename file to `useRequest.js`; update re-export; update all consumers (grep: `useAPI\b`)
- [ ] T-003 — `useWebSocket.js`: rename function `useWebSocket` → `useRealTimeChannel`; rename file to `useRealTimeChannel.js`; update re-export; update consumers
- [ ] T-004 — `useJobPolling.js`: rename function `useJobPolling` → `useJobStatus`; rename file to `useJobStatus.js`; update re-export; update consumers
- [ ] T-005 — `useAlertPolling.js`: rename function `useAlertPolling` → `useAlertFeed`; rename file to `useAlertFeed.js`; update re-export; update consumers
- [ ] T-006 — Verify: `grep -rn "useAuth\b\|useAPI\b\|useWebSocket\b\|useJobPolling\b\|useAlertPolling\b" src/` → 0 hits (excluding own file); `npm test` → 1799+ green

## Bloque II — HAL-1: Page renames (57 files, drop `Page` suffix)

### Group A — containers/ (conflict: Dashboard.jsx already exists)
- [ ] T-007 — `containers/DashboardPage.jsx` → `DashboardMain.jsx`; function `DashboardPage` → `DashboardMain`; update router lazy import; update containerComponents.test.jsx
- [ ] T-008 — `containers/LoginPage.jsx` → `Login.jsx`; function rename; update router
- [ ] T-009 — `features/Settings/SettingsPage.jsx` → `Settings.jsx` (check if already imported as Settings elsewhere)

### Group B — pages/Access/ and pages/Alerts/
- [ ] T-010 — `pages/access/AccessAuditPage.jsx` → `AccessAudit.jsx`; update router + index
- [ ] T-011 — `pages/access/AssignFunctionsPage.jsx` → `AssignFunctions.jsx`
- [ ] T-012 — `pages/access/AssignGroupPage.jsx` → `AssignGroup.jsx`
- [ ] T-013 — `pages/access/GroupCompositionPage.jsx` → `GroupComposition.jsx`
- [ ] T-014 — `pages/access/GroupManagementPage.jsx` → `GroupManagement.jsx`
- [ ] T-015 — `pages/access/GroupersPage.jsx` → `Groupers.jsx`
- [ ] T-016 — `pages/access/PermissionsAuditPage.jsx` → `PermissionsAudit.jsx`
- [ ] T-017 — `pages/access/PermissionsPage.jsx` → `Permissions.jsx`
- [ ] T-018 — `pages/access/SegmentsPage.jsx` → `Segments.jsx`
- [ ] T-019 — `pages/access/SeparationRulesPage.jsx` → `SeparationRules.jsx`
- [ ] T-020 — `pages/access/TemporaryPermissionsPage.jsx` → `TemporaryPermissions.jsx`
- [ ] T-021 — `pages/admin/AGRCatalogPage.jsx` → `AGRCatalog.jsx`
- [ ] T-022 — `pages/admin/FunctionCatalogPage.jsx` → `FunctionCatalog.jsx`
- [ ] T-023 — `pages/alerts/AlertConfigPage.jsx` → `AlertConfig.jsx`
- [ ] T-024 — `pages/alerts/AlertHistoryPage.jsx` → `AlertHistory.jsx`
- [ ] T-025 — `pages/alerts/AlertsPage.jsx` → `AlertsDirectory.jsx` (conflict: pages/Alerts/AlertsPage also exists — rename src/pages/alerts/AlertsPage.jsx → AlertsOverview.jsx)
- [ ] T-026 — `pages/alerts/SubscriptionsPage.jsx` → `Subscriptions.jsx`
- [ ] T-027 — `pages/alerts/TemplatesPage.jsx` → `Templates.jsx`
- [ ] T-028 — `pages/audit/AuditPage.jsx` → `AuditLog.jsx` (conflict: pages/Audit/AuditPage also exists)
- [ ] T-029 — `pages/audit/AuditSearchPage.jsx` → `AuditSearch.jsx`
- [ ] T-030 — `pages/audit/ComplianceReportPage.jsx` → `ComplianceReport.jsx`
- [ ] T-031 — `pages/audit/ExportPage.jsx` → `Export.jsx`
- [ ] T-032 — `pages/auth/ChangePasswordPage.jsx` → `ChangePassword.jsx`
- [ ] T-033 — `pages/auth/RecoverPasswordPage.jsx` → `RecoverPassword.jsx`
- [ ] T-034 — `pages/errors/AccessDeniedPage.jsx` → `AccessDenied.jsx`
- [ ] T-035 — `pages/errors/NotFoundPage.jsx` → `NotFound.jsx`
- [ ] T-036 — `pages/errors/ServerErrorPage.jsx` → `ServerError.jsx`
- [ ] T-037 — `pages/errors/ServiceUnavailablePage.jsx` → `ServiceUnavailable.jsx`
- [ ] T-038 — `pages/logs/ETLAvailabilityPage.jsx` → `ETLAvailability.jsx`
- [ ] T-039 — `pages/logs/ETLLogsPage.jsx` → `ETLLogs.jsx`
- [ ] T-040 — `pages/logs/InfraLogsPage.jsx` → `InfraLogs.jsx`
- [ ] T-041 — `pages/logs/LogExportPage.jsx` → `LogExport.jsx`
- [ ] T-042 — `pages/logs/LogSearchPage.jsx` → `LogSearch.jsx`
- [ ] T-043 — `pages/logs/LogsPage.jsx` → `Logs.jsx`
- [ ] T-044 — `pages/logs/PerformanceMetricsPage.jsx` → `PerformanceMetrics.jsx`
- [ ] T-045 — `pages/logs/PipelineStatusPage.jsx` → `PipelineStatus.jsx`
- [ ] T-046 — `pages/logs/SystemStatusPage.jsx` → `SystemStatus.jsx`
- [ ] T-047 — `pages/permissions/RevokeGroupPage.jsx` → `RevokeGroup.jsx`
- [ ] T-048 — `pages/reports/AgentsReportPage.jsx` → `AgentsReport.jsx`
- [ ] T-049 — `pages/reports/CampaignsReportPage.jsx` → `CampaignsReport.jsx`
- [ ] T-050 — `pages/reports/HistoricalReportsPage.jsx` → `HistoricalReports.jsx`
- [ ] T-051 — `pages/reports/IVRMenusReportPage.jsx` → `IVRMenusReport.jsx`
- [ ] T-052 — `pages/reports/QueuesReportPage.jsx` → `QueuesReport.jsx`
- [ ] T-053 — `pages/reports/RealTimeMetricsPage.jsx` → `RealTimeMetrics.jsx`
- [ ] T-054 — `pages/reports/ReportExportPage.jsx` → `ReportExport.jsx`
- [ ] T-055 — `pages/reports/SavedViewsPage.jsx` → `SavedViews.jsx`
- [ ] T-056 — `pages/reports/ScheduledReportPage.jsx` → `ScheduledReport.jsx`
- [ ] T-057 — `pages/reports/TransfersReportPage.jsx` → `TransfersReport.jsx`
- [ ] T-058 — `pages/reports/UniqueClientsReportPage.jsx` → `UniqueClientsReport.jsx`
- [ ] T-059 — `pages/HomePage.jsx` → `Home.jsx`
- [ ] T-060 — `components/pages/Access/AccessPage.jsx` → `Access.jsx`
- [ ] T-061 — `components/pages/Alerts/AlertsPage.jsx` → `AlertsHub.jsx`
- [ ] T-062 — `components/pages/Audit/AuditPage.jsx` → `AuditHub.jsx`
- [ ] T-063 — `components/pages/Profile/ProfilePage.jsx` → `Profile.jsx`
- [ ] T-064 — Verify HAL-1: `find src/ -name "*Page.jsx" | wc -l` → 0; `npm test` → 1799+ green

## Bloque III — HAL-2: Slice renames (17 files, drop `Slice` suffix)

- [ ] T-065 — `authSlice.js` → `auth.js`; update store.js + all imports
- [ ] T-066 — `uiSlice.js` → `ui.js`; update store.js + all imports
- [ ] T-067 — `userSlice.js` → `user.js`; update store.js + all imports
- [ ] T-068 — `sessionSlice.js` → `session.js`; update store.js + all imports
- [ ] T-069 — `accessSlice.js` → `access.js`; update store.js + all imports
- [ ] T-070 — `alertsSlice.js` → `alerts.js`; update store.js + all imports
- [ ] T-071 — `auditSlice.js` → `audit.js`; update store.js + all imports
- [ ] T-072 — `formSlice.js` → `form.js`; update store.js + all imports
- [ ] T-073 — `reportsSlice.js` → `reports.js`; update store.js + all imports
- [ ] T-074 — `errorSlice.js` → `error.js`; update store.js + all imports
- [ ] T-075 — `adminSlice.js` → `admin.js`; update store.js + all imports
- [ ] T-076 — `logsSlice.js` → `logs.js`; update store.js + all imports
- [ ] T-077 — `savedFiltersSlice.js` → `savedFilters.js`; update store.js + all imports
- [ ] T-078 — `loadingSlice.js` → `loading.js`; update store.js + all imports
- [ ] T-079 — `modules/home/state/homeSlice.js` → `home.js`; update local imports
- [ ] T-080 — `state/slices/appConfigSlice.js` → `appConfig.js`; update imports
- [ ] T-081 — `state/slices/healthSlice.js` → `health.js`; update imports
- [ ] T-082 — Verify HAL-2: `find src/ -name "*Slice.js" | wc -l` → 0; `npm test` → 1799+ green

## Bloque IV — HAL-3: Service renames (20 files)

- [ ] T-083 — `accessService.js` → `accessGateway.js`; update all imports
- [ ] T-084 — `adminService.js` → `adminGateway.js`; update all imports
- [ ] T-085 — `alertService.js` → `alertGateway.js`; update all imports
- [ ] T-086 — `apiService.js` → `apiClient.js`; update all imports
- [ ] T-087 — `auditService.js` → `auditGateway.js`; update all imports
- [ ] T-088 — `authService.js` → `authGateway.js`; update all imports
- [ ] T-089 — `services/calls/CallsService.js` → `calls/CallsGateway.js`; update imports
- [ ] T-090 — `services/config/AppConfigService.js` → `config/AppConfig.js`; update imports
- [ ] T-091 — `createResilientService.js` → `createResilient.js`; update imports
- [ ] T-092 — `exportService.js` → `exportGateway.js`; update imports
- [ ] T-093 — `services/health/HealthService.js` → `health/HealthGateway.js`; update imports
- [ ] T-094 — `jobService.js` → `jobGateway.js`; update imports
- [ ] T-095 — `logsService.js` → `logsGateway.js`; update imports
- [ ] T-096 — `notificationService.js` → `notificationGateway.js`; update imports
- [ ] T-097 — `services/permissions/PermissionsService.js` → `permissions/Permissions.js`; update imports
- [ ] T-098 — `reportsService.js` → `reportsGateway.js`; update imports
- [ ] T-099 — `securityService.js` → `security.js`; update imports
- [ ] T-100 — `transactionService.js` → `transactionGateway.js`; update imports
- [ ] T-101 — `userService.js` → `userGateway.js`; update imports
- [ ] T-102 — `websocketService.js` → `websocketGateway.js`; update imports
- [ ] T-103 — Verify HAL-3: `find src/ -name "*Service.js" | wc -l` → 0; `npm test` → 1799+ green

## Bloque V — HAL-6: Acronym cleanup

- [ ] T-104 — Replace `Auth` → `Identity` in class/function names (not string literals):
  grep targets: `UserAuth`, `authGateway` (already done by HAL-3)
  Main target: `src/facades/UserAuth.js` → `src/facades/UserIdentity.js`
- [ ] T-105 — Replace `API` → `Http` or `Request` in identifiers: `APIError`, `ApiError`, etc.
- [ ] T-106 — Replace `RBAC` → `RolePermissions` in component/variable names (not permission code strings)
- [ ] T-107 — Verify HAL-6: `npm test` → 1799+ green

## Bloque VI — HAL-4: Webpack alias renames (LAST — highest blast radius)

- [ ] T-108 — Rename `@components` → `@ui` in webpack.config.js + jest.config.cjs + all 59 src/ imports
- [ ] T-109 — Rename `@services` → `@api` in webpack.config.js + jest.config.cjs + all 114 src/ imports
- [ ] T-110 — Rename `@redux` → `@store` in webpack.config.js + jest.config.cjs + all 61 src/ imports + 11 tests/ imports
- [ ] T-111 — Rename `@utils` → `@shared` in webpack.config.js + jest.config.cjs + all 12 src/ imports
- [ ] T-112 — Rename `@pages` → `@screens` in webpack.config.js + jest.config.cjs + all 44 src/ imports
- [ ] T-113 — Keep `@hooks` as-is (hooks is a domain term, acceptable)
- [ ] T-114 — Verify HAL-4: build passes, `npm test` → 1799+ green
- [ ] T-115 — Final commit + validate-phase-completion.sh

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
