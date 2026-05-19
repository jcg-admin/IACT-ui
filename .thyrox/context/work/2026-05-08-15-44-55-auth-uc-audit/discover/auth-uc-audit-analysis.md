```yml
created_at: 2026-05-08 15:45:58
project: IACT-UI
work_package: 2026-05-08-15-44-55-auth-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
version: 2.0.0
```

# Analysis — auth-uc-audit

## Objetivo

Auditoría de alineación UC→implementación para el módulo de autenticación.
5 UCs documentados en IACT-docs (feature/cnst-033-uml-conformance):
UC-AUTH-01..05. Fuente de verdad: `/tmp/references/IACT-docs/source/requisitos/casos-uso/auth/`.

## Contexto

- **Tests actuales:** 1841 passing / 214 suites (verificado 2026-05-08)
- **Branch:** `claude/project-analysis-N9IkV`
- **Metodología:** PAT-UC-AUDIT-001 aplicado (verificar AppRouter + src/pages/ + componentes de layout)

---

## Inventario de UCs — Estado

| UC | Nombre | Página | Ruta | Thunk Redux | Mock handler | Estado |
|----|--------|--------|------|-------------|--------------|--------|
| UC-AUTH-01 | Iniciar Sesión | `Login.jsx` (containers) | `/login` ✓ | `loginUser` ✓ | `_handleLogin` ✓ | **Parcial** |
| UC-AUTH-02 | Cerrar Sesión | Sin página dedicada (botón en Header) | N/A | `logoutUser` ✓ | `_handleLogout` ✓ | **Parcial** |
| UC-AUTH-03 | Recuperar Contraseña | `RecoverPassword.jsx` ✓ | `/recover-password` ✓ | `recoverPassword` ✓ | **Sin handler** | **Parcial** |
| UC-AUTH-04 | Cambiar Contraseña | `ChangePassword.jsx` ✓ | `/change-password` ✓ | `changePassword` ✓ | **Sin handler** | **Parcial** |
| UC-AUTH-05 | Gestionar Sesiones | `ActiveSessions.jsx` ✓ | `/profile/sessions` ✓ | `fetchActiveSessions` + `revokeSession` ✓ | `_handleGetSessions` + `_handleRevokeSession` ✓ | **Parcial** |

**Todos los UCs existen a nivel de ruta y componente. Los gaps son de flujos, conectividad y wiring.**

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

Spec UC-AUTH-01 FA-01 (PASO 13A): cuando el backend retorna `next_step: "change_password"`
(usuario con `first_login=true`), el frontend debe redirigir a `/change-password` en lugar
de a `/dashboard`. `Login.jsx:18` no lee `next_step`:

```js
// Login.jsx:18 — navega siempre a /dashboard sin condicional
navigate('/dashboard');
```

El mock `_handleLogin` tampoco simula `first_login=true` ni retorna `next_step`.
No hay test de este flujo.

**PROVEN** (verificado en Login.jsx:18, mockInterceptor:287-319)

**Nota dependencia de backend:** El mock es la única representación del backend disponible
en este repo. El mock no implementa `first_login=true`. Ambos deben actualizarse juntos:
mock primero (simula el caso), luego Login.jsx (consume el campo). Sin el mock, el flujo
no es testeable en dev.

**GAP-AUTH-01-B: Mock login handler no retorna estructura completa**

Spec CA-01 requiere que el response contenga `session.session_id`, `next_step: null` y
`warning: null`. El mock retorna solo `{ user: { id, username, ... } }`.

**PROVEN** (verificado en mockInterceptor:288-302)

---

### UC-AUTH-02 — Cerrar Sesión

**Spec (flujo-principal PASO 1):** "Click en botón **Cerrar sesión** del header o menu
de usuario". El logout pertenece al **header/user-menu**, no a una página dedicada.

**Implementado:**
- `logoutUser` thunk llama `POST /api/logout/` + limpia Redux + llama `clearSession()` ✓
- `_handleLogout` mock handler ✓
- `Header.jsx` (`src/components/navigation/Header/Header.jsx`) tiene un botón "Logout"
  visible en el user-dropdown — estructura correcta ✓

**GAP-AUTH-02-A: `Header.jsx` recibe `onLogout` pero nunca se le pasa `logoutUser`**

`Header.jsx` acepta `onLogout` como prop y lo asigna al botón "Logout". El default es
`() => {}`. Ningún componente que renderiza `Header` lo conecta a `logoutUser`:

```jsx
// Header.jsx:27 — prop default vacío
onLogout = () => {},

// Header.jsx:60 — botón conectado a onLogout
<button onClick={onLogout} className="logoutButton">Logout</button>
```

