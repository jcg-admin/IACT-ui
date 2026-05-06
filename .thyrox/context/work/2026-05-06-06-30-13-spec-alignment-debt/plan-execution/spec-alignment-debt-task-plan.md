```yml
created_at: 2026-05-06 06:50:00
project: THYROX
work_package: 2026-05-06-06-30-13-spec-alignment-debt
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — spec-alignment-debt

5 deudas de alineación con el corpus de requisitos IACT-docs.
TDD estricto: tests antes de implementación en cada tarea.
1 ITER = 1 commit. PAT-UI-003 aplicado (grep consumers ya ejecutado).

## Consumers identificados (PAT-UI-003)

| Deuda | Archivos de test afectados |
|-------|---------------------------|
| D-002 (campos rpt-02) | `useRealTimeMetrics.test.js`, `RealTimeMetricsPage.test.jsx` |
| D-005 (historial rpt-08) | `ScheduledReportPage.test.jsx`, `pagesComponents.test.jsx` |
| D-001 (pipeline model) | `PipelineStatusPage.test.jsx`, `ETLAvailabilityPage.test.jsx`, `PipelineRetry.test.jsx` |
| D-003 (SSE hook) | `useRealTimeMetrics.test.js`, `RealTimeMetricsPage.test.jsx` |
| D-004 (form rpt-07) | `ScheduledReportPage.test.jsx` |

---

## ITER-A — D-002: Renombrar campos uc-rpt-02 (camelCase → snake_case)

> Bajo riesgo. Solo renombrar — sin cambio de lógica.

- [ ] **T-001** Actualizar mock `reportsService.getRealTimeMetrics()` en
  `src/services/reportsService.js`:
  renombrar 6 campos al snake_case del spec SSE payload +
  agregar `timestamp` (ISO string) + `segments_applied` (array vacío) +
  eliminar `updatedAt` (no existe en spec).
  ```
  callsQueued          → queue_count
  agentsBusy           → agents_busy
  agentsIdle           → agents_idle
  callsAnsweredPerHour → answered_per_hour
  abandonRatePer5Min   → abandon_rate_5min
  serviceLevelPer15Min → service_level_15min
  lagSeconds           → lag_seconds
  ```

- [ ] **T-002** Actualizar `src/hooks/domain/__tests__/useRealTimeMetrics.test.js`:
  reemplazar todos los campos camelCase por snake_case en el mock de
  `reportsService.getRealTimeMetrics` dentro del test. Verificar que
  los 5 tests pasan con el nuevo schema.

- [ ] **T-003** Actualizar `src/pages/reports/__tests__/RealTimeMetricsPage.test.jsx`:
  reemplazar todos los campos camelCase por snake_case en el mock de
  `useRealTimeMetrics`. Verificar que los 6 tests pasan.

- [ ] **T-004** Actualizar `src/pages/reports/RealTimeMetricsPage.jsx`:
  reemplazar referencias a campos camelCase por snake_case en JSX.
  Campos que cambian: `metrics?.callsQueued` → `metrics?.queue_count`,
  `metrics?.agentsBusy` → `metrics?.agents_busy`, etc.
  Agregar `segments_applied` en el subtítulo si no está vacío.
  Cambiar condición de lag: `metrics.lagSeconds` → `metrics.lag_seconds`.

- [ ] **T-005** Commit ITER-A:
  `Fix D-002: align uc-rpt-02 field names to spec snake_case`

---

## ITER-B — D-005: Corregir schema historial uc-rpt-08

> Bajo riesgo. El historial no tiene UI prominente aún.

- [ ] **T-006** Actualizar mock `reportsService.getScheduleHistory(id)` en
  `src/services/reportsService.js` para retornar estructura paginada
  con schema correcto según `uc-rpt-07/datos-involucrados.rst §7.2`:
  ```js
  return {
    items: [
      {
        id: '1',
        scheduled_report_id: id,
        started_at: new Date(Date.now() - 86_400_000).toISOString(),
        completed_at: new Date(Date.now() - 86_400_000 + 42_000).toISOString(),
        status: 'ok',           // 'ok' | 'failed'
        export_job_id: 'job-abc-1',
        error_code: null,
      },
      {
        id: '2',
        scheduled_report_id: id,
        started_at: new Date(Date.now() - 172_800_000).toISOString(),
        completed_at: new Date(Date.now() - 172_800_000 + 38_000).toISOString(),
        status: 'ok',
        export_job_id: 'job-abc-2',
        error_code: null,
      },
    ],
    pagination: { page: 1, page_size: 20, total: 2 },
  }
  ```

- [ ] **T-007** Actualizar `src/pages/reports/__tests__/ScheduledReportPage.test.jsx`:
  ajustar cualquier test que referencie `runId`, `scheduledAt`,
  `duration` (nombres del mock antiguo) → `id`, `started_at`,
  `status: 'ok'`. Si no hay tests específicos del historial,
  agregar al menos uno que verifique que el componente renderiza
  `started_at` y `status` de un item del historial.

- [ ] **T-008** Actualizar `src/components/pages/__tests__/pagesComponents.test.jsx`:
  verificar que el mock de `selectScheduleHistory` sigue siendo compatible
  (el selector retorna array de items — ajustar si el slice ahora
  guarda el objeto paginado completo o solo los items).

- [ ] **T-009** Actualizar `src/pages/reports/ScheduledReportPage.jsx` si hay
  sección de historial que renderice campos del schema antiguo:
  actualizar referencias a `runId`/`scheduledAt`/`duration` →
  `id`/`started_at`/`status`. Si no existe UI de historial, no crear
  (uc-rpt-08 es read-only — será su propia página eventualmente).

- [ ] **T-010** Commit ITER-B:
  `Fix D-005: align schedule history schema to spec ScheduleExecutionLog`

---

## ITER-C — D-001: Reescribir PipelineStatusPage con modelo ResumenSalud

> Alto riesgo. Reescritura completa del componente y sus 7 tests.

- [ ] **T-011** Actualizar `src/services/logsService.js` —
  reemplazar el mock de `getPipelineStatus()` con la estructura
  `ResumenSalud` canónica y corregir el URL del TODO:
  ```js
  // TODO: replace mock — GET /api/v1/etl/supervision/
  async getPipelineStatus() {
    return {
      estado_general: 'ok',          // 'ok' | 'degradado' | 'critico'
      ultima_ejecucion_exitosa: {
        trimestre: 'Q2_26',
        finished_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
        base_records: 1_234_567,
      },
      ejecucion_en_curso: null,
      ultima_ejecucion_fallida: null,
      total_exitosas_24h: 2,
      total_fallidas_24h: 0,
    }
  }
  ```

- [ ] **T-012** Reescribir `src/pages/logs/__tests__/PipelineStatusPage.test.jsx`
  con el nuevo contrato. Eliminar los 7 tests basados en el modelo
  incorrecto (jobs.running/completed/failed, sources CRM/PBX/IVR).
  Escribir nuevos tests:
  - Renderiza heading
  - Despacha `fetchPipelineStatus` al montar
  - Muestra badge `estado_general` (ok / degradado / critico)
  - Muestra `trimestre` y `base_records` de última ejecución exitosa
  - Muestra `finished_at` formateado (CNST_008 obligatorio)
  - Muestra contadores `total_exitosas_24h` y `total_fallidas_24h`
  - Muestra "en curso" cuando `ejecucion_en_curso` no es null
  - Muestra link/badge de advertencia cuando `total_fallidas_24h > 0`
  - Muestra indicador de carga
  - Muestra error cuando existe
  - Muestra estado vacío cuando no hay datos

- [ ] **T-013** Reescribir `src/pages/logs/PipelineStatusPage.jsx`:
  eliminar `JobCard` x3 y tabla de sources CRM/PBX/IVR.
  Implementar con el modelo `ResumenSalud`:

  **Estructura de la nueva UI:**
  - Badge grande `estado_general` con color:
    `ok` → verde, `degradado` → amarillo/ámbar, `critico` → rojo
  - Sección "Última ejecución exitosa":
    trimestre, fecha `finished_at` (formateada), `base_records` con
    separadores de miles
  - Sección "En curso" (solo si `ejecucion_en_curso != null`):
    badge animado "ETL corriendo" + trimestre en curso
  - Contadores 24h: dos cards — exitosas (verde) y fallidas (rojo)
  - Alert/link a errores cuando `total_fallidas_24h > 0` (→ UC_PIP_02,
    ruta `/logs/etl` como placeholder hasta que exista pip-02)
  - Auto-refresh polling 30s con `setInterval` (correcto según spec)
  - Loading, error, empty-state igual que antes

- [ ] **T-014** Verificar que `ETLAvailabilityPage.test.jsx` y
  `PipelineRetry.test.jsx` no rompieron — sus mocks de `logsSlice`
  ya incluyen `fetchPipelineStatus` y `selectPipelineStatus`,
  pero el shape del dato cambió. Ajustar si algún test usa valores
  del mock antiguo (jobs.running/sources).

- [ ] **T-015** Commit ITER-C:
  `Fix D-001: rewrite PipelineStatusPage with ResumenSalud model`

---

## ITER-D — D-004: Extender formulario uc-rpt-07 con campos faltantes

> Riesgo medio. El formulario crece — requiere lógica condicional.

- [ ] **T-016** Ampliar `src/pages/reports/__tests__/ScheduledReportPage.test.jsx`
  con tests para los nuevos campos del formulario (TDD primero):
  - Renderiza selector `report_type` con opciones: agents, queues,
    campaigns, transfers, ivr_menus, unique_clients
  - Renderiza selector `period_relative` con opciones: last_24h,
    last_7d, last_30d
  - Renderiza selector `format` con opciones: csv, xlsx, json, pdf
  - Muestra campo `day_of_week` solo cuando frequency = weekly
  - Muestra campo `day_of_month` solo cuando frequency = monthly
  - Muestra campo `cron_expr` solo cuando frequency = cron
  - El dispatch de `createScheduledReport` incluye `report_type`,
    `period_relative`, `format`, `timezone` en el payload

- [ ] **T-017** Actualizar `src/pages/reports/ScheduledReportPage.jsx`
  — extender `CreateForm` con los campos faltantes:

  **Campos nuevos (todos requeridos salvo timezone que tiene default):**
  ```
  report_type    → <select> con opciones del spec
  period_relative → <select>: last_24h | last_7d | last_30d
  format         → <select>: csv | xlsx | json | pdf
  timezone       → string, default: Intl.DateTimeFormat().resolvedOptions().timeZone
  ```

  **Campos condicionales (aparecen según frequency):**
  ```
  frequency=weekly  → <select> day_of_week (lunes..domingo)
  frequency=monthly → <input number> day_of_month (1–28)
  frequency=cron    → <input text> cron_expr (reemplaza time + day_of_week)
  ```

  **Payload final de dispatch:**
  ```js
  dispatch(createScheduledReport({
    name,
    report_type,
    period_relative,
    format,
    schedule: {
      frequency,
      hour: frequency !== 'cron' ? time : undefined,
      day_of_week: frequency === 'weekly' ? dayOfWeek : undefined,
      day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
      cron_expr: frequency === 'cron' ? cronExpr : undefined,
      timezone,
    },
  }))
  ```

- [ ] **T-018** Commit ITER-D:
  `Fix D-004: extend scheduled report form with missing spec fields`

---

## ITER-E — D-003: Reescribir useRealTimeMetrics con EventSource (SSE)

> Alto riesgo. Cambio de paradigma polling → push. Tests requieren mock de EventSource.

- [ ] **T-019** Crear mock global de `EventSource` en
  `src/hooks/domain/__tests__/useRealTimeMetrics.test.js`.
  Reescribir los 5 tests existentes con el nuevo paradigma SSE:
  ```js
  // Mock de EventSource para Jest (no existe en jsdom)
  class MockEventSource {
    constructor(url, opts) {
      this.url = url
      this.withCredentials = opts?.withCredentials ?? false
      MockEventSource.instances.push(this)
    }
    addEventListener(type, handler) {
      this._handlers = this._handlers ?? {}
      this._handlers[type] = handler
    }
    dispatchEvent(type, data) {
      this._handlers?.[type]?.({ data: JSON.stringify(data) })
    }
    close() { this.closed = true }
    static instances = []
    static reset() { MockEventSource.instances = [] }
  }
  global.EventSource = MockEventSource
  ```

  Tests requeridos:
  - Abre `EventSource` con la URL correcta al montar
  - Escucha evento `metrics` y actualiza el estado con los datos
  - Escucha evento `heartbeat` sin modificar las métricas
  - Escucha evento `error` y actualiza el estado de error
  - Cierra `EventSource` al desmontar (cleanup)
  - Re-abre conexión con `Last-Event-ID` tras recibir un evento

- [ ] **T-020** Reescribir `src/hooks/domain/useRealTimeMetrics.js`
  con `EventSource`:
  ```js
  const SSE_URL = '/api/realtime/metrics/'

  export function useRealTimeMetrics() {
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const lastEventId = useRef(null)

    useEffect(() => {
      const url = lastEventId.current
        ? `${SSE_URL}?lastEventId=${lastEventId.current}`
        : SSE_URL
      const es = new EventSource(url, { withCredentials: true })

      es.addEventListener('metrics', (e) => {
        const data = JSON.parse(e.data)
        lastEventId.current = e.lastEventId ?? lastEventId.current
        setMetrics(data)
        setError(null)
        setLoading(false)
      })

      es.addEventListener('heartbeat', () => {
        // keep-alive: no actualizar métricas
      })

      es.addEventListener('error', (e) => {
        const data = e.data ? JSON.parse(e.data) : {}
        setError(data.code ?? 'Error de stream')
        setLoading(false)
        es.close()
      })

      return () => { es.close() }
    }, [])

    return { metrics, loading, error }
  }
  ```

- [ ] **T-021** Actualizar `src/pages/reports/__tests__/RealTimeMetricsPage.test.jsx`:
  el test mockea `useRealTimeMetrics` directamente con `jest.mock`,
  por lo que debería seguir pasando sin cambios. Verificar y ajustar
  solo si algún test importa el hook directamente.

- [ ] **T-022** Commit ITER-E:
  `Fix D-003: rewrite useRealTimeMetrics with EventSource SSE`

---

## Cierre

- [ ] **T-023** Ejecutar suite completa: `npx jest --no-coverage`
  Verificar: 0 regressions, todos los tests nuevos pasan.
  Umbral mínimo: ≥ 1588 tests (baseline tras ITER-4 del WP anterior).

- [ ] **T-024** Push a origin + actualizar `now.md` con métricas finales.

---

## Resumen

| ITER | Deuda | Tareas | Riesgo | Tiempo estimado |
|------|-------|--------|--------|-----------------|
| ITER-A | D-002 campo names | T-001..T-005 | Bajo | ~30 min |
| ITER-B | D-005 historial schema | T-006..T-010 | Bajo | ~30 min |
| ITER-C | D-001 PipelineStatusPage | T-011..T-015 | Alto | ~90 min |
| ITER-D | D-004 form extendido | T-016..T-018 | Medio | ~60 min |
| ITER-E | D-003 SSE hook | T-019..T-022 | Alto | ~60 min |
| Cierre | — | T-023..T-024 | — | ~10 min |

**Total: 24 tareas, 5 ITERs, 5 commits**

## DAG de dependencias

```
T-001 → T-002 → T-003 → T-004 → T-005   (ITER-A, secuencial)
T-006 → T-007 → T-008 → T-009 → T-010   (ITER-B, secuencial)
T-011 → T-012 → T-013 → T-014 → T-015   (ITER-C, secuencial)
T-016 → T-017 → T-018                   (ITER-D, secuencial)
T-019 → T-020 → T-021 → T-022           (ITER-E, secuencial)
T-005 → ITER-B → ITER-C → ITER-D → ITER-E → T-023 → T-024
```

ITER-A debe completarse antes de ITER-E (ambos tocan los campos
de las métricas y sus tests). El resto es independiente entre sí
excepto el cierre que requiere todos los ITERs completos.
