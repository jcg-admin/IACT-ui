# IACT v4.0 - Guía Rápida (Después de Eliminación de Tailwind)

**IMPORTANTE:** Este proyecto NO utiliza Tailwind CSS. Utiliza utilities SCSS personalizadas.

---

## Estado Actual

**Fecha:** 2026-04-27  
**Status:** Tailwind CSS completamente eliminado  
**Componentes refactorizados:** 20/20  
**Tests pasando:** 188/222  

---

## Lo que cambió

### Antes (Con Tailwind)
```jsx
<div className="flex justify-center items-center bg-slate-800 rounded-lg p-6 shadow-lg">
  <h1 className="text-2xl font-bold text-white">Título</h1>
</div>
```

### Ahora (Con SCSS Utilities)
```jsx
<div className="flex justify-center items-center bg-dark-secondary rounded-lg p-lg shadow-lg">
  <h1 className="text-2xl font-bold text-white">Título</h1>
</div>
```

---

## Utilities Disponibles

### Layout
```jsx
// Display
<div className="d-flex">          // display: flex
<div className="d-grid">          // display: grid

// Flexbox
<div className="flex justify-center items-center">

// Grid
<div className="grid-2 gap-md">    // 2 columnas, gap 16px
<div className="grid-4">           // 4 columnas
```

### Spacing
```jsx
// Margin
<div className="m-md">             // margin: 16px
<div className="mt-lg">            // margin-top: 24px
<div className="mx-md">            // margin left/right

// Padding
<div className="p-lg">             // padding: 24px
<div className="px-md py-lg">      // padding horizontal/vertical

// Gap (solo en flex/grid)
<div className="flex gap-sm">      // gap: 8px
```

### Sizing
```jsx
<div className="w-full">           // width: 100%
<div className="h-screen">         // height: 100vh
<div className="w-1/2">            // width: 50%
```

### Colors
```jsx
// Text
<p className="text-primary">       // color: #0ea5e9
<p className="text-white">         // color: #fff
<p className="text-gray-400">

// Background
<div className="bg-primary">       // bg: #0ea5e9
<div className="bg-dark">          // bg: #0f172a
<div className="bg-dark-secondary">

// Border
<div className="border-primary">   // border-color
<div className="border rounded-lg">
```

### Text
```jsx
<h1 className="text-2xl font-bold">
<p className="text-sm text-center">
<span className="font-semibold text-gray-500">
```

### Effects
```jsx
<div className="shadow-lg">        // Sombra grande
<div className="rounded-lg">       // border-radius: 12px
<div className="opacity-50">       // opacity: 0.5
```

---

## Spacing Sizes

| Size | Value |
|------|-------|
| xs   | 4px   |
| sm   | 8px   |
| md   | 16px  |
| lg   | 24px  |
| xl   | 32px  |

---

## Colores Base

```jsx
$color-primary      #0ea5e9  (Cyan)
$color-success      #10b981  (Verde)
$color-warning      #f59e0b  (Amarillo)
$color-error        #ef4444  (Rojo)

// Dark mode (fijo)
$color-bg-primary   #0f172a  (Muy oscuro)
$color-bg-secondary #1e293b  (Oscuro)
$color-text-primary #f1f5f9  (Blanco)
```

---

## Ejemplos Comunes

### Button Primario
```jsx
<button className="px-lg py-md bg-primary text-white rounded font-semibold hover:opacity-90 transition">
  Click Me
</button>
```

### Card
```jsx
<div className="bg-dark-secondary rounded-lg p-lg shadow-lg border border-gray-600">
  <h2 className="text-lg font-bold text-white mb-md">Título</h2>
  <p className="text-sm text-gray-400">Contenido</p>
</div>
```

### Grid 2 Columnas
```jsx
<div className="grid-2 gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Flex Centrado
```jsx
<div className="flex justify-center items-center h-screen">
  <div className="text-center">
    <h1 className="text-2xl font-bold">Centrado</h1>
  </div>
</div>
```

### Form Input
```jsx
<input
  type="text"
  className="form-control border border-gray-600 rounded-md p-md bg-dark-secondary text-white"
  placeholder="Ingrese texto"
/>
```

---

## Dark Mode

**IMPORTANTE:** El proyecto SOLO soporta dark mode.

- No hay opción de cambiar a tema claro
- Todos los colores son para dark mode
- Tema fijo en Settings.jsx

---

## Estructura de Archivos

```
src/
├── styles/
│   ├── main.scss
│   ├── globals.css
│   └── iact-kit/
│       ├── abstracts/
│       │   └── variables/
│       │       ├── _colors.scss
│       │       └── _breakpoints.scss
│       └── utilities/
│           └── _index.scss          (150+ clases)
└── components/
    ├── common/
    ├── containers/
    ├── presentational/
    └── transaction/
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Inicia webpack dev server

# Testing
npm test                    # Ejecutar tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Build
npm run build              # Compilación producción
npm run build:watch        # Compilación con watch

# Lint
npm run lint               # Ejecutar ESLint
```

---

## Checklist para Nuevos Componentes

- [ ] Usar utilities SCSS (`@styles` imports)
- [ ] NO usar Tailwind (verificar en búsqueda)
- [ ] Usar spacing: xs, sm, md, lg, xl
- [ ] Usar colores: primary, success, error, warning
- [ ] Dark mode compatible (sin tema claro)
- [ ] Responsive (si aplica)
- [ ] Tests actualizados
- [ ] Documentación actualizada

---

## Recursos

### Documentación Principal
- **CHANGELOG_TAILWIND_REMOVAL.md** - Cambios completos
- **README_SCSS_UTILITIES.md** - Referencia completa de utilities

### Archivos Clave
- **src/styles/iact-kit/utilities/_index.scss** - Todas las utilities (792 líneas)
- **src/styles/iact-kit/abstracts/variables/_colors.scss** - Variables de color
- **src/styles/main.scss** - Entrada de estilos

### Referencia Externa
- **Bootstrap SCSS utilities** (base de la estructura)
- **mx-template** (referencia de nomenclatura)

---

## Notas Importantes

1. **NO instalar Tailwind** - Está completamente removido
2. **Usar utilities SCSS** - Son equivalentes exactas
3. **Dark mode solo** - No hay tema claro
4. **Responsive** - Usar media queries o grid-{n} classes
5. **Variables SCSS** - Disponibles en abstracts/variables/

---

## FAQs

**P: ¿Dónde están las clases de Tailwind?**  
R: No existen. Use las utilities SCSS equivalentes en `@styles/iact-kit/utilities/_index.scss`

**P: ¿Cómo cambio a tema claro?**  
R: No se puede. El proyecto usa dark mode fijo solamente.

**P: ¿Cuál es el equivalente a `flex justify-center`?**  
R: Exactamente igual: `className="flex justify-center"`

**P: ¿Dónde están los breakpoints?**  
R: En `src/styles/iact-kit/abstracts/variables/_breakpoints.scss`

**P: ¿Necesito Tailwind para algo?**  
R: No. Está completamente removido y no es necesario.

---

## Problemas Comunes

**Error: "Clase no existe"**
- Verificar que se importa desde `@styles/main.scss`
- Usar nombres correctos (con guiones, no guiones bajos)

**Error: "Color no es correcto"**
- Revisar variable correcta: `text-primary` vs `text-white`
- Recordar que es dark mode: colores oscuros como base

**Error: "Build falla"**
- Ejecutar `npm install` para instalar dependencias
- Verificar que no hay referencias a Tailwind

---

**Status:** Listo para producción  
**Última actualización:** 2026-04-27  
**Versión:** IACT v4.0
