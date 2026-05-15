# Plan de Implementación — Integración completa IACT-ui / IACT-api / IACT-db

**Documento:** PLAN-IMPLEMENTACION-INTEGRACION
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Estado:** Aprobado para ejecución

---

## Diagnóstico de estado actual

| Métrica | Valor |
|---|---|
| Operaciones en IACT-api schema | 239 |
| UI cubre correctamente | 72 (30 %) |
| UI llama URLs inexistentes en API | 62 (49 legacy + 11 fuera de scope + 2 bugs de sintaxis) |
| Gaps reales API→UI | 72 endpoints |
| Gateways con `fetch()` directo (legacy v4.0) | 2 (`accessGateway.js`, `auditGateway.js`) |
| Gateways con URLs legacy `/api/me/` | 1 (`sharesGateway.js`) |
| Slices con URLs directas (sin gateway) | 2 (`auth.js`, `savedFilters.js`) |

**Principios de implementación:**
- TDD estricto en cada tarea: primero el test (RED), luego la implementación (GREEN)
- Una tarea = un commit atómico
- Ninguna tarea modifica más de un gateway a la vez
- Cada fase produce suite completa en verde antes de avanzar

---

## FASE 1 — Saneamiento de base (prerequisito de todo lo demás)

**Objetivo:** corregir deuda técnica de infraestructura que bloquea la integración
correcta. Sin esta fase los tests de gateways son poco confiables.

### T1.1 — Corregir syntax bugs en template literals

**Archivos:** `src/services/adminGateway.js`, `src/services/alertsGateway.js`

| Bug | Línea | URL rota | Corrección |
|---|---|---|---|
| adminGateway `getMenuItems` | L146 | `/api/access/menu-items/${query ? ...}` | separar query en params |
| alertsGateway `getAlertHistory` | L42 | `/api/alerts/history/${params ? ...}` | separar params correctamente |

**Test:** verificar que la URL generada no contiene `$` ni paréntesis sueltos.

**Commit:** `fix(adminGateway+alertsGateway): corregir template literals malformados`

---

### T1.2 — Corregir URLs legacy en `sharesGateway.js`

`sharesGateway.js` usa `/api/me/shares/` (no existe en API).
URLs canónicas: `/api/reports/shares/`.

**Métodos a corregir:**
- `createShare()` → `POST /api/reports/shares/`
- `getSentShares()` → `GET  /api/reports/shares/?sent=true`
- `getReceivedShares()` → `GET  /api/reports/shares/?received=true`
- `revokeShare()` → `DELETE /api/reports/shares/{id}/`

**Test:** `__tests__/services/sharesGateway.integration.test.js`
**Commit:** `fix(sharesGateway): /api/me/shares/ → /api/reports/shares/`

---

### T1.3 — Corregir URLs legacy en `auth.js` (slice Redux)

`src/redux/slices/auth.js` llama directamente a:
- `POST /api/token/` → `POST /api/auth/login/`
- `POST /api/logout/` → `POST /api/auth/logout/`
- `GET  /api/user/` → `GET  /api/auth/me/`
- `POST /api/auth/recover-password/` → endpoint correcto en API

**Regla:** los slices no llaman a la API directamente — delegan en el gateway.
Reemplazar llamadas directas por `authGateway.login()`, `authGateway.logout()`, etc.

**Test:** verificar que `auth.js` no contiene ninguna llamada directa a la API.
**Commit:** `fix(auth.slice): delegar todas las llamadas a authGateway`

---

### T1.4 — Corregir URLs legacy en `savedFilters.js` (slice Redux)

`savedFilters.js` llama directamente a `/api/me/filters/` (no existe).
URL canónica: `/api/reports/me/filters/`.

Crear `savedFiltersGateway.js` con los métodos correctos y actualizar el slice.

**Métodos:**
- `getFilters()` → `GET  /api/reports/me/filters/`
- `createFilter()` → `POST /api/reports/me/filters/`
- `updateFilter(id)` → `PATCH /api/reports/me/filters/{id}/`
- `deleteFilter(id)` → `DELETE /api/reports/me/filters/{id}/`
- `getFilterDetail(id)` → `GET /api/reports/me/filters/{id}/`

