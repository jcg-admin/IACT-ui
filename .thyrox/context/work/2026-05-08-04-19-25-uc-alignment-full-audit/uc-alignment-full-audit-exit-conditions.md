```yml
created_at: 2026-05-08 04:19:25
updated_at: 2026-05-08 04:19:25
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Exit Conditions — uc-alignment-full-audit

## Condiciones de cierre del WP

El WP se cierra cuando TODOS los siguientes criterios son true:

### Categoría A — Routing

- [ ] GAP-A1: Ruta `/access/assign-functions` → `AssignFunctions.jsx` en AppRouter con guard
- [ ] GAP-A2: Ruta `/access/permissions` → `Permissions.jsx` en AppRouter con guard
- [ ] GAP-A3: Ruta `/access/audit/access` → `AccessAudit.jsx` en AppRouter con guard

### Categoría B — Páginas nuevas

- [ ] GAP-B1: `src/pages/admin/SeparationRulesCatalog.jsx` existe + ruta `/admin/separation-rules` + tests
- [ ] GAP-B2: `src/pages/admin/MenuItemCatalog.jsx` existe + ruta `/admin/menu-items` + tests
- [ ] GAP-B3: Lifecycle de MenuItem implementado (tab en GAP-B2 o página separada, según SP-01)

### Categoría C — Features parciales

- [ ] GAP-C1: Botón retry en `PipelineStatus.jsx` + thunk + mock handler + guard `request_pipeline_retry`
- [ ] GAP-C2: Acción "run-now" en `ScheduledReport.jsx` + mock handler
- [ ] GAP-C3: Sección/página filtros guardados + CRUD + mock handler
- [ ] GAP-C4: Feature "Compartir" en `SavedViews.jsx` + modal + mock handler + guard `share_reports`

### Categoría D — Estructura

- [ ] GAP-D1: `UserManagement` en `src/pages/users/` + alias Webpack actualizado + tests verdes

### Gates de calidad

- [ ] `npx jest --no-coverage` pasa con 0 regressions (≥ 1820 tests — baseline de entrada)
- [ ] Tests nuevos escritos para: AssignFunctions, Permissions, AccessAudit, SeparationRulesCatalog, MenuItemCatalog
- [ ] `bash .claude/scripts/validate-phase-completion.sh` exit code 0

## Criterios de éxito mínimos (si el tiempo es un constraint)

Si el WP debe cerrarse con algunos items pendientes, el mínimo aceptable es:
- Categoría A (routing) — obligatoria completa (bajo riesgo, alto impacto)
- GAP-B1 (SeparationRulesCatalog ADM_01) — obligatoria
- GAP-C1 (PIP_04 retry) — obligatoria
- Los demás documentados como TD en technical-debt.md con referencia a este WP
