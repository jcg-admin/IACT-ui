# HALLAZGOS-FASE1-IACT-UI-2026-05-16T13:42:00

**Documento:** HALLAZGOS-FASE1-IACT-UI-2026-05-16T13:42:00  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commit:** c869c63  
**Plan base:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38.md — FASE 1

---

## Estado antes de FASE 1

```
npx jest --no-coverage → 2366 passed, 0 failed
ESLint errors en AlertConfig.jsx:
  L76:  no-undef: 'setDryRunResult' is not defined
  L272: no-undef: 'setDryRunResult' is not defined
Sin cobertura de tests para AlertConfig.jsx
```

---

## Cambios aplicados por tarea

### T1.1 — `alerts.js`: reducer `clearDryRunResult`

Añadido al bloque `reducers:`:

```js
clearDryRunResult: (state) => { state.dryRunResult = null },
```

Añadido al export destrucción:

```js
export const { clearError, clearSuccess, clearDryRunResult, resetState } = alertsSlice.actions
```

---

### T1.2 — `AlertConfig.jsx`: tres correcciones (dos del plan + una nueva)

**Corrección 1 (Bug 1 del plan — ReferenceError):** eliminadas las dos
llamadas a `setDryRunResult(null)` en `handleCreate` (L76) y en el botón
Limpiar (L272). Reemplazadas por `dispatch(clearDryRunResult())`.

**Corrección 2 (Bug 2 del plan — stale closure):** `handleCreate` leía
`success` del closure al momento de la definición de la función. Después
del `await dispatch(createAlert(config))`, el componente puede haberse
re-renderizado con `success=true` en el store, pero la función seguía
viendo el valor anterior (`false`). El formulario nunca se reseteaba.

```jsx
// Antes — stale closure:
async function handleCreate() {
  await dispatch(createAlert(config))
  if (success) {              // ← siempre false en el closure
    setConfig({ ...EMPTY_FORM })
    setDryRunResult(null)     // ← además ReferenceError
  }
}

// Después — resultado del dispatch:
async function handleCreate() {
  const result = await dispatch(createAlert(config))
  if (createAlert.fulfilled.match(result)) {
    setConfig({ ...EMPTY_FORM })
    dispatch(clearDryRunResult())
  }
}
```

`selectSuccess` eliminado del componente — ya no es necesario.  
`selectLoading` conservado — lo usa `disabled={!canCreate || loading}`.

**Corrección 3 (Bug 3 — detectado por los tests, no estaba en el plan):** ver sección de hallazgos.

---

### T1.3 — `AlertConfig.test.jsx`: 13 tests (nuevo archivo)

```
src/pages/alerts/__tests__/AlertConfig.test.jsx
  AlertConfig — render (2)
  AlertConfig — toggle de acciones (2)
  AlertConfig — handleDryRun (4)
  AlertConfig — handleCreate (3)
  AlertConfig — botón Limpiar (1)
  AlertConfig — error display (1)
```

---

### T1.4 — `alertsSlice.sync.test.js`: test de `clearDryRunResult`

Añadido al final del archivo:

```js
describe('alertsSlice — clearDryRunResult', () => {
  it('limpia dryRunResult a null sin afectar el resto del estado', ...)
})
```

---

## Hallazgos durante la implementación

### H-F1-001 — Bug 3 no documentado: error renderizado como objeto React

**Problema detectado por los tests, no incluido en el análisis ni en el plan.**

El test `'muestra el error banner cuando el store tiene un error'`
provocó el error:

```
Objects are not valid as a React child
(found: object with keys {message, statusCode})
```

**Causa raíz:** el slice almacena el error como un objeto:

```js
// alerts.js — wrapper rw():
catch (e) {
  return rejectWithValue({ message: e.message, statusCode: e.response?.status ?? null })
}
```

El estado `error` en el store es `{ message: string, statusCode: number | null }`.

`AlertConfig.jsx` renderizaba ese objeto directamente:

```jsx
<div role="alert" className="error-banner">
  {error}   ← objeto React — crash
</div>
```

