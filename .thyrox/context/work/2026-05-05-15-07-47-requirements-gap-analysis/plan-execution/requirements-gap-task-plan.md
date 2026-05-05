```yml
created_at: 2026-05-05 16:01:47
project: IACT-UI
work_package: 2026-05-05-15-07-47-requirements-gap-analysis
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Borrador
```

# Task Plan — Implementación de Requisitos Faltantes

Scope: Tipos A, B y C. Tipo D (operator, supervision, pipeline, caller) **excluido**.
Convención: código en inglés, comentarios/UI en español.

---

## Sprint 1 — Quick wins: wiring de rutas

### Grupo S1-AUTH — Rutas de autenticación

- [x] **T-001** Agregar `VIEW_USERS`, `MANAGE_USERS`, `VIEW_LOGS`, `VIEW_REALTIME_METRICS`,
  `MANAGE_GROUPS`, `MANAGE_CATALOG`, `SUPER_ADMIN` al `FunctionCatalog` en
  `src/permissions/catalog.js` con formato `sistema.{dominio}.{recurso}.{accion}`
  — prerequisito de todos los `ProtectedRoute` nuevos
  **Archivos:** `src/permissions/catalog.js`
  **Deps:** ninguna

- [x] **T-002** Agregar ruta pública `/login` → `LoginPage` en `AppRouter.jsx`.
  Redirigir a `/dashboard` si ya hay sesión activa (`isAuthenticated`).
  **Archivos:** `src/router/AppRouter.jsx`, lazy import de `LoginPage`
  **Deps:** T-001
  **UC:** UC-AUTH-01

- [x] **T-003** Agregar botón/link de logout en `DashboardLayout` o header que
  despache `logoutUser` thunk y redirija a `/login`.
  **Archivos:** `src/layouts/DashboardLayout/` o header component
  **Deps:** T-002
  **UC:** UC-AUTH-02

- [x] **T-004** Agregar ruta `/profile/sessions` → `SessionManagement` (componente
  ya existe en `src/components/features/SessionManagement/`).
  **Archivos:** `src/router/AppRouter.jsx`
  **Deps:** T-002
  **UC:** UC-AUTH-05

### Grupo S1-USERS — Ruta de gestión de usuarios

- [x] **T-005** Agregar ruta `/users` protegida por `FunctionCatalog.VIEW_USERS`
  → `UserManagement` (ya existe en `src/components/pages/UserManagement/`).
  Agregar entrada en navLinks del `DashboardLayout`.
  **Archivos:** `src/router/AppRouter.jsx`
  **Deps:** T-001
  **UC:** UC-USR-01, UC-USR-02, UC-USR-03, UC-USR-04

### Grupo S1-REPORTS — Ruta de analytics

- [x] **T-006** Agregar ruta `/reports` protegida por `FunctionCatalog.VIEW_REPORTS`
  → `AnalyticsDashboard` (ya existe en `src/components/pages/Analytics/`).
  Agregar entrada en navLinks.
  **Archivos:** `src/router/AppRouter.jsx`
  **Deps:** T-001
  **UC:** UC-RPT-01, UC-RPT-04, UC-RPT-07, UC-RPT-08

---

## Sprint 2 — Datos reales

### Grupo S2-USERS-SVC — Servicio de usuarios

- [x] **T-010** Crear `src/services/userService.js` con métodos:
  `getUsers(filters)`, `getUserById(id)`, `createUser(data)`,
  `updateUser(id, data)`, `deactivateUser(id)`, `getActiveUsers()`.
  Seguir patrón de `accessService.js` (instancia singleton exportada).
  Código en inglés, JSDoc en español.
  **Archivos:** `src/services/userService.js` (nuevo)
  **Deps:** T-005

- [x] **T-011** Reescribir `userSlice.js` con thunks RTK (`createAsyncThunk`):
  `fetchUsers`, `createUser`, `updateUser`, `deactivateUser`.
  Mantener `selectUsers`, `selectUsersLoading`, `selectUsersError` como selectores.
  **Archivos:** `src/redux/slices/userSlice.js`
  **Deps:** T-010

