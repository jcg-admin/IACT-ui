```yml
created_at: 2026-05-06 23:15:00
project: IACT-ui
work_package: 2026-05-06-19-34-24-rbac-v560-spec-analysis
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Changelog — RBAC v5.6.0 Alignment

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)

---

## [Phase 10 IMPLEMENT — ITERs A..F + Correcciones T-001..T-009]

### Added

- **ITER-A (G-A3, G-A4, G-A5, G-B1):** Implementados `FunctionCatalogPage.jsx` y
  `AGRCatalogPage.jsx` con tablas, búsqueda y acciones. `adminSlice.js` creado con
  thunks `fetchFunctions`, `createFunction`, `updateFunction`, `deactivateFunction`,
  `fetchAGRCatalog`, `createAGR`, `updateAGR`. `adminService.js` con endpoints CRUD.

- **ITER-B (G-A1, G-A2, G-E1..G-E4):** FunctionCatalog constantes para todos los módulos.
  AppRouter con ProtectedRoutes para `/admin/*` y rutas de logs/search/export/infra.
  Lazy-loaded pages para catálogos de funciones y AGRs.

- **ITER-C (G-D1, G-D2):** Mock handlers `_handleAdminFunctions` y `_handleAdminAGR`
  en mockInterceptor.js para GET list, POST create, PATCH update.

- **ITER-D (G-C1, G-C2, G-C3, G-D3):** Validaciones de schema en `schemas.js` para
  requests admin. Mock PATCH deactivate handler.

- **ITER-E (G-A1, G-E4):** `SavedViewsPage.jsx` implementada con hook `useSavedViews`.
  Ruta `/reports/saved-views` en AppRouter. Slice entry para savedViews.

- **ITER-F (G-B2):** `adminService.deactivateAGR(id)` implementado en adminService.js
  con `PATCH /api/admin/agr/{id}/deactivate/`.

- **T-001/T-002 (G-F1):** Thunk `deactivateAGR` exportado desde `adminSlice.js`.
  AGRCatalogPage lo importaba pero no existía — TypeError en runtime al hacer click
  en Desactivar. 3 tests añadidos en `adminSlice.test.js`.

- **T-003/T-004 (G-F2, G-F3):** Nuevo archivo `src/mocks/__tests__/mockInterceptor-agr.test.js`
  con 6 tests TDD para el data model de AGR. Corrección en `_handleAdminAGR`:
  `codename` ahora en snake_case (`basic_operator_group`), `name` como display name,
  `active: true` (boolean) reemplaza `state: 'ACTIVE'` (string).

- **T-006/T-007 (G-F7..G-F9):** 3 constantes nuevas en `catalog.js`:
  `VIEW_ALL_SESSIONS: 'auth:view_all_sessions'`,
  `REVOKE_FUNCTION_GROUP: 'access:revoke_group'`,
  `GRANT_EXCEPTIONAL: 'access:grant_exceptional'`.
  3 tests nuevos en `catalog.test.js` (total 49 tests).

- **T-009 (G-C5):** `src/mocks/permissions-admin.json` con usuario `sistema.admin`
  (AGR-010, `system_admin_group`, 9 capacidades admin). Registrado en `registry.js`
  como key `permissions-admin` para pruebas E2E de FunctionCatalogPage y AGRCatalogPage.

### Changed

- **T-005 (G-F4..G-F6):** AppRouter.jsx — 3 route guards de logs corregidos:
  `/logs/etl/availability` `VIEW_LOGS` → `VIEW_PIPELINE_LOGS`,
  `/logs/search` `VIEW_LOGS` → `SEARCH_LOGS`,
  `/logs/export` `VIEW_LOGS` → `EXPORT_LOGS`.

- **T-008 (G-F7..G-F9):** AppRouter.jsx — 3 route guards actualizados:
  `/profile/sessions` sin guard → `ProtectedRoute(VIEW_ALL_SESSIONS)`,
  `/permissions/revoke-group` `MANAGE_ACCESS` → `REVOKE_FUNCTION_GROUP`,
  `/permissions/temp-permissions` `MANAGE_ACCESS` → `GRANT_EXCEPTIONAL`.

### Fixed

- **G-F1:** `deactivateAGR` exportado — elimina TypeError en AGRCatalogPage.
- **G-F2:** Codename de AGRs ahora en snake_case (era formato ID `AGR-001`).
- **G-F3:** Campo `active` boolean (era `state: 'ACTIVE'` string) — badge
  INACTIVE/ACTIVE ahora funciona correctamente.
- **G-F4:** `/logs/etl/availability` usa `VIEW_PIPELINE_LOGS` (ETL-specific).
- **G-F5:** `/logs/search` usa `SEARCH_LOGS` (`logs:search`).
- **G-F6:** `/logs/export` usa `EXPORT_LOGS` (`logs:export`).
- **G-F7:** `/profile/sessions` protegido con `VIEW_ALL_SESSIONS`.
- **G-F8:** `/permissions/revoke-group` usa `REVOKE_FUNCTION_GROUP` (`access:revoke_group`).
- **G-F9:** `/permissions/temp-permissions` usa `GRANT_EXCEPTIONAL` (`access:grant_exceptional`).

---

## Métricas finales

| Métrica | Valor |
|---------|-------|
| Tests totales | **1737** (objetivo: ≥1719) |
| Test suites | 210 |
| Regressions | 0 |
| `deactivateAGR` en adminSlice | ✓ |
| Mock AGR codename | snake_case ✓ |
| Mock AGR active | boolean ✓ |
| Route guards logs granulares | 3 corregidos ✓ |
| Constantes nuevas en catalog | 3 ✓ |

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Las entradas relevantes son los Fixed de G-F1..G-F9
y el Added de `permissions-admin.json`.
