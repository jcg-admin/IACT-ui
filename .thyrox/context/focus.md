```yaml
type: Focus Actual
version: 1.0
project: IACT-UI
updated_at: 2026-05-08 00:46:45
branch: claude/project-analysis-N9IkV
wp_activo: null
```

# Focus — IACT-UI

## Completado — WP api-connectivity-ux-feedback ✓

**WP cerrado:** `2026-05-07-23-37-33-api-connectivity-ux-feedback`
**Branch:** `claude/project-analysis-N9IkV`
**Phase 11 TRACK/EVALUATE:** completada

8 gaps de conectividad API resueltos (HAL-1..HAL-8). 18 tareas T-001..T-018.
1825 tests passing en 212 suites. 0 regressions.

### Entregables principales

- `mockInterceptor.js`: 5 nuevos handlers (dashboard metrics, sessions, pipeline, schedule sub-actions, schedule history)
- `authService.js` + `authSlice.js`: `getActiveSessions`/`revokeSession` con Redux thunks y selectores
- `ActiveSessions.jsx`: conectado al store — ya no filtra array local
- `DashboardPage.jsx`: despacha `fetchDashboardMetrics` (reportsSlice) — ya no usa mock
- `errorHandlingMiddleware`: normaliza string payloads → objeto `{ message, statusCode, code }`
- 10 slices: `rejectWithValue(string)` → `rejectWithValue({ message, statusCode })`
- Tests: ActiveSessions suite completa, 5 reportsService tests, 4 errorHandling normalization tests

## Sin WP activo

**Versión actual:** 0.1.x (feature branch — sin release en main aún)
**Branch activo:** `claude/project-analysis-N9IkV`

### Próximo en ROADMAP

Iniciar nuevo WP para las deudas técnicas documentadas en T-DT-001..T-DT-004:
- T-DT-002 (ALTA): `dashboardSlice` + `Dashboard.jsx` + `useDashboard.js` aún usan mock data
- T-DT-001 (MEDIA): SSE mock para `/api/realtime/metrics/` (MSW o mock EventSource)
- T-DT-003 (MEDIA): Tests para 10 páginas sin cobertura
- T-DT-004 (BAJA): ProfilePage error visibility

### Deuda técnica pendiente

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| T-DT-002 | `dashboardSlice.fetchDashboardData` usa `getMockDashboardData()` hardcodeado; `Dashboard.jsx` + `useDashboard.js` lo consumen | Alta |
| T-DT-001 | SSE mock para `/api/realtime/metrics/` — `EventSource` no interceptable por axios | Media |
| T-DT-003 | 10 pages/components sin test dedicado | Media |
| T-DT-004 | `ProfilePage` no muestra errores al usuario | Baja |
