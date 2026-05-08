```yml
created_at: 2026-05-08 02:25:42
project: THYROX
work_package: 2026-05-08-02-25-15-permissions-fr-gaps-uml-conformance
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — Permissions FR Gaps (UML Conformance)

Fuente: 6 gaps identificados vs branch `feature/cnst-033-uml-conformance` en IACT-docs.
Análisis completo: `analyze/permissions-fr-gaps-diagnose.md`

---

## Bloque I — GAP-6: ComplianceReport label fix (trivial)

- [ ] [T-001] `ComplianceReport.jsx:47` — Cambiar `'Segregación de Deberes (SoD)'` → `'Separación de Funciones'`

---

## Bloque II — GAP-1: SeparationRulesValidator HARD/SOFT severity

- [ ] [T-002] `SeparationRulesValidator.jsx` — Agregar props `onProceedAnyway` y lógica HARD/SOFT:
  - HARD: panel rojo, badge "HARD", texto bloqueante (comportamiento actual)
  - SOFT: panel amarillo, badge "SOFT", botón "Entendido, proceder de todas formas" → `onProceedAnyway()`
  - Default para `severity` undefined: tratar como HARD

- [ ] [T-003] `mockInterceptor.js` — Agregar `severity` a la respuesta de `_handleSeparationRules()` y agregar handler para `POST /api/access/separation-rules/validate` con `_handleValidateSeparationRules(body)`

- [ ] [T-004] Tests de `SeparationRulesValidator`:
  - Sin conflictos → verde
  - Solo HARD → rojo, sin botón proceder
  - Solo SOFT → amarillo, botón proceder visible
  - Mixto HARD+SOFT → rojo, sin botón proceder (HARD domina)
  - Click onProceedAnyway cuando solo SOFT → callback invocado

---

## Bloque III — GAP-2: AssignGroup pre-validación separación

- [ ] [T-005] `accessGateway.js` — Agregar método `validateGroupAssignment(userId, groupId)` → `POST /api/access/groups/{groupId}/validate-for-user` con `{ user_id: userId }`

- [ ] [T-006] `access.js` — Agregar thunk `validateGroupAssignment` (`access/validateGroupAssignment`)

- [ ] [T-007] `mockInterceptor.js` — Agregar handler `POST /api/access/groups/{groupId}/validate-for-user` → `_handleValidateGroupAssignment(body)`:
  - Devuelve `{ valid: true, conflicts: [] }` por defecto
  - Si `body.user_id` termina en '9': devuelve 1 conflicto SOFT (para testing)

- [ ] [T-008] `AssignGroup.jsx` — Refactorizar a flujo 2 pasos:
  - Step 'form': formulario actual + botón "Verificar separación"
  - onClick Verificar → dispatch validateGroupAssignment
  - Step 'review': mostrar SeparationRulesValidator (si conflictos) o panel verde
  - Si solo SOFT: `onProceedAnyway` → habilitar submit
  - Si HARD: submit deshabilitado
  - Botón "Asignar grupo" solo habilitado si valid o SOFT confirmado

- [ ] [T-009] Tests de `AssignGroup.jsx`:
  - Render inicial del formulario
  - Click "Verificar" → llama validateGroupAssignment
  - Sin conflictos → panel verde → submit habilitado
  - Conflicto SOFT → amarillo → "proceder" → submit habilitado
  - Conflicto HARD → rojo → submit deshabilitado
  - Submit exitoso → mensaje de éxito

---

## Bloque IV — GAP-5: GroupComposition cascade_affected_user_count

- [ ] [T-010] `accessGateway.js` — Agregar `getGroupCascadeImpact(groupId, addFunctionIds)` → `GET /api/access/groups/{groupId}/cascade-impact?add_function_ids={ids}`

- [ ] [T-011] `mockInterceptor.js` — Agregar handler `GET /api/access/groups/{groupId}/cascade-impact`:
  - Si query tiene función ids → devuelve `{ cascade_affected_user_count: 2, conflicts: [] }`
  - Default: `{ cascade_affected_user_count: 0, conflicts: [] }`

- [ ] [T-012] `GroupComposition.jsx` — En `handleConfirmAdd`:
  - Antes de mostrar el modal de confirmación, llamar `accessService.getGroupCascadeImpact`
  - Estado local `cascadeImpact: null | { cascade_affected_user_count, conflicts }`
  - En el modal, mostrar: "⚠️ N usuarios serán revalidados" si `cascade_affected_user_count > 0`
  - Si cascade_affected_user_count === 0: mensaje neutro

- [ ] [T-013] Tests de `GroupComposition.jsx` para cascade:
  - Sin impacto cascade → modal sin warning
  - Con impacto cascade N > 0 → modal muestra "N usuarios serán revalidados"

---

## Bloque V — GAP-3: ExceptionalPermission page (UC_PERM_03)

- [ ] [T-014] `accessGateway.js` — Agregar `grantExceptionalPermission(userId, payload)` → `POST /api/users/{userId}/exceptional-permissions/`

- [ ] [T-015] `access.js` — Agregar thunk `grantExceptionalPermission`

- [ ] [T-016] `mockInterceptor.js` — Agregar handler `POST /api/users/{id}/exceptional-permissions/` → `_handleGrantExceptionalPermission(url, body)`:
  - 422 si `!body.justification || justification.trim().length === 0`
  - 422 si `!body.expires_at`
  - 201 con payload de éxito incluyendo `supervisor_notified: true`, `audit_event: 'EXCEPTIONAL_PERMISSION_GRANTED'`

- [ ] [T-017] `src/pages/permissions/ExceptionalPermission.jsx` — Crear página:
  - Header: "Conceder Permiso Excepcional — UC_PERM_03"
  - Campos: `targetUserId` (text), `permissionCode` (select de allFunctions), `justification` (textarea, min 10 chars), `expiresAt` (date)
  - Validación anti-self: si `targetUserId === currentUserId` → banner rojo, submit bloqueado
  - Submit → dispatch grantExceptionalPermission
  - Success: banner con resumen de la concesión + `supervisor_notified: true` indicado
  - Error 403: "No puede concederse el permiso a sí mismo"
  - Error 422: mostrar detalle del error

- [ ] [T-018] `AppRouter.jsx` — Agregar lazy import + ruta `/permissions/exceptional-permission`:
  - permission: `FunctionCatalog.GRANT_EXCEPTIONAL`
  - Actualizar comentario de ruta `/permissions/temp-permissions` para clarificar que es UC_ACC_08

- [ ] [T-019] Tests de `ExceptionalPermission.jsx`:
  - Render campos
  - Validación anti-self (targetUserId === propio id) → banner error
  - Justificación vacía → submit deshabilitado
  - Submit exitoso → success banner con supervisor_notified
  - Error 422 → mensaje de error mostrado

---

## Bloque VI — GAP-4: RevokeExceptionalPermission page (UC-015)

- [ ] [T-020] `accessGateway.js` — Agregar:
  - `getExceptionalPermissions(userId)` → `GET /api/users/{userId}/exceptional-permissions/`
  - `revokeExceptionalPermission(userId, permissionId)` → `DELETE /api/users/{userId}/exceptional-permissions/{permissionId}/`

- [ ] [T-021] `access.js` — Agregar thunks `fetchExceptionalPermissions` y `revokeExceptionalPermission`

- [ ] [T-022] `mockInterceptor.js` — Agregar handlers:
  - `GET /api/users/{id}/exceptional-permissions/` → lista con 1-2 permisos mock
  - `DELETE /api/users/{id}/exceptional-permissions/{pid}/` → `{ revoked: true }`

- [ ] [T-023] `src/pages/permissions/RevokeExceptionalPermission.jsx` — Crear página:
  - Header: "Revocar Permiso Excepcional — UC-015"
  - Input para userId + botón "Buscar"
  - Tabla de permisos excepcionales activos: permission_code, justification, granted_by, expires_at
  - Botón "Revocar" con confirm modal ("¿Revocar permiso?")
  - On confirm → dispatch revokeExceptionalPermission
  - Success: recargar lista

- [ ] [T-024] `AppRouter.jsx` — Agregar lazy import + ruta `/permissions/revoke-exceptional`:
  - permission: `FunctionCatalog.REVOKE_EXCEPTIONAL`

- [ ] [T-025] Tests de `RevokeExceptionalPermission.jsx`:
  - Render inicial (sin userId)
  - Buscar userId → fetch y mostrar lista
  - Click Revocar → modal confirm
  - Confirmar revocación → lista actualizada

---

## Resumen de archivos por gap

| Gap | Archivos modificados | Archivos nuevos |
|-----|---------------------|-----------------|
| GAP-6 | ComplianceReport.jsx | — |
| GAP-1 | SeparationRulesValidator.jsx, mockInterceptor.js | (test) |
| GAP-2 | AssignGroup.jsx, access.js, accessGateway.js, mockInterceptor.js | — |
| GAP-5 | GroupComposition.jsx, accessGateway.js, mockInterceptor.js | — |
| GAP-3 | access.js, accessGateway.js, mockInterceptor.js, AppRouter.jsx | ExceptionalPermission.jsx, test |
| GAP-4 | access.js, accessGateway.js, mockInterceptor.js, AppRouter.jsx | RevokeExceptionalPermission.jsx, test |

**Total tareas: 25 (T-001..T-025)**
**Tests nuevos estimados: ~30-35**
