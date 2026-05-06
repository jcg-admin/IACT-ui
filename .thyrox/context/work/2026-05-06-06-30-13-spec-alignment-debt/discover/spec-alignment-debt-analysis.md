```yml
created_at: 2026-05-06 06:30:13
project: THYROX
work_package: 2026-05-06-06-30-13-spec-alignment-debt
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Phase 1 DISCOVER — Análisis de Deuda de Alineación con Spec

## 1. Contexto

WP anterior `requisitos-gap-analysis` implementó 6 UCs (uc-rpt-07,
uc-rpt-08, uc-rpt-02, uc-pip-01, uc-acc-04, uc-perm-01) con patrón
mock-first. La revisión post-implementación reveló 4 categorías de
deuda donde los mocks y componentes divergen del corpus de requisitos
en `/tmp/references/IACT-docs/`.

Fuente de verdad: archivos `datos-involucrados.rst`,
`actores-precondiciones.rst`, `implementacion-tecnica.rst`,
`criterios-aceptacion.rst` por cada UC.

---

## 2. Deuda D-001 — uc-pip-01: Modelo de datos incorrecto

### Gravedad: CRÍTICA

### Evidencia observable

**Spec — `uc-pip-01/datos-involucrados.rst` (PROVEN):**
```
ResumenSalud:
  ultima_ejecucion_exitosa : PipelineExecution | null
  ejecucion_en_curso       : PipelineExecution | null
  ultima_ejecucion_fallida : PipelineExecution | null
  total_exitosas_24h       : int
  total_fallidas_24h       : int
  estado_general           : ok | degradado | crítico
```

**Spec — `uc-pip-01/flujo-principal.rst` (PROVEN):**
```
PASO 1 — GET /api/v1/etl/supervision/
PASO 4 — Construir ResumenSalud:
  - última ejecución exitosa
  - ejecución en_ejecucion
  - última ejecución fallida
  - estado_general según antigüedad (ok/degradado/crítico)
```

**Spec — `uc-pip-01/implementacion-tecnica.rst` (PROVEN):**
```
SELECT id, source_table, trimestre,
       started_at, finished_at,
       estado, base_records,
       error_message, executed_by
