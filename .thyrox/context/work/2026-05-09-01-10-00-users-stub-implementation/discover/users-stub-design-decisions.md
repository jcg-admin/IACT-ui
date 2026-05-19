```yml
created_at: 2026-05-09 00:32:00
project: THYROX
work_package: 2026-05-09-01-10-00-users-stub-implementation
phase: Phase 10 — IMPLEMENT
author: NestorMonroy
status: Aprobado
```

# Design Decisions — users-stub-implementation (T-001)

Decisiones formalizadas ANTES de implementar. Base: Resumen propuesto de
UC_USR_05/06/07 + patrones existentes del proyecto.

---

## DD-01: Ubicación de botones Block/Unblock

**Decisión:** Los botones `Bloquear` y `Desbloquear` van en la columna
`Acciones` de `UserList.jsx`, junto a los botones existentes `Editar` y
`Dar de baja`.

**Visibilidad condicional:**
- `Bloquear`: visible solo cuando `user.state === 'ACTIVE'`
- `Desbloquear`: visible solo cuando `user.state === 'BLOCKED'`
- `Dar de baja`: sin cambio (visible cuando `state !== 'ELIMINATED'`)

**Alternativas descartadas:**
- Botón en fila expandible: añade complejidad innecesaria — el patrón de la
  tabla ya tiene columna acciones.
- Dropdown de acciones: over-engineering para 3-4 acciones.

---

## DD-02: Confirmación UX

**Decisión:** Modal de confirmación inline (state local en `UserList`) para
ambas acciones, no `window.confirm` nativo.

**Bloquear:** Mensaje:
> "¿Bloquear a {username}? El usuario no podrá iniciar sesión mientras esté bloqueado."
> Botones: `Cancelar` / `Bloquear`

**Desbloquear:** Mensaje:
> "¿Desbloquear a {username}? El usuario recuperará el acceso al sistema."
> Botones: `Cancelar` / `Desbloquear`

**Patrón consistente con:** `GroupAssignModal` (modal sin librería externa),
`ActiveSessions` confirm (state local, no Redux modal).

---

## DD-03: Sesiones activas al bloquear

**Decisión:** El frontend NO invalida sesiones activas. Solo envía
`POST /api/users/{id}/block/`. El backend es responsable de:
- Marcar `state = BLOCKED`
- Revocar tokens JWT activos
- Notificar al usuario (mailbox interno, si aplica)

El frontend muestra notificación de éxito tras respuesta 200 y actualiza el
estado local de la lista.

**Motivación:** La UI no tiene acceso a la lista de tokens del usuario. La
invalidación de sesión es responsabilidad del backend (CNST-001 + single
responsibility).

---

## DD-04: Endpoints inferidos

| UC | Método | Path | Body | Response |
|----|--------|------|------|----------|
| UC_USR_05 | POST | `/api/users/{id}/block/` | `{}` | `{ id, state: 'BLOCKED' }` |
| UC_USR_06 | POST | `/api/users/{id}/unblock/` | `{}` | `{ id, state: 'ACTIVE' }` |
| UC_USR_07 GET | GET | `/api/users/me/` | — | perfil propio |
| UC_USR_07 PATCH | PATCH | `/api/users/me/profile/` | campos editables | perfil actualizado |

---

## DD-05: Errores de guard en mock

**Block:**
- `user.state === 'BLOCKED'` → 409 `ALREADY_BLOCKED`
- `user.state === 'ELIMINATED'` → 403 `CANNOT_BLOCK_ELIMINATED`
- Nominal → 200 `{ id, state: 'BLOCKED' }`

**Unblock:**
- `user.state !== 'BLOCKED'` → 409 `NOT_BLOCKED`
- Nominal → 200 `{ id, state: 'ACTIVE' }`

**Profile PATCH:**
- `email` sin `@` → 400 `INVALID_EMAIL`
- Nominal → 200 con campos mergeados

---

## DD-06: Profile — campos IN scope

| Campo | Label UI | Editable |
|-------|----------|---------|
| `first_name` | Nombre | Sí |
| `last_name` | Apellido | Sí |
| `email` | Correo de contacto | Sí |
| `notification_preferences.email_notifications` | Notificaciones por email | Sí |
| `notification_preferences.push_notifications` | Notificaciones push | Sí |

**Campos OUT de scope (explícito):**
`password`, `username`, `segment`, `role`, `access_groups`, `state`

---

## DD-07: Notification preferences — estructura

```json
{
  "email_notifications": true,
  "push_notifications": false
}
```

Solo preferencias de notificación interna. Sin canales EMAIL/SMS externos
(CNST-001 aplica también aquí).

---

## DD-08: Permission guards

- `Bloquear`: `userAuth.can('users:block')` — permiso `users:block` de catalog.js:88
- `Desbloquear`: `userAuth.can('users:unblock')` — permiso `users:unblock` de catalog.js:89
- Perfil: no requiere permiso especial (es self-service; cualquier usuario autenticado puede editar su propio perfil)

---

## DD-09: Patrón de estado — UserManagement usa local state

`UserManagement.jsx` gestiona la lista de usuarios con `useState` local (no Redux).
Block/unblock deben mantener este patrón: actualizar `users` state local al
recibir respuesta exitosa de la API.

No introducir nuevo slice Redux para estas operaciones — sería inconsistente con
el patrón existente del módulo.
