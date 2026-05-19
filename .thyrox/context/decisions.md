```yaml
type: Índice de Decisiones Arquitectónicas
project: IACT-UI
version: 1.0
updated_at: 2026-05-05
```

# Decisiones Arquitectónicas — IACT-UI

## Índice de ADRs

| ID | Título | Estado | Fecha |
|----|--------|--------|-------|
| [ADR-001](decisions/adr-001-webpack-bundler.md) | Webpack 5 como bundler principal | Aceptado | 2026-05-05 |
| [ADR-002](decisions/adr-002-redux-toolkit.md) | Redux Toolkit para estado global | Aceptado | 2026-05-05 |
| [ADR-003](decisions/adr-003-rbac-permisos.md) | Sistema de permisos RBAC client-side | Aceptado | 2026-05-05 |
| [ADR-004](decisions/adr-004-mock-system.md) | Mock system con fallback resiliente | Aceptado | 2026-05-05 |
| [ADR-005](decisions/adr-005-typescript-selectivo.md) | TypeScript selectivo vía Babel | Aceptado | 2026-05-05 |
| [ADR-006](decisions/adr-006-cobertura-tests.md) | Cobertura mínima de tests: 80% | Aceptado | 2026-05-05 |

## Convención de ADRs

- **Formato:** Markdown con bloque YAML de metadatos
- **Campos obligatorios:** `id`, `title`, `status`, `date`, `decision`
- **Estados:** `Propuesto` → `Aceptado` → `Obsoleto`
- **Nombrado:** `adr-NNN-titulo-kebab-case.md`
