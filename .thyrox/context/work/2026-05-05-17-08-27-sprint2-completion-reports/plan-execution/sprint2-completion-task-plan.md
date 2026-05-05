```yml
created_at: 2026-05-05 17:21:47
project: IACT-UI
work_package: 2026-05-05-17-08-27-sprint2-completion-reports
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Borrador
```

# Task Plan — Sprint 2 + REST URL Debt Resolution

Metodología: TDD (RED→GREEN→commit). Código en inglés, JSDoc/UI en español.
URLs canónicas tomadas de IACT-docs (`discover/api-url-debt-analysis.md`).

---

## Grupo A — Baja lógica (T-013)

- [x] **T-013** Baja lógica en `UserList.jsx` y `UserForm.jsx` (pages/UserManagement):
  - `UserList.jsx`: badge `state` (ACTIVE/INACTIVE/BLOCKED/ELIMINATED), botón "Dar de baja"
    llama `onDeactivate(user.id)` — oculto si `state === 'ELIMINATED'`.
  - `UserForm.jsx`: campo `status` cambia a `state` enum; formulario oculta "Dar de baja"
    cuando `user.state === 'ELIMINATED'`.
  - **UC:** UC-USR-04
  - **Deps:** T-012 (containers/UserManagement ya conectado a slice)

---

## Grupo B — Corrección URLs REST (TD-ACC-01..05)

- [x] **T-025** Reescribir `assignFunction` en `accessService.js`:
  - Método: `assignFunctions(userId, functionIds[], expiresAt)` (bulk)
  - URL: `POST /users/${userId}/functions/`
  - Body: `{ function_ids: functionIds, expires_at: expiresAt }`
  - **Fuente:** UC-ACC-01 seq diagram (PROVEN)

- [x] **T-026** Reescribir `revokeFunction` en `accessService.js`:
  - Método: `revokeFunctions(userId, functionIds[], revokeReason)` (bulk)
  - URL: `DELETE /users/${userId}/functions/`
  - Body: `{ function_ids: functionIds, revoke_reason: revokeReason }`
  - **Fuente:** UC-ACC-02 seq diagram (PROVEN)

- [x] **T-027** Reescribir `exportAudit` en `accessService.js`:
  - Método: `exportAuditLog(filters, period, format, includeArchive)`
  - URL: `POST /audit/export/` (módulo audit, no access)
  - Body: `{ filters, period, format, include_archive }`
  - Respuesta: `202 + { job_id }` — NO blob (export es async)
  - **Fuente:** UC-AUD-03 (PROVEN)

- [x] **T-028** Reescribir `assignFunctionGroup` en `accessService.js`:
  - Método: `assignAccessGroup(userId, agrId, expiresAt)` (AGR)
  - URL: `POST /users/${userId}/access-groups/`
  - Body: `{ agr_id: agrId, expires_at: expiresAt }`
  - **Fuente:** UC-ACC-04 seq diagram (PROVEN)

- [x] **T-029** Actualizar `mockInterceptor.js` + `docs/guides/rest-api-conventions.md`:
  - Agregar handlers en mockInterceptor para las 4 nuevas URLs
  - Actualizar tabla "Mapa de URLs correctas" en rest-api-conventions.md
    (TD-ACC-01..04 marcados como ✅ Corregido)

---

## Grupo C — Reports service (T-020..T-024)

- [ ] **T-020** Crear `src/services/reportsService.js` con métodos:
  `getDashboardMetrics()`, `getAgentsReport(filters)`, `getQueuesReport(filters)`,
  `getCampaignsReport(filters)`, `scheduleReport(config)`,
  `getScheduledReports()`, `exportReport(type, format, filters)`.
  Patrón singleton como `accessService.js`. JSDoc en español.
  **Archivos:** `src/services/reportsService.js` (nuevo)

- [ ] **T-021** Crear `src/redux/slices/reportsSlice.js`:
  Thunks: `fetchDashboardMetrics`, `fetchScheduledReports`, `createScheduledReport`.
  Selectores: `selectMetrics`, `selectScheduledReports`, `selectReportsLoading`, `selectReportsError`.
  **Archivos:** `src/redux/slices/reportsSlice.js` (nuevo)
  **Deps:** T-020

- [ ] **T-022** Conectar `AnalyticsDashboard.jsx` a `reportsSlice`:
  Reemplazar `mockMetrics` con `useSelector(selectMetrics)`,
  dispatch `fetchDashboardMetrics` en mount.
  **Archivos:** `src/components/pages/Analytics/AnalyticsDashboard.jsx`
  **Deps:** T-021

- [ ] **T-023** Integrar WebSocket en `AnalyticsDashboard.jsx`:
  Suscribir al canal `metrics` en mount, actualizar state con cada mensaje,
  desuscribir en unmount. Usar `websocketService` existente.
  **Archivos:** `src/components/pages/Analytics/AnalyticsDashboard.jsx`
  **Deps:** T-022

- [ ] **T-024** Tests TDD para `reportsService.js` y `reportsSlice.js`:
  - reportsService: fetch calls, error handling, parámetros de endpoints
  - reportsSlice: thunks, selectores, estados loading/error
  **Archivos:** `src/services/__tests__/reportsService.test.js` (nuevo),
  `src/redux/slices/__tests__/reportsSlice.test.js` (nuevo)
  **Deps:** T-021
