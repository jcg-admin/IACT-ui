```yml
created_at: 2026-05-09 01:30:00
project: THYROX
work_package: 2026-05-09-01-09-07-permissions-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — permissions-uc-audit

Orden aprobado: GAP-PERM-03 → GAP-PERM-05+06+07+08 → GAP-PERM-01+04 → GAP-PERM-09 → GAP-PERM-10+11

---

## Block I — GAP-PERM-03: UC_PERM_03 justification min fix

- [x] [T-001] Corregir `justification` min en `src/pages/permissions/ExceptionalPermission.jsx`:
  - Cambiar `justification.trim().length >= 10` → `>= 20` (línea 51)
  - Actualizar mensaje de error: `"al menos 10 caracteres ({justification.length}/10)"` →
    `"al menos 20 caracteres ({justification.length}/20)"`
  - Actualizar character counter display a `/20`

---

## Block II — GAP-PERM-05+06+07+08: GroupManagement rewrite

- [x] [T-002] Actualizar `src/services/accessGateway.js`:
  - Renombrar método `deactivateGroup(id)` → `retireGroup(id, retireReason)`
  - Cambiar de PATCH `{ active: false }` a DELETE con body `{ retire_reason: retireReason }`
  - URL: `DELETE /api/access/groups/${id}/`

- [x] [T-003] Actualizar `src/redux/slices/access.js`:
  - Renombrar thunk `deactivateGroup` → `retireGroup`
  - Cambiar argumento: `async (id, ...)` → `async ({ id, retireReason }, ...)`
  - Llamar `accessService.retireGroup(id, retireReason)` en lugar de `deactivateGroup(id)`
  - Actualizar todos los extraReducers: renombrar casos `deactivateGroup.*` → `retireGroup.*`
  - Export: asegurar que `retireGroup` se exporta y `deactivateGroup` se elimina

- [x] [T-004] Reescribir `src/pages/access/GroupManagement.jsx`:
  - **Campo `code`:** agregar al formulario create-only (not edit — code es inmutable):
    `<input name="code" placeholder="ej: admins_group" pattern="^[a-z][a-z0-9_]+_group$" required />`
    - Incluir `code` en `EMPTY_FORM`: `{ name: '', description: '', code: '' }`
    - Validación: `code` debe matchear `/^[a-z][a-z0-9_]+_group$/` en create
    - En edit mode: mostrar `code` como read-only (inmutable post-create)
    - Pasar `code` en body del `createGroup` dispatch
  - **Retire (reemplazar deactivate):**
    - Agregar state `retireReason = ''` y `retiringGroup = null`
    - Click "Retirar" → setRetiringGroup(group) + modal con textarea motivo
    - Textarea `retireReason` con minLength=20, required; char counter
    - Submit retire: `dispatch(retireGroup({ id: retiringGroup.id, retireReason: retireReason.trim() }))`
    - Limpiar retireReason + retiringGroup en éxito
  - **Predefined guard:**
    - Fixture de grupos tiene campo `is_predefined`. Si `group.is_predefined`:
      - Deshabilitar botones "Editar" y "Retirar" con title="Grupo predefinido — no modificable"
  - Actualizar imports: `deactivateGroup` → `retireGroup`
  - Eliminar `confirm()` window.confirm anti-pattern — reemplazar con el retire modal

- [x] [T-005] Agregar mock handlers en `src/mocks/mockInterceptor.js`:
  - **Fixtures de grupos access (no system):**
    ```
    ACCESS_GROUPS = [
      { id: 10, code: 'admins_group', name: 'Administradores', description: '...', is_predefined: true, state: 'ACTIVE' },
      { id: 11, code: 'auditores_group', name: 'Auditores', description: '...', is_predefined: false, state: 'ACTIVE' },
      { id: 12, code: 'operadores_group', name: 'Operadores', description: '...', is_predefined: false, state: 'ACTIVE' },
    ]
    ```
  - **GET /api/access/groups/** → retorna `ACCESS_GROUPS` (los activos, state !== 'RETIRED')
  - **POST /api/access/groups/** → guard CODE_DUPLICATE: si `code` ya existe en ACCESS_GROUPS
    retorna 409 `{ error: 'CODE_DUPLICATE', code: 'CODE_DUPLICATE' }`; si ok, 201 con nuevo grupo
  - **PATCH /api/access/groups/{id}/** → actualiza nombre/descripción; guard CODE_IMMUTABLE:
    si body incluye `code` → 400 `{ error: 'CODE_IMMUTABLE', code: 'CODE_IMMUTABLE' }`
  - **DELETE /api/access/groups/{id}/** → retire handler:
    - Guard PREDEFINED_NOT_MUTABLE: si `is_predefined === true` → 400
      `{ error: 'Grupo predefinido no puede ser retirado', code: 'PREDEFINED_NOT_MUTABLE' }`
    - Guard RETIRE_REASON_REQUIRED: si `retire_reason` ausente o vacío → 400
      `{ error: 'retire_reason requerido', code: 'RETIRE_REASON_REQUIRED' }`
    - Guard RETIRE_REASON_TOO_SHORT: si `retire_reason.trim().length < 20` → 400
      `{ error: 'retire_reason debe tener al menos 20 caracteres', code: 'RETIRE_REASON_TOO_SHORT' }`
    - Nominal: retorna 200 `{ state: 'RETIRED', retired_at: new Date().toISOString() }`
  - **Route registration:** agregar estas rutas ANTES de los catch-all del mock dispatcher

- [x] [T-006] Actualizar `src/pages/access/__tests__/GroupManagementPage.test.jsx`:
  - Cambiar mock `deactivateGroup` → `retireGroup`
  - Agregar `code: 'admins_group'` a fixtures GROUPS
  - Agregar `is_predefined: false` a fixtures GROUPS (para no bloquear los tests nominales)
  - Actualizar test de deactivate → test de retire (modal + textarea + dispatch)
  - Agregar test: campo `code` presente en formulario create
  - Agregar test: `code` read-only en formulario edit

---

## Block III — GAP-PERM-01+04: revoke_reason fields

- [x] [T-007] Actualizar `src/pages/permissions/RevokeGroup.jsx`:
  - Cambiar `revokeReason.trim().length >= 1` → `>= 10` (línea 32)
  - Agregar char counter: `{revokeReason.length}/10` debajo del input, visible si `length > 0 && length < 10`
  - Actualizar mensaje de validación si existe

- [x] [T-008] Agregar guard en `src/mocks/mockInterceptor.js`:
  - Handler para `DELETE /api/users/{userId}/access-groups/{agrId}/`:
    ya existe en línea 225 — agregar validación `revoke_reason`:
    - Si `body.revoke_reason === undefined || body.revoke_reason.trim() === ''` → 400
      `{ error: 'revoke_reason requerido', code: 'REVOKE_REASON_REQUIRED' }`
    - Si `body.revoke_reason.trim().length < 10` → 400
      `{ error: 'revoke_reason muy corto (mínimo 10 chars)', code: 'REASON_TOO_SHORT' }`
    - Nominal: continuar con lógica actual (200 `{ revoked: true }`)

- [x] [T-009] Agregar campo `revoke_reason` en `src/pages/permissions/RevokeExceptionalPermission.jsx`:
  - Agregar `const [revokeReason, setRevokeReason] = useState('')`
  - Agregar textarea para `revoke_reason` (minLength=10, required) antes del botón confirm
  - Mostrar char counter si `revokeReason.length > 0 && revokeReason.length < 10`
  - Deshabilitar botón confirm si `revokeReason.trim().length < 10`
  - Pasar `revoke_reason: revokeReason.trim()` en dispatch de `revokeExceptionalPermission`

- [x] [T-010] Actualizar `src/redux/slices/access.js` y `src/services/accessGateway.js`:
  - Thunk `revokeExceptionalPermission`: cambiar `async ({ userId, permissionId }, ...)` →
    `async ({ userId, permissionId, revoke_reason }, ...)`
  - Llamar `accessService.revokeExceptionalPermission(userId, permissionId, revoke_reason)`
  - Gateway `revokeExceptionalPermission(userId, permissionId, revoke_reason)`:
    - Cambiar de GET/DELETE sin body a DELETE con body `{ revoke_reason }`
    - Verificar que method es DELETE (ya lo es, según la gateway existente)

- [x] [T-011] Agregar guard en `src/mocks/mockInterceptor.js` para DELETE exceptional permissions:
  - Encontrar el handler del endpoint `DELETE /api/users/{userId}/exceptional-permissions/{id}/`
  - Agregar guard:
    - Si `revoke_reason` ausente o `trim().length < 10` → 400
      `{ error: 'revoke_reason requerido (mínimo 10 chars)', code: 'REASON_TOO_SHORT' }`
  - Actualizar `src/pages/permissions/__tests__/RevokeExceptionalPermissionPage.test.jsx`:
    agregar test de campo `revoke_reason` (visible, pasa al dispatch)

---

## Block IV — GAP-PERM-09: change_reason en GroupComposition

- [x] [T-012] Agregar `change_reason` en `src/pages/access/GroupComposition.jsx`:
  - Agregar `const [changeReason, setChangeReason] = useState('')`
  - Agregar input/textarea para `change_reason` (minLength=10, required)
  - Char counter: `{changeReason.length}/10` si `length > 0 && length < 10`
  - Deshabilitar botón "Aplicar cambios" si `changeReason.trim().length < 10`
  - Pasar `change_reason: changeReason.trim()` en ambos dispatches de `assignFunctionsToGroup`

- [x] [T-013] Actualizar `src/redux/slices/access.js` y `src/services/accessGateway.js`:
  - Thunk `assignFunctionsToGroup`: cambiar `async ({ groupId, functionIds }, ...)` →
    `async ({ groupId, functionIds, change_reason }, ...)`
  - Llamar `accessService.assignFunctionsToGroup(groupId, functionIds, change_reason)`
  - Gateway `assignFunctionsToGroup(groupId, functionIds, change_reason)`:
    - Agregar `change_reason` al body del POST:
      `body: JSON.stringify({ functions: functionIds, change_reason })`
  - Agregar guard en mock `_handleGroupCascadeImpact` o el handler POST de `/access/groups/{id}/functions/`:
    - Si `change_reason` ausente o `trim().length < 10` → 400
      `{ error: 'change_reason requerido (mínimo 10 chars)', code: 'CHANGE_REASON_REQUIRED' }`
  - Actualizar `src/pages/access/__tests__/GroupCompositionPage.test.jsx`:
    agregar `change_reason` en el test de dispatch de `assignFunctionsToGroup`

---

## Block V — GAP-PERM-10+11: PermissionsAudit event_type fix

- [x] [T-014] Corregir `PERMISSION_ACTIONS` en `src/pages/access/PermissionsAudit.jsx`:
  - Cambiar:
    ```js
    const PERMISSION_ACTIONS = ['ASSIGN_PERMISSION', 'REVOKE_PERMISSION', 'ASSIGN_GROUP', 'REVOKE_GROUP']
    ```
    a:
    ```js
    const PERMISSION_ACTIONS = [
      'EXCEPTIONAL_PERMISSION_GRANTED',
      'EXCEPTIONAL_PERMISSION_REVOKED',
      'AGR_ASSIGNED',
      'AGR_REVOKED',
    ]
    ```
  - Verificar que estos nombres coinciden con los event_type usados en los fixtures del mock

- [x] [T-015] Verificar/actualizar fixture de audit en `src/mocks/mockInterceptor.js`:
  - El mock all-scope (`GET /api/access/audit/` sin userId) ya usa `GRANT_TEMPORARY` y `ASSIGN_FUNCTION`
  - Verificar que algún evento tiene `action: 'EXCEPTIONAL_PERMISSION_GRANTED'` o `AGR_ASSIGNED`
  - Si no hay — agregar 2 eventos con los action names correctos al fixture de null-userId
    para que PermissionsAudit muestre filas (no tabla vacía)
  - Agregar también un fixture específico para el endpoint de permissions audit si lo hay

---

## Commits esperados

| Bloque | Commit subject |
|--------|---------------|
| I | Fix ExceptionalPermission justification min (10→20 chars) |
| II | Rewrite GroupManagement with retire, code field, and predefined guards |
| III | Add revoke_reason to RevokeGroup and RevokeExceptionalPermission |
| IV | Add change_reason to GroupComposition (UC_PERM_06 EX-07) |
| V | Fix PermissionsAudit event_type names to match spec |
