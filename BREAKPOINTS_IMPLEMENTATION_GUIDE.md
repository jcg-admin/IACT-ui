# Guía de Uso: Breakpoints.scss en IACT v4.0

## Instalado y Listo

**Status:** ✅ Implementado exitosamente

El sistema de breakpoints del mx-template ha sido integrado en IACT v4.0.

---

## Breakpoints Disponibles

```scss
xs: 360px    (Mobile - por defecto)
sm: 480px    (Small devices)
md: 640px    (Tablets)
lg: 768px    (Desktops)
xl: 1024px   (Large screens)
2xl: 1280px  (Extra large)
```

---

## Mixins SCSS Disponibles

### 1. media-breakpoint-up() - MOBILE-FIRST (Recomendado)

Aplica estilos desde un breakpoint HACIA ARRIBA.

```scss
@include media-breakpoint-up(md) {
  .container { width: 750px; }
}

// Genera:
@media (min-width: 640px) {
  .container { width: 750px; }
}
```

**Uso:** Para agregar mejoras progresivas (mobile → tablet → desktop)

---

### 2. media-breakpoint-down() - DESKTOP-FIRST

Aplica estilos HASTA un breakpoint HACIA ABAJO.

```scss
@include media-breakpoint-down(lg) {
  .container { width: 100%; }
}

// Genera:
@media (max-width: 767.98px) {
  .container { width: 100%; }
}
```

**Uso:** Para remover características en pantallas pequeñas

---

### 3. media-breakpoint-between() - RANGO DE BREAKPOINTS

Aplica estilos SOLO ENTRE dos breakpoints.

```scss
@include media-breakpoint-between(md, lg) {
  .flexible { padding: 16px; }
}

// Genera:
@media (min-width: 640px) and (max-width: 767.98px) {
  .flexible { padding: 16px; }
}
```

**Uso:** Para estilos específicos de un rango

---

### 4. media-breakpoint-only() - UN BREAKPOINT ESPECÍFICO

Aplica estilos SOLO en un breakpoint (sin heredar).

```scss
@include media-breakpoint-only(md) {
  .tablet-feature { display: block; }
}

// Genera:
@media (min-width: 640px) and (max-width: 767.98px) {
  .tablet-feature { display: block; }
}
```

**Uso:** Para características exclusivas de un tamaño

---

## Funciones SCSS Disponibles

Si necesitas usar valores de breakpoints en SCSS:

```scss
// Obtener ancho mínimo
breakpoint-min(md)    → 640px
breakpoint-min(xs)    → null (0px)

// Obtener ancho máximo
breakpoint-max(md)    → 767.98px
breakpoint-max(2xl)   → null

// Siguiente breakpoint
breakpoint-next(md)   → lg

// Anterior breakpoint
breakpoint-previous(md) → sm

// Sufijo para clases responsivas
breakpoint-infix(xs)  → ""
breakpoint-infix(md)  → "-md"
```

---

## Ejemplos Prácticos

### Ejemplo 1: Layout Responsivo (MOBILE-FIRST)

```scss
// Base móvil
.container {
  width: 100%;
  padding: 8px;
  margin: 0 auto;
}

// Mejorar en tablet
@include media-breakpoint-up(md) {
  .container {
    width: 600px;
    padding: 16px;
  }
}

// Mejorar en desktop
@include media-breakpoint-up(lg) {
  .container {
    width: 900px;
    padding: 24px;
  }
}

// Mejorar en pantalla grande
@include media-breakpoint-up(xl) {
  .container {
    width: 1200px;
    padding: 32px;
  }
}
```

### Ejemplo 2: Grid Responsivo

```scss
.grid {
  display: grid;
  grid-template-columns: 1fr; // Mobile: 1 columna
  gap: 8px;
}

@include media-breakpoint-up(md) {
  .grid {
    grid-template-columns: repeat(2, 1fr); // Tablet: 2 columnas
    gap: 16px;
  }
}

@include media-breakpoint-up(lg) {
  .grid {
    grid-template-columns: repeat(3, 1fr); // Desktop: 3 columnas
    gap: 24px;
  }
}

@include media-breakpoint-up(xl) {
  .grid {
    grid-template-columns: repeat(4, 1fr); // Large: 4 columnas
    gap: 32px;
  }
}
```

### Ejemplo 3: Navegación Responsiva

```scss
// Base móvil - Menú oculto
.navbar {
  display: flex;
  padding: 8px;

  .nav-menu {
    display: none; // Oculto en móvil
  }

  .hamburger {
    display: block; // Mostrar hamburger en móvil
  }
}

// Mostrar menú en tablet+
@include media-breakpoint-up(md) {
  .navbar {
    .nav-menu {
      display: flex; // Mostrar menú
    }

    .hamburger {
      display: none; // Ocultar hamburger
    }
  }
}
```

