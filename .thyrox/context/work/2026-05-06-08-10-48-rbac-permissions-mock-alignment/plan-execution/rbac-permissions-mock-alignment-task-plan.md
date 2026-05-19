```yml
created_at: 2026-05-06 08:20:00
project: THYROX
work_package: 2026-05-06-08-10-48-rbac-permissions-mock-alignment
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: En ejecución
```

# Task Plan — RBAC Permissions Mock Alignment

## Gate decisions (Phase 1 → Phase 8)

- DP-001: Remove SUPER_ADMIN, VIEW_CONFIG, EDIT_CONFIG (no spec equiv). AppRouter: SUPER_ADMIN → MANAGE_CATALOG (`adm:manage_catalog`), VIEW_CONFIG → VIEW_OWN_SESSIONS (`auth:view_own_sessions`)
- DP-002: Remove invented functions: VIEW_TICKETS, CREATE_TICKETS, EDIT_TICKETS, VIEW_CLIENTS, VIEW_REALTIME_METRICS + duplicates: ASSIGN_FUNCTIONS, MANAGE_SOD_RULES, VIEW_PERMISSIONS_AUDIT
- DP-003: Mock persona has flat capacidades list from spec modules (reports, users, pipeline, logs, access, alerts, auth)

## ITER-A — Catalog TDD

- [x] T-001: Update `catalog.test.js` — change format validator to `module:action` (colon, 2 parts), update 3 hardcoded value tests to spec notation
- [x] T-002: Rewrite `FunctionCatalog.js` — migrate all 29 constants to spec notation, remove 10 invented/dup constants, add 6 new spec constants

## ITER-B — Router + Mock + Docs

- [x] T-003: Update `AppRouter.test.jsx` — fix 3 hardcoded `.toBe()` values; update `AppRouter.jsx` — replace SUPER_ADMIN → MANAGE_CATALOG, VIEW_CONFIG → VIEW_OWN_SESSIONS, VIEW_PERMISSIONS_AUDIT → VIEW_ACCESS (3 occurrences in ProtectedRoutes + nav)
- [x] T-004: Rewrite `permissions.json` — real AGR codes, flat spec capacidades (19 functions covering 7 modules), spec-aligned funciones_accesibles
- [x] T-005: Update `PermissionGate.tsx` JSDoc — update 7 example strings from `sistema.X` to `module:action` notation
- [x] T-006: Update `FunctionCatalogPage.test.jsx` — update 2 mock codenames from old notation to spec notation
