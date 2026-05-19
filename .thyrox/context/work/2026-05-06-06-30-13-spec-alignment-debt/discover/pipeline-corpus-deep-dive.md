```yml
created_at: 2026-05-06 06:45:00
project: THYROX
work_package: 2026-05-06-06-30-13-spec-alignment-debt
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Deep-dive: corpus uc-pip-01 — modelo canónico para PipelineStatusPage

Análisis de 13 archivos fuente. 65 tool_uses ejecutados por el agente.

---

## 1. Modelo de datos canónico

### PipelineExecution — campos exactos del DDL físico

**PROVEN** (`databases/etl-pipeline.rst` DDL + `uc-pip-01/datos-involucrados.rst`):

```sql
-- Tabla física: pipeline_runs (MariaDB, no PostgreSQL)
id              INT AUTO_INCREMENT PRIMARY KEY
source_table    VARCHAR(100) NOT NULL      -- tabla fuente procesada
trimestre       VARCHAR(20) NOT NULL       -- ej: "Q3_25"
started_at      DATETIME NOT NULL
finished_at     DATETIME                   -- null si aún corre
estado          ENUM('en_ejecucion','exitoso','fallido')
base_records    INT DEFAULT 0             -- filas en Base Analítica tras ETL
error_message   TEXT                      -- null si exitoso
executed_by     VARCHAR(100)              -- 'scheduler' | 'manual'
```

**Contradicción interna del corpus** (PROVEN en ambas fuentes):
El domain model UML (`arquitectura-tecnica/domain-model/pipeline-execution.rst`)
usa `period` y valores en inglés (`IN_PROGRESS|SUCCEEDED|FAILED`).
El DDL físico y el UC de requisitos usan `trimestre` y español.
**Resolución**: la query en `implementacion-tecnica.rst` selecciona
explícitamente los nombres del DDL físico — esos son los nombres que
viajan en el JSON del endpoint.

### ResumenSalud — proyección de lectura

**PROVEN** (`uc-pip-01/datos-involucrados.rst` §7.4):

```
ultima_ejecucion_exitosa : PipelineExecution | null
ejecucion_en_curso       : PipelineExecution | null
ultima_ejecucion_fallida : PipelineExecution | null
total_exitosas_24h       : int
total_fallidas_24h       : int
estado_general           : ok | degradado | critico
```

**INCIERTO**: `ultima_ejecucion_fallida` existe en el modelo pero
NO aparece en el JSON de ejemplo de `actores-precondiciones.rst`.
Incluir en el mock con valor `null`.

---

## 2. Endpoint canónico

**PROVEN** — tres fuentes independientes coinciden:

```
GET /api/v1/etl/supervision/
Authorization: Bearer <token>
RBAC: view_pipeline_status
```

URL del mock actual era incorrecta (no tenía URL, retornaba
objeto hardcodeado). El TODO comment decía
`GET /api/etl/pipeline/status/` — eso también es incorrecto.

---

## 3. Response body exacto

**PROVEN** (`uc-pip-01/actores-precondiciones.rst` §2.5):

```json
{
  "estado_general": "ok | degradado | critico",
  "ultima_ejecucion_exitosa": {
    "trimestre": "Q3_25",
    "finished_at": "<timestamp>",
    "base_records": 1234567
  },
  "ejecucion_en_curso": null,
  "total_exitosas_24h": 2,
  "total_fallidas_24h": 0
}
```

El `ResumenSalud` se serializa **directamente** como body — sin envelope
wrapper. `ultima_ejecucion_exitosa` es un subconjunto de `PipelineExecution`
(solo 3 campos), no el objeto completo.

### Mock canónico correcto para `getPipelineStatus()`

```js
return {
  estado_general: 'ok',                    // 'ok' | 'degradado' | 'critico'
  ultima_ejecucion_exitosa: {
    trimestre: 'Q2_26',
    finished_at: '2026-05-06T03:42:00Z',
    base_records: 1_234_567,
  },
  ejecucion_en_curso: null,               // PipelineExecution parcial | null
  ultima_ejecucion_fallida: null,         // INCIERTO: incluir por seguridad
  total_exitosas_24h: 2,
  total_fallidas_24h: 0,
}
```

---

## 4. Contradicción crítica en el spec (informacion-general.rst §1.2)

**PROVEN** (`uc-pip-01/informacion-general.rst` §1.2) — declara como métricas
de la pantalla: "throughput rows/min, bytes processed, avg latency".

**PROVEN** (`uc-pip-01/datos-involucrados.rst` §7.4) — `ResumenSalud`
NO contiene `throughput`, `bytes_processed`, ni `avg_latency`.
`PipelineExecution` tampoco tiene esos campos.

**Conclusión**: la sección 1.2 (aspiracional) contradice el modelo concreto
de sección 7 (implementable). La implementación actual de `PipelineStatusPage`
con fuentes/throughput/lag fue probablemente construida leyendo §1.2
sin cruzar con §7.4. Esas métricas no están implementadas en el contrato
del endpoint actual.

---

## 5. Comportamiento de UI requerido

**PROVEN**:
- Mostrar `estado_general` con alerta visual (rojo si degradado/crítico)
- Mostrar `finished_at` de última ejecución exitosa — **OBLIGATORIO**
  por CNST_008 §UI: "toda vista con datos IVR DEBE mostrar el timestamp
  de la última ejecución ETL exitosa"
- Mostrar `total_exitosas_24h` y `total_fallidas_24h`
- Mostrar ejecución en curso si `ejecucion_en_curso != null`
- Link a UC_PIP_02 (errores/drill-down) cuando hay ejecuciones fallidas

---

## 6. Auto-refresh y SSE

**PROVEN** (`uc-pip-01/flujo-principal.rst`):
"el frontend **puede** auto-refrescar cada 30 segundos" — **opcional**.

**PROVEN** (`uc-pip-01/flujos-alternos.rst` FA-04):
SSE existe como flujo alterno (no el flujo principal). Reutiliza patrón P-61.

**Conclusión**: el polling de 30s en `setInterval` es correcto para
este UC. SSE es una mejora futura documentada, no un requerimiento actual.
A diferencia de uc-rpt-02 donde SSE es el flujo principal,
aquí el polling es el flujo principal y SSE es el alterno.

---

## 7. Relación con UCs vecinos

| UC | Propósito | Acción en PipelineStatusPage |
|----|-----------|------------------------------|
| UC_PIP_02 | Diagnóstico de pipelines fallados | Agregar link cuando `total_fallidas_24h > 0` |
| UC_PIP_03 | Timestamp último refresh por dataset | **Página separada**, no incluir aquí |
| UC_PIP_04 | Reintento de ETL fallado | No en esta página — flujo: pip-01 → pip-02 → pip-04 |

---

## 8. Estado_general: quién lo calcula

**PROVEN** (`uc-pip-01/implementacion-tecnica.rst`):

```
ok       → última exitosa con finished_at dentro de 14 horas
degradado → última exitosa entre 14 y 24 horas atrás
critico   → sin exitosa en 24h | última ejecución = fallido
```

El **backend lo calcula** y lo incluye en el response.
El frontend solo renderiza el valor recibido.

---

## 9. Fuentes consultadas

| Archivo | Status |
|---------|--------|
| `uc-pip-01/datos-involucrados.rst` | PROVEN |
| `uc-pip-01/actores-precondiciones.rst` | PROVEN |
| `uc-pip-01/implementacion-tecnica.rst` | PROVEN |
| `uc-pip-01/flujo-principal.rst` | PROVEN |
| `uc-pip-01/flujos-alternos.rst` | PROVEN |
| `uc-pip-01/informacion-general.rst` | PROVEN (con contradicción documentada) |
| `uc-pip-01/requisitos-no-funcionales.rst` | PROVEN |
| `databases/etl-pipeline.rst` | PROVEN |
| `domain-model/pipeline-execution.rst` | PROVEN (naming alternativo) |
| `domain-model/pipeline-execution-repo.rst` | PROVEN |
| `uc-pip-02..04/informacion-general.rst` | PROVEN |
| `WP source-corrections-pipeline` | PROVEN |
| `WP pipeline-uc-deepening` | PROVEN (modelo anterior, pre-corrección) |
