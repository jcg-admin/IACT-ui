```yml
project: IACT-UI
work_package: 2026-05-05-17-08-27-sprint2-completion-reports
created_at: 2026-05-05 17:08:27
current_phase: Phase 1 — DISCOVER
author: claude
status: active
branch: claude/project-analysis-N9IkV
```

# WP: Sprint 2 Completion + REST URL Debt Resolution

## Scope

1. **T-013** — Baja lógica en `pages/UserManagement/UserForm.jsx` + `UserList.jsx`
2. **T-020..T-024** — Reports service, slice, dashboard wiring, WebSocket, tests
3. **TD-ACC-01..05 (revisados)** — Corrección de URLs REST con backend real

## Hallazgo crítico de DISCOVER

El análisis de `/tmp/references/IACT-docs/source/` reveló que la arquitectura
de API es **user-centric**, no `/access/...`. Ver `discover/api-url-debt-analysis.md`.

## Exit conditions

- [ ] T-013 implementado y con tests
- [ ] T-020..T-024 implementados con TDD
- [ ] TD-ACC-01..05 corregidos según URLs canónicas de IACT-docs
- [ ] accessService.js alineado con spec
- [ ] mockInterceptor actualizado con nuevas URLs
- [ ] Working tree limpio, remote sync
```