**Test:** `src/services/__tests__/savedFiltersGateway.test.js`
**Commit:** `fix(savedFilters.slice+gateway): /api/me/filters/ → /api/reports/me/filters/`

---

### T1.5 — Reescribir `accessGateway.js` — migrar de fetch() a apiService

`accessGateway.js` (449 líneas, 26 métodos) usa `fetch()` directo con
`localStorage.getItem('accessToken')` — patrón v4.0 que bypasea el interceptor
de autenticación de `apiClient.js`.

**Impacto:** todos los endpoints de control de acceso (28 gaps) están bloqueados
por esta dependencia de infraestructura. Hasta que no se corrija, cualquier gateway
de acceso generará errores de autenticación en producción.

**Plan:** reescribir completo usando `apiService` con las URLs canónicas.
El test `src/services/__tests__/accessService.test.js` (165 líneas) debe actualizarse.

**Métodos a preservar (con URLs corregidas):**
- `getAllFunctions()` → `GET /api/access/functions/`
- `getUserPermissions(userId)` → `GET /api/access/permissions/{id}/`
- `assignFunctions(userId, ...)` → `POST /api/access/users/{id}/functions/assign/`
- `revokeFunctions(userId, ...)` → `DELETE /api/access/users/{id}/functions/revoke/`
- `validateSeparationRules(...)` → `POST /api/access/separation-rules/validate/`
- `getAccessAudit(userId)` → `GET /api/access/audit/`
- `assignAccessGroup(userId, ...)` → `POST /api/access/users/{id}/agr/`
- `revokeAccessGroup(userId, agrId)` → `DELETE /api/access/users/{id}/agr/{agrId}/`
- `createGroup(data)` → `POST /api/access/access-groups/`
- `updateGroup(id, data)` → `PATCH /api/access/access-groups/{id}/`
- `retireGroup(id)` → `DELETE /api/access/access-groups/{id}/`
- `assignFunctionsToGroup(groupId, ...)` → `POST /api/access/access-groups/{id}/functions/`
- `getGroupFunctions(groupId)` → `GET /api/access/access-groups/{id}/`
- `getFunctionGroups()` → `GET /api/access/groupers/`
- `getSeparationRules()` → `GET /api/access/separation-rules/`
- `createSeparationRule(data)` → `POST /api/access/separation-rules/`
- `updateSeparationRule(id, data)` → `PATCH /api/access/separation-rules/{id}/`
- `deleteSeparationRule(id)` → `DELETE /api/access/separation-rules/{id}/`
- `grantExceptionalPermission(userId, ...)` → `POST /api/access/users/{id}/exceptional-permissions/`
- `getExceptionalPermissions(userId)` → `GET /api/access/users/{id}/exceptional-permissions/`
- `revokeExceptionalPermission(userId, permId)` → `DELETE /api/access/users/{id}/exceptional-permissions/{permId}/`
- `getEffectivePermissions(userId)` → `GET /api/access/users/{id}/effective-permissions/`
- `previewExceptionalPermission(userId, ...)` → `GET /api/access/users/{id}/exceptional-permissions/preview/`
- `verifyPermission(userId, ...)` → `GET /api/access/permissions/verify/`
- `assignGrouper(userId, agrId)` → `POST /api/access/groupers/assign/`
- `getMyModules()` → `GET /api/access/my-modules/`

**Test:** `__tests__/services/accessGateway.integration.test.js`
**Commit:** `fix(accessGateway): migrar fetch() v4.0 → apiService + URLs canónicas`

---

### T1.6 — Reescribir `auditGateway.js` — migrar de fetch() a apiService

`auditGateway.js` (273 líneas, 12 métodos) usa `fetch()` con `API_BASE_URL` hardcoded.

