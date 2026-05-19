```yml
created_at: 2026-05-08 18:08:31
project: IACT-UI
work_package: 2026-05-08-18-08-31-pipeline-scope-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
updated_at: 2026-05-08 18:08:31
```

# Risk Register — pipeline-scope-audit

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-01 | ETLLogs.jsx modal de retry requiere refactor de estado para añadir campo motivo — puede romper el flujo de confirm existente | MEDIA | MEDIA | Leer ETLLogs.jsx completo antes de editar; mantener el ConfirmModal existente y extenderlo con un textarea |
| R-02 | logsSlice retryPipeline thunk cambia firma — tests existentes de PipelineRetry.test.jsx pueden fallar | ALTA | BAJA | Actualizar mock en PipelineRetry.test.jsx en el mismo commit que el thunk |
| R-03 | Mock handler para POST retry puede colisionar con handler GET existente de ETL logs | BAJA | BAJA | Usar `url.includes` con match específico por método POST antes del handler GET |
