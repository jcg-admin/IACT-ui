```yml
created_at: 2026-05-07 00:00:00
project: THYROX
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — mock-rbac-full-audit

## Added

- **FunctionCatalog**: 26 new constants for RBAC v5.6.x spec (T-001)
  — MOD_Alerts ×8, MOD_Pipeline ×2, MOD_Users ×5, MOD_Access ×6,
    MOD_Auth ×2, MOD_Admin ×3. Total: 40 baseline → 66 constants.
  — Key naming: `UPDATE_SEPARATION_RULE` / `DISABLE_SEPARATION_RULE`
    (not SOD) for constants whose values are opaque backend strings
    (`access:update_sod`, `access:disable_sod`).

- **mockInterceptor._handleLogin**: `admin` user mock (id=99) added
  alongside existing `demo` user (T-009).

- **mockInterceptor._handlePermisosMenu**: new `/api/permisos/verificar/{id}/menu/`
  handler that filters menu items by user capacities (T-012).

- **mockInterceptor._handleScheduledReports**: new `GET/POST /api/reports/scheduled/`
  handler with 3 seed entries (T-012).

- **Alerts accordion nav**: 5 children in ALL_NAV_LINKS + 3 new routes
  `/alerts/config`, `/alerts/history`, `/alerts/subscriptions` (T-013, T-014).

- **Audit accordion nav**: 4 children in ALL_NAV_LINKS + 3 new routes
  `/audit/search`, `/audit/export`, `/audit/compliance` (T-016, T-017).

- **TDD tests**: T-015 (5 Alerts accordion tests), T-018 (5 Audit accordion
  tests) added to AppRouter.test.jsx. Full suite: 1813 tests.

## Changed

- **FunctionCatalog test** (`catalog.test.js`): added `describe` block for
  v5.6.x extension — 83 tests total (T-002).

- **accessSlice.js**: 4 thunks renamed — `fetchSod*` → `fetchSeparation*`,
  `createSod*` → `createSeparation*`, etc. (T-003).

- **FunctionSelector.jsx**: `SOD_RULES` → `SEPARATION_RULES`, rule keys
  `SOD-001..003` → `SR-001..003`, UI text "Conflictos SoD" → 
  "Conflictos de Separación" (T-004).

- **SeparationRulesValidator.jsx**: `SOD_RULES_INFO` → `SEPARATION_RULES_INFO`,
  object keys `SOD-*` → `SR-*` (T-005).

- **SeparationRulesPage.jsx**: imports + `sodRules` variable updated to
  `separationRules` (T-006).

- **AssignFunctionsPage.jsx**: JSX list items `SOD-001..003` → `SR-001..003`
  (T-007).

- **ComplianceReportPage.jsx**: `regulations: ['SOD']` → `regulations:
  ['separation-rules']` (T-007).

- **5 test files**: mock factories and assertions updated to use
  `fetchSeparationRules`, `SEPARATION_RULES`, `SR-001`, etc. (T-008).

- **mockInterceptor._handleLogin / _handleGetUser**: `demo` user id 1→10
  (aligns with PERMISOS_BY_USER_ID key). `role` field removed from
  session user objects — RBAC authorization is function-based (T-009).

- **mockInterceptor._handleAdminFunctions**: expanded 20-entry stub to 67
  canonical functions across 8 modules with correct capacity codenames (T-010).

- **mockInterceptor._handleAdminAGR**: AGR-010 `functions_count` corrected
  from 6 to 9 (T-011).

- **mockInterceptor._handleSeparationRules**: codes `SOD-00x` → `SR-00x`,
  `isActive` field added, group capacities updated to canonical strings (T-011).

- **AppRouter — permission guards** (T-019, T-020):
  - `/logs/etl/availability`: `VIEW_PIPELINE_LOGS` → `VIEW_DATA_AVAILABILITY`
  - `/access/groupers`, `/access/segments`: `MANAGE_ACCESS` → `ASSIGN_FUNCTION_GROUPS`
  - `/access/assign-group`, `/permissions/assign-group`: `MANAGE_ACCESS` → `ASSIGN_TO_GROUP`
  - Nav label "Reglas SoD" → "Reglas Separación"

## Status de promoción a CHANGELOG.md raíz

Promover al merge a `main` bajo la sección correspondiente:

- **Changed**: FunctionCatalog extended to 66 constants (RBAC v5.6.x)
- **Changed**: SoD identifiers renamed to SeparationRule/SR-NNN across codebase
- **Fixed**: Mock userId mismatch (demo id=1 → id=10)
- **Added**: Alerts and Audit accordion navigation with sub-routes
- **Fixed**: Permission guard mismatches for availability/groupers/assign-group routes
