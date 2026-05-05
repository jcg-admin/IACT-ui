# DateTimeInputs Components - IACT v4.0

## Descripción

Componentes React modernos para manejo de fechas, horas y selectores en IACT v4.0.

Reemplaza:
- ❌ bootstrap-datetimepicker
- ❌ bootstrap-selectpicker
- ✅ Por componentes React nativos con dark mode integrado

## Instalación

### 1. Instalar dependencias npm

```bash
npm install react-date-picker react-select react-datepicker moment
```

### 2. Verificar que los archivos estén en lugar correcto

```
src/
├── components/
│   └── DateTimeInputs/
│       ├── DateTimeInput.jsx
│       ├── DateTimeInput.scss
│       ├── SelectDropdown.jsx
│       └── SelectDropdown.scss
├── redux/
│   └── slices/
│       └── formSlice.js
└── ...
```

### 3. Configurar Redux store

En `redux/store.js`, agregar el formSlice:

```javascript
import { configureStore } from '@reduxjs/toolkit';

// ... otros slices
import formReducer from './slices/formSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    access: accessReducer,
    alerts: alertsReducer,
    audit: auditReducer,
    form: formReducer,  // AGREGAR ESTA LÍNEA
  },
});
```

## Uso

### DateTimeInput (Fecha y/o Hora)

```jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DateTimeInput from '../components/DateTimeInputs/DateTimeInput';
import { setDateStart } from '../redux/slices/formSlice';

function MyComponent() {
  const [dateStart, setDateStart] = useState(null);
  const dispatch = useDispatch();

  const handleDateChange = (date) => {
    setDateStart(date);
    dispatch(setDateStart(date));
  };

  return (
    <DateTimeInput
      type="date"
      label="Desde:"
      value={dateStart}
      onChange={handleDateChange}
      placeholder="Selecciona fecha"
      required={true}
    />
  );
}
```

### Props de DateTimeInput

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | Date \| null | null | Fecha/hora seleccionada |
| `onChange` | Function | - | Callback cuando cambia la fecha |
| `type` | 'datetime' \| 'date' \| 'time' | 'datetime' | Tipo de selector |
| `label` | string | '' | Etiqueta del campo |
| `disabled` | boolean | false | Deshabilitar input |
| `minDate` | Date \| null | null | Fecha mínima permitida |
| `maxDate` | Date \| null | null | Fecha máxima permitida |
| `placeholder` | string | 'Selecciona...' | Placeholder del input |
| `required` | boolean | false | Marcar como requerido |

### SelectDropdown (Select con opciones)

```jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import SelectDropdown from '../components/DateTimeInputs/SelectDropdown';
import { setSelectedAction } from '../redux/slices/formSlice';

function MyComponent() {
  const [selectedAction, setSelectedAction] = useState(null);
  const dispatch = useDispatch();

  const actionOptions = [
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'ASSIGN', label: 'Asignar' },
  ];

  const handleChange = (option) => {
    setSelectedAction(option);
    dispatch(setSelectedAction(option));
  };

  return (
    <SelectDropdown
      label="Acción:"
      options={actionOptions}
      value={selectedAction}
      onChange={handleChange}
      isClearable={true}
      isSearchable={true}
      required={true}
    />
  );
}
```

### Props de SelectDropdown

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `options` | Array | [] | Array de opciones |
| `value` | Option \| null | null | Opción seleccionada |
| `onChange` | Function | - | Callback cuando cambia |
| `isMulti` | boolean | false | Permitir múltiples selecciones |
| `isClearable` | boolean | true | Mostrar botón limpiar |
| `isSearchable` | boolean | true | Permitir búsqueda |
| `isDisabled` | boolean | false | Deshabilitar select |
| `placeholder` | string | 'Selecciona...' | Placeholder |
| `label` | string | '' | Etiqueta del campo |
| `required` | boolean | false | Marcar como requerido |
| `noOptionsMessage` | Function | () => 'Sin opciones' | Mensaje sin opciones |

## Ejemplo Completo - AuditPage

