```yml
created_at: 2026-05-09 00:38:00
project: THYROX
work_package: 2026-05-09-01-10-00-users-stub-implementation
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — users-stub-implementation

## Added

- `userGateway.blockUser(id)` — POST /api/users/{id}/block/ (UC_USR_05)
- `userGateway.unblockUser(id)` — POST /api/users/{id}/unblock/ (UC_USR_06)
- `userGateway.getMyProfile()` — GET /api/users/me/ (UC_USR_07)
- `userGateway.updateMyProfile(data)` — PATCH /api/users/me/profile/ (UC_USR_07)
- `mockInterceptor._handleBlockUser(url)` — guards: ALREADY_BLOCKED (409),
  CANNOT_BLOCK_ELIMINATED (403), nominal → 200 `{ id, state: 'BLOCKED' }`
- `mockInterceptor._handleUnblockUser(url)` — guard: NOT_BLOCKED (409),
  nominal → 200 `{ id, state: 'ACTIVE' }`
- `mockInterceptor._handleGetMyProfile()` — GET /api/users/me/ fixture
- `mockInterceptor._handleUpdateMyProfile(body)` — PATCH + INVALID_EMAIL (400) guard
- `discover/users-stub-design-decisions.md` — 9 decisiones de diseño (DD-01..DD-09)
  formalizadas antes de implementar

## Changed

- `userGateway.js` — 4 métodos nuevos + header endpoint list actualizado
- `UserManagement.jsx` — import `userGateway`; handlers `handleBlockUser` +
  `handleUnblockUser`; `onBlock` + `onUnblock` props en `<UserList>`
- `UserList.jsx` — props `onBlock`/`onUnblock`; confirmModal state; botones
  `Bloquear` (state=ACTIVE, users:block) y `Desbloquear` (state=BLOCKED,
  users:unblock) con modal de confirmación inline; import userAuth
- `Profile.jsx` — reescrito desde stub 3 líneas a implementación completa:
  GET perfil on mount, form first_name/last_name/email/notification_preferences,
  PATCH on submit, success/error inline
- `mockInterceptor.js` — 4 nuevas rutas antes del catch-all `/api/users`:
  me/profile/ PATCH, me/ GET, block/, unblock/
- `UserList.test.js` — mock `userAuth.can` + `onBlock`/`onUnblock` en defaultProps

## Status de promoción a CHANGELOG.md raíz

Pendiente hasta merge a main con bump de versión.
