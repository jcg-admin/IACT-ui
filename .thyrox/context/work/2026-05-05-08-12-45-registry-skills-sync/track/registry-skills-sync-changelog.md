```yaml
created_at: 2026-05-05 08:20:00
project: IACT-UI
phase: Phase 11 — TRACK
```

# Changelog — registry-skills-sync

## Changed

- `.thyrox/registry/agents/webpack-expert.yml` — reescrito para IACT-UI:
  webpack.config.js único (function-style), 8 aliases reales, Bash tool,
  sin MCP tools, comandos npm
- `.thyrox/registry/agents/react-expert.yml` — reescrito para IACT-UI:
  Jest 29 (no Vitest), RTK (no Zustand), npm (no yarn), estructura
  src/ real de IACT-UI, renderWithStore helper, Rules of Hooks crítico
- `.claude/agents/webpack-expert.md` — actualizado: referencia corregida
  de webpack.config.cjs → webpack.config.js tras merge de configs

## Added

- `.thyrox/registry/agents/redux-expert.yml` — nuevo registro para agente
  que ya existía en .claude/agents/ sin correspondiente YML

## Status de promoción a CHANGELOG.md raíz

No hay bump de versión pendiente — estos cambios no van al CHANGELOG.md raíz.
