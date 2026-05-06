```yml
created_at: 2026-05-06 07:27:57
project: THYROX
work_package: 2026-05-06-07-12-19-reports-dashboard-analysis
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Análisis del Corpus de WPs — IACT-docs

Fuente: `/tmp/references/IACT-docs/.thyrox/context/work/` — 149 WPs (PROVEN: `ls | wc -l`)
Período: 2026-04-22 → 2026-05-06

---

## 1. Distribución por área temática

| Área | WPs | Período |
|------|-----|---------|
| Infraestructura Sphinx/CI/build | 18 | Abr 22 – May 6 |
| Especificación de UCs (spec-completa) | 26 | May 1 |
| Arquitectura técnica y UML | 22 | May 2 – May 5 |
| RBAC y permisos | 8 | Abr 29 – May 4 |
| Source rebuilds (dominios) | 13 | Abr 28 |
| Pipeline ETL y correcciones | 4 | May 2 |
| Calidad / auditorías | 7 | Abr 29 – May 5 |
| PlantUML / diagramas | 8 | May 4 – May 6 |
| Metodología / proceso | 4 | Abr 25 – Abr 30 |
| Otros (git workflow, naming, misc) | 9 | Abr 26 – May 5 |

---

## 2. Hallazgos estructurales más importantes (por WP)

### 2.1 Arquitectura ETL — hallazgo disruptivo

**WP:** `2026-05-02-07-12-32-pipeline-uc-deepening`

La arquitectura ETL documentada originalmente (Python ETL + PostgreSQL Analytics)
era **incorrecta**. La arquitectura real usa:

```
MariaDB 10.1.48 (servidor cliente — dos roles):
  ├── tbl_historico_tN_YYYY   ← tablas fuente IVR (propiedad cliente, solo SELECT)
  └── base_ivr_detalle        ← tablas limpias IVR (propiedad IACT, ETL escribe aquí)
      base_ivr_clientes
      etl_runs                ← tracking de ejecuciones ETL (D-ETL-002)

PostgreSQL (servidor IACT):
  └── Tablas operacionales Django: usuarios, sesiones, RBAC, alertas, audit log
```

El ETL es **MySQL-interno**: Stored Procedures + Functions + Events/Jobs + Triggers.
Django consume **solo** las tablas limpias MySQL — no accede a `tbl_historico_*`.

**Decisiones confirmadas por el equipo (D-01, D-02):**
- Prefijo `rpt_` para todas las tablas limpias: `rpt_menu_centro`, `rpt_clientes_unicos`,
  `rpt_llamadas_abandonadas`, `rpt_centros_transferencia`, `rpt_colgadas`,
  `rpt_cMENU_ERROR`, `rpt_menu_redirigidos`
- Scope 1 = 7 reportes IVR reales (no los 14 genéricos de agents/queues/campaigns)

**Impacto en IACT-UI:** Los 6 tipos de reporte implementados (`AgentsReportPage`,
`QueuesReportPage`, etc.) usan naming correcto según el spec, pero el backend que
los alimenta usa stored procedures MySQL — no APIs Django genéricas.

### 2.2 Catálogo de UCs — 61 UCs vigentes (no 83)

**WP:** `2026-05-01-05-17-20-uc-dependency-matrix-iact`

```
Casos de uso vigentes:    61 (verificado)
Clusters funcionales:      9
Clases canónicas:         25 (modelo-dominio-iact v1.0.0)
Bounded contexts:          7
Funciones RBAC:           61 (modelo-rbac-iact v5.4.0)
```

**Distribución por criticidad:**
- Críticos: 8 UCs (13%)
- Resto: 53 UCs

**Hallazgos clave del grafo de dependencias:**
- 59 de 61 UCs requieren Auth + RBAC (T-01 + T-02) — middleware con mayor leverage
- UC_PERM_07 es el cuello de botella más crítico: invocado en cada request por todos los UCs operativos. Requisito explícito: < 50 ms con cache LRU
- UC_PIP_01 es prerequisito background de todos los UCs RPT y ALR
- El cluster RPT (15 UCs) es el más voluminoso — estimado 41 person-days
- 18 UCs son raíces del grafo (sin dependencias entrantes)

### 2.3 RBAC — drift estructural crítico detectado y resuelto

**WP:** `2026-04-30-00-07-08-rbac-functions-count-audit`

Se detectó conflict entre modelo RBAC v5.2.1 (42 funciones) y UCs vigentes que
referenciaban segmentación (UC_ACC_06/07). El modelo v5.4.0 final tiene **61 funciones**.

**WP:** `2026-05-04-06-15-52-cia-rbac-002-drf-integration`

`@require_function(RPT-001)` usaba `function_id` — CIA-RBAC-002 establece que
el argumento correcto es el **`name`** de la función, no su ID.

### 2.4 Requisitos funcionales faltantes — 9 dominios sin FRs

**WP:** `2026-05-04-04-52-10-frs-missing-9-domains`

Solo 3 dominios tienen FRs derivados (`auth`, `users`, `access`).
Los 9 restantes no tienen ningún FR documentado:
`reports`, `pipeline`, `supervision`, `alerts`, `operator`, `logs`,
`admin`, `permissions`, `caller`.

**Impacto directo en IACT-UI:** No hay FRs formales derivados para el módulo
de reportes — las páginas se implementaron directamente desde los UCs sin
pasar por la capa de FRs.

### 2.5 Merge PR bloqueado — CI timeout por PlantUML

**WP:** `2026-05-05-05-07-43-merge-develop-pr-review`

**Veredicto: BLOQUEADO** — la rama `feature/solve-problem-docs` tiene:
- 645 commits ahead of develop
- 5,823 archivos cambiados
- Build local: ~36 minutos
- CI timeout configurado: 20 minutos
- 965 directivas PlantUML → ~32 min solo en renders

El problema raíz NO son warnings (son 0 localmente) sino el tiempo de build.

**Solución implementada (WP posterior):** pre-render de SVGs via `plantuml_cached.py`
para que CI use SVGs pre-generados en lugar de renderizar en runtime.

### 2.6 PlantUML cache corruption — estado al 2026-05-06

**WP:** `2026-05-06-01-29-18-plantuml-cache-corruption-remediation` (último WP activo)

1227 de 1438 SVGs en `source/_generated_diagrams/` contienen "Syntax Error?"
como placeholder — generados con bug `-cfgfile` en el commit inicial del cache.
La extensión `plantuml_cached.py` verificaba existencia del archivo pero no contenido.
Resultado: build "succeeded" pero HTML mostraba "Syntax Error?" en ~85% de diagramas.

**Estado:** WP activo — en proceso de regeneración de los 1227 SVGs corruptos.

### 2.7 Schema real de tablas IVR fuente

**WP:** `2026-05-02-07-12-32-pipeline-uc-deepening` → `real-db-schema-analysis.md`

```
tbl_historico_tN_YYYY (una tabla por trimestre):
  dFecha                    : fecha de la llamada
  cDID_800Transfer          : número DID 800
  cDID_Centro_Transferencia : centro de transferencia destino
  cMenu                     : menú IVR navegado
  cOpcion                   : opción seleccionada
  cTelefono_Origen          : número del caller (PII — nunca expuesto)
  cTelefono_Digitado        : número digitado por el caller

