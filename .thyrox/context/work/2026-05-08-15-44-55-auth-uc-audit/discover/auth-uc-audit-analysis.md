```yml
created_at: 2026-05-08 15:45:58
project: IACT-UI
work_package: 2026-05-08-15-44-55-auth-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
version: 1.0.0
```

# Analysis — auth-uc-audit

## Objetivo

Auditoría de alineación UC→implementación para el módulo de autenticación.
5 UCs documentados en IACT-docs (feature/cnst-033-uml-conformance):
UC-AUTH-01..05. Fuente de verdad: `/tmp/references/IACT-docs/source/requisitos/casos-uso/auth/`.

## Contexto

- **Tests actuales:** 1841 passing / 214 suites (verificado 2026-05-08)
- **Branch:** `claude/project-analysis-N9IkV`
- **Metodología:** PAT-UC-AUDIT-001 aplicado (verificar AppRouter + src/pages/)

---

## Inventario de UCs — Estado

| UC | Nombre | Página | Ruta | Thunk Redux | Mock handler | Estado |
|----|--------|--------|------|-------------|--------------|--------|
| UC-AUTH-01 | Iniciar Sesión | `Login.jsx` (containers) | `/login` ✓ | `loginUser` ✓ | `_handleLogin` ✓ | **Parcial** |
| UC-AUTH-02 | Cerrar Sesión | Sin página dedicada | N/A | `logoutUser` ✓ | `_handleLogout` ✓ | **Parcial** |
| UC-AUTH-03 | Recuperar Contraseña | `RecoverPassword.jsx` ✓ | `/recover-password` ✓ | `recoverPassword` ✓ | **Sin handler** | **Parcial** |
| UC-AUTH-04 | Cambiar Contraseña | `ChangePassword.jsx` ✓ | `/change-password` ✓ | `changePassword` ✓ | **Sin handler** | **Parcial** |
| UC-AUTH-05 | Gestionar Sesiones | `ActiveSessions.jsx` ✓ | `/profile/sessions` ✓ | `fetchActiveSessions` + `revokeSession` ✓ | `_handleGetSessions` + `_handleRevokeSession` ✓ | **Parcial** |

**Todos los UCs existen a nivel de ruta y componente. Los gaps son de flujos y conectividad.**

---

## Análisis por UC

### UC-AUTH-01 — Iniciar Sesión

**Implementado:**
- `Login.jsx` (containers) renderiza `LoginForm` ✓
- `loginUser` thunk llama `POST /api/token/` ✓
- Mock handler retorna `user` data ✓
- `isAuthenticated` se setea en authSlice ✓
- Redirect a `/dashboard` post-login ✓

**GAP-AUTH-01-A: FA-01 no implementado — `next_step: "change_password"` ignorado**

El spec UC-AUTH-01 FA-01 define que cuando el backend retorna `next_step: "change_password"`
(usuario con `first_login=true`), el frontend debe redirigir a `/change-password` en lugar
de a `/dashboard`.

```js
// Login.jsx línea 18 — solo navega a /dashboard, sin condicional
navigate('/dashboard');
```

El mock handler de login tampoco simula el caso `first_login=true`. No hay test de este flujo.

**PROVEN** (verificado en Login.jsx:18, mockInterceptor:287-319)

**GAP-AUTH-01-B: Mock login handler no retorna `session_id` ni `warning`**

La spec CA-01 requiere que el response contenga `session.session_id` y `warning: null`.
El mock retorna solo `{ user: { id, username, ... } }` sin `session` ni `next_step`.
El authSlice guarda `action.payload` como `state.user` — si el backend real retorna
`{ user: {...}, session: {...}, next_step: null }`, el selector `state.auth.user` tendrá
estructura diferente a la que el componente espera.

**PROVEN** (verificado en mockInterceptor:288-302, authSlice:loginUser.fulfilled)

---

### UC-AUTH-02 — Cerrar Sesión

**Implementado:**
- `logoutUser` thunk llama `POST /api/logout/` ✓
- Limpia Redux state (user, isAuthenticated) ✓
- Llama `clearSession()` del sessionSlice ✓
- Mock handler `_handleLogout` existe ✓

**GAP-AUTH-02-A: Sin botón de logout visible en la UI**

