```yaml
project: IACT-UI
work_package: 2026-05-05-08-12-45-registry-skills-sync
created_at: 2026-05-05 08:12:45
current_phase: Phase 1 — DISCOVER
flow: thyrox
methodology_step: workflow-discover
author: NestorMonroy
status: active
epic: ÉPICA 4 — Sincronización registry ↔ agents instalados
blockers: []
agents: []
```

# WP — Sincronización registry ↔ agents instalados

## Propósito

Los agentes instalados en `.claude/agents/` fueron actualizados en el WP
`registry-audit-iact-ui` para reflejar el stack real de IACT-UI, pero sus
correspondientes definiciones `.yml` en `.thyrox/registry/agents/` NO fueron
actualizadas. Además, `redux-expert.md` fue creado sin su `.yml` de registro.

El registro es la fuente de verdad para generación vía `bootstrap.py`.
Esta divergencia implica que un `bootstrap.py` futuro sobrescribiría las
versiones correctas con las desactualizadas.

## Hallazgos preliminares

- `webpack-expert.yml` — desactualizado (multi-file config, MCP tools, no IACT-UI)
- `react-expert.yml` — desactualizado (Vitest, TypeScript, MCP tools)
- `redux-expert.yml` — NO EXISTE en registry (solo existe el .md instalado)
