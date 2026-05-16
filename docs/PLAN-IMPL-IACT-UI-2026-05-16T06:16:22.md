# PLAN-IMPL-IACT-UI-2026-05-16T06:16:22

**Documento:** PLAN-IMPL-IACT-UI-2026-05-16T06:16:22  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Rama:** develop  
**Commit base:** 16949cc  
**Análisis base:** ANALISIS-IACT-UI-2026-05-16T06:10:22.md  
**Objetivo:** Cero deuda técnica. Cada tarea es atómica, verificable e independiente.

---

## Resumen de deuda técnica a resolver

| ID | Fase | Prioridad | Descripción |
|---|---|---|---|
| DT-UI-001 | 1 | ALTA | `AlertConfig.jsx`: ReferenceError `setDryRunResult` + stale closure en `handleCreate` |
| DT-UI-009 | 1 | ALTA | `AlertConfig.jsx` sin cobertura de tests |
| DT-UI-002 | 2 | MEDIA | catch vacíos (ESLint error) en `AgentsReport`, `CampaignsReport`, `QueuesReport` |
| DT-UI-004 | 2 | MEDIA | `buildShareUrl` duplicada en los 3 reportes — ya existe en `src/utils/reportShareUrl.js` |
| DT-UI-005 | 3 | MEDIA | Slice `navigation.js` no registrado en el store — código muerto |
| DT-UI-006 | 3 | MEDIA | `userInfo` hardcodeado en `AppRouter.jsx` — `selectUser` existe pero no se usa |
| DT-UI-003 | 4 | BAJA | catch vacíos (ESLint error) en `mockInterceptor.js` L1935, L2012, L2062 |
| DT-UI-007 | 4 | BAJA | `loggerMiddleware`: `console.log` sin guard de entorno (no activo en producción) |
| DT-UI-008 | 4 | BAJA | `withLogging.js`: `console.log` sin guard de entorno |
| DT-UI-010 | 4 | BAJA | Páginas en `src/pages/` sin ruta en el router (código muerto parcial) |

**Orden de ejecución:** FASE 1 (bloqueante, bugs runtime) → FASE 2 (errores ESLint medio) →
FASE 3 (deuda arquitectónica) → FASE 4 (limpieza baja prioridad)

---

## FASE 1 — Corregir bugs en `AlertConfig.jsx` y añadir cobertura

**Objetivo:** `AlertConfig.jsx` libre de errores runtime, con test suite que cubra todos los flujos.  
**Prerequisito:** ninguno.  
**Criterio de cierre:** `jest --testPathPattern=AlertConfig` pasa, ESLint reporta 0 errores en `AlertConfig.jsx`.

---

### T1.1 — Añadir reducer `clearDryRunResult` al slice `alerts.js`

**Archivo:** `src/redux/slices/alerts.js`  
**Prerequisito:** ninguno.

El componente `AlertConfig.jsx` necesita un action creator para limpiar
`dryRunResult` del store sin resetear todo el slice. El slice actual tiene
`resetState` (resetea todo) y `clearSuccess`/`clearError`, pero no
`clearDryRunResult`.

**Cambio — añadir en el bloque `reducers:` del slice:**

```js
reducers: {
  clearError:       (state) => { state.error = null },
  clearSuccess:     (state) => { state.success = false },
  clearDryRunResult:(state) => { state.dryRunResult = null },   // ← añadir
  resetState:       () => initialState,
},
```

**Añadir a los exports:**

```js
export const { clearError, clearSuccess, clearDryRunResult, resetState } = alertsSlice.actions
```

**Verificación:**

```bash
grep "clearDryRunResult" src/redux/slices/alerts.js | wc -l
# Resultado esperado: 2 (definición en reducers + export)
```

---

### T1.2 — Corregir `AlertConfig.jsx`: eliminar `setDryRunResult` y el stale closure

**Archivo:** `src/pages/alerts/AlertConfig.jsx`  
**Prerequisito:** T1.1.

Esta tarea corrige los dos bugs identificados en DT-UI-001:

**Parte 1 — Importar `clearDryRunResult` y eliminar `selectSuccess`.**

El componente lee `success` del store para determinar si `createAlert` fue
exitoso. Esa lectura es incorrecta porque `success` en el closure de
`handleCreate` es el valor al momento de la definición de la función, no
al momento de su ejecución. La corrección es usar el resultado del `dispatch`.