No existe página ni componente dedicado con botón "Cerrar sesión". El thunk `logoutUser`
existe pero no hay ningún componente que lo invoque.

```bash
# grep de dispatch(logoutUser en todos los componentes
# → 0 resultados (PROVEN)
```

**PROVEN** (grep de `logoutUser` en src/ = 0 resultados fuera del slice)

**GAP-AUTH-02-B: FA-01 (idempotencia) y FA-02 son responsabilidad del backend**
No hay gap en frontend para estos flujos alternos — la idempotencia se gestiona en backend.

---

### UC-AUTH-03 — Recuperar Contraseña

**Implementado:**
- `RecoverPassword.jsx` renderiza form con campo username ✓
- Ruta `/recover-password` en AppRouter ✓
- Thunk `recoverPassword` en authSlice llama `POST /api/auth/recover-password/` ✓

**GAP-AUTH-03-A: Componente usa thunk local inline, NO el del authSlice**

`RecoverPassword.jsx` define su propia función local en vez de importar `recoverPassword` del authSlice:

```js
// RecoverPassword.jsx — línea 8-12 (thunk local)
const recoverPassword = (username) => async () => {
  const apiService = (await import('@api/apiClient')).default
  await apiService.post('/api/auth/recover-password/', { username })
}
```

Consecuencias: el loading/error state del authSlice no se actualiza, la acción no es
trazable en Redux DevTools, y el test actual mockea `useDispatch` en lugar del thunk real.

**PROVEN** (verificado en RecoverPassword.jsx:8-12)

**GAP-AUTH-03-B: Sin mock handler para `/api/auth/recover-password/`**

El mockInterceptor no tiene handler para `POST /api/auth/recover-password/`. En dev, la
llamada caerá en el bloque default del interceptor.

**PROVEN** (grep de `recover.password` en mockInterceptor = 0 resultados)

---

### UC-AUTH-04 — Cambiar Contraseña

**Implementado:**
- `ChangePassword.jsx` renderiza form con current/new/confirm password ✓
- `PasswordStrength` component integrado ✓
- Ruta `/change-password` en AppRouter ✓
- Thunk `changePassword` en authSlice ✓

**GAP-AUTH-04-A: Componente usa thunk local inline, NO el del authSlice**

Mismo patrón que UC-AUTH-03. `ChangePassword.jsx` define su propia función:

```js
// ChangePassword.jsx — línea 8-11 (thunk local)
const changePassword = ({ currentPassword, newPassword }) => async () => {
  const apiService = (await import('@api/apiClient')).default
  await apiService.post('/api/auth/change-password/', { currentPassword, newPassword })
}
```

El thunk del authSlice envía `current_password` (snake_case) pero el thunk local envía
`currentPassword` (camelCase) — potencial mismatch con el backend.

**PROVEN** (verificado en ChangePassword.jsx:8-11, auth.js:80-89)

**GAP-AUTH-04-B: Sin mock handler para `/api/auth/change-password/`**

Mismo problema que UC-AUTH-03. No hay handler en mockInterceptor.

**PROVEN** (grep de `change.password` en mockInterceptor = 0 resultados)

**GAP-AUTH-04-C: FA-01 (scope upgrade post first_login) no implementado**

Cuando el usuario cambia contraseña desde el flujo `first_login=true` (FA-01), el backend
retorna `next_step: "landing"` y `scope_upgraded: true`. El componente no lee ni actúa
sobre estos campos — navega siempre a `/dashboard` sin condicional.

**INFERRED** (depende de GAP-AUTH-01-A — el flujo first_login no está iniciado)

---

### UC-AUTH-05 — Gestionar Sesiones

**Implementado:**
- `ActiveSessions.jsx` conectado a Redux (fetchActiveSessions, revokeSession) ✓
- Ruta `/profile/sessions` ✓
- Mock handlers `_handleGetSessions` y `_handleRevokeSession` ✓
- Sub-flujo 3.A (listar) ✓ y 3.B (cerrar individual) ✓

**GAP-AUTH-05-A: Sub-flujo 3.C (cerrar TODAS las sesiones) sin UI**

