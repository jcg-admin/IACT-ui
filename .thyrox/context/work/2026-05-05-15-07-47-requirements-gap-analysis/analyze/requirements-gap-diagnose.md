```yml
created_at: 2026-05-05 15:19:41
project: IACT-UI
work_package: 2026-05-05-15-07-47-requirements-gap-analysis
phase: Phase 3 — DIAGNOSE
author: claude
status: Borrador
```

# Diagnose — Gap de Implementación por Dominio

Análisis profundo del estado real de cada dominio. Para cada uno se verifica
qué código existe, qué funciona, qué le falta y qué es puro scaffolding.

---

## Resumen ejecutivo

| Dominio | Componentes | Servicios | Redux | Ruta | Veredicto |
|---------|-------------|-----------|-------|------|-----------|
| **auth** | ✅ completos | ✅ completo | ✅ slice | ❌ sin ruta | **Wiring** |
| **users** | ✅ completos | ⚠ mock data | ✅ slice | ❌ sin ruta | **Wiring + servicio** |
| **access** | ✅ completos | ✅ completo | ✅ slice | ✅ `/access/*` | **Funcional** |
| **alerts** | ✅ completos | ✅ completo | ✅ slice | ✅ `/alerts/*` | **Funcional** |
| **audit** | ✅ completos | ✅ completo | ✅ slice | ✅ `/audit/*` | **Funcional** |
| **reports** | ✅ Analytics | ⚠ mock data | ⚠ dashboardSlice | ❌ sin ruta | **Wiring + datos reales** |
| **pipeline** | ⚠ JobMonitoring | ❌ sin servicio | ❌ sin slice | ❌ sin ruta | **Reuso + backend** |
| **permissions** | ⚠ en access/ | ✅ accessService | ✅ accessSlice | ⚠ bajo /access | **Páginas nuevas** |
| **admin** | ❌ | ❌ | ❌ | ❌ | **Greenfield** |
| **logs** | ❌ | ❌ | ❌ | ❌ | **Greenfield** |
| **operator** | ❌ | ❌ | ❌ | ❌ | **Greenfield** |
| **supervision** | ❌ | ❌ | ❌ | ❌ | **Greenfield** |

---

## Diagnóstico por dominio

### AUTH — WIRING (componentes listos, rutas inexistentes)

**Estado real:**
- `LoginPage.jsx` — completo: Redux-connected, navega a `/dashboard` post-login,
  maneja loading/error, tiene credenciales demo
- `LoginForm.jsx` — completo: validación en tiempo real, PasswordStrength, RememberMe,
  ForgotPassword link, escape handler
- `authSlice.js` — completo: `loginUser`, `logoutUser`, `getCurrentUser` thunks,
  httpOnly cookies security model
- `authService.js` — completo: login, logout, getCurrentUser, register, verifyToken
  con decorators (caching, logging, validation)
- `SessionManagement/` — completo: ActiveSessions, LoginHistory, SessionWarning,
  SessionManager

**Gap concreto:**
```
❌ No hay ruta /login en AppRouter.jsx
❌ No hay ruta /logout (solo dispatch de thunk)
❌ No hay componente/página de recuperación de contraseña (UC-AUTH-03)
❌ No hay página de cambio de contraseña con validación de la actual (UC-AUTH-04)
❌ SessionManagement no está expuesto como ruta (UC-AUTH-05)
❌ authSlice no tiene thunks para changePassword ni recoverPassword
```

**Trabajo necesario:**
1. Agregar ruta `/login` → `LoginPage` en AppRouter (no necesita ProtectedRoute)
2. Crear `RecoverPasswordPage.jsx` + thunk en authSlice + endpoint en authService
3. Crear `ChangePasswordPage.jsx` + thunk + endpoint
4. Agregar ruta `/profile/sessions` → `SessionManagement`
5. Agregar ruta `/logout` o manejar como acción en header

**Estimación: 3–4 días** (componentes parcialmente listos)

---

### USERS — WIRING + DATOS REALES

**Estado real:**
- `UserManagement.jsx` — completo funcionalmente pero usa **mock data hardcodeada**
  (array de usuarios ficticios). No llama ningún servicio real.
- `UserList.jsx` — completo: sort, paginación, actions (edit/delete). Sin servicio.
- `UserForm.jsx` — completo: create/edit form. Sin servicio.
- `userSlice.js` — existe, necesita verificar thunks
- `CreateUserStepper.jsx` — stepper multi-paso en `components/transaction/`

**Gap concreto:**
```
❌ No hay ruta /users en AppRouter.jsx
❌ UserManagement usa mock data, no llama API real
❌ No hay userService.js (solo userSlice con API calls inline o no definidas)
❌ Baja lógica (UC-USR-04) no está implementada — UserManagement solo tiene delete
   pero sin confirmación de baja lógica vs borrado físico
❌ Filtros y búsqueda en UserList son locales al mock array, no server-side
```

