# Utilities Responsivas IACT v4.0 - Bootstrap Compatible

## Refactor Completado

**Status:** ✅ Implementado siguiendo Bootstrap estándar + extensiones custom

Se eliminó la nomenclatura confusa `.p-md-lg` y se implementó Bootstrap-compatible:
```
❌ ANTES: .p-md-lg     (confuso - se repite "g")
✅ AHORA: .p-md-3      (claro - número = tamaño)
```

---

## Nomenclatura Bootstrap-Compatible

### Patrón General

```
.{property}{breakpoint-infix}-{size}

Ejemplos:
.p-0        (xs: 0px)
.p-1        (xs: 4px)
.p-md-3     (md+: 16px)
.p-lg-4     (lg+: 24px)
```

### Breakpoint-Infix

```
xs:  ""       → .p-0, .p-1, .p-2
sm:  "-sm"    → .p-sm-0, .p-sm-1, .p-sm-2
md:  "-md"    → .p-md-0, .p-md-1, .p-md-2
lg:  "-lg"    → .p-lg-0, .p-lg-1, .p-lg-2
xl:  "-xl"    → .p-xl-0, .p-xl-1, .p-xl-2
2xl: "-2xl"   → .p-2xl-0, .p-2xl-1, .p-2xl-2
```

---

## Mapeo de Números a Espacios

```
0 = 0px    (sin espaciado)
1 = 4px    (extra pequeño)
2 = 8px    (pequeño)
3 = 16px   (medio)
4 = 24px   (grande)
5 = 32px   (extra grande)
```

---

## 1. PADDING RESPONSIVO

**Sintaxis:** `.p{breakpoint-infix}-{size}`

```html
<!-- Base móvil: 4px, Tablet: 8px, Desktop: 16px -->
<div class="p-1 p-md-2 p-lg-3">
  Contenido con padding responsivo
</div>

<!-- Padding top responsivo -->
<div class="pt-1 pt-md-3 pt-lg-4">
  Contenido
</div>

<!-- Padding horizontal -->
<div class="px-2 px-md-3 px-lg-4">
  Contenido
</div>

<!-- Padding vertical -->
<div class="py-1 py-md-2 py-lg-3">
  Contenido
</div>
```

**Variantes:**
- `.p{infix}-{size}` - Padding all sides
- `.pt{infix}-{size}` - Padding top
- `.pb{infix}-{size}` - Padding bottom
- `.pl{infix}-{size}` - Padding left
- `.pr{infix}-{size}` - Padding right
- `.px{infix}-{size}` - Padding horizontal
- `.py{infix}-{size}` - Padding vertical

---

## 2. MARGIN RESPONSIVO

**Sintaxis:** `.m{breakpoint-infix}-{size}`

```html
<!-- Margin responsivo -->
<div class="m-1 m-md-2 m-lg-3">
  Contenido
</div>

<!-- Margin bottom responsivo (muy común) -->
<div class="mb-2 mb-md-3 mb-lg-4">
  Contenido
</div>

<!-- Auto margin (centrar) -->
<div class="mx-auto">
  Centrado horizontalmente
</div>

<!-- Margin con auto en breakpoint específico -->
<div class="m-1 mx-md-auto">
  Margen pequeño, centrado en md+
</div>
```

---

## 3. GAP RESPONSIVO (Flexbox/Grid)

**Sintaxis:** `.gap{breakpoint-infix}-{size}`

```html
<!-- Gap pequeño, grande en tablet -->
<div class="flex gap-1 gap-md-3 gap-lg-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- En grid -->
<div class="grid-md-2 gap-2 gap-lg-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## 4. DISPLAY RESPONSIVO

**Sintaxis:** `.d{breakpoint-infix}-{display}`

```html
<!-- Oculto en móvil, visible en tablet -->
<div class="d-none d-md-block">
  Visible solo en md+
</div>

<!-- Block en móvil, flex en desktop -->
<nav class="d-block d-lg-flex">
  <a href="#">Home</a>
  <a href="#">About</a>
</nav>

<!-- Flex en móvil, grid en desktop -->
<div class="d-flex d-lg-grid">
  Contenido
</div>
```

**Displays disponibles:**
- `.d{infix}-none` - display: none
- `.d{infix}-inline` - display: inline
- `.d{infix}-inline-block` - display: inline-block
- `.d{infix}-block` - display: block
- `.d{infix}-table` - display: table
- `.d{infix}-table-row` - display: table-row
- `.d{infix}-table-cell` - display: table-cell
- `.d{infix}-flex` - display: flex
- `.d{infix}-inline-flex` - display: inline-flex
- `.d{infix}-grid` - display: grid

---

## 5. FLEXBOX RESPONSIVO

**Sintaxis:** `.flex{infix}-{direction}`, `.justify{infix}-{value}`, `.align{infix}-{value}`

```html
<!-- Column en móvil, row en desktop -->
<div class="flex flex-md-column flex-lg-row gap-md-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Justify content responsivo -->
<div class="flex justify-start justify-lg-center">
  Izquierda en base, centrado en lg+
