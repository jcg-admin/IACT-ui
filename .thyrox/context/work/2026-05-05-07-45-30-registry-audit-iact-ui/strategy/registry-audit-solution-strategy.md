```yaml
created_at: 2026-05-05 08:30:00
project: IACT-UI
phase: Phase 5 — STRATEGY
```

# Phase 5 STRATEGY — Actualización de Agentes para IACT-UI

## Decisión global

Actualizar los agentes in-place en `.claude/agents/` (no en el registry — el registry
es la fuente de verdad para nuevos proyectos, pero para IACT-UI actualizamos directamente
los instalados). Crear `redux-expert.md` desde cero.

**No** actualizar el registry fuente (`.thyrox/registry/agents/`) — ese es el template
genérico. Los cambios son específicos de IACT-UI y viven solo en `.claude/agents/`.

---

## Acción A — Actualizar `react-expert.md`

### Cambios exactos

| Campo | Antes | Después |
|-------|-------|---------|
| Proyecto skill | `Project State - THYROX` | `IACT-UI` |
| Testing framework | `Vitest + React Testing Library` | `Jest 29 + React Testing Library` |
| Imports test | `import { describe, it, expect } from 'vitest'` | `import '@testing-library/jest-dom'` (via setup) |
| Mock fn | `vi.fn()` | `jest.fn()` |
| Comando test | `yarn test` | `npm test` |
| Comando coverage | `yarn test --coverage` | `npm run test:coverage` |
| Comando watch | `yarn test --watch` | `npm test -- --watch` |
| Estado global | Zustand | Redux Toolkit (RTK) |
| Estado servidor | React Query genérico | `@tanstack/react-query` |
| Estructura archivos | `src/components/ pages/ hooks/ utils/ types/` | Estructura real de IACT-UI |
| MCP tool | `mcp__thyrox_executor__exec_cmd` | Fallback a `Bash` (MCP puede no estar corriendo) |

### Estructura IACT-UI real

```
src/
├── components/      # Componentes reutilizables (incluyendo PermissionGate, ProtectedRoute)
├── modules/         # Features por dominio (home/, auth/, etc.)
│   └── home/
│       ├── components/
│       └── state/   # Slices locales del módulo
├── hooks/           # Custom hooks (usePermisos.ts, useHealthStatus.js, etc.)
├── services/        # createResilientService — API + fallback a mocks
├── state/
│   ├── store.js     # Redux store config
│   └── slices/      # appConfigSlice, healthSlice, homeSlice
├── mocks/           # JSON mocks + registry.js + schemas.js
└── styles/          # Global CSS/SCSS
```

### Tabla de estado global correcta

| Caso | Solución |
|------|---------|
| Estado global de app | Redux Toolkit (RTK) — slices en `src/state/slices/` |
| Estado de módulo local | RTK slice en `src/modules/{módulo}/state/` |
| Estado del servidor (fetch/cache) | `@tanstack/react-query` |
| Theming / i18n | Context API |

---

## Acción B — Actualizar `webpack-expert.md`

### Cambios exactos

| Campo | Antes | Después |
|-------|-------|---------|
| Archivo config | Multi-file (`webpack.common.js` + `webpack.dev.js` + `webpack.prod.js`) | Single file: `webpack.config.cjs` |
| Extensión | `.js` / `.mjs` | `.cjs` (CommonJS explícito) |
| webpack-merge | Requerido | No usado — condicionales inline |
| Alias `@/` | Solo `@/` → `src/` | Aliases granulares de IACT-UI |
| MCP tool | `mcp__thyrox_executor__exec_cmd` | Fallback a `Bash` |

### Aliases reales de IACT-UI

```js
resolve: {
  alias: {
    '@app':        path.resolve(__dirname, 'src/'),
    '@modules':    path.resolve(__dirname, 'src/modules/'),
    '@components': path.resolve(__dirname, 'src/components/'),
    '@hooks':      path.resolve(__dirname, 'src/hooks/'),
    '@state':      path.resolve(__dirname, 'src/state/'),
    '@services':   path.resolve(__dirname, 'src/services/'),
    '@mocks':      path.resolve(__dirname, 'src/mocks/'),
    '@styles':     path.resolve(__dirname, 'src/styles/'),
  }
}
```

### Patrón config IACT-UI (single-file con condicionales)

```js
// webpack.config.cjs
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  // ... resto de config con condicionales inline
};
```

---

## Acción C — Crear `redux-expert.md` (nuevo)

### Cobertura del agente

El agente debe conocer:

1. **Store config** — `configureStore` con slices y middleware
2. **Slices RTK** — `createSlice`, `initialState`, `reducers`, `extraReducers`
3. **Async thunks** — `createAsyncThunk` con los 3 estados (pending/fulfilled/rejected)
4. **Selectors** — `createSelector` de reselect (incluido en RTK)
5. **Patrones IACT-UI específicos** — slices existentes, patrón `createResilientService`
6. **Testing de slices** — Jest + reducers puros, thunks con mock de dispatch

### Slices reales de IACT-UI

| Slice | Archivo | Estado |
|-------|---------|--------|
| `appConfigSlice` | `src/state/slices/appConfigSlice.js` | Config de app global |
| `healthSlice` | `src/state/slices/healthSlice.js` | Estado de salud del sistema |
| `homeSlice` | `src/modules/home/state/homeSlice.js` | Anuncios/home (NOTA: existe duplicado en `src/state/slices/homeSlice.js` — TD-004) |

### Pattern `createResilientService` (a conocer por redux-expert)

Los thunks de IACT-UI NO llaman a `fetch` directamente — usan el servicio resiliente
que automáticamente cae a mocks si la API falla:

```js
// services/homeService.js
export const homeService = createResilientService('home', {
  fetchAnnouncements: async () => await apiClient.get('/announcements')
});

// En el thunk:
export const fetchAnnouncements = createAsyncThunk(
  'home/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      return await homeService.fetchAnnouncements();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

---

## Criterios de aceptación

- [ ] `react-expert.md`: cero referencias a Vitest, Zustand, yarn, THYROX
- [ ] `react-expert.md`: testing examples usan Jest/jest.fn(), npm commands
- [ ] `react-expert.md`: estado global muestra RTK con @tanstack/react-query
- [ ] `webpack-expert.md`: config muestra `webpack.config.cjs` único con condicionales
- [ ] `webpack-expert.md`: aliases incluyen los 8 aliases reales de IACT-UI
- [ ] `redux-expert.md`: existe como nuevo agente con cobertura completa RTK
- [ ] `redux-expert.md`: conoce slices reales de IACT-UI y patrón createResilientService
- [ ] Los 3 agentes usan Bash como tool primaria (no MCP executor)

---

## Orden de ejecución

1. Actualizar `react-expert.md` (más cambios — mayor riesgo)
2. Actualizar `webpack-expert.md` (cambios menores)
3. Crear `redux-expert.md` (fichero nuevo — sin riesgo de pérdida)
4. Actualizar `wp-state.md` → Phase 11 TRACK
5. Commit + push
