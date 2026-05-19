```yml
created_at: 2026-05-09 02:00:17
project: THYROX
work_package: 2026-05-09-01-51-11-final-uc-gaps-closure
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — final-uc-gaps-closure

## Added

- `src/pages/users/UserManagement/__tests__/BlockUnblock.test.jsx` —
  9 tests for UC_USR_05/06 block/unblock flow: button visibility per
  user state, modal open/confirm/cancel, onBlock/onUnblock callbacks (T-001).

- `src/pages/__tests__/ProfilePage.test.jsx` — 8 tests for UC_USR_07
  profile self-management: form fields, read-only username, no password
  field, submit, success/error messages, notification checkbox state (T-002).

- `src/mocks/mockInterceptor.js` — GET route for preview-revoke with safe
  and critical fixture responses (T-004).

## Changed

- `src/pages/access/__tests__/remainingAccessPages.test.jsx` — Segments
  describe expanded from 1 to 4 tests: combined code+name rendering,
  expanded child segments, multiple root segments (T-003).

- `src/pages/permissions/RevokeGroup.jsx` — full rewrite implementing
  UC_PERM_02 PASO 4/5: form submits to GET preview-revoke/, result
  opens composition modal with functions_to_revoke badges, remaining
  count, no_functions alert, critical warning + "REVOCAR" literal
  confirmation gate before dispatching revokeGroupFromUser (T-005).

- `src/pages/permissions/__tests__/RevokeGroupPage.test.jsx` — updated
  to match new two-step flow; added 6 modal tests (T-006).

## Status de promoción a CHANGELOG.md raíz

Promueve en próximo merge a main bajo la sección del módulo Permissions:
- UC_PERM_02: composition preview modal antes de revocación de grupo
- UC_USR_05/06/07: tests de bloqueo/desbloqueo y perfil de usuario
- UC_ACC_06/07: tests de árbol de segmentos de datos
