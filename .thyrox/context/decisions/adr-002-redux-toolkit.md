```yaml
id: ADR-002
title: Redux Toolkit para estado global
status: Aceptado
date: 2026-05-05
project: IACT-UI
```

# ADR-002 — Redux Toolkit para estado global

## Contexto

El dashboard necesita compartir estado entre componentes no relacionados:
configuración de la app, estado de salud del backend, datos de llamadas,
anuncios y permisos del usuario.

## Decisión

Usar **Redux Toolkit (RTK)** con slices por dominio y `createAsyncThunk`
para efectos asíncronos.

## Estructura de slices

```
src/state/slices/
├── appConfigSlice.js   — configuración de la aplicación
└── healthSlice.js      — estado del backend (ok/degraded/down)

src/modules/home/state/
└── homeSlice.js        — anuncios del módulo home
```

## Convención de slices

```js
const slice = createSlice({
  name: 'dominio',
  initialState,
  reducers: { /* acciones síncronas */ },
  extraReducers: (builder) => { /* async thunks */ },
});
export const { accion } = slice.actions;
export const selectCampo = (state) => state.dominio.campo;
export default slice.reducer;
```

## Consecuencias

- `DevTools` habilitado en entornos no-producción
- Serialización ignorada para ciertos payloads (configurado en `store.js`)
- **Deuda TD-004:** `homeSlice.js` existe duplicado en dos ubicaciones —
  consolidar en `src/state/slices/` como fuente de verdad
