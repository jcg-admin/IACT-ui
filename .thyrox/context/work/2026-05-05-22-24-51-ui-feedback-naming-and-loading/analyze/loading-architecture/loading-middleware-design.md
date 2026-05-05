```yml
created_at: 2026-05-05 22:29:27
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
phase: Phase 3 — DIAGNOSE
author: NestorMonroy
status: Borrador
```

# Loading Architecture Design — loadingMiddleware + loadingSlice

## Causa raíz del problema

**¿Por qué el loading está fragmentado?**

| Why | Respuesta |
|-----|-----------|
| 1º ¿Por qué 10 páginas duplican el patrón `{loading ? <Spinner/> : <tabla/>}`? | Porque cada slice gestiona su propio `loading: boolean` |
| 2º ¿Por qué cada slice gestiona su propio loading? | Porque Redux Toolkit invita a hacerlo con `addCase(thunk.pending)` — es el patrón documentado |
| 3º ¿Por qué es un problema? | Inconsistencia visual, código duplicado, y ausencia de coordinación global |
| 4º ¿Por qué no hay coordinación global? | No existe un `loadingSlice` ni middleware análogo a `errorHandlingMiddleware` |
| 5º Causa raíz | El sistema creció slice por slice sin una política de loading transversal |

## Estado actual [PROVEN]

- **54 thunks** totales en 10 slices
- **10 slices** con `loading: boolean` local en estado
- **10 páginas** con renderizado condicional manual de `<LoadingSpinner>`
- **5 slices** sin selector de loading exportado (dashboard, auth, user, savedFilters, reports)
- **Dos spinners** sin criterio: `LoadingSpinner` (CSS puro) y `AnimatedLoadingSpinner` (Framer Motion)

## Análisis de opciones arquitectónicas

### Opción A — Opt-out (interceptar todos los `*/pending`)

El middleware intercepta TODOS los `*/pending` y registra la operación activa.
Lista negra de exclusiones para operaciones silenciosas.

```js
// loadingMiddleware.js
const SILENT_ACTIONS = new Set(['auth/logout', 'session/refresh'])

export const loadingMiddleware = store => next => action => {
  if (action.type?.endsWith('/pending') && !SILENT_ACTIONS.has(action.type)) {
    store.dispatch(startLoading(action.meta.requestId))
  }
  if (action.type?.endsWith('/fulfilled') || action.type?.endsWith('/rejected')) {
    store.dispatch(stopLoading(action.meta.requestId))
  }
  return next(action)
}
```

**Pro:** Cero cambios en los slices existentes.
**Contra:** La lista negra crece con el tiempo. Operaciones nuevas son opt-out por defecto
(deben agregarse explícitamente si son silenciosas). Difícil de mantener.

**Veredicto: DESCARTADO** — la lista negra es deuda técnica garantizada.

---

### Opción B — Opt-in vía `meta.showLoading` en el thunk

El middleware solo actúa cuando el action tiene `meta.showLoading = true`.
Los thunks que quieren spinner lo declaran explícitamente.

```js
// Thunk con spinner:
export const fetchLogs = createAsyncThunk('logs/fetch', async (_, { rejectWithValue }) => {
  // ...
}, { dispatchConditionRejection: true })

// Al dispatchar:
dispatch(fetchLogs({ showLoading: true }))  // ← el caller decide

// O bien, declarar en el propio thunk:
export const fetchLogs = createAsyncThunk('logs/fetch', 
  async (params, { rejectWithValue }) => { ... },
  { condition: () => true }  // no ayuda directamente
)
```

El problema: `createAsyncThunk` no tiene un hook nativo para agregar `meta.showLoading`
desde la definición del thunk. Requeriría o wrappear el dispatch en cada callsite,
o crear un helper `createLoadingThunk`.

**Pro:** Máximo control. Solo muestra spinner cuando el desarrollador lo pide.
**Contra:** Requiere cambiar TODOS los callsites o wrappear `createAsyncThunk`.
Más boilerplate, no más simple que el patrón actual.

**Veredicto: DESCARTADO** — no simplifica, solo mueve el problema.

---

### Opción C — Opt-in vía contexto del action type (prefijo) ✓ RECOMENDADA

El middleware usa el prefijo del action type como "contexto" de loading.
Los componentes consultan `selectIsLoading('logs')` para saber si alguna operación
del contexto `logs` está en curso.

```js
// loadingMiddleware.js — intercepta */pending y */fulfilled|rejected
// Extrae contexto del type: 'logs/fetchLogs/pending' → 'logs'
const context = action.type.split('/')[0]

// loadingSlice.js — state.loading.activeOps: Set de requestIds por contexto
// { logs: Set(['req-123']), access: Set(['req-456']) }
```

**Pro:**
- Cero cambios en los thunks existentes
- Cero cambios en los slices existentes (conviven con su `loading` local)
- Los componentes consultan por contexto: `selectIsLoading('logs')`
- Operaciones silenciosas: auth, session no muestran spinner global si el componente
  no consulta `selectIsLoading('auth')`