`MainLayout.jsx` — el layout real de la aplicación — **no usa `Header.jsx`**. Tiene su
propio `<header>` simple sin botón de logout ni user-menu.

Hay dos problemas distintos:
1. `Header.jsx` existe pero `onLogout` no está conectado a `logoutUser` en ningún parent
2. `MainLayout.jsx` no usa `Header.jsx` — los usuarios autenticados ven el layout simple

La solución canónica según spec es: conectar `Header.jsx` a `MainLayout.jsx` y pasar
`onLogout={()=>dispatch(logoutUser())}`.

**PROVEN** (verificado en MainLayout.jsx:1-70, Header.jsx:27 y 60, AppRouter.jsx)

**GAP-AUTH-02-B: Logout no redirige a `/login` post-logout**

Spec PASO 11: `navigate('/login')` después de logout. `logoutUser.fulfilled` en authSlice
limpia el estado pero no dispara ninguna navegación. El redirect depende de que `AuthGuard`
detecte `isAuthenticated=false` y redirija — funciona indirectamente pero no es explícito
como requiere la spec.

**INFERRED** — `AuthGuard` en AppRouter.jsx:244 sí redirige a `/login` si no autenticado,
por lo que el comportamiento observable puede ser correcto. Requiere test E2E para confirmar.

---

### UC-AUTH-03 — Recuperar Contraseña

**Implementado:**
- `RecoverPassword.jsx` renderiza form con campo username ✓
- Ruta `/recover-password` en AppRouter ✓
- Thunk `recoverPassword` en authSlice llama `POST /api/auth/recover-password/` ✓

**GAP-AUTH-03-A: Componente usa thunk local inline, no el del authSlice**

`RecoverPassword.jsx:8-12` define su propia función en lugar de importar el thunk:

```js
// RecoverPassword.jsx:8-12 — thunk local (INCORRECTO)
const recoverPassword = (username) => async () => {
  const apiService = (await import('@api/apiClient')).default
  await apiService.post('/api/auth/recover-password/', { username })
}
// authSlice tiene: export const recoverPassword = createAsyncThunk(...)
```

Consecuencias: `state.auth.isLoading` no refleja la operación, errores no llegan a
`state.auth.error`, la acción no aparece en Redux DevTools.

**PROVEN** (verificado en RecoverPassword.jsx:8-12, auth.js:64-75)

**GAP-AUTH-03-B: Sin mock handler para `POST /api/auth/recover-password/`**

`mockInterceptor.js` no tiene handler para este endpoint. En dev la llamada cae en el
bloque default y retorna error 404.

**PROVEN** (grep `recover.password` en mockInterceptor = 0 resultados)

---

### UC-AUTH-04 — Cambiar Contraseña

**Implementado:**
- `ChangePassword.jsx` renderiza form con current/new/confirm password ✓
- `PasswordStrength` component integrado ✓
- Ruta `/change-password` ✓
- Thunk `changePassword` en authSlice ✓

**GAP-AUTH-04-A: Componente usa thunk local inline, no el del authSlice**

`ChangePassword.jsx:8-11` mismo patrón que UC-AUTH-03. Adicionalmente hay un mismatch
de campo: el thunk local envía `currentPassword` (camelCase) pero el authSlice envía
`current_password` (snake_case, correcto para Django DRF).

```js
// ChangePassword.jsx:8-11 — thunk local + camelCase incorrecto
const changePassword = ({ currentPassword, newPassword }) => async () => {
  await apiService.post('/api/auth/change-password/', { currentPassword, newPassword })
  // ↑ camelCase — Django DRF espera current_password, new_password
}
// authSlice:80-89 tiene:
await apiService.post('/api/auth/change-password/', {
  current_password: currentPassword,  // snake_case correcto
  new_password: newPassword,
})
```

**PROVEN** (verificado en ChangePassword.jsx:8-11, auth.js:80-89)

**GAP-AUTH-04-B: Sin mock handler para `POST /api/auth/change-password/`**

Mismo problema que UC-AUTH-03. `mockInterceptor.js` no tiene handler.

**PROVEN** (grep `change.password` en mockInterceptor = 0 resultados)

**GAP-AUTH-04-C: FA-01 (scope upgrade post first_login) no implementado — PROVEN**

`ChangePassword.jsx:74` navega siempre a `/dashboard` sin leer `next_step` ni
`scope_upgraded`:

```js
// ChangePassword.jsx:74
setTimeout(() => navigate('/dashboard'), 2000)
```

Spec FA-01 PASO 14A: response incluye `"next_step": "landing"` y `"scope_upgraded": true`.
El componente no lee ni actúa sobre estos campos. Este es un hecho del código actual,
independientemente de GAP-AUTH-01-A.

