# Guía Práctica: Utilities Responsivas en IACT v4.0

## Instalado y Listo

**Status:** ✅ Implementado exitosamente

Las utilities responsivas han sido integradas en IACT v4.0 usando loops SCSS automáticos.

---

## ¿Qué son Utilities Responsivas?

Clases CSS que se aplican SOLO en ciertos breakpoints, permitiendo cambiar estilos según el tamaño de pantalla.

### Ejemplo

```html
<!-- Base móvil: padding 8px, 1 columna -->
<!-- En md+: padding 16px, 2 columnas -->
<!-- En lg+: padding 24px, 3 columnas -->
<div class="p-sm p-md-md p-lg-lg grid-sm-1 grid-md-2 grid-lg-3">
  Contenido
</div>
```

---

## Sintaxis

```
.{property}-{breakpoint}-{size}
```

### Partes

- **property:** `p` (padding), `m` (margin), `d` (display), `grid`, `flex`, etc.
- **breakpoint:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **size:** `xs`, `sm`, `md`, `lg`, `xl` (depende de la propiedad)

### Ejemplos

```
.p-md-lg       → padding grande en md+
.d-md-flex     → display flex en md+
.grid-lg-3     → 3 columnas en lg+
.mt-md-md      → margin-top medio en md+
.gap-lg-xl     → gap extra grande en lg+
```

---

## Breakpoints Disponibles

```
xs:  360px  (Mobile - por defecto)
sm:  480px  (Small devices)
md:  640px  (Tablets)
lg:  768px  (Desktops)
xl:  1024px (Large screens)
2xl: 1280px (Extra large)
```

---

## Utilities Responsivas Disponibles

### 1. PADDING RESPONSIVO

**Clases:** `.p-{bp}-{size}`, `.pt-{bp}-{size}`, `.pb-{bp}-{size}`, etc.

```html
<!-- Padding base en móvil, diferente en tablet -->
<div class="p-sm p-md-md">
  padding: 8px (base)
  padding: 16px (md+)
</div>

<!-- Padding vertical responsivo -->
<div class="py-sm py-md-lg">
  padding-top/bottom: 8px (base)
  padding-top/bottom: 24px (md+)
</div>

<!-- Padding horizontal -->
<div class="px-sm px-lg-xl">
  padding-left/right: 8px (base)
  padding-left/right: 32px (lg+)
</div>
```

**Variantes:**
- `.p-{bp}-{size}` - Padding all sides
- `.pt-{bp}-{size}` - Padding top
- `.pb-{bp}-{size}` - Padding bottom
- `.pl-{bp}-{size}` - Padding left
- `.pr-{bp}-{size}` - Padding right
- `.px-{bp}-{size}` - Padding horizontal
- `.py-{bp}-{size}` - Padding vertical

**Tamaños:** `xs`, `sm`, `md`, `lg`, `xl`

---

### 2. MARGIN RESPONSIVO

**Clases:** `.m-{bp}-{size}`, `.mt-{bp}-{size}`, `.mb-{bp}-{size}`, etc.

```html
<!-- Margin base en móvil, diferente en tablet -->
<div class="m-sm m-md-md">
  margin: 8px (base)
  margin: 16px (md+)
</div>

<!-- Margin bottom responsivo (muy común) -->
<div class="mb-sm mb-md-lg mb-lg-xl">
  margin-bottom: 8px (base)
  margin-bottom: 24px (md+)
  margin-bottom: 32px (lg+)
</div>
```

**Variantes:**
- `.m-{bp}-{size}` - Margin all sides
- `.mt-{bp}-{size}` - Margin top
- `.mb-{bp}-{size}` - Margin bottom
- `.ml-{bp}-{size}` - Margin left
- `.mr-{bp}-{size}` - Margin right
- `.mx-{bp}-{size}` - Margin horizontal
- `.my-{bp}-{size}` - Margin vertical

---

### 3. GAP RESPONSIVO (Flexbox/Grid)

**Clases:** `.gap-{bp}-{size}`

```html
<!-- Gap pequeño en móvil, grande en desktop -->
<div class="flex gap-sm gap-md-lg gap-lg-xl">
  gap: 8px (base)
  gap: 24px (md+)
  gap: 32px (lg+)
</div>
```

---

### 4. DISPLAY RESPONSIVO

**Clases:** `.d-{bp}-{display}`

```html
<!-- Oculto en móvil, visible en tablet+ -->
<div class="d-none d-md-block">
  display: none (base)
  display: block (md+)
</div>

<!-- Flexbox en desktop, block en móvil -->
<nav class="d-block d-lg-flex">
  display: block (base)
  display: flex (lg+)
</nav>

<!-- Grid responsivo -->
<div class="d-grid d-lg-grid">
  display: grid (base)
  display: grid (lg+)
</div>
```

**Displays:** `none`, `block`, `inline`, `inline-block`, `flex`, `grid`, `table`, `table-cell`

---

### 5. GRID RESPONSIVO

**Clases:** `.grid-{bp}-{columns}`

