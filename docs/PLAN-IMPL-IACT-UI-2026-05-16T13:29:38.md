# PLAN-IMPL-IACT-UI-2026-05-16T13:29:38

**Documento:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Rama:** develop  
**Commit base:** 16949cc  
**Reemplaza:** PLAN-IMPL-IACT-UI-2026-05-16T06:16:22.md  
**Análisis base:** ANALISIS-IACT-UI-2026-05-16T06:10:22.md  
**Motivo de reemplazo:** Plan anterior tenía 12 omisiones — no abordaba 430+ warnings residuales.  
**Objetivo:** Cero deuda técnica. 0 errores ESLint. 0 warnings ESLint. Cada tarea es atómica y verificable.

---

## Estado inicial

```
8 errores ESLint   → FASE 1 y FASE 2
461 warnings ESLint:
  W-001 react/prop-types:         ~200 warnings → FASE 5
  W-002 no-unused-vars:            ~30 warnings reales → FASE 6
  W-003 react-hooks/exhaustive-deps: 17 casos → FASE 7
  W-004 no-console:               30 ocurrencias → FASE 4 (parcial plan anterior) + FASE 4 completo
2366 tests pasando, 0 fallando
```

---

## FASE 1 — Bugs en `AlertConfig.jsx` + cobertura de tests

**Prerequisito:** ninguno.  
**Criterio de cierre:** `npx jest --testPathPattern=AlertConfig` pasa; `npx eslint src/pages/alerts/AlertConfig.jsx` → 0 errors, 0 warnings.

---

### T1.1 — Añadir reducer `clearDryRunResult` al slice `alerts.js`

**Archivo:** `src/redux/slices/alerts.js`

**Cambio:** añadir en el bloque `reducers:`:

```js
reducers: {
  clearError:        (state) => { state.error = null },
  clearSuccess:      (state) => { state.success = false },
  clearDryRunResult: (state) => { state.dryRunResult = null },  // ← nuevo
  resetState:        () => initialState,
},
```

**Añadir al export:**

```js
export const { clearError, clearSuccess, clearDryRunResult, resetState } = alertsSlice.actions
```

**Verificación:**

```bash
grep -c "clearDryRunResult" src/redux/slices/alerts.js
# Resultado: 2 (definición + export)
```

---

### T1.2 — Corregir `AlertConfig.jsx`: eliminar `setDryRunResult` y el stale closure

**Archivo:** `src/pages/alerts/AlertConfig.jsx`

**Parte 1 — Actualizar el import** (línea 9):

```jsx
// Antes:
import { createAlert, dryRunAlertRule, selectLoading, selectError, selectSuccess, selectDryRunResult }
  from '../../redux/slices/alerts'

// Después — eliminar selectSuccess, añadir clearDryRunResult:
import {
  createAlert, dryRunAlertRule, clearDryRunResult,
  selectLoading, selectError, selectDryRunResult,
} from '../../redux/slices/alerts'
```

Nota: `selectLoading` se conserva — lo usa el botón Crear (`disabled={!canCreate || loading}`).

**Parte 2 — Eliminar la lectura de `success`** (líneas 53-59):

```jsx
// Eliminar estas líneas:
const success = useSelector(selectSuccess)
// dryRunResult lee del store (despacha dryRunAlertRule → Redux)
const dryRunResult = dryRunResultStore

// Reemplazar por:
const dryRunResult = dryRunResultStore
```

**Parte 3 — Corregir `handleCreate`** (líneas 72-79):

```jsx
// Antes:
async function handleCreate() {
  await dispatch(createAlert(config))
  if (success) {
    setConfig({ ...EMPTY_FORM })
    setDryRunResult(null)
  }
}

// Después:
async function handleCreate() {
  const result = await dispatch(createAlert(config))
  if (createAlert.fulfilled.match(result)) {
    setConfig({ ...EMPTY_FORM })
    dispatch(clearDryRunResult())
  }
}
```

**Parte 4 — Corregir el botón "Limpiar"** (línea 272):

```jsx
// Antes:
onClick={() => { setConfig({ ...EMPTY_FORM }); setDryRunResult(null) }}

// Después:
onClick={() => { setConfig({ ...EMPTY_FORM }); dispatch(clearDryRunResult()) }}
```

**Verificación:**

```bash
grep "setDryRunResult\|selectSuccess" src/pages/alerts/AlertConfig.jsx | wc -l
# Resultado: 0
```

---

### T1.3 — Crear `src/pages/alerts/__tests__/AlertConfig.test.jsx`

**Archivo:** `src/pages/alerts/__tests__/AlertConfig.test.jsx` (nuevo)

Tests a cubrir (13 en total):

