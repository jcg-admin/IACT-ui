```yml
created_at: 2026-05-05 22:43:47
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
phase: Phase 5 — STRATEGY
author: NestorMonroy
status: Aprobado
```

# Solution Strategy — ui-feedback-naming-and-loading

## Decisiones aprobadas (gate SP-02)

| # | Decisión | Estado |
|---|----------|--------|
| D-001 | `ApiErrorToast` → `ApiErrorAlert` | Aprobado |
| D-002 | `loadingMiddleware` Opción C (prefijo de contexto) | Aprobado |
| D-003 | Scope piloto: `LogsPage` + `ETLLogsPage` | Aprobado |
| D-004 | Análisis de migración completa como artefacto separado | Aprobado |

---

## Key Ideas

### KI-01: Naming debe revelar intención, no implementación visual

`Toast` es un patrón visual de UI (notificación que aparece y desaparece).
`ApiErrorToast` toma prestado ese nombre para un componente cuyo propósito
es diferente: mostrar errores de API en un área persistente con `role="alert"`.

**Disonancia documentada:**
- El componente ya tiene `role="alert"` — el código revela la intención correcta
- El nombre dice `Toast` — el nombre contradice esa intención
- Existe `ToastContext/Toast/ToastContainer` independiente — la homonimia crea
  dos sistemas llamados "Toast" que no tienen relación entre sí

**Principio aplicado (Clean Code cap.2):** nombres que revelan intención evitan
la necesidad de un comentario para entender el propósito.

### KI-02: Loading fragmentado = inconsistencia visual + código duplicado

10 páginas implementan el mismo patrón `{loading ? <Spinner/> : <datos/>}` con
`loading: boolean` en cada slice. El patrón es correcto pero no está coordinado:

- No hay criterio documentado para cuándo usar cada spinner
- No hay manera de saber desde afuera si "algo está cargando"
- Agregar una nueva página requiere replicar 3 pasos (thunk, slice, render)

**Solución:** interceptor de middleware que gestiona el estado de loading
transversalmente — análogo a `errorHandlingMiddleware` ya existente.

### KI-03: Migración incremental es la única estrategia viable

Con 54 thunks distribuidos en 10 slices, una migración big-bang tiene:
- Riesgo de regresión alto
- Dificultad de debugging alta (todo cambió al mismo tiempo)
- Incapacidad de validar en producción parcialmente

**Estrategia:** piloto en 2 páginas. Los slices existentes NO se tocan —
el `loadingMiddleware` y `loadingSlice` son ADITIVOS, no sustitutos.
Las páginas no migradas siguen usando su `loading` local sin conflicto.

---

## Arquitectura de la solución

### Componente 1: `ApiErrorAlert` (renombre)

**Qué cambia:** nombre de archivo, nombre de componente, CSS class, imports

```
ANTES:
  src/components/feedback/ApiErrorToast.jsx
  src/components/feedback/ApiErrorToast.test.jsx
  CSS class: .api-error-toast

DESPUÉS:
  src/components/feedback/ApiErrorAlert.jsx
  src/components/feedback/ApiErrorAlert.test.jsx
  CSS class: .api-error-alert
```

**Qué NO cambia:** lógica interna, props, comportamiento, tests de behavior

**Puntos de referencia (6 archivos):**
1. `src/components/feedback/ApiErrorToast.jsx` → renombrar archivo + componente
2. `src/components/feedback/__tests__/ApiErrorToast.test.jsx` → renombrar
3. `src/redux/middleware/errorHandling.js` → actualizar import
4. `src/App.jsx` → actualizar import + JSX tag
5. `src/styles/_feedback.scss` → `.api-error-toast` → `.api-error-alert`
6. Cualquier otro import (verificar con grep antes de ejecutar)

**Estrategia de commit:** atómico — rename + todos los imports + CSS + test en un
solo commit. Si falla el build, `git revert` de ese único commit.

---

### Componente 2: `loadingSlice.js`

**Ubicación:** `src/redux/slices/loadingSlice.js`

**Estado:** mapa de contadores por contexto (serializable en Redux)

```js
// state.loading.contexts: { [context: string]: number }
// { logs: 2, access: 1 }
// Invariante: count >= 0 (Math.max(0, current - 1) en decrement)
```

**Por qué contadores en lugar de Set:**
Redux requiere estado serializable. `Set` no es JSON-serializable.
Un contador `> 0` es equivalente semántico a "hay operaciones activas".
Permite operaciones concurrentes del mismo contexto (count 2 = 2 fetchs
en curso simultáneos).

**Selectores exportados:**
- `selectIsLoading(context)` → `(state) => state.loading.contexts[context] > 0`
- `selectAnyLoading` → `(state) => Object.values(...).some(count => count > 0)`

---

### Componente 3: `loadingMiddleware.js`

**Ubicación:** `src/redux/middleware/loadingMiddleware.js`

**Algoritmo:**

```
1. Si action.type no existe → pass-through (next(action))
2. Extraer context = action.type.split('/')[0]
3. Si context ∈ SILENT_CONTEXTS → pass-through (sin dispatch)
4. Si type termina en '/pending' → dispatch(incrementContext(context))
5. Si type termina en '/fulfilled' o '/rejected' → dispatch(decrementContext(context))
6. Siempre: next(action) (el middleware no bloquea el flujo)
```

