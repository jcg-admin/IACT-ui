```yml
created_at: 2026-05-08 18:00:00
project: IACT-UI
work_package: 2026-05-08-15-44-55-auth-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — auth-uc-audit

## Added

- `src/mocks/mockInterceptor.js` — handler `POST /api/auth/recover-password/`
  returns `{ message: "Correo de recuperación enviado" }` (200) or
  `{ error: "Usuario no encontrado" }` (404) (T-003)
- `src/mocks/mockInterceptor.js` — handler `POST /api/auth/change-password/`
  returns `{ message: "Contraseña actualizada", next_step: null }` (200) or
  `{ error: "Contraseña actual incorrecta" }` (400) (T-005)
- `src/mocks/mockInterceptor.js` — `first_login_user` credentials in
  `MOCK_USERS`; `_handleLogin` returns `next_step: 'change_password'` when
  username matches (T-001)
- `src/mocks/mockInterceptor.js` — handler `GET /api/audit/logs` with
  query-param filter (`type=LOGIN`); returns 3 mock login events with
  `{ id, timestamp, ip_address, user_agent, status, location }` (T-011)
- `src/pages/auth/Login.jsx` — new location after `git mv` from
  `src/components/containers/Login.jsx` (T-014)
- `src/pages/auth/__tests__/Login.test.jsx` — 4 tests: render, navigation to
  `/dashboard`, navigation to `/change-password` when `next_step` is set,
  error display (T-014)
- `src/redux/slices/audit.js` — `fetchLoginHistory` async thunk calling
  `auditService.getAuditLogs({ type: 'LOGIN', user: 'current' })`; state
  fields `loginHistory`, `loginHistoryLoading`, `loginHistoryError`;
  selectors `selectLoginHistory`, `selectLoginHistoryLoading` (T-012)
- `src/components/features/SessionManagement/ActiveSessions.jsx` — "Cerrar
  todas las sesiones" button visible when `sessions.length > 1`, requires
  `window.confirm` before dispatching `logoutAllSessions()` (T-010)

## Changed

- `src/pages/auth/Login.jsx` — `handleLogin` reads `result?.next_step` from
  `.unwrap()`; navigates to `/change-password` if `next_step === 'change_password'`,
  otherwise to `/dashboard` (T-002)
- `src/pages/auth/RecoverPassword.jsx` — removed local inline async thunk;
  now imports and dispatches `recoverPassword` from `@store/slices/auth`
  with `.unwrap()` for error propagation (T-004)
- `src/pages/auth/ChangePassword.jsx` — removed local inline async thunk;
  now imports and dispatches `changePassword` from `@store/slices/auth`;
  navigation reads `result?.next_step || '/dashboard'` from `.unwrap()`
  result (T-006, T-007)
- `src/components/MainLayout.jsx` — imports `Header` from
  `@ui/navigation/Header/Header`; wires `onLogout={() => dispatch(logoutUser())}`;
  nav menu moved to sibling `<nav className="app-nav">` element; adds
  `useDispatch`, `useSelector`, `selectUser` (T-008)
- `src/redux/slices/session.js` — `logoutAllSessions` endpoint corrected from
  `DELETE /auth/sessions/all` to `POST /api/users/{id}/close-all-sessions/`;
  `id` read from `getState().auth?.user?.id` (T-009)
- `src/components/features/SessionManagement/LoginHistory.jsx` — hardcoded
  data and local state replaced with `useSelector(selectLoginHistory)` +
  `useSelector(selectLoginHistoryLoading)`; dispatches `fetchLoginHistory()`
  in `useEffect` (T-013)
- `src/router/AppRouter.jsx` — lazy import updated from
  `import('@ui/containers/Login')` to `import('@screens/auth/Login')` (T-015)

## Fixed

- `src/app/App.test.jsx` — added `Header` mock and `auth` reducer to
  `createTestStore`; MainLayout now calls `useSelector` which requires auth
  state in test store (regression from T-008)
- `src/components/features/__tests__/featuresComponents.test.jsx` — wrapped
  `LoginHistory` render with `Provider` + minimal `audit` store; added
  `jest.mock('@store/slices/audit')` (regression from T-013)
- `tests/integration/login.integration.test.js` — updated import path from
  `../../src/components/containers/Login` to `../../src/pages/auth/Login`
  (regression from T-014)

## Status de promoción a CHANGELOG.md raíz

Pendiente hasta merge a `main`. Entradas relevantes: Added (mockInterceptor
handlers, Login.jsx new location, auditSlice login history), Changed (4 auth
page migrations, MainLayout Header integration, session endpoint fix,
LoginHistory connected to store).
