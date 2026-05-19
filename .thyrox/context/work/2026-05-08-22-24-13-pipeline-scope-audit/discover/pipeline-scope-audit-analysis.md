```yml
created_at: 2026-05-08 22:35:00
project: THYROX
work_package: 2026-05-08-22-24-13-pipeline-scope-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — pipeline-scope-audit

## Scope

UC_PIP_01 · UC_PIP_02 · UC_PIP_03 — módulo Pipeline/ETL.
Fuente: `/tmp/references/IACT-docs/source/requisitos/casos-uso/pipeline/`
Implementación: `src/pages/logs/PipelineStatus.jsx`, `src/pages/logs/ETLLogs.jsx`,
`src/pages/logs/ETLAvailability.jsx`, `src/services/logsGateway.js`,
`src/redux/slices/logs.js`, `src/mocks/mockInterceptor.js`.

---

## UC_PIP_01 — Ver estado general del pipeline

**Flujo principal:** GET `/api/v1/etl/supervision/` → ResumenSalud con
`estado_general`, `ultima_ejecucion_exitosa`, `ejecucion_en_curso`,
`ultima_ejecucion_fallida`, counters 24h. Auto-refresh 30s.

### Estado de implementación base

- ✅ `getPipelineStatus()` → GET `/api/v1/etl/supervision/` — gateway + thunk + mock
- ✅ `PipelineStatus.jsx` renderiza estado_general badge, counters, ejecucion_en_curso
- ✅ setInterval 30s (spec: "frontend puede auto-refrescar cada 30 segundos")
- ✅ `role="alert"` para errores y para total_fallidas_24h > 0

### GAP-01 — ESTADO_COLOR no tiene entrada `stale` — FA-01 sin color propio (BAJO)

**Evidencia (PROVEN):**
```
PipelineStatus.jsx:15  const ESTADO_COLOR = { ok: '#34d399', degradado: '#f59e0b', critico: '#ef4444' }
```
FA-01: "Sin runs → status=stale. alerta posible." Spec define 4 estados posibles
del pipeline. El mapa `ESTADO_COLOR` tiene 3. Si el backend retorna `estado_general: 'stale'`,
el badge usa el color fallback `#9ca3af` (gris) en lugar de un color semántico.
No es un crash sino un gap visual.

### GAP-02 — Mock `_handlePipelineStatus` no cubre `estado_general: 'stale'` ni `'degradado'` (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js:_handlePipelineStatus()  estado_general: 'ok'  (siempre)
```
FA-01 y los criterios CA-02 (pipeline stale detectado) no son testables en desarrollo.
El mock nunca devuelve un estado diferente a `ok`.

### GAP-03 — FA-02 (filter status) no implementado en gateway ni UI (BAJO)

**Evidencia (PROVEN):**
```
logsGateway.js:41  async getPipelineStatus() { return apiService.get('/api/v1/etl/supervision/') }
```
No hay parámetros de filtro. La spec FA-02 dice "Filter status — solo failed (subset)".
Sin embargo, `/api/v1/etl/supervision/` es un endpoint de resumen/salud, no una lista
paginada. Interpretar FA-02 como filtro UI-only (mostrar solo pipelines con estado failed)
es plausible. La ausencia de filter params en el gateway es consistente con el tipo de
endpoint. **Severidad: BAJO** — la información de runs fallidos ya existe en el resumen.

---

## UC_PIP_02 — Ver errores del pipeline

**Flujo principal:** GET `/api/v1/etl/errores/` con filtros opcionales
(period, trimestre, pagina). Retorna ejecuciones fallidas con `error_message`.
Permiso requerido: `view_pipeline_errors`.

### Estado de implementación base — DESVIACIÓN

**Evidencia (PROVEN):**
```
logsGateway.js:9   async getETLLogs(params = {}) { return apiService.get('/api/logs/etl/', { params }) }
logs.js: fetchETLLogs → getETLLogs → /api/logs/etl/
ETLLogs.jsx: despacha fetchETLLogs()
```

La implementación existente usa `/api/logs/etl/` (endpoint general de logs ETL) — no
`/api/v1/etl/errores/` (endpoint específico de errores del pipeline). Las diferencias:
- URL diferente (contract mismatch)
- `/api/logs/etl/` retorna todos los logs (todos los estados)
- `/api/v1/etl/errores/` retorna solo ejecuciones fallidas con `error_message`
- Columna `error_message` no se muestra en ETLLogs.jsx
- FA-04: Group by error_type → root cause: no implementado
- FA-03: Drill por error individual: no implementado

### GAP-04 — Falta `getPipelineErrors(params)` en gateway — URL `/api/v1/etl/errores/` (MEDIO)

**Evidencia (PROVEN):**
```
logsGateway.js: sin método getPipelineErrors
mockInterceptor.js: sin handler para /api/v1/etl/errores/
```
Spec §flujo-principal define explícitamente `GET /api/v1/etl/errores/` como el endpoint.
ETLLogs.jsx usa `/api/logs/etl/` — endpoint diferente. En integración real, la pestaña
de errores del pipeline llegaría al endpoint equivocado.

### GAP-05 — ETLLogs.jsx no muestra `error_message` ni agrupa por error_type (BAJO)

**Evidencia (PROVEN):**
```
ETLLogs.jsx tabla: columnas Timestamp | Proceso | Estado | Duración | Registros
```
Spec §flujo-principal: "incluyendo error_message de cada una."
FA-04: "Group by error_type para identificar root cause comun."
La tabla no muestra `error_message` y no tiene agrupación.

### GAP-06 — Mock no tiene handler para `/api/v1/etl/errores/` (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js: grep 'etl/errores' → 0 resultados
```
En desarrollo, cualquier call a `/api/v1/etl/errores/` retorna 404.