**Métodos a preservar (con URLs canónicas):**
- `getAuditLogs(filters)` → `GET  /api/audit/logs/`
- `searchAuditLogs(query, filters)` → `POST /api/audit/search/`
- `exportAuditLog(filters)` → `POST /api/audit/export/`
- `getComplianceReport(filters)` → `POST /api/audit/compliance-report/`
- `verifyCompliance(reportId)` → `POST /api/audit/compliance-verify/`
- `getAuditLogDetail(logId)` → `GET  /api/audit/logs/{id}/`
- `getAuditEvents()` → `GET  /api/audit/audit-events/`
- `getAuditEventDetail(id)` → `GET  /api/audit/audit-events/{id}/`
- `getAuditEventAggregations()` → `GET  /api/audit/audit-events/aggregate/`
- `exportAuditEvents()` → `POST /api/audit/audit-events/export/`
- `getGeneralTimeline(filters)` → `GET  /api/audit/general/`
- `verifyIntegrity()` → `GET  /api/audit/integrity/`

**Test:** `__tests__/services/auditGateway.integration.test.js`
**Commit:** `fix(auditGateway): migrar fetch() v4.0 → apiService + URLs canónicas`

---

## FASE 2 — Gateways: métodos faltantes en dominios existentes

**Objetivo:** completar los gateways existentes con los métodos que faltan.
Cada tarea = un gateway. TDD por método.

### T2.1 — `alertsGateway.js`: añadir 10 métodos faltantes

**Métodos a añadir:**
- `getActiveAlerts(filters)` → `GET  /api/alerts/active/`
- `getAlertHistory(filters)` → `GET  /api/alerts/history/`
- `getAlertRules(filters)` → `GET  /api/alerts/rules/`
- `getAlertRuleDetail(id)` → `GET  /api/alerts/rules/{id}/`
- `pauseAlertRule(id)` → `POST /api/alerts/rules/{id}/pause/`
- `resumeAlertRule(id)` → `POST /api/alerts/rules/{id}/resume/`
- `dryRunAlertRule(config)` → `POST /api/alerts/rules/dry-run/`
- `acknowledgeAlert(id, note)` → `POST /api/alerts/{id}/acknowledge/`
- `bulkAcknowledgeAlerts(ids)` → `POST /api/alerts/bulk-acknowledge/`
- `cancelAlertSubscription(id)` → `DELETE /api/alerts/me/subscriptions/{id}/`
- `getMySubscriptions()` → `GET  /api/alerts/me/subscriptions/`
- `createSubscription(data)` → `POST /api/alerts/me/subscriptions/`

**Corregir también:**
- `updateAlertRule()` → cambiar `PUT` → `PATCH /api/alerts/rules/{id}/`
- `getAlertHistory()` — corregir el template literal malformado (T1.1)

**Test:** `__tests__/services/alertsGateway.integration.test.js`
**Commit:** `feat(alertsGateway): +12 métodos — alertas, reglas, suscripciones`

---

### T2.2 — `userGateway.js`: añadir 6 métodos faltantes

**Métodos a añadir:**
- `createUser(data)` → `POST /api/users/create/`
- `updateUser(id, data)` → `PATCH /api/users/{id}/`
- `activateUser(id)` → `POST /api/users/{id}/activate/`
- `deactivateUser(id)` → `POST /api/users/{id}/deactivate/`
- `resetUserPassword(id)` → `POST /api/users/{id}/reset-password/`
- `closeAllSessions(id)` → `POST /api/auth/sessions/close-all/`

**Corregir:**
- `blockUser()` → verificar URL canónica vs `/api/users/{id}/block/`
- `unblockUser()` → verificar URL canónica

**Test:** `__tests__/services/userGateway.integration.test.js`
**Commit:** `feat(userGateway): +6 métodos — CRUD usuarios, sesiones`

---

### T2.3 — `authGateway.js`: añadir 4 métodos de sesiones faltantes