</div>

<!-- Align items responsivo -->
<div class="flex align-start align-lg-center">
  Arriba en base, centrado en lg+
</div>

<!-- Wrap responsivo -->
<div class="flex flex-nowrap flex-md-wrap gap-2">
  Items no envueltos, envueltos en md+
</div>
```

**Flex direction:**
- `.flex{infix}-row` - flex-direction: row
- `.flex{infix}-column` - flex-direction: column
- `.flex{infix}-wrap` - flex-wrap: wrap
- `.flex{infix}-nowrap` - flex-wrap: nowrap

**Justify content:**
- `.justify{infix}-start` - flex-start
- `.justify{infix}-end` - flex-end
- `.justify{infix}-center` - center
- `.justify{infix}-between` - space-between
- `.justify{infix}-around` - space-around

**Align items:**
- `.align{infix}-start` - flex-start
- `.align{infix}-end` - flex-end
- `.align{infix}-center` - center
- `.align{infix}-baseline` - baseline
- `.align{infix}-stretch` - stretch

---

## 6. TEXT ALIGN RESPONSIVO

**Sintaxis:** `.text{breakpoint-infix}-{align}`

```html
<!-- Izquierda en móvil, centrado en desktop -->
<h1 class="text-left text-lg-center">
  Título responsivo
</h1>

<!-- Justify en tablet+ -->
<p class="text-left text-md-justify">
  Párrafo justificado
</p>
```

---

## 7. VISIBILITY RESPONSIVA

**Sintaxis:** `.show{infix}`, `.hide{infix}`

```html
<!-- Mostrar solo en móvil -->
<button class="show-md hide-lg">
  Menú
</button>

<!-- Ocultar en móvil -->
<nav class="hide-xs hide-sm show-md">
  Navegación desktop
</nav>

<!-- Alternativa: usar display -->
<div class="d-none d-md-block">
  Equivalente a show-md
</div>
```

---

## 8. WIDTH RESPONSIVO (Custom - No Bootstrap)

**Sintaxis:** `.w{breakpoint-infix}-{percentage}`

```html
<!-- 100% en móvil, 50% en tablet, 25% en desktop -->
<div class="w-100 w-md-50 w-lg-25">
  Ancho responsivo
</div>

<!-- Usar en sidebar layout -->
<div class="flex gap-3">
  <aside class="w-100 w-lg-25">
    Sidebar 100% móvil, 25% desktop
  </aside>
  <main class="w-100 w-lg-75">
    Contenido 100% móvil, 75% desktop
  </main>
</div>
```

**Porcentajes disponibles:**
- `.w{infix}-0` - 0%
- `.w{infix}-25` - 25%
- `.w{infix}-50` - 50%
- `.w{infix}-75` - 75%
- `.w{infix}-100` - 100%
- `.w{infix}-auto` - auto

---

## 9. HEIGHT RESPONSIVO (Custom - No Bootstrap)

**Sintaxis:** `.h{breakpoint-infix}-{size}`

```html
<!-- Altura automática en móvil, pantalla completa en desktop -->
<div class="h-auto h-lg-screen">
  Hero section
</div>
```

**Sizes:**
- `.h{infix}-auto` - auto
- `.h{infix}-100` - 100%
- `.h{infix}-screen` - 100vh

---

## 10. GRID RESPONSIVO (Custom - No Bootstrap)

**Sintaxis:** `.grid{breakpoint-infix}-{columns}`

```html
<!-- 1 columna móvil, 2 tablet, 3 desktop -->
<div class="grid-1 grid-md-2 grid-lg-3 gap-2 gap-md-3 gap-lg-4">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
  <div>Card 4</div>
  <div>Card 5</div>
  <div>Card 6</div>
</div>

<!-- 2 columnas base, 4 en desktop -->
<div class="grid-2 grid-lg-4 gap-3">
  Items de grid
</div>
```

**Columnas:**
- `.grid{infix}-1` - 1 columna
- `.grid{infix}-2` - 2 columnas
- `.grid{infix}-3` - 3 columnas
- `.grid{infix}-4` - 4 columnas

---

## Ejemplos Completos

### Ejemplo 1: Card Layout Responsivo

```html
<div class="p-2 p-md-3 p-lg-4 rounded shadow">
  <h3 class="text-lg text-lg-xl mb-2 mb-md-3">Título</h3>
  <p class="text-sm text-md-base mb-3 mb-lg-4">
    Descripción del contenido
  </p>
  <button class="p-2 p-md-3">Acción</button>
