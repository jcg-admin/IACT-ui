```yml
created_at: 2026-05-05 19:25:21
project: THYROX
work_package: 2026-05-05-19-25-21-scss-variables-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# DISCOVER — SCSS Variables Audit

## Contexto y motivación

En la sesión anterior se configuró `sass-loader.additionalData` para inyectar
`_variables.scss` globalmente, se creó `_pages-shared.scss` con patrones comunes,
y se refactorizaron los SCSS de las 4 páginas nuevas (Access, Audit, Alerts,
Profile). El usuario solicitó analizar si el resto del codebase requiere el mismo
tratamiento antes de declarar la deuda técnica saldada.

## Scope del análisis

**30 archivos SCSS auditados** (excluidas las 4 páginas ya refactorizadas y los
archivos de iact-kit —son fuente canónica, no se modifican).

Categorías analizadas:
1. Valores hexadecimales hardcodeados que deben usar variables SCSS
2. Clases que redefinen lo ya existente en iact-kit
3. Patrones que deben usar `_pages-shared.scss`

---

## Hallazgos por tipo

### Tipo 1 — Valores hardcodeados (INFERRED: grep + lectura de archivos)

**156+ instancias** en 18 de 30 archivos.

Colores con match directo a variable disponible:
- `#3B82F6` → `$primary-color` (aparece en 15 archivos)
- `#1F2937` → `$secondary-color` (aparece en 14 archivos)
- `#ef4444` → `$error-color` (aparece en 10 archivos)
- `#10b981` → `$success-color` (aparece en 8 archivos)
- `#f59e0b` → `$warning-color` (aparece en 6 archivos)
- `#374151` → `$border-color` (aparece en 9 archivos)
- `#94a3b8` → `$text-muted` (aparece en 5 archivos)

Colores sin variable equivalente definida (requieren decisión):
- `#6b7280`, `#4b5563`, `#111827`, `#f3f4f6`, `#f9fafb`, `#e5e7eb`, `#d1d5db`
  → Escala de grises de Tailwind; no están en `_variables.scss`. Se analizará
  si conviene extender las variables o mantenerlos inline.

Spacing hardcodeado (matchea variables existentes):
- `8px` → `$spacing-sm` (40+ instancias)
- `16px` → `$spacing-md` (25+ instancias)
- `24px` / `1.5rem` → `$spacing-lg` (20+ instancias)
- `4px` → `$spacing-xs` (15+ instancias)
- `32px` / `2rem` → `$spacing-xl` (10+ instancias)

### Tipo 2 — Redefinición de clases iact-kit (PROVEN: lectura de archivos)

**8 archivos** redefinen clases que ya existen en el kit.