**Métodos a añadir:**
- `getOwnSessions()` → `GET  /api/auth/sessions/own/`
- `closeSession(id)` → `POST /api/auth/sessions/{id}/close/`
- `closeAllSessions()` → `POST /api/auth/sessions/close-all/`
- `getMyMenu()` → `GET  /api/me/menu/`

**Test:** ampliar `__tests__/services/authGateway.integration.test.js`
**Commit:** `feat(authGateway): +4 métodos — sesiones propias y menú dinámico`

---

### T2.4 — `logsGateway.js`: añadir 3 métodos faltantes

**Métodos a añadir:**
- `getPipelineIVRHealth()` → `GET  /api/pipeline/ivr-health/`
- `getLogExportJobs()` → `GET  /api/logs/export/`
- `getLogPipelineEvents()` → `GET  /api/logs/pipeline-events/`

**Test:** ampliar `__tests__/services/logsGateway.integration.test.js`
**Commit:** `feat(logsGateway): +3 métodos — IVR health, export jobs, pipeline events`

---

### T2.5 — `reportsGateway.js`: añadir 5 métodos faltantes

**Métodos a añadir:**
- `getExportJobs()` → `GET  /api/reports/export/`
- `cancelExport(id)` → `DELETE /api/reports/export/{id}/`
- `updateSchedule(id, data)` → `PATCH /api/reports/schedules/{id}/`
- `getFilterDetail(id)` → `GET  /api/reports/me/filters/{id}/`
- `updateFilter(id, data)` → `PATCH /api/reports/me/filters/{id}/`
- `updateSavedView(id, data)` → `PATCH /api/reports/me/views/{id}/`

**Test:** ampliar `__tests__/services/reportsGateway.integration.test.js`
**Commit:** `feat(reportsGateway): +6 métodos — exports, schedules, filtros`

---

### T2.6 — Crear `navigationGateway.js`

Nuevo gateway para los endpoints de navegación dinámica.

**Métodos:**
- `getNavigationMenu()` → `GET /api/navigation/menu/`
- `getNavigationModules()` → `GET /api/navigation/modules/`

**Test:** `__tests__/services/navigationGateway.integration.test.js`
**Commit:** `feat(navigationGateway): nuevo gateway — menú y módulos dinámicos`

---

## FASE 3 — Redux: sincronizar slices con gateways actualizados

**Objetivo:** actualizar los slices de Redux para que usen los nuevos métodos
de gateways y reflejen el estado correcto de la aplicación.

### T3.1 — `alerts.js` slice: añadir thunks para métodos de T2.1

Thunks a añadir:
- `fetchActiveAlerts(filters)`
- `fetchAlertHistory(filters)`
- `fetchAlertRules(filters)`
- `acknowledgeAlertAction(id, note)`
- `bulkAcknowledgeAction(ids)`
- `createAlertSubscription(data)`
- `cancelAlertSubscription(id)`
- `pauseAlertRule(id)` / `resumeAlertRule(id)`

Estado extendido: `activeAlerts`, `alertHistory`, `alertRules`, `subscriptions`.

**Commit:** `feat(alerts.slice): +8 thunks — alertas activas, historial, suscripciones`

---

### T3.2 — `access.js` slice: sincronizar con accessGateway reescrito (T1.5)

El slice `access.js` (23 thunks) puede tener thunks que llaman directamente
al `accessGateway` con métodos que ya no existen o cambiaron de firma.

Validar cada thunk, actualizar los que llaman a `accessGateway` con métodos
renombrados, añadir los thunks que faltan:
- `fetchMyModules()`
- `fetchEffectivePermissions(userId)`
- `previewExceptionalPermission(userId, data)`
- `verifyPermission(userId, code)`

**Commit:** `feat(access.slice): sincronizar con accessGateway v2`

---

### T3.3 — `audit.js` slice: sincronizar con auditGateway reescrito (T1.6)

El slice `audit.js` (6 thunks) probablemente tiene thunks que llaman a `auditGateway`
con las firmas antiguas de `fetch()`.

