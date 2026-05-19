```yml
created_at: 2026-05-06 05:31:18
feature: uc-full-implementation
wp: 2026-05-06-02-07-30-uc-full-implementation
fase: FASE activa (branch claude/project-analysis-N9IkV)
commits: 8
```

# WP Changelog — uc-full-implementation

> Registro de cambios producidos por este work package.
> Branch: `claude/project-analysis-N9IkV`
> Commits desde apertura del WP hasta Phase 11.

---

## Cambios producidos

### Added

- `ConfirmModal.jsx` — componente shared wrapper sobre `Modal.jsx` con variantes
  `danger`/`warning`/`default`, footer [Cancelar][Confirmar], props forwarding (1537a72)
- `ConfirmModal.test.jsx` — 8 tests TDD: render, variantes, callbacks, ESC key (1537a72)
- 4 constantes en `FunctionCatalog`: `MANAGE_SOD_RULES`, `RETRY_PIPELINE`,
  `SHARE_REPORTS`, `VIEW_PERMISSIONS_AUDIT` (1537a72)
- Confirmación de logout en `UserMenu.jsx` via `ConfirmModal` — reemplaza `window.confirm` (6794607)
- Confirmación de acknowledge en `AlertsPage.jsx` via `ConfirmModal variant='warning'` (6794607)
- Tab "Revocar" en `AssignFunctionsPage.jsx` con lista de funciones asignadas y
  botón "Revocar seleccionadas" que despacha `revokeFunction` (495b047)
- CRUD SoD en `SeparationRulesPage.jsx`: modal "Nueva regla", desactivar regla,
  datos desde Redux `useSelector(selectSodRules)` (495b047)
- 3 thunks en `accessSlice`: `createSoDRule`, `updateSoDRule`, `deactivateSoDRule` (495b047)
- 3 métodos en `accessService`: `createSoDRule`, `updateSoDRule`, `deactivateSoDRule` — mock-first (495b047)
- `GroupAssignModal.jsx` — modal dual-mode (assign/revoke) con lista de grupos,
  checkbox, footer condicional (d164f0d)
- `GroupAssignModal.test.jsx` — tests TDD para mode assign y mode revoke (d164f0d)
- Thunks en `accessSlice`: `assignGroupToUser`, `fetchUserGroups`, `revokeGroupFromUser` (d164f0d)
- Botón "Asignar a usuario" en `GroupManagementPage.jsx` — abre `GroupAssignModal` (d164f0d)
- `PermissionsAuditPage.jsx` — página nueva con búsqueda de usuario, tabla permisos
  efectivos (función/origen/fecha), dispatch `fetchEffectivePermissions` (d164f0d)
- `PermissionsAuditPage.test.jsx` — tests TDD para render y filtrado (d164f0d)
- Thunk `fetchEffectivePermissions(userId)` en `accessSlice` (d164f0d)
- Ruta `/access/audit/permissions` en `AppRouter.jsx` con `ProtectedRoute(VIEW_PERMISSIONS_AUDIT)` (d164f0d)
- Botón "Solo errores" en `ETLLogsPage.jsx` con badge de conteo de errores (defe530)
- `ETLAvailabilityPage.jsx` — tabla fuentes de datos con badges de freshness
  (verde <1h, amarillo <6h, rojo >6h) (defe530)
- `ETLAvailabilityPage.test.jsx` — 4 tests TDD (defe530)
- Thunk `fetchETLAvailability` en `logsSlice` + `etlAvailability: []` en state (defe530)
- Método `getETLAvailability()` en `logsService` — mock-first (defe530)
- Thunk `retryPipeline(pipelineId)` en `logsSlice` + `retryStatus: {}` keyed by id (defe530)
- Método `retryPipeline(pipelineId)` en `logsService` — mock-first (defe530)
- Botón "Reintentar" en `ETLLogsPage.jsx` — visible solo en filas failed,
  abre `ConfirmModal variant='warning'`, despacha `retryPipeline` (defe530)
- Ruta `/logs/etl/availability` en `AppRouter.jsx` con `ProtectedRoute(VIEW_LOGS)` (defe530)
- `SavedFiltersPanel` integrado en 5 páginas de reportes (Queues, Campaigns,
  Transfers, IVRMenus, UniqueClients) con botón "Guardar vista" (eec45cc)
- Tab "Historial" en `AnalyticsDashboard.jsx` con tabla de reportes generados,
  columnas tipo/formato/fecha, empty state (eec45cc)
- Thunk `fetchReportHistory` en `reportsSlice` + `reportHistory: []` en state (eec45cc)
- Método `getReportHistory()` en `reportsService` — mock-first `GET /api/reports/history/` (eec45cc)
- `ShareReportModal.jsx` — modal con input URL readonly, botón "Copiar enlace"
  con clipboard API + feedback "¡Copiado!" por 2s, footer [Cerrar] (e8d0ba6)