- [x] **T-012** Conectar `UserManagement.jsx` a `userSlice` via `useDispatch` /
  `useSelector`. Los mocks se mantienen en la capa de red (`MockInterceptor`)
  — el componente no cambia cuando el backend esté listo.
  `fetchUsers` en `useEffect`, loading/error states, badges `state` UC-USR-01.
  **Archivos:** `src/components/containers/UserManagement.jsx`
  **Commit:** c8592bf

- [x] **T-013** Implementar baja lógica en `UserForm.jsx` y `UserList.jsx`
  dentro de `src/components/pages/UserManagement/`:
  botón "Dar de baja" dispara `deactivateUser` (state → ELIMINATED), no DELETE físico.
  Mostrar badge estado (ACTIVE/INACTIVE/BLOCKED/ELIMINATED) en la lista.
  **Nota:** `UserManagement.jsx` en containers ya tiene "Dar de baja" y badges —
  este T-013 aplica al componente en `pages/UserManagement/`.
  **Archivos:** `src/components/pages/UserManagement/UserForm.jsx`,
  `src/components/pages/UserManagement/UserList.jsx`
  **Deps:** T-012
  **UC:** UC-USR-04

- [x] **T-014** Tests TDD para `userService.js` y `userSlice.js`.
  13 tests en userService (DELETE vs PATCH, paginación, filtro `state`),
  13 tests en userSlice (thunks, baja lógica, selectores),
  7 tests en UserManagement (dispatch on mount, loading, error, badges).
  **Archivos:** `src/services/__tests__/userService.test.js`,
  `src/redux/slices/__tests__/userSlice.test.js`,
  `src/components/containers/__tests__/UserManagement.test.jsx`
  **Commits:** b0b04d4, c8592bf

### Grupo S2-REPORTS-SVC — Servicio de reportes

- [x] **T-020** Crear `src/services/reportsService.js` con métodos:
  `getDashboardMetrics()`, `getAgentsReport(filters)`, `getQueuesReport(filters)`,
  `getCampaignsReport(filters)`, `getTransfersReport(filters)`,
  `getIVRMenusReport(filters)`, `getUniqueClientsReport(filters)`,
  `scheduleReport(config)`, `getScheduledReports()`, `exportReport(type, format, filters)`.
  **Archivos:** `src/services/reportsService.js` (nuevo)
  **Deps:** T-006

- [x] **T-021** Crear `src/redux/slices/reportsSlice.js` con thunks:
  `fetchDashboardMetrics`, `fetchScheduledReports`, `createScheduledReport`.
  Selectores: `selectMetrics`, `selectScheduledReports`, `selectReportsLoading`.
  **Archivos:** `src/redux/slices/reportsSlice.js` (nuevo)
  **Deps:** T-020

- [x] **T-022** Conectar `AnalyticsDashboard.jsx` a `reportsSlice`:
  reemplazar `mockMetrics` con `useSelector(selectMetrics)`, dispatch
  `fetchDashboardMetrics` en mount. Conectar `ScheduledReports` a slice.
  **Archivos:** `src/components/pages/Analytics/AnalyticsDashboard.jsx`,
  `src/components/pages/Analytics/ScheduledReports.jsx`
  **Deps:** T-021
  **UC:** UC-RPT-01, UC-RPT-07, UC-RPT-08

- [x] **T-023** Integrar `websocketService` en `AnalyticsDashboard.jsx` para
  métricas en tiempo real: suscribirse al canal `metrics` en mount,
  actualizar state con cada mensaje, desuscribirse en unmount.
  **Archivos:** `src/components/pages/Analytics/AnalyticsDashboard.jsx`
  **Deps:** T-022
  **UC:** UC-RPT-02

- [x] **T-024** Agregar tests para `reportsService.js` y `reportsSlice.js`.
  **Archivos:** `src/services/__tests__/reportsService.test.js` (nuevo),
  `src/redux/slices/__tests__/reportsSlice.test.js` (nuevo)
  **Deps:** T-023

