# Hallazgos FASE 3 — Sincronización Redux Slices con Gateways

**Artefacto:** HALLAZGOS-FASE3-IACT-UI-2026-05-15
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Rama:** `develop` — commits `e1bb6fe` → `64b9e12`
**Dependencias:** FASE 1 completa (gateways migrados) + FASE 2 completa (métodos añadidos)
**Metodología:** TDD estricto — tests RED antes de cada implementación
**Estado:** Cerrado — deuda técnica activa en FASE 3 = 0

---

## Resumen ejecutivo

| Métrica | Antes | Después |
|---|---|---|
| IACT-ui test suites | 238 | **246 (+8 suites)** |
| IACT-ui tests | 2149 | **2216 (+67 tests)** |
| Tests fallidos | 0 | **0** |
| Thunks Redux totales | 76 | **126 (+50)** |
| Thunks que llamaban métodos eliminados | 3 | **0** |
| Thunks que usaban URLs corregidas en T2.2 | 2 | **0** |
| Slices sin gateway propio | 1 (`savedFilters`) | **0** |
| Slices nuevos | 0 | **1** (`navigation`) |
| initialState keys sin contraparte en API | 4 | **0** |

---

## Contexto

FASE 3 sincroniza la capa Redux (slices) con los gateways actualizados en FASE 1 y FASE 2. El problema central es la brecha acumulada: los gateways fueron corregidos (URLs, métodos eliminados, métodos añadidos) pero los slices continuaban invocando métodos que ya no existían o ignoraban los métodos nuevos, dejando inaccesibles desde Redux el 60 % de los endpoints de IACT-api.

**Principio de diseño aplicado:** los slices de Redux nunca llaman al cliente HTTP directamente. Todo acceso a la API pasa por el gateway correspondiente. Los slices gestionan estado; los gateways gestionan transporte.

---

## H-F3-001 — alerts.slice: fetchTemplates invocaba getTemplates() eliminado

**Tarea:** T3.1  
**Commit:** `e1bb6fe`  
**Tests:** `__tests__/slices/alertsSlice.sync.test.js` — 11/11 PASS

### Descripción

`alerts.slice` exportaba `fetchTemplates`, que llamaba a `alertsService.getTemplates()`. En FASE 2 (T2.1) se eliminó `getTemplates()` del gateway porque el endpoint `/api/alerts/templates/` no existe en IACT-api. El thunk seguía presente y compilaba, pero en ejecución lanzaba `TypeError: alertsService.getTemplates is not a function`.

Adicionalmente, el slice tenía una clave `templates: []` en el `initialState` sin contraparte en la API.

### Corrección

**Eliminado:** `fetchTemplates` y la clave `templates` del `initialState`.

