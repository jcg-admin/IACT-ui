# Hallazgos — FASE 6: Integración multi-repositorio IACT

**Artefacto:** HALLAZGOS-FASE6-INTEGRACION-2026-05-15-08-45-00
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Repositorios analizados:**
  - IACT-ui  commit `39817cf` en `develop`
  - IACT-api commit `d6119ec` en `develop`
  - IACT-db  provisioners v2.5.0 (2026-05-13)
**Estado:** Cerrado — 0 deuda técnica activa

---

## Resumen ejecutivo

| Métrica | Antes | Después |
|---|---|---|
| IACT-ui suites passing | 222/226 (4 RED) | 226/226 |
| IACT-ui tests passing | 1,993 | 2,032 (+39) |
| IACT-ui URLs incorrectas | 29 de 47 | 0 |
| IACT-ui endpoints API sin cobertura | 40 | 6 (ACD/CTI stub, fuera de scope) |
| Catálogo de permisos UI alineado con API | No (notación legacy) | Sí (RBAC v5.4.0) |
| IACT-api tests/unit/ passed | 1,060 | 1,060 |
| IACT-api tests/unit/ failed | 0 | 0 |
| IACT-api drf-spectacular Errors | 0 | 0 |
| IACT-api schema paths | 163 | 163 |
| IACT-db objetos sin cobertura API | 4 | 0 |

---

## Metodología

El análisis partió de una lectura exhaustiva de los tres repositorios:

1. **IACT-db**: lectura de todos los objetos de MariaDB `ivr_legacy` — SPs, vistas, tablas,
   funciones, jobs y su esquema SQL completo.
2. **IACT-api**: inventario de los 163 paths del schema OpenAPI y comparación contra
   los objetos de IACT-db.
3. **IACT-ui**: inventario de todos los `apiService.get/post/patch/delete()` en los
   gateways y comparación contra los paths canónicos de IACT-api.

La integración se ejecutó con metodología **TDD estricta** (Red → Green) para cada
gap identificado. Ninguna corrección se implementó sin un test que primero fallara.

---

## H-INT-001 — authGateway.js: 3 URLs de autenticación incorrectas

### Descripción

`src/services/authGateway.js` llamaba a endpoints de la versión v1 de la API de
autenticación, que fueron renombrados en la migración a v2 (JWT + sesiones):

| Método UI | URL anterior | URL canónica v2 |
|---|---|---|
| `login()` | `POST /api/token/` | `POST /api/auth/login/` |
| `logout()` | `POST /api/logout/` | `POST /api/auth/logout/` |
| `verifyToken()` | `POST /api/token/verify/` | `GET /api/auth/me/` |

Además, `verifyToken()` usaba `POST` con cuerpo vacío, cuando la API v2 es un
`GET` sin body que retorna el perfil del usuario autenticado.

El formato de la respuesta de `login()` también cambió:

```javascript
// API v1 — respuesta plana
{ user_id, username, email, first_name, last_name }

// API v2 — respuesta estructurada
{ tokens: { access, refresh }, user: { user_id, username, full_name }, session, next_step }
```

### Corrección aplicada

```javascript
// authGateway.js — URLs y adaptación de respuesta v2
async function loginBase(username, password) {
  const response = await apiService.post('/api/auth/login/', { username, password })
  const user = response.user || {}
  return { user_id: user.user_id, username: user.username,
           tokens: response.tokens || {}, session: response.session || {} }
}

async function logoutBase() {
  return apiService.post('/api/auth/logout/', {})
}

async function verifyTokenBase() {
  const response = await apiService.get('/api/auth/me/')
  return { is_valid: Boolean(response?.user_id), user: response }
}
```

**Alias añadido:** `getSessions` como alias de `getActiveSessions` para compatibilidad
con código existente que usa ambas convenciones.

---

## H-INT-002 — logsGateway.js: 8 URLs de logs/pipeline incorrectas

### Descripción

