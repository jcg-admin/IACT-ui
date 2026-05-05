# Guía de Patrones SCSS para Páginas

## Principio fundamental

**Usar el design system primero.** Antes de escribir una clase nueva, verificar si
ya existe en `iact-kit` o en `_pages-shared.scss`. Solo crear SCSS específico para
lo que no existe en ningún lado.

---

## Las tres capas de estilos

```
iact-ui-kit (kit de componentes)
    └── iact-kit/components/button   → .btn, .btn-primary, .btn-secondary
    └── iact-kit/components/badge    → .badge, .badge-danger, .badge-warning, .badge-success
    └── iact-kit/components/card     → .card
    └── iact-kit/components/table    → .table
    └── iact-kit/components/alert    → .alert, .alert-danger, .alert-warning
    └── iact-kit/components/tabs     → .nav-tabs, .nav-link, .nav-link.active
    └── components/_pages-shared     → patrones de página comunes (ver abajo)

src/components/pages/MiPagina/
    └── MiPagina.scss                → solo layout específico de esa página
```

---

## Clases disponibles en `_pages-shared.scss`

| Clase | Uso |
|-------|-----|
| `.page-container` | Contenedor principal de página (padding 2rem, max-width 1400px) |
| `.page-header` | Cabecera de sección con `h1` y `.page-subtitle` |
| `.loading-state` | Spinner/texto de carga centrado |
| `.empty-state` | Mensaje de lista vacía |
| `.error-banner` | Banner de error (fondo rojo suave) |
| `.status-badge` | Pastilla de estado: `.status-active`, `.status-inactive`, `.status-failure`, `.status-pending` |
| `.count-badge` | Conteo rojo circular en títulos (ej: alertas no leídas) |
| `.search-bar` | Contenedor flex para input + botones de búsqueda |
| `.search-input` | Input de búsqueda dentro de `.search-bar` |

---

## Cuándo crear un SCSS de página propio

**SÍ** — Layout verdaderamente único de esa página:
- Un sistema de pestañas custom (`.tab-nav`, `.tab-btn`)
- Un contenedor con scroll horizontal (`overflow: auto`)
- Cards con decoración por tipo/severidad (border-left de color)
- Layouts de grid específicos (ej: avatar + datos en columnas)

**NO** — Ya existe en el sistema:
- `.btn`, `.btn-primary`, `.btn-secondary` → usar iact-kit
- `.badge`, `.badge-danger` → usar iact-kit
- `.table` → usar iact-kit
- `.page-header`, `.error-banner`, `.loading-state` → usar `_pages-shared.scss`

---

## Ejemplo correcto

```jsx
// ✅ CORRECTO: usa capas existentes, solo agrega lo específico
import './MiPagina.scss'

export default function MiPagina() {
  return (
    <div className="mi-pagina page-container">        {/* page-container de shared */}
      <header className="page-header">               {/* page-header de shared */}
        <h1>Mi Página</h1>
        <p className="page-subtitle">Descripción</p>
      </header>

      {error && <div className="error-banner">{error}</div>}  {/* shared */}
      {loading && <div className="loading-state">Cargando…</div>}

      <table className="table">                       {/* iact-kit */}
        ...
      </table>

      <span className="badge badge-danger">Error</span>       {/* iact-kit */}
      <span className="status-badge status-active">Activo</span>  {/* shared */}

      <button className="btn btn-primary">Guardar</button>    {/* iact-kit */}
    </div>
  )
}
```

```scss
// MiPagina.scss — solo lo que no existe en ningún lado
.mi-pagina {
  .panel-especial {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
  }
}
```

---

## Ejemplo incorrecto

```scss
// ❌ INCORRECTO: redefinir lo que ya existe
.mi-pagina {
  .btn-primary { background: #3b82f6; ... }   // ya en iact-kit
  .error-banner { background: #fef2f2; ... }  // ya en _pages-shared
  .loading-state { text-align: center; ... }  // ya en _pages-shared
}
```

---

## Uso de variables SCSS

**Las variables están disponibles en todos los SCSS sin importarlas.**
`webpack.config.js` inyecta `_variables.scss` mediante `sass-loader.additionalData`
usando `@use ... as *` (módulo Dart Sass moderno). No agregar `@import` ni `@use`
manuales en archivos de componente — ya están disponibles.

```scss
// ❌ INCORRECTO: valores hardcodeados
.mi-componente {
  color: #1f2937;
  padding: 2rem;
  border: 1px solid #374151;
}

// ❌ INCORRECTO: @import manual (innecesario, ya inyectado)
@import '../../styles/abstracts/variables';

// ✅ CORRECTO: variables disponibles directamente
.mi-componente {
  color: $secondary-color;
  padding: $spacing-lg;
  border: 1px solid $border-color;
}
```

### Variables de color (`src/styles/abstracts/_variables.scss`)

| Variable | Valor | Uso |
|----------|-------|-----|
| `$primary-color` | `#3B82F6` | Azul — botones, links, highlights |
| `$secondary-color` | `#1F2937` | Gris oscuro — texto principal |
| `$success-color` | `#10b981` | Verde — estados positivos |
| `$error-color` | `#ef4444` | Rojo — errores, peligro |
| `$warning-color` | `#f59e0b` | Ámbar — advertencias |
| `$info-color` | `#0ea5e9` | Cian — información |
| `$text-muted` | `#94a3b8` | Gris — texto secundario/placeholder |
| `$text-secondary` | `#cbd5e1` | Gris claro |
| `$border-color` | `#374151` | Bordes (`= $gray-700`) |
| `$dark-bg` | `#0f172a` | Fondo muy oscuro |

### Escala de grises (`$gray-*`)

| Variable | Valor | Equivalente Tailwind |
|----------|-------|----------------------|
| `$gray-50` | `#f9fafb` | gray-50 |
| `$gray-100` | `#f3f4f6` | gray-100 |
| `$gray-200` | `#e5e7eb` | gray-200 |
| `$gray-300` | `#d1d5db` | gray-300 |
| `$gray-400` | `#9ca3af` | gray-400 |
| `$gray-500` | `#6b7280` | gray-500 |
| `$gray-600` | `#4b5563` | gray-600 |
| `$gray-700` | `#374151` | gray-700 (`= $border-color`) |
| `$gray-900` | `#111827` | gray-900 (`= $surface-color`) |

### Variables de espaciado

| Variable | Valor |
|----------|-------|
| `$spacing-xs` | `4px` |
| `$spacing-sm` | `8px` |
| `$spacing-md` | `16px` |
| `$spacing-lg` | `24px` |
| `$spacing-xl` | `32px` |
| `$spacing-2xl` | `48px` |

### Funciones SCSS disponibles

```scss
background: rgba($error-color, 0.1);             // transparencia
border-left-color: darken($warning-color, 10%);  // más oscuro
color: lighten($primary-color, 12%);             // más claro
```

---

## Archivos de referencia

- Kit de componentes: `src/styles/iact-ui-kit.scss`
- Patrones compartidos: `src/styles/components/_pages-shared.scss`
- Variables de color: `src/styles/iact-kit/abstracts/variables/_colors.scss`
- Variables de spacing: `src/styles/iact-kit/abstracts/variables/_spacing.scss`
- Ejemplo aplicado: `src/components/pages/Alerts/AlertsPage.scss`
