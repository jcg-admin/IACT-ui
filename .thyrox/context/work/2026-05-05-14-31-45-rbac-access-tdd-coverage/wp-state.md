```yml
project: IACT-UI
work_package: 2026-05-05-14-31-45-rbac-access-tdd-coverage
created_at: 2026-05-05 14:31:45
current_phase: Phase 8 — PLAN EXECUTION
status: active
author: claude
branch: claude/project-analysis-N9IkV
size: mediano
methodology: TDD + clean code
```

# WP — RBAC Access TDD Coverage

## Objetivo

Cubrir con tests TDD los 8 archivos modificados en el WP anterior
(`rbac-access-alignment`) que quedaron sin cobertura. Aplicar clean code
durante el proceso: simplificar, eliminar duplicados, nombrar con claridad.

## Scope

- `src/components/access/FunctionSelector.jsx`
- `src/redux/slices/accessSlice.js`
- `src/services/accessService.js`
- `src/permissions/catalog.js`
- `src/router/AppRouter.jsx` (ampliar cobertura)
- `src/pages/access/AssignFunctionsPage.jsx`
- `src/pages/access/PermissionsPage.jsx`
- `src/pages/access/TemporaryPermissionsPage.jsx`

## Metodología

TDD estricto por cada unidad:
1. Escribir test rojo (falla porque la funcionalidad no está testeada / código tiene smell)
2. Refactorizar código a clean si el test lo expone
3. Hacer el test verde
4. Repetir