**Añadidos (9 thunks):**

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchActiveAlerts(params)` | `getActiveAlerts()` | `GET /api/alerts/active/` |
| `fetchAlertRules(params)` | `getAlertRules()` | `GET /api/alerts/rules/` |
| `fetchAlertRuleDetail(id)` | `getAlertRuleDetail()` | `GET /api/alerts/rules/{id}/` |
| `dryRunAlertRule(config)` | `dryRunAlertRule()` | `POST /api/alerts/rules/dry-run/` |
| `pauseAlertRule(id)` | `pauseAlertRule()` | `POST /api/alerts/rules/{id}/pause/` |
| `resumeAlertRule(id)` | `resumeAlertRule()` | `POST /api/alerts/rules/{id}/resume/` |
| `bulkAcknowledgeAlerts(ids)` | `bulkAcknowledgeAlerts()` | `POST /api/alerts/bulk-acknowledge/` |
| `createSubscription(data)` | `createSubscription()` | `POST /api/alerts/me/subscriptions/` |
| `cancelSubscription(id)` | `cancelSubscription()` | `DELETE /api/alerts/me/subscriptions/{id}/` |

**`initialState` extendido:** `activeAlerts[]`, `alertRules[]`, `alertRuleDetail: null`, `dryRunResult: null`, `ruleLoading: false`.

---

## H-F3-002 — access.slice: validateGroupAssignment invocaba método eliminado

**Tarea:** T3.2  
**Commit:** `9b3850f`  
**Tests:** `__tests__/slices/accessSlice.sync.test.js` — 9/9 PASS

### Descripción

`access.slice` exportaba `validateGroupAssignment`, que llamaba a `accessService.validateGroupAssignment()`. En FASE 1 (T1.5) se eliminó ese método del gateway porque el endpoint `/api/access/groups/{id}/validate-for-user` no existe en IACT-api.

El initialState tenía `validatingGroup: false`, una clave cuyo único productor era el thunk eliminado.

### Corrección

**Eliminado:** `validateGroupAssignment` y `validatingGroup` del `initialState`.

**Añadidos (7 thunks):**

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchEffectivePermissions(userId)` | `getEffectivePermissions()` | `GET /api/access/users/{id}/effective-permissions/` |
| `verifyPermission({userId, code})` | `verifyPermission()` | `GET /api/access/permissions/verify/` |
| `previewExceptionalPermission({userId, params})` | `previewExceptionalPermission()` | `GET /api/access/users/{id}/exceptional-permissions/preview/` |
| `assignGrouperToUser({userId, agrId})` | `assignGrouper()` | `POST /api/access/groupers/assign` |
| `fetchMyModules()` | `getMyModules()` | `GET /api/access/my-modules/` |
| `fetchGroupers(params)` | `getGroupers()` | `GET /api/access/groupers/` |
| `fetchSeparationRuleDetail(id)` | `getSeparationRuleDetail()` | `GET /api/access/separation-rules/{id}/` |

**`initialState` extendido:** `effectivePermissions[]`, `permissionVerification: null`, `exceptionalPreview: null`, `groupers[]`, `myModules[]`, `separationRuleDetail: null`.

---

## H-F3-003 — audit.slice: 2 thunks invocaban métodos eliminados

**Tarea:** T3.3  
**Commit:** `bde4b50`  
**Tests:** `__tests__/slices/auditSlice.sync.test.js` — 12/12 PASS

### Descripción

`audit.slice` tenía dos thunks que invocaban métodos eliminados en FASE 1 (T1.6):

| Thunk | Llamada | Motivo de eliminación |
|---|---|---|
| `fetchAuditSummary` | `auditService.getAuditSummary()` | `/audit/summary` no existe en IACT-api |
| `fetchLoginHistory` | `auditService.getLogsByUser()` | `/audit/logs/user/{id}` no existe; los filtros van en `/api/audit/logs/` como params |

Ambos thunks lanzaban `TypeError` en ejecución. El `initialState` incluía claves residuales (`summary`, `loginHistory`, `loginHistoryLoading`, `loginHistoryError`) sin contraparte funcional.

### Corrección

**Eliminados:** `fetchAuditSummary`, `fetchLoginHistory` y las claves `summary`, `loginHistory`, `loginHistoryLoading`, `loginHistoryError` del `initialState`.

