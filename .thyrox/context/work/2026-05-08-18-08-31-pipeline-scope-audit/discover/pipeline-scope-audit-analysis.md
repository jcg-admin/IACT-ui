```yml
created_at: 2026-05-08 18:08:31
project: IACT-UI
work_package: 2026-05-08-18-08-31-pipeline-scope-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# Analysis — pipeline-scope-audit

## Objetivo

Auditar los módulos reservados (Operator, Supervision) y el módulo Pipeline
para determinar: (1) que los reservados están correctamente fuera de scope,
y (2) que Pipeline está completamente implementado conforme a IACT-docs v5.6.0.

**Continuación directa de:** WP `uc-alignment-full-audit` que auditó 66 UCs
de Fase 1 y dejó Operator, Supervision y pipeline-detail como "Reservados".

---

## Stakeholders

- **Usuario final:** Administrador de TI (pipeline monitoring) y Admin RBAC
- **Scope de auditoría:** Módulos Operator, Supervision, Pipeline de IACT-docs
  branch `feature/cnst-033-uml-conformance`

---

## Hallazgos por módulo

### MOD_Operator — 10 UCs (UC-022..UC-031)

**Fuente:** `/tmp/references/IACT-docs/source/requisitos/requisitos-funcionales/operator/index.rst`

```
warning:: Modulo reservado (out-of-scope para v5.6.0)
MOD_Operator es un extension point open-closed del modelo RBAC v5.6.0.
Los FR derivados de UC_OPR_01..10 se preservan como base de diseño para
activación futura, NO como especificación implementable en esta release.
```

**Veredicto:** PROVEN: sin gap. Correctamente excluido de la implementación
actual. No se deben crear páginas/componentes para estos UCs en v5.6.0.

UCs afectados: UC-022 (cambiar estado agente), UC-023 (atender llamada
entrante), UC-024 (iniciar llamada saliente), UC-025 (pausar llamada),
UC-026 (transferir llamada), UC-027 (registrar disposición), UC-028
(solicitar descanso), UC-029 (ver métricas propias), UC-030 (ver historial
llamadas), UC-031 (leer buzón interno).

---

### MOD_Supervision — 3 UCs (UC-075..UC-077)

**Fuente:** `/tmp/references/IACT-docs/source/requisitos/requisitos-funcionales/supervision/index.rst`

```
warning:: Modulo reservado (out-of-scope para v5.6.0)
MOD_Supervision es un extension point open-closed del modelo RBAC v5.6.0.
Los FR derivados de UC_SUP_01..03 se preservan como base de diseño para
activación futura, NO como especificación implementable.
```

**Veredicto:** PROVEN: sin gap. Correctamente excluido de la implementación.

UCs afectados: UC-075 (monitorear llamada), UC-076 (intervenir llamada),
UC-077 (enviar mensaje masivo).

---

### MOD_Pipeline — 4 UCs

**Fuente:** `/tmp/references/IACT-docs/source/requisitos/requisitos-funcionales/pipeline/`
(sin advertencia de reservado — módulo en scope para v5.6.0)

| UC | Descripción | Página | Ruta AppRouter | Estado |
|----|-------------|--------|----------------|--------|
| UC-071 | Ver estado pipeline | `PipelineStatus.jsx` | `/logs/pipeline` (ProtectedRoute VIEW_ETL_SUPERVISION) | ✅ Completo |
| UC-072 | Ver errores pipeline | `ETLLogs.jsx` | `/logs/etl` (ProtectedRoute VIEW_PIPELINE_LOGS) | ✅ Completo |
| UC-073 | Ver disponibilidad datos | `ETLAvailability.jsx` | `/logs/etl/availability` | ✅ Completo |
| UC-074 | Reintentar pipeline | Inline en `ETLLogs.jsx` | Sin ruta propia | ⚠️ Gaps — ver abajo |

---

## Gaps confirmados — UC-074 (FR-074.01)

**FR-074.01** especifica:
> POST con `trimestre` (formato Q01_25) + `motivo` (≥ 20 chars).
> Verificar no hay ejecución en curso (estado='en_ejecucion') → 409 Conflict.
> Valida motivo corto → 422 Unprocessable.

### GAP-PIP-01: Payload incompleto en retryPipeline thunk

**PROVEN** — `src/redux/slices/logs.js:81-90`:
```js
export const retryPipeline = createAsyncThunk(
  'logs/retryPipeline',
  async (logId, ...) => logsService.retryPipeline(logId)
)
```
`logsService.retryPipeline(logId)` llama `POST /api/etl/logs/${logId}/retry/`
sin body. El FR requiere `{ trimestre, motivo }` en el body del request.

### GAP-PIP-02: Sin campo motivo en la UI (ETLLogs.jsx)

**PROVEN** — `src/pages/logs/ETLLogs.jsx`: el confirm modal de retry solo
pide confirmación binaria (`isOpen/logId`). No hay campo para ingresar
`motivo` (≥ 20 chars) ni `trimestre`.

### GAP-PIP-03: Sin mock handler para POST /api/etl/logs/{id}/retry/

**PROVEN** — `src/mocks/mockInterceptor.js`: no existe handler para
`POST /api/etl/logs/{id}/retry/`. El router cae en `404 Not found`.
(Existe `/api/v1/etl/supervision/` como GET, pero no el endpoint de retry.)

### GAP-PIP-04: Sin manejo de 409 Conflict (ejecución activa) en UI

**PROVEN** — El dispatch de `retryPipeline` no maneja el caso en que el
backend devuelve 409 (ya hay ejecución activa). La UI muestra el error
genérico del errorHandlingMiddleware sin mensaje específico.

---

## Fuera de scope (caller/IVR)

Los 5 UCs caller (UC-066..UC-070) fueron excluidos explícitamente en el
WP anterior. No se re-auditan en este WP.

---

## Tamaño del WP

**Pequeño** — 4 gaps concretos en UC-074, 0 en Operator/Supervision.
Fases activas: 1 (DISCOVER) → 10 (IMPLEMENT) → 11 (TRACK). Sin Phase 3.

---

## Criterios de éxito

- [ ] Operator y Supervision documentados como out-of-scope (ninguna tarea de impl.)
- [ ] UC-071, UC-072, UC-073 confirmados completos (sin tarea)
- [ ] UC-074 gaps cerrados: mock handler + motivo field + 409 handling
- [ ] `npm test -- --watchAll=false` 0 failures tras los cambios
- [ ] Nuevos tests cubren los 3 escenarios del FR (éxito, 409, 422)

---

## Stopping Point Manifest

| ID | Fase | Tipo | Evento | Acción requerida |
|----|------|------|--------|------------------|
| SP-01 | 1→10 | gate-fase | Este análisis aprobado | Confirmar scope y proceder con IMPLEMENT |
| SP-02 | 10→11 | gate-fase | Tests en verde, 0 failures | Ejecutar Phase 11 TRACK |