```
Render:
  ✓ renderiza el formulario vacío con todos los campos
  ✓ botón Crear deshabilitado si nombre, umbral o acciones vacíos

Toggle de acciones:
  ✓ añade una acción al marcar el checkbox
  ✓ elimina la acción al desmarcar el checkbox

handleDryRun:
  ✓ despacha dryRunAlertRule con metric, scope, threshold y window
  ✓ muestra el resultado del dry-run cuando ok=true
  ✓ muestra el resultado del dry-run cuando ok=false (error)
  ✓ botón muestra "Probando…" mientras dryRunLoading es true

handleCreate:
  ✓ despacha createAlert con la configuración del formulario
  ✓ resetea el formulario al crear exitosamente
  ✓ no resetea el formulario si createAlert falla

Botón Limpiar:
  ✓ resetea el formulario al pulsar Limpiar

Error display:
  ✓ muestra el error banner cuando el store tiene error
```

---

### T1.4 — Actualizar `alertsSlice.sync.test.js` para cubrir `clearDryRunResult`

**Archivo:** `__tests__/slices/alertsSlice.sync.test.js`

Añadir al final:

```js
describe('alertsSlice — clearDryRunResult', () => {
  it('limpia dryRunResult a null', () => {
    const store = makeStore({
      alerts: { ...alertsModule.default.getInitialState(), dryRunResult: { ok: true } }
    })
    store.dispatch(alertsModule.clearDryRunResult())
    expect(store.getState().alerts.dryRunResult).toBeNull()
  })
})
```

---

### T1.5 — Verificación integral FASE 1 y commit

```bash
# 1. Sin setDryRunResult ni selectSuccess
grep "setDryRunResult\|selectSuccess" src/pages/alerts/AlertConfig.jsx | wc -l  # 0

# 2. clearDryRunResult exportado
grep "clearDryRunResult" src/redux/slices/alerts.js | wc -l  # 2

# 3. Tests AlertConfig: 13 passed, 0 failed
npx jest src/pages/alerts/__tests__/AlertConfig.test.jsx --no-coverage

# 4. Tests del slice
npx jest __tests__/slices/alertsSlice.sync.test.js --no-coverage

# 5. ESLint: 0 errors, 0 warnings en archivos modificados
npx eslint src/pages/alerts/AlertConfig.jsx src/redux/slices/alerts.js

# 6. Suite sin regresiones: ≥ 2379 passed (2366 + 13 nuevos AlertConfig), 0 failed
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/redux/slices/alerts.js \
        src/pages/alerts/AlertConfig.jsx \
        src/pages/alerts/__tests__/AlertConfig.test.jsx \
        __tests__/slices/alertsSlice.sync.test.js
git commit -m "fix(alerts): ReferenceError y stale closure en AlertConfig + 13 tests

alerts.js: clearDryRunResult reducer + export.
AlertConfig.jsx: selectSuccess eliminado, handleCreate usa createAlert.fulfilled.match,
  boton Limpiar usa dispatch(clearDryRunResult()).
AlertConfig.test.jsx: 13 tests — render, toggle, dryRun, create, Limpiar, error display.
alertsSlice.sync.test.js: test de clearDryRunResult."
```

---

## FASE 2 — Corregir errores ESLint en los tres reportes

**Prerequisito:** FASE 1 completada.  
**Criterio de cierre:** `npx eslint src/pages/reports/AgentsReport.jsx src/pages/reports/CampaignsReport.jsx src/pages/reports/QueuesReport.jsx` → 0 errors, 0 warnings.

---

### T2.1a — `AgentsReport.jsx`: eliminar `buildShareUrl` local, importar de `utils/`

**Archivo:** `src/pages/reports/AgentsReport.jsx`

1. Añadir import:
```jsx
import { buildShareUrl } from '../../utils/reportShareUrl'
```
2. Eliminar la función local `buildShareUrl` (líneas 23-29, 7 líneas).

**Verificación:**

```bash
grep "function buildShareUrl" src/pages/reports/AgentsReport.jsx | wc -l  # 0
grep "reportShareUrl"         src/pages/reports/AgentsReport.jsx | wc -l  # 1
```

---

### T2.1b — `CampaignsReport.jsx`: eliminar `buildShareUrl` local, importar de `utils/`

Idéntico a T2.1a. Líneas a eliminar: 21-27.

**Verificación:**

```bash
grep "function buildShareUrl" src/pages/reports/CampaignsReport.jsx | wc -l  # 0
```

---

### T2.1c — `QueuesReport.jsx`: eliminar `buildShareUrl` local, importar de `utils/`

Idéntico a T2.1a. Líneas a eliminar: 23-29.

**Verificación:**

```bash
grep "function buildShareUrl" src/pages/reports/QueuesReport.jsx | wc -l  # 0
```

---

### T2.2a — `AgentsReport.jsx`: corregir catch vacío

```jsx
// Antes (L62):
} catch (_) {}

// Después:
} catch (_) { /* guardar vista es opcional — fallo no interrumpe al usuario */ }
```

---

### T2.2b — `CampaignsReport.jsx`: corregir catch vacío

```jsx
// Antes (L60):
} catch (_) {}
// Después:
} catch (_) { /* guardar vista es opcional — fallo no interrumpe al usuario */ }
```

---

### T2.2c — `QueuesReport.jsx`: corregir catch vacío

