# Table Component

Componente de tabla reutilizable con funcionalidades avanzadas.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | Array | Yes | - | Array de definiciones de columnas |
| `data` | Array | Yes | - | Array de datos a mostrar |
| `onRowClick` | Function | No | - | Callback cuando se hace click en fila |
| `onActionClick` | Function | No | - | Callback para botón de acciones |
| `loading` | Boolean | No | false | Mostrar loading state |
| `selectable` | Boolean | No | false | Habilitar checkboxes |
| `sortable` | Boolean | No | true | Habilitar ordenamiento |

## Column Definition

```javascript
{
  key: 'email',           // Clave del objeto de datos
  label: 'Email',         // Etiqueta mostrada en header
  width: '200px',         // Ancho opcional
  render: (value, row) => <span>{value}</span> // Renderizado personalizado opcional
}
```

## Ejemplo de Uso

```javascript
<Table
  columns={[
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Estado', render: (value) => <Badge>{value}</Badge> }
  ]}
  data={users}
  selectable={true}
  onRowClick={(row) => console.log(row)}
  onActionClick={(row) => handleEdit(row)}
/>
```

## Features

- Ordenamiento por columna (click en header)
- Selección de filas (checkboxes)
- Seleccionar todo (checkbox en header)
- Estados de carga y vacío
- Responsive en mobile (se convierte en cards)
- Renderizado personalizado de columnas
- Optimización con useMemo

## Styling

La tabla usa clases CSS prefijadas con `.table-`:

- `.table-container` - Contenedor
- `.table` - Tabla principal
- `.table-header` - Header de tabla
- `.table-row` - Fila
- `.table-cell` - Celda
- `.table-checkbox` - Checkbox
- `.table-loading` - Estado de carga
- `.table-empty` - Estado vacío