FROM pipeline_runs
ORDER BY started_at DESC LIMIT 20
```

**Implementación actual — `logsService.getPipelineStatus()` (PROVEN):**
```js
return {
  jobs: { running: 3, completed: 142, failed: 2 },
  sources: [
    { name: 'CRM', lag: '12 min', throughputRowsPerMin: 1840,
      bytesProcessed: 2400000, avgLatencyMs: 320 },
    { name: 'PBX', ... },
    { name: 'IVR', ... },
  ],
  updatedAt: new Date().toISOString(),
}
```

### Análisis del gap

El mock retorna un dashboard de streaming (fuentes, throughput, lag de
Kafka) que no existe en el spec. La BD real es `pipeline_runs` con
ejecuciones por trimestre. El campo `jobs.running/completed/failed`
no existe en `ResumenSalud`. El campo `sources` no existe en ninguna
entidad del spec.

La URL también diverge:
- Mock apunta a: ninguna URL real (es mock puro)
- Spec: `GET /api/v1/etl/supervision/`
- Implementado en service: ningún endpoint — retorna objeto hardcodeado

### Componente afectado

`PipelineStatusPage.jsx` renderiza `JobCard` x3 (running/completed/
failed) y tabla de sources. Ambos componentes deberán reescribirse
cuando el backend entregue `ResumenSalud`. Los 7 tests actuales
prueban el contrato incorrecto.

### Fix requerido

1. `logsService.getPipelineStatus()` → retornar estructura `ResumenSalud`
2. `PipelineStatusPage.jsx` → reemplazar JobCards + tabla de sources
   por: estado general (ok/degradado/crítico), última ejecución exitosa,
   ejecución en curso (si existe), última fallida, contadores 24h
3. Tests → reescribir contra nuevo contrato
4. URL: `GET /api/v1/etl/supervision/` (no `/api/etl/pipeline/status/`)

---

## 3. Deuda D-002 — uc-rpt-02: Nombres de campos camelCase vs snake_case del spec

### Gravedad: ALTA

### Evidencia observable

**Spec — `uc-rpt-02/actores-precondiciones.rst` 2.5 (PROVEN):**
```
event: metrics
data: {
  timestamp,
  queue_count,
  agents_busy,
  agents_idle,
  answered_per_hour,
  abandon_rate_5min,
  service_level_15min,
  lag_seconds,
  segments_applied
}
```

**Implementación actual — `reportsService.getRealTimeMetrics()` (PROVEN):**
```js
return {
  callsQueued: 12,          // ≠ queue_count
  agentsBusy: 8,            // ≠ agents_busy
  agentsIdle: 4,            // ≠ agents_idle
  callsAnsweredPerHour: 143, // ≠ answered_per_hour
  abandonRatePer5Min: 3.2,  // ≠ abandon_rate_5min
  serviceLevelPer15Min: 87.5, // ≠ service_level_15min
  lagSeconds: 5,             // ≠ lag_seconds
  updatedAt: ...,            // campo extra, no en spec
  // AUSENTE: segments_applied, timestamp
}
```

**Implementación actual — `RealTimeMetricsPage.jsx` (PROVEN):**
```js
metrics?.callsQueued
metrics?.agentsBusy
metrics?.lagSeconds
// etc.
```

### Análisis del gap

6 de 7 campos tienen nombres distintos. 2 campos del spec están
ausentes del mock (`timestamp`, `segments_applied`). 1 campo extra
no está en el spec (`updatedAt`).

Cuando el backend entregue el payload real con snake_case, todos los
valores serán `undefined` en el componente sin ningún error visible.
Falla silenciosa garantizada.

### Fix requerido

1. `reportsService.getRealTimeMetrics()` → renombrar 6 campos al
   snake_case del spec; agregar `timestamp` y `segments_applied`
2. `RealTimeMetricsPage.jsx` → actualizar referencias de props
3. Tests del hook y la página → actualizar contra nuevo schema

---

## 4. Deuda D-003 — uc-rpt-02: Protocolo de conexión polling vs SSE

### Gravedad: ALTA

### Evidencia observable

**Spec — `uc-rpt-02/criterios-aceptacion.rst` (PROVEN):**
```
CA-01: Conexión abre, mensajes cada ≤ 5s
CA-03: Reconnect con Last-Event-ID — tras corte,
       reabre y resume sin gap