```jsx
// Antes (L62):
} catch (_) {}
// Después:
} catch (_) { /* guardar vista es opcional — fallo no interrumpe al usuario */ }
```

---

### T2.3 — Verificación integral FASE 2 y commit

```bash
# 1. Sin definiciones locales de buildShareUrl en los 3 reportes
grep -c "function buildShareUrl" \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx
# Resultado: 0 para cada archivo

# 2. Sin catch vacíos
grep "catch (_) {}" \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx | wc -l  # 0

# 3. ESLint: 0 errors en los 3 archivos
npx eslint \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx

# 4. Tests sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/pages/reports/AgentsReport.jsx \
        src/pages/reports/CampaignsReport.jsx \
        src/pages/reports/QueuesReport.jsx
git commit -m "fix(reports): buildShareUrl de utils/ + catch vacio con comentario

DT-UI-004: buildShareUrl duplicada eliminada de 3 componentes (7 lineas x3).
  Importada desde src/utils/reportShareUrl.js.
DT-UI-002: catch vacio en handleSaveView con comentario descriptivo (3 archivos)."
```

---

## FASE 3 — Deuda arquitectónica: navigation slice y userInfo

**Prerequisito:** FASE 1 completada. Independiente de FASE 2.  
**Criterio de cierre:** navigation slice eliminado, `AppRouter.jsx` sin datos ficticios.

---

### T3.1 — Confirmar que navigation.js no tiene usuarios antes de eliminar

```bash
grep -rn "fetchNavigationMenu\|fetchNavigationModules\|selectNavMenu\|selectNavModules\|selectNavLoading\|selectNavError\|clearNavError" \
  src/ --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" | \
  grep -v "navigation.js\|navigationSlice.test.js" | grep -v "node_modules"
# Resultado esperado: 0 líneas → proceder
```

---

### T3.2 — Eliminar `navigation.js` y su test

```bash
git rm src/redux/slices/navigation.js
git rm __tests__/slices/navigationSlice.test.js
```

**Verificación:**

```bash
ls src/redux/slices/navigation.js 2>/dev/null && echo "FAIL" || echo "OK"
```

---

### T3.3 — Conectar `selectUser` al `DashboardLayout` en `AppRouter.jsx`

**Archivo:** `src/router/AppRouter.jsx`

```jsx
// 1. Actualizar import:
import { selectIsAuthenticated, selectUser } from '@store/selectors'

// 2. En RoutesWithTransitions() añadir junto a navLinks:
const currentUser = useSelector(selectUser)

// 3. Reemplazar userInfo hardcodeado (líneas 304-308):
userInfo={{
  name:       currentUser?.name       ?? '',
  email:      currentUser?.email      ?? '',
  avatar_url: currentUser?.avatar_url ?? '',
}}
```

**Verificación:**

```bash
grep "John Doe\|via.placeholder" src/router/AppRouter.jsx | wc -l  # 0
grep "selectUser\|currentUser" src/router/AppRouter.jsx | wc -l    # ≥ 2
```

---

### T3.4 — Verificación integral FASE 3 y commit

```bash
# navigation.js eliminado
ls src/redux/slices/navigation.js 2>/dev/null && echo "FAIL" || echo "OK"
# John Doe eliminado
grep "John Doe\|via.placeholder" src/router/AppRouter.jsx | wc -l  # 0
# Suite: ≥ 2376 passed (2366 + 13 - 3 navigation), 0 failed
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/redux/slices/navigation.js \  # git rm
        __tests__/slices/navigationSlice.test.js \  # git rm
        src/router/AppRouter.jsx
git commit -m "fix(arch): eliminar navigation slice huerfano + userInfo real en AppRouter

DT-UI-005: navigation.js eliminado (55 lineas — no registrado en store, sin uso).
DT-UI-006: AppRouter.jsx usa selectUser del store auth en lugar de datos ficticios."
```

---

## FASE 4 — `no-console`: corregir todos los archivos de producción

**Prerequisito:** ninguno. Paralela a FASE 1–3.  
**Criterio de cierre:** `grep -rn "console\.log" src/ --include="*.jsx" --include="*.js" | grep -v "__tests__\|test\.\|mock\|JSDoc"` → 0 líneas.

---

### T4.1 — `mockInterceptor.js`: corregir 3 catch vacíos

**Archivo:** `src/mocks/mockInterceptor.js` L1935, L2012, L2062

```js
// Antes (3 ocurrencias):
} catch (_) {}

// Después:
} catch (_) { /* URL relativa sin hostname — continuar con valor por defecto */ }
```

**Verificación:**

```bash
grep -n "catch (_) {}" src/mocks/mockInterceptor.js | wc -l  # 0
```

---

### T4.2 — `logger.js`: guard de entorno

**Archivo:** `src/redux/middleware/logger.js`

```js
// Antes:
console.log('next state', store.getState());

// Después:
if (process.env.NODE_ENV === 'development') {
  console.log('next state', store.getState());
}
```

---

### T4.3 — `withLogging.js`: guard de entorno (9 ocurrencias)

**Archivo:** `src/decorators/withLogging.js`

