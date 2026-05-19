```yml
created_at: 2026-05-07 23:58:01
project: THYROX
work_package: 2026-05-07-23-37-33-api-connectivity-ux-feedback
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — api-connectivity-ux-feedback

**Total:** 18 tareas en 7 bloques (I..VII)
**Trazabilidad:** HAL-1..HAL-8 de `discover/api-connectivity-ux-feedback-analysis.md`

---

## Bloque I — mockInterceptor: handlers faltantes
> Prerrequisito de todos los demás bloques. Debe completarse primero.

- [x] [T-001] **mockInterceptor**: añadir `_handleDashboardMetrics()` para `GET /api/reports/metrics/dashboard/` — retorna métricas IVR mockeadas (queue_count, agents_busy, etc.) compatibles con el schema de `reportsSlice.metrics`. → HAL-1, HAL-8
- [x] [T-002] **mockInterceptor**: añadir handler para `GET /api/auth/sessions/` (lista de sesiones activas del usuario) y `DELETE /api/auth/sessions/{id}/` (revocar sesión) — retorna array con 3 sesiones mock (device, ip, location, lastActive, isCurrent). → HAL-2
- [x] [T-003] **mockInterceptor**: añadir `_handlePipelineStatus()` para `GET /api/v1/etl/supervision/` — retorna el mismo objeto que hoy hardcodea `logsService.getPipelineStatus()`. → HAL-3
- [x] [T-004] **mockInterceptor**: extender `_handleScheduledReports()` para discriminar sub-rutas con ID: `PATCH /{id}/pause/`, `PATCH /{id}/resume/`, `DELETE /{id}/`, `POST /{id}/run/`, `GET /{id}/runs/` — retornar respuestas apropiadas a cada operación. → HAL-4

## Bloque II — Service layer: eliminar mocks en servicios
> Depende de Bloque I (los servicios llamarán endpoints que ya tienen handler en el interceptor).

- [x] [T-005] **logsService**: `getPipelineStatus()` → `return apiService.get('/api/v1/etl/supervision/')` (eliminar objeto hardcodeado). → HAL-3
- [x] [T-006] **reportsService**: reemplazar 5 métodos con `// TODO: replace mock` por llamadas `apiService`:
  - `pauseSchedule(id)` → `apiService.patch('/api/reports/scheduled/${id}/pause/')`
  - `resumeSchedule(id)` → `apiService.patch('/api/reports/scheduled/${id}/resume/')`
  - `deleteSchedule(id)` → `apiService.delete('/api/reports/scheduled/${id}/')`
  - `runScheduleNow(id)` → `apiService.post('/api/reports/scheduled/${id}/run/')`
  - `getScheduleHistory(id)` → `apiService.get('/api/reports/scheduled/${id}/runs/')`
  → HAL-4
- [x] [T-007] **reportsService**: eliminar método huérfano `getRealTimeMetrics()` (nadie lo llama; la página usa `useRealTimeMetrics` hook con EventSource directo). → HAL-5
- [x] [T-008] **authService**: añadir dos métodos al servicio:
  - `getActiveSessions()` → `apiService.get('/api/auth/sessions/')`
  - `revokeSession(sessionId)` → `apiService.delete('/api/auth/sessions/${sessionId}/')`
  → HAL-2

## Bloque III — Redux: thunks para ActiveSessions
> Depende de T-008.

- [x] [T-009] **authSlice**: añadir dos async thunks y sus `extraReducers`:
  - `fetchActiveSessions` → llama `authService.getActiveSessions()`, guarda en `state.auth.sessions[]`
  - `revokeSession(sessionId)` → llama `authService.revokeSession()`, filtra `state.auth.sessions`
  Añadir campos en `initialState`: `sessions: [], sessionsLoading: false, sessionsError: null`. → HAL-2

## Bloque IV — Componentes: conectar a Redux
> T-010 depende de T-001. T-011 depende de T-009.

