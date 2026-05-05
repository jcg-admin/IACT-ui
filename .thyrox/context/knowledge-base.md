```yaml
type: Índice de Base de Conocimiento
project: IACT-UI
version: 1.0
updated_at: 2026-05-05
```

# Knowledge Base — IACT-UI

## Stack y arquitectura

| Tema | Referencia |
|------|-----------|
| Stack principal | `README.md` — instalación, scripts, env vars |
| Sistema de permisos RBAC | `README_PERMISOS.md` — PermissionGate, usePermisos, ProtectedRoute |
| Configuración de servicios | `SERVICES_SETUP.md` |
| ADRs del proyecto | `.thyrox/context/decisions/` |
| Deuda técnica activa | `.thyrox/context/technical-debt.md` |

## Módulos clave

| Módulo | Ubicación | Responsabilidad |
|--------|-----------|----------------|
| Redux store | `src/state/store.js` | Estado global |
| Slices | `src/state/slices/` | appConfig, health |
| Servicios | `src/services/` | API + fallback mock resiliente |
| Mock system | `src/mocks/` | JSON + schemas + registry |
| Permisos | `src/hooks/usePermisos.ts` | RBAC client-side |
| Componentes RBAC | `src/components/PermissionGate.tsx`, `ProtectedRoute.tsx` | Guards de UI |

## Patrones establecidos

### Servicio resiliente
```js
// Patrón: API real → fallback mock automático
const service = createResilientService({
  id: 'domain',
  endpoint: '/api/endpoint/',
  mockDataLoader: () => Promise.resolve(mockData),
  shouldUseMock: () => shouldUseMockForDomain('domain'),
  isPayloadValid: (payload) => Boolean(payload),
});
```

### Redux slice
```js
// Patrón: slice por dominio con createAsyncThunk
const slice = createSlice({ name, initialState, reducers, extraReducers });
export const { action } = slice.actions;
export const selectField = (state) => state.name.field;
export default slice.reducer;
```

### Permiso en componente
```tsx
// Patrón: PermissionGate para contenido condicional
<PermissionGate permission="sistema.vistas.dashboards.ver">
  <Dashboard />
</PermissionGate>
```

## Decisiones de arquitectura

Ver `.thyrox/context/decisions/` para el listado completo de ADRs.

## Work Packages

| WP | Estado | Descripción |
|----|--------|-------------|
| `2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup` | `in_progress` | Limpieza contexto y setup THYROX |