```html
<!-- 1 columna móvil, 2 tablet, 3 desktop -->
<div class="grid gap-md grid-sm-1 grid-md-2 grid-lg-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Resultado -->
<!-- xs: 1 columna (por defecto) -->
<!-- md: 2 columnas (grid-md-2) -->
<!-- lg: 3 columnas (grid-lg-3) -->
```

**Columnas:** 1, 2, 3, 4

---

### 6. FLEXBOX RESPONSIVO

**Clases:** `.flex-{bp}-{direction}`, `.justify-{bp}-{value}`, `.items-{bp}-{value}`

```html
<!-- Column en móvil, row en desktop -->
<div class="flex flex-md-column flex-lg-row">
  flex-direction: row (base)
  flex-direction: column (md+)
  flex-direction: row (lg+)
</div>

<!-- Alineación responsive -->
<div class="flex justify-start items-start justify-lg-center items-lg-center">
  justify-content: flex-start (base)
  align-items: flex-start (base)
  justify-content: center (lg+)
  align-items: center (lg+)
</div>

<!-- Wrap en tablet+ -->
<div class="flex flex-md-wrap">
  flex-wrap: nowrap (base)
  flex-wrap: wrap (md+)
</div>
```

**Flex Direction:** `row`, `column`, `wrap`

**Justify Content:** `start`, `center`, `end`, `between`, `around`

**Align Items:** `start`, `center`, `end`, `stretch`

---

### 7. WIDTH RESPONSIVO

**Clases:** `.w-{bp}-{fraction}`

```html
<!-- 100% en móvil, 50% en tablet, 33% en desktop -->
<div class="w-full w-md-1-2 w-lg-1-3">
  width: 100% (base)
  width: 50% (md+)
  width: 33.333% (lg+)
</div>
```

**Fracciones:** `full`, `auto`, `1-2` (50%), `1-3`, `2-3`, `1-4`, `3-4`

---

### 8. HEIGHT RESPONSIVO

**Clases:** `.h-{bp}-{size}`

```html
<!-- Altura automática en móvil, pantalla completa en desktop -->
<div class="h-auto h-lg-screen">
  height: auto (base)
  height: 100vh (lg+)
</div>
```

**Sizes:** `full`, `auto`, `screen`

---

### 9. TEXT ALIGN RESPONSIVO

**Clases:** `.text-{bp}-{align}`

```html
<!-- Izquierda en móvil, centrado en desktop -->
<p class="text-left text-lg-center">
  text-align: left (base)
  text-align: center (lg+)
</p>
```

**Aligns:** `left`, `center`, `right`, `justify`

---

### 10. VISIBILITY RESPONSIVE

**Clases:** `.show-{bp}`, `.hide-{bp}`

```html
<!-- Oculto en móvil, visible en tablet+ -->
<div class="hide-xs hide-sm show-md">
  display: none (xs, sm)
  display: block (md+)
</div>

<!-- Visible en móvil, oculto en desktop -->
<button class="show-xs show-sm hide-md">
  display: block (xs, sm)
  display: none (md+)
</button>
```

---

## Ejemplos Prácticos

### Ejemplo 1: Card Responsiva

```html
<div class="p-sm p-md-md p-lg-lg border rounded">
  <!-- Base: padding pequeño -->
  <!-- md+: padding medio -->
  <!-- lg+: padding grande -->
  <h3 class="text-base text-md-lg text-lg-xl mb-sm mb-md-md">Título</h3>
  <p class="text-sm text-md-base">Descripción</p>
</div>
```

### Ejemplo 2: Grid Responsivo

```html
<div class="grid gap-md grid-sm-1 grid-md-2 grid-lg-3 grid-xl-4">
  <div class="p-md p-lg-lg">Item 1</div>
  <div class="p-md p-lg-lg">Item 2</div>
  <div class="p-md p-lg-lg">Item 3</div>
  <div class="p-md p-lg-lg">Item 4</div>
</div>

<!-- Resultado -->
<!-- xs: 1 columna -->
<!-- md: 2 columnas -->
<!-- lg: 3 columnas -->
<!-- xl: 4 columnas -->
```

### Ejemplo 3: Navbar Responsivo

```html
<nav class="flex flex-md-column flex-lg-row justify-md-start justify-lg-between items-lg-center p-sm p-lg-md gap-md gap-lg-lg">
  <div class="logo">Logo</div>
  <ul class="d-none d-lg-flex gap-md">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <button class="d-block d-lg-none">Menu</button>
</nav>

<!-- Resultado -->
<!-- xs-md: flex column, logo arriba, menú hamburguesa -->
<!-- lg+: flex row, logo izq, menú derecha -->
```

### Ejemplo 4: Container con Padding Responsivo

```html
<div class="p-sm p-md-md p-lg-lg p-xl-xl mx-auto">
  <!-- Base móvil: padding 8px -->
  <!-- md: padding 16px -->
  <!-- lg: padding 24px -->
  <!-- xl: padding 32px -->
  Contenido centrado con padding responsivo
</div>
```

### Ejemplo 5: Dashboard Layout