```jsx
// Antes — L9:
import { createAlert, dryRunAlertRule, selectLoading, selectError, selectSuccess, selectDryRunResult }
  from '../../redux/slices/alerts'

// Después:
import {
  createAlert, dryRunAlertRule, clearDryRunResult,
  selectLoading, selectError, selectDryRunResult,
} from '../../redux/slices/alerts'
```

**Parte 2 — Eliminar la lectura de `success` del componente.**

```jsx
// Eliminar estas dos líneas (L53-L54):
const success = useSelector(selectSuccess)
// (el comentario L58 también puede eliminarse)
```

**Parte 3 — Corregir `handleCreate` para usar el resultado del dispatch.**

```jsx
// Antes (L72-L79):
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

**Parte 4 — Corregir el botón "Limpiar" (L272).**

```jsx
// Antes:
onClick={() => { setConfig({ ...EMPTY_FORM }); setDryRunResult(null) }}

// Después:
onClick={() => { setConfig({ ...EMPTY_FORM }); dispatch(clearDryRunResult()) }}
```

**Verificación:**

```bash
grep "setDryRunResult\|selectSuccess" src/pages/alerts/AlertConfig.jsx | wc -l
# Resultado esperado: 0

node -e "
const { JSDOM } = require('jsdom');
// Verificar que el archivo no tiene referencias inexistentes
const fs = require('fs');
const content = fs.readFileSync('src/pages/alerts/AlertConfig.jsx', 'utf8');
if (content.includes('setDryRunResult')) process.exit(1);
if (content.includes('selectSuccess')) process.exit(1);
console.log('OK: sin referencias inexistentes');
"
```

---

### T1.3 — Crear `src/pages/alerts/__tests__/AlertConfig.test.jsx`

**Archivo:** `src/pages/alerts/__tests__/AlertConfig.test.jsx` (nuevo)  
**Prerequisito:** T1.2.

El test debe cubrir todos los flujos del componente. Usa el store real de Redux
con el slice `alerts` configurado y mockeando `alertsGateway`.

**Contenido del test:**

```jsx
/**
 * AlertConfig.test.jsx
 * Cobertura de UC_ALR_01: crear reglas de alerta.
 * Tests: render, handleCreate (éxito y fallo), handleDryRun, toggle, Limpiar.
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AlertConfig from '../AlertConfig'
import alertsReducer from '../../../redux/slices/alerts'

// Mock del gateway
jest.mock('../../../services/alertsGateway', () => ({
  __esModule: true,
  default: {
    createAlert:     jest.fn(),
    dryRunAlertRule: jest.fn(),
  },
}))

const gw = require('../../../services/alertsGateway').default

function makeStore(preloaded = {}) {
  return configureStore({
    reducer: { alerts: alertsReducer },
    preloadedState: preloaded,
  })
}

function renderWithStore(preloaded = {}) {
  const store = makeStore(preloaded)
  const utils = render(
    <Provider store={store}><AlertConfig /></Provider>
  )
  return { ...utils, store }
}

describe('AlertConfig — render', () => {
  it('renderiza el formulario vacío con todos los campos', () => {
    renderWithStore()
    expect(screen.getByPlaceholderText(/Ej: SL crítico/i)).toBeInTheDocument()
    expect(screen.getByText('Crear regla')).toBeInTheDocument()
    expect(screen.getByText('Limpiar')).toBeInTheDocument()
    expect(screen.getByText('Probar condición (dry-run)')).toBeInTheDocument()
  })

  it('el botón Crear está deshabilitado si nombre o umbral o acciones están vacíos', () => {
    renderWithStore()
    const btn = screen.getByText('Crear regla')
    expect(btn).toBeDisabled()
  })
})

describe('AlertConfig — toggle de acciones', () => {
  it('añade una acción al marcar el checkbox', async () => {
    renderWithStore()
    const checkbox = screen.getByLabelText(/Notificar usuario/i)
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('elimina una acción al desmarcar el checkbox', async () => {
    renderWithStore()
    const checkbox = screen.getByLabelText(/Notificar usuario/i)
    await userEvent.click(checkbox) // marcar
    await userEvent.click(checkbox) // desmarcar
    expect(checkbox).not.toBeChecked()
  })
})

describe('AlertConfig — handleDryRun', () => {
  it('despacha dryRunAlertRule con metric, scope, threshold y window', async () => {
    gw.dryRunAlertRule.mockResolvedValue({ ok: true, status: 'ok' })
    renderWithStore()

    // Rellenar umbral (requerido para habilitar dry-run)
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '85')
    await userEvent.click(screen.getByText('Probar condición (dry-run)'))

    await waitFor(() => expect(gw.dryRunAlertRule).toHaveBeenCalledWith(
      expect.objectContaining({
        metric:    'SL',
        scope:     'segment',
        threshold: '85',
        window:    5,
      })
    ))
  })

  it('muestra el resultado del dry-run cuando el resultado es ok', async () => {
    gw.dryRunAlertRule.mockResolvedValue({ ok: true, status: 'ok' })
    renderWithStore()
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '85')
    await userEvent.click(screen.getByText('Probar condición (dry-run)'))
    await waitFor(() =>
      expect(screen.getByRole('status')).toBeInTheDocument()
    )
  })
})

describe('AlertConfig — handleCreate', () => {
  it('despacha createAlert con la configuración del formulario', async () => {
    gw.createAlert.mockResolvedValue({ id: 42, name: 'Test Alert' })
    renderWithStore()

    await userEvent.type(screen.getByPlaceholderText(/Ej: SL crítico/i), 'Mi alerta')
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '80')
    await userEvent.click(screen.getByLabelText(/Notificar usuario/i))

    await userEvent.click(screen.getByText('Crear regla'))

    await waitFor(() =>
      expect(gw.createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          name:      'Mi alerta',
          threshold: '80',
          actions:   expect.arrayContaining(['mailbox_notify_user']),
        })
      )
    )
  })

  it('resetea el formulario al crear exitosamente', async () => {
    gw.createAlert.mockResolvedValue({ id: 42, name: 'Mi alerta' })
    renderWithStore()

    const nameInput = screen.getByPlaceholderText(/Ej: SL crítico/i)
    await userEvent.type(nameInput, 'Mi alerta')
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '80')
    await userEvent.click(screen.getByLabelText(/Notificar usuario/i))
    await userEvent.click(screen.getByText('Crear regla'))

    // Después del éxito, el campo nombre debe estar vacío
    await waitFor(() => expect(nameInput).toHaveValue(''))
  })

  it('no resetea el formulario si createAlert falla', async () => {
    gw.createAlert.mockRejectedValue(new Error('Error de red'))
    renderWithStore()

    const nameInput = screen.getByPlaceholderText(/Ej: SL crítico/i)
    await userEvent.type(nameInput, 'Mi alerta')
    await userEvent.type(screen.getByPlaceholderText(/Ej: 80/i), '80')
    await userEvent.click(screen.getByLabelText(/Notificar usuario/i))
    await userEvent.click(screen.getByText('Crear regla'))

    // El formulario debe mantener los datos al fallar
    await waitFor(() => expect(nameInput).toHaveValue('Mi alerta'))
  })
})

describe('AlertConfig — botón Limpiar', () => {
  it('resetea el formulario al pulsar Limpiar', async () => {
    renderWithStore()
    const nameInput = screen.getByPlaceholderText(/Ej: SL crítico/i)
    await userEvent.type(nameInput, 'Mi alerta')
    await userEvent.click(screen.getByText('Limpiar'))
    expect(nameInput).toHaveValue('')
  })
})
```

**Verificación:**

```bash
npx jest src/pages/alerts/__tests__/AlertConfig.test.jsx --no-coverage
# Resultado esperado: 11 tests passed, 0 failed
```

---

### T1.4 — Actualizar `alertsSlice.sync.test.js` para cubrir `clearDryRunResult`

**Archivo:** `__tests__/slices/alertsSlice.sync.test.js`  
**Prerequisito:** T1.1.

El test existente no cubre `clearDryRunResult`. Añadir un `describe` al final
del archivo:

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

**Verificación:**

```bash
npx jest __tests__/slices/alertsSlice.sync.test.js --no-coverage
# Resultado esperado: todos los tests del archivo pasan
```

---

### T1.5 — Verificación integral FASE 1 y commit

**Prerequisito:** T1.1, T1.2, T1.3, T1.4.

**Comandos de verificación:**

```bash
# 1. Sin referencias a setDryRunResult ni selectSuccess en AlertConfig
grep "setDryRunResult\|selectSuccess" src/pages/alerts/AlertConfig.jsx | wc -l
# Resultado: 0

# 2. clearDryRunResult declarado y exportado
grep "clearDryRunResult" src/redux/slices/alerts.js | wc -l
# Resultado: 2

# 3. Tests de AlertConfig pasan
npx jest src/pages/alerts/__tests__/AlertConfig.test.jsx --no-coverage
# Resultado: 11 passed, 0 failed

# 4. Tests del slice pasan
npx jest __tests__/slices/alertsSlice.sync.test.js --no-coverage
# Resultado: todos passed

# 5. ESLint sin errores en los archivos modificados
npx eslint src/pages/alerts/AlertConfig.jsx src/redux/slices/alerts.js
# Resultado: 0 errors

# 6. Suite completa sin regresiones
npx jest --no-coverage 2>&1 | tail -3
# Resultado: ≥ 2377 passed (2366 anteriores + 11 nuevos + 1 clearDryRunResult), 0 failed
```

**Commit:**

```bash
git add src/redux/slices/alerts.js \
        src/pages/alerts/AlertConfig.jsx \
        src/pages/alerts/__tests__/AlertConfig.test.jsx \
        __tests__/slices/alertsSlice.sync.test.js
git commit -m "fix(alerts): corregir ReferenceError y stale closure en AlertConfig + tests

alerts.js:
  Añadido reducer clearDryRunResult — limpia dryRunResult sin resetear el slice.
  Exportado junto a clearError, clearSuccess, resetState.

AlertConfig.jsx:
  DT-UI-001 Fallo 1 — eliminadas referencias a setDryRunResult (no existia).
  DT-UI-001 Fallo 2 — corregido stale closure en handleCreate: ahora usa
  createAlert.fulfilled.match(result) en lugar de leer success del closure.
  Eliminado selectSuccess del componente — ya no es necesario.
  Boton Limpiar usa dispatch(clearDryRunResult()) en lugar del setter inexistente.

AlertConfig.test.jsx (nuevo):
  11 tests cubriendo: render, toggle, handleDryRun, handleCreate (exito y fallo),
  boton Limpiar.

alertsSlice.sync.test.js:
  Anadido describe para clearDryRunResult."
```

---

## FASE 2 — Corregir errores ESLint en los tres reportes

**Objetivo:** 0 errores ESLint en `AgentsReport.jsx`, `CampaignsReport.jsx`, `QueuesReport.jsx`.  
**Prerequisito:** FASE 1 completada.  
**Criterio de cierre:** `npx eslint src/pages/reports/` → 0 errors.

---

### T2.1 — Extraer `buildShareUrl` duplicada e importar desde `utils/`

**Archivos:** `AgentsReport.jsx`, `CampaignsReport.jsx`, `QueuesReport.jsx`  
**Prerequisito:** ninguno (independiente de T2.2).

Los tres archivos definen `buildShareUrl` localmente con la misma lógica.
Ya existe `src/utils/reportShareUrl.js` con la misma función.

**En cada uno de los tres archivos:**

1. Eliminar la función local `buildShareUrl` (7 líneas en cada archivo).
2. Añadir el import de la utilidad:

```jsx
// Añadir al bloque de imports:
import { buildShareUrl } from '../../utils/reportShareUrl'

// Eliminar:
// function buildShareUrl(reportType, filters = {}) { ... }  (7 líneas)
```

**Verificación:**

```bash
for f in src/pages/reports/AgentsReport.jsx \
          src/pages/reports/CampaignsReport.jsx \
          src/pages/reports/QueuesReport.jsx; do
  count=$(grep -c "function buildShareUrl" $f)
  echo "$f: definiciones locales = $count (esperado: 0)"
done

# Verificar que el import existe
grep "from.*reportShareUrl" src/pages/reports/AgentsReport.jsx
```

---

### T2.2 — Corregir catch vacíos en los tres reportes

**Archivos:** `AgentsReport.jsx` L62, `CampaignsReport.jsx` L60, `QueuesReport.jsx` L62  
**Prerequisito:** ninguno (independiente de T2.1).

Añadir un comentario descriptivo en el bloque catch de `handleSaveView`:

```jsx
// Antes (en los 3 archivos):
} catch (_) {}

// Después:
} catch (_) { /* guardar vista es opcional — fallo no interrumpe al usuario */ }
```

**Verificación:**

```bash
grep -n "catch (_) {}" \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx | wc -l
# Resultado esperado: 0
```

---

### T2.3 — Verificación integral FASE 2 y commit

**Prerequisito:** T2.1, T2.2.

```bash
# 1. ESLint sin errores en los 3 archivos
npx eslint \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx
# Resultado esperado: 0 errors

