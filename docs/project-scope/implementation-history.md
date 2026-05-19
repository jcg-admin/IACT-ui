# IACT — Historial de Implementación por Iteraciones

> Documento consolidado desde: ITER4_COMPLETADO_FINAL.txt, ITER5_COMPLETADO_FINAL.txt,
> ITER6_COMPLETADO_FINAL.txt, FASE2_IMPLEMENTACION_RESUMEN.txt, PHASE_0_COMPLETE.txt,
> PHASE_2_COMPLETE.txt, PHASE_3_COMPLETE.txt, PHASE_4_COMPLETE.txt,
> PHASE_5_WCAG_AA_COMPLETE.txt, EXECUTIVE_SUMMARY.txt, PROYECTO_IACT_COMPLETADO.txt,
> IMPLEMENTATION_COMPLETE.md, INTEGRACIÓN_COMPLETADA.md, COMMIT_MESSAGE.txt

---

## Resumen ejecutivo (Fases 1–5)

**Duración total:** 12–15 horas  
**Tests:** 507+ passing (100%)  
**Cobertura:** >90%  
**Estado:** Production-ready ✅

### Fases completadas

| Fase | Contenido | Tests |
|------|-----------|-------|
| Fase 1 | React Query integration — sustitución de Redux Thunks para fetching | 458 |
| Fase 2 | Notification service centralizado (4 tipos: success, error, warning, info) | 483 |
| Fase 3 | Animation components — PageTransition, AnimatedButton, AnimatedLoadingSpinner, ModalAnimation (Framer Motion) | 507 |
| Fase 4 | Animation integration — PageTransition en router, AnimatedButton en 10+ componentes | 507 |
| Fase 5 | WCAG AA Accessibility — prefers-reduced-motion, ARIA, 4.5:1 contrast, keyboard nav | 526 |

### Mejoras clave conseguidas

**UX:** Transiciones suaves 0.3s, feedback en hover/tap, loading animado, foco visible para teclado, respeta preferencias de movimiento.

**DX:** Reducción de boilerplate 70%, caching automático, notificaciones automáticas, patrones de animación reutilizables.

**Negocio:** WCAG AA legal compliance, +15-20% mercado direccionable (usuarios con discapacidad), reducción de riesgo legal ADA/AODA/GDPR.

---

## Iteraciones de módulos (ITER 1–6)

> **Nota:** Las iteraciones 1–6 se ejecutaron sobre `/tmp/project/IACT` (path de sesión de desarrollo anterior). La estructura actual del proyecto está documentada en `docs/ARCHITECTURE.md`.

### ITER 1–2: UI-KIT v2.2

- 50+ componentes SCSS
- ~3,000 líneas
- Dark mode integrado
- Integración inicial Tailwind CSS (luego removida — ver `docs/analysis/changelog-tailwind-removal.md`)

### ITER 3: Auth Module — 5 casos de uso

| UC | Descripción |
|----|------------|
| UC_AUTH_01 | Iniciar sesión |
| UC_AUTH_02 | Cerrar sesión |
| UC_AUTH_03 | Cambiar contraseña |
| UC_AUTH_04 | Recuperar contraseña |
| UC_AUTH_05 | Sesiones activas |

~2,500 líneas. Password strength meter. Token-based auth.

### ITER 4: Access Module — 9 casos de uso (4,431 líneas)

| UC | Descripción | Archivo |
|----|------------|---------|
| UC_ACC_01 | Asignar funciones con validación SoD | AssignFunctionsPage.jsx |
| UC_ACC_03 | Ver y gestionar permisos | PermissionsPage.jsx |
| UC_ACC_04 | Crear agrupadores de funciones | GroupersPage.jsx |
| UC_ACC_05 | Configurar reglas SoD | SoDManagementPage.jsx |
| UC_ACC_06–07 | Segmentos jerárquicos | SegmentsPage.jsx |
| UC_ACC_08 | Permisos temporales con expiración | TemporaryPermissionsPage.jsx |
| UC_ACC_09 | Auditoría de cambios (CNST-009) | AccessAuditPage.jsx |

**Componentes RBAC reutilizables:**
- `FunctionSelector.jsx` — multi-select con 44 funciones RBAC, validación SoD en tiempo real, 6 categorías
- `SoDValidator.jsx` — visualización de conflictos y 3 reglas SoD
- `PermissionsTable.jsx` — tabla de permisos activos

### ITER 5: Alerts Module — 5 casos de uso (2,485 líneas)

| UC | Descripción |
|----|------------|
| UC_ALR_01 | Ver alertas disponibles y activas |
| UC_ALR_02 | Crear y configurar alertas con condiciones |
| UC_ALR_03 | Historial de alertas |
| UC_ALR_04 | Gestionar suscripciones y preferencias |
| UC_ALR_05 | Tipos de entrega (4 canales) |