```html
<div class="flex flex-md-column flex-lg-row gap-md gap-lg-lg p-md p-lg-lg">
  <!-- Sidebar: 100% en móvil, 25% en desktop -->
  <aside class="w-full w-lg-1-4 p-md p-lg-lg">
    Sidebar
  </aside>
  
  <!-- Main: 100% en móvil, 75% en desktop -->
  <main class="w-full w-lg-3-4">
    <!-- Grid responsive -->
    <div class="grid gap-md grid-md-2 grid-lg-3">
      <div class="p-md p-lg-md">Card 1</div>
      <div class="p-md p-lg-md">Card 2</div>
      <div class="p-md p-lg-md">Card 3</div>
    </div>
  </main>
</div>
```

---

## Mejores Prácticas

### 1. Usar Mobile-First

```html
<!-- CORRECTO: Base móvil, mejora progresiva -->
<div class="grid-1 grid-md-2 grid-lg-3">
  ...
</div>

<!-- INCORRECTO: Empezar por desktop -->
<div class="grid-3 grid-md-2 grid-1">
  ...
</div>
```

### 2. No Combinar Demasiadas Clases

```html
<!-- CORRECTO: Limpio -->
<div class="p-md p-lg-lg gap-md gap-lg-lg">
  ...
</div>

<!-- INCORRECTO: Demasiadas clases -->
<div class="p-sm p-md-md p-lg-lg p-xl-xl gap-sm gap-md-md gap-lg-lg gap-xl-xl m-sm m-md-md m-lg-lg">
  ...
</div>
```

### 3. Combinar con CSS Custom Cuando Sea Necesario

```html
<!-- Utilities responsivas para layout básico -->
<div class="p-md p-lg-lg grid-md-2 grid-lg-3 gap-md gap-lg-lg">
  <!-- CSS custom para estilos específicos -->
</div>
```

### 4. Usar para Propiedades que Cambian

```html
<!-- SÍ: Propiedades que cambian por breakpoint -->
<div class="p-sm p-md-md gap-md gap-lg-lg">
  ...
</div>

<!-- NO: Propiedades que NO cambian -->
<!-- Usar CSS custom en su lugar -->
<div class="bg-dark text-white border-radius-lg">
  ...
</div>
```

---

## Referencia Rápida

| Utility | Breakpoints | Valores | Ejemplo |
|---------|------------|---------|---------|
| `.p-*` | xs-2xl | xs, sm, md, lg, xl | `.p-md-lg` |
| `.m-*` | xs-2xl | xs, sm, md, lg, xl | `.m-md-lg` |
| `.gap-*` | xs-2xl | xs, sm, md, lg, xl | `.gap-lg-xl` |
| `.d-*` | xs-2xl | none, block, flex, grid, etc. | `.d-md-flex` |
| `.grid-*` | xs-2xl | 1, 2, 3, 4 | `.grid-lg-3` |
| `.w-*` | xs-2xl | full, auto, 1-2, 1-3, 2-3, 1-4, 3-4 | `.w-md-1-2` |
| `.h-*` | xs-2xl | full, auto, screen | `.h-lg-screen` |
| `.text-*` | xs-2xl | left, center, right, justify | `.text-lg-center` |
| `.show-*` / `.hide-*` | xs-2xl | - | `.hide-xs` |

---

## Debugging

### Ver qué se generó

En DevTools:
1. Inspeccionar elemento
2. Ver clase aplicada: `.p-md-lg`
3. Buscar en CSS qué hace

```css
@media (min-width: 640px) {
  .p-md-lg {
    padding: 24px !important;
  }
}
```

### Validar en diferentes tamaños

```bash
# Tamaños a probar:
# - 360px (xs)
# - 480px (sm)
# - 640px (md) ← IMPORTANTE
# - 768px (lg)
# - 1024px (xl)
# - 1280px (2xl)
```

Chrome DevTools: Ctrl+Shift+M (Toggle device toolbar)

---

## CSS Generado (Referencia)

El sistema genera automáticamente:

```css
/* Base (sin breakpoint) */
.p-xs { padding: 4px !important; }
.p-sm { padding: 8px !important; }
.p-md { padding: 16px !important; }
.p-lg { padding: 24px !important; }

/* Responsive (sm+) */
@media (min-width: 480px) {
  .p-sm-xs { padding: 4px !important; }
  .p-sm-sm { padding: 8px !important; }
  .p-sm-md { padding: 16px !important; }
}

/* Responsive (md+) */
@media (min-width: 640px) {
  .p-md-xs { padding: 4px !important; }
  .p-md-sm { padding: 8px !important; }
  .p-md-md { padding: 16px !important; }
  .p-md-lg { padding: 24px !important; }
}

/* ... Y así para cada breakpoint */
```

---

## Performance

- **Total de clases generadas:** ~500+ combinaciones
- **Tamaño CSS:** ~15-20KB (comprimido)
- **Impacto:** Mínimo - clases que se usan solamente
- **Load time:** Sin impacto (CSS crítico cacheado)

---

## Próximos Pasos

1. Usar en componentes JSX
2. Refactor de estilos duplicados
3. Documentar patrones por componente
4. Testing en diferentes breakpoints

---

**Status:** Utilities responsivas completamente implementadas y listas para usar