# 2. sin definiciones locales de buildShareUrl
grep -rn "function buildShareUrl" \
  src/pages/reports/AgentsReport.jsx \
  src/pages/reports/CampaignsReport.jsx \
  src/pages/reports/QueuesReport.jsx | wc -l
# Resultado esperado: 0

# 3. reportShareUrl.js sigue siendo importada correctamente
node -e "require('./src/utils/reportShareUrl.js'); console.log('OK')"

# 4. Tests de los 3 reportes siguen pasando
npx jest src/pages/reports/AgentsReport \
         src/pages/reports/CampaignsReport \
         src/pages/reports/QueuesReport --no-coverage
# Resultado esperado: todos passed

# 5. Suite completa sin regresiones
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/pages/reports/AgentsReport.jsx \
        src/pages/reports/CampaignsReport.jsx \
        src/pages/reports/QueuesReport.jsx
git commit -m "fix(reports): catch vacio con comentario + buildShareUrl de utils/

DT-UI-002 — catch vacio en handleSaveView corregido (AgentsReport, CampaignsReport,
QueuesReport): anadido comentario descriptivo — ESLint no-empty resuelto.

DT-UI-004 — buildShareUrl duplicada eliminada de los 3 componentes.
Importada desde src/utils/reportShareUrl.js (ya existia, no estaba siendo usada).
21 lineas eliminadas (7 por archivo)."
```

---

## FASE 3 — Deuda arquitectónica: navigation slice y userInfo

**Objetivo:** eliminar código muerto del store y conectar el usuario autenticado al layout.  
**Prerequisito:** FASE 1 completada. Independiente de FASE 2.  
**Criterio de cierre:** `npx eslint src/` → sin errores derivados de estos items. Tests pasan.

---

### T3.1 — Eliminar el slice `navigation.js` del repositorio

**Archivos a modificar/eliminar:**
- `src/redux/slices/navigation.js` — eliminar
- `__tests__/slices/navigationSlice.test.js` — eliminar

**Prerequisito:** confirmar que ningún componente, hook o página usa los
exports de `navigation.js`. Verificación previa obligatoria:

```bash
grep -rn "fetchNavigationMenu\|fetchNavigationModules\|selectNavMenu\|selectNavModules\|selectNavLoading\|selectNavError\|clearNavError" \
  src/ --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" | \
  grep -v "navigation.js\|navigationSlice.test.js" | \
  grep -v "node_modules"
