```yml
created_at: 2026-05-08 08:00:00
project: IACT-UI
work_package: 2026-05-08-01-31-21-systemic-naming-violations
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — systemic-naming-violations

## Added

- `src/facades/UserIdentity.js` — renamed from `UserAuth.js`
- `src/utils/apiErrors.js` — `HttpError` class (replaces `APIError` hierarchy base)

## Changed

### HAL-5 — Hook renames (5 hooks)

- `useAuth` → `useIdentity` (`useIdentity.js`, barrel `hooks/useIdentity.js`, test renamed)
- `useAPI` → `useRequest` (`useRequest.js`, consumers updated)
- `useWebSocket` → `useRealTimeChannel` (`useRealTimeChannel.js`)
- `useJobPolling` → `useJobStatus` (`useJobStatus.js`, ExportCSVStepper.jsx updated)
- `useAlertPolling` → `useAlertFeed` (`useAlertFeed.js`)
- `src/hooks/domain/index.js` — all 5 re-exports updated

### HAL-1 — Page renames (57 files)

- `containers/DashboardPage.jsx` → `DashboardMain.jsx` (conflict with Dashboard.jsx)
- `containers/LoginPage.jsx` → `Login.jsx`
- `features/Settings/SettingsPage.jsx` → `Settings.jsx`
- `components/pages/Access/AccessPage.jsx` → `Access.jsx`
- `components/pages/Alerts/AlertsPage.jsx` → `Alerts.jsx`
- `components/pages/Audit/AuditPage.jsx` → `Audit.jsx`
- `components/pages/Profile/ProfilePage.jsx` → `Profile.jsx`
- `pages/HomePage.jsx` → `Home.jsx`
- 49 more files in `pages/access/`, `pages/alerts/`, `pages/audit/`, `pages/auth/`,
  `pages/errors/`, `pages/logs/`, `pages/permissions/`, `pages/reports/`, `pages/admin/`
- `AppRouter.jsx` — all 54 import paths updated
- `App.jsx` — HomePage import updated
- 20+ test files updated (import paths + describe block names)

### HAL-2 — Slice renames (17 files)

- `authSlice.js` → `auth.js`, `uiSlice.js` → `ui.js`, `userSlice.js` → `user.js`,
  `sessionSlice.js` → `session.js`, `accessSlice.js` → `access.js`,
  `alertsSlice.js` → `alerts.js`, `auditSlice.js` → `audit.js`,
  `formSlice.js` → `form.js`, `reportsSlice.js` → `reports.js`,
  `errorSlice.js` → `error.js`, `adminSlice.js` → `admin.js`,
  `logsSlice.js` → `logs.js`, `savedFiltersSlice.js` → `savedFilters.js`,
  `loadingSlice.js` → `loading.js`, `homeSlice.js` → `home.js`,
  `appConfigSlice.js` → `appConfig.js`, `healthSlice.js` → `health.js`
- All consumers updated: store.js, hooks, components, services, tests in src/, tests/, __tests__/

### HAL-3 — Service renames (20 files)

- `*Service.js` → `*Gateway.js`: access, admin, alert, audit, auth, export, job, logs,
  notification, reports, transaction, user, websocket, Calls, Health
- `apiService.js` → `apiClient.js`
- `createResilientService.js` → `createResilient.js`
- `AppConfigService.js` → `AppConfig.js`
- `PermissionsService.js` → `Permissions.js`
- `securityService.js` → `security.js`
- All consumers updated

### HAL-6 — Acronym cleanup

- `UserAuth.js` → `UserIdentity.js` (facade class renamed + all consumers)
- `facades/index.js` — re-export updated to `userIdentity, UserIdentity`
- `APIError` class → `HttpError` (in `apiErrors.js` full hierarchy)
- `handleAPIError` action → `handleHttpError` (error.js slice + errorHandling.js middleware)
- RBAC: no identifier renames needed (only in comments/JSDoc)

### HAL-4 — Webpack alias renames (5 aliases)

- `@components` → `@ui` in webpack.config.js + jest.config.cjs + 63 src references
- `@services` → `@api` in webpack.config.js + jest.config.cjs + 118 src references
- `@redux` → `@store` in jest.config.cjs + 75 src/test references
- `@utils` → `@shared` in webpack.config.js + jest.config.cjs + 12 src references
- `@pages` → `@screens` in webpack.config.js + jest.config.cjs + 44 src references

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a main con bump de versión.

Entradas a promover:
- Drop Page suffix from 57 components (HAL-1)
- Drop Slice suffix from 17 Redux slices (HAL-2)
- Rename 20 Service files to Gateway/Client names (HAL-3)
- Replace acronyms in identifiers (HAL-6)
- Rename Webpack aliases to domain names (HAL-4)
