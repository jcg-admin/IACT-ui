```yaml
created_at: 2026-05-05 07:45:30
project: IACT-UI
author: NestorMonroy
status: Completado
phase: Phase 1 — DISCOVER
```

# Phase 1 DISCOVER — Auditoría de `.thyrox/registry/` para IACT-UI

## 1. Estructura del registry

```
.thyrox/registry/
├── agents/           — 29 definiciones YAML de agentes
├── frontend/         — 2 templates (react, webpack)
├── backend/          — 1 template (nodejs)
├── db/               — 2 templates (mysql, postgresql)
├── methodologies/    — 11 metodologías YAML
├── mcp/              — 3 servidores MCP Python
├── routing-rules.yml — mapeo problema → coordinator
├── bootstrap.py      — script de instalación
└── README.md
```

Los agentes del registry se instalan en `.claude/agents/` como archivos `.md`.
Actualmente hay **29 agentes instalados** — coincide con el registry.

---

## 2. Agentes relevantes para IACT-UI

### `react-expert` — NECESITA ACTUALIZACIÓN

**Problema 1 — Framework de testing incorrecto:**

| Aspecto | Registry / Instalado | IACT-UI real |
|---------|---------------------|--------------|
| Testing | `Vitest` | **Jest 29** |
| Comando test | `yarn test` | **npm test** |
| Comando coverage | `yarn test --coverage` | **npm run test:coverage** |

El agente instruye usar Vitest pero IACT-UI usa Jest. Si alguien invoca
`react-expert` para escribir un test, generará imports y configuración
incorrectos.

**Problema 2 — Estado global incorrecto:**

| Aspecto | Registry / Instalado | IACT-UI real |
|---------|---------------------|--------------|
| Estado global | `Zustand` | **Redux Toolkit** |
| Estado servidor | `React Query` (genérico) | **@tanstack/react-query** |
| Context API | solo theming/i18n | igual ✅ |

El agente recomienda Zustand pero IACT-UI tiene Redux Toolkit con slices
por dominio. Cualquier implementación siguiendo este agente divergiría del
patrón establecido.

**Problema 3 — Proyecto hardcodeado como THYROX:**

El skill embebido dice `Proyecto: Project State - THYROX`, no IACT-UI.

**Problema 4 — MCP tools posiblemente no disponibles:**
- Usa `mcp__thyrox_executor__exec_cmd` para ejecutar comandos
- Usa `mcp__thyrox_memory__retrieve` para memoria persistente
- Estos MCP servers (`.thyrox/registry/mcp/`) necesitan estar corriendo

---

### `webpack-expert` — NECESITA ACTUALIZACIÓN MENOR

**Problema 1 — Estructura de config asumida:**

| Aspecto | Registry / Instalado | IACT-UI real |
|---------|---------------------|--------------|
| Archivos config | `webpack.common.js` + `webpack.dev.js` + `webpack.prod.js` | **`webpack.config.cjs` único** |
| Extensión | `.js` o `.mjs` | **`.cjs`** |
| Merge | `webpack-merge` | no usada |

El agente asume configuración multi-archivo con `webpack-merge`, pero
IACT-UI tiene un único `webpack.config.cjs` con condicionales.

**Problema 2 — Aliases no conoce los de IACT-UI:**

El agente sabe del patrón `@/` → `src/`, pero IACT-UI tiene:
`@app`, `@modules`, `@components`, `@hooks`, `@state`, `@services`,
`@mocks`, `@styles` — más granulares.

**Lo que está correcto:** loaders (babel, css, sass, asset modules),
plugins (HtmlWebpackPlugin, MiniCssExtractPlugin), code splitting,
contenthash en producción.

---

### Agente Redux — **NO EXISTE**

No hay ningún agente específico de Redux Toolkit en el registry ni en
`.claude/agents/`. El `react-expert` cubre React pero recomienda Zustand.

**Impacto:** Cualquier trabajo con slices, thunks, selectors, o el store
de IACT-UI no tiene un agente especializado que conozca RTK.

**Opciones:**
1. Crear agente `redux-expert` específico para RTK
2. Actualizar `react-expert` para incluir RTK como estado global
3. Ampliar el skill embebido en `react-expert` con una sección Redux Toolkit

---

### Resto de agentes — ANÁLISIS RÁPIDO

