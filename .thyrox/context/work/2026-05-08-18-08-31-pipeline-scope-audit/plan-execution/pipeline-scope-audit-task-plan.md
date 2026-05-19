```yml
created_at: 2026-05-08 18:20:00
project: IACT-UI
work_package: 2026-05-08-18-08-31-pipeline-scope-audit
phase: Phase 10 — IMPLEMENT
author: NestorMonroy
status: Aprobado
```

# Task Plan — pipeline-scope-audit

**SP-01 aprobado** · **4 gaps UC-074** · **4 tareas atómicas** · **1 bloque (DAG lineal)**

**Decisión de diseño:** `motivo` — mínimo 20 chars (FR-074.01), máximo 500 chars (no definido en spec; límite razonable de UI). Documentado como decisión de implementación.

---

## DAG de dependencias

```
T-001 (mock handler) → T-002 (UI motivo field) → T-003 (thunk payload) → T-004 (409 handling)
```

T-001 es prerequisito de T-004 (mock simula 409). T-002 es prerequisito de T-003 (dato disponible).

---

## Block I — UC-074 gaps (GAP-PIP-01..04)

- [x] [T-001] **mockInterceptor.js** — Agregar handler `POST /api/etl/logs/{id}/retry/` usando `url.match(/\/api\/etl\/logs\/(\d+)\/retry\/)`. Response 202: `{ message: "Pipeline iniciado", job_id: "manual-{id}", trimestre, executed_by: "manual" }`. Response 409 si `_pipelineRunning` flag activo: `{ error: "Ya hay una ejecución activa" }`. Response 422 si `motivo.length < 20`: `{ error: "Motivo demasiado corto", min_length: 20 }`. Test: nuevo `describe('POST /api/etl/logs/{id}/retry/')` en el test de mockInterceptor o inline en PipelineRetry.test.jsx. *(GAP-PIP-03)*

- [x] [T-002] **ETLLogs.jsx** — Reemplazar `ConfirmModal` por un modal inline (o extender estado) que incluya: campo `<textarea>` para `motivo` (placeholder "Razón del reintento (mínimo 20 caracteres)"), validación `motivo.length >= 20 && motivo.length <= 500` antes de habilitar "Confirmar", contador de caracteres visible. Estado: `retryModal: { isOpen, logId, motivo: '' }`. Agregar `motivoError` string para mostrar inline. Actualizar `handleConfirmRetry` para pasar `{ logId, motivo }`. Actualizar tests en PipelineRetry.test.jsx: (a) campo motivo visible cuando modal abre, (b) botón confirmar deshabilitado con motivo corto, (c) habilitado con motivo ≥ 20 chars. *(GAP-PIP-02)*

- [x] [T-003] **logs.js (slice)** — Actualizar `retryPipeline` thunk: cambiar firma de `async (logId, ...)` a `async ({ logId, motivo }, ...)`. Actualizar `logsService.retryPipeline` para recibir `{ logId, motivo }` y enviar `POST /api/etl/logs/${logId}/retry/` con body `{ motivo }`. Actualizar tests en PipelineRetry.test.jsx: verificar que `retryPipeline` se llama con `{ logId: 2, motivo: '...' }` en lugar de solo `2`. *(GAP-PIP-01)*

- [x] [T-004] **ETLLogs.jsx** — Manejar el caso 409 en `handleConfirmRetry`: capturar el error del `.unwrap()` y mostrar mensaje inline "Ya hay una ejecución activa" en el modal. El modal debe permanecer abierto para que el usuario pueda leer el error y cerrarlo manualmente. Agregar `retryError` al estado del modal. Agregar test: simular dispatch que rechaza con `statusCode: 409` y verificar que el mensaje de error aparece en el modal. *(GAP-PIP-04)*

---

## Criterios de completación

- [ ] Todas las tareas T-001..T-004 en `[x]`
- [ ] `npm test -- --watchAll=false` pasa sin failures
- [ ] 0 regressions en PipelineRetry.test.jsx y ETLLogsPage.test.jsx
- [ ] Nuevos tests cubren los 3 escenarios: 202 éxito, 409 conflicto, motivo inválido