**SILENT_CONTEXTS:** `new Set(['auth', 'session'])`

Justificación:
- `auth/*` — login, logout, token refresh: operaciones de infraestructura
- `session/*` — verificación de sesión: ocurre en background sin acción del usuario
- Lista pequeña y estable: estos 2 contextos son los únicos identificados [PROVEN]
- Si aparece un contexto nuevo silencioso en el futuro, se agrega aquí (1 línea)

**Diferencia clave vs Opción A (opt-out por action type):**
Opción A requería listar TODOS los action types silenciosos (`auth/logout`,
`auth/refreshToken`, `session/verify`, etc.). Con Opción C se lista CONTEXTOS
(prefijos), no action types individuales — la lista permanece pequeña aunque
los thunks de `auth` se multipliquen.

---

### Componente 4: Integración en `store.js`

```js
// Dos cambios:
// 1. Reducer: loading: loadingReducer
// 2. Middleware chain: .concat(..., loadingMiddleware)
// El orden importa: loadingMiddleware DESPUÉS de errorHandlingMiddleware
// (errores se procesan primero, loading se limpia después)
```

---

### Componente 5: Migración piloto — `LogsPage` + `ETLLogsPage`

**Patrón de migración (1 línea por página):**

```jsx
// ANTES:
const loading = useSelector(selectLogsLoading)
return loading ? <LoadingSpinner message="Cargando logs..." /> : <tabla/>

// DESPUÉS:
import { selectIsLoading } from '@redux/slices/loadingSlice'
const isLoading = useSelector(selectIsLoading('logs'))
return isLoading ? <LoadingSpinner message="Cargando logs..." /> : <tabla/>
```

El `<LoadingSpinner>` permanece en su posición inline — el middleware no fuerza
un spinner global. El componente mantiene control de dónde aparece el spinner.

**Criterio de spinners (documentado):**
- `LoadingSpinner` (CSS puro) → carga **inline**: dentro de una sección (tabla,
  lista, panel). El usuario sigue viendo el resto de la UI.
- `AnimatedLoadingSpinner` (Framer Motion) → carga de **página completa** o
  transición entre rutas. La UI anterior desaparece con fade antes de la nueva.

---

## Decisiones de Arquitectura (ADR)

### ADR-ui-loading-middleware

**Decisión:** Implementar loading global mediante middleware Redux que intercepta
`*/pending` y `*/fulfilled|rejected` para gestionar contadores por contexto.

**Alternativas rechazadas:**
- A (opt-out por action type): lista negra de action types — deuda técnica garantizada
- B (opt-in via `meta.showLoading`): requiere cambiar 54 thunks o sus callsites

**Motivación:**
- Opción C no requiere cambios en thunks ni slices existentes
- Convive con el estado `loading` local durante la transición (no rompe nada)
- `SILENT_CONTEXTS` es 10× más estable que una lista de action types individuales

**Consecuencias:**
- El contexto es implícito (prefijo del type). Si un slice cambia su prefijo,
  el contexto del middleware cambia también.
- Los componentes que quieran el estado centralizado deben migrar el selector.
  Los que no migren siguen funcionando con su selector local.

### ADR-ui-loading-pilot-scope

**Decisión:** Scope piloto limitado a `LogsPage` + `ETLLogsPage`.

**Motivación:**
- Valida que el middleware funciona sin regresar las otras 8 páginas
- `LogsPage` tiene la tabla más compleja — es el caso de uso representativo
- `ETLLogsPage` carga datos similares desde un endpoint diferente — segundo
  caso de uso diferente con bajo riesgo de conflicto

**Out of scope en este WP:**
- Migración de las otras 8 páginas → WP separado de deuda técnica post-piloto
- Eliminación del `loading: boolean` de los slices existentes → después del piloto

---

## Scope del WP (confirmado)

### In scope

| Item | Justificación |
|------|--------------|
| Renombre `ApiErrorToast` → `ApiErrorAlert` (6 archivos) | Clean Code naming — impacto bajo, valor alto |
| `loadingSlice.js` (nuevo) | Base del sistema de loading centralizado |
| `loadingMiddleware.js` (nuevo) | Interceptor middleware — análogo a errorHandlingMiddleware |
| Integración en `store.js` | Wiring reducer + middleware |
| Migración `LogsPage` | Piloto — valida el sistema |
| Migración `ETLLogsPage` | Segundo caso de uso del piloto |
| TDD completo para los 5 componentes nuevos/modificados | Cobertura consistente con estándar del proyecto |
| Artefacto de análisis de migración completa | Decisión informada para WP de deuda técnica |

### Out of scope

| Item | Razón |
|------|-------|
| Migración de las otras 8 páginas | WP separado post-piloto |
| Eliminar `loading: boolean` de slices existentes | Requiere validar el piloto primero |
| Cambios en `errorHandlingMiddleware` | Funciona correctamente, no tiene relación |
| Migración de `AnimatedLoadingSpinner` | No hay problema de naming — fuera de scope |

---

## Próximo paso

→ **Phase 8 PLAN EXECUTION**: descomponer en tareas atómicas T-NNN con DAG.

Ver: `strategy/loading-complete-migration-analysis.md` para el análisis de
migración completa (las 10 páginas).