Actualizar los 6 thunks existentes. Añadir:
- `fetchAuditEvents(filters)`
- `getAuditEventDetail(id)`
- `getAuditEventAggregations(filters)`
- `exportAuditEvents(filters)`
- `generateComplianceReport(filters)`
- `verifyComplianceReport(id)`
- `verifyIntegrity()`

**Commit:** `feat(audit.slice): sincronizar con auditGateway v2 + 7 thunks nuevos`

---

### T3.4 — `user.js` slice: añadir thunks para métodos de T2.2

Thunks a añadir:
- `createUserAction(data)`
- `updateUserAction(id, data)`
- `activateUserAction(id)`
- `deactivateUserAction(id)`
- `resetPasswordAction(id)`

**Commit:** `feat(user.slice): +5 thunks — CRUD completo de usuarios`

---

### T3.5 — `auth.js` slice: delegar a authGateway + añadir thunks de sesiones

Continúa T1.3: reemplazar llamadas directas restantes y añadir:
- `fetchOwnSessions()`
- `closeSessionAction(id)`
- `closeAllSessionsAction()`
- `fetchMyMenuAction()`

**Commit:** `feat(auth.slice): +4 thunks sesiones + delegar completamente a authGateway`

---

### T3.6 — Crear `navigation.js` slice

Nuevo slice para el gateway de navegación (T2.6).

Estado: `menu`, `modules`, `loading`, `error`.
Thunks: `fetchNavigationMenu()`, `fetchNavigationModules()`.

**Commit:** `feat(navigation.slice): nuevo slice para menú y módulos dinámicos`

---

## FASE 4 — Páginas: conectar componentes a los nuevos gateways/slices

**Objetivo:** asegurar que cada página usa los thunks correctos del slice correspondiente.
No crear páginas nuevas — conectar las existentes a la capa de datos correcta.

### T4.1 — `pages/access/`: conectar páginas de control de acceso

Páginas existentes (11): `AssignFunctions.jsx`, `Permissions.jsx`, `GroupComposition.jsx`,
`AssignGroup.jsx`, `Segments.jsx`, `GroupManagement.jsx`, `AccessAudit.jsx`,
`TemporaryPermissions.jsx`, `PermissionsAudit.jsx`, `Groupers.jsx`, `SeparationRules.jsx`.

Verificar que cada página despacha los thunks correctos del slice `access.js`
actualizado en T3.2. Corregir las que aún llaman directamente a `accessGateway`
con la API v4.0.

**Test:** `src/pages/access/__tests__/` — tests de render para cada página.
**Commit:** `fix(pages/access): conectar a access.slice v2`

---

### T4.2 — `pages/alerts/`: conectar páginas de alertas

Páginas existentes (5): `Subscriptions.jsx`, `Alerts.jsx`, `AlertHistory.jsx`,
`Templates.jsx`, `AlertConfig.jsx`.

Verificar uso de `alerts.slice` actualizado. `AlertHistory.jsx` y `Subscriptions.jsx`
necesitan los thunks añadidos en T3.1.

**Commit:** `fix(pages/alerts): conectar a alerts.slice v2`

---

### T4.3 — `pages/audit/`: conectar páginas de auditoría

Páginas existentes (4): `ComplianceReport.jsx`, `Export.jsx`, `AuditSearch.jsx`, `Audit.jsx`.

Verificar uso de `audit.slice` actualizado (T3.3). `AuditSearch.jsx` necesita
`fetchAuditEvents`, `Export.jsx` necesita `exportAuditEvents`.

**Commit:** `fix(pages/audit): conectar a audit.slice v2`

---

### T4.4 — Crear `pages/users/UserManagement/`: página de gestión de usuarios

El directorio existe (`src/pages/users/UserManagement/`) pero sin páginas JSX.
Los endpoints de usuarios (UC_USR_01..04) están implementados en IACT-api pero
sin página en UI.

Crear: `UserManagement.jsx` con listado, creación, edición y baja de usuarios.
Usar el slice `user.js` actualizado (T3.4).

