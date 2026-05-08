```yaml
type: Focus Actual
version: 1.0
project: IACT-UI
updated_at: 2026-05-08 05:50:00
branch: claude/project-analysis-N9IkV
wp_activo: 2026-05-08-01-31-21-systemic-naming-violations
```

# Focus — IACT-UI

## WP activo — systemic-naming-violations (Phase 1 DISCOVER)

**WP:** `2026-05-08-01-31-21-systemic-naming-violations`
**Phase:** Phase 1 DISCOVER — completa
**Próximo:** SP-01 gate → Phase 8 PLAN EXECUTION (scope HAL-4 a confirmar)

Scope:
- HAL-1: 57 archivos `*Page.jsx` — sufijo prohibido
- HAL-2: 17 archivos `*Slice.js` — sufijo prohibido
- HAL-3: 20 archivos `*Service.js` — sufijo prohibido
- HAL-4: 14 Webpack aliases con nombres técnicos (CRÍTICO: 374 refs) — pendiente SP-01
- HAL-5: 5 hooks con nombres técnicos (useAuth, useAPI, useWebSocket, useJobPolling, useAlertPolling)
- HAL-6: 113 ocurrencias de acrónimos en identifiers

---

## Completado — WP dashboard-cleanup-naming-conventions ✓

**WP cerrado:** `2026-05-08-01-05-10-dashboard-cleanup-naming-conventions`
**Phase 11 TRACK/EVALUATE:** completada

29 tareas, 6 commits. 1799 tests, 0 regressions.
Entregables: dashboardSlice eliminado, 5 renames de naming HAL-2..5, TD-NM-001..006 documentados.

---

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