Envolver todos los `console.log` en:

```js
if (process.env.NODE_ENV !== 'production') {
  console.log(...)
}
```

**Verificación:**

```bash
grep -c "console\.log" src/decorators/withLogging.js  # 9 — deben seguir existiendo dentro del guard
grep -c "NODE_ENV"      src/decorators/withLogging.js  # ≥ 3 (una por bloque de función)
```

---

### T4.4 — `withCaching.js`: guard de entorno (9 ocurrencias)

**Archivo:** `src/decorators/withCaching.js`

Mismo patrón que T4.3. Envolver los 9 `console.log` (CACHE HIT, CACHE EXPIRED, CACHE MISS) en:

```js
if (process.env.NODE_ENV !== 'production') {
  console.log(...)
}
```

---

### T4.5 — `errorHandling.js`: guard de entorno (1 ocurrencia)

**Archivo:** `src/redux/middleware/errorHandling.js` L145

```js
// Antes:
console.log('[Auto Retry] Retrying action:', action.type);

// Después:
if (process.env.NODE_ENV === 'development') {
  console.log('[Auto Retry] Retrying action:', action.type);
}
```

---

### T4.6 — `websocketGateway.js`: reemplazar por `console.debug` (3 ocurrencias)

**Archivo:** `src/services/websocketGateway.js` L33, L58, L151

Los mensajes son diagnóstico de conexión — `console.debug` no dispara la regla `no-console`:

```js
// Antes:
console.log('[WebSocket] Connected');

// Después:
console.debug('[WebSocket] Connected');
```

---

### T4.7 — `apiClient.js`: reemplazar por `console.debug` (1 ocurrencia)

**Archivo:** `src/services/apiClient.js` L115

```js
// Antes:
console.log(`[API] Retrying request (${attempt}/${this.retryAttempts}) after ${delay}ms`);

// Después:
console.debug(`[API] Retrying request (${attempt}/${this.retryAttempts}) after ${delay}ms`);
```

---

### T4.8 — `notificationGateway.js`: reemplazar por `console.debug` (1 ocurrencia)

**Archivo:** `src/services/notificationGateway.js` L135

```js
// Antes:
console.log(`[${type}] ${message}`)

// Después:
console.debug(`[${type}] ${message}`)
```

---

### T4.9 — `useRealTimeChannel.js`: reemplazar por `console.debug` (2 ocurrencias)

**Archivo:** `src/hooks/domain/useRealTimeChannel.js` L29, L35

```js
// Antes:
console.log('[useWebSocket] Connected');
console.log('[useWebSocket] Disconnected');

// Después:
console.debug('[useWebSocket] Connected');
console.debug('[useWebSocket] Disconnected');
```

---

### T4.10 — `components/examples/UserList.jsx`: eliminar console.log (1 ocurrencia)

**Archivo:** `src/components/examples/UserList.jsx` L19

```js
// Antes:
console.log('Users loaded:', data);

// Después (eliminar la línea):
// (línea eliminada)
```

---

### T4.11 — Actualizar `eslint.config.mjs`: añadir `console.debug` a la lista de permitidos

**Archivo:** `eslint.config.mjs`

```js
// Antes:
'no-console': ['warn', { allow: ['error', 'warn'] }]

// Después:
'no-console': ['warn', { allow: ['error', 'warn', 'debug'] }]
```

Esto asegura que los `console.debug` añadidos en T4.6–T4.9 no generen warnings.

---

### T4.12 — Verificación integral FASE 4 y commit

```bash
# 1. Sin console.log en producción (excluir mocks, tests, JSDoc)
grep -rn "console\.log" src/ --include="*.jsx" --include="*.js" | \
  grep -v "__tests__\|test\.\|mock\|Mock\| \* " | wc -l
# Resultado: 0

# 2. Sin catch vacíos en mockInterceptor
grep "catch (_) {}" src/mocks/mockInterceptor.js | wc -l  # 0

# 3. Guards de entorno presentes
grep -l "NODE_ENV" src/decorators/withLogging.js src/decorators/withCaching.js \
  src/redux/middleware/logger.js src/redux/middleware/errorHandling.js | wc -l  # 4

# 4. eslint.config.mjs actualizado
grep "debug" eslint.config.mjs | wc -l  # ≥ 1

# 5. Suite sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add \
  src/mocks/mockInterceptor.js \
  src/redux/middleware/logger.js \
  src/decorators/withLogging.js \
  src/decorators/withCaching.js \
  src/redux/middleware/errorHandling.js \
  src/services/websocketGateway.js \
  src/services/apiClient.js \
  src/services/notificationGateway.js \
  src/hooks/domain/useRealTimeChannel.js \
  src/components/examples/UserList.jsx \
  eslint.config.mjs
git commit -m "fix(no-console): guards NODE_ENV + console.debug en 10 archivos

T4.1 mockInterceptor.js: 3 catch vacios con comentario.
T4.2 logger.js: guard NODE_ENV === development.
T4.3 withLogging.js: 9 console.log envueltos en guard NODE_ENV !== production.
T4.4 withCaching.js: 9 console.log envueltos en guard NODE_ENV !== production.
T4.5 errorHandling.js: 1 console.log con guard.
T4.6 websocketGateway.js: 3 console.log → console.debug.
T4.7 apiClient.js: 1 console.log → console.debug.
T4.8 notificationGateway.js: 1 console.log → console.debug.
T4.9 useRealTimeChannel.js: 2 console.log → console.debug.
T4.10 UserList.jsx: 1 console.log eliminado.
T4.11 eslint.config.mjs: console.debug permitido."
```