### Ejemplo 4: Tipografía Responsiva

```scss
h1 {
  font-size: 20px;
  line-height: 1.2;
}

@include media-breakpoint-up(md) {
  h1 {
    font-size: 28px;
  }
}

@include media-breakpoint-up(lg) {
  h1 {
    font-size: 36px;
  }
}

@include media-breakpoint-up(xl) {
  h1 {
    font-size: 48px;
  }
}
```

### Ejemplo 5: Solo en Rango Específico

```scss
// Mostrar solo en tablets
@include media-breakpoint-only(md) {
  .tablet-banner {
    display: block;
    background: blue;
  }
}

// Mostrar entre móvil y tablet
@include media-breakpoint-between(xs, md) {
  .small-device-feature {
    display: flex;
    flex-direction: column;
  }
}
```

### Ejemplo 6: Con Fallback Class

```scss
// Aplicar estilos con fallback para modo no-responsivo
@include media-breakpoint-up-or(md, ".responsive-mode") {
  .container {
    width: 750px;
  }
}

// Genera:
.responsive-mode .container { width: 750px; }
@media (min-width: 640px) {
  .container { width: 750px; }
}
```

---

## Mejores Prácticas

### 1. Usar Mobile-First (Recomendado)

```scss
// CORRECTO - Mobile-first
.element {
  font-size: 12px; // Base móvil
}

@include media-breakpoint-up(md) {
  .element {
    font-size: 14px; // Mejora
  }
}

// INCORRECTO - Desktop-first (no recomendado)
.element {
  font-size: 18px; // Desktop
}

@include media-breakpoint-down(md) {
  .element {
    font-size: 14px; // Reduce
  }
}
```

### 2. No Anidar Demasiado

```scss
// CORRECTO - Limpio
.card {
  padding: 8px;
}

@include media-breakpoint-up(md) {
  .card {
    padding: 16px;
  }
}

// INCORRECTO - Anidado y confuso
.card {
  padding: 8px;

  @include media-breakpoint-up(md) {
    padding: 16px;

    @include media-breakpoint-up(lg) {
      padding: 24px;
    }
  }
}
```

### 3. Agrupar Cambios Relacionados

```scss
// CORRECTO - Agrupar cambios del mismo elemento
.container {
  width: 100%;
  padding: 8px;
  grid-template-columns: 1fr;
}

@include media-breakpoint-up(md) {
  .container {
    width: 600px;
    padding: 16px;
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Equivalencias con Código Anterior

### Antes (Hard-coded)

```scss
@media (max-width: 768px) {
  .container { width: 100%; }
}
```

### Ahora (Con Breakpoints Mixins)

```scss
@include media-breakpoint-down(lg) {
  .container { width: 100%; }
}
```

---

## Compatibilidad Backward

Si tienes código antiguo, estos mixins siguen funcionando:

```scss
// Legacy - Seguirá funcionando
@include respond-to(md) {
  // Equivalente a: @include media-breakpoint-up(md)
}

@include respond-below(lg) {
  // Equivalente a: @include media-breakpoint-down(lg)
}

@include respond-between(md, lg) {
  // Equivalente a: @include media-breakpoint-between(md, lg)
}
```

---

## Testing Responsivo

Para probar tus cambios responsivos:

```bash
# Compilar en watch mode
npm run build:watch

# Abrir en diferentes tamaños
# Chrome DevTools: Toggle device toolbar (Ctrl+Shift+M)
# Tamaños a probar: 360px, 480px, 640px, 768px, 1024px, 1280px
```

---

## Documentación Completa

Ver archivo completo: `src/styles/iact-kit/abstracts/mixins/_breakpoints.scss`

Contiene:
- Funciones SCSS con documentación
- Mixins con ejemplos
- Comentarios detallados
- Casos de uso

---

## Siguiente Paso

Actualiza tus componentes SCSS para usar los nuevos mixins:

1. Reemplaza `@media` hard-coded con `@include media-breakpoint-up()`
2. Usa mobile-first approach
3. Mantén código limpio y legible
4. Test en diferentes tamaños de pantalla

**Ejemplo de refactor:**

```scss
// Antes
.component {
  display: flex;
  
  @media (max-width: 768px) {
    display: block;
  }
}

// Después
.component {
  display: block;
}

@include media-breakpoint-up(md) {
  .component {
    display: flex;
  }
}
```

---

**Status:** Implementación completada exitosamente

Sistema de breakpoints compatible con Bootstrap/mx-template funcionando en IACT v4.0.