**PROVEN** (verificado en ChangePassword.jsx:74 — sin lectura de response)

---

### UC-AUTH-05 — Gestionar Sesiones

**Implementado:**
- `ActiveSessions.jsx` conectado a Redux ✓, ruta `/profile/sessions` ✓
- Sub-flujo 3.A (listar) ✓ y 3.B (cerrar individual) ✓
- Mock handlers `_handleGetSessions` + `_handleRevokeSession` ✓

**GAP-AUTH-05-A: Sub-flujo 3.C "cerrar todas las sesiones" sin UI**

Spec sub-flujo 3.C: cierre masivo de sesiones de un user. Endpoint:
`POST /api/users/{id}/close-all-sessions/` (verificado en
`uc-auth-05/flujo-principal.rst:103`). El thunk `logoutAllSessions` en `session.js:362`
llama a `DELETE /auth/sessions/all` (endpoint distinto al spec — requiere alineación).
`ActiveSessions.jsx` no tiene botón "Cerrar todas".

**PROVEN** (verificado en ActiveSessions.jsx, session.js:362, flujo-principal.rst:103)

**GAP-AUTH-05-B: `LoginHistory.jsx` datos hardcodeados sin conexión a API**

`LoginHistory.jsx:22-45` tiene array `mockHistory` con 3 entradas fijas. No existe
endpoint definido para historial de login en `uc-auth-05/implementacion-tecnica.rst` —
UC-AUTH-05 solo cubre `GET /api/auth/sessions/`, `POST close`, `POST close-all`.

El historial de intentos de login (eventos `LOGIN`/`LOGOUT_FAILED`) corresponde al
módulo de **auditoría**, no al módulo de gestión de sesiones. `LoginHistory.jsx` no
tiene spec de respaldo en los UCs de auth — es un componente especulativo sin UC
propietario identificado. Endpoint más probable: `GET /api/audit/events/?type=LOGIN`
pero no está especificado en ningún UC de auth. Requiere verificación contra UCs de
audit antes de conectar.

**PROVEN** (verificado en LoginHistory.jsx:22-45, uc-auth-05 implementacion-tecnica)

**GAP-AUTH-05-C: `LoginHistory.jsx` sin ruta en AppRouter**

`LoginHistory.jsx` existe en `SessionManagement/` pero no tiene ruta asignada ni está
incluido en la vista de `/profile/sessions`.

**PROVEN** (grep `LoginHistory` en AppRouter.jsx = 0 resultados)

---

### GAP adicional — Login.jsx en `containers/` vs `src/pages/`

`Login.jsx` vive en `src/components/containers/Login.jsx` y AppRouter lo importa como
`@ui/containers/Login`. El WP `systemic-naming-violations` movió todas las páginas a
`src/pages/` con la convención `@screens/`. `Login.jsx` quedó excluido de ese WP —
el naming anterior era `LoginPage.jsx` y fue omitido o tratado como componente, no página.

Impacto: inconsistencia estructural. La página de login es la única página en
`containers/` en lugar de `src/pages/auth/`.

**PROVEN** (verificado en AppRouter.jsx:38, src/pages/auth/ = sin Login.jsx)

---

## Resumen de gaps — 12 gaps totales

| ID | UC | Descripción | Severidad | Tipo | PROVEN/INFERRED |
|----|-----|-------------|-----------|------|-----------------|
| GAP-AUTH-01-A | AUTH-01 | `next_step: "change_password"` ignorado en Login.jsx — siempre navega a `/dashboard` | Alta | flujo-alterno | PROVEN |
| GAP-AUTH-01-B | AUTH-01 | Mock login no retorna estructura completa (`session_id`, `next_step`, `warning`) | Media | mock | PROVEN |
| GAP-AUTH-02-A | AUTH-02 | `Header.jsx` tiene botón logout pero `onLogout` no conectado a `logoutUser`. `MainLayout.jsx` no usa `Header.jsx` | Alta | wiring + layout | PROVEN |
| GAP-AUTH-02-B | AUTH-02 | Post-logout no navega explícitamente a `/login` (AuthGuard lo cubre indirectamente) | Baja | flujo | INFERRED |
| GAP-AUTH-03-A | AUTH-03 | `RecoverPassword.jsx` usa thunk local inline, no el del authSlice | Media | conectividad | PROVEN |
| GAP-AUTH-03-B | AUTH-03 | Sin mock handler para `POST /api/auth/recover-password/` | Media | mock | PROVEN |
| GAP-AUTH-04-A | AUTH-04 | `ChangePassword.jsx` usa thunk local inline + payload camelCase incorrecto | Media | conectividad | PROVEN |
| GAP-AUTH-04-B | AUTH-04 | Sin mock handler para `POST /api/auth/change-password/` | Media | mock | PROVEN |
| GAP-AUTH-04-C | AUTH-04 | `ChangePassword.jsx:74` navega siempre a `/dashboard` sin leer `next_step`/`scope_upgraded` | Baja | flujo-alterno | PROVEN |
| GAP-AUTH-05-A | AUTH-05 | Sub-flujo 3.C "cerrar todas" sin UI. Endpoint mock usa `DELETE /auth/sessions/all` en vez de `POST /api/users/{id}/close-all-sessions/` | Media | UI + endpoint | PROVEN |
| GAP-AUTH-05-B | AUTH-05 | `LoginHistory.jsx` datos hardcodeados. Endpoint no definido en UCs de auth — pertenece a módulo audit | Media | conectividad + scope | PROVEN |
| GAP-AUTH-05-C | AUTH-05 | `LoginHistory.jsx` sin ruta en AppRouter | Media | routing | PROVEN |
| GAP-AUTH-STRUCT | AUTH-01 | `Login.jsx` en `containers/` en vez de `src/pages/auth/` — inconsistencia estructural del WP anterior | Baja | estructura | PROVEN |

