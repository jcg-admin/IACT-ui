# Table Component

## Overview
Tabla reutilizable y responsive con soporte para ordenamiento, selección y renderizado personalizado.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | Array<Column> | Required | Definiciones de columnas |
| `data` | Array<Object> | Required | Datos a mostrar |
| `onRowClick` | Function | - | Callback al hacer click en fila |
| `onActionClick` | Function | - | Callback para botón de acciones |
| `loading` | Boolean | false | Estado de carga |
| `selectable` | Boolean | false | Mostrar checkboxes |
| `sortable` | Boolean | true | Habilitar ordenamiento |

## Column Definition

```typescript
interface Column {
  key: string              // Clave del objeto
  label: string            // Etiqueta en header
  width?: string          // Ancho opcional
  render?: (value, row) => ReactNode  // Renderizado custom
}
```

## Usage

```jsx
<Table
  columns={[
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email', width: '200px' },
    { 
      key: 'status', 
      label: 'Estado',
      render: (value) => <Badge>{value}</Badge>
    }
  ]}
  data={users}
  selectable={true}
  sortable={true}
  onRowClick={(row) => console.log(row)}
  onActionClick={(row) => handleEdit(row)}
/>
```

## Features

- ✓ Ordenamiento por columna (click en header)
- ✓ Selección de filas múltiples
- ✓ Renderizado personalizado por columna
- ✓ Estados de carga y vacío
- ✓ Responsive en mobile (cards layout)
- ✓ Optimización con useMemo

## Responsive Behavior

- **Desktop (>640px)**: Layout tabular tradicional
- **Mobile (<640px)**: Transforma a cards con data labels

## Styling Classes

- `.table-container` - Contenedor
- `.table` - Tabla
- `.table-header` - Header
- `.table-row` - Fila
- `.table-cell` - Celda
- `.table-loading` - Estado carga
- `.table-empty` - Estado vacío
