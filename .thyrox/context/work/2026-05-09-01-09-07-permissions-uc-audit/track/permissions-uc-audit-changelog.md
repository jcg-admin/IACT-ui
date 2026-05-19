```yml
created_at: 2026-05-09 02:30:00
project: THYROX
work_package: 2026-05-09-01-09-07-permissions-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — permissions-uc-audit

## Fixed

- `ExceptionalPermission.jsx`: `justification` min raised >=10 → >=20 chars.
  Char counter updated from "/10" to "/20". Test updated.
  (GAP-PERM-03 — CRÍTICO)

- `GroupManagement.jsx`: full rewrite —
  - `code` field in create form (regex `^[a-z][a-z0-9_]+_group$`, shown read-only in edit)
  - Retire modal (replace window.confirm + PATCH active=false) with DELETE + `retire_reason` ≥20
  - Predefined groups: Editar/Retirar disabled with title tooltip
  - Redux: `deactivateGroup` → `retireGroup` thunk + gateway method
  (GAP-PERM-05 CRÍTICO, GAP-PERM-06 CRÍTICO, GAP-PERM-07 MEDIO, GAP-PERM-08 MEDIO)

- `RevokeGroup.jsx`: min raised >=1 → >=10 chars; char counter added.
  (GAP-PERM-01 — MEDIO)

- `RevokeExceptionalPermission.jsx`: added `revoke_reason` textarea (≥10)
  inside confirm panel. Confirm disabled until reason valid.
  `revokeExceptionalPermission` thunk + gateway accept `revoke_reason` in DELETE body.
  (GAP-PERM-04 — MEDIO)

- `GroupComposition.jsx`: `change_reason` input (≥10) added in main panel
  (for remove-function) and inside selector modal (for add-function). Both
  `assignFunctionsToGroup` dispatch calls pass `change_reason`.
  Thunk + gateway signature updated.
  (GAP-PERM-09 — MEDIO)

- `PermissionsAudit.jsx`: `PERMISSION_ACTIONS` updated to match spec
  event_type names: `EXCEPTIONAL_PERMISSION_GRANTED`,
  `EXCEPTIONAL_PERMISSION_REVOKED`, `AGR_ASSIGNED`, `AGR_REVOKED`.
  (GAP-PERM-10+11 — MEDIO)

## Added

- `mockInterceptor.js`: CRUD handlers for `/api/access/groups/` (non-system):
  - GET: ACCESS_GROUPS fixture (3 groups, one predefined)
  - POST: 409 CODE_DUPLICATE guard
  - PATCH: 400 CODE_IMMUTABLE | PREDEFINED_NOT_MUTABLE
  - DELETE: 400 PREDEFINED_NOT_MUTABLE | RETIRE_REASON_REQUIRED | TOO_SHORT

- `mockInterceptor.js`: Guards added to existing DELETE handlers:
  - `/api/users/{id}/access-groups/{agr_id}/` → REVOKE_REASON_REQUIRED / REASON_TOO_SHORT
  - `/api/users/{id}/exceptional-permissions/{id}/` → REVOKE_REASON_REQUIRED / REASON_TOO_SHORT

- `mockInterceptor.js`: `/api/access/groups/{id}/functions/` POST guard:
  CHANGE_REASON_REQUIRED | CHANGE_REASON_TOO_SHORT

- All-scope audit fixture updated with correct event_type names
  (`AGR_ASSIGNED`, `EXCEPTIONAL_PERMISSION_GRANTED`, `EXCEPTIONAL_PERMISSION_REVOKED`)

## Changed

- `ExceptionalPermissionPage.test.jsx`: test description + assertion updated (10→20)
- `GroupManagementPage.test.jsx`: full rewrite (retireGroup, code field, retire modal tests)
- `GroupCompositionPage.test.jsx`: cascade tests fill `change_reason` before clicking Verificar
- `PermissionsAuditPage.test.jsx`: fixture and assertions updated to use spec event_type names
- `RevokeExceptionalPermissionPage.test.jsx`: dispatch test passes revoke_reason; added disabled test

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Entradas relevantes:
- UC_PERM_03: justification ≥20 (spec correctness)
- UC_PERM_05: retire endpoint + code field (entity correctness)
- UC_PERM_02+04: revoke_reason guards (security correctness)
- UC_PERM_06: change_reason required (audit trail)
- UC_PERM_10: event_type names fixed (audit display correctness)