---

## Sprint 3 — Páginas nuevas: Auth + Permissions + Admin

### Grupo S3-AUTH-PAGES — Páginas de contraseña

- [x] **T-030** Agregar thunk `recoverPassword(username)` en `authSlice.js`
  que llama `POST /api/password/recover/`. Agregar `changePassword(currentPw, newPw)`
  que llama `POST /api/password/change/`.
  **Archivos:** `src/redux/slices/authSlice.js`,
  `src/services/authService.js` (agregar `recoverPassword`, `changePassword`)
  **Deps:** T-002
  **UC:** UC-AUTH-03, UC-AUTH-04

- [x] **T-031** Crear `src/pages/auth/RecoverPasswordPage.jsx`:
  campo username, submit dispara `recoverPassword`, muestra mensaje de confirmación.
  Sin ProtectedRoute — acceso público.
  **Archivos:** `src/pages/auth/RecoverPasswordPage.jsx` (nuevo)
  **Deps:** T-030
  **UC:** UC-AUTH-03

- [x] **T-032** Crear `src/pages/auth/ChangePasswordPage.jsx`:
  campos contraseña actual + nueva + confirmación, usa `PasswordStrength` existente,
  dispara `changePassword`, redirige a `/dashboard` al completar.
  Protegida — requiere sesión activa.
  **Archivos:** `src/pages/auth/ChangePasswordPage.jsx` (nuevo)
  **Deps:** T-030
  **UC:** UC-AUTH-04

- [x] **T-033** Registrar rutas `/recover-password` y `/change-password` en
  `AppRouter.jsx`. El link "Forgot Password" de `LoginForm` debe navegar a `/recover-password`.
  **Archivos:** `src/router/AppRouter.jsx`,
  `src/components/presentational/LoginForm.jsx`
  **Deps:** T-031, T-032

- [x] **T-034** Agregar tests para `RecoverPasswordPage` y `ChangePasswordPage`.
  **Archivos:** `src/pages/auth/__tests__/RecoverPasswordPage.test.jsx` (nuevo),
  `src/pages/auth/__tests__/ChangePasswordPage.test.jsx` (nuevo)
  **Deps:** T-033

### Grupo S3-PERM — Gestión de permisos y grupos

- [x] **T-040** Agregar tab "Permisos temporales activos" en
  `TemporaryPermissionsPage.jsx` que liste permisos temporales vigentes con
  botón "Revocar" por cada uno. Reusar `revokeFunction` thunk existente.
  **Archivos:** `src/pages/access/TemporaryPermissionsPage.jsx`
  **Deps:** ninguna (usa accessSlice existente)
  **UC:** UC-PERM-04

- [x] **T-041** Crear `src/pages/access/GroupManagementPage.jsx`:
  CRUD de grupos/AGRs del catálogo. Operaciones: crear grupo, editar nombre/descripción,
  desactivar grupo. Usa `getFunctionGroups` + nuevos endpoints de `accessService`.
  **Archivos:** `src/pages/access/GroupManagementPage.jsx` (nuevo)
  **Deps:** T-042
  **UC:** UC-PERM-05

- [x] **T-042** Extender `accessService.js` con métodos de gestión de catálogo:
  `createGroup(data)`, `updateGroup(id, data)`, `deactivateGroup(id)`,
  `assignFunctionsToGroup(groupId, functionIds)`, `getGroupFunctions(groupId)`.
  **Archivos:** `src/services/accessService.js`
  **Deps:** T-001
  **UC:** UC-PERM-05, UC-PERM-06

- [x] **T-043** Crear `src/pages/access/GroupCompositionPage.jsx`:
  seleccionar grupo del catálogo → ver funciones asignadas → agregar/quitar funciones
  con validación SoD. Reusar `FunctionSelector` existente.
  **Archivos:** `src/pages/access/GroupCompositionPage.jsx` (nuevo)
  **Deps:** T-042
  **UC:** UC-PERM-06

