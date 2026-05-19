```yml
created_at: 2026-05-06 07:12:19
project: THYROX
work_package: 2026-05-06-07-12-19-reports-dashboard-analysis
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Análisis DISCOVER — Reportes, Dashboard y Pipeline IACT-UI

Fuente primaria: `/tmp/references/IACT-docs/source/requisitos/casos-uso/`
Fuente secundaria: `/home/user/IACT-ui/src/` (implementación actual)

---

## 1. Inventario de UCs

### 1.1 Módulo Reports (uc-rpt-*)

| UC | Nombre | RBAC | Implementado en IACT-UI |
|----|--------|------|------------------------|
| UC-RPT-01 | Ver Dashboard IVR | `view_reports` | ⚠ Parcial — `Dashboard.jsx` usa mocks genéricos (revenue/users), no `DashboardIVR` |
| UC-RPT-02 | Ver Métricas en Tiempo Real | `view_kpis` | ✅ `RealTimeMetricsPage` + `useRealTimeMetrics` (SSE) |
| UC-RPT-03 | Ver Reportes Históricos | `view_reports` | ⚠ No hay página de histórico cruzado — solo reportes individuales por tipo |
| UC-RPT-04 | Exportar Reporte | `export_csv` | ⚠ No hay `ExportPage` ni flujo async con `ExportJob` |
| UC-RPT-07 | Programar Reporte | `manage_schedules` | ✅ `ScheduledReportPage` (form completo tras D-004) |
| UC-RPT-08 | Ver Reportes Programados | `manage_schedules` | ✅ `ScheduledReportPage` lista + acciones |
| UC-RPT-09 | Guardar Filtro | `manage_own_filters` | ❌ No implementado |
| UC-RPT-10 | Guardar Vista | `manage_views` | ❌ No implementado |
| UC-RPT-11 | Compartir Vista | `share_reports` | ❌ No implementado |
| UC-RPT-12 | Reporte de Agentes | `view_reports` | ✅ `AgentsReportPage` |
| UC-RPT-13 | Reporte de Colas (Abandono) | `view_reports` | ✅ `QueuesReportPage` |
| UC-RPT-14 | Reporte de Campañas | `view_reports` | ✅ `CampaignsReportPage` |
| UC-RPT-15 | Reporte de Transferencias | `view_reports` | ✅ `TransfersReportPage` |
| UC-RPT-16 | Reporte de Menús IVR | `view_reports` | ✅ `IVRMenusReportPage` |
| UC-RPT-17 | Reporte de Clientes Únicos | `view_reports` | ✅ `UniqueClientsReportPage` |
| UC-INC-RPT-01 | Resolver Segmento del Usuario | (include) | ⚠ INFERRED: existe en accessSlice/userSlice pero no validado contra spec |

**Total reports: 15 UCs + 1 include**
**Implementados: 8 ✅ | Parciales: 3 ⚠ | Pendientes: 3 ❌**

### 1.2 Módulo Pipeline (uc-pip-*)

| UC | Nombre | RBAC | Implementado en IACT-UI |
|----|--------|------|------------------------|
| UC-PIP-01 | Ver Estado del Pipeline ETL | `view_etl_supervision` | ✅ `PipelineStatusPage` (tras reescritura D-001) |
| UC-PIP-02 | Ver Errores de Pipeline | `view_pipeline_errors` | ❌ No implementado |
| UC-PIP-03 | Ver Disponibilidad de Datos | `view_data_availability` | ❌ No implementado |
| UC-PIP-04 | Solicitar Reintento de Pipeline | `request_pipeline_retry` | ❌ No implementado |

**Total pipeline: 4 UCs**
**Implementados: 1 ✅ | Pendientes: 3 ❌**

### 1.3 Módulo Supervisión (uc-sup-*)

| UC | Nombre | RBAC | Implementado en IACT-UI |
|----|--------|------|------------------------|
| UC-SUP-01 | Monitorear Llamadas en Vivo (silent/whisper) | `monitor_live_calls` | ❌ No implementado |
| UC-SUP-02 | Intervenir en Llamadas (barge-in) | `barge_in_calls` | ❌ No implementado |
| UC-SUP-03 | Difundir Mensaje al Equipo | `broadcast_team_messages` | ❌ No implementado |

**Total supervisión: 3 UCs**
**Implementados: 0 ✅ | Pendientes: 3 ❌**

---

## 2. Dashboard IVR — qué muestra y cómo

**Spec UC-RPT-01** — `datos-involucrados.rst §7.2` (PROVEN)

El Dashboard IVR no es un dashboard genérico de métricas de negocio. Es específico del IVR:

```
DashboardIVR:
  segmentos_activos   : lista de segmentos del usuario (filtro de perfil)
  trimestre_activo    : código del trimestre con datos disponibles
  total_llamadas      : suma de llamadas recibidas en el trimestre
  total_abandonadas   : suma de los tres tipos de abandono
  tasa_abandono       : (total_abandonadas / total_llamadas) * 100
  centros_principales : top N centros de transferencia
