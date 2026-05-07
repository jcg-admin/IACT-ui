```yml
project: THYROX
work_package: 2026-05-07-23-37-33-api-connectivity-ux-feedback
created_at: 2026-05-07 23:39:44
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
updated_at: 2026-05-07 23:39:44
```

# Risk Register — api-connectivity-ux-feedback

| ID | Descripción | Probabilidad | Impacto | Mitigación |
|----|-------------|-------------|---------|------------|
| R-01 | Backend no tiene implementados los endpoints mockeados → UI conecta a 404 | Alta | Alto | Añadir handlers en mockInterceptor como puente hasta que backend entregue |
| R-02 | SSE `/api/realtime/metrics/` no tiene handler en mockInterceptor → EventSource falla en dev | Alta | Medio | Añadir SSE mock handler en mockInterceptor |
| R-03 | `rejectWithValue(error.message)` pasa strings al `errorHandlingMiddleware` que espera objetos → crash silencioso | Media | Alto | Normalizar errores en thunks o defender el middleware |
| R-04 | DashboardPage y AnalyticsDashboard duplican propósito → métricas nunca se unifican | Alta | Medio | Definir cuál es el dashboard canónico; deprecar el otro |
| R-05 | ActiveSessions no tiene servicio ni thunk → cualquier API real requiere refactor completo | Alta | Medio | Crear sessionService con thunks Redux antes de conectar |
| R-06 | loadingMiddleware acumula contextos pero ninguna página los consume (excl. logs) → spinners mudos | Media | Bajo | Conectar selectIsLoading en páginas críticas o documentar como intencional |
| R-07 | mockInterceptor no cubre `/api/reports/metrics/dashboard/` → AnalyticsDashboard falla en dev | Alta | Medio | Añadir handler en mockInterceptor |
