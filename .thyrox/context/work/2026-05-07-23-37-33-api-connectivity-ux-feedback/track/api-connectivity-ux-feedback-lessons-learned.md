```yml
created_at: 2026-05-08 00:43:21
project: IACT-UI
work_package: 2026-05-07-23-37-33-api-connectivity-ux-feedback
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Borrador
total_lessons: 6
```

# Lessons Learned: api-connectivity-ux-feedback

## Propósito

Capturar qué aprendió el equipo durante este work package — qué funcionó, qué falló,
y qué regla generalizable se puede extraer para no repetir el error o para replicar el éxito.

---

## Lecciones

### L-001: `jest.mock` sin `__esModule: true` rompe `import default` en módulos bajo prueba

**Qué pasó**

Los tests de `ActiveSessions.test.js` pasaron el primer `render()` pero todas las
aserciones fallaban con `sessions.map is not a function` (sessions=undefined). El store
tenía el preloadedState correcto, el selector era correcto, y el mock de `authService`
estaba configurado en `beforeEach`. Sin embargo, después del render, `state.auth.sessions`
era `undefined`.

**Raíz**

La factory de `jest.mock('@services/authService', () => ({ default: {...}, ... }))` no
incluía `__esModule: true`. Sin esa flag, babel-jest trata el objeto como CJS y
`_interopRequireDefault` lo envuelve: `authService` en `authSlice.js` se convierte en el
objeto completo `{ default: {...}, getActiveSessions: fn_B }` en lugar del `default`.
La thunk llamaba `authService.getActiveSessions()` (fn_B, no configurada en beforeEach),
que devolvía `undefined`, y `state.sessions = undefined`.

**Fix aplicado**

Agregar `__esModule: true` a la factory del mock:
```js
jest.mock('@services/authService', () => ({
  __esModule: true,
  default: { getActiveSessions: jest.fn(), revokeSession: jest.fn() },
}))
```

**Regla**

Cuando se mockea un módulo ES con `jest.mock()` que usa `export default`, incluir
`__esModule: true` en la factory — de lo contrario `import X from '...'` en el módulo
bajo prueba recibe el objeto completo, no el `default`, generando instancias de
`jest.fn()` distintas a las configuradas en `beforeEach`.

---

### L-002: `fetchActiveSessions.pending` limpia `sessionsError` — tests de error necesitan mock que rechace

**Qué pasó**

El test "should show error message when sessionsError is set" fallaba porque el
`preloadedState` tenía `sessionsError: 'Error al cargar sesiones'` visible al primer
render, pero desaparecía antes de que `waitFor` pudiera verificarlo. Al usar
`mockImplementation(() => new Promise(() => {}))` (never-resolving), la UI quedaba
atrapada en loading state, ocultando el error.

**Raíz**

El reducer `fetchActiveSessions.pending` hace `state.sessionsError = null`. El thunk
se dispara en `useEffect`, que corre dentro del `act()` de RTL. Por tanto, la secuencia
es: render con error → pending borra el error → loading state. Si el mock nunca resuelve,
la UI se queda en loading, sin mostrar el error.

**Fix aplicado**

Cambiar el mock del test de error a `mockRejectedValue(new Error('...'))`. El thunk
captura el error y llama `rejectWithValue({ message, statusCode })`. El reducer `rejected`
restaura `sessionsError` con el mensaje, y `sessionsLoading = false`. La UI muestra
el error de nuevo.

**Regla**

Cuando se testea el estado de error de un componente Redux-connected, y el thunk tiene
un handler `.pending` que limpia el error: usar `mockRejectedValue` en lugar de never-resolving
promise — el thunk debe completar para que el reducer `rejected` restaure el error visible.

---

### L-003: `sed -i` en thunks con paréntesis anidados rompe sintaxis — usar Edit manual

**Qué pasó**