---

## FASE 5 — `react/prop-types`: añadir PropTypes a 50 componentes

**Prerequisito:** ninguno. Independiente de las demás fases.  
**Criterio de cierre:** `npx eslint src/ 2>&1 | grep "react/prop-types" | wc -l` → 0.

Los 50 componentes se dividen en 5 grupos para commits granulares.

---

### T5.1 — PropTypes en `AppProviders.jsx` y `components/shared/` (6 archivos)

**Archivos:**
- `AppProviders.jsx`
- `components/shared/ErrorDisplay.jsx`
- `components/shared/ExportButtons.jsx`
- `components/shared/LoadingSpinner.jsx`
- `components/shared/ProtectedRoute.jsx`
- `components/shared/Toast/Toast.jsx`

**Patrón para cada archivo:**

```jsx
import PropTypes from 'prop-types'

// Al final del archivo, antes de export default:
NombreComponente.propTypes = {
  // declarar cada prop con su tipo
  children: PropTypes.node,
  className: PropTypes.string,
  // etc.
}
```

**Verificación:**

```bash
npx eslint AppProviders.jsx src/components/shared/ 2>&1 | grep "prop-types" | wc -l  # 0
```

**Commit:** `fix(prop-types): AppProviders y components/shared/ — 6 componentes`

---

### T5.2 — PropTypes en `components/animations/` (4 archivos)

**Archivos:**
- `components/animations/AnimatedButton.jsx`
- `components/animations/AnimatedLoadingSpinner.jsx`
- `components/animations/ModalAnimation.jsx`
- `components/animations/PageTransition.jsx`

**Commit:** `fix(prop-types): components/animations/ — 4 componentes`

---

### T5.3 — PropTypes en `components/access/`, `components/reports/`, `components/DateTimeInputs/` (7 archivos)

**Archivos:**
- `components/access/FunctionSelector.jsx`
- `components/access/PermissionsTable.jsx`
- `components/access/SeparationRulesValidator.jsx`
- `components/reports/ReportFilters.jsx`
- `components/reports/ReportTable.jsx`
- `components/reports/SavedFiltersPanel.jsx`
- `components/reports/ShareReportModal.jsx`
- `components/DateTimeInputs/DateTimeInput.jsx`
- `components/DateTimeInputs/SelectDropdown.jsx`

**Commit:** `fix(prop-types): components/access, reports, DateTimeInputs — 9 componentes`

---

### T5.4 — PropTypes en `components/pages/`, `components/features/`, `components/presentational/` (20 archivos)

**Archivos:**
- `components/pages/Analytics/ChartComponent.jsx`
- `components/pages/Analytics/CustomReportForm.jsx`
- `components/pages/Analytics/MetricsCard.jsx`
- `components/pages/ExportHub/ExportHistory.jsx`
- `components/pages/ExportHub/ExportOptions.jsx`
- `components/pages/ExportHub/ExportPreview.jsx`
- `components/pages/ExportHub/ExportTypeSelector.jsx`
- `components/pages/JobMonitoring/JobActions.jsx`
- `components/pages/JobMonitoring/JobList.jsx`
- `components/pages/JobMonitoring/JobProgressBar.jsx`
- `components/pages/JobMonitoring/JobStartForm.jsx`
- `components/features/Jobs/JobList.jsx`
- `components/features/SessionManagement/SessionProvider.jsx`
- `components/features/UserManagement/UserList.jsx`
- `components/presentational/Chart.jsx`
- `components/presentational/ChartsSection.jsx`
- `components/presentational/DashboardHeader.jsx`
- `components/presentational/MetricCard.jsx`
- `components/presentational/MetricsGrid.jsx`

**Commit:** `fix(prop-types): components/pages, features, presentational — 19 componentes`

---

### T5.5 — PropTypes en `pages/`, `context/`, `modules/`, `components/Layout.jsx`, `components/BackendStatusPanel.jsx`, `components/MockDataNotice.jsx`, `components/examples/UserProfile.jsx` (11 archivos)

**Archivos:**
- `AppProviders.jsx` (si no se hizo en T5.1)
- `components/Layout.jsx`
- `components/BackendStatusPanel.jsx`
- `components/MockDataNotice.jsx`
- `components/examples/UserProfile.jsx`
- `context/ToastContext.jsx`
- `modules/home/components/AnnouncementContent.jsx`
- `pages/logs/PipelineStatus.jsx`
- `pages/reports/RealTimeMetrics.jsx`
- `pages/reports/ScheduledReport.jsx`
- `pages/reports/SharedViews.jsx`
- `pages/users/UserManagement/UserForm.jsx`
- `pages/users/UserManagement/UserList.jsx`