**Total: 13 gaps** — 2 Alta, 8 Media, 3 Baja. **12 PROVEN, 1 INFERRED.**

---

## DAG de dependencias entre gaps

```
GAP-AUTH-01-B ──┐
                ├──► GAP-AUTH-01-A ──► GAP-AUTH-04-C
GAP-AUTH-03-A ──┐
GAP-AUTH-03-B ──┘  (independientes entre sí, van juntos)

GAP-AUTH-04-A ──┐
GAP-AUTH-04-B ──┘  (independientes entre sí, van juntos)

GAP-AUTH-02-A          (independiente)
GAP-AUTH-02-B          (independiente — baja prioridad, AuthGuard ya cubre)

GAP-AUTH-05-A          (independiente)
GAP-AUTH-05-B ──┐
GAP-AUTH-05-C ──┘  (van juntos — LoginHistory fuera de scope auth UCs)

GAP-AUTH-STRUCT        (independiente, puede ir al final)
```

**Bloques de ejecución propuestos:**

| Bloque | Gaps | Descripción |
|--------|------|-------------|
| I | AUTH-01-B + AUTH-01-A | Mock first_login + Login redirect condicional |
| II | AUTH-03-A + AUTH-03-B | RecoverPassword → authSlice + mock handler |
| III | AUTH-04-A + AUTH-04-B + AUTH-04-C | ChangePassword → authSlice + mock + navigate |
| IV | AUTH-02-A | Header.jsx wiring en MainLayout + onLogout → logoutUser |
| V | AUTH-05-A | "Cerrar todas" botón en ActiveSessions + endpoint alignment |
| VI | AUTH-05-B + AUTH-05-C | LoginHistory — decisión de scope + handler si aplica |
| VII | AUTH-STRUCT | Mover Login.jsx a `src/pages/auth/` |

---

## Criterios de éxito del WP

1. **AUTH-01:** Login con `first_login=true` redirige a `/change-password`. Mock simula el caso.
2. **AUTH-02:** `MainLayout.jsx` usa `Header.jsx`. `onLogout` conectado a `dispatch(logoutUser())`.
3. **AUTH-03:** `RecoverPassword.jsx` importa y usa `recoverPassword` del authSlice. Mock handler creado.
4. **AUTH-04:** `ChangePassword.jsx` importa y usa `changePassword` del authSlice (snake_case). Mock handler creado. Navigate lee `next_step`.
5. **AUTH-05:** Botón "Cerrar todas las sesiones" en ActiveSessions. Endpoint alineado con spec (`POST /api/users/{id}/close-all-sessions/`). Decisión documentada sobre LoginHistory.
6. **STRUCT:** `Login.jsx` movido a `src/pages/auth/Login.jsx`. AppRouter actualizado a `@screens/auth/Login`.
7. **Tests:** Suite ≥1841 green. Nuevos tests cubren: first_login flow, logout button, thunk connections.

---

## Stopping Point Manifest

| SP | Fase | Tipo | Evento | Acción |
|----|------|------|--------|--------|
| SP-01 | 1→8 | gate-fase | Gate Phase 1 DISCOVER | Aprobación humana del análisis antes de planificar |
| SP-02 | 8→10 | gate-fase | Gate Phase 8 PLAN | Aprobación del task plan antes de ejecutar |
| SP-03 | 10→11 | gate-fase | Gate Phase 10 IMPLEMENT | Validación de ≥1841 tests verdes antes de track |
| SP-04 | Bloque VI | gate-decision | Scope de LoginHistory | Decidir: implementar con endpoint audit, stub vacío, o excluir del WP |