# Resultado esperado: 0 líneas — nadie usa el slice
```

Si el resultado es 0: proceder con la eliminación.  
Si hay referencias: documentar en los hallazgos y detener esta tarea.

**Eliminación:**

```bash
git rm src/redux/slices/navigation.js
git rm __tests__/slices/navigationSlice.test.js
```

**Verificación:**

```bash
# El slice ya no existe
ls src/redux/slices/navigation.js 2>/dev/null && echo "FAIL" || echo "OK: eliminado"

# El store no importa navigation
grep "navigation" src/redux/store.js | wc -l
# Resultado esperado: 0

# Los tests no referencian el slice eliminado
npx jest --no-coverage 2>&1 | tail -3
# Resultado esperado: mismo conteo de tests que antes (el navigationSlice.test.js
# contribuía 3 tests — el total bajará de 2366 a 2363, lo cual es correcto)
```

---

### T3.2 — Conectar `selectUser` al `DashboardLayout` en `AppRouter.jsx`

**Archivo:** `src/router/AppRouter.jsx`  
**Prerequisito:** ninguno.

El `DashboardLayout` recibe `userInfo` con datos ficticios hardcodeados.
`selectUser` existe en `src/redux/selectors.js` y retorna el usuario del store.

**Cambios en `AppRouter.jsx`:**

```jsx
// 1. Añadir import de selectUser (ya importa useSelector y selectIsAuthenticated)
import { selectIsAuthenticated, selectUser } from '@store/selectors'

