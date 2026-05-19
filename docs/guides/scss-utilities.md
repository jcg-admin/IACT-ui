# IACT UI Kit - Utilities SCSS

Guía de referencia para las utilities SCSS personalizadas de IACT v4.0.

**Nota:** Este proyecto NO utiliza Tailwind CSS. Utiliza utilities SCSS puro basadas en mx-template.

---

## Ubicación

```
src/styles/iact-kit/utilities/_index.scss
```

**Estadísticas:**
- 792 líneas de código
- 150+ clases de utilities
- 100% compatible con IACT v4.0

---

## Categorías de Utilities

### 1. Display Utilities

```scss
.d-none              { display: none !important; }
.d-inline            { display: inline !important; }
.d-inline-block      { display: inline-block !important; }
.d-block             { display: block !important; }
.d-table             { display: table !important; }
.d-table-cell        { display: table-cell !important; }
.d-flex              { display: flex !important; }
.d-grid              { display: grid !important; }
```

### 2. Flexbox Utilities

```scss
/* Dirección */
.flex-row            { flex-direction: row !important; }
.flex-column         { flex-direction: column !important; }
.flex-wrap           { flex-wrap: wrap !important; }

/* Alineación */
.justify-start       { justify-content: flex-start !important; }
.justify-center      { justify-content: center !important; }
.justify-end         { justify-content: flex-end !important; }
.justify-between     { justify-content: space-between !important; }
.justify-around      { justify-content: space-around !important; }

.items-start         { align-items: flex-start !important; }
.items-center        { align-items: center !important; }
.items-end           { align-items: flex-end !important; }
.items-stretch       { align-items: stretch !important; }
```

### 3. Grid Utilities

```scss
/* Grid predefinidos responsivos */
.grid-1              { display: grid; grid-template-columns: repeat(1, 1fr); }
.grid-2              { display: grid; grid-template-columns: repeat(2, 1fr); }
.grid-3              { display: grid; grid-template-columns: repeat(3, 1fr); }
.grid-4              { display: grid; grid-template-columns: repeat(4, 1fr); }
```

### 4. Gap Utilities (Espaciado entre items)

```scss
.gap-xs              { gap: 4px !important; }
.gap-sm              { gap: 8px !important; }
.gap-md              { gap: 16px !important; }
.gap-lg              { gap: 24px !important; }
.gap-xl              { gap: 32px !important; }
```

### 5. Margin Utilities

```scss
/* Margin en todas direcciones */
.m-0                 { margin: 0 !important; }
.m-xs                { margin: 4px !important; }
.m-sm                { margin: 8px !important; }
.m-md                { margin: 16px !important; }
.m-lg                { margin: 24px !important; }
.m-xl                { margin: 32px !important; }

/* Margin individual - ejemplos */
.mt-sm               { margin-top: 8px !important; }
.mb-lg               { margin-bottom: 24px !important; }
.ml-md               { margin-left: 16px !important; }
.mr-xl               { margin-right: 32px !important; }

/* Margin horizontal/vertical */
.mx-md               { margin-left: 16px; margin-right: 16px; }
.my-lg               { margin-top: 24px; margin-bottom: 24px; }
```

### 6. Padding Utilities

```scss
/* Padding en todas direcciones */
.p-0                 { padding: 0 !important; }
.p-xs                { padding: 4px !important; }
.p-sm                { padding: 8px !important; }
.p-md                { padding: 16px !important; }
.p-lg                { padding: 24px !important; }
.p-xl                { padding: 32px !important; }

/* Padding individual */
.pt-md               { padding-top: 16px !important; }
.pb-lg               { padding-bottom: 24px !important; }

/* Padding horizontal/vertical */
.px-md               { padding-left: 16px; padding-right: 16px; }
.py-lg               { padding-top: 24px; padding-bottom: 24px; }
```

### 7. Sizing Utilities

```scss
/* Width */
.w-full              { width: 100% !important; }
.w-screen            { width: 100vw !important; }
.w-auto              { width: auto !important; }
.w-1/2               { width: 50% !important; }
.w-1/3               { width: 33.333% !important; }
.w-2/3               { width: 66.666% !important; }

/* Height */
.h-full              { height: 100% !important; }
.h-screen            { height: 100vh !important; }
.h-auto              { height: auto !important; }

/* Min/Max */
.min-h-screen        { min-height: 100vh !important; }
.max-w-full          { max-width: 100% !important; }
```

### 8. Border Utilities