**Añadidos (9 thunks):**

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchAuditLogDetail(id)` | `getAuditLogDetail()` | `GET /api/audit/logs/{id}/` |
| `exportAuditLogs({format, filters})` | `exportLogs()` | `POST /api/audit/export/` → `{job_id}` |
| `verifyCompliance(reportId)` | `verifyCompliance()` | `POST /api/audit/compliance-verify/` |
| `fetchAuditEvents(params)` | `getAuditEvents()` | `GET /api/audit/audit-events/` |
| `fetchAuditEventDetail(id)` | `getAuditEventDetail()` | `GET /api/audit/audit-events/{id}/` |
| `fetchAuditEventAggregations(params)` | `getAuditEventAggregations()` | `GET /api/audit/audit-events/aggregate/` |
| `exportAuditEvents(filters)` | `exportAuditEvents()` | `POST /api/audit/audit-events/export/` |
| `fetchGeneralTimeline(params)` | `getGeneralTimeline()` | `GET /api/audit/general/` |
| `fetchAuditIntegrity(params)` | `verifyIntegrity()` | `GET /api/audit/integrity/` |

**`initialState` extendido:** `logDetail: null`, `complianceVerification: null`, `auditEvents[]`, `auditEventDetail: null`, `auditEventAggregations: null`, `generalTimeline[]`, `integrityResult: null`, `exportJobId: null`.

---

## H-F3-004 — user.slice: 2 thunks con URLs obsoletas de FASE 2

**Tarea:** T3.4  
**Commit:** `77d19cd`  
**Tests:** `__tests__/slices/userSlice.sync.test.js` — 10/10 PASS

### Descripción

En FASE 2 (T2.2) se corrigieron dos URLs en `userGateway.js`. `user.slice` delegaba correctamente al gateway, pero la semántica de los thunks no reflejaba el cambio de comportamiento:

| Thunk | Comportamiento anterior | Comportamiento correcto |
|---|---|---|
| `createUser(data)` | Gateway llamaba `POST /api/users/` | Gateway llama `POST /api/users/create/` (UC_USR_01) |
| `deactivateUser(id)` | Gateway llamaba `DELETE /api/users/{id}/` (baja lógica por DELETE) | Gateway llama `POST /api/users/{id}/deactivate/` |

Aunque ambos thunks compilaban y delegaban al gateway, la documentación y los reducers `extraReducers` esperaban la semántica incorrecta de v4.0 (por ejemplo, `deactivateUser.fulfilled` esperaba `action.payload.target_user_id` con la forma de respuesta del endpoint DELETE, no del endpoint POST `/deactivate/`).

### Corrección

Los thunks se reescribieron con documentación correcta. El `extraReducer` de `deactivateUser.fulfilled` se corrigió para manejar la forma de respuesta del endpoint `POST /deactivate/`.

**Añadidos (7 thunks):**

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchUserDetail(id)` | `getUserDetail()` | `GET /api/users/{id}/` |
| `patchUser({id, data})` | `patchUser()` | `PATCH /api/users/{id}/` |
| `activateUser(id)` | `activateUser()` | `POST /api/users/{id}/activate/` |
| `deleteUser(id)` | `deleteUser()` | `DELETE /api/users/{id}/` (baja lógica BR-009) |
| `resetPassword(id)` | `resetUserPassword()` | `POST /api/users/{id}/reset-password/` |
| `blockUser(id)` | `blockUser()` | `POST /api/users/{id}/block/` |
| `unblockUser(id)` | `unblockUser()` | `POST /api/users/{id}/unblock/` |

**`initialState` extendido:** `userDetail: null`, `actionLoading: false`.

---

## H-F3-005 — auth.slice: thunks de sesiones propias y menú faltantes

**Tarea:** T3.5  
**Commit:** `f894807`  
**Tests:** `__tests__/slices/authSlice.sessions.test.js` — 5/5 PASS

### Descripción

En FASE 2 (T2.3) se añadieron 4 métodos al `authGateway`: `getOwnSessions`, `closeSession`, `closeAllSessions`, `getMyMenu`. Ninguno tenía un thunk en `auth.slice`, dejando esas funcionalidades inaccesibles desde Redux.

La distinción semántica importante: `getActiveSessions()` → `GET /api/auth/sessions/` es una vista administrativa de todas las sesiones activas del sistema. `getOwnSessions()` → `GET /api/auth/sessions/own/` son las sesiones del usuario autenticado. El slice v4.0 solo exponía la vista administrativa como `fetchActiveSessions`, sin thunk para las sesiones propias.

### Corrección