**Test:** `src/pages/users/UserManagement/__tests__/UserManagement.test.jsx`
**Commit:** `feat(pages/users): UserManagement con CRUD completo UC_USR_01..04`

---

### T4.5 — `pages/logs/`: conectar a logsGateway actualizado

Páginas existentes (10). Las nuevas de T2.4 necesitan conectarse:
- `SystemStatus.jsx` → `logsGateway.getPipelineIVRHealth()`
- `LogExport.jsx` → `logsGateway.getLogExportJobs()`

**Commit:** `fix(pages/logs): conectar a logsGateway v2`

---

### T4.6 — `pages/reports/`: conectar a reportsGateway actualizado

Páginas existentes (12). Verificar que usan los métodos corregidos:
- `ScheduledReport.jsx` → `reportsGateway.updateSchedule()` (PATCH)
- `ReportExport.jsx` → `reportsGateway.cancelExport()`, `reportsGateway.getExportJobs()`
- `SavedViews.jsx` → `reportsGateway.updateSavedView()` (PATCH)

**Commit:** `fix(pages/reports): conectar a reportsGateway v2`

---

## FASE 5 — Eliminar código muerto y referencias obsoletas

**Objetivo:** eliminar todos los rastros de URLs legacy, gateways v4.0 obsoletos
y código que nunca será llamado. 0 deuda técnica en la capa de servicios.

### T5.1 — Eliminar `jobGateway.js` obsoleto

`jobGateway.js` (188 líneas) usa `/api/job/start/`, `/api/job/{id}/status/`,
`/api/job/{id}/cancel/` — rutas que no existen en IACT-api.

La funcionalidad equivalente está en `reportsGateway.exportReport()` y
`reportsGateway.getExportJobs()`.

**Acción:** eliminar `jobGateway.js` y actualizar todo código que lo importe.
**Test:** verificar que ningún archivo importa `jobGateway`.
**Commit:** `remove(jobGateway): eliminado — funcionalidad en reportsGateway`

---

### T5.2 — Eliminar `transactionGateway.js` — fuera de scope

`transactionGateway.js` (246 líneas) implementa un sistema de transacciones
(`/api/transaction/...`) que no existe en IACT-api. Es código huérfano
sin backend correspondiente.

**Acción:** eliminar `transactionGateway.js`, `src/redux/slices/` si tiene slice
relacionado, y todas sus referencias.
**Commit:** `remove(transactionGateway): fuera de scope — sin endpoint en IACT-api`

---

### T5.3 — Limpiar `alertGateway.js` (distinto de `alertsGateway.js`)

`alertGateway.js` (10 líneas, 1 método) es un gateway residual distinto de
`alertsGateway.js`. Consolidar en `alertsGateway.js`.
**Commit:** `remove(alertGateway): consolidado en alertsGateway`

---

### T5.4 — Limpiar `exportGateway.js` — funcionalidad de cliente, no de API

`exportGateway.js` exporta a Excel/PDF usando `ExcelJS` y `jsPDF` en el cliente.
No es un gateway de API — es una utilidad de UI. Mover a `src/utils/exportUtils.js`.
**Commit:** `refactor(exportGateway): mover a utils/exportUtils.js`

---

### T5.5 — Actualizar `services/index.js` — reexportar correctamente

`index.js` exporta todos los gateways. Actualizar para reflejar los cambios
de T5.1..T5.4 (remociones, renombres).
**Commit:** `fix(services/index): actualizar exports tras saneamiento`

---

## FASE 6 — Tests: cobertura completa de todos los gateways

**Objetivo:** cada gateway tiene su suite de integración TDD con cobertura
de todos los métodos, incluyendo casos de error (503, 403, 400).

### T6.1 — `accessGateway.integration.test.js`: 26 métodos × 3 casos = ~78 tests

Casos por método:
- URL correcta (método + path)
- Parámetros correctos (body/params)
- Error 403 propagado correctamente

**Commit:** `test(accessGateway): cobertura completa 78 tests`

---

