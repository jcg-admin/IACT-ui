```yml
created_at: 2026-05-06 06:30:13
updated_at: 2026-05-06 06:30:13
project: THYROX
work_package: 2026-05-06-06-30-13-spec-alignment-debt
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Risk Register — spec-alignment-debt

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-001 | D-001 reescritura de PipelineStatusPage rompe los 7 tests existentes | Alta | Medio | TDD: tests primero con nuevo contrato |
| R-002 | D-003 (SSE) — mock de EventSource en Jest es complejo y frágil | Alta | Medio | Usar librería `jest-sse` o hand-mock con ReadableStream |
| R-003 | D-004 formulario extendido aumenta complejidad de ScheduledReportPage sin backend para validar | Media | Bajo | Mock responde con el contrato correcto; validación de UI |
| R-004 | Renombrar campos D-002 rompe tests que usen los nombres camelCase actuales | Alta | Bajo | Actualizar tests en el mismo commit |
| R-005 | Backend real puede diferir del spec en detalles no documentados | Baja | Alto | Marcar TODO en cada endpoint cuando se conecte |