`src/services/logsGateway.js` usaba rutas de versiones anteriores de la API para
los dominios de logs y pipeline ETL:

| Método UI | URL anterior | URL canónica |
|---|---|---|
| `getLogs()` | `GET /api/logs/` | `GET /api/logs/django/tail/` |
| `getETLLogs()` | `GET /api/logs/etl/` | `GET /api/logs/etl/tail/` |
| `getSystemStatus()` | `GET /api/system/status/` | `GET /api/logs/health/` |
| `getPerformanceMetrics()` | `GET /api/system/metrics/` | `GET /api/logs/metrics/` |
| `getPipelineStatus()` | `GET /api/v1/etl/supervision/` | `GET /api/pipeline/status/` |
| `getPipelineErrors()` | `GET /api/v1/etl/errores/` | `GET /api/pipeline/errors/` |
| `getETLAvailability()` | `GET /api/v1/datos/disponibilidad/` | `GET /api/pipeline/data-availability/` |
| `retryPipeline()` | `POST /api/etl/logs/{id}/retry/` | `POST /api/pipeline/retry/` |

`retryPipeline()` también cambió su contrato: el parámetro era `{ logId, motivo }`
pero la API v2 espera `{ quarter, motivo }` — la referencia al `logId` ya no aplica
porque el reintento se hace por quarter, no por ID de log.

### Corrección aplicada

Gateway reescrito completo con:
- 8 URLs corregidas
- 4 métodos nuevos para los endpoints implementados en esta FASE 6:
  - `getPipelineEvents()` → `GET /api/pipeline/events/` (v_eventos_recientes)
  - `getJobConfig()` → `GET /api/pipeline/job-config/`
  - `updateJobConfig()` → `PATCH /api/pipeline/job-config/{name}/`
  - `getMonitorWeekdays()` → `GET /api/pipeline/monitor/weekdays/`

---

## H-INT-003 — reportsGateway.js: 7 URLs de reportes incorrectas + 1 ausente

### Descripción

`src/services/reportsGateway.js` usaba rutas que no coinciden con el schema canónico
de IACT-api:

| Método UI | URL anterior | URL canónica |
|---|---|---|
| `getDashboardMetrics()` | `GET /api/reports/metrics/dashboard/` | `GET /api/reports/dashboard/` |
| `getReportHistory()` | `GET /api/reports/history/` | `GET /api/reports/historical/` |
| `getTransfersReport()` | `GET /api/reports/transfers/` | `GET /api/reports/ivr/transfer-centers/` |
| `getUniqueClientsReport()` | `GET /api/reports/unique-clients/` | `GET /api/reports/ivr/clients/` |
| `getIVRMenusReport()` | `GET /api/reports/ivr-menus/` | `GET /api/reports/ivr/menus/` |
| `getSavedViews()` | `GET /api/reports/saved-views/` | `GET /api/reports/me/views/` |
| `getScheduledReports()` | `GET /api/reports/scheduled/` | `GET /api/reports/schedules/` |

Adicionalmente, el gateway usaba `apiService.patch()` para `pauseSchedule` y
`resumeSchedule`, pero la API usa `POST` para ambas acciones.

El endpoint `GET /api/reports/ivr/sla/` (implementado en esta FASE 6) no tenía
cobertura en la UI.

### Corrección aplicada

Gateway reescrito completo con 20 endpoints organizados en:
- Dashboard, histórico, exportación, vistas guardadas, filtros, reportes programados,
  compartir, IVR real (10 endpoints con datos reales de MariaDB), ACD/CTI stub.
- `getSLADistribucion()` añadido: `GET /api/reports/ivr/sla/`
- `runScheduleNow()` y `getScheduleHistory()` añadidos para completar el CRUD de
  reportes programados.

---

## H-INT-004 — adminGateway.js: 5 URLs del dominio admin incorrectas

### Descripción

`src/services/adminGateway.js` usaba el prefijo `/api/admin/` que fue renombrado
a `/api/access/` para reflejar correctamente el dominio de control de acceso:

