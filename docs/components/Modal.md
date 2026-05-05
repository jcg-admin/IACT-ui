# Modal Component

## Overview
Modal reutilizable con soporte para tamaños personalizables y acciones.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | Boolean | Required | Controla visibilidad |
| `onClose` | Function | Required | Callback para cerrar |
| `title` | String | Required | Título del modal |
| `children` | ReactNode | Required | Contenido |
| `footer` | ReactNode | - | Footer con acciones |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Tamaño del modal |
| `closeOnEscape` | Boolean | true | Cerrar con Escape |
| `closeOnBackdrop` | Boolean | true | Cerrar al hacer click afuera |

## Sizes

- **sm**: 400px (formularios pequeños)
- **md**: 600px (contenido normal)
- **lg**: 800px (contenido extenso)

## Usage

```jsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Crear Usuario"
  size="md"
  footer={
    <>
      <button onClick={() => setIsOpen(false)}>Cancelar</button>
      <button onClick={handleSave}>Guardar</button>
    </>
  }
>
  <form>
    <input type="text" placeholder="Nombre" />
  </form>
</Modal>
```

## Features

- ✓ Cierre con Escape key
- ✓ Cierre al hacer click en backdrop
- ✓ Botón cerrar (X) en header
- ✓ Header y footer personalizables
- ✓ Animaciones suaves
- ✓ Responsive en mobile

## Styling Classes

- `.modal-overlay` - Fondo semitransparente
- `.modal` - Contenedor principal
- `.modal--sm/md/lg` - Variantes de tamaño
- `.modal-header` - Header
- `.modal-content` - Contenido
- `.modal-footer` - Footer
