```yml
created_at: 2026-05-09 03:54:42
updated_at: 2026-05-09 03:54:42
project: THYROX
work_package: 2026-05-09-03-54-42-report-export-complete
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# Risk Register — report-export-complete

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-01 | El polling con `setInterval` no se limpia al desmontar el componente → memory leak | Alta | Medio | Usar `useRef` para el interval + `clearInterval` en cleanup de `useEffect` |
| R-02 | `_handleJobStatus` con progreso aleatorio puede nunca retornar `done` en tests | Media | Medio | Usar parámetro `?test_state=done` en mock para controlar el estado en tests (patrón de pipeline-scope-audit) |
| R-03 | `jobGateway` usa caching con TTL SHORT (1 min) — el poll puede retornar estado cacheado | Media | Alto | En `ReportExport` llamar directamente a `apiService.get` sin pasar por el caching de `jobGateway.status`, o forzar cache-bust con timestamp |
| R-04 | El botón cancelar necesita distinguir qué job cancelar cuando hay múltiples exports | Baja | Bajo | `ReportExport.jsx` maneja un solo job a la vez (state local) — no hay caso de múltiples exports simultáneos |
| R-05 | `notificationGateway` mailbox puede no tener endpoint mock para notificación backend→frontend | Media | Bajo | Si no existe, implementar solo toast local cuando poll detecta `done` — no bloquea el flow |
