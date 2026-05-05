# Utilities Responsivas: Cómo genera mx-template

## ¿Qué son Utilities Responsivas?

**Utilities responsivas** son clases CSS generadas automáticamente que se aplican SOLO en ciertos breakpoints.

### Ejemplos

```html
<!-- Padding base en móvil -->
<div class="p-md"></div>

<!-- Padding diferente en tablet+ -->
<div class="p-md p-lg-xl"></div>

<!-- Ancho diferente en tablet+ -->
<div class="w-full w-1/2-md"></div>

<!-- Display diferente en móvil y desktop -->
<div class="d-none d-flex-md"></div>
```

**Generadas:** `.p-md`, `.p-lg-md`, `.p-lg-lg`, `.p-lg-xl`, etc.

---

## Cómo funciona en mx-template

### 1. Usar @each loops

mx-template genera utilities automáticamente con loops:

```scss
// Base: Sin breakpoint
@each $size, $value in $spacers {
  .p-#{$size} {
    padding: $value;
  }
}

// Genera:
.p-xs { padding: 4px; }
.p-sm { padding: 8px; }
.p-md { padding: 16px; }
.p-lg { padding: 24px; }
.p-xl { padding: 32px; }
```

### 2. Generar variantes responsivas

Para cada breakpoint, generar clases con sufijo:

```scss
// Variantes responsivas
@each $breakpoint, $size, $value in $breakpoints {
  @include media-breakpoint-up($breakpoint) {
    .p-#{$breakpoint}-#{$size} {
      padding: $value;
    }
  }
}

// Genera:
@media (min-width: 480px) {
  .p-sm-xs { padding: 4px; }
  .p-sm-sm { padding: 8px; }
  .p-sm-md { padding: 16px; }
  ...
}

@media (min-width: 640px) {
  .p-md-xs { padding: 4px; }
  .p-md-sm { padding: 8px; }
  .p-md-md { padding: 16px; }
  ...
}
```

### 3. Usar en HTML

```html
<!-- Base móvil: padding 8px -->
<!-- En md: padding 16px -->
<div class="p-sm p-md-md"></div>

<!-- Base móvil: display none -->
<!-- En md: display flex -->
<div class="d-none d-md-flex"></div>
```

---

## Sistema Generativo en SCSS

### Patrón General

```scss
// MAPAS DE VALORES
$spacings: (
  xs: 4px,
  sm: 8px,
  md: 16px,
  lg: 24px,
  xl: 32px
);

// GENERAR UTILITIES BASE (sin breakpoint)
@each $size, $value in $spacings {
  .p-#{$size} {
    padding: $value;
  }
}

// GENERAR UTILITIES RESPONSIVAS
// Para cada breakpoint
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    // Para cada espaciado
    @each $size, $value in $spacings {
      .p-#{$bp-name}-#{$size} {
        padding: $value;
      }
    }
  }
}
```

---

## Tipos de Utilities Responsivas

### 1. Padding Responsivo

```scss
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    @each $size, $value in $spacings {
      .p-#{$bp-name}-#{$size} { padding: $value; }
      .pt-#{$bp-name}-#{$size} { padding-top: $value; }
      .pb-#{$bp-name}-#{$size} { padding-bottom: $value; }
      .pl-#{$bp-name}-#{$size} { padding-left: $value; }
      .pr-#{$bp-name}-#{$size} { padding-right: $value; }
      .px-#{$bp-name}-#{$size} { padding-left: $value; padding-right: $value; }
      .py-#{$bp-name}-#{$size} { padding-top: $value; padding-bottom: $value; }
    }
  }
}
```

### 2. Margin Responsivo

```scss
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    @each $size, $value in $spacings {
      .m-#{$bp-name}-#{$size} { margin: $value; }
      .mt-#{$bp-name}-#{$size} { margin-top: $value; }
      .mb-#{$bp-name}-#{$size} { margin-bottom: $value; }
      // ... etc
    }
  }
}
```

### 3. Display Responsivo

```scss
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    .d-#{$bp-name}-none { display: none; }
    .d-#{$bp-name}-block { display: block; }
    .d-#{$bp-name}-flex { display: flex; }
    .d-#{$bp-name}-grid { display: grid; }
  }
}
```

### 4. Grid Responsivo

```scss
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    @each $cols from 1 through 12 {
      .grid-#{$bp-name}-#{$cols} {
        grid-template-columns: repeat(#{$cols}, 1fr);
      }
    }
  }
}
```

