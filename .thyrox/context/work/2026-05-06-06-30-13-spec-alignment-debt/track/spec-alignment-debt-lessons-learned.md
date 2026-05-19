```yml
created_at: 2026-05-06 07:07:35
project: THYROX
work_package: 2026-05-06-06-30-13-spec-alignment-debt
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — spec-alignment-debt

## Resumen de resultados

| Métrica | Valor |
|---------|-------|
| Deudas identificadas | 5 (D-001..D-005) |
| Deudas resueltas | 5/5 (100%) |
| ITERs ejecutados | 5 (A..E) |
| Tests al inicio | 1588 |
| Tests al cierre | 1602 (+14) |
| Regressions | 0 |
| Commits | 5 + 1 (now.md) |

## Lecciones aprendidas

### L-01: Los mocks mock-first deben seguir el schema del spec desde el día 1

**Qué pasó:** Los mocks originales de `getPipelineStatus()`, `getRealTimeMetrics()` y
`getScheduleHistory()` fueron escritos a mano sin leer los documentos de requisitos.
Resultaron con campos inventados (camelCase, campos inexistentes) o estructura incorrecta
(CRM/PBX/IVR sources en lugar de ResumenSalud).

**Causa raíz:** PAT-UI-002 (mock-first) existía pero no obligaba a leer el spec antes de
escribir el mock. El mock se escribía con intuición.

**Corrección:** Al crear un mock-first, leer siempre `datos-involucrados.rst` del UC
correspondiente antes de escribir el primer valor. El schema del mock ES el contrato.

### L-02: Los formularios necesitan una checklist contra el spec antes de implementar

**Qué pasó:** `ScheduledReportPage` `CreateForm` se implementó con solo 3 de 10 campos
requeridos por el spec (uc-rpt-07). Faltaron `report_type`, `period_relative`, `format`,
`timezone`, y los campos condicionales `day_of_week`, `day_of_month`, `cron_expr`.

**Causa raíz:** No se hizo cross-reference del formulario contra la tabla de campos del spec
durante la implementación inicial.

**Corrección:** Antes de escribir cualquier `<form>`, listar todos los campos del endpoint
POST del UC correspondiente y verificar que el formulario los cubra.

### L-03: SSE vs polling — la distinción es explícita en el spec y no fue leída

**Qué pasó:** `useRealTimeMetrics` usaba `setInterval` (polling cada 30s). El spec uc-rpt-02
define SSE como flujo principal (FA-01), no como alternativo.

**Causa raíz:** Se implementó el mecanismo de actualización por convención ("los hooks de
métricas usan polling") sin leer el apartado de implementación técnica del UC.

**Corrección:** Leer `implementacion-tecnica.rst` de cada UC antes de diseñar el mecanismo
de transporte. SSE, polling, WebSocket — son decisiones del spec, no del implementador.

### L-04: Las contradicciones en el spec deben resolverse por jerarquía de secciones

**Qué pasó:** `informacion-general.rst §1.2` de uc-pip-01 mencionaba throughput/latency/bytes
que no existían en `ResumenSalud` (`datos-involucrados.rst §7.4`). El mock original
se construyó desde §1.2 (más visible) sin cruzar con §7.4 (el contrato real).

**Corrección:** Jerarquía de confianza: `datos-involucrados.rst` > `implementacion-tecnica.rst`
> `informacion-general.rst`. Las secciones generales son aspiracionales; las de datos son
el contrato implementable.

### L-05: El deep-dive del corpus antes de implementar ahorra ITERs de corrección

**Qué pasó:** Se descubrieron 5 deudas post-implementación porque el análisis del corpus
(`/tmp/references/IACT-docs/source/`) no se hizo antes de los WPs de implementación.

**Corrección:** Para cualquier UC que involucre un modelo de datos no trivial, hacer el
deep-dive del spec corpus ANTES de escribir el primer mock. Costo: 1 agente. Beneficio:
evitar WPs de corrección completos.