```

**Mecanismo de actualización:** Cache con TTL 30s. Se invalida cuando el ETL
completa una ejecución exitosa (`pipeline_runs.estado = 'exitoso'`).

**No es tiempo real** — usa la Base Analítica IVR (datos del ETL). El componente
de tiempo real es UC-RPT-02 (`RealTimeMetricsPage`), no el dashboard.

**Datos explícitamente EXCLUIDOS del dashboard:**
- PII (teléfonos de callers individuales)
- Audio / transcripciones
- Datos de agentes (el IVR no tiene datos de atención humana directa)

### Estado de implementación (PROVEN — lectura de `/src/pages/Dashboard.jsx`)

El `Dashboard.jsx` actual muestra:
- "Card 1", "Card 2", "Card 3", "Card 4" — placeholders genéricos
- `mockMetrics`: revenue, users, conversion rate, retention rate — **ninguno de estos corresponde al spec IVR**
- Los mocks en `dashboardData.js` usan datos de revenue/ventas — completamente desalineados

**Brecha crítica:** El dashboard implementado no tiene ningún campo del `DashboardIVR` del spec.

---

## 3. Reportes Operacionales — catálogo con modelos de datos

### UC-RPT-12: Reporte de Agentes

```
AgentDailyStat:
  agent_id, date, segment_code
  calls_answered, calls_abandoned
  sum_handle_seconds, sum_busy_seconds, sum_acw_seconds
  transfers_in, transfers_out
  holds_count
```
Joins con `Agent` (display_name + team) y opcionalmente `Schedule` (adherencia).
Filtros: agente, equipo, fecha, segmento.

### UC-RPT-13: Reporte de Colas (Abandono IVR)

```
ReporteAbandono:
  segmento              : nacional_A | nacional_B | Puebla
  total_llamadas        : total recibidas
  abandonadas_vacio     : menu='VACIO'
  abandonadas_cliente_colgo : menu='cliente_colgo'
  abandonadas_sin_opcion: menu='SinOpcion_Cabecera'
  total_abandonadas     : suma de tres tipos
  tasa_abandono         : (total_abandonadas / total_llamadas) * 100
```
Filtros: segmento (perfil usuario), trimestre.
Fuente: `sp_rpt_llamadas_abandonadas` via Base Analítica IVR.

### UC-RPT-14: Reporte de Campañas

```
CampaignDailyStat:
  campaign_id, date, segment_code
  attempted, reached, conversions
  sum_handle_seconds, active_hours
  disposition_counts: JSON
```

### UC-RPT-15: Reporte de Transferencias

Dos dimensiones:
```
ReporteCentros (sp_rpt_centros_transferencia):
  centro_transferencia, segmento, total_llamadas, trimestre

ReporteCentrosSegmento (sp_rpt_centros_xsegmento):
  segmento, centro, total
```
Filtros: segmento, trimestre, centro (opcional).

### UC-RPT-16: Reporte de Menús IVR

Tres dimensiones:
```
ReporteMenuRedirigidos (sp_rpt_menu_redirigidos):
  menu, total_llamadas, trimestre

ReporteMenuCentro (sp_rpt_menu_centro):
  menu, centro_destino, total

ReporteMenuError (sp_rpt_cMENU_ERROR):
  menu, segmento, total, trimestre
```

### UC-RPT-17: Reporte de Clientes Únicos

```
ReporteClientes (sp_rpt_clientes):
  telefono_hashed  : hash unidireccional del caller (PII anonimizada)
  segmento         : código de segmento
  total_llamadas   : veces que contactó el IVR en el trimestre
  primera_llamada  : fecha primera llamada
  ultima_llamada   : fecha última llamada
  trimestre        : código
```
⚠ El número raw NUNCA se expone — solo `telefono_hashed` (CNST-007).

### UC-RPT-03: Reporte Histórico Cruzado

```
ReporteHistorico:
  trimestre, segmento
  total_llamadas, tasa_abandono
  centros_principales, menus_frecuentes