- [x] **T-044** Hacer navLinks dinámicos en `DashboardLayout`: leer permisos
  del usuario vía `usePermisos` y filtrar la lista de nav según permisos efectivos.
  Cada navLink tiene un `permission` requerido; si el usuario no lo tiene, no aparece.
  **Archivos:** `src/layouts/DashboardLayout/` (componente principal)
  **Deps:** T-001
  **UC:** UC-PERM-08

- [x] **T-045** Registrar rutas `/access/groups` y `/access/groups/composition`
  en la sub-router de access. Agregar entradas en el nav de access.
  **Archivos:** `src/router/AppRouter.jsx` o sub-router de access
  **Deps:** T-041, T-043

- [x] **T-046** Extender `accessSlice.js` con thunks para gestión de grupos:
  `createGroup`, `updateGroup`, `deactivateGroup`, `fetchGroupFunctions`,
  `assignFunctionsToGroup`.
  **Archivos:** `src/redux/slices/accessSlice.js`
  **Deps:** T-042

- [x] **T-047** Agregar tests para `GroupManagementPage` y `GroupCompositionPage`.
  **Archivos:** `src/pages/access/__tests__/GroupManagementPage.test.jsx` (nuevo),
  `src/pages/access/__tests__/GroupCompositionPage.test.jsx` (nuevo)
  **Deps:** T-045

### Grupo S3-ADMIN — Catálogos de administración

- [x] **T-050** Crear `src/services/adminService.js` con métodos para administración
  de catálogos: `getFunctions()`, `createFunction(data)`, `updateFunction(id, data)`,
  `deactivateFunction(id)`, `getAGRCatalog()`, `createAGR(data)`, `updateAGR(id, data)`,
  `deactivateAGR(id)`, `getSoDRules()`.
  **Archivos:** `src/services/adminService.js` (nuevo)
  **Deps:** T-001

- [x] **T-051** Crear `src/redux/slices/adminSlice.js` con thunks para catálogos:
  `fetchFunctions`, `createFunction`, `updateFunction`, `deactivateFunction`,
  `fetchAGRCatalog`, `createAGR`, `updateAGR`. Selectores correspondientes.
  **Archivos:** `src/redux/slices/adminSlice.js` (nuevo)
  **Deps:** T-050

- [x] **T-052** Crear `src/pages/admin/FunctionCatalogPage.jsx`:
  tabla de funciones RBAC del sistema con search, sort, paginación.
  Acciones: crear función, editar, desactivar. Validar formato
  `sistema.{dominio}.{recurso}.{accion}` al crear/editar.
  **Archivos:** `src/pages/admin/FunctionCatalogPage.jsx` (nuevo)
  **Deps:** T-051
  **UC:** UC-ADM-02

- [x] **T-053** Crear `src/pages/admin/AGRCatalogPage.jsx`:
  tabla de Agrupadores de Funciones (AGRs) predefinidos del sistema.
  Acciones: crear AGR, editar nombre/descripción, ver composición, desactivar.
  **Archivos:** `src/pages/admin/AGRCatalogPage.jsx` (nuevo)
  **Deps:** T-051
  **UC:** UC-ADM-03

- [x] **T-054** Agregar ruta `/admin` protegida por `FunctionCatalog.SUPER_ADMIN`
  con sub-rutas: `/admin/functions`, `/admin/groups`, `/admin/sod`.
  Reusar `SeparationRulesPage` bajo `/admin/separation-rules`.
  **Archivos:** `src/router/AppRouter.jsx`
  **Deps:** T-052, T-053
  **UC:** UC-ADM-01, UC-ADM-02, UC-ADM-03

- [x] **T-055** Agregar tests para `FunctionCatalogPage` y `AGRCatalogPage`.
  **Archivos:** `src/pages/admin/__tests__/FunctionCatalogPage.test.jsx` (nuevo),
  `src/pages/admin/__tests__/AGRCatalogPage.test.jsx` (nuevo)
  **Deps:** T-054