- [x] [T-010] **DashboardPage**: reemplazar import/uso de `mockFetchDashboardData` por dispatch de `fetchDashboardMetrics` (thunk de `reportsSlice`). Usar `selectMetrics` y `selectReportsLoading` de `reportsSlice`. Eliminar import de `@mocks/dashboardMocks`. → HAL-1, HAL-8
- [x] [T-011] **ActiveSessions**: conectar al store Redux — usar `fetchActiveSessions` y `revokeSession` thunks, `state.auth.sessions`, `state.auth.sessionsLoading`, `state.auth.sessionsError`. Eliminar `mockSessions` hardcodeadas. Mostrar `sessionsError` al usuario con `role="alert"`. → HAL-2

## Bloque V — Error normalization
> Independiente. Puede ejecutarse en paralelo con Bloque IV.

- [x] [T-012] **errorHandlingMiddleware**: defender contra payload string — si `typeof error === 'string'`, normalizar a `{ message: error, statusCode: null, code: 'UNKNOWN' }` antes de dispatch. Garantiza que `ApiErrorAlert` siempre muestra `error.message` correctamente. → HAL-6
- [x] [T-013] **Thunks críticos**: en los 4 slices con thunks sin endpoint real hasta ahora (`reportsSlice`, `logsSlice`, `authSlice`, `accessSlice`) cambiar `rejectWithValue(error.message)` → `rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })` para que el middleware reciba objetos estructurados. → HAL-6

## Bloque VI — Loading UX: conectar selectIsLoading
> Independiente. Mejora visual, no funcional.

- [x] [T-014] **DashboardPage + ScheduledReportPage + PipelineStatusPage**: añadir `useSelector(selectIsLoading('reports'))` / `selectIsLoading('logs')` para mostrar spinner global vía `loadingMiddleware`. DashboardPage puede usar el loading local de `reportsSlice` ya conectado en T-010; las otras dos páginas ya usan `selectReportsLoading` / `selectLogsLoading` del slice — verificar que es suficiente y documentar decisión (no cambiar si ya funciona). → HAL-7

## Bloque VII — Tests (TDD)
> Cada test depende de la implementación correspondiente.

- [x] [T-015] **DashboardPage.test**: mock de `fetchDashboardMetrics` thunk; verificar que el componente no importa `@mocks/dashboardMocks`; verificar render con métricas de store. → T-010
- [x] [T-016] **ActiveSessions.test**: mock de `fetchActiveSessions` y `revokeSession` thunks; verificar render de sesiones, click en revocar, mostrar error. → T-011
- [x] [T-017] **reportsService.test** (sub-acciones): verificar que `pauseSchedule`, `resumeSchedule`, `deleteSchedule`, `runScheduleNow`, `getScheduleHistory` llaman a `apiService` con el método y URL correctos. → T-006
- [x] [T-018] **errorHandlingMiddleware.test**: verificar que string payload se normaliza a objeto; verificar que objeto payload pasa sin modificación; verificar que `ApiErrorAlert` recibe `error.message` definido. → T-012, T-013

---

## DAG de dependencias

```
T-001 ──────────────────────────────────────┐
T-002 ──── T-008 ── T-009 ── T-011 ── T-016 │
T-003 ──── T-005                            │
T-004 ──── T-006                            ├── T-014
           T-007                            │
           T-008 ── T-009 ── T-011          │
T-001 ──── T-010 ── T-015                   │
T-012 ─────────────────────── T-018         │
T-013 ─────────────────────── T-018         │
T-006 ──── T-017                            │
```

**Orden de ejecución recomendado:**
1. Bloque I en secuencia (T-001 → T-002 → T-003 → T-004)
2. Bloque II en secuencia (T-005 → T-006 → T-007 → T-008)
3. Bloque III (T-009)
4. Bloques IV, V, VI en paralelo conceptual (T-010, T-011, T-012, T-013, T-014)
5. Bloque VII (tests al final de cada grupo)

---

## Commit strategy (1 commit por bloque)

| Bloque | Commit subject |
|--------|---------------|
| I | `Wire mockInterceptor for dashboard, sessions, pipeline and schedule sub-routes` |
| II | `Replace service-layer mocks with real apiService calls` |
| III | `Add fetchActiveSessions and revokeSession thunks to authSlice` |
| IV | `Connect DashboardPage and ActiveSessions to Redux thunks` |
| V | `Normalize error payloads in middleware and thunks` |
| VI | `Verify loading UX consistency across critical pages` |
| VII | `Add tests for connectivity fixes (dashboard, sessions, schedule, errors)` |