```
Comparación multi-trimestre disponible solo cuando existan múltiples
`tbl_historico_tN_YYYY` (actualmente solo Q3 2025 — D-ETL-009).
Cache TTL 300s (datos inmutables post-ETL).

---

## 4. Reportes Programados — schedule, formatos, filtros

**Spec UC-RPT-07** — `datos-involucrados.rst §7.1` (PROVEN)

### Modelo ScheduledReport

```
ScheduledReport:
  id                : uuid PK
  actor_id          : int
  name              : string (obligatorio)
  report_type       : enum (agents|queues|campaigns|transfers|ivr_menus|unique_clients)
  filters           : JSON
  period_relative   : enum (last_24h|last_7d|last_30d|...)
  group_by          : JSON
  format            : enum (csv|xlsx|json|pdf)
  schedule_frequency: enum (daily|weekly|monthly|cron)
  schedule_params   : JSON {hour, day_of_week, day_of_month, cron_expr}
  timezone          : string IANA
  status            : active | paused
  last_run_at       : timestamp | null
  next_run_at       : timestamp
  failure_count     : int (reset en éxito)
  created_at        : timestamp
```

### Modelo ScheduleExecutionLog (UC-RPT-08)

```
ScheduleExecutionLog:
  id                   : uuid
  scheduled_report_id  : uuid FK
  started_at           : timestamp
  completed_at         : timestamp
  status               : ok | failed
  export_job_id        : uuid (→ ExportJob)
  error_code           : string | null
```
Retención: 30 días online.

### Formatos de exportación (UC-RPT-04)

`format` ∈ `{csv, xlsx, json, pdf}` (PROVEN — `flujo-principal.rst §PASO 4`)

### ExportJob (UC-RPT-04) — flujo asíncrono

```
ExportJob:
  id               : uuid PK
  actor_id         : int
  report_type      : enum
  filters          : JSON
  period           : JSON
  group_by         : list[Dimension]
  format           : enum
  status           : queued|running|done|failed|expired|cancelled
  progress_pct     : 0..100
  file_path        : string | null
  file_url         : string | null (firmado, +24h)
  file_url_expires_at: timestamp | null
  row_count        : int | null
  byte_count       : int | null
  error_code       : string | null
  created_at       : timestamp
  completed_at     : timestamp | null
```
Storage: S3/GCS/MinIO — `exports/{actor_id}/{job_id}/{filename}`.
Lifecycle: delete > 24h.

---

## 5. Métricas en Tiempo Real (UC-RPT-02) — SSE

**Spec UC-RPT-02** — `implementacion-tecnica.rst §11.2` (PROVEN)

```
Snapshot (emitido cada 5s via SSE):
  timestamp           : ISO string
  queue_count         : colas activas
  agents_busy         : agentes en llamada
  agents_idle         : agentes disponibles
  answered_per_hour   : tasa de llamadas contestadas/hora
  abandon_rate_5min   : tasa de abandono últimos 5 min
  service_level_15min : nivel de servicio últimos 15 min
  lag_seconds         : retraso del stream desde eventos pub/sub
  segments_applied    : segmentos activos del usuario
  schema_version      : versión del schema
```

**Transporte:** SSE (`text/event-stream`), endpoint `GET /api/realtime/metrics/`.
**Eventos:** `metrics` (payload), `heartbeat` (keep-alive 30s), `error`, `close`.
**Cache:** Ninguno — datos efímeros (no persistidos).
**No usa BD operativa** (CNST-007) — consume pub/sub `call_state_changes` + `agent_state_changes` + `queue_state_snapshots`.

---

## 6. Pipeline ETL — UCs de estado y operaciones

### UC-PIP-01: Estado General (ResumenSalud)

Ya implementado. Ver `PipelineStatusPage.jsx`.

### UC-PIP-02: Errores de Pipeline ❌

```
PipelineExecution (fallidos):
  id, source_table, trimestre
  started_at, finished_at
  estado: 'fallido'
  error_message   : mensaje de excepción (sin stack trace interno)
  executed_by     : 'scheduler' | 'manual'
```

### UC-PIP-03: Disponibilidad de Datos ❌

```
DisponibilidadDatos (calculada, no persistida):
  trimestre
  ultima_actualizacion  : finished_at de última ejecución exitosa
  registros_disponibles : base_records
  minutos_desde_etl     : diferencia desde ultima_actualizacion
  estado_frescura       : fresco (<12h) | degradado (12-24h) | vencido (>24h)
```

### UC-PIP-04: Reintento Manual ❌

```
PipelineExecution (nuevo registro):
  estado          : IN_PROGRESS
  executed_by     : 'manual'
  source_table, trimestre
```
Restricción: solo 1 ejecución `IN_PROGRESS` a la vez.

---

## 7. UC de Personalización — Pendientes

### UC-RPT-09: Guardar Filtro ❌

```
SavedFilter:
  id, actor_id
  name              : unique por usuario
  filters           : JSON
  period_relative   : enum
  applies_to        : list[report_type]
  is_default        : bool (max 1 por report_type)
  is_invalid        : bool (true si segmentos del usuario cambiaron)
  description       : string
  created_at, updated_at