---

## Sprint 4 — Logs + Reports IVR específicos

### Grupo S4-LOGS — Módulo de logs

- [x] **T-060** Crear `src/services/logsService.js` con métodos:
  `getAppLogs(filters)`, `getETLLogs(filters)`, `getInfraLogs(filters)`,
  `searchLogs(query, filters)`, `exportLogs(type, format, filters)`,
  `getSystemStatus()`, `getPerformanceMetrics()`.
  **Archivos:** `src/services/logsService.js` (nuevo)
  **Deps:** T-001

- [x] **T-061** Crear `src/redux/slices/logsSlice.js` con thunks:
  `fetchAppLogs`, `fetchETLLogs`, `fetchInfraLogs`, `searchLogs`,
  `fetchSystemStatus`, `fetchPerformanceMetrics`.
  Selectores: `selectLogs`, `selectSystemStatus`, `selectLogsLoading`.
  **Archivos:** `src/redux/slices/logsSlice.js` (nuevo)
  **Deps:** T-060

- [x] **T-062** Crear `src/pages/logs/LogsPage.jsx`:
  viewer de logs de aplicación con filtros (nivel: ERROR/WARN/INFO/DEBUG,
  rango de fechas, servicio), paginación, refresh automático.
  **Archivos:** `src/pages/logs/LogsPage.jsx` (nuevo)
  **Deps:** T-061
  **UC:** UC-LOG-01

- [x] **T-063** Crear `src/pages/logs/ETLLogsPage.jsx`:
  logs específicos del proceso ETL — mostrar paso, duración, estado y errores
  por ejecución. Agrupar por run_id.
  **Archivos:** `src/pages/logs/ETLLogsPage.jsx` (nuevo)
  **Deps:** T-061
  **UC:** UC-LOG-02

- [x] **T-064** Crear `src/pages/logs/LogSearchPage.jsx`:
  búsqueda full-text en todos los logs con highlight de términos encontrados,
  filtros combinables (tipo, fechas, nivel, servicio), resultados paginados.
  **Archivos:** `src/pages/logs/LogSearchPage.jsx` (nuevo)
  **Deps:** T-061
  **UC:** UC-LOG-03

- [x] **T-065** Crear `src/pages/logs/LogExportPage.jsx`:
  seleccionar tipo de log + rango de fechas + formato (CSV/JSON),
  encolar exportación asíncrona, mostrar estado de descarga.
  Reusar patrón de `ExportHub` existente.
  **Archivos:** `src/pages/logs/LogExportPage.jsx` (nuevo)
  **Deps:** T-061
  **UC:** UC-LOG-04

- [x] **T-066** Crear `src/pages/logs/InfraLogsPage.jsx`:
  logs de infraestructura (servidores, DB, red). Mostrar host, severity,
  mensaje. Filtrar por componente de infraestructura.
  **Archivos:** `src/pages/logs/InfraLogsPage.jsx` (nuevo)
  **Deps:** T-061
  **UC:** UC-LOG-05

- [x] **T-067** Crear `src/pages/logs/SystemStatusPage.jsx`:
  panel de estado del sistema: servicios (verde/amarillo/rojo), latencia,
  uptime. Refrescar cada 30s. Reusar `HealthService` existente.
  **Archivos:** `src/pages/logs/SystemStatusPage.jsx` (nuevo)
  **Deps:** T-061
  **UC:** UC-LOG-06

- [x] **T-068** Crear `src/pages/logs/PerformanceMetricsPage.jsx`:
  métricas de rendimiento del sistema — CPU, memoria, throughput, p95/p99
  de tiempo de respuesta. Gráficas de series de tiempo.
  Reusar `ChartComponent` de Analytics.
  **Archivos:** `src/pages/logs/PerformanceMetricsPage.jsx` (nuevo)
  **Deps:** T-061, T-067
  **UC:** UC-LOG-07