---

## UC_PIP_03 — Ver disponibilidad de datos

**Flujo principal:** GET `/api/v1/datos/disponibilidad/` con `trimestre` opcional.
Retorna `DisponibilidadDatos`: `minutos_desde_etl`, `estado_frescura`
(fresco <720min / degradado 720-1440min / vencido ≥1440min).
FA-01: critical_stale → banner rojo + alerta automática.

### Estado de implementación base — DESVIACIÓN DE ESQUEMA

**Evidencia (PROVEN):**
```
logsGateway.js:33   async getETLAvailability() { return apiService.get('/api/etl/availability/') }
ETLAvailability.jsx: renders process | available: boolean | last_run | next_run
```

La implementación actual:
- URL incorrecta: `/api/etl/availability/` vs spec `/api/v1/datos/disponibilidad/`
- Esquema incorrecto: renderiza `available: boolean` (proceso up/down) en lugar de
  `estado_frescura` (frescura de los datos ETL: fresco/degradado/vencido)
- Sin `trimestre` param
- Sin banner de `critical_stale` (FA-01)
- Sin mock handler: `/api/etl/availability/` no está ruteado en mockInterceptor → 404

### GAP-07 — URL mismatch `/api/etl/availability/` vs `/api/v1/datos/disponibilidad/` (MEDIO)

**Evidencia (PROVEN):**
```
logsGateway.js:33  apiService.get('/api/etl/availability/')
```
Spec §flujo-principal: `GET /api/v1/datos/disponibilidad/`.
El concepto también es distinto: `available: boolean` ≠ `estado_frescura` de datos.

### GAP-08 — ETLAvailability.jsx no muestra estado_frescura ni minutos_desde_etl (MEDIO)

**Evidencia (PROVEN):**
```
ETLAvailability.jsx: columnas Proceso | Disponible (badge) | Última ejecución | Próxima ejecución
```
Spec define `estado_frescura: fresco|degradado|vencido` y `minutos_desde_etl`.
La UI actual renderiza un esquema distinto que no refleja la semántica de disponibilidad
de datos IVR.

### GAP-09 — FA-01 critical_stale banner rojo no implementado (BAJO)

**Evidencia (PROVEN):**
```
ETLAvailability.jsx: solo badge 'badge-success'/'badge-danger' por item
```
FA-01: "Dataset critical_stale → banner rojo en UI + alerta automática."
No hay lógica que detecte `estado_frescura: 'vencido'` y muestre un banner de alerta.

### GAP-10 — Mock no tiene handler para `/api/etl/availability/` ni `/api/v1/datos/disponibilidad/` (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js: routing — etl/availability no ruteado → 404
```
En desarrollo, `fetchETLAvailability` recibe 404 siempre.

---

## Resumen de gaps en scope

| ID | UC | Severidad | Descripción | Archivos afectados |
|----|-----|-----------|-------------|-------------------|
| GAP-01 | UC_PIP_01 | BAJO | ESTADO_COLOR falta entrada `stale` — FA-01 color no semántico | PipelineStatus.jsx |
| GAP-02 | UC_PIP_01 | BAJO | Mock solo retorna `ok` — stale/degradado/critico no testables | mockInterceptor.js |
| GAP-03 | UC_PIP_01 | BAJO | FA-02 filter por status: endpoint de resumen, filtro es UI-only; no crítico | — |
| GAP-04 | UC_PIP_02 | MEDIO | Falta `getPipelineErrors` gateway + thunk → URL incorrecta | logsGateway.js, logs.js |
| GAP-05 | UC_PIP_02 | BAJO | ETLLogs.jsx no muestra `error_message` ni agrupa por error_type | ETLLogs.jsx |
| GAP-06 | UC_PIP_02 | BAJO | Mock no tiene handler `/api/v1/etl/errores/` → 404 | mockInterceptor.js |
| GAP-07 | UC_PIP_03 | MEDIO | URL mismatch `/api/etl/availability/` vs `/api/v1/datos/disponibilidad/` | logsGateway.js |
| GAP-08 | UC_PIP_03 | MEDIO | ETLAvailability.jsx renderiza esquema incorrecto (available vs estado_frescura) | ETLAvailability.jsx |
| GAP-09 | UC_PIP_03 | BAJO | FA-01 critical_stale banner rojo no implementado | ETLAvailability.jsx |
| GAP-10 | UC_PIP_03 | BAJO | Mock no tiene handler para disponibilidad endpoint → 404 | mockInterceptor.js |

**GAP-03 descartado del task plan:** FA-02 en `/api/v1/etl/supervision/` es un filtro
de presentación UI; el endpoint es de resumen/salud y no tiene paginación. No hay spec
explícita de parámetros de query para este endpoint. Bajo + ambiguo = fuera de scope.

---

## Patrón PAT-UC-AUDIT-001

Aplicado: spec completa leída (flujo-principal + flujos-alternos + criterios-aceptacion +
excepciones) para los 3 UCs. Implementación verificada con Read/Grep en archivos fuente reales.

## Exit criteria Phase 1

- [x] Spec UC_PIP_01/02/03 leída completa
- [x] Implementación auditada (gateway, slices, components, mock)
- [x] 9 gaps en scope clasificados con evidencia PROVEN (GAP-01..02, GAP-04..10)
- [x] GAP-03 descartado (ambiguo, no spec explícita de params para endpoint de resumen)
