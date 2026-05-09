```yml
created_at: 2026-05-09 03:22:39
project: THYROX
work_package: 2026-05-09-03-22-39-adm04-function-selector-fix
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — adm04-function-selector-fix

## Problema

UC_ADM_04 PASO 3 especifica: "Selecciona Function del catálogo (codename, name, module)".
La implementación actual usa un campo `<input type="text">` con placeholder `reports:view`,
permitiendo al admin tipear cualquier codename arbitrario sin validación contra las Functions
existentes del sistema.

## Gap

**PROVEN** — `MenuItemCatalog.jsx:213` define el campo como texto libre:
```jsx
{ key: 'function_codename', label: 'Función RBAC', placeholder: 'reports:view' }
```
Renderizado como `<input>` genérico en el loop de campos del formulario.

**PROVEN** — `FunctionSelector.jsx` existe en `src/components/access/` pero es un
multi-select con checkboxes — no apto para selección single de un codename.

**PROVEN** — Admin slice expone `fetchFunctions` (thunk) y `selectFunctions` (selector)
para obtener el catálogo de Functions. El estado `admin.functions` ya existe.

**PROVEN** — MockInterceptor provee `/api/admin/functions/` con shapes
`{ id, codename, name, domain, active }`.

## Fix scope

Micro-WP — 2 archivos afectados:

1. `MenuItemCatalog.jsx`:
   - Importar `fetchFunctions`, `selectFunctions` del admin slice
   - `dispatch(fetchFunctions())` en useEffect (junto a fetchMenuItems)
   - Extraer `function_codename` del loop genérico de inputs
   - Renderizar como `<select>` con `<option>` por cada function activa

2. `MenuItemCatalogPage.test.jsx`:
   - Agregar `fetchFunctions`, `selectFunctions` al mock del slice
   - Agregar fixture `FUNCTIONS` (3-4 entradas)
   - Actualizar `functions: FUNCTIONS` en useSelector mock
   - Agregar 2 tests: select tiene opciones del catálogo, select dispara setForm

## Exit criteria

- `MenuItemCatalog.jsx` no tiene `<input>` libre para `function_codename`
- La UI muestra `<select>` con functions activas del store
- Tests anteriores pasan sin regresión (34 tests existentes)
- 2 tests nuevos verifican el comportamiento del selector
- 1987+ tests globales pasan