Al normalizar `rejectWithValue(error.message)` → `rejectWithValue({ message: error.message || 'Error...', statusCode: null })` con `sed -i`, los thunks `recoverPassword` y `changePassword` quedaron con paréntesis desbalanceados: `rejectWithValue({ message: err.message || 'Error...')` (cerrando con `)` en lugar de `})`. Causó errores de sintaxis en runtime.

**Raíz**

`sed -i` aplica sustitución línea a línea. La expresión regex no tenía en cuenta que
el cierre del `rejectWithValue(...)` original estaba en la misma línea, generando doble
cierre de paréntesis al insertar el objeto.

**Fix aplicado**

Verificación manual post-sed con `grep -n "rejectWithValue" authSlice.js` y corrección
de los 2 thunks afectados con Edit directo.

**Regla**

Cuando se use `sed -i` para transformar patrones con paréntesis anidados, siempre
validar con `grep` o `node --check` inmediatamente después. Para transformaciones
complejas en slices Redux, preferir Edit manual por archivo para mantener control
de contexto. `sed` es seguro para sustituciones simples 1:1 sin anidamiento.

---

### L-004: `fetchActiveSessions.pending` también limpia `sessionsLoading` — test de loading requiere mock nunca resuelto + preloadedState correcto

**Qué pasó**

El test "should show loading state" fallaba cuando el mock de `getActiveSessions`
resolvía inmediatamente (aunque con cualquier valor). El `act()` de RTL flusheaba
todos los microtasks antes del assert, y `sessionsLoading` ya era `false`.

**Raíz**

RTL's `render()` envuelve en `act()` que hace flush completo de todos los
microtasks y efectos. Si el mock resuelve sincrónicamente (Promise.resolve), el
ciclo pending→fulfilled ocurre antes de que el test pueda observar loading=true.

**Fix aplicado**

El test de loading usa `mockImplementation(() => new Promise(() => {}))` (never-resolving),
de modo que el thunk permanece en pending (sessionsLoading=true) indefinidamente.
La aserción sincrónica `expect(screen.getByRole('status')).toBeInTheDocument()` captura
ese estado antes de que el mock resuelva.

**Regla**

Para testear estado de loading en componentes Redux-connected con thunks async: usar
never-resolving mock promise para que el thunk quede en `pending` durante toda la
duración del test. El estado loading es inherentemente efímero en tests que usan
`act()` — solo es observable si el mock no resuelve.

---

### L-005: `containerComponents.test.jsx` necesita todos los slices que usa el componente

**Qué pasó**

El test `DashboardPage > renders without crashing` falló con
`TypeError: Cannot read properties of undefined (reading 'loading')` en
`selectReportsLoading` porque `buildStore` sólo incluía `auth` y `dashboard`,
pero `DashboardPage` ahora usa `reportsSlice` selectors que leen `state.reports`.

**Raíz**

Al reconectar `DashboardPage` a `reportsSlice` (T-010), el test existente que usaba
un store simplificado sin `reports` no fue actualizado en la misma sesión.

**Fix aplicado**

Agregar mock de `@redux/slices/reportsSlice` y clave `reports` en `buildStore`:
```js
jest.mock('@redux/slices/reportsSlice', () => ({ __esModule: true,
  fetchDashboardMetrics: jest.fn(() => ({ type: 'reports/...' })),
  selectMetrics: (s) => s.reports?.metrics ?? null,
  selectReportsLoading: (s) => s.reports?.loading ?? false,
}))
```

**Regla**

Cuando se cambia el slice que provee datos a un componente (p.ej. dashboardSlice →
reportsSlice), actualizar todos los archivos de test que usan `buildStore` o
`configureStore` en el mismo commit — los tests de componentes existentes asumen
la estructura de store que existía cuando se escribieron.

---

### L-006: Exit condition de SSE no se implementó en Phase 10 — quedó como deuda

**Qué pasó**

La exit condition #5 del WP requería un handler en `mockInterceptor` para simular
SSE (`/api/realtime/metrics/`). Esta condición fue identificada en Phase 1 DISCOVER
pero no se creó una tarea T-NNN en el task plan para implementarla.

**Raíz**

El análisis de Phase 1 notó correctamente que SSE con `EventSource` nativo no puede
ser interceptado por el `mockInterceptor` basado en axios. Sin estrategia definida
(MSW, service worker, mock de EventSource), la tarea no se tradujo a T-NNN.

**Fix aplicado**

No se implementó en este WP. Se convierte en T-DT-001 para el siguiente WP de
infraestructura de testing.

**Regla**

Cuando una exit condition requiere una estrategia técnica no resuelta (p.ej. cómo
mockear SSE sin axios), el bloqueador debe resolverse en Phase 5 STRATEGY antes de
Phase 8 PLAN EXECUTION — no dejarlo como "tarea pendiente" en exit conditions sin
T-NNN correspondiente.

---

## Patrones identificados

| Patrón | Lecciones relacionadas | Acción sistémica |
|--------|----------------------|------------------|
| **Mock ESM-CJS mismatch** | L-001 | Añadir `__esModule: true` a template de mock factories en guidelines de testing |
| **Redux async state observability** | L-002, L-004 | Documentar patrón "mock-to-reject para error state, never-resolve para loading state" en testing guidelines |
| **Store incompleto en tests de componentes** | L-005 | Convención: al mover un componente de slice A → slice B, buscar con grep todos los test files que usan el store y actualizarlos |
| **Exit condition sin T-NNN** | L-006 | En Phase 8 PLAN EXECUTION, verificar que toda exit condition tiene ≥1 T-NNN que la satisfaga |

---

## Qué replicar

- **Normalización de error payload en middleware**: defender el middleware contra tipos
  inesperados (`typeof rawError === 'string'`) es más robusto que confiar en que todos
  los thunks usen el formato correcto. Aplicar el mismo patrón a cualquier middleware
  que procese `action.payload`.

- **`__esModule: true` siempre en mocks de módulos ES con default export**: convención
  simple que elimina toda una clase de bugs silenciosos en tests.

- **Estrategia de mock por capa**: mockear el servicio (`@services/authService`) en lugar
  del slice (`@redux/slices/authSlice`) permite que los selectors y el reducer real corran
  en tests de componentes — tests más realistas con menos acoplamiento.

---

## Deuda pendiente

| ID | Descripción | Prioridad | Work package sugerido |
|----|-------------|-----------|----------------------|
| T-DT-001 | SSE mock para `/api/realtime/metrics/` — `EventSource` no interceptable por axios mockInterceptor; necesita MSW o mock class | Media | sse-mock-infrastructure |
| T-DT-002 | `dashboardSlice.fetchDashboardData` usa `getMockDashboardData()` hardcodeado; `Dashboard.jsx` y `useDashboard.js` aún lo consumen | Alta | dashboard-slice-cleanup |
| T-DT-003 | 10 pages/components sin test dedicado (AlertsPage, ProfilePage, AccessPage, AuditPage, ScheduledReports, ExportHistory, ExportPreview, ChartComponent, JobActions, JobProgressBar) | Media | test-coverage-gap |
| T-DT-004 | `ProfilePage` no muestra errores al usuario (has loading, no error state) | Baja | ux-error-visibility |

---

## Deuda epistémica

Claims generados en Phase 1 DISCOVER que no se re-verificaron en stages posteriores:

| Claim | Origen | Estado | Acción |
|-------|--------|--------|--------|
| "loadingMiddleware no consume ninguna página excepto logs" | Phase 1 HAL-7 | Confirmado en T-014: DashboardPage usa selectReportsLoading; ScheduledReportPage y PipelineStatusPage usan selectores de slice. loadingMiddleware global disponible pero no forzosamente requerido | Cerrado |
| "useRealTimeMetrics usa EventSource nativo, no interceptable por axios mockInterceptor" | Phase 1 HAL-5 | Confirmado — no se implementó SSE mock en este WP | Convertido en T-DT-001 |
| "DashboardPage es el dashboard principal, AnalyticsDashboard es el secundario" | Phase 1 HAL-1 | INFERRED — no verificado contra router; ambas rutas coexisten | Pendiente re-verificación en T-DT-002 |

---

## Checklist de cierre

- [x] Cada lección tiene raíz identificada (no solo síntoma)
- [x] Cada lección tiene regla generalizable
- [x] Patrones sistémicos documentados si aplica
- [x] Deuda técnica registrada con prioridad
- [x] Documento commiteado en `work/.../track/lessons-learned.md`