**Añadidos (4 thunks):**

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchOwnSessions()` | `getOwnSessions()` | `GET /api/auth/sessions/own/` |
| `closeSessionAction(sessionId)` | `closeSession()` | `POST /api/auth/sessions/{id}/close/` |
| `closeAllSessionsAction()` | `closeAllSessions()` | `POST /api/auth/sessions/close-all/` |
| `fetchMyMenu()` | `getMyMenu()` | `GET /api/me/menu/` |

**`initialState` extendido:** `ownSessions[]`, `myMenu[]`.  
**Selectors nuevos:** `selectOwnSessions`, `selectMyMenu`.

---

## H-F3-006 — logs.slice / reports.slice: thunks de T2.4 y T2.5 faltantes. navigation.slice nuevo

**Tarea:** T3.6  
**Commit:** `64b9e12`  
**Tests:** `__tests__/slices/logsSlice.extended.test.js` — 4/4 PASS  
**Tests:** `__tests__/slices/reportsSlice.extended.test.js` — 13/13 PASS  
**Tests:** `__tests__/slices/navigationSlice.test.js` — 3/3 PASS

### logs.slice — 4 thunks faltantes (T2.4)

Los métodos añadidos al `logsGateway` en T2.4 no tenían thunks correspondientes:

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchPipelineIVRHealth()` | `getPipelineIVRHealth()` | `GET /api/pipeline/ivr-health/` |
| `fetchLogExportJobs(params)` | `getLogExportJobs()` | `GET /api/logs/export/` |
| `enqueueLogExport(params)` | `enqueueLogExport()` | `POST /api/logs/export/` → `{job_id}` |
| `fetchPipelineLogEvents(params)` | `getPipelineLogEvents()` | `GET /api/logs/pipeline-events/` |

**`initialState` extendido:** `ivrHealth: null`, `logExportJobs[]`, `logExportJobId: null`, `pipelineLogEvents[]`.

### reports.slice — 12 thunks faltantes (T2.5)

