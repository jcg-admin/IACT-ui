# 🚀 Instalación - Componentes React + Redux para IACT v4.0

## Paso 1: Instalar Dependencias NPM

```bash
npm install react-date-picker react-select react-datepicker moment
```

### Verificar instalación:
```bash
npm list react-date-picker react-select react-datepicker moment
```

---

## Paso 2: Verificar Estructura de Carpetas

Los archivos deben estar en estas rutas:

```
IACT/
├── src/
│   ├── components/
│   │   └── DateTimeInputs/           ✓ NUEVO
│   │       ├── DateTimeInput.jsx
│   │       ├── DateTimeInput.scss
│   │       ├── SelectDropdown.jsx
│   │       ├── SelectDropdown.scss
│   │       └── README.md
│   │
│   └── redux/
│       └── slices/
│           ├── authSlice.js
│           ├── accessSlice.js
│           ├── alertsSlice.js
│           ├── auditSlice.js
│           └── formSlice.js           ✓ NUEVO
│
└── store.js                          ✓ ACTUALIZADO
```

---

## Paso 3: Actualizar Redux Store

Verificar que `src/redux/store.js` incluya el formReducer:

```javascript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import accessReducer from './slices/accessSlice'
import alertsReducer from './slices/alertsSlice'
import auditReducer from './slices/auditSlice'
import formReducer from './slices/formSlice'  // ✓ NUEVO

const store = configureStore({
  reducer: {
    auth: authReducer,
    access: accessReducer,
    alerts: alertsReducer,
    audit: auditReducer,
    form: formReducer,  // ✓ NUEVO
  },
})

export default store
```

---

## Paso 4: Importar en Páginas

### En `src/pages/audit/AuditPage.jsx`:

```jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Componentes React + Redux
import DateTimeInput from '../../components/DateTimeInputs/DateTimeInput';
import SelectDropdown from '../../components/DateTimeInputs/SelectDropdown';

// Redux actions y selectors
import {
  setDateStart,
  setDateEnd,
  setSelectedAction,
  resetFilters,
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
  ];

  return (
    <div>
      <DateTimeInput
        type="date"
        label="Desde:"
        value={dateStart}
        onChange={(date) => dispatch(setDateStart(date))}
      />

      <SelectDropdown
        label="Acción:"
        options={actionOptions}
        value={selectedAction}
        onChange={(option) => dispatch(setSelectedAction(option))}
      />

      <button onClick={() => dispatch(resetFilters())}>
        Limpiar
      </button>
    </div>
  );
}
```

---

## Paso 5: Actualizar en Todas las Páginas

Reemplazar en las siguientes páginas:

### Access Module:
- ✏️ `src/pages/access/AssignFunctionsPage.jsx`
- ✏️ `src/pages/access/PermissionsPage.jsx`
- ✏️ `src/pages/access/GroupersPage.jsx`
- ✏️ `src/pages/access/SoDManagementPage.jsx`
- ✏️ `src/pages/access/SegmentsPage.jsx`
- ✏️ `src/pages/access/TemporaryPermissionsPage.jsx`
- ✏️ `src/pages/access/AccessAuditPage.jsx`

### Alerts Module:
- ✏️ `src/pages/alerts/AlertsPage.jsx`
- ✏️ `src/pages/alerts/AlertConfigPage.jsx`
- ✏️ `src/pages/alerts/AlertHistoryPage.jsx`
- ✏️ `src/pages/alerts/SubscriptionsPage.jsx`
- ✏️ `src/pages/alerts/TemplatesPage.jsx`

### Audit Module:
- ✏️ `src/pages/audit/AuditPage.jsx`
- ✏️ `src/pages/audit/AuditSearchPage.jsx`
- ✏️ `src/pages/audit/ExportPage.jsx`
- ✏️ `src/pages/audit/ComplianceReportPage.jsx`

---

## Paso 6: Verificar que Webpack Incluya SCSS

En `webpack.config.js`, verificar que tenga loaders para SCSS:

```javascript
{
  test: /\.scss$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader'
  ]
}
```

---

## Paso 7: Probar en Navegador

```bash
npm start
```

### Verificar:
- ✓ Navegue a `/audit`
- ✓ Los componentes DateTimeInput y SelectDropdown aparecen
- ✓ Dark mode está aplicado
- ✓ Los filtros se guardan en Redux
- ✓ Los datos en la consola se actualizan

---

## Paso 8: Compilar para Producción

```bash
npm run build
```

---

## ✅ Checklist de Verificación

Antes de hacer commit, verificar:

- [ ] `npm install` completó exitosamente
- [ ] `src/components/DateTimeInputs/` contiene 5 archivos
- [ ] `src/redux/slices/formSlice.js` existe
- [ ] `src/redux/store.js` importa formReducer
- [ ] Webpack puede compilar (sin errores)
- [ ] App funciona en navegador
- [ ] Filtros se guardan en Redux
- [ ] Dark mode se ve correctamente
- [ ] Componentes responden a clicks

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'react-date-picker'"
```bash
npm install react-date-picker react-select react-datepicker moment
npm start
```

### Error: "formSlice is not defined"
Verificar que `store.js` importe correctamente:
```javascript
import formReducer from './slices/formSlice'
```

### Los estilos no se aplican
1. Verificar que los archivos `.scss` estén presentes
2. Verificar que Webpack tenga loaders para SCSS
3. Limpiar cache: `rm -rf node_modules/.cache`

### El Redux no guarda el estado
1. Abrir React DevTools
2. Verificar que las acciones se dispatchen
3. Verificar que el estado se actualice en el store

---

## 📦 Tamaño de Paquetes

```
react-date-picker    28KB
react-select         35KB
react-datepicker     35KB
moment              67KB
─────────────────────────
Total:             165KB

vs.

mx-template (anterior):   ~150KB
Diferencia:              +15KB (aceptable)

Pero con lazy loading, gzip comprime a ~40KB
```

---

## 🎯 Próximos Pasos

1. **Actualizar todas las páginas** con los nuevos componentes
2. **Crear tests unitarios** con Jest + React Testing Library
3. **Documentar API de componentes** en Storybook
4. **Agregar validación de formularios** con react-hook-form
5. **Implementar sincronización** de filtros entre páginas

---

## 📚 Documentación

- `src/components/DateTimeInputs/README.md` - API de componentes
- `EJEMPLO_AUDITPAGE.jsx` - Ejemplo completo de uso
- Este archivo - Guía de instalación

---

## ✨ Beneficios de la Migración

### Antes (jQuery):
```javascript
$('.datetimepicker').datetimepicker({...});
$('.selectpicker').selectpicker();
// Código mezclado en document.ready
// Sin tipado
// Difícil de testear
```

### Después (React + Redux):
```jsx
<DateTimeInput value={date} onChange={setDate} />
<SelectDropdown options={opts} value={val} onChange={setVal} />
// Código declarativo
// Tipado con PropTypes/TypeScript
// Fácil de testear
```

---

**Última actualización:** 2026-04-27  
**Status:** ✅ Listo para usar  
**Versión:** 1.0.0