// 2. En RoutesWithTransitions(), añadir junto a la lectura de navLinks:
const currentUser = useSelector(selectUser)

// 3. Reemplazar el userInfo hardcodeado:
// Antes:
userInfo={{
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar_url: 'https://via.placeholder.com/40',
}}

// Después:
userInfo={{
  name:       currentUser?.name       ?? '',
  email:      currentUser?.email      ?? '',
  avatar_url: currentUser?.avatar_url ?? '',
}}
```

**Verificación:**

```bash
grep "John Doe\|via.placeholder" src/router/AppRouter.jsx | wc -l
# Resultado esperado: 0

grep "selectUser\|currentUser" src/router/AppRouter.jsx | wc -l
# Resultado esperado: ≥ 2

npx eslint src/router/AppRouter.jsx
# Resultado esperado: 0 errors
```

---

### T3.3 — Verificación integral FASE 3 y commit

**Prerequisito:** T3.1, T3.2.

```bash
# 1. navigation.js eliminado
ls src/redux/slices/navigation.js 2>/dev/null && echo "FAIL" || echo "OK"

# 2. navigationSlice.test.js eliminado
ls __tests__/slices/navigationSlice.test.js 2>/dev/null && echo "FAIL" || echo "OK"

# 3. John Doe eliminado
grep "John Doe\|via.placeholder" src/router/AppRouter.jsx | wc -l
# Resultado: 0

