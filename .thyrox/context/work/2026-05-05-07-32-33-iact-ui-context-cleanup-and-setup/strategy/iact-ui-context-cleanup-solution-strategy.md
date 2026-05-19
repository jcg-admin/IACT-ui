```yaml
created_at: 2026-05-05 07:45:00
project: IACT-UI
author: NestorMonroy
status: Aprobado — pendiente ejecución
phase: Phase 5 — STRATEGY
```

# Phase 5 STRATEGY — Limpieza de contexto y setup THYROX para IACT-UI

## Resumen ejecutivo

El contexto `.thyrox/context/` contiene **238 archivos** repartidos en 8
secciones, todos pertenecientes a proyectos ajenos (IACT-docs / THYROX
framework). La estrategia es de **eliminación total + reescritura selectiva**:
eliminar las 6 secciones de datos históricos foráneos y reescribir los 8
archivos raíz con contenido propio de IACT-UI.

---

## Inventario de decisiones por sección

### SECCIÓN 1: `decisions/` — 37 archivos → **ELIMINAR TODO**

**Qué son:** ADRs de IACT-docs (Sphinx, RST, extensiones de documentación).

**Archivos representativos:**
- `adr-sphinx-configuration.md` — extensiones Sphinx
- `adr-hierarchical-toctree-structure.md` — estructura RST
- `adr-decouple-myst-parser.md` — parser de documentación
- `adr-docker-containerizacion.md` — Docker para IACT-docs
- `adr-postgresql.md` — base de datos de IACT-docs

**Decisión:** Eliminar el directorio completo y su índice `decisions.md`.
Crear desde cero con ADRs propias de IACT-UI (ver sección REESCRIBIR).

---

### SECCIÓN 2: `work/` — 133 WPs → **ELIMINAR TODOS EXCEPTO EL NUESTRO**

**Qué son:** 133 work packages históricos de IACT-docs y THYROX.
El único WP válido es el que acabamos de crear.

**WP a conservar:**
- `2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup` ← NUESTRO

**Decisión:** Eliminar los 133 WPs históricos. El directorio `work/`
se mantiene con solo el WP activo.

---

### SECCIÓN 3: `errors/` — 22 archivos → **ELIMINAR TODO**

**Qué son:** Anti-patterns de metodología THYROX (ERR-001..ERR-029).
Errores sobre gestión de fases, documentación RST, scripts de framework.

**Archivos representativos:**
- `analysis-not-documented.md` — error de proceso THYROX
- `confused-flow-structure.md` — error de flujo THYROX
- `agent-state-lifecycle-gap.md` — error de agentes de THYROX
- `archive-instead-of-organize.md` — error de organización IACT-docs
- `README.md` — índice de errores (de otro proyecto)

**Decisión:** Eliminar directorio completo. Los errores reales de IACT-UI
(bugs, issues) se documentarán a medida que aparezcan.

---

### SECCIÓN 4: `patterns/` — 10 archivos → **ELIMINAR TODO**

**Qué son:** Patrones de Google ADK (Python), LangChain, HITL.
Ninguno aplica a desarrollo frontend React.

**Archivos:**
- `hitl-blocking-loop.md` — Human-In-The-Loop con Python
- `hitl-interrupt-resume.md` — HITL interrupt
- `adk-model-callback-contract.md` — Google ADK
- `adk-tool-callback-contract.md` — Google ADK
- `langchain-imports-correct.md` — LangChain Python
- `named-mechanism-vs-implementation.md` — abstracción de agentes
- `git-mv-migracion.md` — git pattern (único potencialmente genérico)
- `validate-wire-test.md` — scripts de framework
- `bound-explicito-agente.md` — scope de agentes THYROX
- `README.md` — índice

**Decisión:** Eliminar directorio completo. `git-mv-migracion.md` es
el único con contenido genérico pero está cubierto por la documentación
oficial de git.

---

### SECCIÓN 5: `lessons/` — 5 archivos → **ELIMINAR TODO**

**Qué son:** Lecciones aprendidas del trabajo con Claude Code en IACT-docs.

**Archivos:**
- `bound-agente-timeout.md` — L-004: timeouts de agentes sin scope
- `env-var-sesion-activa.md` — L-003: vars de entorno en subagentes
- `referencias-abstractas.md` — L-001: bulk-sed en documentación RST
- `script-sin-registrar.md` — L-002: script sin registrar en settings.json
- `README.md` — índice

**Decisión:** Eliminar directorio completo. Las lecciones L-003 y L-004
(sobre Claude Code agents) podrían ser útiles si IACT-UI usa agentes
extensivamente, pero actualmente no lo hace. Se pueden recuperar del
historial de git si se necesitan.

---

### SECCIÓN 6: `research/` — 31 archivos → **ELIMINAR TODO**

**Qué son:** Investigaciones internas del framework THYROX:
análisis de deuda técnica del framework, review de la plataforma Claude,
análisis de metodologías (BABOK, PMBOK, LEAN).

**Subdirectorios:**
- `2026-04-13-technical-debt-sandbox/` — deuda técnica de THYROX
- `claude-platform-deep-review/` — análisis de plataforma Claude
- `methodology-frameworks-v3.1.md` — comparativa BABOK/PMBOK/RUP
- `universal-flow-critical-analysis.md` — análisis del framework THYROX