**Trabajo necesario:**
1. Crear `userService.js` con endpoints CRUD reales
2. Conectar UserManagement con `userService` (eliminar mock data)
3. Agregar ruta `/users` → `UserManagement` (protegida con `VIEW_USERS`)
4. Agregar `VIEW_USERS` y `MANAGE_USERS` al FunctionCatalog
5. Implementar baja lógica (status: INACTIVE vs DELETE)

**Estimación: 3–5 días**

---

### ACCESS — FUNCIONAL (6/7 UCs cubiertos)

**Estado real:** Completamente implementado y ruteado. Ver WP anterior
`rbac-access-tdd-coverage` — 8 archivos con cobertura TDD completa.

**Gap residual:**
```
⚠ UC-ACC-03 (Consultar Permisos Efectivos) — PermissionsPage muestra permisos
  del usuario seleccionado, pero no hay vista de "permisos efectivos agregados"
  (AGR + individuales + temporales combinados) con fecha de expiración visible.
```

**Trabajo necesario:** 1 vista adicional en PermissionsPage (~1 día)

---

### REPORTS — WIRING + DATOS REALES + RUTAS FALTANTES

**Estado real:**
- `AnalyticsDashboard.jsx` — completo funcionalmente, usa **mock data** (totals,
  jobs completados, response times). Tiene tabs: overview, reports, scheduled, export.
  Integra MetricsCard, ChartComponent, ReportBuilder, ScheduledReports.
- `ReportBuilder.jsx` — funcional: genera reports con config (tipo, fechas, métricas).
  Mock data.
- `ScheduledReports.jsx` — funcional: lista programaciones, add form. Mock data.
- `ExportHub.jsx` — completo: selector de tipo, formato (xlsx/pdf/csv), preview,
  historial. Usa `reportExporter` facade. Mock data.
- `ChartComponent.jsx`, `MetricsCard.jsx` — componentes de visualización básicos.

**Gap concreto:**
```
❌ No hay ruta /reports en AppRouter
❌ AnalyticsDashboard no importa datos reales (todo mock)
❌ No hay reportes específicos de IVR:
   - UC-RPT-12: Reporte de Agentes (llamadas, AHT, resolución)
   - UC-RPT-13: Reporte de Colas (abandonos, espera, SLA)
   - UC-RPT-14: Reporte de Campañas
   - UC-RPT-15: Reporte de Transferencias
   - UC-RPT-16: Reporte de Menús IVR
   - UC-RPT-17: Reporte de Clientes Únicos
❌ No hay métricas en tiempo real con WebSocket (UC-RPT-02)
   — websocketService existe pero AnalyticsDashboard no lo usa
❌ No hay gestión de filtros guardados (UC-RPT-09) ni compartir vista (UC-RPT-11)
❌ UC-INC-RPT-01 (Resolver segmento del usuario) — sin implementar
```

**Trabajo necesario:**
1. Agregar ruta `/reports` → `AnalyticsDashboard` en AppRouter
2. Crear `reportsService.js` con endpoints para métricas IVR reales
3. Conectar AnalyticsDashboard y sub-componentes al servicio
4. Implementar WebSocket en dashboard para métricas en tiempo real
5. Crear 6 pages de reportes específicos (Agentes, Colas, Campañas, etc.)
6. Implementar filtros guardados y compartir vista

**Estimación: 3–4 semanas** (el scaffolding acelera, pero los reportes IVR son dominio-específicos)

---

### PIPELINE — REUSO DE JOB MONITORING

**Estado real:**
- `JobMonitoring.jsx` — completo: start/monitor/cancel/retry/download jobs.
  Tiene polling, progress bars, filtros por status. Facade `jobOrchestrator`.
- `jobService.js` — start, status, download, cancel jobs (genérico).
- **JobMonitoring es un monitor de jobs genérico, no específico de ETL/pipeline.**

**Gap concreto:**
```
❌ No hay ruta /pipeline
❌ JobMonitoring monitorea "jobs" genéricos, no ejecuciones ETL con:
   - UC-PIP-01: Estado de pipeline (steps completados, duración, próxima ejecución)
   - UC-PIP-02: Errores específicos del ETL (registro de fallos con contexto)
   - UC-PIP-03: Disponibilidad de datos (qué datos están disponibles hasta qué fecha)
   - UC-PIP-04: Reintento manual de pipeline (con selección de rango de fecha)
❌ No hay pipelineService.js ni pipelineSlice
```