# 4. selectUser en AppRouter
grep "selectUser" src/router/AppRouter.jsx | wc -l
# Resultado: ≥ 1

# 5. Suite de tests
npx jest --no-coverage 2>&1 | tail -3
# Resultado: ≥ 2363 passed (2366 - 3 del navigationSlice.test.js), 0 failed
```

**Commit:**

```bash
git add src/redux/slices/navigation.js   # git rm
git add __tests__/slices/navigationSlice.test.js  # git rm
git add src/router/AppRouter.jsx
git commit -m "fix(arch): eliminar navigation slice huerfano + userInfo real en AppRouter

DT-UI-005 — src/redux/slices/navigation.js eliminado: slice no registrado
en el store, sin uso en ningun componente o hook. 55 lineas de codigo muerto.
Test asociado __tests__/slices/navigationSlice.test.js tambien eliminado.

DT-UI-006 — AppRouter.jsx: userInfo hardcodeado reemplazado por selectUser.
El layout ahora muestra el nombre y email del usuario autenticado desde
el store auth. selectUser ya existia en src/redux/selectors.js."
```

---

## FASE 4 — Limpieza de bajo impacto

**Objetivo:** 0 errores ESLint en `mockInterceptor.js`. `console.log` con guards de entorno.  
**Prerequisito:** ninguno. Paralela a FASE 1, 2 y 3.  
**Criterio de cierre:** `npx eslint src/` → 0 errors en los archivos modificados.

---

### T4.1 — Corregir catch vacíos en `mockInterceptor.js`

**Archivo:** `src/mocks/mockInterceptor.js`  
**Líneas:** 1935, 2012, 2062  
**Prerequisito:** ninguno.

Añadir comentario descriptivo en los tres bloques catch vacíos. Usar el mismo
patrón que ya existe en L2349 del mismo archivo:

```js
// L2349 — patrón correcto ya existente:
} catch (_) { /* URL may not have query string */ }

// Aplicar a L1935, L2012, L2062:
} catch (_) { /* URL relativa sin hostname — continuar con valor por defecto */ }
```

**Verificación:**

```bash
grep -n "catch (_) {}" src/mocks/mockInterceptor.js | wc -l
# Resultado esperado: 0
```

---

### T4.2 — Añadir guard de entorno en `redux/middleware/logger.js`

**Archivo:** `src/redux/middleware/logger.js`  
**Prerequisito:** ninguno.

El middleware emite `console.log` por cada action. No está registrado en el
store de producción en el estado actual, pero el guard de entorno previene
que un registro accidental contamine producción.

```js
// Antes:
console.log('next state', store.getState());

// Después:
if (process.env.NODE_ENV === 'development') {
  console.log('next state', store.getState());
}
```

**Verificación:**

```bash
npx eslint src/redux/middleware/logger.js
# Resultado esperado: 0 errors (no-console ya no aplica dentro del guard
# porque el guard no elimina el warning de ESLint, pero la regla en
# eslint.config.mjs solo es 'warn', no 'error')
```

---

### T4.3 — Añadir guard de entorno en `decorators/withLogging.js`

**Archivo:** `src/decorators/withLogging.js`  
**Prerequisito:** ninguno.

El decorador de logging usa `console.log` en múltiples puntos. Es el mayor
contribuyente individual a los warnings `no-console`. El propósito del
decorador es logging explícito, pero debe condicionarse al entorno.

**Patrón a aplicar:** envolver los bloques de `console.log` en un guard:

```js
// Antes:
console.log(`[LOG] ${fnName} called with:`, sanitizedArgs)