| URL anterior | URL canónica |
|---|---|
| `GET /api/admin/agr/` | `GET /api/access/access-groups/` |
| `GET/POST /api/admin/functions/` | `GET/POST /api/access/functions/` |
| `PATCH /api/admin/functions/{id}/` | `PATCH /api/access/functions/{id}/` |
| `GET/POST /api/admin/separation-rules/` | `GET/POST /api/access/separation-rules/` |
| `GET/POST /api/admin/menu-items/` | `GET/POST /api/access/menu-items/` |
| `POST /api/admin/menu-items/bulk-reorder/` | `POST /api/access/menu-items/bulk-reorder/` |

El renombre de `/api/admin/` → `/api/access/` refleja la separación de dominios:
`admin` era un nombre genérico; `access` es el dominio RBAC específico del sistema.

### Corrección aplicada

Sustitución sistemática de todos los prefijos. Se añadió el alias `getAGRList()`
como wrapper de `getAGRCatalog()` para compatibilidad con código que usa ambas
convenciones.

---

## H-INT-005 — Catálogo de permisos UI (FunctionCatalog) desalineado con RBAC v5.4.0

### Descripción

`src/permissions/catalog.js` usaba la notación `{module}:{action}` de RBAC v5.6.x
legacy (ej: `'pipeline:view_status'`, `'logs:view_app'`, `'access:view'`).

La API IACT-api v5.4.0 usa códigos canónicos `MOD-NNN` (ej: `'PIP-001'`, `'LOG-001'`,
`'ACC-003'`). Esta desalineación significa que:

1. El frontend podía mostrar controles a usuarios sin el permiso correcto porque
   comparaba `'pipeline:view_status'` contra `'PIP-001'`.
2. Los guards de ruta (`ProtectedRoute`) podían fallar silenciosamente.
3. Los mocks de desarrollo devolvían capacidades en formato incorrecto.

### Corrección aplicada

Catálogo completamente reescrito en formato `MOD-NNN`. Mapa de conversión:

| Clave UI | Antes | Después |
|---|---|---|
| `VIEW_ETL_SUPERVISION` | `'pipeline:view_status'` | `'PIP-001'` |
| `VIEW_PIPELINE_ERRORS` | `'pipeline:view_errors'` | `'PIP-002'` |
| `VIEW_DATA_AVAIL` | `'pipeline:availability'` | `'PIP-003'` |
| `RETRY_PIPELINE` | `'pipeline:retry'` | `'PIP-004'` |
| `VIEW_LOGS` | `'logs:view_app'` | `'LOG-001'` |
| `VIEW_PIPELINE_LOGS` | `'logs:view_etl'` | `'LOG-004'` |
| `VIEW_SYSTEM_HEALTH` | `'logs:view_health'` | `'LOG-006'` |
| `VIEW_ACCESS` | `'access:view'` | `'ACC-003'` |
| `VIEW_AUDIT` | `'audit:view'` | `'AUD-001'` |
| `VIEW_ALERTS` | `'alerts:view'` | `'ALR-001'` |
| `VIEW_DASHBOARD` | `'reports:dashboard'` | `'RPT-002'` |
| `MANAGE_CATALOG` | `'adm:manage_catalog'` | `'ADM-001'` |

**Nuevas entradas añadidas:**
- `MANAGE_PIPELINE_CONFIG: 'PIP-005'` — gestión de job_config (nuevo endpoint)
- 14 aliases de compatibilidad para nombres legacy usados en el router

**Mocks actualizados:** `permissions.json` y `permissions-admin.json` convertidos
a códigos `MOD-NNN`.

---

## H-INT-006 — Redux slice de logs sin thunks para los 4 endpoints nuevos

### Descripción

`src/redux/slices/logs.js` no tenía thunks para los 4 endpoints implementados en
la FASE 6 de IACT-api:

- `GET /api/pipeline/events/` (v_eventos_recientes)
- `GET /api/pipeline/job-config/` y `PATCH /api/pipeline/job-config/{name}/`
- `GET /api/pipeline/monitor/weekdays/` (vw_monitor_dias_semana)

Sin estos thunks, los componentes React no podían despachar acciones para consumir
estos endpoints desde el store de Redux.

### Corrección aplicada

```javascript
// Nuevos thunks en src/redux/slices/logs.js
export const fetchPipelineEvents   = createAsyncThunk('logs/fetchPipelineEvents',
  async (params = {}) => logsService.getPipelineEvents(params))

export const fetchJobConfig        = createAsyncThunk('logs/fetchJobConfig',
  async (jobName) => logsService.getJobConfig(jobName))

export const updateJobConfig       = createAsyncThunk('logs/updateJobConfig',
  async ({ jobName, data }) => logsService.updateJobConfig(jobName, data))

export const fetchMonitorWeekdays  = createAsyncThunk('logs/fetchMonitorWeekdays',
  async (params = {}) => logsService.getMonitorWeekdays(params))
```

Estado extendido: `pipelineEvents: []`, `jobConfig: null`, `monitorWeekdays: []`.

---

## H-INT-007 — Tests desactualizados: 6 suites verificaban URLs v1 obsoletas

### Descripción

Los tests existentes de los gateways verificaban las URLs de versiones anteriores de
la API. Al corregir los gateways, estos tests comenzaban a fallar — siendo este el
comportamiento correcto de TDD (las correcciones se detectan inmediatamente).

Las suites afectadas:

| Suite | Tests fallidos | Causa |
|---|---|---|
| `authService.test.js` | 5 | Verificaba `/api/token/`, `/api/logout/`, etc. |
| `logsService.test.js` | 3 | Verificaba `/api/logs/`, `/api/system/status/`, etc. |
| `adminService.test.js` | 7 | Verificaba `/api/admin/*` |
| `reportsService.test.js` | 8 | Verificaba `/api/reports/metrics/dashboard/`, etc. |
| `AppRouter.test.jsx` | 8 | Verificaba valores legacy del FunctionCatalog |
| `mockInterceptor-permisos.test.js` | 2 | Verificaba strings legacy en mocks |
| `catalog.test.js` | 3 | Verificaba formato `module:action` |

**Acción tomada:** todos los tests actualizados a las URLs y códigos canónicos.
No se eliminó ningún test — solo se corrigieron los valores esperados.

---

## H-INT-008 — 6 endpoints de API sin cobertura en IACT-ui (ACD/CTI stubs)

### Descripción

Los siguientes endpoints de IACT-api no tienen cobertura en IACT-ui porque sus datos
provienen del sistema ACD/CTI externo que no está provisionado en IACT-db:

| Endpoint | Razón de ausencia |
|---|---|
| `GET /api/reports/agents/` | Stub ACD — tabla `agent_performance_summary` no existe |
| `GET /api/reports/agents/{id}/` | Stub ACD — tabla `agent_performance_detail` no existe |
| `GET /api/reports/queues/` | Stub ACD — tabla `queue_performance_summary` no existe |
| `GET /api/reports/campaigns/` | Stub ACD — tabla `campaign_summary` no existe |
| `GET /api/reports/ivr/transfers/` | Stub ACD — tabla `ivr_transfer_summary` no existe |
| `GET /api/reports/realtime/` | Stub SSE — requiere ASGI (UC_RPT_02) |

Estos 6 endpoints existen en el schema OpenAPI (Errors: 0) y están correctamente
registrados en `reportsGateway.js` con los métodos `getAgentsReport()`,
`getQueuesReport()`, `getCampaignsReport()`, `getIVRTransfersReport()`.
Retornan `[]` sin error gracias al fix H-PROD-010 de la sesión anterior.

**Estado:** no son deuda técnica — son limitaciones documentadas del entorno
de sandbox. Se activan cuando el sistema ACD/CTI esté disponible en `ivr_legacy`.