**Trabajo necesario:**
1. Crear `PipelineDashboard.jsx` reutilizando componentes de JobMonitoring
2. Crear `pipelineService.js` con endpoints ETL específicos
3. Crear `pipelineSlice.js`
4. Agregar ruta `/pipeline` → `PipelineDashboard`

**Estimación: 1–2 semanas** (JobMonitoring como base reduce esfuerzo)

---

### PERMISSIONS — PÁGINAS NUEVAS EN CONTEXTO EXISTENTE

**Estado real:**
Los UCs de permissions están dispersos en `/access/*` pero sin organización
como módulo propio. Lo que existe:
- UC-PERM-01/02 (assign/revoke group): parcial en `GroupersPage`
- UC-PERM-03 (exceptional perm): `TemporaryPermissionsPage`
- UC-PERM-07 (verify perm): `ProtectedRoute` + `usePermisos`
- UC-PERM-08 (dynamic menu): `DashboardLayout` navLinks **hardcodeados** — no dinámico

**Gap concreto:**
```
❌ UC-PERM-04: Revocar permiso excepcional — no hay UI de revocación de
   temporales activos (TemporaryPermissionsPage solo asigna, no revoca)
❌ UC-PERM-05 CRUD de grupos: GroupersPage asigna grupos a usuarios pero no
   permite crear/modificar/eliminar los grupos del catálogo
❌ UC-PERM-06 Composición AGR: no hay UI para asignar funciones a un grupo
❌ UC-PERM-08 Menú dinámico: navLinks en AppRouter/DashboardLayout son array
   hardcodeado — deben derivarse de los permisos efectivos del usuario
❌ UC-PERM-09 Auditar acceso (write side): frontend no registra eventos de acceso
❌ UC-PERM-10 Consultar auditoría: AccessAuditPage existe pero es genérico,
   no está especializado para permisos
```

**Trabajo necesario:**
1. Agregar tab/sección "Revocar" en TemporaryPermissionsPage
2. Crear `GroupManagementPage.jsx` (CRUD de grupos/AGRs del catálogo)
3. Crear `GroupCompositionPage.jsx` (asignar funciones a un grupo)
4. Hacer navLinks dinámicos: leer `usePermisos` y filtrar según permisos del usuario
5. Registrar audit events en PermissionsService al verificar permisos

**Estimación: 1–2 semanas**

---

### ADMIN — GREENFIELD COMPLETO

**Estado real:** Solo existe `catalog.js` con constantes de funciones RBAC y
`SoDManagementPage.jsx` que gestiona reglas SoD. No hay ningún UI de administración
del catálogo.

**Gap concreto:**
```
❌ UC-ADM-01: Ciclo de vida de reglas SoD — SoDManagementPage existe pero está
   bajo /access, no bajo /admin. Falta CRUD completo de SoD rules con audit.
❌ UC-ADM-02: Gestionar catálogo de funciones — no hay página. Solo existe
   catalog.js como archivo de constantes (no editable desde UI).
❌ UC-ADM-03: Gestionar catálogo de AGRs — GroupersPage lista grupos pero no
   permite administrar el catálogo global de AGRs predefinidos.
❌ No hay ruta /admin, ni adminService.js, ni adminSlice
```

**Trabajo necesario:**
1. Crear `adminService.js` (CRUD funciones, AGRs, SoD rules)
2. Crear `FunctionCatalogAdminPage.jsx`
3. Crear `AGRCatalogAdminPage.jsx`
4. Mover SoDManagementPage al contexto `/admin` o duplicar acceso
5. Agregar ruta `/admin` con protección por permiso admin

**Estimación: 2–3 semanas**

---

### LOGS — GREENFIELD COMPLETO

**Estado real:** `HealthService.js` y `healthSlice.js` monitorizan salud del
sistema (UC-LOG-06 parcialmente). No hay ningún viewer de logs.

**Gap concreto:**
```
❌ UC-LOG-01: Ver logs de aplicación — no existe ningún componente de log viewer
❌ UC-LOG-02: Ver logs del proceso ETL — idem
❌ UC-LOG-03: Búsqueda en logs — no existe
❌ UC-LOG-04: Exportar logs — exportService existe pero no hay UI de logs
❌ UC-LOG-05: Ver logs de infraestructura — no existe
❌ UC-LOG-06: Estado del sistema — HealthService parcial, sin página dedicada
❌ UC-LOG-07: Métricas de rendimiento — no existe
❌ No hay ruta /logs, logsService, ni logsSlice
```

**Trabajo necesario:**
1. Crear `logsService.js` (query logs por tipo, búsqueda, exportar)
2. Crear `logsSlice.js`
3. Crear 7 pages: LogsPage, ETLLogsPage, LogSearchPage, LogExportPage,
   InfraLogsPage, SystemStatusPage, PerformanceMetricsPage
4. Agregar ruta `/logs`

