```yaml
created_at: 2026-05-05 08:40:00
project: IACT-UI
phase: Phase 11 — TRACK
```

# Changelog — registry-audit-iact-ui

## Cambios realizados

### `.claude/agents/react-expert.md` — ACTUALIZADO

**Correcciones críticas:**
- Testing: Vitest → **Jest 29 + React Testing Library**
- Comando: `yarn test` → `npm test`, `yarn test --coverage` → `npm run test:coverage`
- Estado global: Zustand → **Redux Toolkit (RTK)**
- Estado servidor: React Query genérico → **@tanstack/react-query**
- Proyecto: `Project State - THYROX` → **IACT-UI**
- MCP tool removida → **Bash** como tool primaria

**Nuevas secciones:**
- Estructura real de IACT-UI (`modules/`, `services/`, `state/slices/`, `mocks/`)
- Tabla de estado global corregida con RTK
- Ejemplo de componente conectado a Redux store
- Regla crítica de Rules of Hooks con ejemplo de bug+fix
- Aliases de IACT-UI (`@state`, `@services`, `@mocks`, etc.)

### `.claude/agents/webpack-expert.md` — ACTUALIZADO

**Correcciones importantes:**
- Config multi-archivo eliminada → **single `webpack.config.cjs`** con condicionales
- `webpack-merge` eliminado — no se usa en IACT-UI
- Alias `@/` → `src/` reemplazado por **8 aliases granulares de IACT-UI**
- MCP tool removida → **Bash** como tool primaria
- Comandos: `npx webpack` → `npm run build` / `npm start`

**Nuevas secciones:**
- Tabla completa de los 8 aliases con descripción
- Nota sobre sincronización de aliases webpack ↔ jest.config.cjs
- Config completa de IACT-UI como ejemplo de referencia

### `.claude/agents/redux-expert.md` — CREADO

Nuevo agente especializado en Redux Toolkit para IACT-UI.

**Cobertura:**
- Store config con slices reales del proyecto
- Patrón de slice RTK con `createSlice` + `createAsyncThunk` + `extraReducers`
- Patrón `createResilientService` — API con fallback automático a mocks
- Selectors con `createSelector` de reselect (incluido en RTK)
- Testing de reducers síncronos (6 casos, incluyendo both rejected branches)
- Testing de thunks con dispatch mock
- Helper `renderWithStore` para componentes conectados
- Lista de patrones a evitar (incluye advertencia sobre homeSlice duplicado TD-004)

## Hallazgos resueltos

| Hallazgo | Estado |
|---------|--------|
| H-001 Vitest → Jest | ✅ Resuelto en react-expert |
| H-002 Zustand → Redux Toolkit | ✅ Resuelto en react-expert |
| H-003 Sin agente Redux/RTK | ✅ Resuelto — redux-expert creado |
| H-004 Config multi-archivo → single-file | ✅ Resuelto en webpack-expert |
| H-005 Aliases IACT-UI no conocidos | ✅ Resuelto en webpack-expert |
| H-006 MCP tools sin fallback Bash | ✅ Resuelto — ambos usan Bash |
| H-008 Proyecto hardcodeado THYROX | ✅ Resuelto en react-expert |
| H-009 yarn → npm | ✅ Resuelto en react-expert |

## Hallazgos pendientes

| Hallazgo | Estado | Motivo |
|---------|--------|--------|
| H-007 Templates sin instanciar | ⏸ Aceptado | Los templates son para nuevos proyectos; IACT-UI usa agentes directos |