- [x] **T-069** Registrar ruta `/logs` con sub-rutas en `AppRouter.jsx`:
  `/logs`, `/logs/etl`, `/logs/search`, `/logs/export`,
  `/logs/infra`, `/logs/status`, `/logs/metrics`.
  Proteger con `FunctionCatalog.VIEW_LOGS`. Agregar entrada en navLinks.
  **Archivos:** `src/router/AppRouter.jsx`
  **Deps:** T-062..T-068

- [x] **T-070** Agregar tests para `LogsPage`, `LogSearchPage`, `SystemStatusPage`.
  **Archivos:** `src/pages/logs/__tests__/LogsPage.test.jsx` (nuevo),
  `src/pages/logs/__tests__/LogSearchPage.test.jsx` (nuevo),
  `src/pages/logs/__tests__/SystemStatusPage.test.jsx` (nuevo)
  **Deps:** T-069

### Grupo S4-RPT — Reportes IVR específicos

- [x] **T-080** Crear componente compartido `src/components/reports/ReportFilters.jsx`:
  filtros reutilizables para reportes IVR (rango de fechas, agente, cola, campaña,
  segmento). Exportar como `<ReportFilters onChange={fn} />`.
  **Archivos:** `src/components/reports/ReportFilters.jsx` (nuevo)
  **Deps:** T-020

- [x] **T-081** Crear componente compartido `src/components/reports/ReportTable.jsx`:
  tabla genérica para reportes con sort, paginación, exportar CSV/Excel.
  Recibe `columns`, `data`, `loading` como props.
  **Archivos:** `src/components/reports/ReportTable.jsx` (nuevo)
  **Deps:** T-080

- [x] **T-082** Crear `src/pages/reports/AgentsReportPage.jsx`:
  métricas por agente — llamadas atendidas, AHT (Average Handle Time),
  tasa de resolución, tiempo disponible, pausas. Usa `ReportFilters` + `ReportTable`.
  **Archivos:** `src/pages/reports/AgentsReportPage.jsx` (nuevo)
  **Deps:** T-081
  **UC:** UC-RPT-12

- [x] **T-083** Crear `src/pages/reports/QueuesReportPage.jsx`:
  métricas de colas — llamadas en espera, tiempo de espera promedio, abandonos,
  SLA cumplido. Gráfica de distribución horaria.
  **Archivos:** `src/pages/reports/QueuesReportPage.jsx` (nuevo)
  **Deps:** T-081
  **UC:** UC-RPT-13

- [x] **T-084** Crear `src/pages/reports/CampaignsReportPage.jsx`:
  métricas de campañas outbound — marcaciones, contactos efectivos,
  tasa de conversión, mejor horario.
  **Archivos:** `src/pages/reports/CampaignsReportPage.jsx` (nuevo)
  **Deps:** T-081
  **UC:** UC-RPT-14

- [x] **T-085** Crear `src/pages/reports/TransfersReportPage.jsx`:
  análisis de transferencias — motivo, destino, tasa de éxito,
  tiempo hasta transferencia. Pivot por cola destino.
  **Archivos:** `src/pages/reports/TransfersReportPage.jsx` (nuevo)
  **Deps:** T-081
  **UC:** UC-RPT-15

- [x] **T-086** Crear `src/pages/reports/IVRMenusReportPage.jsx`:
  análisis de navegación IVR — opciones más seleccionadas, puntos de abandono,
  flujo completo vs truncado, tiempo promedio por nodo.
  **Archivos:** `src/pages/reports/IVRMenusReportPage.jsx` (nuevo)
  **Deps:** T-081
  **UC:** UC-RPT-16

- [x] **T-087** Crear `src/pages/reports/UniqueClientsReportPage.jsx`:
  clientes únicos por período — nuevos vs recurrentes, frecuencia de llamada,
  segmento de cliente, canales usados.
  **Archivos:** `src/pages/reports/UniqueClientsReportPage.jsx` (nuevo)
  **Deps:** T-081
  **UC:** UC-RPT-17

