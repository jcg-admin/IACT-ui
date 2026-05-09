```yml
created_at: 2026-05-09 00:48:30
project: THYROX
work_package: 2026-05-09-00-48-30-access-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — access-uc-audit

Orden aprobado: GAP-ACC-01+02 → GAP-ACC-03+04 → GAP-ACC-05

---

## Block I — GAP-ACC-01+02: UC_ACC_02 revoke_reason + LastHolderSpec mock

- [ ] [T-001] Agregar campo `revoke_reason` en tab "Revocar" de
  `src/pages/access/AssignFunctions.jsx`:
  - Añadir `const [revokeReason, setRevokeReason] = useState('')` al state
  - Agregar `<textarea>` o `<input>` con label "Motivo de revocación"
    (`minLength=10`, `required`) antes del botón Revocar de cada función
  - Pasar `revokeReason` a `dispatch(revokeFunction({ userId, catalogId, revokeReason }))`
  - Validación UI: botón Revocar deshabilitado si `revokeReason.trim().length < 10`
  - Limpiar `revokeReason` en `setSelectedUser('')`

- [ ] [T-002] Agregar guard `LastHolderSpec` en `src/mocks/mockInterceptor.js`
  handler de revocar funciones:
  - En `_handleRevokeFunctions` (o donde se maneja `DELETE /api/users/{id}/functions/`):
    definir un conjunto `CRITICAL_FUNCTIONS_LAST_HOLDER = { 'USR-001': 1 }` donde
    el valor es el único userId que la tiene.
  - Si el `catalogId` revocado está en ese conjunto Y el `userId` del request es
    el único holder → 409 `{ error: 'LAST_HOLDER_CONFLICT', function: codename }`
  - Nominal → comportamiento actual sin cambio

---

## Block II — GAP-ACC-03+04: UC_ACC_08 TemporaryPermissions rewrite

- [ ] [T-003] Reescribir `src/pages/access/TemporaryPermissions.jsx`:
  - Cambiar import: usar `grantExceptionalPermission` thunk del slice de access
    (o crear acción que llame `POST /api/users/{id}/exceptional-permissions/`)
  - Añadir campo `justification` (textarea, `minLength=20`, `required`) al formulario
  - Conservar: `selectedUser`, `selectedFunction`, `expiryDate`, `expiryTime`
  - Validación `validateForm()`: agregar `justification.trim().length >= 20`
  - Submit: llamar `POST /api/users/{id}/exceptional-permissions/` con body
    `{ function_codename, justification, expires_at: expiryDate + 'T' + expiryTime }`
  - Anti-self: deshabilitar submit si `selectedUser === currentUser.id`
    (usar `userAuth.getUserId()` o equivalente disponible)
  - Tab "Ver activos": lista de permisos temporales del usuario seleccionado
    vía `GET /api/users/{id}/exceptional-permissions/`

- [ ] [T-004] Verificar que el mock `_handleExceptionalPermissions` (POST)
  en `src/mocks/mockInterceptor.js` ya valida:
  - `justification.trim().length === 0` → 422 (ya existe en línea 1354)
  - `justification.length < 20` → 422 `JUSTIFICATION_TOO_SHORT` (agregar si falta)
  - `expires_at` pasado → 400 `EXPIRES_AT_IN_PAST` (agregar si falta)
  - Anti-self P-11 → 403 (ya existe en línea 1362)

---

## Block III — GAP-ACC-05: UC_ACC_09 load sin usuario requerido

- [ ] [T-005] Modificar `src/pages/access/AccessAudit.jsx`:
  - Cambiar `useEffect` de audit: despachar `fetchAccessAudit(null)` (o sin arg)
    al montar, no solo cuando `selectedUser` cambia
  - Actualizar handler de `selectedUser`: si hay usuario → `fetchAccessAudit(userId)`,
    si se limpia selección → `fetchAccessAudit(null)` para volver a todos
  - Actualizar el `fetchAccessAudit` thunk en `access.js` para aceptar
    `userId = null` → `GET /api/access/audit/` (sin id), con id →
    `GET /api/access/audit/{id}`
  - Actualizar mock: agregar `GET /api/access/audit/` sin id → fixture con
    3-5 eventos de diferentes usuarios con actions variadas (FUNCTIONS_*, AGR_*)

---

## Commits esperados

| Bloque | Commit subject |
|--------|---------------|
| I | Add revoke_reason field and LastHolderSpec mock (UC_ACC_02) |
| II | Rewrite TemporaryPermissions to use ExceptionalPermission endpoint |
| III | Allow AccessAudit load without user selection (UC_ACC_09) |
