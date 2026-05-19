```yml
created_at: 2026-05-09 03:22:39
project: THYROX
work_package: 2026-05-09-03-22-39-adm04-function-selector-fix
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — adm04-function-selector-fix

## Changed

- `MenuItemCatalog.jsx`: `function_codename` cambiado de `<input type="text">` libre
  a `<select>` poblado con Functions activas del catálogo (UC_ADM_04 PASO 3).
  - Importa `fetchFunctions`, `selectFunctions` del admin slice
  - Despacha `fetchFunctions()` en useEffect junto a `fetchMenuItems()`
  - Muestra `codename — name` por cada Function con `active !== false`
  - Primera opción es placeholder vacío requerido ("Seleccionar función...")

## Added

- `MenuItemCatalogPage.test.jsx`: fixture `FUNCTIONS` (3 entradas, 1 inactiva)
- 2 tests nuevos en describe 'MenuItemCatalog':
  - `shows function selector with options from catalog (UC_ADM_04 PASO 3)`: verifica
    `<select>` visible con opciones activas, sin funciones inactivas
  - `dispatches fetchFunctions on mount`: verifica que mount despacha ambos thunks

## Fixed

- Test `dispatches transitionMenuItemStatus on transition click`: conteo de dispatch
  actualizado de 2 → 3 (mount ahora despacha 2 thunks + click 1)

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entrada candidata bajo `## Changed`:
`- MenuItemCatalog: function_codename usa selector de Functions del catálogo (UC_ADM_04 PASO 3)`
