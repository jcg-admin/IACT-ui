```yml
created_at: 2026-05-08 00:46:45
feature: api-connectivity-ux-feedback
wp: 2026-05-07-23-37-33-api-connectivity-ux-feedback
fase: FASE 47
commits: 3 commits en este WP
```

# WP Changelog — api-connectivity-ux-feedback

> Registro de cambios producidos por este work package.
> 8 gaps de conectividad API resueltos (HAL-1..HAL-8).
> 18 tareas T-001..T-018 completadas en 7 bloques.
> 1825 tests green, 0 regressions.

---

## Cambios producidos

### Added

- `mockInterceptor.js`: handler `_handleDashboardMetrics()` para `GET /api/reports/metrics/dashboard/` — endpoint antes no interceptado (352246c)
- `mockInterceptor.js`: handlers `_handleGetSessions()` / `_handleRevokeSession()` para `GET|DELETE /api/auth/sessions/` (352246c)
- `mockInterceptor.js`: handler `_handlePipelineStatus()` para `GET /api/v1/etl/supervision/` (352246c)
- `mockInterceptor.js`: handler `_handleScheduleSubAction()` para `PATCH /api/reports/scheduled/{id}/{action}/` — pause/resume/delete/run (352246c)
- `mockInterceptor.js`: handler `_handleScheduleHistory()` para `GET /api/reports/scheduled/{id}/runs/` (352246c)
- `authService.js`: métodos `getActiveSessions()` y `revokeSession(sessionId)` con llamadas reales a `apiService` (352246c)
- `authSlice.js`: thunks async `fetchActiveSessions` y `revokeSession`, estado `sessions`/`sessionsLoading`/`sessionsError`, selectores `selectSessions`/`selectSessionsLoading`/`selectSessionsError` (352246c)
- `ActiveSessions.jsx`: conectado a Redux store via `fetchActiveSessions`/`revokeSession`; `role="alert"` para error, `role="status"` para loading (352246c)
- `ActiveSessions.test.js`: suite completa — render, loading state, error state, sessions list, revoke action (352246c)
- `reportsService.test.js`: 5 nuevos test cases para sub-acciones de scheduled reports: `pauseSchedule`, `resumeSchedule`, `deleteSchedule`, `runScheduleNow`, `getScheduleHistory` (352246c)
- `errorHandling.test.js`: 4 nuevos test cases para normalización de payloads string/null/undefined en `errorHandlingMiddleware` (352246c)
- `authSlice.test.js`: 3 nuevos test cases para `fetchActiveSessions` y `revokeSession` thunks (352246c)

### Changed

- `logsService.js`: `getPipelineStatus()` elimina objeto hardcodeado, ahora llama `apiService.get('/api/v1/etl/supervision/')` (352246c)
- `reportsService.js`: 5 métodos `pauseSchedule`/`resumeSchedule`/`deleteSchedule`/`runScheduleNow`/`getScheduleHistory` reemplazan implementaciones TODO-mock con llamadas reales a `apiService` (352246c)
- `reportsService.js`: `getRealTimeMetrics()` eliminado — el hook `useRealTimeMetrics` es el dueño de SSE (352246c)
- `DashboardPage.jsx`: despacha `fetchDashboardMetrics` (reportsSlice) en lugar de `mockFetchDashboardData` (dashboardSlice); consume `selectMetrics`/`selectReportsLoading` (352246c)
- `errorHandling.js`: `errorHandlingMiddleware` normaliza payloads string a `{ message, statusCode: null, code: 'UNKNOWN' }` antes de procesar — defiende contra thunks que usan `rejectWithValue(string)` (352246c)
- 10 slices: `rejectWithValue(error.message)` → `rejectWithValue({ message: error.message || 'Error...', statusCode: null })` en `accessSlice`, `adminSlice`, `alertsSlice`, `auditSlice`, `authSlice`, `dashboardSlice`, `logsSlice`, `reportsSlice`, `savedFiltersSlice`, `userSlice` (352246c)
- `containerComponents.test.jsx`: mock de `reportsSlice` + clave `reports` en `buildStore` para `DashboardPage` (352246c)
- `featuresComponents.test.jsx`: `ActiveSessions` envuelto en Redux Provider con `preloadedState` correcto (352246c)
- 5 tests en `reportsSlice.test.js`, `userSlice.test.js`, `accessSlice.test.js`: aserciones de error actualizadas de `toBe(string)` a `.message).toBe(string)` (352246c)

### Fixed

- `ActiveSessions.jsx` (HAL-2): `revokeSession` antes filtraba array local sin llamar API — ahora despacha thunk real (352246c)
- `logsService.getPipelineStatus` (HAL-3): eliminado objeto hardcodeado `{ status: 'RUNNING', ... }` (352246c)
- `reportsService` sub-actions (HAL-4): `pauseSchedule` etc. retornaban `Promise.resolve({ success: true })` sin llamar API (352246c)
- `DashboardPage` (HAL-1): ya no llama `mockFetchDashboardData` — conectado a endpoint real (352246c)
- Error payload normalización (HAL-6): middleware no crasheaba con payload string — ahora normaliza estructuralmente (352246c)
- Tests 5 slices: aserciones de payload de error corregidas post-normalización (352246c)

### Removed

- `reportsService.getRealTimeMetrics()`: eliminado — función duplicada que coexistía con `useRealTimeMetrics` hook. El hook es el dueño de SSE (352246c)

---

## Commits de este WP

| Hash | Tipo | Descripción |
|------|------|-------------|
| 036997b | chore | Open WP api-connectivity-ux-feedback — Phase 1 DISCOVER |
| 352246c | feat | Wire all mocked API endpoints to real service calls |
| 0833862 | chore | Update session state to Phase 11 |

---

## Deuda técnica generada (no resuelta en este WP)

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| T-DT-001 | SSE mock para `/api/realtime/metrics/` — `EventSource` no interceptable por axios mockInterceptor; necesita MSW o mock class | Media |
| T-DT-002 | `dashboardSlice.fetchDashboardData` usa `getMockDashboardData()` hardcodeado; `Dashboard.jsx` y `useDashboard.js` aún lo consumen | Alta |
| T-DT-003 | 10 pages/components sin test dedicado (AlertsPage, ProfilePage, AccessPage, AuditPage, ScheduledReports, ExportHistory, ExportPreview, ChartComponent, JobActions, JobProgressBar) | Media |
| T-DT-004 | `ProfilePage` no muestra errores al usuario (has loading, no error state) | Baja |

---

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a `main`. Entradas candidatas para `## Added`:
- Wire 8 API connectivity gaps: dashboard metrics, active sessions, pipeline status, scheduled report sub-actions
- Real `authService.getActiveSessions()`/`revokeSession()` + Redux integration
- Error payload normalization in `errorHandlingMiddleware` (string → structured object)
