# Changelog — WP uc-alignment-full-audit

```yml
created_at: 2026-05-08 04:51:00
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 10 — IMPLEMENT
author: NestorMonroy
status: Aprobado
```

## Added

- **AppRouter: 5 new routes with permission guards** (Bloque I, GAP-A)
  - `/access/assign-functions` → `AssignFunctionsPage` — guard `MANAGE_ACCESS` (UC-ACC-01/02)
  - `/access/permissions` → `PermissionsPage` — guard `VIEW_ACCESS` (UC-ACC-03)
  - `/access/audit/access` → `AccessAuditPage` — guard `VIEW_AUDIT` (UC-ACC-09)
  - `/admin/separation-rules` → `SeparationRulesCatalogPage` — guard `CREATE_SEPARATION_RULE` (UC-ADM-01)
  - `/admin/menu-items` → `MenuItemCatalogPage` — guard `MANAGE_MENU_CATALOG` (UC-ADM-04/05)
- **AppRouter: 5 new navLink entries** in Access and Admin groups
- **`src/pages/admin/SeparationRulesCatalog.jsx`** — New page (UC-ADM-01): full CRUD table for SoD rule lifecycle management with Activar/Desactivar toggle and create/edit form (Bloque VI)
- **`src/pages/admin/MenuItemCatalog.jsx`** — New page (UC-ADM-04/05): two-tab layout with Catálogo (CRUD) and Lifecycle (status machine DRAFT→ACTIVE→DEPRECATED→ARCHIVED) tabs (Bloque VII)
- **`src/pages/users/UserManagement/`** — Canonical location for UserManagement; moved from `src/components/pages/UserManagement/` (Bloque VIII, GAP-D)
- **`src/pages/access/__tests__/AccessAuditPage.test.jsx`** — 6 tests covering render, record count, labels, dispatch on user select, action filter, export button (T-008)
- **`src/pages/admin/__tests__/SeparationRulesCatalogPage.test.jsx`** — 7 tests (T-032)
- **`src/pages/admin/__tests__/MenuItemCatalogPage.test.jsx`** — 8 tests (T-038)

## Changed

- **`src/mocks/mockInterceptor.js`** — Extended with:
  - `GET /api/access/functions` handler (returns 15 mock functions)
  - `GET /api/access/permissions/:userId` handler
  - `GET /api/access/audit/:userId` handler
  - `_handleAdminSeparationRules(method, url, body)` — full CRUD for admin SoD rules
  - `_handleAdminMenuItems(method, url, body)` — full CRUD + status transition for menu items
  - Refactored `_handleSeparationRules()` to be GET-only (backward compat); admin CRUD uses new handler
- **`src/services/adminGateway.js`** — Added 7 new service methods: `createSeparationRule`, `updateSeparationRule`, `toggleSeparationRuleStatus`, `getMenuItems`, `createMenuItem`, `updateMenuItem`, `transitionMenuItemStatus`
- **`src/redux/slices/admin.js`** — Added 8 new `createAsyncThunk` thunks + reducers + 2 new selectors (`selectAdminSeparationRules`, `selectMenuItems`); `initialState` extended with `separationRules: []` and `menuItems: []`
- **`src/pages/users/UserManagement/UserManagement.jsx`** — Fixed `GroupAssignModal` import path (now `../../../components/access/GroupAssignModal`)
- **`src/pages/users/UserManagement/__tests__/UserManagement.test.js`** — Fixed `jest.mock` path for `GroupAssignModal`
- **`src/components/pages/__tests__/remainingPages.test.jsx`** — Updated 3 references from old `../UserManagement/` to `../../../pages/users/UserManagement/`
- **`src/router/AppRouter.jsx`** — Updated `UserManagementPage` lazy import from `@ui/pages/UserManagement` to `@screens/users/UserManagement`

## Pre-existing (discovered during audit, not changed)

- UC-ACC-01/02 (`AssignFunctions.jsx`): fully implemented with assign+revoke tabs; tests in `AssignFunctionsPage.test.jsx` (7 tests)
- UC-ACC-03 (`Permissions.jsx`): implemented with revoke confirmation flow; tests in `PermissionsPage.test.jsx` (3 tests)
- UC-ACC-09 (`AccessAudit.jsx`): implemented with action/date filters + CSV export; tests added by this WP
- UC-PIP-04: `retryPipeline` thunk + confirm modal in `ETLLogs.jsx`; 5 tests in `PipelineRetry.test.jsx`
- UC-RPT-08: `runScheduleNow` in `ScheduledReport.jsx`; tested in `ScheduledReportPage.test.jsx`
- UC-RPT-09: `SavedFiltersPanel` component used in 6+ report pages; each has a saved filters test
- UC-RPT-11: `ShareReportModal` + `shareReport` thunk; integrated in `HistoricalReports`, `UniqueClients`, `Transfers`, `IVRMenus`, `Campaigns`

## Status de promoción a CHANGELOG.md raíz

Pending merge to main. Key entry for CHANGELOG.md when promoted:

```
## Added
- Admin pages: SeparationRulesCatalog (UC-ADM-01) and MenuItemCatalog (UC-ADM-04/05)
- Access routes: /access/assign-functions, /access/permissions, /access/audit/access
- Admin routes: /admin/separation-rules, /admin/menu-items

## Changed
- Moved UserManagement from src/components/pages/ to src/pages/users/ (canonical location)
- Extended admin slice with SoD and MenuItem thunks
- Extended adminGateway with 7 new service methods
```