16 tipos de alerta. 4 canales de entrega. Redux slice + service de 300+ líneas cada uno.

### ITER 6: Audit Module — 4 casos de uso (1,821 líneas)

| UC | Descripción |
|----|------------|
| UC_AUD_01 | Ver logs con filtros |
| UC_AUD_02 | Búsqueda avanzada |
| UC_AUD_03 | Exportar CSV/JSON/PDF |
| UC_AUD_04 | Reporte de compliance regulatorio |

Read-only Redux state. CNST-009: logs inmutables. Validación de integridad.

### Totales del proyecto

| Métrica | Valor |
|---------|-------|
| Iteraciones | 6 |
| Casos de uso | 23/23 |
| Líneas de código | ~14,200 |
| Archivos | ~70 |

---

## Fase 2 de implementación — Features de semana 2

**Fecha:** 2026-04-27 | Estado del proyecto al momento: 70% completo

4 features implementadas (~1,200 líneas React):

| Feature | Archivo | Líneas |
|---------|---------|--------|
| User Management CRUD | `src/components/features/UserManagement/UserList.jsx` | 380 |
| Transactions + exportación CSV | `src/components/features/Transactions/TransactionList.jsx` | 240 |
| Jobs con polling 5s | `src/components/features/Jobs/JobList.jsx` | 320 |
| Settings (tema, idioma, notificaciones, password) | `src/components/features/Settings/SettingsPage.jsx` | 280 |

---

## Commit de Redux Persist

```
feat(redux-persist): complete Redux Persist implementation with tests

- Add redux-persist library for automatic state persistence
- Create persistConfig.js with auth slice whitelist
- Integrate persistReducer in store configuration
- Add PersistGate wrapper in App.jsx
- Remove manual localStorage code from authSlice.js (7 lines eliminated)
- throttle: 1000ms para controlar frecuencia de escrituras
```

**Patrón Redux Persist en tests:**
```javascript
const persistedReducer = persistReducer(config, reducer)
const store = configureStore({ reducer: persistedReducer })
const persistor = persistStore(store)
await persistor.flush()  // Sincronizar con localStorage en tests
```

---

## Integración de componentes DateTimeInputs + formSlice

**Archivos creados (desde INTEGRACIÓN_COMPLETADA.md):**

```
src/components/DateTimeInputs/
├── DateTimeInput.jsx         — Selector fecha/hora (date, time, datetime)
├── DateTimeInput.scss        — Dark mode completo
├── SelectDropdown.jsx        — Multi-select con búsqueda
└── SelectDropdown.scss       — Animaciones
src/redux/slices/formSlice.js — State para formularios de filtro
```

**Redux formSlice selectors:** `selectDateStart`, `selectDateEnd`, `selectSelectedAction`, `selectActiveFilters`, `selectSearchQuery`

**Redux formSlice actions:** `setDateStart`, `setDateEnd`, `setSelectedAction`, `resetFilters`, `applyFilters`, `setSearchQuery`

---

## Sprint 1 — Wiring de rutas (2026-05-05)

### Contexto

Gap analysis reveló que 16/83 UCs documentados en IACT-docs estaban
implementados. Sprint 1 conecta las rutas faltantes de auth, users y reports.

### Cambios

**`src/permissions/catalog.js` — FunctionCatalog extendido:**

Constantes nuevas:
- `MANAGE_USERS` → `'sistema.administracion.usuarios.gestionar'`
- `MANAGE_GROUPS` → `'sistema.administracion.grupos.gestionar'`
- `MANAGE_CATALOG` → `'sistema.administracion.catalogo.gestionar'`
- `VIEW_LOGS` → `'sistema.observabilidad.logs.ver'`
- `VIEW_REALTIME_METRICS` → `'sistema.analisis.metricas.tiemporeal.ver'`
- `SUPER_ADMIN` → `'sistema.administracion.sistema.superadmin'`
- `MANAGE_SEPARATION_RULES` → `'sistema.administracion.acceso.sod'` (renombrado desde `MANAGE_SOD` — RBAC v5.2.1)

**`src/router/AppRouter.jsx` — rutas nuevas:**

- `/login` → `LoginPage` (pública, redirige a `/dashboard` si hay sesión)
- `/users` → `UserManagement` (protegida por `VIEW_USERS`)
- `/reports` → `AnalyticsDashboard` (protegida por `VIEW_REPORTS`)
- `/profile/sessions` → `ActiveSessions`
- `AuthGuard` — guarda de autenticación que preserva el destino original (`state: { from: location }`)
- `PublicOnlyRoute` — evita que usuarios autenticados accedan a `/login`

**`src/layouts/DashboardLayout/DashboardLayout.jsx` — logout wired:**

`handleLogout` despacha `logoutUser()` y navega a `/login` al completarse.

### UCs cubiertos