**Corrección aplicada:**

```jsx
<div role="alert" className="error-banner">
  {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
</div>
```

El mismo patrón defensivo ya estaba implementado correctamente en `Alerts.jsx`:

```jsx
{typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
```

**Alcance:** solo `AlertConfig.jsx` tenía este patrón incorrecto. `Alerts.jsx`,
`AlertHistory.jsx` y `Subscriptions.jsx` usan el patrón correcto.

**Impacto real:** en producción, si `createAlert` fallaba con un error de
red (respuesta HTTP), React crasheaba al intentar renderizar el error. El
error no era visible al usuario — la página simplemente se rompía.

---

### H-F1-002 — El test de "no resetea al fallar" confirma el comportamiento correcto

El test `'no resetea el formulario si createAlert falla'` pasó sin
modificación adicional tras corregir el Bug 3. Esto confirma que:

1. `createAlert.fulfilled.match(result)` devuelve `false` cuando el gateway rechaza.
2. El formulario mantiene los datos al fallar.
3. El error del store se renderiza correctamente (H-F1-001 corregido).

---

### H-F1-003 — alertsPages.test.jsx usa mock del slice con `selectSuccess`

El test existente `alertsPages.test.jsx` mockea el módulo de alerts con:

```js
selectSuccess: (s) => s.alerts.success,
```

Aunque `selectSuccess` fue eliminado de las importaciones de `AlertConfig.jsx`,
sigue siendo exportado por el slice y el mock del test existente no rompe
— `alertsPages.test.jsx` pasa sin cambios.

Sin embargo, el mock de `alertsPages.test.jsx` no incluye `clearDryRunResult`
en su mock del slice. Esto no causa fallo porque `alertsPages.test.jsx` usa
un stub completo del reducer (no el real) y las acciones del componente que
usan `dispatch(clearDryRunResult())` despachan contra ese reducer stub, que
simplemente no las procesa — lo cual es correcto para un test de renderizado.

---

## Verificaciones realizadas (T1.5)

| Verificación | Comando | Resultado |
|---|---|---|
| 1. Sin `setDryRunResult` / `selectSuccess` | `grep` en `AlertConfig.jsx` | 0 líneas |
| 2. `clearDryRunResult` en `alerts.js` | `grep -c` | 2 (reducer + export) |
| 3. Correcciones presentes | `grep -n fulfilled.match` | L75 confirmado |
| 4. Tests AlertConfig | `npx jest AlertConfig.test.jsx` | 13 passed |
| 5. Tests slice | `npx jest alertsSlice.sync.test.js` | 12 passed |
| 6. Suite completa | `npx jest --no-coverage` | 2380 passed, 0 failed |

---

## Estado después de FASE 1

```
npx jest --no-coverage → 2380 passed (+14), 0 failed, 0 regresiones
ESLint errors en AlertConfig.jsx: 0
Tests nuevos: 14 (13 en AlertConfig.test.jsx + 1 en alertsSlice.sync.test.js)
```

### Archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `src/redux/slices/alerts.js` | Modificado | +4 líneas (reducer + export) |
| `src/pages/alerts/AlertConfig.jsx` | Modificado | −12, +9 líneas (3 bugs) |
| `src/pages/alerts/__tests__/AlertConfig.test.jsx` | Nuevo | 246 líneas, 13 tests |
| `__tests__/slices/alertsSlice.sync.test.js` | Modificado | +25 líneas, 1 test |

### Bugs resueltos

| Bug | Tipo | Líneas originales | Corrección |
|---|---|---|---|
| Bug 1 | ReferenceError en runtime | L76, L272 | `dispatch(clearDryRunResult())` |
| Bug 2 | Stale closure en `handleCreate` | L72-L78 | `createAlert.fulfilled.match(result)` |
| Bug 3 (nuevo) | Objeto React no serializable | L264-L267 | `error?.message ?? 'Error desconocido'` |

---

*Generado: 2026-05-16T13:42:00 | Commit: c869c63 | Suite: 2380 passed*
