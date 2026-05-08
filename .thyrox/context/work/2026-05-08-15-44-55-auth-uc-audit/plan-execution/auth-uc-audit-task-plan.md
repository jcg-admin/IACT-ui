```yml
created_at: 2026-05-08 15:58:59
project: IACT-UI
work_package: 2026-05-08-15-44-55-auth-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — auth-uc-audit

**SP-01 aprobado** · **SP-04 = Opción A** (LoginHistory → `/api/audit/logs?type=LOGIN&user=current`)
**13 gaps** · **15 tareas atómicas** · **7 bloques (DAG)**

---

## DAG de dependencias

```
Block I  (T-001, T-002) — first_login mock + Login.jsx redirect
    ↓
Block II (T-003, T-004) — RecoverPassword mock + thunk migration
    ↓
Block III (T-005, T-006, T-007) — ChangePassword mock + thunk migration + nav fix
    ↓
Block IV (T-008) — MainLayout + Header.jsx logout integration
    ↓
Block V  (T-009, T-010) — close-all endpoint fix + ActiveSessions button
    ↓
Block VI (T-011, T-012, T-013) — LoginHistory mock + auditSlice thunk + UI connect
    ↓
Block VII (T-014, T-015) — Login.jsx move containers → pages/auth/
```

Bloques II y III son paralelos respecto a Block I (independientes entre sí),
pero Block IV depende de I (mismo flujo de login). En la práctica ejecutar I→II→III→IV→V→VI→VII.

---

## Block I — first_login flow (GAP-AUTH-01-B, GAP-AUTH-01-A)

- [x] [T-001] **mockInterceptor.js** — Agregar respuesta variante `first_login: true` al handler `POST /api/token/`. Cuando el body incluye `username: "first_login_user"` (o flag de prueba), retornar `{ access: "...", refresh: "...", next_step: "change_password", first_login: true }`. Agregar datos de usuario `first_login_user` en `MOCK_USERS`. Tests: verificar que el handler retorna `next_step` cuando corresponde. *(GAP-AUTH-01-B)*

- [x] [T-002] **Login.jsx** — Leer `next_step` del payload de `loginUser` fulfilled. Si `next_step === "change_password"`, navegar a `/change-password` en lugar de `/dashboard`. Actualizar test en `containerComponents.test.jsx`: test case que verifica redirect a `/change-password` cuando `next_step: "change_password"`. *(GAP-AUTH-01-A)*

---

## Block II — RecoverPassword (GAP-AUTH-03-B, GAP-AUTH-03-A)

- [x] [T-003] **mockInterceptor.js** — Agregar handler `POST /api/auth/recover-password/`. Request body: `{ username }`. Response 200: `{ message: "Correo de recuperación enviado" }`. Response 404 si username desconocido: `{ error: "Usuario no encontrado" }`. *(GAP-AUTH-03-B)*

- [x] [T-004] **RecoverPassword.jsx** — Eliminar thunk local inline (`src/pages/auth/RecoverPassword.jsx:8-12`). Importar y usar `recoverPassword` de `authSlice`. Conectar al store con `useDispatch`. Actualizar `RecoverPasswordPage.test.jsx` para usar el thunk del slice (mock `authSlice`). *(GAP-AUTH-03-A)*

---

## Block III — ChangePassword (GAP-AUTH-04-B, GAP-AUTH-04-A, GAP-AUTH-04-C)

- [x] [T-005] **mockInterceptor.js** — Agregar handler `POST /api/auth/change-password/`. Request body: `{ current_password, new_password }`. Response 200: `{ message: "Contraseña actualizada", next_step: null }`. Response 400 si `current_password` inválido: `{ error: "Contraseña actual incorrecta" }`. *(GAP-AUTH-04-B)*

- [x] [T-006] **ChangePassword.jsx** — Eliminar thunk local inline (`src/pages/auth/ChangePassword.jsx:8-11`). Importar y usar `changePassword` de `authSlice`. Conectar al store con `useDispatch`. *(GAP-AUTH-04-A)*

- [x] [T-007] **ChangePassword.jsx** — Leer `next_step` / `scope_upgraded` del payload de `changePassword` fulfilled. Si `next_step` existe: navegar a esa ruta. Si no: navegar a `/dashboard`. Reemplazar `setTimeout(() => navigate('/dashboard'), 2000)` (línea 74) por navegación condicional. Actualizar `ChangePasswordPage.test.jsx`: (a) test que verifica navigate a `/dashboard` cuando `next_step` es null, (b) test que verifica navigate a ruta del `next_step` cuando está presente. *(GAP-AUTH-04-C)*

---

## Block IV — Logout en layout (GAP-AUTH-02-A)

- [x] [T-008] **MainLayout.jsx** — Importar `Header` desde `@ui/navigation/Header/Header`. Reemplazar el `<header>` simple actual por `<Header onLogout={() => dispatch(logoutUser())} />`. Importar `useDispatch` y `logoutUser`. Verificar que el menú de navegación existente se preserve (los links de nav que ya estaban en MainLayout pueden mantenerse dentro del Header o como siblings). Tests: verificar que `MainLayout` renderiza `Header` con la prop `onLogout`. *(GAP-AUTH-02-A)*

---

## Block V — Close-all sessions (GAP-AUTH-05-B, GAP-AUTH-05-A)

- [x] [T-009] **session.js** — Corregir endpoint de `logoutAllSessions` thunk: de `DELETE /auth/sessions/all` a `POST /api/users/{id}/close-all-sessions/`. El `id` del usuario viene del store (selector `selectCurrentUserId` o equivalente). Actualizar `sessionSlice.test.js` para mockear el endpoint correcto. *(GAP-AUTH-05-B)*

- [x] [T-010] **ActiveSessions.jsx** — Agregar botón "Cerrar todas las sesiones" que despache `logoutAllSessions()`. El botón debe aparecer solo cuando hay más de una sesión activa. Confirmar acción con dialog `window.confirm` antes de despachar. Actualizar `ActiveSessions.test.js`: test que verifica que el botón aparece cuando sessions.length > 1 y que llama al thunk al confirmar. *(GAP-AUTH-05-A)*

---

## Block VI — LoginHistory (GAP-AUTH-05-C)

- [ ] [T-011] **mockInterceptor.js** — Agregar handler `GET /api/audit/logs` con filtros `type=LOGIN` y `user=current`. Response: array de eventos `{ id, timestamp, ip_address, user_agent, status, location }`. Incluir al menos 3 entradas mock. *(GAP-AUTH-05-C · mock)*

- [ ] [T-012] **auditSlice.js** — Agregar thunk `fetchLoginHistory` que llama `auditGateway.getAuditLogs({ type: 'LOGIN', user: 'current' })`. Agregar estado `loginHistory`, `loginHistoryLoading`, `loginHistoryError` al slice. Agregar selectores `selectLoginHistory`, `selectLoginHistoryLoading`. Actualizar `auditSlice.test.js` con tests del nuevo thunk. *(GAP-AUTH-05-C · Redux)*

- [ ] [T-013] **LoginHistory.jsx** — Eliminar datos hardcoded. Conectar al store con `useSelector(selectLoginHistory)` y `useDispatch`. Despachar `fetchLoginHistory` en `useEffect`. Mostrar loading state. Actualizar `LoginHistory.test.js`: tests con store mock, verificar que dispatcha `fetchLoginHistory` y renderiza los datos del store. *(GAP-AUTH-05-C · UI)*

---

## Block VII — Estructura Login.jsx (GAP-AUTH-STRUCT)

- [ ] [T-014] **git mv** — Mover `src/components/containers/Login.jsx` → `src/pages/auth/Login.jsx`. Actualizar imports internos si los hay. El test en `containerComponents.test.jsx` que importa desde `../Login` debe actualizarse para importar desde `@screens/auth/Login`. Crear `src/pages/auth/__tests__/Login.test.jsx` con los tests migrados desde `containerComponents.test.jsx` (la sección `describe('Login', ...)`). *(GAP-AUTH-STRUCT · move)*

- [ ] [T-015] **AppRouter.jsx** — Actualizar import lazy: `import('@ui/containers/Login')` → `import('@screens/auth/Login')`. Verificar que la ruta `/login` sigue funcionando. *(GAP-AUTH-STRUCT · router)*

---

## Criterios de completación

- [ ] Todas las tareas T-001..T-015 en `[x]`
- [ ] `npm test -- --watchAll=false` pasa sin failures (baseline: 1841 tests)
- [ ] 0 regressions en suites existentes de auth, session, audit
- [ ] Todos los cambios commiteados (1 commit por bloque mínimo)
- [ ] `now.md::phase` = `Phase 10` al iniciar implementación

---

## Notas de implementación

**T-008 (MainLayout):** Verificar el HTML actual de `<header>` en MainLayout antes de reemplazar —
los links de navegación deben preservarse. Si Header.jsx no acepta children de nav, podría
necesitar refactor del componente. Leer Header.jsx completo antes de editar MainLayout.

**T-009 (endpoint fix):** Verificar cómo acceder al userId del usuario actual en session.js —
puede venir de `rootState.auth.user.id`. Si no existe selector, usar `getState().auth.user?.id`.

**T-014 (git mv):** PAT-GIT-001 — después del `git mv`, correr `git status` antes del commit.
Los Edits posteriores al archivo renombrado aparecen como "modified" unstaged — hacer
`git add src/pages/auth/Login.jsx` explícito antes del commit.
