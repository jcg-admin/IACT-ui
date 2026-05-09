```yml
created_at: 2026-05-09 02:08:00
project: THYROX
work_package: 2026-05-09-02-02-57-transversal-components-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# SCSS Audit — Extended Analysis

Auditoría completa de clases CSS usadas en componentes vs. clases definidas en archivos SCSS.

---

## Metodología

Para cada componente: listar clases usadas → buscar en `src/styles/` → clasificar OK/GAP.

---

## Resultados por componente

### ConfirmModal.jsx — CRÍTICO (GAP-CM-01)

| Clase usada | Existe en SCSS | Archivo SCSS |
|------------|----------------|--------------|
| `btn` | ✓ | `_buttons.scss:7` |
| `btn--danger` | ✗ | — |
| `btn--warning` | ✗ | — |
| `btn--primary` | ✗ | — |
| `btn--secondary` | ✗ | — |
| `confirm-modal__message` | ✗ (no relevante — solo wrapper div) | — |

SCSS define: `.btn-danger`, `.btn-primary`, `.btn-secondary`, `.btn-warning` (guion simple, `_buttons.scss:15-39`).
Ninguna clase `btn--*` (BEM doble guion) existe en el proyecto.

**Corrección:** `btn--danger` → `btn-danger`, `btn--primary` → `btn-primary`, `btn--secondary` → `btn-secondary`.
Actualizar simultáneamente `ConfirmModal.test.jsx` (líneas 67-82).

### GroupAssignModal.jsx — CRÍTICO (GAP-CM-02)

| Clase usada | Existe en SCSS |
|------------|----------------|
| `btn btn--secondary` | ✗ (`btn--secondary` no existe) |
| `btn btn--primary` | ✗ (`btn--primary` no existe) |

Misma corrección que GAP-CM-01.

### Table.jsx — OK

| Clase usada | Existe en SCSS | Verificación |
|------------|----------------|--------------|
| `table-container` | ✓ | `_table.scss:1` |
| `table` | ✓ | `_table.scss:7` |
| `table-header` | ✓ | `_table.scss:14` |
| `table-header-content` | ✓ | `_table.scss:19` |
| `table-cell` | ✓ | `_table.scss:27` |
| `table-cell--sortable` | ✓ | `_table.scss:32` (BEM `&--sortable`) |
| `table-cell--checkbox` | ✓ | `_table.scss:41` (BEM `&--checkbox`) |
| `table-cell--actions` | ✓ | `_table.scss:47` (BEM `&--actions`) |
| `table-sort-icon` | ✓ | `_table.scss:61` |
| `table-row` | ✓ | `_table.scss:52` |
| `table-checkbox` | ✓ | `_table.scss:66` |
| `table-body` | ✓ | referenciada en `_table.scss:100` |
| `table-loading` | ✓ | `_table.scss:72` |
| `table-empty` | ✓ | `_table.scss:73` |
| `btn btn-sm btn-secondary` | ✓ | `_buttons.scss` + `_buttons.scss:75` |

**Sin gaps.** Table.jsx usa correctamente el sistema BEM de `_table.scss`.

### LoadingSpinner.jsx — OK

| Clase usada | Existe en SCSS | Archivo |
|------------|----------------|---------|
| `flex` | ✓ | `_container.scss:106`, `_all.scss:55` |
| `items-center` | ✓ | `_all.scss:137` |
| `justify-center` | ✓ | `_container.scss:122` |
| `flex-column` | ✓ | `_container.scss:110`, `_all.scss:63` |
| `p-lg` | ✓ | `_container.scss:203` |
| `spinner` | ✓ | `_utilities.scss` |
| `spinner-sm` | ✓ | `_utilities.scss` |
| `spinner-lg` | ✓ | `_utilities.scss` |

**Sin gaps.** El análisis previo sugería que `flex` faltaba, pero el componente LO USA explícitamente:
```jsx
<div className="flex items-center justify-center p-lg">   // ← flex presente
  <div className="flex flex-column items-center justify-center">  // ← flex presente
```
Todas las clases de `LoadingSpinner.jsx` existen en el sistema de estilos. No requiere cambios.

### Modal.jsx — OK

Usa únicamente: `modal-overlay`, `modal`, `modal--{size}`, `modal-header`, `modal-title`, `modal-close`, `modal-content`, `modal-footer` — todas definidas en `_modal.scss`. Sin gaps.

### AdminCatalog pages — GAP-DT-01 (MEDIO)

**`data-table`** — clase usada en 3 instancias, no existe en ningún archivo SCSS:

| Archivo | Línea |
|---------|-------|
| `admin/SeparationRulesCatalog.jsx` | 164 |
| `admin/MenuItemCatalog.jsx` | 235 |
| `admin/MenuItemCatalog.jsx` | 313 |

La clase `.table` SÍ existe en `_table.scss:7` con estilos completos (border-collapse, font-size, margin).
`data-table` no tiene estilos definidos — las tablas en estas páginas renderizan sin bordes, sin padding de celdas, sin fondo de header.

**Decisión:** Cambiar `className="data-table"` → `className="table"`.
No hay necesidad de una variante visual distinta para estas tablas de admin — `.table` es el estándar del proyecto.

No se agrega `.data-table` al SCSS — agregar una clase muerta es tech debt.

### FunctionCatalog.jsx y AGRCatalog.jsx — OK

Usan `badge` y `badge-danger` — ambas verificadas en `_alerts-badges.scss`. Sin gaps.

---

## Resumen consolidado de gaps de SCSS

| Gap ID | Archivo(s) | Clase incorrecta | Corrección |
|--------|-----------|-----------------|------------|
| GAP-CM-01 | `ConfirmModal.jsx` | `btn--{danger,primary,secondary,warning}` | → `btn-{danger,primary,secondary,warning}` |
| GAP-CM-02 | `GroupAssignModal.jsx` | `btn--{secondary,primary}` | → `btn-{secondary,primary}` |
| GAP-DT-01 | `SeparationRulesCatalog.jsx`, `MenuItemCatalog.jsx` (×2) | `data-table` | → `table` |

**3 gaps reales de SCSS. 0 falsos positivos.**

---

## Criterios de salida Bloque I (actualizado)

```bash
# Gap 1+2 — btn-- classes
grep "btn--" src/components/shared/ConfirmModal.jsx        # → 0 resultados
grep "btn--" src/components/access/GroupAssignModal.jsx    # → 0 resultados
grep "btn--" src/components/shared/__tests__/ConfirmModal.test.jsx  # → 0 resultados

# Gap 3 — data-table
grep "data-table" src/pages/ -r                            # → 0 resultados
```