```

### UC-RPT-10: Guardar Vista ❌

```
SavedView:
  id, actor_id
  name              : unique por usuario
  report_type       : enum
  filters, period_relative: JSON/enum
  columns           : list[col_id]
  sort_by, group_by : JSON
  chart_config      : JSON
  is_default        : bool
  created_at, updated_at
```

### UC-RPT-11: Compartir Vista ❌

```
ShareEntry:
  id
  view_id           : FK → SavedView
  owner_id          : int
  target_type       : user | agr | segment_public
  target_id         : int | string
  permission        : read | clone
  expires_at        : timestamp | null
  revoked_at        : timestamp | null
  created_at
```

---

## 8. Dependencias entre UCs (grafo)

```
UC-INC-RPT-01 (Resolver Segmento)
  ← incluido por todos: UC-RPT-01..17

UC-RPT-04 (Exportar)
  ← disparado por: UC-RPT-03, UC-RPT-12..17

UC-RPT-07 (Programar)
  → crea ScheduledReport
  → cada ejecución genera → ExportJob (UC-RPT-04)
  → genera ScheduleExecutionLog (UC-RPT-08)

UC-RPT-08 (Ver Programados)
  ← lee ScheduledReport + ScheduleExecutionLog (de UC-RPT-07)

UC-RPT-10 (Guardar Vista)
  → crea SavedView
  ← base para UC-RPT-11 (Compartir)

UC-RPT-11 (Compartir Vista)
  ← requiere UC-RPT-10

UC-PIP-01 (Estado General)
  ← depende de PipelineExecution (mismo modelo que UC-PIP-02/03/04)

UC-PIP-04 (Reintento)
  → crea PipelineExecution con executed_by='manual'
  ← requiere UC-PIP-02 para identificar el trimestre a reintentar
```

---

## 9. Gaps vs implementación actual en IACT-UI

| Categoría | Gap | Criticidad |
|-----------|-----|-----------|
| **Dashboard** | `Dashboard.jsx` muestra revenue/users — ningún campo del spec `DashboardIVR` | 🔴 Alta |
| **Dashboard** | No hay `segmentos_activos`, `trimestre_activo`, `total_llamadas`, `tasa_abandono`, `centros_principales` | 🔴 Alta |
| **Exportar** | No hay flujo `ExportJob` (async, progreso, descarga firmada) — UC-RPT-04 sin implementar | 🔴 Alta |
| **Pipeline** | UC-PIP-02 (errores), UC-PIP-03 (disponibilidad), UC-PIP-04 (reintento) — sin implementar | 🟠 Media |
| **Personalización** | UC-RPT-09 (filtros guardados), UC-RPT-10 (vistas), UC-RPT-11 (compartir) — sin implementar | 🟠 Media |
| **Histórico** | UC-RPT-03 (histórico cruzado multi-trimestre) — sin implementar | 🟠 Media |
| **Supervisión** | UC-SUP-01/02/03 — dominio diferente (llamadas en vivo / barge-in / mensajes) — sin implementar | 🟡 Baja (otro módulo) |

---

## 10. Preguntas abiertas / ambigüedades del spec

| ID | Pregunta | Fuente |
|----|----------|--------|
| Q-01 | El spec `DashboardIVR` muestra datos del ETL (no tiempo real). ¿Debe convivir en la misma página con UC-RPT-02 o son páginas separadas? | UC-RPT-01 vs UC-RPT-02 |
| Q-02 | UC-RPT-03 (histórico) referencia `tbl_historico_tN_YYYY` — actualmente solo Q3 2025. ¿La UI debe manejar el caso de un solo trimestre? | UC-RPT-03 §7.2 D-ETL-009 |
| Q-03 | UC-RPT-04 export: ¿la notificación de finalización llega por SSE o por polling? La spec menciona `REPORT_EXPORT_COMPLETED` como mailbox message | UC-RPT-04 §2.6 |
| Q-04 | UC-INC-RPT-01 (segmento resolver): ¿el frontend recibe los segmentos del usuario en el JWT claims, en el perfil, o hace un GET a un endpoint dedicado? | UC-INC-RPT-01 sin leer en detalle |
| Q-05 | UC-SUP-01/02 (monitoreo de llamadas): ¿requieren WebRTC o solo señalización? No está claro si hay audio en el frontend | UC-SUP-01/02 — spec menciona "silent/whisper" pero no el transporte de audio |