CA-04: Sin data en 30s → event: heartbeat
CA-09: Backend caído → event: error + cierre
CA-13: JWT expirado → stream cierra con token_expired
```

**Spec — `uc-rpt-02/implementacion-tecnica.rst` (PROVEN):**
```
StreamGateway — endpoint de conexión (SSE / WS)
HeartbeatTimer — emit heartbeat 30s
GET /api/realtime/metrics/ (Connection: SSE)
```

**Implementación actual — `useRealTimeMetrics.js` (PROVEN):**
```js
const POLL_INTERVAL_MS = 30_000
useEffect(() => {
  fetch()
  const id = setInterval(fetch, POLL_INTERVAL_MS)
  return () => clearInterval(id)
}, [fetch])
```

### Análisis del gap

El spec define SSE (Server-Sent Events) con push cada ≤5s. La
implementación usa polling REST cada 30s. Son 6 veces más lento
que el spec y el patrón de conexión es fundamentalmente distinto:

| Dimensión | Spec (SSE) | Implementado (polling) |
|-----------|------------|----------------------|
| Latencia | ≤ 5s | 30s |
| Protocolo | EventSource / SSE | fetch REST periódico |
| Reconnect | Last-Event-ID automático | Ninguno |
| Heartbeat | event: heartbeat a los 30s | No existe |
| JWT expirado | Cierre con token_expired | Falla silenciosa |
| Múltiples tabs | Una conexión SSE por tab | Un timer por tab |

El hook deberá reescribirse con `EventSource` (nativo browser) o
una librería SSE. El actual `setInterval` es aceptable solo como
placeholder hasta que exista el endpoint real.

### Fix requerido

1. Reescribir `useRealTimeMetrics` con `EventSource`
2. Manejar eventos: `metrics`, `heartbeat`, `error`, `close`
3. Reconnect automático con `Last-Event-ID`
4. Tests: reemplazar `jest.useFakeTimers` por mock de `EventSource`

---

## 5. Deuda D-004 — uc-rpt-07: Formulario incompleto vs payload requerido

### Gravedad: MEDIA

### Evidencia observable

**Spec — `uc-rpt-07/actores-precondiciones.rst` 2.4 (PROVEN):**
```
POST /api/reports/scheduled/
body: {
  name,
  report_type,          ← AUSENTE en form
  filters,              ← AUSENTE en form
  period_relative,      ← AUSENTE en form
  group_by,             ← AUSENTE en form
  format,               ← AUSENTE en form
  schedule: {
    frequency,          ✓ presente
    hour,               ✓ presente (campo "time")
    day_of_week?,       ← AUSENTE (requerido si weekly)
    day_of_month?,      ← AUSENTE (requerido si monthly)
    cron_expr?,         ← AUSENTE (requerido si cron)
    timezone            ← AUSENTE en form
  }
}
```

**Spec — `uc-rpt-07/criterios-aceptacion.rst` CA-02/CA-03/CA-04 (PROVEN):**
```
CA-02: frequency=weekly + day_of_week → next_run en el día correcto
CA-03: frequency=monthly + day_of_month → next_run correcto
CA-04: cron_expr válido aceptado
CA-05: cron_expr inválido → 400 INVALID_CRON
```

**Implementación actual — `ScheduledReportPage.jsx` (PROVEN):**
```js
const [name, setName] = useState('')
const [frequency, setFrequency] = useState('daily')
const [time, setTime] = useState('08:00')
// Sin: report_type, filters, period_relative, group_by,
//      format, day_of_week, day_of_month, cron_expr, timezone
```

### Análisis del gap

El backend rechazará el POST con `400` porque faltan campos
requeridos. Para `weekly` y `monthly` falta `day_of_week`/
`day_of_month`. El campo `report_type` es obligatorio para saber
qué datos exportar. Sin `timezone`, el servidor asumirá UTC (comportamiento incorrecto para usuarios en otras zonas).

El formulario actual permite crear schedules `weekly` o `monthly`
sin indicar el día — el backend los rechazaría o los crearía con
comportamiento indeterminado.

También hay un límite de 10 schedules por usuario (CA-07: `11ª → 429`)
que la UI no maneja.

### Fix requerido

1. Agregar `report_type` (enum selector)
2. Agregar `period_relative` (enum: last_24h, last_7d, etc.)
3. Agregar `format` (enum: csv, json, xlsx)
4. Agregar `timezone` (selector IANA o default a browser timezone)
5. Mostrar campos condicionales: `day_of_week` si weekly,
   `day_of_month` si monthly, `cron_expr` si cron
6. Manejar 429 (límite 10 schedules)

---

## 6. Deuda D-005 — uc-rpt-08: Endpoint de historial con schema incorrecto

### Gravedad: MEDIA

### Evidencia observable

**Spec — `uc-rpt-07/datos-involucrados.rst` 7.2 (PROVEN):**
```
ScheduleExecutionLog:
  { id, scheduled_report_id,
    started_at, completed_at,
    status: ok | failed,
    export_job_id,
    error_code | null }
