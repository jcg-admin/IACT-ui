```yml
created_at: 2026-05-05 19:25:21
project: THYROX
work_package: 2026-05-05-19-25-21-scss-variables-audit
author: NestorMonroy
status: Resuelto
```

# ERROR: Valores hex hardcodeados por variables de grises faltantes

## Síntoma

`ExportHub.scss` y `JobMonitoring.scss` (y otros archivos SCSS) fueron refactorizados
para usar variables SCSS, pero aún contienen valores hex hardcodeados:

```scss
background: #f9fafb;       // ← debería ser $gray-50
border: 1px solid #e5e7eb; // ← debería ser $gray-200
border-color: #d1d5db;     // ← debería ser $gray-300
```

## Causa raíz

`src/styles/abstracts/_variables.scss` define colores de estado (`$primary-color`,
`$error-color`, etc.) pero **no define la escala de grises de la UI**.

Los grises `#f9fafb`, `#e5e7eb`, `#d1d5db`, `#f3f4f6`, `#6b7280`, `#111827`
aparecen en ~18 archivos SCSS del proyecto pero ninguno tiene variable equivalente.

Al refactorizar "usando variables", el desarrollador reemplaza lo que PUEDE reemplazar
(colores de estado, spacing) pero deja hardcodeados los grises porque no existe variable.
El resultado se ve "mejorado" pero sigue teniendo deuda técnica.

## Colores sin variable equivalente (tabla completa)

| Hex | Tailwind equivalente | Frecuencia en codebase |
|-----|---------------------|----------------------|
| `#f9fafb` | gray-50 | ~20 usos |
| `#f3f4f6` | gray-100 | ~15 usos |
| `#e5e7eb` | gray-200 | ~25 usos |
| `#d1d5db` | gray-300 | ~18 usos |
| `#9ca3af` | gray-400 | ~8 usos |
| `#6b7280` | gray-500 | ~15 usos |
| `#4b5563` | gray-600 | ~5 usos |
| `#374151` | gray-700 | YA EXISTE como `$border-color` |
| `#1f2937` | gray-800 | YA EXISTE como `$secondary-color` |
| `#111827` | gray-900 | ~10 usos (sin variable) |

## Problema adicional: @import deprecado en Dart Sass 1.99

La solución `additionalData` que inyecta `_variables.scss` usa `@import`:
```js
additionalData: `@import "${path.resolve(__dirname, 'src/styles/abstracts/_variables.scss')}";`,
```

Dart Sass 1.99.0 (instalado en este proyecto) depreca `@import`. El build produce
`Deprecation Warning` en cada archivo SCSS compilado. `@import` será eliminado
en Dart Sass 3.0.0.

**Evidencia:** Build output muestra:
```
Deprecation Warning on line 0, column 8:
Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.
0 | @import "/home/user/IACT-ui/src/styles/abstracts/_variables.scss";
```

## Solución aplicada

### 1. Agregar escala de grises a `_variables.scss`

```scss
// Grises UI — escala Tailwind gray
$gray-50:  #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-900: #111827;
```

### 2. Cambiar `additionalData` de `@import` a `@use`

```js
// ANTES (deprecated)
additionalData: `@import "${path.resolve(__dirname, 'src/styles/abstracts/_variables.scss')}";`,

// DESPUÉS (correcto para Dart Sass 1.99+)
additionalData: (content) =>
  `@use "${path.resolve(__dirname, 'src/styles/abstracts/_variables.scss')}" as *;\n${content}`,
```

### 3. Reemplazar grises hardcodeados en todos los archivos SCSS

Ver tarea T-011 (Wave 4) en el task plan del WP.

## Patrón de error a evitar

```
NO HACER:
"Refactoricé con variables" = reemplacé los 5-6 colores de estado
pero dejé los grises hardcodeados porque no había variables.

SÍ HACER:
Antes de refactorizar SCSS, verificar que TODAS las constantes
usadas en el archivo tengan variable equivalente. Si no existe,
AGREGAR la variable primero.
```

## Checklist de verificación post-refactor

```bash
# Verificar que no queden hex hardcodeados mapeables
grep -n "#[0-9a-fA-F]\{6\}" archivo.scss | grep -v "rgba\|//\|gradient"
```

Si la salida tiene colores que deberían ser variables, el refactor está incompleto.