- Migración incremental: página por página sin big-bang

**Contra:**
- El contexto es implícito (basado en el prefijo del thunk type)
- Una operación de `auth/login` tendría contexto `auth` — si una página consulta
  `selectIsLoading('auth')` vería el spinner durante login

**Manejo de auth y operaciones silenciosas:**
- Solución pragmática: lista de contextos a IGNORAR en el middleware
  (`const SILENT_CONTEXTS = new Set(['auth', 'session'])`)
- Lista pequeña y estable — a diferencia de Opción A (lista de action types individuales)

**Veredicto: ADOPTADA**

---

## Diseño final — Opción C

### `loadingSlice.js`

```js
// src/redux/slices/loadingSlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  // Map context → count de operaciones activas
  // Se usa count en lugar de Set para serialización Redux
  contexts: {}
  // { logs: 2, access: 1, dashboard: 0 }
}

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    incrementContext: (state, { payload: context }) => {
      state.contexts[context] = (state.contexts[context] ?? 0) + 1
    },
    decrementContext: (state, { payload: context }) => {
      const current = state.contexts[context] ?? 0
      state.contexts[context] = Math.max(0, current - 1)
    },
  },
})

// Selectores
export const selectIsLoading = (context) => (state) =>
  (state.loading.contexts[context] ?? 0) > 0

export const selectAnyLoading = (state) =>
  Object.values(state.loading.contexts).some(count => count > 0)

export const { incrementContext, decrementContext } = loadingSlice.actions
export default loadingSlice.reducer
```

**Por qué count en lugar de Set:**
Redux requiere serialización JSON. Un Set no es serializable. Un contador cumple
el mismo propósito (>0 = cargando) y es completamente serializable.

### `loadingMiddleware.js`

```js
// src/redux/middleware/loadingMiddleware.js
import { incrementContext, decrementContext } from '@redux/slices/loadingSlice'

// Contextos que nunca muestran spinner (operaciones de infraestructura)
const SILENT_CONTEXTS = new Set(['auth', 'session'])

export const loadingMiddleware = (store) => (next) => (action) => {
  if (!action.type) return next(action)

  const context = action.type.split('/')[0]
  if (SILENT_CONTEXTS.has(context)) return next(action)

  if (action.type.endsWith('/pending')) {
    store.dispatch(incrementContext(context))
  } else if (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) {
    store.dispatch(decrementContext(context))
  }

  return next(action)
}
```

### Integración en `store.js`

```js
// Agregar al middleware chain:
.concat(errorLoggingMiddleware, errorHandlingMiddleware, loadingMiddleware)

// Agregar al reducer:
loading: loadingReducer,
```

### Uso en páginas (patrón migrado)

```jsx
// ANTES (patrón actual — 10 páginas):
const loading = useSelector(selectLogsLoading)
return loading ? <LoadingSpinner message="Cargando logs..." /> : <tabla/>

// DESPUÉS (patrón nuevo):
import { selectIsLoading } from '@redux/slices/loadingSlice'
const isLoading = useSelector(selectIsLoading('logs'))
return isLoading ? <LoadingSpinner message="Cargando logs..." /> : <tabla/>
```

La migración es **1 línea cambiada por página**: el selector. El `<LoadingSpinner>`
permanece donde está — el middleware no fuerza un spinner global.

## Criterio documentado: LoadingSpinner vs AnimatedLoadingSpinner

**División observada [INFERRED]:**

| Componente | Usos actuales | Característica |
|-----------|--------------|----------------|
| `LoadingSpinner` | 10 páginas (inline, en tablas/datos) | CSS puro, sin dependencias extra, renderizado síncrono |
| `AnimatedLoadingSpinner` | AppRouter, LoginPage, DashboardPage (transiciones de página) | Framer Motion, fade in/out, transiciones suaves |

**Criterio a documentar:**

- `LoadingSpinner` → loading **inline** dentro de una sección de la página (tabla, panel, lista). El usuario sigue viendo el resto de la UI.
- `AnimatedLoadingSpinner` → loading de **página completa** o transición entre rutas. La UI anterior desaparece con fade-out antes de mostrar la nueva.

## Scope de migración en este WP

**Propuesta conservadora (piloto):** migrar solo `LogsPage` y `ETLLogsPage` como prueba de concepto.

**Razón:** Valida que el `loadingMiddleware` funciona sin regresar las otras 8 páginas.
Las páginas no migradas siguen funcionando con su `loading` local — el middleware
añade su estado en paralelo sin conflicto.

**Los slices existentes NO se tocan** en este WP. La migración completa de los 10 slices
es un WP separado de deuda técnica.

## Riesgos actualizados

- **R-002 (revisado):** La lista `SILENT_CONTEXTS` (solo `auth` y `session`) es pequeña y estable. 
  Probabilidad de spinners indeseados: baja con la Opción C.
- **R-004 (revisado):** Con scope piloto (2 páginas), R-004 queda mitigado: los slices 
  existentes no se tocan, no hay riesgo de inconsistencia.