UC-AUTH-01 (login), UC-AUTH-02 (logout), UC-AUTH-05 (sesiones),
UC-USR-01 (gestión usuarios), UC-RPT-01 (dashboard reportes)

---

## RBAC Naming Refactor v5.2.1 (2026-05-05)

### Contexto

Revisión de `MODELO_RBAC_IACT_v5_2_1.md` identificó que `validateSoD`
viola el estándar de nomenclatura. v5.2.1 establece nombres descriptivos
en inglés, sin acrónimos de dominio en identificadores de código.

Ver guía completa: `docs/guides/rbac-naming-standard.md`

### Cambios

| Archivo | Cambio |
|---------|--------|
| `accessService.js` | `validateSoD()` → `validateSeparationRules()` |
| `accessSlice.js` | thunk + action type + state key + selector |
| `catalog.js` | `MANAGE_SOD` → `MANAGE_SEPARATION_RULES` |
| `SoDValidator.jsx` | → `SeparationRulesValidator.jsx` (git mv) |
| `SoDValidation.jsx` | → `SeparationRulesValidation.jsx` (git mv) |
| `SoDManagementPage.jsx` | → `SeparationRulesPage.jsx` (git mv) |
| Strings UI | "SoD" eliminado de headings, labels, alerts |

**Tests:** 44/44 GREEN post-refactor.

---

## Sprint 2 — userService + userSlice + UserManagement (2026-05-05)

### Contexto

Implementación de la capa de datos para gestión de usuarios, alineada
con UC-USR-01..UC-USR-04 de IACT-docs. Metodología: TDD (test RED primero,
implementación GREEN, commit conjunto).

Ver patrón de mocks: `docs/guides/mock-interceptor-pattern.md`

### Archivos nuevos

**`src/services/userService.js`:**

- `getUsers(filters)` — GET `/api/users/` con filtros; respuesta paginada `{count, results}`
- `getUserById(id)` — GET `/api/users/{id}/`
- `createUser(data)` — POST `/api/users/`
- `updateUser(id, data)` — PUT `/api/users/{id}/`
- `deactivateUser(id)` — DELETE `/api/users/{id}/` (baja lógica UC-USR-04, no DELETE físico)
- `getActiveUsers()` — `getUsers({ state: 'ACTIVE' })`

Nota: el campo de filtro es `state` (enum ACTIVE/INACTIVE/BLOCKED/ELIMINATED),
no `status`. Verificado en `uc-usr-02/datos-involucrados.rst`.

**`src/services/__tests__/userService.test.js`:** 13 tests (TDD)

**`src/redux/slices/userSlice.js`** — reescrito con RTK:

- Slice name: `'user'` (store key `user`)
- Thunks: `fetchUsers`, `createUser`, `updateUser`, `deactivateUser`
- `fetchUsers.fulfilled`: maneja respuesta paginada `payload.results ?? payload`
- `deactivateUser.fulfilled`: actualiza `state` del usuario en array (no lo elimina)
- Selectores: `selectUsers`, `selectUsersLoading`, `selectUsersError`, `selectUsersTotal`

**`src/redux/slices/__tests__/userSlice.test.js`:** 13 tests (TDD)

**`src/components/containers/__tests__/UserManagement.test.jsx`:** 7 tests (TDD)

### Cambios en archivos existentes

**`src/components/containers/UserManagement.jsx`** — conectado al store:

- `useEffect` → `dispatch(fetchUsers())`
- `useSelector(selectUsers/Loading/Error/Total)` — datos del store
- Loading state: texto "Cargando usuarios..."
- Error state: mensaje de error inline
- Badge de estado: `ACTIVE / INACTIVE / BLOCKED / ELIMINATED` (UC-USR-01)
- Botón "Dar de baja" (oculto si `state === 'ELIMINATED'`)
- Los mocks siguen en `MockInterceptor` — cero cambios al pasar a backend real

**`src/mocks/mockInterceptor.js`:**

- `_generateMockUsers`: campo `is_active` (boolean) → `state` (enum UC-USR-01)
- String "Conflicto SoD detectado" → "Conflicto de separación de funciones detectado"

### Decisión de arquitectura: mocks en capa de red

Los datos mock viven en `MockInterceptor`, no en los componentes.
Flujo: `dispatch(fetchUsers())` → `userService.getUsers()` → `MockInterceptor`
retorna `{count, results}` si `REACT_APP_USE_MOCKS=true`.

Para producción: apagar la variable de entorno. Ningún archivo de aplicación cambia.

### Cobertura de tests Sprint 2

| Suite | Tests | Estado |
|-------|-------|--------|
| `userService.test.js` | 13 | ✅ GREEN |
| `userSlice.test.js` | 13 | ✅ GREEN |
| `UserManagement.test.jsx` | 7 | ✅ GREEN |
| **Subtotal Sprint 2** | **33** | |
| **Total acumulado** | **~51** | ✅ |
