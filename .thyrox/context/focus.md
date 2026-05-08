```yaml
type: Focus Actual
version: 1.0
project: IACT-UI
updated_at: 2026-05-08 04:58:37
branch: claude/project-analysis-N9IkV
wp_activo: null
```

# Focus — IACT-UI

## Estado actual — 0 deuda técnica

**Branch:** `claude/project-analysis-N9IkV`
**Estado:** WP `uc-alignment-full-audit` en Phase 11 TRACK/EVALUATE (pendiente gate Phase 12). **1841 tests green.**

---

## Completado — WP uc-alignment-full-audit (Phase 11 pendiente gate)

**WP:** `2026-05-08-04-19-25-uc-alignment-full-audit`
**Tests:** 1841 passing / 214 suites / 0 failures

Auditoría completa de 66 UCs de Fase 1 contra implementación real.
4 categorías de gaps identificadas y resueltas:

- **GAP-A (routing):** 3 rutas faltantes en AppRouter para páginas ACC ya implementadas
- **GAP-B (páginas):** SeparationRulesCatalog (UC-ADM-01) + MenuItemCatalog (UC-ADM-04/05) implementados
- **GAP-C (parciales):** UC-PIP-04, UC-RPT-08/09/11 confirmados pre-existentes y testeados
- **GAP-D (estructura):** UserManagement movido a `src/pages/users/` (ubicación canónica)

Artefactos: changelog + lessons-learned (6 lecciones) + risk-register actualizado.

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

