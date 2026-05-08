```yml
created_at: 2026-05-08 22:40:00
project: THYROX
work_package: 2026-05-08-22-24-13-pipeline-scope-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — pipeline-scope-audit

Fuente: `discover/pipeline-scope-audit-analysis.md`
Gaps: GAP-04/07/08 (MEDIO) · GAP-01/02/05/06/09/10 (BAJO)

## DAG de dependencias

```
T-001 → T-002                 (Block I — GAP-01/02: UC_PIP_01 stale state)

T-003 → T-004 → T-005         (Block II — GAP-04/05/06: UC_PIP_02 errors endpoint)

T-006 → T-007 → T-008 → T-009
                               (Block III — GAP-07/08/09/10: UC_PIP_03 availability)
```

---

## Block I — GAP-01/02: UC_PIP_01 stale state (BAJO)

> Agregar `stale` al mapa de colores y al mock.
> Commit al completar T-002.

- [x] [T-001] `src/pages/logs/PipelineStatus.jsx` — agregar entrada `stale: '#f97316'`
  (naranja) al mapa `ESTADO_COLOR`; también agregar comentario inline mínimo con los
  4 valores posibles: `ok | degradado | critico | stale`

- [x] [T-002] `src/mocks/mockInterceptor.js` — en `_handlePipelineStatus()`:
  agregar consulta de URL para simular diferentes estados via query param
  `?test_estado=stale|degradado|critico`; si no hay param, retornar `ok` como antes;
  si `test_estado=stale` → retornar `{ estado_general: 'stale', ultima_ejecucion_exitosa: null,
  total_exitosas_24h: 0, total_fallidas_24h: 0, ejecucion_en_curso: null }`;
  si `degradado` → retornar fixture con última exitosa hace >6h y total_fallidas_24h: 1

---

## Block II — GAP-04/05/06: UC_PIP_02 pipeline errors (MEDIO)

> Gateway + thunk para /api/v1/etl/errores/ + mock handler + error_message en UI.
> Commit al completar T-005.

- [x] [T-003] `src/services/logsGateway.js` — agregar método
  `getPipelineErrors(params = {})` que hace
  `GET /api/v1/etl/errores/` con `{ params }`; params acepta
  `period`, `trimestre`, `pagina`; colocar después de `getPipelineStatus()`

- [x] [T-004] `src/redux/slices/logs.js` — agregar thunk `fetchPipelineErrors`
  usando `createAsyncThunk('logs/fetchPipelineErrors', ...)` que llama
  `logsService.getPipelineErrors(params)`; agregar `pipelineErrors: []` al
  `initialState`; agregar `extraReducers` pending/fulfilled/rejected para
  `fetchPipelineErrors`; exportar el thunk y agregar selector `selectPipelineErrors`

- [x] [T-005] `src/mocks/mockInterceptor.js` — agregar routing para
  `/api/v1/etl/errores/` antes del fallback 404; agregar método
  `_handlePipelineErrors(url)` que:
  - retorna fixture de 3 ejecuciones fallidas con campos
    `{ id, pipeline_name, trimestre, started_at, finished_at, error_message,
      error_type, correlation_id }`
  - incluye al menos 2 tipos de error distintos (e.g. `TIMEOUT`, `DATA_VALIDATION`)
    para testear FA-04 group-by
  - soporta query param `?error_type=` para filtrar subset (FA-02)
  - soporta `?trimestre=` para filtrar por trimestre

---

## Block III — GAP-07/08/09/10: UC_PIP_03 data availability (MEDIO)

> Corregir URL + esquema + FA-01 banner + mock handler.
> Commit al completar T-009.

- [x] [T-006] `src/services/logsGateway.js` — cambiar `getETLAvailability()`:
  URL de `/api/etl/availability/` a `/api/v1/datos/disponibilidad/`;
  aceptar `trimestre` como param opcional:
  `return apiService.get('/api/v1/datos/disponibilidad/', { params: { trimestre } ?? {} })`

- [x] [T-007] `src/redux/slices/logs.js` — actualizar `fetchETLAvailability` para
  aceptar `{ trimestre }` opcional y pasarlo a `logsService.getETLAvailability(trimestre)`

- [x] [T-008] `src/pages/logs/ETLAvailability.jsx` — reescribir para el esquema correcto:
  - mostrar tabla con columnas: Dataset | Estado Frescura | Minutos desde ETL | Última actualización
  - renderizar `estado_frescura` con badge: `fresco` → badge-success,
    `degradado` → badge-warning, `vencido` → badge-danger
  - FA-01: si algún dataset tiene `estado_frescura === 'vencido'` → mostrar banner
    `role="alert"` con texto "Uno o más datasets han vencido — los datos IVR pueden estar
    desactualizados" con estilo peligro (rojo)
  - manejar respuesta como objeto único (si el backend retorna un objeto, no array) o
    array (si retorna varios datasets)

- [x] [T-009] `src/mocks/mockInterceptor.js` — agregar routing para
  `/api/v1/datos/disponibilidad/` antes del fallback 404;
  agregar método `_handleETLAvailability(url)` que retorna:
  - fixture con 2 datasets: uno `estado_frescura: 'fresco'` y uno `estado_frescura: 'vencido'`
    (para testear FA-01 banner rojo)
  - campos: `{ dataset, trimestre, minutos_desde_etl, estado_frescura, ultima_actualizacion,
    registros_disponibles }`
  - soportar query param `?test_state=vencido` para forzar escenario crítico en desarrollo

---

## Checklist de cierre por bloque

| Bloque | Tareas | Commit |
|--------|--------|--------|
| I — GAP-01/02 | T-001..T-002 | `Add stale state to pipeline status color map and mock (UC_PIP_01)` |
| II — GAP-04/05/06 | T-003..T-005 | `Add getPipelineErrors gateway, thunk and mock (UC_PIP_02)` |
| III — GAP-07/08/09/10 | T-006..T-009 | `Fix ETL availability URL, schema and add stale banner (UC_PIP_03)` |
