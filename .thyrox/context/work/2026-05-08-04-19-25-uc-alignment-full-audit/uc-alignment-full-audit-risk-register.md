```yml
created_at: 2026-05-08 04:19:25
updated_at: 2026-05-08 04:19:25
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Risk Register — uc-alignment-full-audit

| ID | Riesgo | Prob | Impacto | Mitigación |
|----|--------|------|---------|------------|
| R-01 | Mover `UserManagement` (GAP-D1) rompe el import `@ui/pages/UserManagement` en AppRouter | ALTA | ALTO | Actualizar alias Webpack + import en AppRouter en el mismo commit |
| R-02 | ADM_04/ADM_05 sin mock handlers en mockInterceptor — páginas renderizan vacías | MEDIA | MEDIO | Agregar handlers antes de implementar páginas; TDD desde el mock |
| R-03 | `request_pipeline_retry` RBAC no existe en FunctionCatalog — guard siempre bloquea | MEDIA | MEDIO | Verificar FunctionCatalog antes de crear el guard; agregar si falta |
| R-04 | `share_reports` RBAC puede no estar en FunctionCatalog | BAJA | MEDIO | Verificar y agregar junto con GAP-C4 |
| R-05 | Tests de `UserManagement` en `components/features/__tests__/` se rompen por mv | ALTA | ALTO | Actualizar paths de import en tests post-mv; correr suite antes y después |
| R-06 | GAP-A1/A2/A3 — páginas sin tests unitarios (no testeadas porque no están en el router) | ALTA | ALTO | Crear tests para AssignFunctions, Permissions, AccessAudit en el mismo bloque que el routing |
| R-07 | UC_RPT_09 filtros guardados — sin endpoint mock definido; no se conoce schema | MEDIA | MEDIO | Leer UC_RPT_09 flujo-principal antes de implementar; definir schema en mock |
