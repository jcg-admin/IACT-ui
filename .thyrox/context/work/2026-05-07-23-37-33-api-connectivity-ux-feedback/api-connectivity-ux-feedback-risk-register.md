```yml
project: THYROX
work_package: 2026-05-07-23-37-33-api-connectivity-ux-feedback
created_at: 2026-05-07 23:39:44
current_phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
updated_at: 2026-05-08 00:46:45
```

# Risk Register — api-connectivity-ux-feedback

| ID | Descripción | Probabilidad | Impacto | Mitigación | Estado |
|----|-------------|-------------|---------|------------|--------|
| R-01 | Backend no tiene implementados los endpoints mockeados → UI conecta a 404 | Alta | Alto | Añadir handlers en mockInterceptor como puente hasta que backend entregue | **CERRADO** — T-001..T-004 añadieron handlers completos |
| R-02 | SSE `/api/realtime/metrics/` no tiene handler en mockInterceptor → EventSource falla en dev | Alta | Medio | Añadir SSE mock handler en mockInterceptor | **ABIERTO** → T-DT-001 en siguiente WP (EventSource no interceptable por axios) |
| R-03 | `rejectWithValue(error.message)` pasa strings al `errorHandlingMiddleware` que espera objetos → crash silencioso | Media | Alto | Normalizar errores en thunks o defender el middleware | **CERRADO** — middleware normaliza + 10 slices actualizados (T-012..T-013) |
| R-04 | DashboardPage y AnalyticsDashboard duplican propósito → métricas nunca se unifican | Alta | Medio | Definir cuál es el dashboard canónico; deprecar el otro | **ABIERTO** → T-DT-002 (dashboardSlice aún usa mock; Dashboard.jsx aún consume useDashboard) |
| R-05 | ActiveSessions no tiene servicio ni thunk → cualquier API real requiere refactor completo | Alta | Medio | Crear sessionService con thunks Redux antes de conectar | **CERRADO** — T-008..T-009 crearon thunks + selectors en authSlice; T-010..T-011 conectaron componente |
| R-06 | loadingMiddleware acumula contextos pero ninguna página los consume (excl. logs) → spinners mudos | Media | Bajo | Conectar selectIsLoading en páginas críticas o documentar como intencional | **CERRADO** — T-014 confirmó: DashboardPage usa selectReportsLoading; ScheduledReportPage y PipelineStatusPage usan selectores de slice; comportamiento es intencional |
| R-07 | mockInterceptor no cubre `/api/reports/metrics/dashboard/` → AnalyticsDashboard falla en dev | Alta | Medio | Añadir handler en mockInterceptor | **CERRADO** — T-001 añadió `_handleDashboardMetrics()` |
