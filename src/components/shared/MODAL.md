# Modal Component

Componente modal reutilizable con soporte para tamaños customizables.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | Boolean | Yes | - | Controla si el modal está abierto |
| `onClose` | Function | Yes | - | Callback cuando se cierra el modal |
| `title` | String | Yes | - | Título del modal |
| `children` | Node | Yes | - | Contenido del modal |
| `footer` | Node | No | - | Contenido del footer |
| `size` | String | No | 'md' | Tamaño: 'sm' (400px), 'md' (600px), 'lg' (800px) |
| `closeOnEscape` | Boolean | No | true | Cerrar con tecla Escape |
| `closeOnBackdrop` | Boolean | No | true | Cerrar al hacer click en backdrop |

## Ejemplo de Uso

```javascript
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

- 3 tamaños predefinidos (sm, md, lg)
- Cierre con Escape key
- Cierre al hacer click en backdrop
- Botón cerrar (X) en header
- Header personalizable
- Footer personalizable
- Animaciones suaves
- Responsive en mobile

## Styling

- `.modal-overlay` - Fondo oscuro semitransparente
- `.modal` - Contenedor principal
- `.modal--sm/md/lg` - Variantes de tamaño
- `.modal-header` - Header del modal
- `.modal-title` - Título
- `.modal-close` - Botón cerrar
- `.modal-content` - Contenido principal
- `.modal-footer` - Footer con acciones