```

**Spec — `uc-rpt-08/flujo-principal.rst` 3.3 (PROVEN):**
```
GET /api/reports/scheduled/{id}/runs/?page=1
Carga ScheduleExecutionLog (30 días). Response paginado.
```

**Implementación actual — `reportsService.getScheduleHistory()` (PROVEN):**
```js
return [
  { runId: '1', scheduledAt: '...', status: 'success', duration: 42 },
  { runId: '2', scheduledAt: '...', status: 'success', duration: 38 },
]
```

### Análisis del gap

| Campo spec | Campo mock | Estado |
|-----------|-----------|--------|
| `id` | `runId` | Renombrado |
| `started_at` | `scheduledAt` | Semántica distinta |
| `completed_at` | ausente | FALTANTE |
| `status: ok\|failed` | `status: 'success'` | Valor distinto |
| `export_job_id` | ausente | FALTANTE |
| `error_code` | ausente | FALTANTE |
| (no existe) | `duration` | Campo extra |

La respuesta tampoco es paginada — retorna array directo en lugar
del formato `{ items: [], pagination: {} }` que define el spec para
uc-rpt-08.

### Fix requerido

1. `reportsService.getScheduleHistory()` → retornar estructura
   paginada `{ items: [...], pagination: {...} }` con campos correctos
2. Actualizar `ScheduledReportPage` para renderizar con campos reales
3. Actualizar tests del historial

---

## 7. Resumen de deudas

| ID | UC | Descripción | Gravedad | Tipo |
|----|----|-------------|----------|------|
| D-001 | uc-pip-01 | Modelo ResumenSalud vs dashboard Kafka | CRÍTICA | Modelo de datos + UI + endpoint URL |
| D-002 | uc-rpt-02 | 6 campos camelCase vs snake_case spec | ALTA | Contrato de API |
| D-003 | uc-rpt-02 | polling 30s vs SSE push ≤5s | ALTA | Arquitectura de conexión |
| D-004 | uc-rpt-07 | Formulario falta 6 campos requeridos | MEDIA | Completitud funcional |
| D-005 | uc-rpt-08 | Schema historial incorrecto + sin paginación | MEDIA | Contrato de API |

### Deudas confirmadas fuera de scope (ya registradas)

| ID | Descripción | Estado |
|----|-------------|--------|
| TD-003 | 4 vulnerabilidades npm moderadas | Pendiente ventana mantenimiento |
| TD-006 | ESLint 8 EOL | Baja prioridad |

---

## 8. Archivos afectados por deuda

```
src/services/logsService.js              ← D-001 (URL + mock response)
src/services/reportsService.js           ← D-002, D-003, D-004, D-005
src/hooks/domain/useRealTimeMetrics.js   ← D-003 (polling → SSE)
src/pages/logs/PipelineStatusPage.jsx    ← D-001 (UI completa)
src/pages/reports/RealTimeMetricsPage.jsx ← D-002 (field names)
src/pages/reports/ScheduledReportPage.jsx ← D-004 (form fields)
src/pages/logs/__tests__/PipelineStatusPage.test.jsx ← D-001
src/pages/reports/__tests__/RealTimeMetricsPage.test.jsx ← D-002
src/hooks/domain/__tests__/useRealTimeMetrics.test.js ← D-003
src/pages/reports/__tests__/ScheduledReportPage.test.jsx ← D-004, D-005
```

---

## 9. Criterios de salida de Phase 1

- [x] Todas las deudas identificadas tienen evidencia PROVEN del spec
- [x] Gravedad asignada con justificación
- [x] Archivos afectados listados
- [x] Fix requerido descrito por cada deuda
- [ ] **GATE HUMANO** — Aprobación de scope y prioridad antes de Phase 8

---

## 10. Preguntas para el gate

1. **D-001 (pip-01)** — ¿Priorizamos reescribir `PipelineStatusPage`
   completo ahora, o esperamos al backend real para hacerlo una sola vez?

2. **D-003 (SSE)** — El hook SSE es significativamente más complejo
   que el polling. ¿Lo implementamos ahora con un mock SSE en Jest,
   o dejamos el polling hasta que exista el endpoint real?

3. **Orden de ejecución sugerido** si apruebas todo:
   - ITER-A: D-002 (renombrar campos, bajo riesgo, 30 min)
   - ITER-B: D-005 (schema historial, bajo riesgo, 30 min)
   - ITER-C: D-004 (extender formulario, medio riesgo, 60 min)
   - ITER-D: D-001 (reescribir PipelineStatusPage, alto riesgo, 90 min)
   - ITER-E: D-003 (SSE hook, alto riesgo, 120 min)
```
