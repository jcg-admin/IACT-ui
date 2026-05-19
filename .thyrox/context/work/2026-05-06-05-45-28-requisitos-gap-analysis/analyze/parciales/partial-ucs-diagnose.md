```yml
created_at: 2026-05-06 06:00:02
project: IACT-UI
work_package: 2026-05-06-05-45-28-requisitos-gap-analysis
phase: Phase 3 — ANALYZE
author: NestorMonroy
status: Borrador
```

# Diagnóstico — UCs Parciales (GRUPO A)

Análisis de los 4 UCs implementados parcialmente: qué falta exactamente,
causa raíz por UC, y esfuerzo estimado.

---

## uc-rpt-07 — Programar Reporte

**Estado:** Parcial

### Qué existe (PROVEN — filesystem)

`src/components/pages/Analytics/ScheduledReports.jsx` — componente React
que muestra lista de schedules con datos mock hardcodeados.

### Qué falta

1. **Página con ruta:** No existe `src/pages/reports/ScheduledReportPage.jsx`.
   El componente vive en `components/` — no está routed ni accesible.

2. **Ruta en AppRouter:** La línea de comentario en el router dice
   `{/* Analytics / reportes — UC-RPT-01, 04, 07, 08 */}` (línea 232)
   pero no existe ningún `<Route path="/reports/scheduled" .../>`.

3. **Formulario de creación/edición:** El UC requiere configurar frecuencia
   (`daily/weekly/monthly/cron`), hora, zona horaria, nombre del schedule.
   El componente existente no tiene formulario de creación — solo lista.

4. **Service method:** `reportService.js` no expone `scheduleReport()` ni
   `getScheduledReports()`. El componente usa mock inline.

5. **RBAC wiring:** La RBAC function es `schedule_report` —
   no aparece en `FunctionCatalog` ni en `ProtectedRoute` del router.

### Causa raíz

El componente fue creado en la capa `components/pages/Analytics/` como
sketch de UI sin completar el ciclo:  
componente → página → ruta → servicio → RBAC.  
Solo el primer paso se ejecutó.

### Esfuerzo estimado

~3 tareas: (1) ScheduledReportPage.jsx con formulario, (2) service methods
mock-first, (3) ruta + RBAC en AppRouter.

---

## uc-rpt-08 — Ver Reportes Programados

**Estado:** Parcial (depende de rpt-07)

### Qué existe (PROVEN — filesystem)

El mismo `ScheduledReports.jsx` muestra lista — mapeable a rpt-08.
Tiene acciones ("Pause", "Resume", "Delete") en el mock pero no las conecta
a ningún servicio real ni dispatch Redux.

### Qué falta

1. **Página dedicada con ruta:** Igual que rpt-07 — no routed.

2. **Detail view:** UC_RPT_08 requiere detalle + último execution log
   + historico de 30 días. El componente solo tiene lista plana.

3. **Actions funcionales:** pause/resume/delete/run-now deben despachar
   thunks Redux → endpoints reales (o mock-first).

4. **Separación rpt-07/rpt-08:** Son UCs distintos (crear vs. ver/gestionar).
   Pueden ser una sola página con tabs o dos rutas separadas.
   Decisión pendiente para Phase 5.

### Causa raíz

Igual que rpt-07 — el `ScheduledReports.jsx` cubre ambos UCs parcialmente
pero ninguno completamente. La ausencia de ruta hace ambos inaccesibles.

### Esfuerzo estimado

~2 tareas adicionales a rpt-07: (1) panel de detalle + historico,
(2) actions funcionales con mock-first.

---

## uc-rpt-02 — Ver Métricas en Tiempo Real

**Estado:** No implementado (marcado como "parcial" en Phase 1 — re-clasificado)

### Qué existe (PROVEN — filesystem)

**Nada que cubra rpt-02.**

`PerformanceMetricsPage.jsx` (en `pages/logs/`) muestra métricas de
infraestructura del sistema (latencia, CPU, etc.) — NO métricas operacionales
del call center (llamadas en cola, agentes libres, SL).

No existe ningún archivo con `RealTime`, `LiveMetrics`, `KPI` o similar
en `src/`.

### UC_RPT_02 requiere

- Llamadas en cola: `count(calls.state='queued')`
- Agentes ocupados/libres: `count(agents.state='busy/idle')`
- Llamadas atendidas / hora (rolling 1h)
- Tasa abandono / 5min (rolling 5min)
- SL / 15min (rolling 15min)
- Lag (segundos desde última actualización del stream)
- Granularidad sub-minuto — polling ≤30s o WebSocket

### Causa raíz

UC no implementado. El backend no expone endpoints de métricas en tiempo
real (riesgo R-003). La implementación requiere:

1. Nueva página: `src/pages/reports/RealTimeMetricsPage.jsx`
2. Polling con `setInterval` a 30s (mock-first — sin WebSocket en backend)
3. Redux state para las 6 métricas (o estado local con hook)
4. Ruta `/reports/realtime` + RBAC `view_kpis`

### Esfuerzo estimado

~4 tareas: (1) RealTimeMetricsPage.jsx + hook de polling,
(2) service mock-first con las 6 métricas, (3) Redux state/thunk,
(4) ruta + RBAC.

---

## uc-pip-01 — Ver Estado General del Pipeline ETL

**Estado:** No implementado (marcado como "parcial" en Phase 1 — re-clasificado)

### Qué existe (PROVEN — filesystem)

Los 3 otros UCs de pipeline están implementados:
- `ETLLogsPage.jsx` → uc-pip-02 (errores)  
- `ETLAvailabilityPage.jsx` → uc-pip-03 (disponibilidad)
- La ruta `/logs/etl` + `/logs/etl/availability` existen en AppRouter

pip-01 (health overview) está explícitamente ausente.

### UC_PIP_01 requiere (corpus uc-pip-01/informacion-general.rst)

Propósito: mostrar salud del ETL al equipo de operaciones — lag, throughput,
errores globales. Métricas:

- Jobs: running / completed / failed (conteos)
- Lag por source (last successful run)
- Throughput rows/min
- Bytes processed
- Avg latency

RBAC function: `view_etl_supervision`

### Causa raíz

pip-02, pip-03, pip-04 fueron implementados; pip-01 (el overview) fue
omitido. Es el punto de entrada natural de la sección ETL — su ausencia
hace que el módulo empiece en la pantalla de errores (pip-02) en lugar
del dashboard de salud.

### Esfuerzo estimado

~3 tareas: (1) PipelineStatusPage.jsx, (2) service mock-first
`logsService.getPipelineStatus()`, (3) thunk + selector en logsSlice +
ruta `/logs/etl-status`.

---

## Resumen GRUPO A

| UC | Estado real | Falta | Esfuerzo |
|----|-------------|-------|----------|
| rpt-07 | Parcial (componente sin ruta) | Página + form + service + RBAC | ~3 tareas |
| rpt-08 | Parcial (mismo componente) | Detail view + actions funcionales | ~2 tareas |
| rpt-02 | No implementado | Página completa + polling + Redux | ~4 tareas |
| pip-01 | No implementado | Página + service + thunk + ruta | ~3 tareas |

**Total GRUPO A: ~12 tareas atómicas estimadas**