| Archivo | Clases redefinidas | Impacto |
|---------|-------------------|---------|
| `SessionManagement/SessionManagement.scss` | `.badge`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger` | ALTO — conflicto directo |
| `pages/Analytics/Analytics.scss` | `.btn-primary`, `.btn-secondary`, `.btn-danger` | ALTO |
| `pages/ExportHub/ExportHub.scss` | `.btn-primary`, `.btn-secondary` | MEDIO |
| `pages/JobMonitoring/JobMonitoring.scss` | `.btn-primary`, `.btn-secondary` | MEDIO |
| `pages/UserManagement/UserManagement.scss` | `.btn-primary`, `.btn-secondary`, `.btn-action`, `.btn-edit`, `.btn-delete` | ALTO |
| `styles/components/_buttons.scss` | `.btn`, `.btn-*` (todas las variantes) | INTENCIONAL* |
| `styles/components/_alerts-badges.scss` | `.alert`, `.badge`, `.badge-danger` | INTENCIONAL* |
| `styles/components/_table.scss` | `.table` | INTENCIONAL* |

*Los archivos `src/styles/components/` son la capa de customización/extensión del
kit para este proyecto — sus redefiniciones son intencionales y correctas. Los
archivos de páginas individuales NO deberían redefinir clases del kit.

**Conflicto de doble tabla:** existe `_table.scss` (con valores hardcodeados) y
`_tables.scss` (con variables). Ambos definen `.table` — posible especificidad
no intencional.

### Tipo 3 — Duplicación de `_pages-shared.scss` (PROVEN: lectura de archivos)

**4 archivos** definen patrones que ya existen en el shared layer:

| Archivo | Patrón duplicado |
|---------|-----------------|
| `SessionManagement/SessionManagement.scss` | Estado de carga equivalente a `.loading-state` |
| `pages/Analytics/Analytics.scss` | Estado de carga, uso de `.page-header` sin importarlo |
| `pages/JobMonitoring/JobMonitoring.scss` | Estado vacío equivalente a `.empty-state` |
| `pages/UserManagement/UserManagement.scss` | Barra de búsqueda parcialmente equivalente a `.search-bar` |

---

## Archivos por prioridad de refactor

### Prioridad ALTA (3 archivos)

**1. `src/components/features/SessionManagement/SessionManagement.scss`**
- 5 clases del kit redefinidas (`.badge`, `.btn`, todos los variantes)
- ~20 valores de color hardcodeados
- Patrón loading duplicado
- Riesgo: conflicto de especificidad con el kit — puede producir estilos rotos
  si el kit se actualiza

**2. `src/components/pages/UserManagement/UserManagement.scss`**
- 5 variantes de `.btn` redefinidas (incluyendo `.btn-action`, `.btn-edit`, `.btn-delete`
  que son conceptos propios, no del kit)
- ~30 valores hardcodeados
- Patrón de search-bar parcialmente duplicado

**3. `src/components/pages/Analytics/Analytics.scss`**
- 3 variantes de `.btn` redefinidas
- ~20 valores hardcodeados de color + spacing
- Patrón loading duplicado

### Prioridad MEDIA (2 archivos)

**4. `src/components/pages/JobMonitoring/JobMonitoring.scss`**
- 2 variantes de `.btn` redefinidas
- ~40 valores hardcodeados (archivo más largo del proyecto)
- Patrón `.empty-state` duplicado

**5. `src/components/pages/ExportHub/ExportHub.scss`**
- 2 variantes de `.btn` redefinidas
- ~25 valores hardcodeados

### Prioridad BAJA — Solo variables (13 archivos)

Estos archivos solo tienen hardcoded hex/spacing pero NO redefinen clases del kit
ni duplican shared patterns. Refactor es mecánico:

- `src/components/navigation/Header/*.module.scss` (6 archivos)
- `src/components/navigation/Sidebar/*.module.scss` (3 archivos)
- `src/components/DateTimeInputs/DateTimeInput.scss`
- `src/components/DateTimeInputs/SelectDropdown.scss`
- `src/pages/Dashboard.module.scss`
- `src/layouts/DashboardLayout/DashboardLayout.module.scss`

### Observaciones adicionales (requieren decisión)

**A. Colores sin variable equivalente (`#6b7280`, `#f3f4f6`, etc.)**
La escala de grises de Tailwind no está definida en `_variables.scss`. Opciones:
- Extender `_variables.scss` con `$gray-*` tokens
- Mantenerlos hardcodeados con comentario explicativo
- Mapearlos a CSS custom properties

**B. Doble definición de `.table`**
`_table.scss` (hardcodeado) + `_tables.scss` (con variables) coexisten.
`_table.scss` debería eliminarse o fusionarse con `_tables.scss`.

**C. CSS custom properties mezcladas con SCSS variables**
`_alert-item.scss`, `_alert-list.scss`, `_progress-bar.scss` usan `var(--color-xxx)`
que pueden no estar definidas. Es una inconsistencia de approach (CSS vars vs SCSS vars).

---

## Archivos limpios (sin deuda técnica)

7 archivos sin ninguna de las tres categorías de problemas:
- `_avatar.scss`, `_utilities.scss`, `_sidebar.scss` (usa variables exclusivamente)
- `_tabs.scss`, `_toast-container.scss`
- `_cards.scss` (intencional, mixin-based)
- `_navbar.scss` (solo 1 `#fff` — blanco)

---

## Estimación de alcance del refactor

| Categoría | Archivos afectados | Estimación de cambios |
|-----------|-------------------|----------------------|
| Variables (color + spacing) | 18 archivos | ~200 reemplazos mecánicos |
| Eliminar redefiniciones de kit | 5 archivos de página | ~30 selectores a eliminar |
| Usar _pages-shared.scss | 4 archivos | ~15 bloques a eliminar |
| Conflictos _table/_tables | 1 fusión | ~80 líneas |
| Variables nuevas en _variables.scss | 1 archivo | ~7 tokens nuevos |

**Total estimado:** 5 archivos de alta prioridad + 13 de baja.
El refactor completo puede hacerse en dos oleadas sin bloquear otras tareas.

---

## Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Eliminar redefinición de `.btn` rompe estilo de página | Media | Alto | Verificar que iact-kit exporte el mismo estilo visual |
| Doble `.table` genera especificidad inesperada | Baja | Medio | Consolidar antes de agregar variables |
| Grises sin variable equivalente quedan hardcodeados | Alta | Bajo | Decisión explícita en ADR pequeño |
| CSS custom props indefinidas ya producen bugs | Alta | Medio | Auditar con DevTools antes del refactor |