</div>
```

### Ejemplo 2: Grid Responsive

```html
<div class="grid-1 grid-md-2 grid-lg-3 gap-2 gap-md-3 gap-lg-4">
  <div class="p-2 p-md-3 rounded bg-gray">
    Card 1
  </div>
  <div class="p-2 p-md-3 rounded bg-gray">
    Card 2
  </div>
  <div class="p-2 p-md-3 rounded bg-gray">
    Card 3
  </div>
</div>
```

### Ejemplo 3: Navbar Responsive

```html
<nav class="flex flex-column flex-md-row justify-md-between align-md-center 
           p-2 p-md-3 gap-2 gap-md-3">
  <div class="logo">LOGO</div>
  <ul class="d-none d-md-flex gap-3">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <button class="d-block d-md-none">Menu</button>
</nav>
```

### Ejemplo 4: Dashboard Layout

```html
<div class="flex flex-column flex-lg-row gap-2 gap-lg-4 p-2 p-lg-4">
  <!-- Sidebar -->
  <aside class="w-100 w-lg-25 p-2 p-lg-3">
    Sidebar
  </aside>
  
  <!-- Main -->
  <main class="w-100 w-lg-75">
    <!-- Grid de stats -->
    <div class="grid-1 grid-md-2 grid-lg-4 gap-2 gap-md-3 mb-3 mb-md-4">
      <div class="p-2 p-md-3 rounded">Stat 1</div>
      <div class="p-2 p-md-3 rounded">Stat 2</div>
      <div class="p-2 p-md-3 rounded">Stat 3</div>
      <div class="p-2 p-md-3 rounded">Stat 4</div>
    </div>
    
    <!-- Content -->
    <div class="p-2 p-md-3 p-lg-4 rounded">
      Contenido principal
    </div>
  </main>
</div>
```

---

## Mejores Prácticas

### 1. Mobile-First (RECOMENDADO)

```html
<!-- CORRECTO: Empezar por móvil -->
<div class="p-1 p-md-2 p-lg-3">
  Padding pequeño, aumenta en breakpoints
</div>

<!-- INCORRECTO: Empezar por desktop -->
<div class="p-3 p-md-2 p-lg-1">
  Confuso, decrece (no mobile-first)
</div>
```

### 2. No Mezclar Nombres con Números

```html
<!-- CORRECTO: Consistente -->
<div class="p-2 p-md-3 p-lg-4">
  Todo números
</div>

<!-- INCORRECTO: Mezcla -->
<div class="p-md p-lg-3">
  Inconsistente - NO MIX de nombres y números
</div>
```

### 3. Ser Específico con Infix

```html
<!-- CORRECTO: Claro qué breakpoint es -->
<div class="p-1 p-md-2 p-lg-3 p-xl-4">
  Cada breakpoint explícito
</div>

<!-- Aceptable: Saltarse breakpoints -->
<div class="p-1 p-lg-3">
  Saltó sm y md, ok si es intencional
</div>
```

---

## Referencia Rápida

| Clase | Base xs | sm | md | lg | xl | 2xl |
|-------|---------|----|----|----|----|-----|
| `.p-1` | 4px | - | - | - | - | - |
| `.p-sm-1` | - | 4px | - | - | - | - |
| `.p-md-2` | - | - | 8px | - | - | - |
| `.p-lg-3` | - | - | - | 16px | - | - |
| `.d-md-flex` | - | - | flex | flex | flex | flex |
| `.grid-md-2` | - | - | 2 cols | 2 cols | 2 cols | 2 cols |

---

## Debugging

**Ver qué espaciado tiene una clase:**

```scss
.p-md-3 = padding: 16px en md+ (640px+)
// Encuentra en CSS:
@media (min-width: 640px) {
  .p-md-3 { padding: 16px !important; }
}
```

**DevTools:**
1. Inspecciona elemento
2. Busca la clase `.p-md-3`
3. Ve en Computed qué valor tiene

---

## Status

✅ Utilities responsivas Bootstrap-compatible
✅ Sin nombres confusos (eliminado `.p-md-lg`)
✅ Nomenclatura estándar (números 0-5)
✅ Extensiones custom (width, height, grid)
✅ Compilación exitosa
✅ Documentación completa

---

**IACT v4.0 sigue Bootstrap estándar + extensiones custom necesarias**