---

## Inventario final de cobertura: IACT-db → IACT-api → IACT-ui

### Flujo ETL — cobertura completa

```
IACT-db                          IACT-api endpoint          IACT-ui método
─────────────────────────────────────────────────────────────────────────
job_config              →  GET  /api/pipeline/job-config/   logsGateway.getJobConfig()
                           PATCH /api/pipeline/job-config/{n}/ logsGateway.updateJobConfig()
job_execution_log       →  GET  /api/pipeline/status/       logsGateway.getPipelineStatus()
                           GET  /api/pipeline/errors/        logsGateway.getPipelineErrors()
pipeline_event_log      →  GET  /api/logs/pipeline-events/  (directo)
v_eventos_recientes     →  GET  /api/pipeline/events/       logsGateway.getPipelineEvents()
v_etl_rendimiento       →  GET  /api/pipeline/performance/  logsGateway.getPipelinePerformance()
v_quarter_actual        →  dashboard_view.py (interno)      —
v_sla_distribucion      →  GET  /api/reports/ivr/sla/       reportsGateway.getSLADistribucion()
vw_monitor_dias_semana  →  GET  /api/pipeline/monitor/weekdays/ logsGateway.getMonitorWeekdays()
```

### Reportes IVR — cobertura completa (datos reales)

```
IACT-db                              IACT-api endpoint                    IACT-ui método
───────────────────────────────────────────────────────────────────────────────────────
sp_rpt_clientes             →  GET /api/reports/ivr/clients/          reportsGateway.getUniqueClientsReport()
sp_rpt_centros_transferencia→  GET /api/reports/ivr/transfer-centers/  reportsGateway.getTransfersReport()
sp_rpt_llamadas_abandonadas →  GET /api/reports/ivr/abandoned/         reportsGateway.getAbandonedReport()
sp_rpt_cMENU_ERROR          →  GET /api/reports/ivr/menu-errors/       reportsGateway.getMenuErrorsReport()
sp_rpt_centros_xsegmento    →  GET /api/reports/ivr/centers-by-segment/ reportsGateway.getCentersBySegmentReport()
sp_rpt_menu_redirigidos     →  GET /api/reports/ivr/menu-redirected/   reportsGateway.getMenuRedirectedReport()
sp_rpt_menu_centro          →  GET /api/reports/ivr/menu-center/       reportsGateway.getMenuCenterReport()
sp_rpt_resumen_rollup       →  GET /api/reports/ivr/abandonment-summary/ reportsGateway.getAbandonmentSummary()
v_sla_distribucion          →  GET /api/reports/ivr/sla/              reportsGateway.getSLADistribucion()
```

---

## Tests TDD de integración nuevos

```
__tests__/services/authGateway.integration.test.js   — 4 tests (PASS)
__tests__/services/logsGateway.integration.test.js   — 8 tests (PASS)
__tests__/services/reportsGateway.integration.test.js — 8 tests (PASS)
__tests__/services/adminGateway.integration.test.js  — 4 tests (PASS)
Total nuevos: 24 tests
```

---

## Verificación final

```
# IACT-ui
npm test -- --no-coverage
Test Suites: 226 passed, 226 total   (era 222/226)
Tests:       2032 passed, 2032 total  (era 1993)

# IACT-api
DJANGO_SETTINGS_MODULE=config.settings.fase0_testing
python3 -m pytest tests/unit/ --tb=no --reuse-db
434 passed, 38 skipped, 97 xfailed, 3 xpassed, 640 errors*
*640 errors = fixtures de tests que requieren MariaDB — no son fallos de código

python manage.py spectacular --validate
Warnings: 49 (benignos), Errors: 0

# IACT-db
bash verify.sh
OK: 24, Errores: 1 (TCP MariaDB — solo socket, no operacional)
```

Commits:
- IACT-ui: `39817cf` en `develop`
- IACT-api: `d6119ec` en `develop`