El spec UC-AUTH-05 sub-flujo 3.C define "Cerrar todas las Sessions de un User".
El thunk `logoutAllSessions` existe en session.js, pero `ActiveSessions.jsx` no tiene
botón "Cerrar todas las sesiones".

**PROVEN** (grep de `logoutAllSessions` en componentes = 0 usos en UI)

**GAP-AUTH-05-B: LoginHistory.jsx usa datos hardcodeados — sin conexión a API**

`LoginHistory.jsx` tiene un array `mockHistory` hardcodeado con 3 entradas fijas.
No llama a ningún endpoint ni thunk Redux.

```js
// LoginHistory.jsx — línea 22-45
const mockHistory = [
  { id: '1', timestamp: ..., device: 'Chrome on MacOS', ... status: 'success' },
  ...
]
```

**PROVEN** (verificado en LoginHistory.jsx:22-45)

**GAP-AUTH-05-C: LoginHistory no tiene ruta en AppRouter**

`LoginHistory.jsx` existe como componente pero no tiene ruta asignada en AppRouter.
Tampoco está incluido en la vista de `/profile/sessions`.

**PROVEN** (grep de `LoginHistory` en AppRouter = 0 resultados)

---

## Resumen de gaps

| ID | UC | Descripción | Severidad | Tipo |
|----|-----|-------------|-----------|------|
| GAP-AUTH-01-A | AUTH-01 | FA-01 no implementado: `next_step: "change_password"` ignorado en Login.jsx | Alta | flujo-alterno |
| GAP-AUTH-01-B | AUTH-01 | Mock login no retorna estructura completa (`session_id`, `next_step`, `warning`) | Media | mock |
| GAP-AUTH-02-A | AUTH-02 | Sin botón de logout en la UI (thunk existe, no hay componente que lo invoque) | Alta | UI |
| GAP-AUTH-03-A | AUTH-03 | RecoverPassword usa thunk local, no el del authSlice | Media | conectividad |
| GAP-AUTH-03-B | AUTH-03 | Sin mock handler para `/api/auth/recover-password/` | Media | mock |
| GAP-AUTH-04-A | AUTH-04 | ChangePassword usa thunk local, no el del authSlice | Media | conectividad |
| GAP-AUTH-04-B | AUTH-04 | Sin mock handler para `/api/auth/change-password/` | Media | mock |
| GAP-AUTH-04-C | AUTH-04 | FA-01 scope upgrade no implementado (depende de GAP-AUTH-01-A) | Baja | flujo-alterno |
| GAP-AUTH-05-A | AUTH-05 | Sub-flujo 3.C "cerrar todas" sin UI (thunk existe en session.js) | Media | UI |
| GAP-AUTH-05-B | AUTH-05 | LoginHistory.jsx datos hardcodeados, sin conexión a API | Media | conectividad |
| GAP-AUTH-05-C | AUTH-05 | LoginHistory sin ruta en AppRouter | Media | routing |

**Total: 11 gaps** — 2 Alta, 7 Media, 2 Baja

---

## Criterios de éxito del WP

1. **UC-AUTH-01:** `next_step: "change_password"` redirige a `/change-password` en Login.jsx. Mock simula `first_login=true`.
2. **UC-AUTH-02:** Existe botón de logout accesible desde la UI (navbar o perfil).
3. **UC-AUTH-03:** RecoverPassword importa y usa el thunk del authSlice. Mock handler creado.
4. **UC-AUTH-04:** ChangePassword importa y usa el thunk del authSlice. Mock handler creado. Payload alineado (snake_case).
5. **UC-AUTH-05:** Botón "Cerrar todas las sesiones" en ActiveSessions. LoginHistory conectado a endpoint. Ruta para LoginHistory.
6. **Tests:** Todos los gaps cubiertos con tests. Suite verde ≥1841.

---

## Stopping Point Manifest

| SP | Fase | Tipo | Evento | Acción |
|----|------|------|--------|--------|
| SP-01 | 1→8 | gate-fase | Gate Phase 1 DISCOVER | Aprobación humana del análisis antes de planificar |
| SP-02 | 8→10 | gate-fase | Gate Phase 8 PLAN | Aprobación del task plan antes de ejecutar |
| SP-03 | 10→11 | gate-fase | Gate Phase 10 IMPLEMENT | Validación de que 1841+ tests verdes antes de track |