```scss
/* Border width */
.border-0            { border-width: 0 !important; }
.border              { border-width: 1px !important; }
.border-2            { border-width: 2px !important; }

/* Border color - ejemplos */
.border-primary      { border-color: $color-primary !important; }
.border-error        { border-color: $color-error !important; }
.border-success      { border-color: $color-success !important; }

/* Border radius */
.rounded-0           { border-radius: 0 !important; }
.rounded             { border-radius: 4px !important; }
.rounded-md          { border-radius: 8px !important; }
.rounded-lg          { border-radius: 12px !important; }
.rounded-full        { border-radius: 9999px !important; }
```

### 9. Text Utilities

```scss
/* Text size */
.text-xs             { font-size: 12px !important; }
.text-sm             { font-size: 14px !important; }
.text-base           { font-size: 16px !important; }
.text-lg             { font-size: 18px !important; }
.text-xl             { font-size: 20px !important; }
.text-2xl            { font-size: 24px !important; }

/* Font weight */
.font-normal         { font-weight: 400 !important; }
.font-medium         { font-weight: 500 !important; }
.font-semibold       { font-weight: 600 !important; }
.font-bold           { font-weight: 700 !important; }

/* Text alignment */
.text-left           { text-align: left !important; }
.text-center         { text-align: center !important; }
.text-right          { text-align: right !important; }
.text-justify        { text-align: justify !important; }

/* Text color - ejemplos */
.text-primary        { color: $color-primary !important; }
.text-white          { color: #fff !important; }
.text-gray-500       { color: #9ca3b8 !important; }
```

### 10. Background Utilities

```scss
/* Background color - ejemplos */
.bg-primary          { background-color: $color-primary !important; }
.bg-secondary        { background-color: $color-text-secondary !important; }
.bg-success          { background-color: $color-success !important; }
.bg-error            { background-color: $color-error !important; }
.bg-warning          { background-color: $color-warning !important; }

/* Background presets oscuro */
.bg-dark             { background-color: #0f172a !important; }
.bg-dark-secondary   { background-color: #1e293b !important; }
.bg-dark-tertiary    { background-color: #334155 !important; }
```

### 11. Shadow Utilities

```scss
.shadow-none         { box-shadow: none !important; }
.shadow-sm           { box-shadow: 0 2px 1px -1px rgba(0,0,0,0.2), ... !important; }
.shadow              { box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), ... !important; }
.shadow-md           { box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), ... !important; }
.shadow-lg           { box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), ... !important; }
.shadow-xl           { box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), ... !important; }
.shadow-2xl          { box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), ... !important; }
```

### 12. Opacity Utilities

```scss
.opacity-0           { opacity: 0 !important; }
.opacity-25          { opacity: 0.25 !important; }
.opacity-50          { opacity: 0.5 !important; }
.opacity-75          { opacity: 0.75 !important; }
.opacity-100         { opacity: 1 !important; }
```

### 13. Overflow Utilities

```scss
.overflow-hidden     { overflow: hidden !important; }
.overflow-visible    { overflow: visible !important; }
.overflow-auto       { overflow: auto !important; }
.overflow-scroll     { overflow: scroll !important; }

.overflow-x-auto     { overflow-x: auto !important; }
.overflow-y-auto     { overflow-y: auto !important; }
```

### 14. Cursor Utilities

```scss
.cursor-auto         { cursor: auto !important; }
.cursor-default      { cursor: default !important; }
.cursor-pointer      { cursor: pointer !important; }
.cursor-wait         { cursor: wait !important; }
.cursor-not-allowed  { cursor: not-allowed !important; }
```

### 15. Transition & Transform Utilities

```scss
.transition          { transition: all 0.3s ease !important; }
.transition-fast     { transition: all 0.15s ease !important; }
.transition-slow     { transition: all 0.5s ease !important; }

.scale-95            { transform: scale(0.95) !important; }
.scale-100           { transform: scale(1) !important; }
.scale-110           { transform: scale(1.1) !important; }
```

### 16. Position & Z-Index Utilities

```scss
.static              { position: static !important; }
.relative            { position: relative !important; }
.absolute            { position: absolute !important; }
.fixed               { position: fixed !important; }
.sticky              { position: sticky !important; }

.z-0                 { z-index: 0 !important; }
.z-10                { z-index: 10 !important; }
.z-20                { z-index: 20 !important; }
.z-40                { z-index: 40 !important; }
```

### 17. Visibility Utilities

