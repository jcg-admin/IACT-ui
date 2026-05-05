```yml
created_at: 2026-05-05 16:42:24
project: IACT-UI
work_package: 2026-05-05-16-31-59-rbac-naming-refactor
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Changelog — RBAC Naming Refactor (v5.2.1 alignment)

## Changed

### Bloque 1 — Core: slice, service, catalog (commit 1084155)

- `accessService.js`: `validateSoD()` → `validateSeparationRules()`;
  JSDoc actualizado; mensaje de error: `'SoD validation failed'` →
  `'Separation rules validation failed'` (H-003)
- `accessSlice.js`: thunk `validateSoD` → `validateSeparationRules`;
  action type `access/validateSoD` → `access/validateSeparationRules`;
  parámetro `catalogId` → `functionPk` (era ambiguo — PK no codename);
  state key `sodConflicts` → `separationConflicts`;
  selector `selectSoDConflicts` → `selectSeparationConflicts` (H-001, H-002)
- `catalog.js`: `MANAGE_SOD` → `MANAGE_SEPARATION_RULES`; valor del
  string de dominio inalterado: `'sistema.administracion.acceso.sod'`
  (aceptable — strings de dominio backend no son identificadores de código) (H-004)
- `accessSlice.test.js`: todas las referencias actualizadas;
  15/15 tests GREEN

### Bloque 2+3 — Componentes + tests (commit 7efe451)

- `SoDValidator.jsx` → `SeparationRulesValidator.jsx` (git mv, historial preservado);
  función `SoDValidator` → `SeparationRulesValidator`;
  UI: "Conflictos SoD" → "Conflictos de Separación";
  "No hay conflictos SoD" → "No hay conflictos de separación de funciones";
  "conflictos SoD activos" → "conflictos de separación activos" (H-005)
- `SoDValidation.jsx` → `SeparationRulesValidation.jsx` (git mv);
  función + propTypes renombrados;
  CSS class: `content-sod-validation` → `content-separation-rules-validation`;
  heading: "SoD Validation Results" → "Resultados de Validación de Separación de Funciones" (H-005)
- `SoDManagementPage.jsx` → `SeparationRulesPage.jsx` (git mv);
  función `SoDManagementPage` → `SeparationRulesPage`;
  headings y textos UI: "Gestión de Reglas SoD" → "Gestión de Reglas de Separación",
  "Violaciones de SoD" → "Violaciones de Separación de Funciones",
  "Nota sobre SoD" → "Nota", etc. (H-005)
- `AssignFunctionStepper.jsx`: import + JSX actualizados; step title
  "Validate SoD" → "Validate Separation Rules" (H-006)
- `AssignFunctionsPage.jsx`: import `validateSeparationRules`; alert text,
  subtítulo y label del panel actualizados (H-006)
- `AssignFunctionsPage.test.jsx`: mock `validateSoD` → `validateSeparationRules` (H-006)
- 44/44 tests GREEN

## Aceptado / no fixeado

- `AGR` en comentarios JSDoc de `userService.js` y `catalog.js` — CORRECTO.
  v5.2.1 aplica a identificadores de código, no a comentarios (H-007).
- `ETL`/`IVR` en `src/mocks/` — infraestructura de dev, no código de producción (H-008).
- `"IACT - IVR Analytics"` en `MainLayout.jsx` — texto visible de UI,
  fuera del alcance de v5.2.1 (H-009).

## Lessons Learned

- **SoD como acrónimo prohibido en identifiers**: el estándar v5.2.1 hace
  explícito el rename. La regla aplica también a strings de UI (headings,
  alerts, labels) — no solo a nombres de funciones y variables.
- **`git mv` preserva historial**: renombrar archivos vía `git mv` antes
  de editar su contenido permite que `git log --follow` rastree el historial.
- **Parámetro `functionPk` vs `catalogId`**: el rename reveló ambigüedad
  en el parámetro original — `catalogId` no diferenciaba claramente entre
  PK numérico y codename string. `functionPk` es más preciso.

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Entradas a promover bajo `## Changed`:
- Renombrar `validateSoD` → `validateSeparationRules` (acceso RBAC)
- Renombrar `MANAGE_SOD` → `MANAGE_SEPARATION_RULES` (catálogo)
- Renombrar componentes `SoDValidator`, `SoDValidation`, `SoDManagementPage`