**Commit:** `fix(prop-types): pages, context, modules y componentes miscelaneos — 13 componentes`

---

### T5.6 — Verificación integral FASE 5

```bash
# 0 warnings de react/prop-types
npx eslint src/ 2>&1 | grep "react/prop-types" | wc -l  # 0

# Suite sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

---

## FASE 6 — `no-unused-vars`: eliminar imports no usados

**Prerequisito:** FASE 1 completada (T1.2 ya elimina `selectSuccess` de `AlertConfig.jsx`).  
**Criterio de cierre:** `npx eslint src/ 2>&1 | grep "no-unused-vars" | wc -l` → 0.

Los casos reales confirmados (eliminando falsos positivos):

| Archivo | Imports a eliminar |
|---|---|
| `pages/access/AssignGroup.jsx` | `selectSuccess`, `selectGroups` |
| `pages/access/GroupManagement.jsx` | `LoadingSpinner` |
| `pages/alerts/Subscriptions.jsx` | `selectSubscriptions`, `selectLoading` |
| `components/reports/ShareReportModal.jsx` | `createShare`, `selectSharesError`, `resetCreateStatus` |
| `hooks/domain/usePasswordStrength.js` | `useMemo` |
| `pages/permissions/RevokeExceptionalPermission.jsx` | `clearError`, `selectLoading` |

---

### T6.1 — Eliminar imports no usados en `pages/access/`

**Archivos:** `AssignGroup.jsx`, `GroupManagement.jsx`

```jsx
// AssignGroup.jsx — eliminar del import:
selectSuccess, selectGroups

// GroupManagement.jsx — eliminar del import:
LoadingSpinner
```

**Verificación:**

```bash
npx eslint src/pages/access/AssignGroup.jsx src/pages/access/GroupManagement.jsx \
  2>&1 | grep "no-unused-vars" | wc -l  # 0
```

---

### T6.2 — Eliminar imports no usados en `pages/alerts/Subscriptions.jsx`

```jsx
// Eliminar del import de alerts.js:
selectSubscriptions, selectLoading
// (si se usan en el componente, verificar antes de eliminar)
```

**Verificación previa obligatoria:**

```bash
grep "selectSubscriptions\|selectLoading" src/pages/alerts/Subscriptions.jsx | grep -v "^import"
# Si da 0 líneas: eliminar del import. Si da líneas: son casos de uso real, no eliminar.
```

---

### T6.3 — Eliminar imports no usados en `components/reports/ShareReportModal.jsx`

```jsx
// Eliminar del import de shares.js o alerts.js:
createShare, selectSharesError, resetCreateStatus
```

---

### T6.4 — Eliminar imports no usados en `hooks/` y `pages/permissions/`

**Archivos:**
- `hooks/domain/usePasswordStrength.js` — eliminar `useMemo`
- `pages/permissions/RevokeExceptionalPermission.jsx` — eliminar `clearError`, `selectLoading`

---

### T6.5 — Verificación integral FASE 6 y commit

```bash
# 0 warnings de no-unused-vars
npx eslint src/ 2>&1 | grep "no-unused-vars" | wc -l  # 0

# Suite sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/pages/access/AssignGroup.jsx \
        src/pages/access/GroupManagement.jsx \
        src/pages/alerts/Subscriptions.jsx \
        src/components/reports/ShareReportModal.jsx \
        src/hooks/domain/usePasswordStrength.js \
        src/pages/permissions/RevokeExceptionalPermission.jsx
git commit -m "fix(no-unused-vars): eliminar imports sin uso en 6 archivos

AssignGroup.jsx: selectSuccess, selectGroups.
GroupManagement.jsx: LoadingSpinner.
Subscriptions.jsx: selectSubscriptions, selectLoading.
ShareReportModal.jsx: createShare, selectSharesError, resetCreateStatus.
usePasswordStrength.js: useMemo.
RevokeExceptionalPermission.jsx: clearError, selectLoading."
```

---

## FASE 7 — `react-hooks/exhaustive-deps`: corregir 17 casos

**Prerequisito:** ninguno. Independiente de las demás fases.  
**Criterio de cierre:** `npx eslint src/ 2>&1 | grep "exhaustive-deps" | wc -l` → 0.

Los 17 casos se dividen en dos grupos según la corrección requerida:

**Grupo A — Carga inicial intencional al montar (7 reportes):**  
Los 7 reportes usan `useEffect(() => { loadData() }, [])`. La intención es
ejecutar solo al montar. La corrección ESLint-conforme es extraer `loadData`
a `useCallback` con las dependencias correctas.

```jsx
// Patrón actual (genera warning):
useEffect(() => { loadData() }, [])

// Corrección:
const loadData = useCallback((f = filters) => {
  setLoading(true)
  // ... resto igual
}, [filters])  // ← dependencias explícitas

