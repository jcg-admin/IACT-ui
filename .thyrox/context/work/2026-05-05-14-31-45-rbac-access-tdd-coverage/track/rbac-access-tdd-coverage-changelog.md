```yml
created_at: 2026-05-05 14:31:45
project: IACT-UI
work_package: 2026-05-05-14-31-45-rbac-access-tdd-coverage
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Changelog — rbac-access-tdd-coverage

## Added

### Tests (8 nuevas suites, 81 nuevos tests)

- `src/permissions/__tests__/catalog.test.js` — FunctionCatalog: formato `sistema.{dominio}.{recurso}.{accion}`, sin duplicados, mínimo 25 constantes, VIEW_ACCESS/VIEW_AUDIT
- `src/services/__tests__/accessService.test.js` — getAuthHeaders, getFunctionGroups, assignFunction, revokeFunction, assignFunctionGroup, error handling
- `src/redux/slices/__tests__/accessSlice.test.js` — catalogId invariant en 3 thunks (assignFunction/revokeFunction/validateSoD), reducers (pending/fulfilled/rejected), selectors
- `src/components/access/__tests__/FunctionSelector.test.jsx` — SoD predicados (SOD-001/002/003), false positives, toggle, category grouping, conflict banner
- `src/router/__tests__/AppRouter.test.jsx` — ProtectedRoute redirect a /access-denied, ITER4/5/6 routes, FunctionCatalog mapping
- `src/pages/access/__tests__/AssignFunctionsPage.test.jsx` — catalogId dispatch invariant, guard conditions
- `src/pages/access/__tests__/PermissionsPage.test.jsx` — revoke flow (Revocar → Confirmar → dispatch), catalogId = assignment_id
- `src/pages/access/__tests__/TemporaryPermissionsPage.test.jsx` — catalogId=parseInt, expiresAt requerido, payload completo
- `src/__tests__/helpers/renderWithProviders.jsx` — helper compartido con MemoryRouter + Redux Provider + store configurable

### Métricas de cobertura

| Métrica | Antes | Después |
|---------|-------|---------|
| Test suites | 97 | 105 (+8) |
| Tests total | 771 | 852 (+81) |
| Archivos con suite | 0/8 del scope | 8/8 del scope |

## Changed

### Clean code — FunctionSelector.jsx

- `selectedCodes` → `selectedCodenames` (variable local en `detectConflicts`) — los valores son codenames RBAC, no "codes" (T-012)
- `_` muda en `getFilteredFunctions` → eliminada, destructuring simplificado a `[category]` (T-013)
- `useEffect` agregado: detecta conflictos SoD al mount cuando hay selección inicial (necesario para tests de conflicto con selectedFunctionIds pre-poblados)

### Clean code — accessService.js

- Extraído `getAuthHeaders()` helper privado — elimina duplicación de `localStorage.getItem('accessToken')` en 9 métodos (T-005)

### Clean code — catalog.js

- 4 constantes corregidas al formato `sistema.{dominio}.{recurso}.{accion}` (3 partes → 4 partes):
  - `VIEW_ALERTS: 'sistema.alertas.ver'` → `'sistema.alertas.notificaciones.ver'`
  - `MANAGE_ALERTS: 'sistema.alertas.gestionar'` → `'sistema.alertas.notificaciones.gestionar'`
  - `VIEW_CONFIG: 'sistema.configuracion.ver'` → `'sistema.configuracion.parametros.ver'`
  - `EDIT_CONFIG: 'sistema.configuracion.editar'` → `'sistema.configuracion.parametros.editar'`

## Aceptado / no fixeado

- **Smell `loading` boolean compartido en accessSlice** — un único `loading: boolean` para 6 operaciones async genera race conditions silenciosas. Documentado como deuda técnica. El fix (separar por operación) es invasivo y requiere cambios en todas las páginas que usan `selectLoading`. Queda en `technical-debt.md`.

- **Verbose lazy imports en AppRouter.jsx** — `Promise.resolve({default: () => ...})` inline. No fijado: el smell es cosmético y los tests verifican el comportamiento, no la implementación del lazy load.

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a `main`. Los cambios son una adición de tests y refactor de clean code.
Categoría para CHANGELOG.md raíz: `## Changed` con nota "TDD coverage for RBAC access module".