| Agente | Relevancia para IACT-UI | Estado |
|--------|------------------------|--------|
| `deep-dive` | Alta — análisis adversarial | ✅ Genérico, OK |
| `deep-review` | Alta — revisión de calidad | ✅ Genérico, OK |
| `task-planner` | Alta — planificación de WPs | ✅ Genérico, OK |
| `task-executor` | Alta — ejecución Phase 8 | ✅ Genérico, OK |
| `tech-detector` | Media — detecta stack | ✅ Genérico, OK |
| `skill-generator` | Media — crea nuevos skills | ✅ Genérico, OK |
| `agentic-reasoning` | Alta — razonamiento complejo | ✅ Genérico, OK |
| `agentic-validator` | Alta — validación de outputs | ✅ Genérico, OK |
| `nodejs-expert` | Baja — IACT-UI es frontend | OK si hay backend |
| `postgresql-expert` | Baja — IACT-UI es frontend | OK si hay backend |
| `mysql-expert` | Nula | OK (no se usa) |
| `pattern-harvester` | Media — detecta patrones | ✅ Genérico, OK |
| Coordinadores (9x) | Baja — metodologías de negocio | OK para gestión |

---

## 3. Templates de frontend

### `react.template.md`

Template con placeholders `{{PROJECT_NAME}}`, `{{LAYER_TITLE}}`,
`{{FRAMEWORK_TITLE}}`. **No está instanciado para IACT-UI.**

Contenido correcto en lo general pero tiene las mismas referencias erróneas
que el agente: Vitest en lugar de Jest, estructura de archivos genérica en
lugar de la de IACT-UI.

### `webpack.template.md`

Mismo caso — placeholders sin instanciar. Estructura multi-archivo asumida.
Buen contenido técnico pero no adaptado a IACT-UI.

---

## 4. MCP Tools — evaluación de disponibilidad

Los agentes `react-expert` y `webpack-expert` usan:
- `mcp__thyrox_executor__exec_cmd` → ejecuta comandos de shell
- `mcp__thyrox_memory__retrieve` → lee memoria persistente

Los servidores están en `.thyrox/registry/mcp/`:
- `executor_server.py` — ejecutor de comandos
- `memory_server.py` — memoria persistente
- `thyrox_core.py` — núcleo THYROX

**Estado:** No hay evidencia de que estén corriendo. Sin estos MCP servers
activos, las tools `mcp__thyrox_executor__exec_cmd` no funcionan y el agente
no puede ejecutar `npm test` ni `npm run build`.

**Impacto:** Si se invoca `react-expert` para correr tests, la llamada a
`mcp__thyrox_executor__exec_cmd` fallará. El agente debería usar `Bash`
directamente como tool alternativa.

---

## 5. Resumen de hallazgos

### Críticos (bloquean uso correcto)

| # | Hallazgo | Agente | Impacto |
|---|---------|--------|---------|
| H-001 | Testing: Vitest en lugar de Jest | `react-expert` | Tests generados serán incorrectos |
| H-002 | Estado global: Zustand en lugar de Redux Toolkit | `react-expert` | Implementaciones divergen del patrón |
| H-003 | No existe agente Redux/RTK | — | Sin especialista para el estado global de IACT-UI |

### Importantes (reducen efectividad)

| # | Hallazgo | Agente | Impacto |
|---|---------|--------|---------|
| H-004 | Config webpack multi-archivo asumida vs single-file | `webpack-expert` | Instrucciones incorrectas para `webpack.config.cjs` |
| H-005 | Aliases de Webpack no conoce los de IACT-UI | `webpack-expert` | No guía con `@modules`, `@state`, etc. |
| H-006 | MCP tools posiblemente sin correr | ambos | `exec_cmd` fallaría sin fallback a `Bash` |
| H-007 | Templates sin instanciar para IACT-UI | react, webpack | Requieren bootstrap para el proyecto |

### Menores (calidad)

| # | Hallazgo | Agente | Impacto |
|---|---------|--------|---------|
| H-008 | Proyecto hardcodeado como THYROX | `react-expert` | Confusión de contexto |
| H-009 | Comando `yarn` en lugar de `npm` | `react-expert` | IACT-UI usa npm |

---

## 6. Plan de acción para Phase 5 STRATEGY

Tres acciones principales:

**A. Actualizar `react-expert`** — corregir Jest, npm, Redux Toolkit, eliminar
referencia a THYROX y adaptar estructura de archivos a IACT-UI

**B. Actualizar `webpack-expert`** — adaptar para single-file `webpack.config.cjs`,
aliases reales de IACT-UI, y agregar fallback `Bash` si MCP no está disponible

**C. Crear agente `redux-expert`** — especialista en Redux Toolkit con slices,
createAsyncThunk, selectors reselect, y patrones específicos de IACT-UI
