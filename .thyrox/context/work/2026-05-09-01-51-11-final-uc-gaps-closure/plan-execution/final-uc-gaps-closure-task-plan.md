```yml
created_at: 2026-05-09 01:51:11
project: THYROX
work_package: 2026-05-09-01-51-11-final-uc-gaps-closure
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — final-uc-gaps-closure

Orden: T-001 → T-002 → T-003 → T-004

---

## Block I — UC_USR_05+06: tests block/unblock

- [x] [T-001] Crear `src/pages/users/UserManagement/__tests__/BlockUnblock.test.jsx`:
  - Mock `userGateway` con `blockUser: jest.fn()` y `unblockUser: jest.fn()`
  - Mock `UserManagement` facade (UserIdentity, ReportExporter, notificationGateway)
  - Fixture: `ACTIVE_USER = { id: 1, username: 'ana', state: 'ACTIVE' }`
             `BLOCKED_USER = { id: 2, username: 'bob', state: 'BLOCKED' }`
  - Tests de UserList directamente (con onBlock/onUnblock props):
    - `renders Bloquear button for ACTIVE user, not for BLOCKED`
    - `renders Desbloquear button for BLOCKED user, not for ACTIVE`
    - `Bloquear click opens modal with user name`
    - `Confirmar in block modal calls onBlock(userId)`
    - `Desbloquear click opens modal with user name`
    - `Confirmar in unblock modal calls onUnblock(userId)`
    - `Cancelar in modal does not call onBlock/onUnblock`

---

## Block II — UC_USR_07: tests Profile.jsx

- [x] [T-002] Crear `src/pages/__tests__/ProfilePage.test.jsx`:
  - Mock `src/services/userGateway`:
    ```js
    getMyProfile: jest.fn().mockResolvedValue({
      id: 1, username: 'testuser', first_name: 'Test', last_name: 'User',
      email: 'test@example.com',
      notification_preferences: { email_notifications: true, push_notifications: false }
    })
    updateMyProfile: jest.fn().mockResolvedValue({ success: true })
    ```
  - Tests:
    - `renders profile form with user data on mount`
    - `shows first_name, last_name, email fields`
    - `does NOT render password or username field`
    - `submit calls updateMyProfile with form values`
    - `shows success message on save`
    - `shows error message when updateMyProfile rejects`
    - `notification checkbox toggles correctly`

---

## Block III — UC_ACC_06/07: improve Segments test

- [x] [T-003] Expandir tests de `Segments` en `remainingAccessPages.test.jsx`:
  - Tests adicionales (la implementación es estática — testar el contenido):
    - `renders at least one segment in the list`
    - `shows segment code and name`
    - `renders hierarchical structure (child segments visible)`
    - `shows userCount for each segment`

---

## Block IV — GAP-PERM-02: RevokeGroup warnings modal + double-confirm

- [x] [T-004] Agregar mock handler en `src/mocks/mockInterceptor.js`:
  - Ruta ANTES del catch-all de users:
    `GET /api/users/{userId}/access-groups/{groupId}/preview-revoke/`
  - Handler `_handlePreviewRevoke(url)`:
    - `groupId === '10'` (admins_group — predefinido) → warnings con critical:
      ```js
      { functions_to_revoke: ['create_users','delete_users','block_users'],
        functions_remaining: 0,
        warnings: { critical_revoked: ['create_users','delete_users'], no_functions: true } }
      ```
    - Otros groupIds → sin warnings:
      ```js
      { functions_to_revoke: ['view_reports'],
        functions_remaining: 5,
        warnings: { critical_revoked: [], no_functions: false } }
      ```

- [x] [T-005] Reescribir `src/pages/permissions/RevokeGroup.jsx`:
  - Agregar states: `previewData = null`, `showModal = false`, `confirmLiteral = ''`,
    `previewLoading = false`, `previewError = null`
  - Botón "Verificar impacto" (habilitado cuando userId + groupId + revokeReason válidos):
    - GET `/api/users/{userId}/access-groups/{groupId}/preview-revoke/`
    - Si OK → setPreviewData(data) + setShowModal(true)
    - Si error → setPreviewError(msg)
  - Modal de preview cuando `showModal === true`:
    - Título: "Impacto de revocación"
    - Lista `functions_to_revoke` (badges)
    - Contador: `{functions_remaining} funciones restantes tras revocación`
    - Si `warnings.no_functions === true` → alerta roja "El usuario perderá TODAS sus funciones"
    - Si `warnings.critical_revoked.length > 0`:
      - alerta naranja: "Funciones críticas afectadas: {lista}"
      - Input: `placeholder="Escribe REVOCAR para confirmar"`, `aria-label="Confirmación literal"`
      - Botón Confirmar deshabilitado hasta `confirmLiteral === 'REVOCAR'`
    - Si sin warnings críticos → Confirmar habilitado directamente
    - Botón Cancelar → cerrar modal, resetear confirmLiteral
  - Confirmar en modal → dispatch `revokeGroupFromUser` → cerrar modal en success

- [x] [T-006] Actualizar `src/pages/permissions/__tests__/RevokeGroupPage.test.jsx`:
  - Mock `accessGateway.previewRevoke` o usar fetch mock para el GET preview
  - Test: `Verificar impacto button disabled when reason < 10 chars`
  - Test: `clicking Verificar impacto calls preview endpoint`
  - Test: `modal renders functions_to_revoke list`
  - Test: `modal confirm button disabled until typing REVOCAR for critical warnings`
  - Test: `dispatches revokeGroupFromUser when confirming without critical warnings`

---

## Commits esperados

| Bloque | Commit subject |
|--------|---------------|
| I+II+III | Add tests for UC_USR_05/06/07 and ACC_06/07 |
| IV | Add RevokeGroup composition preview modal (UC_PERM_02) |