```scss
.visible             { visibility: visible !important; }
.invisible           { visibility: hidden !important; }
```

---

## Ejemplos de Uso

### Ejemplo 1: Layout Flex Centrado

```jsx
<div className="flex justify-center items-center h-screen">
  <div className="p-lg">
    <h1 className="text-2xl font-bold text-white">Centrado</h1>
  </div>
</div>
```

### Ejemplo 2: Grid Responsivo

```jsx
<div className="grid-2 gap-md mb-lg">
  <div className="p-md border rounded-lg">Item 1</div>
  <div className="p-md border rounded-lg">Item 2</div>
</div>
```

### Ejemplo 3: Card con Shadow

```jsx
<div className="bg-dark-secondary rounded-lg p-lg shadow-lg">
  <h2 className="text-lg font-semibold text-white mb-md">Título</h2>
  <p className="text-sm text-gray-400">Contenido de la card</p>
</div>
```

### Ejemplo 4: Button Primario

```jsx
<button className="px-lg py-md bg-primary text-white rounded font-semibold hover:opacity-90 transition">
  Click Me
</button>
```

---

## Variables SCSS Disponibles

### Colores

```scss
$color-primary: #0ea5e9;
$color-primary-dark: #0284c7;
$color-primary-light: #38bdf8;

$color-bg-primary: #0f172a;
$color-bg-secondary: #1e293b;
$color-bg-tertiary: #334155;

$color-text-primary: #f1f5f9;
$color-text-secondary: #cbd5e1;
$color-text-tertiary: #94a3b8;

$color-success: #10b981;
$color-warning: #f59e0b;
$color-error: #ef4444;
$color-info: #0ea5e9;

$color-border: #1f2937;
$color-border-light: #334155;
```

### Spacing (Valores)

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

### Breakpoints

```scss
$breakpoint-xs: 320px;
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

---

## Responsive Design

**Nota:** Las utilities generadas son para mobile-first. Para responsive, use media queries directamente o use clases específicas.

### Ejemplo de Media Query

```scss
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
}
```

---

## Dark Mode

**Status:** ✅ Dark mode FIJO (obligatorio)

Todas las variables de color están configuradas para dark mode. No hay modo claro.

**Colores base en Dark Mode:**
- Background primario: #0f172a
- Text primario: #f1f5f9
- Primario: #0ea5e9 (cyan)

---

## Comparación: Tailwind vs SCSS Utilities

| Aspecto | Tailwind (Antes) | SCSS Utilities (Ahora) |
|---------|------------------|------------------------|
| Clases | `flex justify-center items-center` | `flex justify-center items-center` |
| Tamaño bundle | ~50KB | ~5KB |
| Configuración | tailwind.config.js | variables.scss |
| Customización | Limitada | Completa |
| Performance | Compilación lenta | Compilación rápida |

---

## Troubleshooting

### Problema: Clase no funciona

**Solución:** Verificar que:
1. La clase se importa desde `@styles/main.scss`
2. No hay conflicto con CSS específico
3. Usar `!important` si es necesario (ya incluido en utilities)

### Problema: Espacios no funcionan correctamente

**Solución:** Usar nombres con guiones:
- Correcto: `.m-md`, `.p-lg`, `.gap-sm`
- Incorrecto: `.m_md`, `.p_lg`, `.gap_sm`

### Problema: Color no es el esperado

**Solución:** Verificar que se está usando variable correcta:
- `.text-primary` = `$color-primary`
- `.bg-secondary` = `$color-text-secondary`

---

## Jerarquía de Importancia

1. Inline styles (máxima prioridad)
2. Utilities SCSS con `!important`
3. Component SCSS
4. Base styles
5. Browser defaults (mínima prioridad)

---

## Performance Tips

1. Use utilities directamente en JSX (no cree clases nuevas si existe utility)
2. Combine utilities en lugar de crear CSS custom
3. Evite duplicar código SCSS
4. Use `@extend` en SCSS para reutilizar utilities

---

## Referencias

- **Archivo:** `src/styles/iact-kit/utilities/_index.scss` (792 líneas)
- **Variables:** `src/styles/iact-kit/abstracts/variables/`
- **Breakpoints:** `src/styles/iact-kit/abstracts/variables/_breakpoints.scss`
- **Mixins:** `src/styles/iact-kit/abstracts/mixins/`

---

**Versión:** 1.0
**Última actualización:** 2026-04-27
**Status:** Producción