### T6.2 — `auditGateway.integration.test.js`: 12 métodos × 3 casos = ~36 tests

**Commit:** `test(auditGateway): cobertura completa 36 tests`

---

### T6.3 — `alertsGateway.integration.test.js`: ampliar a ~45 tests

**Commit:** `test(alertsGateway): cobertura completa 45 tests`

---

### T6.4 — `userGateway.integration.test.js`: ~18 tests

**Commit:** `test(userGateway): cobertura completa 18 tests`

---

### T6.5 — `sharesGateway.integration.test.js`: ~12 tests

**Commit:** `test(sharesGateway): cobertura completa 12 tests`

---

### T6.6 — `navigationGateway.integration.test.js`: ~6 tests

**Commit:** `test(navigationGateway): cobertura completa 6 tests`

---

### T6.7 — `savedFiltersGateway.integration.test.js`: ~15 tests

**Commit:** `test(savedFiltersGateway): cobertura completa 15 tests`

---

## FASE 7 — Verificación final y documentación

### T7.1 — Suite completa IACT-ui: 0 fallos

```
npm test -- --no-coverage
  Target: 226+ suites passed, 2032+ tests passed, 0 failed
```

### T7.2 — Suite completa IACT-api: 0 fallos

```
python3 -m pytest tests/unit/ tests/integration/ --tb=no
  Target: 1060+ passed, 0 failed
  drf-spectacular: Errors: 0
```

### T7.3 — IACT-db: 0 errores

```
bash verify.sh
  Target: OK: 27, Errores: 0
```

### T7.4 — Documento de hallazgos FASE 7

Artefacto: `HALLAZGOS-FASE7-INTEGRACION-COMPLETA-YYYY-MM-DD.md`

---

## Resumen de tareas

| Fase | Tareas | Tipo | Estimado tests nuevos |
|---|---|---|---|
| F1 — Saneamiento | T1.1..T1.6 | fix / refactor | ~90 |
| F2 — Gateways | T2.1..T2.6 | feat | ~60 |
| F3 — Redux | T3.1..T3.6 | feat | ~40 |
| F4 — Páginas | T4.1..T4.6 | fix / feat | ~30 |
| F5 — Código muerto | T5.1..T5.5 | remove / refactor | 0 |
| F6 — Tests | T6.1..T6.7 | test | ~210 |
| F7 — Verificación | T7.1..T7.4 | docs | — |
| **Total** | **33 tareas** | | **~430 tests nuevos** |

---

## Orden de ejecución y dependencias

```
T1.1 → T2.1 (alertsGateway depende del fix de T1.1)
T1.2 → T5.3 (consolidar alertGateway)
T1.3 → T3.5 (auth.slice después del gateway)
T1.4 → T3.x (savedFilters después del gateway)
T1.5 → T3.2, T4.1 (accessGateway → access.slice → pages/access)
T1.6 → T3.3, T4.3 (auditGateway → audit.slice → pages/audit)
T2.1 → T3.1, T4.2
T2.2 → T3.4, T4.4
T2.3 → T3.5, T4.5
T2.4 → T4.5
T2.5 → T4.6
T2.6 → T3.6, AppRouter
T5.1 → después de T2.5 (reportsGateway cubre exportReport)
T5.2 → después de T1.3 (transactionGateway fuera de scope confirmado)
T6.x → después de la fase correspondiente (F1, F2)
T7.x → al final de todo
```

---

## Gestión de riesgo

| Riesgo | Mitigación |
|---|---|
| `accessGateway.js` tiene 449 líneas y 26 métodos — reescritura compleja | Reescribir por grupos de 5 métodos, verificar tests tras cada grupo |
| `access.js` slice (23 thunks) puede tener dependencias no documentadas | Leer todos los imports antes de modificar |
| Páginas de acceso pueden tener lógica de negocio mezclada con el gateway | Refactorizar solo la capa de llamadas, no la lógica de presentación |
| Tests de slices pueden fallar por cambios en la firma de los thunks | Actualizar tests de slices antes de cambiar la firma |

