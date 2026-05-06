```yml
created_at: 2026-05-06 19:15:06
project: THYROX
work_package: 2026-05-06-08-10-48-rbac-permissions-mock-alignment
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Aprobado
```

# Changelog — rbac-permissions-mock-alignment

## Added

- `src/pages/reports/HistoricalReportsPage.jsx` — UC-RPT-03: vista histórica con selector
  de periodo (last_24h/7d/30d/90d/year-to-date/custom), filtro segmento, tabla con
  columnas periodo/fecha_inicio/fecha_fin/segmento/dimension/total_llamadas (T-003)

- `src/pages/reports/ReportExportPage.jsx` — UC-RPT-04: exportación asíncrona con selector
  de tipo (7 tipos IVR), selector de formato (CSV/XLSX/JSON/PDF), botón Exportar que
  llama `reportsService.exportReport()` → retorna `job_id` con HTTP 202 (T-004)

- `src/pages/permissions/RevokeGroupPage.jsx` — UC-PERM-02: revocación de grupo con
  userId input, group selector, campo `revoke_reason` obligatorio (BR-009), validación
  antes de despachar `revokeGroupFromUser` (T-006)

- `src/pages/reports/__tests__/HistoricalReportsPage.test.jsx` — 8 tests TDD para
  UC-RPT-03 (T-003)

- `src/pages/reports/__tests__/ReportExportPage.test.jsx` — 7 tests TDD para UC-RPT-04
  incluyendo verificación de job_id badge (T-004)

- `src/pages/permissions/__tests__/RevokeGroupPage.test.jsx` — 6 tests TDD para
  UC-PERM-02 incluyendo validación de revoke_reason vacío (T-006)

- Mock handlers en `src/mocks/mockInterceptor.js`:
  - GET `/api/reports/history/` → `_handleReportHistory()` con 9 rows mock
  - GET `/api/admin/separation-rules/` → `_handleSeparationRules()` con 3 reglas
  - POST `/api/reports/export/` → `{ job_id: 'report-export-${Date.now()}' }` (HTTP 202)
  - DELETE revoke-group handler

## Changed

- `src/redux/slices/accessSlice.js`:
  - `initialState.sodRules` → `initialState.separationRules` (RBAC naming standard)
  - `selectSodRules` → `selectSeparationRules` (exported selector)
  - 4 reducer cases: `state.sodRules` → `state.separationRules`
  - 4 thunks usan `accessService.getSeparationRules/create/update/delete`

- `src/services/accessService.js`:
  - 4 métodos renombrados: `getSodRules/createSodRule/updateSodRule/deleteSodRule`
    → `getSeparationRules/createSeparationRule/updateSeparationRule/deleteSeparationRule`
  - 4 URLs: `/access/sod-rules` → `/access/separation-rules` (REST convention T-001)

- `src/services/adminService.js`:
  - `getSoDRules()` → `getSeparationRules()`
  - URL: `/api/admin/sod-rules/` → `/api/admin/separation-rules/`

- `src/services/__tests__/adminService.test.js`:
  - Describe y calls actualizados para nuevo nombre `getSeparationRules`

- `src/pages/access/SeparationRulesPage.jsx`:
  - Import: `selectSodRules` → `selectSeparationRules`

- `src/pages/access/__tests__/SeparationRulesPage.test.jsx`:
  - Mock state: `sodRules` → `separationRules`
  - Mock selector updated

- `src/pages/access/__tests__/remainingAccessPages.test.jsx`:
  - Mock selector + initial state key: `sodRules` → `separationRules`

- `src/pages/access/TemporaryPermissionsPage.jsx` — UC-PERM-04:
  - `handleRevoke` agrega `revoke_reason` desde `window.prompt()` con validación
    de string no vacío (BR-009); usa `perm.user` y `perm.id` correctos

- `src/router/AppRouter.jsx`:
  - Route renombrada: `/access/sod-rules` → `/access/separation-rules`
  - Nuevas rutas: `/reports/historical`, `/reports/export`, `/permissions/assign-group`,
    `/permissions/revoke-group`, `/permissions/temp-permissions`
  - Nuevos lazy imports: `HistoricalReportsPage`, `ReportExportPage`, `RevokeGroupPage`,
    `TemporaryPermissionsPage` (ya existía pero no estaba importada como lazy)

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Contenido relevante para release notes:
- 6 nuevas rutas de permisos y reportes implementadas (UC-RPT-03/04, UC-PERM-01..04)
- Corrección de nomenclatura `sod-rules` → `separation-rules` en toda la codebase