// Después:
if (process.env.NODE_ENV !== 'production') {
  console.log(`[LOG] ${fnName} called with:`, sanitizedArgs)
}
```

Aplicar el mismo patrón a todas las ocurrencias de `console.log` en el archivo
(10 instancias en las funciones `withLogging`, `withTracing`, `withDebugLogging`).

**Verificación:**

```bash
grep -c "console\.log" src/decorators/withLogging.js
# Contar antes y después — las líneas deben seguir existiendo pero dentro del guard
npx eslint src/decorators/withLogging.js
# Resultado esperado: 0 errors (los warnings de no-console siguen, no son errors)
```

---

### T4.4 — Auditar y limpiar páginas huérfanas en `src/pages/`

**Archivos a evaluar:** `Dashboard.jsx`, `Home.jsx`, `NotFound.jsx`,
`Profile.jsx`, `Settings.jsx`, `alerts/Alerts.jsx`, `audit/Audit.jsx`  
**Prerequisito:** ninguno.

Para cada archivo, determinar si es código muerto o un componente auxiliar
con propósito. Criterio de eliminación: el archivo no está referenciado en
el router ni importado por ningún otro componente.

**Evaluación caso por caso:**

| Archivo | Decisión | Razón |
|---|---|---|
| `Dashboard.jsx` | Eliminar | Placeholder vacío con `<h1>Dashboard</h1>`. El router usa `@ui/containers/DashboardMain`. |
| `Dashboard.scss` | Eliminar junto a Dashboard.jsx | Solo importado por el placeholder. |
| `Home.jsx` | Eliminar | El router no tiene ruta `/home`. Carga `@modules/home/HomeModule` que no existe en `src/modules/`. |
| `NotFound.jsx` | Eliminar | Duplicado. El router usa `@screens/errors/NotFound`. |
| `Profile.jsx` | Conservar | 137 líneas con lógica real (UC_USR_07). Aunque el router use `@ui/pages/Profile/Profile`, el archivo puede estar en proceso de migración. Añadir comentario `// UC_USR_07: pendiente de mover a src/components/pages/Profile/`. |
| `Settings.jsx` | Eliminar | Placeholder vacío con `<h1>Settings</h1>`. El router usa `@ui/features/Settings/Settings`. |
| `alerts/Alerts.jsx` | Conservar | El router usa `@ui/pages/Alerts/Alerts` — verificar si son el mismo archivo. |
| `audit/Audit.jsx` | Conservar | El router usa `@ui/pages/Audit/Audit` — verificar si son el mismo archivo. |

**Verificación antes de eliminar cada archivo:**

```bash
# Confirmar que el archivo no está referenciado en ningún lugar
grep -rn "from.*pages/Dashboard\b\|import.*pages/Dashboard\b" \
  src/ --include="*.jsx" --include="*.js" | grep -v "__tests__"
# Resultado: 0 líneas → proceder con la eliminación
```

**Eliminación:**

```bash
git rm src/pages/Dashboard.jsx src/pages/Dashboard.scss
git rm src/pages/Home.jsx
git rm src/pages/NotFound.jsx
git rm src/pages/Settings.jsx
```

**Verificación:**

```bash
npx jest --no-coverage 2>&1 | tail -3
# Resultado: mismo número de tests (los archivos eliminados no tienen tests)

npx eslint src/ 2>&1 | grep "error" | wc -l
# Resultado: 0 errors
```

---

### T4.5 — Verificación integral FASE 4 y commit

**Prerequisito:** T4.1, T4.2, T4.3, T4.4.

```bash
# 1. Sin catch vacíos en mockInterceptor
grep -n "catch (_) {}" src/mocks/mockInterceptor.js | wc -l
# Resultado: 0

# 2. Guards en logger y withLogging
grep -c "NODE_ENV" src/redux/middleware/logger.js
grep -c "NODE_ENV" src/decorators/withLogging.js
# Resultado: ≥ 1 en cada archivo

# 3. Páginas huérfanas eliminadas
for f in Dashboard.jsx Home.jsx NotFound.jsx Settings.jsx; do
  ls src/pages/$f 2>/dev/null && echo "PRESENTE: $f" || echo "OK eliminado: $f"
done

# 4. ESLint — 0 errors en archivos modificados
npx eslint \
  src/mocks/mockInterceptor.js \
  src/redux/middleware/logger.js \
  src/decorators/withLogging.js
# Resultado: 0 errors (puede haber warnings, que no son errors)

# 5. Suite completa
npx jest --no-coverage 2>&1 | tail -3
```

