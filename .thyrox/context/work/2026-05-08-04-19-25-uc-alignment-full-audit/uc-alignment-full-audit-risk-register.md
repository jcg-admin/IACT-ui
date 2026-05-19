```yml
created_at: 2026-05-08 04:19:25
updated_at: 2026-05-08 04:58:37
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Risk Register — uc-alignment-full-audit

| ID | Riesgo | Prob | Impacto | Resultado real |
|----|--------|------|---------|----------------|
| R-01 | Mover `UserManagement` rompe `@ui/pages/UserManagement` en AppRouter | ALTA | ALTO | **NO SE MATERIALIZÓ** — Solo 1 importador (AppRouter). Actualizado en Commit VIII. Ver L-006. |
| R-02 | ADM_04/ADM_05 sin mock handlers — páginas renderizan vacías | MEDIA | MEDIO | **NO SE MATERIALIZÓ** — Handlers creados en `_handleAdminMenuItems` antes de las páginas. |
| R-03 | `request_pipeline_retry` RBAC no existe en FunctionCatalog | MEDIA | MEDIO | **NO SE MATERIALIZÓ** — `RETRY_PIPELINE: 'pipeline:retry'` ya existía. UC_PIP_04 pre-implementado. |
| R-04 | `share_reports` RBAC puede no estar en FunctionCatalog | BAJA | MEDIO | **NO SE MATERIALIZÓ** — `SHARE_REPORTS: 'reports:share'` ya existía. UC_RPT_11 pre-implementado. |
| R-05 | Tests de `UserManagement` se rompen por mv | ALTA | ALTO | **SE MATERIALIZÓ PARCIALMENTE** — `remainingPages.test.jsx` tenía 3 paths al módulo viejo. Fix aplicado en commit adicional. Sin impacto en CI. |
| R-06 | Páginas ACC sin tests unitarios | ALTA | ALTO | **MITIGADO** — Tests creados: AssignFunctionsPage (pre-existente), PermissionsPage (pre-existente), AccessAuditPage.test.jsx (nuevo, 6 tests). |
| R-07 | UC_RPT_09 sin endpoint mock definido | MEDIA | MEDIO | **NO SE MATERIALIZÓ** — `SavedFiltersPanel` ya implementado + integrado en 6+ pages. No requirió trabajo. |
