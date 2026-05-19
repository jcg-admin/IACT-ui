```yml
created_at: 2026-05-05 16:31:59
project: IACT-UI
work_package: 2026-05-05-16-31-59-rbac-naming-refactor
phase: Phase 1 — DISCOVER
author: claude
status: Aprobado
```

# DISCOVER — RBAC Naming Refactor Analysis

## Fuente de la regla

`MODELO_RBAC_IACT_v5_2_1.md` — versión 5.2.1 (13 Ene 2026) define:

```
ESTÁNDAR v5.2.1:
  ✅ CÓDIGO:      Inglés (clases, métodos, variables, nombres de funciones)
  ✅ COMENTARIOS: Español (docstrings, help_text, comments)
  NINGUNA EXCEPCIÓN
```

Cambios explícitos de v5.2.0 → v5.2.1:
- `manage_separation_rules` (NO `gestiona_sod`)
- `validate_separation_rules` (NO `validate_sod`)
- `pipeline_audit_separation` (NO `sod_admin_auditoria`)
- `view_pipeline_status` (NO `ve_estado_etl` — evitar acrónimos en nombres)

---

## Hallazgos — Identificadores violadores (PROVEN via grep)

### H-001 — `validateSoD` en `accessSlice.js` [CRÍTICO]

| Archivo | Línea | Identificador | Tipo |
|---------|-------|---------------|------|
| `src/redux/slices/accessSlice.js` | 66 | `export const validateSoD` | thunk |
| `src/redux/slices/accessSlice.js` | 67 | `'access/validateSoD'` | action type |
| `src/redux/slices/accessSlice.js` | 71 | `accessService.validateSoD(...)` | llamada |
| `src/redux/slices/accessSlice.js` | 204,208,212 | `.addCase(validateSoD.*)` | cases |

**Rename:** `validateSoD` → `validateSeparationRules`

### H-002 — `sodConflicts` en `accessSlice.js` [CRÍTICO]

| Archivo | Línea | Identificador | Tipo |
|---------|-------|---------------|------|
| `src/redux/slices/accessSlice.js` | 98 | `sodConflicts: []` | state key |
| `src/redux/slices/accessSlice.js` | 210 | `state.sodConflicts = ...` | setter |
| `src/redux/slices/accessSlice.js` | 242 | `export const selectSoDConflicts` | selector |

**Rename:** `sodConflicts` → `separationConflicts`, `selectSoDConflicts` → `selectSeparationConflicts`

### H-003 — `validateSoD` en `accessService.js` [CRÍTICO]

| Archivo | Línea | Identificador | Tipo |
|---------|-------|---------------|------|
| `src/services/accessService.js` | 94 | `async validateSoD(...)` | método |

**Rename:** `validateSoD` → `validateSeparationRules`

### H-004 — `MANAGE_SOD` en `catalog.js` [CRÍTICO]

| Archivo | Línea | Identificador | Tipo |
|---------|-------|---------------|------|
| `src/permissions/catalog.js` | 40 | `MANAGE_SOD` | constante RBAC |

v5.2.1 nombra la función como `manage_separation_rules` (ACC-005).
**Rename:** `MANAGE_SOD` → `MANAGE_SEPARATION_RULES`
**Value:** `'sistema.administracion.acceso.sod'` — el scope del backend usa `sod` (aceptable en strings de dominio, no en identificadores de código)

### H-005 — Componentes React con `SoD` en nombre [MODERADO]

| Archivo | Componente/Export | Tipo |
|---------|-------------------|------|
| `src/components/access/SoDValidator.jsx` | `SoDValidator` | componente |
| `src/components/transaction/content/SoDValidation.jsx` | `SoDValidation` | componente |
| `src/pages/access/SoDManagementPage.jsx` | `SoDManagementPage` | página |

**Rename propuesto:**
- `SoDValidator` → `SeparationRulesValidator`
- `SoDValidation` → `SeparationRulesValidation`
- `SoDManagementPage` → `SeparationRulesPage`

### H-006 — Imports/referencias en cascada [DERIVADO]

| Archivo | Referencia |
|---------|------------|
| `src/components/transaction/AssignFunctionStepper.jsx` | `import SoDValidation` |
| `src/pages/access/AssignFunctionsPage.jsx` | `import { ..., validateSoD, ... }` + `selectSoDConflicts` |
| `src/redux/slices/__tests__/accessSlice.test.js` | `validateSoD`, `selectSoDConflicts`, `sodConflicts` |
| `src/pages/access/__tests__/AssignFunctionsPage.test.jsx` | mock de `validateSoD` |

---

## Hallazgos fuera del scope de renaming

### H-007 — `AGR` en comentarios/JSDoc [ACEPTABLE]

`AGR` (Agrupador de Roles / Access Group) aparece en:
- `src/services/userService.js` línea 57: en comentario JSDoc — **CORRECTO** (comentarios en español/dominio son aceptables)
- `src/permissions/catalog.js` línea 52: en comentario — **CORRECTO**

No requiere cambio — los comentarios pueden usar terminología de dominio.

### H-008 — `ETL`/`IVR` en mocks [ACEPTABLE]

Aparecen en `src/mocks/` que es infraestructura de desarrollo, no código de producción.
- `src/mocks/metadata.js` — mock data keys
- `src/mocks/registry.js` — mock registry

No requiere cambio en esta iteración — los mocks no son parte del contrato RBAC.

### H-009 — `IVR` en texto UI [ACEPTABLE]

`src/components/MainLayout.jsx`: `"IACT - IVR Analytics"` — texto visible al usuario.
El estándar v5.2.1 solo aplica a identificadores de código, no a texto de interfaz.

---

## Priorización

| ID | Hallazgo | Impacto | Acción |
|----|---------|---------|--------|
| H-001 | `validateSoD` thunk | Alto — API pública del slice | Renombrar |
| H-002 | `sodConflicts` / `selectSoDConflicts` | Alto — estado + selector exportado | Renombrar |
| H-003 | `validateSoD` en accessService | Alto — método del servicio | Renombrar |
| H-004 | `MANAGE_SOD` en catalog | Alto — constante RBAC exportada | Renombrar |
| H-005 | Componentes `SoD*` | Medio — nombres de archivos + exports | Renombrar |
| H-006 | Referencias en cascada | Derivado — se resuelve con H-001..005 | Actualizar |
| H-007 | AGR en comentarios | Ninguno | Sin cambio |
| H-008 | ETL/IVR en mocks | Ninguno | Sin cambio |
| H-009 | IVR en texto UI | Ninguno | Sin cambio |

---

## Plan de ejecución

**Bloque 1 — Slice + Service + Catalog (núcleo):**
- Renombrar en `accessService.js`: `validateSoD` → `validateSeparationRules`
- Renombrar en `accessSlice.js`: thunk + state key + selector
- Renombrar en `catalog.js`: `MANAGE_SOD` → `MANAGE_SEPARATION_RULES`
- Actualizar tests `accessSlice.test.js` en el mismo commit

**Bloque 2 — Componentes React:**
- Renombrar archivos + exports: `SoDValidator`, `SoDValidation`, `SoDManagementPage`
- Actualizar imports en `AssignFunctionStepper`, `AssignFunctionsPage`

**Bloque 3 — Tests de páginas:**
- Actualizar `AssignFunctionsPage.test.jsx` con nuevos nombres
