```yml
created_at: 2026-05-08 21:30:00
project: THYROX
work_package: 2026-05-08-21-01-30-menuitem-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — WP menuitem-uc-audit

## Added

- **adminGateway.js: 4 dedicated lifecycle endpoints** (Block I, GAP-01)
  - `publishMenuItem(id)` → `POST /api/admin/menu-items/{id}/publish/`
  - `deprecateMenuItem(id)` → `POST /api/admin/menu-items/{id}/deprecate/`
  - `reactivateMenuItem(id)` → `POST /api/admin/menu-items/{id}/reactivate/`
  - `archiveMenuItem(id)` → `POST /api/admin/menu-items/{id}/archive/`
- **admin.js: 4 thunks + helper** (Block I, GAP-01)
  - `publishMenuItem`, `deprecateMenuItem`, `reactivateMenuItem`, `archiveMenuItem`
  - Shared `updateMenuItemInState` helper eliminates reducer duplication
- **mockInterceptor.js: 4 lifecycle handlers** with correct field semantics (Block I, GAP-01)
  - `/publish/`: sets status=ACTIVE, clears deprecated_at/archived_at
  - `/deprecate/`: sets status=DEPRECATED, sets deprecated_at
  - `/reactivate/`: sets status=ACTIVE, clears all timestamp + block_* fields
  - `/archive/`: sets status=ARCHIVED, sets archived_at, preserves deprecated_at
- **MenuItemCatalogPage.test.jsx: 4 new transition routing tests** (Block I, T-005)
  - DRAFT→ACTIVE dispatches publishMenuItem
  - ACTIVE→DEPRECATED dispatches deprecateMenuItem
  - DEPRECATED→ACTIVE dispatches reactivateMenuItem
  - DEPRECATED→ARCHIVED dispatches archiveMenuItem
- **adminGateway.js: `unblockAutoArchive(id)`** → `DELETE /block-archive/` (Block II, GAP-02)
- **admin.js: `unblockAutoArchive` thunk + reducer** (Block II, GAP-02)
- **MenuItemCatalog.jsx: "Desbloquear archivado" button** visible only when `block_auto_archive=true` (Block II, GAP-02)
- **mockInterceptor.js: `_handleUnblockAutoArchive`** DELETE handler (Block II, GAP-02)
- **MenuItemCatalogPage.test.jsx: unblock-archive suite** — 4 tests (Block II, T-010)
- **ITEMS fixture: item id=5 `Blocked Item`** (DEPRECATED, block_auto_archive=true) for unblock tests

## Changed

- **adminGateway.js: `updateMenuItem`** `apiService.put` → `apiService.patch` (Block III, GAP-03)
- **adminGateway.js: `getMenuItems`** accepts `{ status, module }` params, builds URLSearchParams (Block IV, GAP-04)
- **admin.js: `fetchMenuItems`** thunk accepts optional `filters` argument (Block IV, GAP-04)
- **mockInterceptor.js: `_handleAdminMenuItems` GET** filters by `?status=` and `?module=` params (Block IV, GAP-04)
- **mockInterceptor.js: `_handleAdminMenuItems` POST** returns 409 when `function_codename` already exists (Block V, GAP-05)
- **MenuItemCatalog.jsx: `handleTransition` routing** — DRAFT→ACTIVE uses publish; DEPRECATED/ARCHIVED→ACTIVE uses reactivate (routing bug fixed during T-005 test run)
- **MenuItemCatalog.jsx: "Bloquear archivado" button** hidden when `block_auto_archive=true`

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entradas candidatas:
- Fix: lifecycle transitions now call dedicated endpoints per UC_ADM_05 spec
- Add: unblock-archive DELETE endpoint (UC_ADM_05 FA-06)