- [x] **T-088** Implementar filtros guardados (`savedFilters`):
  crear `src/redux/slices/savedFiltersSlice.js` + panel lateral
  `src/components/reports/SavedFiltersPanel.jsx`. Guardar/cargar/eliminar
  combinaciones de filtros por reporte.
  **Archivos:** `src/redux/slices/savedFiltersSlice.js` (nuevo),
  `src/components/reports/SavedFiltersPanel.jsx` (nuevo)
  **Deps:** T-080
  **UC:** UC-RPT-09

- [x] **T-089** Implementar "Guardar vista" en reportes:
  botón en cada página de reporte que persiste la configuración actual
  (filtros + columnas visibles + sort) en `savedFiltersSlice` con nombre.
  **Archivos:** cada página de reporte + `SavedFiltersPanel`
  **Deps:** T-088
  **UC:** UC-RPT-10

- [x] **T-090** Implementar "Compartir reporte":
  generar URL con query params que reproduzcan los filtros activos.
  Botón "Copiar enlace" en cada página de reporte.
  **Archivos:** `src/utils/reportShareUtils.js` (nuevo), páginas de reporte
  **Deps:** T-082..T-087
  **UC:** UC-RPT-11

- [x] **T-091** Registrar sub-rutas de reportes en `/reports`:
  `/reports/agents`, `/reports/queues`, `/reports/campaigns`,
  `/reports/transfers`, `/reports/ivr-menus`, `/reports/unique-clients`.
  **Archivos:** `src/router/AppRouter.jsx`
  **Deps:** T-082..T-087

- [x] **T-092** Agregar tests para `AgentsReportPage`, `QueuesReportPage`,
  `ReportFilters`, `ReportTable`.
  **Archivos:** `src/pages/reports/__tests__/AgentsReportPage.test.jsx` (nuevo),
  `src/pages/reports/__tests__/QueuesReportPage.test.jsx` (nuevo),
  `src/components/reports/__tests__/ReportFilters.test.jsx` (nuevo),
  `src/components/reports/__tests__/ReportTable.test.jsx` (nuevo)
  **Deps:** T-091

---

## Resumen por sprint

| Sprint | Tareas | Tipo | Semanas est. | UCs cubiertos |
|--------|--------|------|-------------|---------------|
| Sprint 1 | T-001..T-006 | A — wiring | 1 | +13 UCs (auth 5, users 4, reports 4) |
| Sprint 2 | T-010..T-024 | B — datos reales | 2–3 | solidifica Sprint 1 |
| Sprint 3 | T-030..T-055 | C — páginas nuevas | 4–6 | +20 UCs (auth 2, perm 7, admin 3) |
| Sprint 4 | T-060..T-092 | C — páginas nuevas | 5–8 | +16 UCs (logs 7, reports IVR 9) |
| **Total** | **~50 tareas** | | **~14–18 semanas** | **+49 UCs** |

## Totales finales al completar

| Estado | UCs |
|--------|-----|
| Funcionales hoy | 16 |
| Al terminar Sprint 4 | 65 |
| Out-of-scope permanente | 18 (pipeline, operator, supervision, caller) |
| **Total documentados** | **83** |

## DAG de dependencias críticas

```
T-001 (catálogo permisos)
  ├── T-002 (ruta /login)
  │     ├── T-003 (logout)
  │     └── T-004 (ruta /sessions)
  ├── T-005 (ruta /users) → T-010 → T-011 → T-012 → T-013 → T-014
  ├── T-006 (ruta /reports) → T-020 → T-021 → T-022 → T-023 → T-024
  └── T-050 (adminService) → T-051 → T-052 → T-053 → T-054 → T-055

T-030 (thunks pw) → T-031 → T-033 → T-034
                 → T-032 → T-033

T-042 (extender accessService) → T-041 → T-045
                               → T-043 → T-045
                               → T-046

T-060 (logsService) → T-061 → T-062..T-068 → T-069 → T-070

T-020 (reportsService) → T-080 → T-081 → T-082..T-087 → T-091 → T-092
                      → T-088 → T-089
T-082..T-087 → T-090
```
