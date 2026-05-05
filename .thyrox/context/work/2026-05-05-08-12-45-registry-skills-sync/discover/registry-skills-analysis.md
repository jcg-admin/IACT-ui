```yaml
created_at: 2026-05-05 08:14:00
project: IACT-UI
work_package: 2026-05-05-08-12-45-registry-skills-sync
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — Registry ↔ agents sync analysis

## Problema

El WP `registry-audit-iact-ui` actualizó 3 agentes instalados en `.claude/agents/`
para reflejar el stack real de IACT-UI, pero la fuente de verdad del sistema —
`.thyrox/registry/agents/*.yml` — quedó sin actualizar. Si se ejecuta `bootstrap.py`
en el futuro, las versiones desactualizadas del registry sobrescribirán los agentes correctos.

## Estado verificado

### `.thyrox/registry/agents/` (fuente de verdad)

| Archivo | Estado | Problema |
|---------|--------|----------|
| `react-expert.yml` | Desactualizado | Vitest, Zustand, yarn, TypeScript, MCP tools, no IACT-UI |
| `webpack-expert.yml` | Desactualizado | Multi-file config (webpack-merge), MCP tools, no IACT-UI aliases |
| `redux-expert.yml` | NO EXISTE | El agente instalado existe pero sin registry entry |

### `.claude/agents/` (agentes instalados)

| Archivo | Estado | Tamaño |
|---------|--------|--------|
| `react-expert.md` | Correcto (actualizado WP anterior) | 278 líneas |
| `webpack-expert.md` | Correcto (actualizado WP anterior) | 165 líneas |
| `redux-expert.md` | Correcto (creado WP anterior) | 253 líneas |

## Hallazgos por agente

### H-001: react-expert.yml desactualizado

**Diferencias críticas detectadas:**

| Campo | registry (incorrecto) | agents (correcto) |
|-------|-----------------------|-------------------|
| description | "con Vitest/Jest" | "Jest 29 + RTL" explícito |
| tools | MCP tools (`exec_cmd`, `memory`) | Solo tools nativas + Bash |
| Testing framework | "Vitest + RTL" | "Jest 29 + RTL" |
| Estado global | Zustand | Redux Toolkit |
| Comando test | `yarn test` | `npm test` |
| Estructura src/ | TypeScript-first | IACT-UI real (no TypeScript) |
| `renderWithStore` | No documentado | Documentado con ejemplo completo |

### H-002: webpack-expert.yml desactualizado

**Diferencias críticas detectadas:**

| Campo | registry (incorrecto) | agents (correcto) |
|-------|-----------------------|-------------------|
| description | Genérico THYROX | IACT-UI específico |
| tools | MCP tools | Solo tools nativas + Bash |
| Config pattern | `webpack.common.js` + `webpack-merge` | `webpack.config.js` único con condicionales |
| Aliases | Solo `@/` genérico | 8 aliases IACT-UI reales |
| Comando build | `npx webpack --mode production` | `npm run build` |
| IACT feature flags | No documentados | Documentados (`UI_BACKEND_*_SOURCE`) |

### H-003: redux-expert.yml inexistente

El archivo `.claude/agents/redux-expert.md` (253 líneas) existe y es correcto
pero NO tiene correspondiente `.thyrox/registry/agents/redux-expert.yml`.

Consecuencia: `bootstrap.py` no puede regenerar este agente — está fuera del
sistema de generación. Cualquier limpieza del directorio `.claude/agents/` lo perdería.

## Solución

1. Reescribir `react-expert.yml` con contenido del `.md` instalado
2. Reescribir `webpack-expert.yml` con contenido del `.md` instalado
3. Crear `redux-expert.yml` a partir del `.md` instalado

**Formato YML para agentes:** el campo `system_prompt` contiene el contenido
del `---` frontmatter en adelante del `.md` instalado. Los `.md` en `.claude/agents/`
usan el formato nativo de Claude Code (YAML frontmatter + body = system_prompt).
