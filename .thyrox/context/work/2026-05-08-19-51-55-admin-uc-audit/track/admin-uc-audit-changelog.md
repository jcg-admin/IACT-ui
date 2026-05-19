```yml
created_at: 2026-05-08 20:27:28
feature: admin-uc-audit
wp: 2026-05-08-19-51-55-admin-uc-audit
fase: FASE actual
commits: 8
```

# WP Changelog — admin-uc-audit

> Registro de cambios producidos por este work package.
> 8 commits desde `7bb2466` hasta `a67b34d`.

---

## Cambios producidos

### Added

- **AGR Composition UI** (`AGRCatalog.jsx`): tab "Composición" con tabla de AGRs, panel inline de funciones asignadas, campo "agregar función" con validación, botón "Remover" por función, conteo de usuarios impactados (`3d6f130`)
- **AGR composition mock handlers** (`mockInterceptor.js`): `_handleAGRFunctions` (GET/POST + 409 duplicate check), `_handleAGRRemoveFunction` (DELETE → 204), `_handleAGRImpact` (GET → affected_users = fns.size × 2); constructor Map `_systemGroupFunctions` con 10 composiciones default (`3d6f130`)
- **AGR gateway methods** (`adminGateway.js`): `getAGRComposition`, `addFunctionToAGR`, `removeFunctionFromAGR`, `getAGRImpact`, `bulkReorderMenuItems`, `blockAutoArchive` (`3d6f130`)
- **AGR slice thunks** (`admin.js`): `fetchAGRComposition`, `addFunctionToAGR`, `removeFunctionFromAGR`, `fetchAGRImpact`, `bulkReorderMenuItems`, `blockAutoArchive`; `systemGroupCompositions` en initialState; `selectAGRComposition` factory selector (`3d6f130`)
- **AGRComposition.test.jsx**: 9 tests cubriendo tab renders, dispatch on Gestionar, functions shown, impact count, remove/add dispatch, 409 error alert, panel close (`3d6f130`)
- **Bulk reorder mode** (`MenuItemCatalog.jsx`): botón "Reordenar", numeric order inputs por fila, "Guardar orden" → `bulkReorderMenuItems`, error display via `role=alert` (`0cbb542`)
- **Block-archive dialog** (`MenuItemCatalog.jsx`): botón "Bloquear archivado" solo en DEPRECATED, dialog con textarea min-20 chars, disabled confirm button, `.unwrap()` error display (`0cbb542`)
- **Separation rules disjoint validation** (`mockInterceptor.js`): POST y PUT separan grupos, retornan 400 con `NON_DISJOINT_GROUPS` code y overlap list (`b176d0c`)
- **FunctionCatalog domain/state filters** (`FunctionCatalog.jsx`): selects "Todos los dominios" y "Todos los estados / Solo activas / Solo inactivas" combinados con search existente (`f366cd0`)

### Changed

- **`SeparationRulesCatalog.jsx`**: añadido `formError` state, validación client-side de overlap antes del dispatch, migración de `if (!result.error)` a `.unwrap() + catch`, `role=alert` para errores de formulario; eliminadas referencias "SoD" del UI visible (`b176d0c`)
- **`MenuItemCatalog.jsx`**: `handleTransition` migrado a `.unwrap()` con `transitionErrors` map para errores per-row; botón Editar `disabled` para items ARCHIVED (`0cbb542`)
- **`SeparationRulesCatalogPage.test.jsx`**: `beforeEach` actualizado a `.unwrap()` dispatch pattern; aria-label corregido de "SoD" a "separación"; 4 nuevos tests de validación disjunción (11 total) (`b176d0c`)
- **`MenuItemCatalogPage.test.jsx`**: ITEMS array añade item ARCHIVED; mock slice añade `bulkReorderMenuItems` y `blockAutoArchive`; `beforeEach` migrado a `.unwrap()` dispatch pattern; 15 nuevos tests (23 total) (`0cbb542`)
- **`AGRCatalogPage.test.jsx`**: mock actualizado con `selectAGRComposition`, composición thunks, `systemGroupCompositions` state stub, `__esModule: true`, `.unwrap()` dispatch pattern (`e9c3ac0`)

### Fixed

- **`AGRCatalogPage.test.jsx`**: TypeError en todos los tests existentes por mock incompleto post T-004 — corregido añadiendo exports faltantes al mock del slice (`e9c3ac0`)

---

## Commits de este WP

| Hash | Tipo | Descripción |
|------|------|-------------|
| `7bb2466` | docs | Start admin-uc-audit WP — Phase 1 DISCOVER |
| `611811d` | docs | Add admin-uc-audit task plan — Phase 8 PLAN EXECUTION |
| `3d6f130` | feat | Add AGR composition management (UC-ADM-03) — T-001..T-005 |
| `b176d0c` | feat | Add SeparationRules disjoint validation (UC-ADM-01) — T-006..T-008 |
| `0cbb542` | feat | Add bulk reorder, guards, and block-archive UI (UC-ADM-04/05) — T-009..T-018 |
| `f366cd0` | feat | Add domain and state filters to FunctionCatalog (UC-ADM-02) — T-019 |
| `e9c3ac0` | fix | Fix AGRCatalogPage.test.jsx mock for selectAGRComposition |
| `a67b34d` | chore | Update now.md: admin-uc-audit Phase 10 complete |

---

## Métricas de cierre

| Métrica | Baseline | Final | Delta |
|---------|----------|-------|-------|
| Test suites | 216 | 217 | +1 |
| Tests passing | 1866 | 1894 | **+28** |
| Failures | 0 | 0 | 0 |
| Gaps cerrados | 0 | 8 | +8 |
| Tareas completadas | — | 19/19 | 100% |