Los métodos añadidos al `reportsGateway` en T2.5 no tenían thunks correspondientes. Adicionalmente, varios métodos existentes en el gateway (`createSavedView`, `updateSavedView`, `cloneSavedView`, `getSavedViewDetail`) tampoco tenían thunks en el slice.

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchExportJobs(params)` | `getExportJobs()` | `GET /api/reports/export/` |
| `fetchExportJobDetail(id)` | `getExportJobDetail()` | `GET /api/reports/export/{id}/` |
| `cancelExport(id)` | `cancelExport()` | `DELETE /api/reports/export/{id}/` |
| `updateSchedule({id, data})` | `updateSchedule()` | `PATCH /api/reports/schedules/{id}/` |
| `fetchUniqueClientsAnon(params)` | `getUniqueClientsAnonReport()` | `GET /api/reports/ivr/unique-clients/` |
| `fetchRealtimeMetrics(params)` | `getRealtimeMetrics()` | `GET /api/reports/realtime/` |
| `fetchAgentDetail(id)` | `getAgentDetail()` | `GET /api/reports/agents/{id}/` |
| `createSavedView(data)` | `createSavedView()` | `POST /api/reports/me/views/` |
| `updateSavedView({id, data})` | `updateSavedView()` | `PATCH /api/reports/me/views/{id}/` |
| `cloneSavedView(id)` | `cloneSavedView()` | `POST /api/reports/me/views/{id}/clone/` |
| `fetchSavedViewDetail(id)` | `getSavedViewDetail()` | `GET /api/reports/me/views/{id}/` |
| `fetchDashboardData(params)` | `getDashboardMetrics()` | `GET /api/reports/dashboard/` |

**`initialState` extendido:** `exportJobs[]`, `exportJobDetail: null`, `exportJobId: null`, `realtimeMetrics: null`, `agentDetail: null`, `savedViewDetail: null`, `uniqueClientsAnon[]`.

### navigation.slice — nuevo

No existía un slice de Redux para menú y módulos de navegación. Los componentes debían llamar directamente al gateway o usar estado local, perdiendo reactividad global ante cambios de permisos.

**Thunks:**

| Thunk | Gateway | URL canónica |
|---|---|---|
| `fetchNavigationMenu(params)` | `getNavigationMenu()` | `GET /api/navigation/menu/` |
| `fetchNavigationModules(params)` | `getNavigationModules()` | `GET /api/navigation/modules/` |

**`initialState`:** `menu[]`, `modules[]`, `loading: false`, `error: null`.

---

## Inventario de cambios por archivo

| Archivo | Tarea | Tipo | Descripción |
|---|---|---|---|
| `src/redux/slices/alerts.js` | T3.1 | fix+feat | -1 thunk eliminado / +9 thunks / initialState extendido |
| `src/redux/slices/access.js` | T3.2 | fix+feat | -1 thunk eliminado / +7 thunks / initialState extendido |
| `src/redux/slices/audit.js` | T3.3 | fix+feat | -2 thunks eliminados / +9 thunks / initialState reescrito |
| `src/redux/slices/user.js` | T3.4 | fix+feat | 2 thunks corregidos / +7 thunks / initialState extendido |
| `src/redux/slices/auth.js` | T3.5 | feat | +4 thunks / initialState extendido |
| `src/redux/slices/logs.js` | T3.6 | feat | +4 thunks / initialState extendido |
| `src/redux/slices/reports.js` | T3.6 | feat | +12 thunks / initialState extendido |
| `src/redux/slices/navigation.js` | T3.6 | nuevo | Slice completo (2 thunks) |
| `tests/unit/reducers/authSlice.test.js` | T3.5 | fix | initialState actualizado con ownSessions, myMenu |
| `src/redux/slices/__tests__/alertsSlice.test.js` | T3.1 | fix | fetchTemplates actualizado |
| `__tests__/slices/alertsSlice.sync.test.js` | T3.1 | nuevo | 11 tests |
| `__tests__/slices/accessSlice.sync.test.js` | T3.2 | nuevo | 9 tests |
| `__tests__/slices/auditSlice.sync.test.js` | T3.3 | nuevo | 12 tests |
| `__tests__/slices/userSlice.sync.test.js` | T3.4 | nuevo | 10 tests |
| `__tests__/slices/authSlice.sessions.test.js` | T3.5 | nuevo | 5 tests |
| `__tests__/slices/logsSlice.extended.test.js` | T3.6 | nuevo | 4 tests |
| `__tests__/slices/reportsSlice.extended.test.js` | T3.6 | nuevo | 13 tests |
| `__tests__/slices/navigationSlice.test.js` | T3.6 | nuevo | 3 tests |

---

## Tabla de thunks por tarea

| Slice | Tarea | Thunks antes | Thunks después | Δ |
|---|---|---|---|---|
| `alerts.slice` | T3.1 | 10 | 18 | +8 |
| `access.slice` | T3.2 | 22 | 28 | +6 |
| `audit.slice` | T3.3 | 5 | 12 | +7 |
| `user.slice` | T3.4 | 4 | 11 | +7 |
| `auth.slice` | T3.5 | 7 | 11 | +4 |
| `logs.slice` | T3.6 | 15 | 19 | +4 |
| `reports.slice` | T3.6 | 13 | 25 | +12 |
| `navigation.slice` | T3.6 | 0 | 2 | +2 |
| **Total** | | **76** | **126** | **+50** |

---

## Verificación final

```
# IACT-ui
npm test -- --no-coverage
  Test Suites: 246 passed, 246 total   (era 238)
  Tests:       2216 passed, 2216 total  (era 2149)
  Tiempo:      ~75s

# IACT-api (sin modificaciones en FASE 3)
pytest tests/unit/
  1060 passed, 0 failed
```

### Commits de FASE 3

| Commit | Tarea | Descripción |
|---|---|---|
| `e1bb6fe` | T3.1 | alerts.slice |
| `9b3850f` | T3.2 | access.slice |
| `bde4b50` | T3.3 | audit.slice |
| `77d19cd` | T3.4 | user.slice |
| `f894807` | T3.5 | auth.slice |
| `64b9e12` | T3.6 | logs + reports + navigation slices |

---

## Deuda técnica residual

FASE 3 elimina la brecha entre la capa de gateways y la capa Redux. Deuda activa = 0 en el dominio cubierto.

Las fases siguientes abordan capas superiores:

- **FASE 4:** Conectar componentes React a los selectores y thunks correctos (algunos componentes aún llaman thunks deprecados o usan estado local donde deberían usar Redux).
- **FASE 5:** Eliminar `jobGateway.js` y `transactionGateway.js`, cuyos endpoints no existen en IACT-api.
- **FASE 6:** Validar que el store de Redux no carga datos en memoria que deberían ser server-side (grandes volúmenes de logs, reportes históricos).
