```yaml
type: Focus Actual
version: 1.0
project: IACT-UI
updated_at: 2026-05-08 05:40:00
branch: claude/project-analysis-N9IkV
wp_activo: null
```

# Focus — IACT-UI

## Sin WP activo

**Versión actual:** 0.1.x (feature branch — sin release en main aún)
**Branch activo:** `claude/project-analysis-N9IkV`
**Tests:** 1799 passing, 209 suites (verificado 2026-05-08)

### Deuda técnica pendiente — TD-NM-001..006

Registrada en `technical-debt.md`. Próximo WP recomendado:
- TD-NM-001: 56 `*Page.jsx` con sufijo prohibido
- TD-NM-002: 16 `*Slice.js` con sufijo prohibido
- TD-NM-003: 20 `*Service.js` con sufijo prohibido
- TD-NM-004: 8 Webpack aliases con nombres técnicos (ALTO riesgo — 500+ imports)
- TD-NM-005: Hooks con nombres técnicos
- TD-NM-006: Acrónimos en identifiers

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

