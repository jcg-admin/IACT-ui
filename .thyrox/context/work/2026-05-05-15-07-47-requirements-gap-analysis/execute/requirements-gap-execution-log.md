```yml
created_at: 2026-05-05 16:07:43
updated_at: 2026-05-05 16:42:24
project: IACT-UI
work_package: 2026-05-05-15-07-47-requirements-gap-analysis
phase: Phase 10 — IMPLEMENT
author: claude
status: En progreso
```

# Execution Log — Requirements Gap Implementation

## Sprint 1 — Quick wins: wiring de rutas

| Tarea | Estado | Commit |
|-------|--------|--------|
| T-001 FunctionCatalog — constantes faltantes | ✅ Completo | 03e00f9 |
| T-002 Ruta pública /login | ✅ Completo | 03e00f9 |
| T-003 Logout en DashboardLayout | ✅ Completo | 03e00f9 |
| T-004 Ruta /profile/sessions | ✅ Completo | 03e00f9 |
| T-005 Ruta /users protegida | ✅ Completo | 03e00f9 |
| T-006 Ruta /reports protegida | ✅ Completo | 03e00f9 |

### Decisiones Sprint 1

- **`PublicOnlyRoute` + `AuthGuard`** — En lugar de reusar el `ProtectedRoute`
  existente, se crearon dos guardas separadas con responsabilidades claras:
  `PublicOnlyRoute` redirige a `/dashboard` si ya está autenticado (evitar
  que usuarios logueados accedan a `/login`); `AuthGuard` redirige a `/login`
  con `state: { from: location }` para retornar al origen post-login.
- **`isAuthenticated`** — Se usa `selectIsAuthenticated` de `src/redux/selectors.js`
  (selector ya existente con `createSelector`), no acceso directo al store.
- **FunctionCatalog:** Se agregaron `MANAGE_USERS`, `MANAGE_GROUPS`,
  `MANAGE_CATALOG`, `VIEW_LOGS`, `VIEW_REALTIME_METRICS`, `SUPER_ADMIN`.
  `MANAGE_SOD` → `MANAGE_SEPARATION_RULES` en el mismo commit (RBAC v5.2.1).

---

## Sub-WP: rbac-naming-refactor (2026-05-05-16-31-59)

Refactor disparado durante Sprint 1: `validateSoD` viola estándar v5.2.1.
WP separado, cerrado en Phase 11. Ver changelog en su WP.

| Cambio | Archivo | Commit |
|--------|---------|--------|
| `validateSoD` → `validateSeparationRules` | accessService + accessSlice | 1084155 |
| `sodConflicts` → `separationConflicts` | accessSlice (state + selector) | 1084155 |
| `MANAGE_SOD` → `MANAGE_SEPARATION_RULES` | catalog.js | 1084155 |
| `SoDValidator.jsx` → `SeparationRulesValidator.jsx` | components/access/ | 7efe451 |
| `SoDValidation.jsx` → `SeparationRulesValidation.jsx` | transaction/content/ | 7efe451 |
| `SoDManagementPage.jsx` → `SeparationRulesPage.jsx` | pages/access/ | 7efe451 |
| Strings UI "SoD" eliminados | SeparationRulesPage, AssignFunctionsPage | 7efe451 |

---

## Sprint 2 — Datos reales

| Tarea | Estado | Commit |
|-------|--------|--------|
| T-010 userService.js (TDD) | ✅ Completo | b0b04d4 |
| T-011 userSlice con thunks (TDD) | ✅ Completo | b0b04d4 |
| T-012 UserManagement → Redux + MockInterceptor | ✅ Completo | c8592bf |
| T-013 Baja lógica en pages/UserManagement/ | ⏳ Pendiente | — |
| T-014 Tests userService + userSlice + UserManagement | ✅ Completo | b0b04d4, c8592bf |
| T-020 reportsService.js | ⏳ Pendiente | — |
| T-021 reportsSlice.js | ⏳ Pendiente | — |
| T-022 AnalyticsDashboard → reportsSlice | ⏳ Pendiente | — |
| T-023 websocketService → AnalyticsDashboard | ⏳ Pendiente | — |
| T-024 Tests reportsService + reportsSlice | ⏳ Pendiente | — |

