```yml
created_at: 2026-05-09 03:30:00
project: THYROX
work_package: 2026-05-09-00-48-30-access-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — access-uc-audit

## Added

- `revokeReason` state + text input (minLength=10, required) in AssignFunctions.jsx
  revocar tab — GAP-ACC-01 (CRÍTICO). Input is wired to `revokeFunction` thunk.
  Revocar buttons per-function are disabled until `revokeReason.trim().length >= 10`.
  Character counter shown when partially filled.

- Mock guard `LastHolderSpec` in `_handleRevokeFunctions`:
  `LAST_HOLDER_MAP = { 'USR-001': 1 }` — 409 LAST_HOLDER_CONFLICT when single holder
  tries to revoke (GAP-ACC-02).

- Mock validation `REASON_TOO_SHORT`: 400 when `revoke_reason.trim().length < 10`
  (GAP-ACC-02).

- Full rewrite of `TemporaryPermissions.jsx` — GAP-ACC-03+04 (CRÍTICO):
  - Changed from `assignFunction` (Assignment) to `grantExceptionalPermission` (ExceptionalPermission)
  - Added `justification` textarea (minLength=20, required)
  - Anti-self P-11: `selectedUser === currentUser.id` → inline warning + submit disabled
  - Tab 'view' fetches `exceptionalPermissions` via `fetchExceptionalPermissions` thunk
  - Validates all fields: user (≠ self), function, justification ≥20, future expires_at

- Mock `_handleGrantExceptionalPermission` updated — T-004:
  - Added `justification.trim().length < 20` → 422 JUSTIFICATION_TOO_SHORT
  - Added `expires_at` in-past → 400 EXPIRES_AT_IN_PAST

- `AccessAudit.jsx`: dispatch `fetchAccessAudit(null)` on mount (GAP-ACC-05 — MEDIO).
  Table now loads all-scope events without requiring userId. Clearing user selection
  reloads all-scope view.

- `accessGateway.getAccessAudit`: optional `userId = null` → `GET /api/access/audit/`
  instead of `GET /api/access/audit/{id}`.

- Mock route `GET /api/access/audit/` (exact before regex) with 5-event multi-user
  fixture covering ASSIGN_FUNCTION, REVOKE_FUNCTION, ASSIGN_GROUPER, GRANT_TEMPORARY.

## Changed

- `TemporaryPermissionsPage.test.jsx`: full rewrite to test `grantExceptionalPermission`
  thunk, justification field validation, and expires_at payload structure.

- `AssignFunctionsPage.test.jsx`: added `revokeReason` input in revocar dispatch test
  (button was disabled without it).

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Entradas relevantes:
- UC_ACC_02: revoke_reason field + LastHolderSpec mock (security correctness)
- UC_ACC_08: ExceptionalPermission entity used correctly (entity correctness)
- UC_ACC_09: Audit loads without userId (UX + spec conformance)