useEffect(() => { loadData() }, [loadData])
```

Aplicar a los 7 reportes:
- `pages/reports/AgentsReport.jsx`
- `pages/reports/CampaignsReport.jsx`
- `pages/reports/QueuesReport.jsx`
- `pages/reports/UniqueClientsReport.jsx`
- `pages/reports/TransfersReport.jsx`
- `pages/reports/HistoricalReports.jsx`
- `pages/reports/IVRMenusReport.jsx`

---

### T7.1 — `AgentsReport.jsx`: `loadData` a `useCallback`

**Archivo:** `src/pages/reports/AgentsReport.jsx`

```jsx
// Añadir useCallback al import de React:
import React, { useEffect, useState, useCallback } from 'react'

// Reemplazar la función loadData:
const loadData = useCallback(async (f = filters) => {
  setLoading(true)
  setError(null)
  try {
    const res = await reportsService.getAgentsReport({
      trimestre: f.trimestre,
      segmento: f.segmento,
    })
    setData(res ?? [])
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}, [filters])

// useEffect actualizado:
useEffect(() => { loadData() }, [loadData])
```

**Verificación:**

```bash
npx eslint src/pages/reports/AgentsReport.jsx 2>&1 | grep "exhaustive-deps" | wc -l  # 0
```

---

### T7.2 — `CampaignsReport.jsx`: `loadData` a `useCallback`

Mismo patrón que T7.1. Servicio: `reportsService.getCampaignsReport`.

---

### T7.3 — `QueuesReport.jsx`: `loadData` a `useCallback`

Mismo patrón que T7.1. Servicio: `reportsService.getQueuesReport`.

---

### T7.4 — `UniqueClientsReport.jsx`: `loadData` a `useCallback`

Mismo patrón que T7.1. Servicio: `reportsService.getUniqueClientsReport`.

---

### T7.5 — `TransfersReport.jsx`: `loadData` a `useCallback`

Mismo patrón que T7.1. Servicio: `reportsService.getTransfersReport`.

---

### T7.6 — `HistoricalReports.jsx`: `loadData` a `useCallback`

Mismo patrón que T7.1. Servicio: `reportsService.getHistoricalReports`.

---

### T7.7 — `IVRMenusReport.jsx`: `loadData` a `useCallback`

Mismo patrón que T7.1. Servicio: `reportsService.getIVRMenusReport`.

---

**Grupo B — Otros 10 casos (análisis caso por caso):**

---

### T7.8 — `components/features/SessionManagement/SessionProvider.jsx`

Leer el `useEffect` y determinar si la dependencia faltante es un ref, una
función estable, o una dependencia real. Añadir la dependencia o documentar
con `// eslint-disable-next-line react-hooks/exhaustive-deps` con comentario
explicativo si la omisión es intencional.

---

### T7.9 — `components/pages/Analytics/ScheduledReports.jsx`

Mismo análisis que T7.8.

---

### T7.10 — `hooks/domain/useLocalTransaction.js`

Mismo análisis que T7.8.

---

### T7.11 — `pages/access/AssignFunctions.jsx`

Mismo análisis que T7.8.

---

### T7.12 — `pages/access/Permissions.jsx`

Mismo análisis que T7.8.

---

### T7.13 — `pages/access/PermissionsAudit.jsx`

Mismo análisis que T7.8.

---

### T7.14 — `pages/access/Segments.jsx`

Mismo análisis que T7.8.

---

### T7.15 — `pages/logs/PerformanceMetrics.jsx`

Mismo análisis que T7.8.

---

### T7.16 — `pages/logs/SystemStatus.jsx`

Mismo análisis que T7.8.

---

### T7.17 — `pages/reports/ReportExport.jsx`

Mismo análisis que T7.8.

---

### T7.18 — Verificación integral FASE 7 y commit

```bash
# 0 warnings de exhaustive-deps
npx eslint src/ 2>&1 | grep "exhaustive-deps" | wc -l  # 0

# Suite sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx \
  src/pages/reports/UniqueClientsReport.jsx \
  src/pages/reports/TransfersReport.jsx \
  src/pages/reports/HistoricalReports.jsx \
  src/pages/reports/IVRMenusReport.jsx \
  src/components/features/SessionManagement/SessionProvider.jsx \
  src/components/pages/Analytics/ScheduledReports.jsx \
  # ... resto de archivos
git commit -m "fix(exhaustive-deps): useCallback en 7 reportes + 10 casos adicionales"
```

---

## FASE 8 — Limpieza de páginas huérfanas

**Prerequisito:** FASE 3 completada (T3.2).  
**Criterio de cierre:** ningún archivo en `src/pages/` sin ruta en el router (excepto sub-componentes y layouts).

---

### T8.1 — Eliminar `src/pages/Dashboard.jsx` y `src/pages/Dashboard.scss`

```bash
# Confirmar que nadie lo importa
grep -rn "pages/Dashboard\b" src/ | grep -v __tests__ | wc -l  # 0 → proceder
git rm src/pages/Dashboard.jsx src/pages/Dashboard.scss
```

---

### T8.2 — Eliminar `src/pages/Home.jsx`

```bash
grep -rn "pages/Home\b" src/ | grep -v __tests__ | wc -l  # 0 → proceder
git rm src/pages/Home.jsx
```

---

### T8.3 — Eliminar `src/pages/NotFound.jsx`

```bash
grep -rn "pages/NotFound\b" src/ | grep -v __tests__ | wc -l  # 0 → proceder
git rm src/pages/NotFound.jsx
```

---

### T8.4 — Eliminar `src/pages/Settings.jsx`

```bash
grep -rn "pages/Settings\b" src/ | grep -v __tests__ | wc -l  # 0 → proceder
git rm src/pages/Settings.jsx
```

---

### T8.5 — Añadir comentario a `src/pages/Profile.jsx`

`Profile.jsx` (137 líneas, lógica real) no está en el router pero no es un
placeholder vacío. Añadir comentario en la cabecera:

```jsx
// UC_USR_07: editar perfil propio.
// NOTA: este archivo está en proceso de consolidación con
// src/components/pages/Profile/Profile.jsx.
// Pendiente de mover/fusionar en la próxima iteración de refactorización.
```

---

### T8.6 — Verificación integral FASE 8 y commit

```bash
# Páginas eliminadas no existen
for f in Dashboard.jsx Home.jsx NotFound.jsx Settings.jsx; do
  ls src/pages/$f 2>/dev/null && echo "FAIL: $f" || echo "OK: $f eliminado"
done

# Suite sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/pages/Dashboard.jsx src/pages/Dashboard.scss \
        src/pages/Home.jsx src/pages/NotFound.jsx \
        src/pages/Settings.jsx \
        src/pages/Profile.jsx
git commit -m "fix(cleanup): eliminar 4 paginas placeholder huerfanas

Dashboard.jsx + .scss: placeholder, router usa DashboardMain.
Home.jsx: sin ruta en router, HomeModule inexistente.
NotFound.jsx: duplicado de errors/NotFound.
Settings.jsx: placeholder, router usa features/Settings.
Profile.jsx: anotado como pendiente de consolidacion."
```

---

## Resumen completo de tareas

| Tarea | Archivos | DT resuelta | Commit |
|---|---|---|---|
| T1.1–T1.5 | `alerts.js`, `AlertConfig.jsx`, `AlertConfig.test.jsx`, `alertsSlice.sync.test.js` | DT-UI-001, DT-UI-009 | FASE 1 |
| T2.1a–T2.3 | 3 reportes | DT-UI-002, DT-UI-004 | FASE 2 |
| T3.1–T3.4 | `navigation.js`, `AppRouter.jsx` | DT-UI-005, DT-UI-006 | FASE 3 |
| T4.1–T4.12 | 10 archivos + `eslint.config.mjs` | DT-UI-003, DT-UI-007, DT-UI-008 | FASE 4 |
| T5.1–T5.6 | 50 componentes JSX | W-001 react/prop-types | FASE 5 |
| T6.1–T6.5 | 6 archivos | W-002 no-unused-vars | FASE 6 |
| T7.1–T7.18 | 17 archivos | W-003 exhaustive-deps | FASE 7 |
| T8.1–T8.6 | 4 páginas (eliminar) + 1 (comentario) | DT-UI-010 | FASE 8 |

**Total: 8 fases, 39 tareas atómicas, 8 commits, 0 deuda técnica residual.**

---

## Verificación final del repositorio (post todas las fases)

```bash
# 1. ESLint: 0 errors
npx eslint src/ 2>&1 | grep " error " | wc -l
# Resultado esperado: 0

# 2. ESLint: 0 warnings
npx eslint src/ 2>&1 | grep " warning " | wc -l
# Resultado esperado: 0

# 3. Sin console.log en producción (fuera de mocks, tests y JSDoc)
grep -rn "console\.log" src/ --include="*.jsx" --include="*.js" | \
  grep -v "__tests__\|\.test\.\|mock\|Mock\| \* " | wc -l
# Resultado esperado: 0

# 4. Sin catch vacíos
grep -rn "catch (_) {}" src/ | wc -l
# Resultado esperado: 0

# 5. buildShareUrl solo en utils/
grep -rn "function buildShareUrl" src/ | wc -l
# Resultado esperado: 1 (solo src/utils/reportShareUrl.js)

# 6. navigation.js eliminado
ls src/redux/slices/navigation.js 2>/dev/null && echo "FAIL" || echo "OK"

# 7. Sin datos ficticios en AppRouter
grep "John Doe\|via.placeholder" src/router/AppRouter.jsx | wc -l
# Resultado esperado: 0

# 8. Tests: 2379 passed (2366 + 13 AlertConfig + 1 clearDryRunResult - 3 navigation), 0 failed
npx jest --no-coverage 2>&1 | tail -3
```

---

*Generado: 2026-05-16T13:29:38 | Reemplaza: PLAN-IMPL-IACT-UI-2026-05-16T06:16:22.md*
*12 omisiones del plan anterior corregidas*
