```yml
project: THYROX
work_package: 2026-05-07-23-37-33-api-connectivity-ux-feedback
created_at: 2026-05-07 23:39:44
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
updated_at: 2026-05-07 23:39:44
```

# Exit Conditions — api-connectivity-ux-feedback

## Criterios de éxito (Phase 10 completa)

1. **DashboardPage**: usa `reportsService.getDashboardMetrics()` vía thunk Redux — cero imports directos de `@mocks/`.
2. **ActiveSessions**: carga y revoca sesiones vía thunk Redux + `sessionService` conectado a mockInterceptor (`/api/auth/sessions/`).
3. **PipelineStatus**: `logsService.getPipelineStatus()` llama `apiService.get('/api/v1/etl/supervision/')` — el mock está en `mockInterceptor`, no en el servicio.
4. **ScheduledReports sub-actions**: `pauseSchedule`, `resumeSchedule`, `deleteSchedule`, `runScheduleNow`, `getScheduleHistory` llaman a `apiService` — el mock está en `mockInterceptor`.
5. **SSE RealTimeMetrics**: `mockInterceptor` registra un handler que simula Server-Sent Events para que `useRealTimeMetrics` funcione en dev sin backend.
6. **loadingMiddleware coverage**: al menos las 4 páginas críticas (Dashboard, ActiveSessions, Pipeline, ScheduledReports) usan `selectIsLoading` para mostrar spinner global o local correctamente.
7. **Error visibility**: páginas críticas muestran errores al usuario — inline `{error && <div role="alert">}` o vía `ApiErrorAlert` global.
8. **Tests**: ≥1813 tests passing, 0 regressions.

## Gate de salida

- `bash .claude/scripts/validate-phase-completion.sh` retorna exit 0.
- Task plan con todos los checkboxes `[x]`.
- Commit en `claude/project-analysis-N9IkV` con `git push`.