**Estimación: 2–3 semanas**

---

### OPERATOR — GREENFIELD COMPLETO (real-time)

**Estado real:** `websocketService.js` y `transactionService.js` proveen
infraestructura que cubriría las necesidades de tiempo real. Sin embargo,
no hay ningún componente de agente/operador.

**Gap concreto:**
```
❌ UC-OPR-01..10: Ninguno implementado — cero componentes de UI para operadores
❌ No hay ruta /operator
❌ No hay agentService, callService (para operaciones), operatorSlice
❌ CallsService.js monitorea llamadas en BD (analytics), no es softphone/ACD
```

**Nota de dominio:** Operator UCs implican integración con un sistema ACD/CTI
(Automatic Call Distribution). El frontend necesitaría un softphone browser-based
o integración con CTI via WebSocket + SIP/WebRTC.

**Estimación: 4–8 semanas** (alta complejidad, requiere CTI/WebRTC)

---

### SUPERVISION — GREENFIELD COMPLETO (real-time avanzado)

**Estado real:** Sin ningún componente.

**Gap concreto:**
```
❌ UC-SUP-01: Monitorear llamada (whisper) — requiere WebRTC/SIP
❌ UC-SUP-02: Intervenir en llamada (barge-in) — requiere WebRTC/SIP
❌ UC-SUP-03: Mensaje masivo al equipo — websocketService podría servir
```

**Nota de dominio:** UC-SUP-01 y UC-SUP-02 dependen de la misma infraestructura
CTI que Operator. UC-SUP-03 (broadcast interno) es más simple.

**Estimación: 3–6 semanas** (depende de resolución del dominio CTI)

---

## Clasificación de trabajo pendiente

### Tipo A — Solo wiring (código existe, falta conectarlo)

| Dominio | Gap principal | Esfuerzo |
|---------|---------------|----------|
| auth | Agregar rutas /login, /sessions | 1–2 días |
| users | Agregar ruta /users | 0.5 días |
| reports | Agregar ruta /reports | 0.5 días |

**Total tipo A: ~3 días — alto ROI inmediato**

### Tipo B — Datos reales (componentes listos, usan mock data)

| Dominio | Gap principal | Esfuerzo |
|---------|---------------|----------|
| users | Crear userService.js + conectar UserManagement | 2–3 días |
| reports | Crear reportsService.js + conectar AnalyticsDashboard | 3–5 días |
| pipeline | Crear pipelineService.js | 2–3 días |

**Total tipo B: ~1–2 semanas**

### Tipo C — Páginas nuevas en dominio existente

| Dominio | Gap principal | Esfuerzo |
|---------|---------------|----------|
| auth | RecoverPasswordPage, ChangePasswordPage | 2–3 días |
| permissions | GroupManagement, GroupComposition, menú dinámico | 1–2 semanas |
| admin | FunctionCatalogAdmin, AGRCatalogAdmin | 2–3 semanas |
| reports | 6 reportes IVR específicos + WS real-time | 2–3 semanas |
| logs | 7 páginas de logs + logsService | 2–3 semanas |

**Total tipo C: ~2 meses**

### Tipo D — Greenfield con infraestructura nueva

| Dominio | Gap principal | Esfuerzo |
|---------|---------------|----------|
| pipeline | PipelineDashboard + servicio | 1–2 semanas |
| operator | Agente UI + CTI integration | 4–8 semanas |
| supervision | Supervisor UI + WebRTC | 3–6 semanas |

**Total tipo D: ~2–4 meses** (alta varianza por dependencia CTI)

---

## Totales consolidados

| Tipo | Descripción | Días hábiles |
|------|-------------|-------------|
| A — Wiring | Conectar lo que ya existe | ~3 días |
| B — Datos reales | Servicios + conexión | ~8–12 días |
| C — Páginas nuevas | Dominios parciales | ~35–50 días |
| D — Greenfield | Dominios nuevos + infraestructura | ~50–90 días |
| **TOTAL** | **Todo el backlog** | **~100–155 días** |

**Con equipo de 2 frontend developers: ~10–15 meses de trabajo.**
**Con equipo de 4: ~5–8 meses.**

### Secuencia recomendada de entrega por valor

```
Sprint 1 (semana 1):   Tipo A — auth wiring + users wiring + reports wiring
Sprint 2 (semanas 2-3): Tipo B — userService + reportsService reales
Sprint 3 (semanas 4-6): Tipo C — permissions + admin (catálogos)
Sprint 4 (semanas 7-10): Tipo C — logs module completo
Sprint 5 (semanas 11-14): Tipo C — reportes IVR específicos
Sprint 6 (semanas 15-18): Tipo D — pipeline dashboard
Sprint 7+ (mes 5+):    Tipo D — operator + supervision (CTI)
```