Vista normalizada llamadas_QN (13+ columnas):
  id_CTransferencia, id_8T, division, area, nidMQ, etiquetas, ...
```

---

## 3. Línea de tiempo — fases del proyecto IACT-docs

```
Abr 22-27: Fase 0 — Setup y diagnóstico
  Sphinx config, CI/CD, git workflow, zero-warnings build

Abr 28:    Fase 1 — Source rebuild (13 dominios en paralelo)
  Reconstrucción completa de source/ desde cero

Abr 29:    Fase 2 — Saneamiento y calidad
  md→rst, STD-007 naming, emoji/tables audit, RBAC cleanup

May 1:     Fase 3 — Especificación de UCs (sprint intensivo)
  26 WPs en 1 día: auth, users, access, permissions, reports, pipeline

May 2:     Fase 4 — Correcciones de arquitectura
  Pipeline ETL (hallazgo disruptivo), arquitectura modular

May 4-5:   Fase 5 — UML y arquitectura técnica
  Kruchten views, diagramas, RBAC consistency, naming rigor

May 5-6:   Fase 6 — Pre-render PlantUML (problema CI)
  Cache SVG para resolver timeout de 36 min en CI
```

---

## 4. Decisiones de arquitectura relevantes para IACT-UI

| Decisión | WP origen | Impacto en UI |
|----------|-----------|---------------|
| MariaDB dual-role (fuente + analítica) | source-corrections-pipeline | El frontend consume APIs Django que leen tablas limpias MySQL (no PostgreSQL) |
| 7 reportes IVR reales con prefijo `rpt_` | pipeline-uc-deepening | Los 6 tipos de reporte en IACT-UI están correctamente nombrados |
| RBAC por `name` (no por ID) | cia-rbac-002-drf-integration | Los decoradores `ProtectedRoute` deben usar nombres de función, no IDs |
| UC_PERM_07 < 50ms con cache LRU | uc-dependency-matrix | Cualquier middleware de RBAC en el frontend debe ser liviano |
| UC_PIP_01 es prerequisito de todos los RPT | uc-dependency-matrix | Si el pipeline está caído, el dashboard muestra datos stale — requiere indicador |
| Dashboard IVR usa cache 30s invalidado por ETL | UC-RPT-01 spec | El Dashboard.jsx debe revalidar al detectar nueva ejecución ETL exitosa |
| 9 dominios sin FRs formales | frs-missing-9-domains | Reportes se implementan directo desde UCs — riesgo de gaps no detectados |

---

## 5. Estado actual del proyecto IACT-docs (al 2026-05-06)

| Aspecto | Estado |
|---------|--------|
| Build local | ✅ 0 warnings, ~36 min |
| CI build | ❌ Timeout — requiere merge de PlantUML cache fix |
| UCs especificados | ✅ 61/61 con 12 partes cada uno |
| FRs derivados | ⚠ Solo 3/12 dominios tienen FRs (auth, users, access) |
| PlantUML SVGs | ⚠ 1227/1438 corruptos — WP activo en remediación |
| Merge a develop | ❌ Bloqueado hasta que CI pase |
| Modelo RBAC | ✅ v5.4.0 — 61 funciones |
| Modelo de dominio | ✅ v1.0.0 — 25 clases canónicas |

---

## 6. Gaps más relevantes para trabajo futuro en IACT-UI

Derivados del análisis del corpus IACT-docs:

1. **Dashboard IVR**: El `Dashboard.jsx` actual no implementa ningún campo del spec `DashboardIVR`. Es la brecha más visible del frontend.
2. **ExportJob async**: UC-RPT-04 no implementado — flujo `queued → running → done` con URL firmada por 24h en S3.
3. **Cache invalidation por ETL**: El dashboard debe actualizarse cuando `UC_PIP_01` detecta nueva ejecución exitosa (webhook o polling al estado del pipeline).
4. **UC_PERM_07 performance**: Cualquier guard de RBAC en el frontend debe evitar llamadas síncronas al backend en cada render — el spec establece < 50ms con cache LRU del lado del servidor.
5. **Segmentación de datos**: UC_INC_RPT_01 (resolver segmento del usuario) aplica a todos los reportes — el frontend debe propagar el `segment_code` activo del usuario en cada query.
