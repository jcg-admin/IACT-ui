```yml
created_at: 2026-05-06 07:07:35
project: THYROX
work_package: 2026-05-06-06-30-13-spec-alignment-debt
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — spec-alignment-debt

## Added

- `PipelineStatusPage.jsx` reescrito completo con `ResumenSalud` model:
  `EstadoBadge` (ok/degradado/critico), `CounterCard` x2, panel de última
  ejecución exitosa con `trimestre`, `finished_at`, `base_records` (CNST_008).
  Auto-refresh vía `setInterval(30_000)` con cleanup (D-001).

- 12 tests en `PipelineStatusPage.test.jsx` con `MOCK_STATUS` / `MOCK_STATUS_CRITICO` /
  `MOCK_STATUS_EN_CURSO` usando estructura `ResumenSalud` real (D-001).

- 7 tests en `ScheduledReportPage.test.jsx` para los campos faltantes del formulario:
  `report_type`, `period_relative`, `format`, `day_of_week` (weekly), `day_of_month`
  (monthly), `cron_expr` (cron), y verificación del payload dispatch (D-004).

- 7 tests SSE en `useRealTimeMetrics.test.js` con `MockEventSource`:
  conexión, evento `metrics`, `heartbeat` (no-op), evento `error`, `onerror`,
  cleanup al desmontar (D-003).

## Changed

- `logsService.getPipelineStatus()`: mock retorna `ResumenSalud`
  (`estado_general`, `ultima_ejecucion_exitosa`, `ejecucion_en_curso`,
  `ultima_ejecucion_fallida`, `total_exitosas_24h`, `total_fallidas_24h`).
  URL TODO actualizada a `/api/v1/etl/supervision/` (D-001).

- `reportsService.getRealTimeMetrics()`: campos migrados de camelCase a snake_case
  (`queue_count`, `agents_busy`, `agents_idle`, `answered_per_hour`,
  `abandon_rate_5min`, `service_level_15min`, `lag_seconds`). Añadido `timestamp`.
  Eliminado `updatedAt`. URL TODO actualizada a `/api/realtime/metrics/` (D-002).

- `reportsService.getScheduleHistory(id)`: retorna `{ items, pagination }` con schema
  `ScheduleExecutionLog` correcto (`started_at`, `completed_at`, `status: ok|failed`,
  `export_job_id`, `error_code`). URL TODO actualizada a
  `/api/reports/scheduled/{id}/runs/` (D-005).

- `ScheduledReportPage.jsx` `CreateForm`: 7 campos nuevos (`report_type`, `period_relative`,
  `format`, `timezone` auto-detectado, `day_of_week`, `day_of_month`, `cron_expr`).
  Refactorizado con `Field` helper component. Payload dispatch extendido (D-004).

- `useRealTimeMetrics.js`: reemplazado `setInterval` + `reportsService.getRealTimeMetrics()`
  por `EventSource('/api/realtime/metrics/')` con handlers para eventos `metrics`,
  `heartbeat`, `error`, `close` y `onerror`. Track de `lastEventId` para reconexión (D-003).

- `RealTimeMetricsPage.jsx`: referencias de campos actualizadas de camelCase a snake_case
  (`metrics.queue_count`, `metrics.lag_seconds`, `metrics.timestamp`) (D-002).

- `useRealTimeMetrics.test.js` y `RealTimeMetricsPage.test.jsx`: `MOCK_METRICS` actualizado
  a snake_case (D-002).

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main` con bump de versión.
Entradas a promover: todas las secciones Added y Changed de este archivo.
