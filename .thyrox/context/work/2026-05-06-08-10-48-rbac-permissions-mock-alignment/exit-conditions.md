```yml
created_at: 2026-05-06 08:14:41
updated_at: 2026-05-06 08:14:41
project: THYROX
work_package: 2026-05-06-08-10-48-rbac-permissions-mock-alignment
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Exit Conditions — RBAC Permissions Mock Alignment

## Criterios de éxito

1. **`FunctionCatalog.js`** — todos los valores usan notación `module:action`
   conforme a RBAC v5.4.0; sin valores `sistema.X.Y.Z`; sin funciones inventadas
   (tickets, clientes); sin duplicados de valor.

2. **`permissions.json`** — grupos son AGRs reales (AGR-XXX); capacidades usan
   notación `module:action`; persona mock `maria.garcia` tiene acceso funcional
   (puede ver dashboard, reportes, KPIs).

3. **`catalog.test.js`** — actualizado para validar notación `module:action`;
   sin valores hardcoded `sistema.X`; todos los tests pasan.

4. **Suite completa** — todos los tests existentes pasan (≥ 1602); 0 regressions.

5. **Rutas funcionales** — `/dashboard`, `/reports`, `/users`, `/audit`, `/alerts`,
   `/logs` accesibles con el perfil mock elegido.

## Artefactos de cierre esperados

- `track/rbac-permissions-mock-alignment-changelog.md`
- `track/rbac-permissions-mock-alignment-lessons-learned.md`
- `plan-execution/rbac-permissions-mock-alignment-task-plan.md` (todos [x])

## Gate humano requerido

Antes de Phase 8 PLAN EXECUTION, confirmar decisiones:
- **DP-001** — manejo de SUPER_ADMIN y VIEW_CONFIG (sin equivalente en spec)
- **DP-002** — eliminar o preservar funciones inventadas (tickets, clientes)
- **DP-003** — perfil mock: AGR-002, AGR-004, o combinación más rica