```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DateTimeInput from '../../components/DateTimeInputs/DateTimeInput';
import SelectDropdown from '../../components/DateTimeInputs/SelectDropdown';
import {
  setDateStart,
  setDateEnd,
  setSelectedAction,
  selectDateStart,
  selectDateEnd,
  selectSelectedAction,
} from '../../redux/slices/formSlice';

export default function AuditPage() {
  const dispatch = useDispatch();
  const dateStart = useSelector(selectDateStart);
  const dateEnd = useSelector(selectDateEnd);
  const selectedAction = useSelector(selectSelectedAction);

  const actionOptions = [
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'ASSIGN', label: 'Asignar' },
    { value: 'REVOKE', label: 'Revocar' },
  ];

  const severityOptions = [
    { value: 'CRITICAL', label: 'Crítica' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'LOW', label: 'Baja' },
  ];

  const handleDateStartChange = (date) => {
    dispatch(setDateStart(date));
  };

  const handleDateEndChange = (date) => {
    dispatch(setDateEnd(date));
  };

  const handleActionChange = (option) => {
    dispatch(setSelectedAction(option));
  };

  const handleFilter = () => {
    console.log('Filtros aplicados:', {
      dateStart,
      dateEnd,
      action: selectedAction?.value,
    });
    // Aquí llamar a dispatch de thunk para obtener datos
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ color: '#fff', marginBottom: '24px' }}>Auditoria</h1>

      {/* Filtros */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#111827',
        borderRadius: '8px',
        border: '1px solid #374151',
      }}>
        <DateTimeInput
          type="date"
          label="Desde:"
          value={dateStart}
          onChange={handleDateStartChange}
          placeholder="Selecciona fecha"
          required={true}
        />

        <DateTimeInput
          type="date"
          label="Hasta:"
          value={dateEnd}
          onChange={handleDateEndChange}
          minDate={dateStart}
          placeholder="Selecciona fecha"
        />

        <SelectDropdown
          label="Acción:"
          options={actionOptions}
          value={selectedAction}
          onChange={handleActionChange}
          isClearable={true}
        />

        <button
          onClick={handleFilter}
          style={{
            alignSelf: 'flex-end',
            padding: '10px 20px',
            backgroundColor: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
```

## Redux Slice API

### Actions

```javascript
import {
  setDateStart,
  setDateEnd,
  setSelectedAction,
  setSelectedSeverity,
  setFilter,
  setFilters,
  setSearchQuery,
  resetFilters,
  resetForm,
} from '../redux/slices/formSlice';

dispatch(setDateStart(new Date()));
dispatch(setSelectedAction({ value: 'CREATE', label: 'Crear' }));
dispatch(setSearchQuery('búsqueda'));
dispatch(resetFilters()); // Limpiar todos los filtros
```

### Selectors

```javascript
import {
  selectDateStart,
  selectDateEnd,
  selectSelectedAction,
  selectFilters,
  selectActiveFilters,
  selectIsLoading,
  selectError,
} from '../redux/slices/formSlice';

const dateStart = useSelector(selectDateStart);
const allFilters = useSelector(selectActiveFilters);
```

## Estilos - Dark Mode

Los componentes incluyen estilos dark mode completos:

- **Colores primarios:** #0ea5e9, #06b6d4
- **Background:** #111827, #1f2937
- **Border:** #374151
- **Text:** #fff, #9ca3af
- **Hover/Focus:** animaciones suaves

Todos los estilos se cargan automáticamente desde:
- `DateTimeInput.scss`
- `SelectDropdown.scss`

## Troubleshooting

### Error: "Cannot find module 'react-date-picker'"

```bash
npm install react-date-picker react-select react-datepicker moment
```

### Los estilos no se cargan

Verificar que los archivos `.scss` estén en la carpeta correcta:
```
src/components/DateTimeInputs/
├── DateTimeInput.jsx
├── DateTimeInput.scss ✓
├── SelectDropdown.jsx
└── SelectDropdown.scss ✓
```

### Redux no guarda el estado

1. Verificar que `formReducer` esté en `store.js`
2. Importar las acciones correctas
3. Usar `useDispatch` y `useSelector` correctamente

## Performance

Los componentes están optimizados para:
- ✅ Lazy loading del calendario
- ✅ Memoización de selects
- ✅ Debounce de búsqueda
- ✅ Virtual scrolling en opciones largas

## Accesibilidad (WCAG 2.1 AA)

- ✅ Teclado navegable
- ✅ Labels asociados
- ✅ ARIA attributes
- ✅ Contraste de color
- ✅ Focus visible

## Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile (iOS, Android)
- ✅ Responsive design
- ✅ Dark mode

## Versionado

- Componentes: v1.0.0
- React: 19.0.0+
- Redux Toolkit: 2.0.0+
- react-select: 5.7.0+
- react-date-picker: 10.0.0+

---

**Última actualización:** 2026-04-27  
**Mantenedor:** IACT Development Team