- `ShareReportModal.test.jsx` — 6 tests TDD (e8d0ba6)
- Botón "Compartir" en 6 páginas de reportes (Agents, Queues, Campaigns,
  Transfers, IVRMenus, UniqueClients) — abre `ShareReportModal` (e8d0ba6)
- Thunk `shareReport(type, filters)` en `reportsSlice` + `sharedUrl: null` en state (e8d0ba6)
- Función `generateShareUrl(type, filters)` en `reportsService` — client-side
  con `URLSearchParams`, sin backend (e8d0ba6)

### Changed

- `UserMenu.jsx` — flujo de logout ahora pasa por `ConfirmModal` (6794607)
- `AlertsPage.jsx` — flujo de acknowledge ahora pasa por `ConfirmModal` (6794607)
- `SeparationRulesPage.jsx` — datos hardcoded reemplazados por Redux store (495b047)
- `accessSlice.js` — ampliado con 7 thunks nuevos y 3 state keys (d164f0d, 495b047)
- `accessService.js` — ampliado con 5 métodos nuevos mock-first (d164f0d, 495b047)
- `ETLLogsPage.jsx` — agregado filtro "Solo errores" y flujo retry con ConfirmModal (defe530)
- `logsSlice.js` — ampliado con 2 thunks y 2 state keys (defe530)
- `logsService.js` — ampliado con 2 métodos mock-first (defe530)
- `reportsSlice.js` — ampliado con 2 thunks, 2 state keys, 2 selectores (eec45cc, e8d0ba6)
- `reportsService.js` — ampliado con 2 métodos (eec45cc, e8d0ba6)
- `AnalyticsDashboard.jsx` — tab Historial agregado (eec45cc)
- `AppRouter.jsx` — 2 rutas nuevas agregadas (d164f0d, defe530)

### Fixed

- `catalog.js` — `MANAGE_SOD_RULES` tenía 5 segmentos; corregido a 4 segmentos
  `sistema.administracion.sod.gestionar` para pasar `catalog.test.js` (e8d0ba6)
- Tests de `remainingAccessPages.test.jsx` — mock de accessSlice incompleto
  para `selectSodRules`, `fetchSodRules`, `updateSodRule`, `deleteSodRule` (e8d0ba6)
- Tests de `pagesComponents.test.jsx` — mock de reportsSlice incompleto
  para `fetchReportHistory`, `selectReportHistory` (e8d0ba6)
- Tests de `remainingPages.test.jsx` — mock de accessSlice incompleto
  para `selectGroups`, `assignGroupToUser`, `revokeGroupFromUser` (e8d0ba6)
- Tests de `UserManagement.test.js` — sin mock de react-redux ni de accessSlice
  al path correcto `../../../../redux/slices/accessSlice` (e8d0ba6)
- Mock de `SavedFiltersPanel` en tests — cambio de `{ default: fn }` a forma CJS
  para evitar double-wrap de Babel (e8d0ba6)

---

## Commits de este WP

| Hash | Tipo | Descripción |
|------|------|-------------|
| 3eed8ff | chore | Update now.md to Phase 11 TRACK/EVALUATE |
| e8d0ba6 | feat | Add ITER-6: uc-rpt-11 ShareReportModal + fix test regressions |
| eec45cc | feat | Add ITER-5: uc-rpt-10 SavedFiltersPanel + uc-rpt-03 Historial tab |
| defe530 | feat | Add ITER-4: uc-pip-02/03/04 ETL pipeline features |
| d164f0d | feat | Add group assign/revoke and permissions audit page |
| 495b047 | feat | Add revoke tab and SoD CRUD to access module |
| 6794607 | feat | Add logout and acknowledge confirmation modals |
| 1537a72 | feat | Add ConfirmModal component and 4 FunctionCatalog permissions |
| 3cedcfc | docs | Add Phase 8 task plan for UC full implementation |

---

## Métricas del WP

| Métrica | Valor |
|---------|-------|
| Tests baseline | 1460 |
| Tests al cerrar | 1551 |
| Tests agregados | +91 |
| UCs implementados | 13 + 2 INFRA |
| Archivos nuevos | ~12 (componentes + tests) |
| Archivos modificados | ~20 |
| Thunks Redux nuevos | 12 |
| Commits | 8 (7 feat + 1 chore) |
| Regressions | 0 |

---

## Notas de release

> Este WP no genera bump de versión de CHANGELOG.md raíz — el trabajo está en
> una feature branch (`claude/project-analysis-N9IkV`) y se promoverá cuando
> se mergee a main.
