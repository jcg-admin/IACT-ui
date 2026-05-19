```yml
created_at: 2026-05-09 00:30:00
project: THYROX
work_package: 2026-05-09-01-10-00-users-stub-implementation
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER Analysis — users-stub-implementation

## Scope

Implementar los 3 UCs `Reservado` del módulo Usuarios:
- **UC_USR_05** — Bloquear usuario (admin action)
- **UC_USR_06** — Desbloquear usuario (admin action)
- **UC_USR_07** — Editar perfil propio (self-service)

Este no es un UC-audit de flujos alternativos. Es una **implementación desde
spec inferida**: los UCs tienen "Resumen propuesto" en las docs pero sin spec
formal, sin ADR, sin historial de commits. Las decisiones de diseño se documentan
ANTES de codificar.

---

## Estado actual — PROVEN (filesystem)

### UC_USR_05 / UC_USR_06 — Block/Unblock

| Componente | Estado | Evidencia |
|------------|--------|-----------|
| `catalog.js:88-89` | ✅ Existe | `BLOCK_USERS: 'users:block'`, `UNBLOCK_USERS: 'users:unblock'` |
| `mockInterceptor.js:583` | ✅ Existe | `states = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'BLOCKED']` |
| `mockInterceptor.js:1171-1172` | ✅ Existe | codenames `users:block`, `users:unblock` en catálogo |
| `UserList.jsx` acciones | ❌ Falta | Solo `Editar` y `Dar de baja` — sin botón Block/Unblock |
| `UserManagement.jsx` handlers | ❌ Falta | Solo `handleDeactivateUser` — sin handleBlockUser/handleUnblockUser |
| `userGateway.js` | ❌ Falta | No hay `blockUser(id)` ni `unblockUser(id)` |
| Mock endpoint `/api/users/{id}/block/` | ❌ Falta | `_handleUsers` es catch-all GET/POST, no maneja sub-rutas block/unblock |

### UC_USR_07 — Profile

| Componente | Estado | Evidencia |
|------------|--------|-----------|
| `Profile.jsx` | ❌ Stub | 3 líneas: `<h1>Profile</h1><p>User profile page</p>` |
| `userGateway.js` | ❌ Falta | No hay `getMyProfile()` ni `updateMyProfile(data)` |
| Mock endpoint `/api/users/me/` | ❌ Falta | Catch-all `/api/users` no maneja `/api/users/me/` |

---

## Infraestructura existente relevante — PROVEN

- `userGateway.js` usa `apiService` (ya migrado) — patrón correcto
- `UserManagement.jsx` usa `useState` local para lista de usuarios — no Redux
  para este módulo. Block/unblock deben mantener este patrón.
- `userAuth` importado en `UserManagement.jsx` desde `facades/UserIdentity`
- `UserList.jsx` tiene `STATE_BADGE` con `BLOCKED: 'badge-warning'` — el badge
  ya renderiza correctamente si llega `state: 'BLOCKED'`
- `mockInterceptor.js` registra `/api/users` como catch-all en línea 102 — las
  rutas más específicas (block, unblock, me) deben registrarse ANTES de esa línea

---

## Decisiones de diseño inferidas (a formalizar en T-001)

Estas decisiones se infieren del Resumen propuesto de cada UC y de los patrones
existentes en el proyecto. T-001 las valida y las documenta como ADR antes de
cualquier implementación.

### UC_USR_05+06 — Block/Unblock buttons

**Dónde van los botones:**
- En la columna `Acciones` de `UserList.jsx`, junto a `Editar` y `Dar de baja`.
- `Bloquear`: visible solo cuando `user.state === 'ACTIVE'`
- `Desbloquear`: visible solo cuando `user.state === 'BLOCKED'`
- `Dar de baja`: sigue visible cuando `ACTIVE` (no cambiar comportamiento existente)

**Confirmación UX:**
- Bloquear: modal de confirmación con nombre del usuario, mensaje de advertencia:
  "¿Bloquear a {username}? El usuario no podrá iniciar sesión mientras esté bloqueado."
- Desbloquear: modal de confirmación simple: "¿Desbloquear a {username}?"
- Sin confirmación inline (no alert nativo) — consistente con el modal de GroupAssign

**Sesiones activas:**
- El backend invalida sesiones activas del usuario bloqueado. El frontend no necesita
  lógica de invalidación — solo envía la petición y muestra notificación de éxito.
- Endpoint inferido: `POST /api/users/{id}/block/` → `{ state: 'BLOCKED' }`
- Endpoint inferido: `POST /api/users/{id}/unblock/` → `{ state: 'ACTIVE' }`

**Permission guard:**
- Botón `Bloquear` requiere `userAuth.can('users:block')`
- Botón `Desbloquear` requiere `userAuth.can('users:unblock')`
- Los permisos ya existen en catalog.js

### UC_USR_07 — Profile scope

**Campos IN scope:**
- `first_name` (Nombre)
- `last_name` (Apellido)
- `email` (Correo de contacto) — read/write
- `notification_preferences` — objeto con toggles booleanos

**Campos FUERA de scope (explícito):**
- `password` / change-password — fuera de scope
- `username` — no editable
- `segment` / `role` / `access_groups` — no editable desde perfil propio
- `state` — no editable desde perfil propio

**Notification preferences (inferido):**
Estructura mínima inferred de patrones comunes + CNST-001:
```json
{
  "email_notifications": true,
  "push_notifications": false
}
```
No incluir canales EMAIL/SMS externos — solo preferencias de notificación interna.

**Endpoint:**
- `GET /api/users/me/` → perfil propio
- `PATCH /api/users/me/profile/` → actualizar campos editables

---

## Gate 1.5 — confirmado

Scope aprobado por ejecutor con condición explícita:
> "El task plan debe tener un task de definición de scope antes de los tasks de
> implementación. Eso es lo que diferencia una implementación desde spec inferida
> de una implementación sin criterio."

T-001 cumple esa condición.