**Decisión:** Eliminar directorio completo. Toda la investigación es
sobre el framework, no sobre IACT-UI.

---

### SECCIÓN 7: Archivos raíz foráneos — 6 archivos → **ELIMINAR**

Archivos en `.thyrox/context/` raíz que son 100% de otros proyectos:

| Archivo | Proyecto | Contenido |
|---------|----------|-----------|
| `github-implementation-analysis.md` | IACT-docs | Análisis de GitHub Actions para docs |
| `sphinx-rst-title-audit.md` | IACT-docs | Auditoría de títulos RST |
| `sphinx-structure-reference-analysis.md` | IACT-docs | Estructura Sphinx |
| `sphinx-title-format-analysis.md` | IACT-docs | Formato de títulos Sphinx |
| `phase-history.jsonl` | IACT-docs | Historial de fases de IACT-docs |

**Decisión:** Eliminar los 5 archivos Sphinx. Conservar `now.md` para
reescribir (ver sección siguiente).

---

### SECCIÓN 8: Archivos raíz a REESCRIBIR — 6 archivos

Estos archivos existen en la raíz de `.thyrox/context/` pero tienen
contenido de IACT-docs. Se reescriben con contenido de IACT-UI:

| Archivo | Estado actual | Contenido nuevo |
|---------|--------------|-----------------|
| `now.md` | Sesión de IACT-docs | Estado de sesión IACT-UI (cold_boot tras merge) |
| `technical-debt.md` | Deuda de IACT-docs | Deuda real de IACT-UI (37 suites, tsconfig, etc.) |
| `knowledge-base.md` | KB de IACT-docs | Índice de conocimiento IACT-UI |
| `decisions.md` | Índice ADRs IACT-docs | Índice ADRs IACT-UI |
| `focus.md` | ✅ YA REESCRITO | — |
| `project-state.md` | ✅ YA REESCRITO | — |

---

### SECCIÓN 9: ADRs nuevas a CREAR para IACT-UI

El directorio `decisions/` se recreará vacío y se poblarán estas ADRs
propias del proyecto:

| ID | Título | Decisión |
|----|--------|---------|
| ADR-001 | Bundler: Webpack 5 | SPA con code splitting, aliases `@components`, `@hooks`, etc. |
| ADR-002 | Estado global: Redux Toolkit | Slices por dominio, createAsyncThunk para efectos |
| ADR-003 | Sistema de permisos RBAC | PermissionGate + ProtectedRoute + usePermisos (client-side UX only) |
| ADR-004 | Mock system con fallback | createResilientService → API real → mock JSON local |
| ADR-005 | Soporte TypeScript selectivo | Babel preset-typescript, sin tsconfig estricto por ahora |
| ADR-006 | Cobertura mínima de tests: 80% | Jest con umbral global 80% en todas las métricas |

---

## Plan de ejecución (para Phase 8)

### Bloque A — Eliminaciones (operaciones destructivas)

```
T-001  rm -rf .thyrox/context/decisions/
T-002  rm -rf .thyrox/context/errors/
T-003  rm -rf .thyrox/context/patterns/
T-004  rm -rf .thyrox/context/lessons/
T-005  rm -rf .thyrox/context/research/
T-006  Eliminar 133 WPs históricos de work/ (excepto el nuestro)
T-007  rm archivos sphinx-*.md, github-implementation-analysis.md, phase-history.jsonl
```

### Bloque B — Reescrituras

```
T-008  Reescribir now.md → estado IACT-UI
T-009  Reescribir technical-debt.md → deuda real IACT-UI
T-010  Reescribir knowledge-base.md → KB IACT-UI
T-011  Reescribir decisions.md → índice ADRs IACT-UI
```

### Bloque C — Creaciones

```
T-012  mkdir decisions/ y crear ADR-001 (Webpack)
T-013  Crear ADR-002 (Redux Toolkit)
T-014  Crear ADR-003 (RBAC)
T-015  Crear ADR-004 (Mock system)
T-016  Crear ADR-005 (TypeScript selectivo)
T-017  Crear ADR-006 (Cobertura 80%)
```

### Bloque D — Cierre

```
T-018  Actualizar wp-state.md → Phase 11 TRACK
T-019  Crear track/iact-ui-context-cleanup-changelog.md
T-020  Crear track/iact-ui-context-cleanup-lessons-learned.md
T-021  Crear CLOSURE-NOTICE.md
T-022  Commit y push final
```

---

## Criterios de aceptación

- [ ] `.thyrox/context/` no contiene ningún archivo con `project: IACT-docs`
- [ ] `.thyrox/context/work/` tiene exactamente 1 WP (el nuestro)
- [ ] Existen 6 ADRs propias de IACT-UI en `decisions/`
- [ ] `now.md`, `technical-debt.md`, `knowledge-base.md` describen IACT-UI
- [ ] Todos los archivos raíz tienen `project: IACT-UI` en su YAML
- [ ] Tests siguen pasando tras la limpieza (sin side effects)
- [ ] Commit firmado en `feature/project-structure-analysis`