### Decisiones Sprint 2

**T-010 — userService.js:**
- Método `deactivateUser(id)` usa `apiService.delete()` — no PATCH — conforme
  a UC-USR-04 (baja lógica: DELETE HTTP, backend cambia `state → ELIMINATED`).
- Campo de filtro: `state` (enum ACTIVE/INACTIVE/BLOCKED/ELIMINATED), no `status`.
  Verificado en `uc-usr-02/datos-involucrados.rst` de IACT-docs.
- Respuesta `getUsers()` es paginada: `{count, next, previous, results}`.
- `getActiveUsers()` delega a `getUsers({ state: 'ACTIVE' })` — no duplica lógica.

**T-011 — userSlice.js:**
- Slice name: `'user'` (store key `user`, no `users`) — consistente con
  registro en `store.js`.
- `fetchUsers.fulfilled`: `payload.results ?? payload` y `payload.count ?? length`
  para soportar tanto respuestas paginadas como arrays directos (compatibilidad).
- `deactivateUser.fulfilled`: usa `target_user_id` del response (shape UC-USR-04);
  hace spread del usuario con el nuevo `state` — **no lo elimina del array**
  (baja lógica, no física).
- Selectores exportados: `selectUsers`, `selectUsersLoading`, `selectUsersError`,
  `selectUsersTotal` — todos leen `state.user`.

**T-012 — UserManagement wiring:**
- **Decisión clave:** los mocks se mantienen en la capa de red (`MockInterceptor`)
  no en el componente. `MockInterceptor._handleUsers` intercepta `GET /api/users/`
  cuando `REACT_APP_USE_MOCKS=true` y devuelve `{count, results}` paginado.
  El componente llama `dispatch(fetchUsers())` — idéntico en dev y prod.
  Para pasar a producción: apagar la variable de entorno. Cero cambios en el componente.
- `MockInterceptor._generateMockUsers`: campo `is_active` (boolean) reemplazado
  por `state` (enum UC-USR-01). String "Conflicto SoD" → "Conflicto de separación
  de funciones" (RBAC v5.2.1).
- Botón "Dar de baja" oculto si `user.state === 'ELIMINATED'` — no tiene sentido
  dar de baja a alguien ya dado de baja.

### Cobertura de tests al cierre de Sprint 2 (parcial)

| Archivo | Tests | Estado |
|---------|-------|--------|
| `userService.test.js` | 13 | ✅ GREEN |
| `userSlice.test.js` | 13 | ✅ GREEN |
| `UserManagement.test.jsx` | 7 | ✅ GREEN |
| `accessSlice.test.js` | 15 | ✅ GREEN (post-refactor) |
| `AssignFunctionsPage.test.jsx` | 3 | ✅ GREEN (post-refactor) |
| **Total acumulado** | **~51** | ✅ |

---

## Metodología TDD aplicada en Sprint 2

Ciclo por cada componente implementado:

```
1. RED   — escribir test que falla (describe qué debe hacer el código)
2. GREEN — implementar el mínimo para que pase
3. COMMIT — tests + implementación en el mismo commit
```

**JSDoc:** todos los métodos nuevos tienen JSDoc en español (comentarios),
identificadores en inglés (código). Conforme a RBAC v5.2.1 y estándar del proyecto.

---

## Próximo a implementar

**T-020 — reportsService.js** (siguiente tarea del Sprint 2):
- Métodos: `getDashboardMetrics()`, `getScheduledReports()`, `scheduleReport(config)`,
  `exportReport(type, format, filters)`.
- Misma metodología: TDD RED primero, luego implementación, commit conjunto.
- Registrar mock handler en `MockInterceptor` para `/api/reports/` (no existe aún).
