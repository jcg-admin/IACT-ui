```yml
created_at: 2026-05-09 00:30:00
project: THYROX
work_package: 2026-05-09-01-10-00-users-stub-implementation
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — users-stub-implementation

Orden: T-001 (scope gate) → T-002..T-005 (Block/Unblock) → T-006..T-008 (Profile)

---

## Block 0 — Scope Definition (gate antes de implementar)

- [x] [T-001] Crear `discover/users-stub-design-decisions.md` con las decisiones
  de diseño formalizadas como ADR-lite:
  (1) Botones: `Bloquear` visible solo cuando `state === 'ACTIVE'`, `Desbloquear`
  solo cuando `state === 'BLOCKED'`, ambos en columna Acciones de UserList.
  (2) Confirmación: modal (no alert nativo) con nombre del usuario en ambos casos.
  (3) Sesiones: backend invalida sesiones; frontend solo envía petición + notificación.
  (4) Endpoints: `POST /api/users/{id}/block/` y `POST /api/users/{id}/unblock/`.
  (5) Profile scope IN: `first_name`, `last_name`, `email`, `notification_preferences`.
  (6) Profile scope OUT: `password`, `username`, `segment`, `role`, `access_groups`.
  (7) Notification prefs estructura: `{ email_notifications: bool, push_notifications: bool }`.
  (8) Endpoints perfil: `GET /api/users/me/`, `PATCH /api/users/me/profile/`.

---

## Block I — UC_USR_05+06: Block/Unblock gateway + mock

- [ ] [T-002] Agregar a `src/services/userGateway.js`:
  `blockUser(id)` — `POST /api/users/${id}/block/`.
  `unblockUser(id)` — `POST /api/users/${id}/unblock/`.
  Mantener patrón `apiService.post(path)` existente, sin body.

- [ ] [T-003] Agregar en `src/mocks/mockInterceptor.js` ANTES del catch-all
  `/api/users` (línea 102) las rutas:
  `POST /api/users/{id}/block/` → handler `_handleBlockUser(url)`:
    - si user ya `BLOCKED` → 409 `{ error: 'ALREADY_BLOCKED' }`
    - si user `ELIMINATED` → 403 `{ error: 'CANNOT_BLOCK_ELIMINATED' }`
    - caso nominal → 200 `{ id, state: 'BLOCKED' }`
  `POST /api/users/{id}/unblock/` → handler `_handleUnblockUser(url)`:
    - si user no está `BLOCKED` → 409 `{ error: 'NOT_BLOCKED' }`
    - caso nominal → 200 `{ id, state: 'ACTIVE' }`

---

## Block II — UC_USR_05+06: UserManagement + UserList UI

- [ ] [T-004] Agregar en `src/pages/users/UserManagement/UserManagement.jsx`:
  - handler `handleBlockUser(userId)`: llama `userGateway.blockUser(userId)`,
    actualiza estado local `setUsers(users.map(...state:'BLOCKED'))`, `notify.success`.
  - handler `handleUnblockUser(userId)`: llama `userGateway.unblockUser(userId)`,
    actualiza estado local `setUsers(users.map(...state:'ACTIVE'))`, `notify.success`.
  - Pasar `onBlock={handleBlockUser}` y `onUnblock={handleUnblockUser}` a `<UserList>`.

- [ ] [T-005] Agregar en `src/pages/users/UserManagement/UserList.jsx`:
  - Props: `onBlock`, `onUnblock` (además de los existentes `onEdit`, `onDeactivate`).
  - State local: `confirmModal: { open: false, type: null, user: null }`.
  - Botón `Bloquear`: visible cuando `user.state === 'ACTIVE'`, llama
    `setConfirmModal({ open: true, type: 'block', user })`.
  - Botón `Desbloquear`: visible cuando `user.state === 'BLOCKED'`, llama
    `setConfirmModal({ open: true, type: 'unblock', user })`.
  - Modal de confirmación inline: muestra nombre del usuario, botones Confirmar/Cancelar.
    Confirmar despacha `onBlock(user.id)` o `onUnblock(user.id)` según `type`.
  - Ambos botones condicionados con `userAuth.can('users:block')` /
    `userAuth.can('users:unblock')` (importar `userAuth` si no está importado).

---

## Block III — UC_USR_07: Profile gateway + mock

- [ ] [T-006] Agregar a `src/services/userGateway.js`:
  `getMyProfile()` — `GET /api/users/me/`.
  `updateMyProfile(data)` — `PATCH /api/users/me/profile/`.

- [ ] [T-007] Agregar en `src/mocks/mockInterceptor.js` ANTES del catch-all
  `/api/users` las rutas:
  `GET /api/users/me/` → 200 con fixture de perfil propio:
    `{ id: 1, username: 'admin', first_name: 'Admin', last_name: 'User', email: 'admin@example.com', notification_preferences: { email_notifications: true, push_notifications: false } }`
  `PATCH /api/users/me/profile/` → 200 con los campos del body mergeados con fixture.
    Validación: si `email` no contiene `@` → 400 `{ error: 'INVALID_EMAIL' }`.

---

## Block IV — UC_USR_07: Profile.jsx

- [ ] [T-008] Reescribir `src/pages/Profile.jsx`:
  - `useEffect` al mount: llama `userGateway.getMyProfile()`, guarda en state.
  - Form con campos: `first_name` (Nombre), `last_name` (Apellido), `email`
    (Correo de contacto), `email_notifications` (checkbox), `push_notifications`
    (checkbox).
  - Submit: llama `userGateway.updateMyProfile(formData)`, muestra mensaje de éxito
    o error inline.
  - Título `<h1>Mi perfil</h1>`, estructura con `<form>` y `<button type="submit">`.
  - Sin campo `password`, `username`, `segment`, `role`.

---

## Commits esperados

| Bloque | Commit subject |
|--------|---------------|
| 0 | Document design decisions for users stub UCs |
| I | Add blockUser/unblockUser to userGateway and mock |
| II | Add block/unblock UI to UserList with confirmation modal |
| III | Add profile gateway methods and mock endpoints |
| IV | Implement Profile page with bounded edit scope |