**Commit:**

```bash
git add src/mocks/mockInterceptor.js \
        src/redux/middleware/logger.js \
        src/decorators/withLogging.js \
        src/pages/Dashboard.jsx src/pages/Dashboard.scss \
        src/pages/Home.jsx src/pages/NotFound.jsx \
        src/pages/Settings.jsx
git commit -m "fix(cleanup): catch vacio mockInterceptor + guards entorno + paginas huerfanas

DT-UI-003 — mockInterceptor.js: catch vacio en L1935, L2012, L2062 resueltos
con comentario descriptivo, siguiendo el patron de L2349 del mismo archivo.

DT-UI-007 — logger.js: console.log envuelto en guard NODE_ENV === development.
El middleware no estaba activo en produccion, el guard lo formaliza.

DT-UI-008 — withLogging.js: 10 ocurrencias de console.log envueltas en guard
NODE_ENV !== production.

DT-UI-010 — Eliminados 4 placeholders sin ruta en el router:
  src/pages/Dashboard.jsx + Dashboard.scss (placeholder, router usa DashboardMain)
  src/pages/Home.jsx (sin ruta, HomeModule inexistente)
  src/pages/NotFound.jsx (duplicado de errors/NotFound)
  src/pages/Settings.jsx (placeholder, router usa features/Settings)"
```

---

## Resumen de todas las tareas

| Tarea | Archivo(s) | DT resuelta | Commit |
|---|---|---|---|
| T1.1 | `alerts.js` | DT-UI-001 (parcial) | — |
| T1.2 | `AlertConfig.jsx` | DT-UI-001 (completo) | — |
| T1.3 | `AlertConfig.test.jsx` (nuevo) | DT-UI-009 | — |
| T1.4 | `alertsSlice.sync.test.js` | DT-UI-001 (test) | — |
| T1.5 | verificación + commit | — | sí |
| T2.1 | `AgentsReport`, `CampaignsReport`, `QueuesReport` | DT-UI-004 | — |
| T2.2 | ídem | DT-UI-002 | — |
| T2.3 | verificación + commit | — | sí |
| T3.1 | `navigation.js` (eliminar), `navigationSlice.test.js` (eliminar) | DT-UI-005 | — |
| T3.2 | `AppRouter.jsx` | DT-UI-006 | — |
| T3.3 | verificación + commit | — | sí |
| T4.1 | `mockInterceptor.js` | DT-UI-003 | — |
| T4.2 | `logger.js` | DT-UI-007 | — |
| T4.3 | `withLogging.js` | DT-UI-008 | — |
| T4.4 | 4 páginas huérfanas (eliminar) | DT-UI-010 | — |
| T4.5 | verificación + commit | — | sí |

**Total: 16 tareas, 4 commits, 10 DTs resueltas, 0 deuda técnica residual.**

---

## Verificación final del repositorio (post todas las fases)

```bash
# 1. ESLint: 0 errors (puede haber warnings de react/prop-types que son warn, no error)
npx eslint src/ 2>&1 | grep " error " | wc -l
# Resultado esperado: 0

# 2. Tests: ≥ 2374 passed (2366 base + 11 AlertConfig + 1 clearDryRunResult - 3 navigation)
npx jest --no-coverage 2>&1 | tail -3

# 3. Sin código muerto identificado
grep -rn "setDryRunResult\|John Doe\|via.placeholder" src/ | wc -l
# Resultado: 0

# 4. Sin catch vacíos
grep -rn "catch (_) {}" src/ | wc -l
# Resultado: 0

# 5. buildShareUrl solo existe en utils/
grep -rn "function buildShareUrl" src/ | wc -l
# Resultado: 1 (solo en src/utils/reportShareUrl.js)

# 6. navigation slice eliminado
ls src/redux/slices/navigation.js 2>/dev/null && echo "FAIL" || echo "OK"
```

---

*Generado: 2026-05-16T06:16:22 | Análisis base: ANALISIS-IACT-UI-2026-05-16T06:10:22.md*
