```yaml
project: IACT-UI
work_package: 2026-05-05-07-45-30-registry-audit-iact-ui
created_at: 2026-05-05 07:45:30
current_phase: Phase 1 — DISCOVER
flow: thyrox
methodology_step: workflow-discover
author: NestorMonroy
status: in_progress
epic: ÉPICA 1 — Adaptación del framework THYROX a IACT-UI
blockers: []
agents:
  - id: deep-dive
    type: adversarial
    status: completed
    output_file: discover/registry-audit-analysis.md
```

# WP — Auditoría de `.thyrox/registry/` y agentes para IACT-UI

## Propósito

Analizar el estado actual del registry de agentes y skills en `.thyrox/registry/`
y `.claude/agents/` para identificar qué está desactualizado, qué necesita
adaptación a IACT-UI, y qué falta crear (ej. agente Redux).

## Alcance

- Auditoría de todos los agentes en `.thyrox/registry/agents/`
- Comparación con agentes instalados en `.claude/agents/`
- Identificar referencias incorrectas para IACT-UI (Vitest vs Jest, Zustand vs Redux, etc.)
- Determinar si se necesita un agente Redux específico
- Revisar templates de frontend (`react.template.md`, `webpack.template.md`)
- Evaluar disponibilidad de MCP tools referenciadas
- Producir plan de actualización

## Referencias

- WP anterior: `2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup` (CERRADO)
- Branch: `feature/project-structure-analysis`