### 5. Text Size Responsivo

```scss
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    @each $size, $value in $font-sizes {
      .text-#{$bp-name}-#{$size} { font-size: $value; }
    }
  }
}
```

---

## Ejemplo Completo

```scss
// VARIABLES
$spacings: (
  'xs': 4px,
  'sm': 8px,
  'md': 16px,
  'lg': 24px,
  'xl': 32px
);

$displays: (
  'none': none,
  'block': block,
  'flex': flex,
  'grid': grid,
  'inline': inline,
  'inline-block': inline-block
);

// UTILITIES BASE (sin breakpoint)
@each $size, $value in $spacings {
  .p-#{$size} { padding: $value; }
  .m-#{$size} { margin: $value; }
}

@each $display, $value in $displays {
  .d-#{$display} { display: $value; }
}

// UTILITIES RESPONSIVAS
@each $bp-name, $bp-value in $grid-breakpoints {
  @include media-breakpoint-up($bp-name) {
    // Padding responsivo
    @each $size, $value in $spacings {
      .p-#{$bp-name}-#{$size} { padding: $value; }
      .m-#{$bp-name}-#{$size} { margin: $value; }
    }

    // Display responsivo
    @each $display, $value in $displays {
      .d-#{$bp-name}-#{$display} { display: $value; }
    }

    // Grid responsivo
    @for $i from 1 through 4 {
      .grid-#{$bp-name}-#{$i} {
        grid-template-columns: repeat(#{$i}, 1fr);
      }
    }

    // Font size responsivo
    @each $size, $value in $font-sizes {
      .text-#{$bp-name}-#{$size} { font-size: $value; }
    }
  }
}
```

---

## CSS Generado (Ejemplo)

```css
/* Base - sin breakpoint */
.p-xs { padding: 4px; }
.p-sm { padding: 8px; }
.p-md { padding: 16px; }
.d-none { display: none; }
.d-block { display: block; }
.d-flex { display: flex; }

/* Responsive - sm breakpoint (480px+) */
@media (min-width: 480px) {
  .p-sm-xs { padding: 4px; }
  .p-sm-sm { padding: 8px; }
  .p-sm-md { padding: 16px; }
  .d-sm-none { display: none; }
  .d-sm-block { display: block; }
  .d-sm-flex { display: flex; }
  .grid-sm-2 { grid-template-columns: repeat(2, 1fr); }
  .text-sm-xs { font-size: 12px; }
}

/* Responsive - md breakpoint (640px+) */
@media (min-width: 640px) {
  .p-md-xs { padding: 4px; }
  .p-md-sm { padding: 8px; }
  .p-md-md { padding: 16px; }
  .d-md-none { display: none; }
  .d-md-block { display: block; }
  .d-md-flex { display: flex; }
  .grid-md-2 { grid-template-columns: repeat(2, 1fr); }
  .text-md-xs { font-size: 12px; }
}
```

---

## Ventajas

✅ **Sin código duplicado** - Generado automáticamente
✅ **Mantenible** - Un solo lugar para cambiar valores
✅ **Escalable** - Agregar breakpoints/valores = actualizar mapas
✅ **Pequeño CSS** - Solo lo que se necesita
✅ **Flexible** - Personalizable completamente

---

## Desventajas

⚠️ **CSS grande** - Muchas clases generadas
⚠️ **Nombres largos** - `.p-md-lg`, `.d-sm-flex` (no tan legible)
⚠️ **Over-engineering** - Puede ser excesivo para proyectos pequeños
⚠️ **Debugging** - Difícil de encontrar dónde se generó una clase

---

## Recomendación para IACT v4.0

**IMPLEMENTAR utilities responsivas SELECTIVAS**

No generar TODAS las combinaciones, sino las más útiles:

1. **Padding/Margin responsivo** - ÚTIL (cambia mucho con breakpoints)
2. **Display responsivo** - ÚTIL (ocultar/mostrar por breakpoint)
3. **Grid responsivo** - ÚTIL (columnas cambian)
4. **Font size responsivo** - MENOS ÚTIL (mejor usar CSS específico)

**Estrategia:**
- Generar utilities responsivas para propiedades que CAMBIAN CON BREAKPOINTS
- Dejar CSS específico para propiedades que NO cambian

---

**Status:** Listo para implementar en IACT v4.0
