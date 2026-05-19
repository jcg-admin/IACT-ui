# ANALISIS-IACT-UI-2026-05-16T06:10:22

**Documento:** ANALISIS-IACT-UI-2026-05-16T06:10:22  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Rama:** develop  
**Commit base:** 16949cc  
**Reemplaza:** ANALISIS-IACT-UI-2026-05-16T06:05:17.md (análisis superficial)

---

## 1. Identidad del proyecto

| Atributo | Valor |
|---|---|
| Nombre | `iact-dashboard` |
| Versión | 1.0.0 |
| React | 19.0.0 |
| Redux Toolkit | 2.0.0 — 16 slices en `src/redux/` + 2 en `src/state/` |
| Bundler | Webpack 5.88.0 |
| Testing | Jest 29.7.0 + Testing Library React 16.3.2 |
| Linting | ESLint 9.39.4 (flat config `eslint.config.mjs`) |
| TypeScript | Parcial — 6 archivos `.ts`/`.tsx` en base JS |
| Router | React Router DOM 6.20.0 — 60+ rutas con lazy loading |
| Gestión de datos | `apiClient.js` + gateways por dominio + React Query 5.100.5 |

---

## 2. Estado de la suite de tests

```
2366 passed   0 failed   0 skipped   250 suites
```

La FASE 6 (cerrada 2026-05-15) completó cobertura de los 7 gateways con 186 tests
nuevos. El estado de la suite es verde y no hay regresiones.

---

## 3. Errores ESLint — análisis quirúrgico

### E-001 — `no-undef: setDryRunResult` — dos bugs en uno

**Archivo:** `src/pages/alerts/AlertConfig.jsx`  
**Líneas:** 76, 272  

La lectura superficial dice: "falta declarar `setDryRunResult`". La lectura
minuciosa revela que el componente tiene **dos bugs distintos** que se
combinan:

**Bug 1 — `setDryRunResult` no existe (ReferenceError).**

El componente migró `dryRunResult` de `useState` local a Redux
(`selectDryRunResult`), eliminó el `useState`, pero dejó las dos llamadas al
setter inexistente:

```jsx
// L55-59: dryRunResult viene del store — correcto
const dryRunResultStore = useSelector(selectDryRunResult)
const dryRunResult = dryRunResultStore

// L76: CRASH — setDryRunResult nunca fue declarado
setDryRunResult(null)

// L272: CRASH — igual
onClick={() => { setConfig({ ...EMPTY_FORM }); setDryRunResult(null) }}
```

Impacto: `ReferenceError` en runtime al pulsar "Crear regla" (si la alerta
se creó con éxito) o al pulsar "Limpiar". Ambos botones están rotos.

**Bug 2 — Stale closure sobre `success` en `handleCreate`.**

```jsx
// Al montar el componente, success = false (valor inicial del slice)
const success = useSelector(selectSuccess)    // closure: false

async function handleCreate() {
  await dispatch(createAlert(config))
  // dispatch resuelve → Redux actualiza success = true
  // PERO: success en el closure de handleCreate es el valor
  // capturado cuando la función se DEFINIÓ (false),
  // no el valor actual del store.
  if (success) {            // ← siempre evalúa false
    setConfig({ ...EMPTY_FORM })
    setDryRunResult(null)   // ← además, ReferenceError
  }
}
```

Impacto: aunque la alerta se crea correctamente, el formulario **nunca se
resetea**. El usuario ve el formulario con los datos de la alerta que acaba
de crear, sin feedback visual de éxito.

La corrección correcta no es solo declarar `setDryRunResult` — es usar el
resultado del dispatch para determinar si la creación fue exitosa:

```jsx
async function handleCreate() {
  const result = await dispatch(createAlert(config))
  if (createAlert.fulfilled.match(result)) {
    setConfig({ ...EMPTY_FORM })
    dispatch(clearDryRunResult())   // o dispatch(resetState())
  }
}
```

Y el botón "Limpiar" debe limpiar el dryRunResult del store, no llamar a un
setter de estado local:

```jsx
onClick={() => {
  setConfig({ ...EMPTY_FORM })
  dispatch(clearDryRunResult())   // clearDryRunResult no existe en el slice
  // alternativa: dispatch(resetState()) que sí existe
}}
```

**Nota:** el slice `alerts.js` exporta `resetState` y `clearSuccess` pero no
`clearDryRunResult`. La corrección de L272 puede usar `dispatch(resetState())`
o añadir un reducer `clearDryRunResult` al slice.

**Sin cobertura de tests:** no existe ningún archivo `AlertConfig.test.*`.

---

### E-002 / E-003 / E-004 — `no-empty`: catch vacíos en tres reportes idénticos

**Archivos:** `AgentsReport.jsx` (L62), `CampaignsReport.jsx` (L60), `QueuesReport.jsx` (L62)

Los tres archivos son casi copia exacta. El catch vacío aparece en `handleSaveView`:

```jsx
async function handleSaveView() {
  const name = window.prompt('Nombre para esta vista:')
  if (!name) return
  try {
    const { saveFilter } = await import('../../redux/slices/savedFilters')
    dispatch(saveFilter({ name, filters }))
  } catch (_) {}      // ← no-empty
}
```

El silenciamiento es **intencional** — guardar una vista es una acción
secundaria y un fallo no debe interrumpir al usuario. El problema es solo
de forma: ESLint requiere al menos un comentario dentro del bloque vacío.

**Hallazgo adicional — `buildShareUrl` duplicada:** los tres componentes
definen `buildShareUrl` internamente (copiada 3 veces, identidad funcional
exacta), mientras que ya existe `src/utils/reportShareUrl.js` con la misma
función (`buildShareUrl(basePath, filters)`). La función utilitaria no está
siendo usada por ninguno de los tres reportes.

**Hallazgo adicional — `dispatch` declarado pero subutilizado:** los tres
componentes importan `useDispatch` y lo usan exclusivamente en
`handleSaveView`. Si `handleSaveView` se extrajera a un hook compartido,
el `useDispatch` podría eliminarse del componente.

---

### E-005 / E-006 / E-007 — `no-empty`: catch vacíos en `mockInterceptor.js`

**Archivo:** `src/mocks/mockInterceptor.js`  
**Líneas:** 1935, 2012, 2062

Los tres son parsings de URL con `new URL(url, base)` dentro de handlers de
mock. El catch es intencional — si la URL es relativa o malformada, se
continúa con valores por defecto:

```js
// L1932-1936
try {
  testEstado = new URL(url, 'http://localhost').searchParams.get('test_estado') ?? 'ok'
} catch (_) {}   // ← no-empty: corrección = añadir comentario

// L2349 — patrón correcto (ya tiene comentario, no genera error):
} catch (_) { /* URL may not have query string */ }
```

La corrección es solo de forma — añadir un comentario en cada bloque, al
igual que ya tiene la línea L2349.

---

## 4. Warnings ESLint — clasificación real

**Total reportado:** 461 warnings. Distribuidos en 4 categorías:

### W-001 — `react/prop-types` (~200 warnings)

Componentes `.jsx` que reciben props sin declarar `PropTypes`. La regla está
en `warn` en `eslint.config.mjs`. Los 6 archivos `.ts`/`.tsx` están exentos
(el bloque TypeScript desactiva `no-undef` y `no-unused-vars`).

Severidad real: **baja en runtime** — PropTypes solo produce advertencias en
la consola del navegador en modo desarrollo. No afecta producción.

Opciones de resolución: declarar PropTypes para los componentes JS, o migrar
los componentes a TypeScript.

### W-002 — `no-unused-vars` (~150 warnings)

Variables e imports declarados pero no usados. El archivo con más imports es
`src/redux/store.js` (18 imports, todos necesarios — los 16 slice reducers más
2 middleware factories). No son imports no usados; es el conteo de líneas de
import del archivo, que sobreestima el problema.

Los casos reales incluyen:
- Iconos importados y no referenciados en el JSX.
- Constantes definidas para uso futuro que nunca llegaron.
- Variables de desestructuración no usadas.

### W-003 — `react-hooks/exhaustive-deps` (~80 warnings)

El patrón más frecuente: `useEffect(() => { loadData() }, [])` en los 7
componentes de reportes IVR (`AgentsReport`, `CampaignsReport`,
`QueuesReport`, `UniqueClientsReport`, `TransfersReport`, `HistoricalReports`,
`IVRMenusReport`). El array vacío es **intencional** — el efecto solo debe
ejecutarse al montar el componente. No es un bug de runtime.

El warning de ESLint es válido porque `loadData` es una función de closure
que podría capturar estado stale, pero en estos casos específicos el
comportamiento deseado es la carga inicial al montar, y funciona correctamente.

La corrección ESLint-conforme requeriría memoizar `loadData` con `useCallback`
e incluirlo en el array de dependencias, lo que es un cambio de mayor magnitud.

### W-004 — `no-console` (~30 warnings)

La regla permite `console.error` y `console.warn` pero no `console.log`.

Clasificación por tipo:

| Tipo | Archivos | Naturaleza |
|---|---|---|
| `withLogging.js` (decorador) | 10+ ocurrencias | Intencional — el propósito del decorador es logging |
| `redux/middleware/logger.js` | 3 ocurrencias | Intencional en desarrollo; el middleware NO está registrado en el store de producción |
| `websocketGateway.js` | 3 ocurrencias | Diagnóstico de conexión — candidato a `console.debug` o eliminación |
| `services/apiClient.js` | 1 ocurrencia | Log de retry — candidato a `console.warn` |
| `services/notificationGateway.js` | 1 ocurrencia | Log de notificaciones |
| `hooks/domain/useRealTimeChannel.js` | 2 ocurrencias | Estado de WebSocket |
| `components/examples/UserList.jsx` | 1 ocurrencia | Ejemplo de desarrollo |

El `withLogging.js` es el mayor contribuyente. Su propósito es explícito: es
un decorador de logging. Tiene sentido conservar `console.log` en ese archivo
o suprimir la regla con `eslint-disable` justificado.

---

## 5. Deuda técnica identificada

### DT-UI-001 — Bug runtime en `AlertConfig.jsx`: dos fallos distintos

**Prioridad:** ALTA  
**Componente:** `src/pages/alerts/AlertConfig.jsx`

**Fallo 1 — ReferenceError (L76, L272):** `setDryRunResult` no existe.
Causa crash al crear una alerta con éxito o al pulsar "Limpiar".

**Fallo 2 — Stale closure en `handleCreate`:** `success` se lee del closure
al momento de la definición de la función, no del store en el momento de la
ejecución. El formulario nunca se resetea aunque la alerta se cree con éxito.

**Corrección correcta:**

```jsx
// handleCreate: usar el resultado del dispatch, no el selector
async function handleCreate() {
  const result = await dispatch(createAlert(config))
  if (createAlert.fulfilled.match(result)) {
    setConfig({ ...EMPTY_FORM })
    dispatch(resetState())   // limpia dryRunResult, success y error
  }
}

// Botón Limpiar: usar dispatch en lugar de setter inexistente
onClick={() => {
  setConfig({ ...EMPTY_FORM })
  dispatch(resetState())
}}
```

**Eliminar:** la línea `const success = useSelector(selectSuccess)` puede
eliminarse del componente — ya no se necesita con la corrección anterior.

---

### DT-UI-002 — Errores `no-empty` en tres reportes (E-002/E-003/E-004)

**Prioridad:** MEDIA  
**Archivos:** `AgentsReport.jsx` L62, `CampaignsReport.jsx` L60, `QueuesReport.jsx` L62

**Corrección mínima:** añadir comentario en el bloque catch.

**Corrección completa (recomendada):** los tres componentes son casi idénticos.
Comparten: `buildShareUrl` (duplicada), `handleSaveView` (duplicada),
`handleShare` (duplicada), `ShareReportModal` (misma implementación),
`SavedFiltersPanel`, estructura de filtros. Extraer un hook compartido
`useReportPage({ reportType, loadFn, columns })` eliminaría la triplicación.

---

### DT-UI-003 — Errores `no-empty` en `mockInterceptor.js` (E-005/E-006/E-007)

**Prioridad:** BAJA  
**Archivo:** `src/mocks/mockInterceptor.js` L1935, L2012, L2062

**Corrección:** añadir comentario en cada bloque catch. El patrón correcto
ya existe en L2349 del mismo archivo.

---

### DT-UI-004 — `buildShareUrl` duplicada en tres reportes

**Prioridad:** MEDIA  
**Archivos:** `AgentsReport.jsx`, `CampaignsReport.jsx`, `QueuesReport.jsx`

La función `buildShareUrl` está definida localmente en los tres componentes con
la misma lógica. Ya existe `src/utils/reportShareUrl.js` con una implementación
idéntica que no está siendo importada.

**Corrección:** eliminar las tres definiciones locales e importar
`buildShareUrl` de `src/utils/reportShareUrl.js`.

---

### DT-UI-005 — Slice `navigation.js` no registrado en el store

**Prioridad:** MEDIA  
**Archivo:** `src/redux/slices/navigation.js`

El slice define `fetchNavigationMenu`, `fetchNavigationModules` y sus
`extraReducers`, pero no está incluido en `src/redux/store.js`. El navegador
dinámico del router usa `usePermisos` (que va a `permisos-client.ts`) —
no usa este slice. Ningún componente o hook usa los thunks de `navigation.js`.

El slice es código muerto — fue creado en anticipación a un patrón que
no se implementó, o quedó huérfano tras una refactorización.

**Corrección:** eliminar `src/redux/slices/navigation.js` y su test
`src/redux/slices/__tests__/` si existe, o registrarlo en el store y
conectarlo a un componente que lo use.

---

### DT-UI-006 — `userInfo` hardcodeado en `AppRouter.jsx`

**Prioridad:** MEDIA  
**Archivo:** `src/router/AppRouter.jsx` L304-308

El `DashboardLayout` recibe `userInfo` con datos ficticios:

```jsx
userInfo={{
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar_url: 'https://via.placeholder.com/40',
}}
```

El selector `selectUser` existe en `src/redux/selectors.js` y retorna el
usuario autenticado del store `auth`. No hay razón técnica para que el
layout use datos ficticios en lugar del usuario real.

**Corrección:** conectar el layout con `selectUser`:

```jsx
// En RoutesWithTransitions():
const currentUser = useSelector(selectUser)
// ...
userInfo={{
  name: currentUser?.name ?? '',
  email: currentUser?.email ?? '',
  avatar_url: currentUser?.avatar_url ?? '',
}}
```

---

### DT-UI-007 — `console.log` en middleware de producción: `loggerMiddleware`

**Prioridad:** BAJA  
**Archivo:** `src/redux/middleware/logger.js`

El middleware emite `console.log` en cada action despachada. Está declarado
en `src/redux/middleware/logger.js` pero **no está registrado en el store
de producción** (`src/redux/store.js` no lo importa). Por lo tanto no es un
riesgo activo en producción.

Sin embargo, si alguien lo registra en el store para depuración y olvida
quitarlo, contaminará los logs de producción. La corrección preventiva es
añadir un guard:

```js
if (process.env.NODE_ENV === 'development') {
  console.log('next state', store.getState())
}
```

---

### DT-UI-008 — `console.log` en `withLogging.js` sin guard de entorno

**Prioridad:** BAJA  
**Archivo:** `src/decorators/withLogging.js`

El decorador de logging tiene 10+ llamadas a `console.log`. Su propósito
es el logging explícito, pero sin un guard de entorno activa logging en
producción cuando se usa el decorador. Debería estar condicionado a
`process.env.NODE_ENV !== 'production'` o usar `console.debug`.

---

### DT-UI-009 — `AlertConfig.jsx` sin cobertura de tests

**Prioridad:** ALTA  
**Archivo:** `src/pages/alerts/AlertConfig.jsx`

No existe ningún archivo de test para este componente. El bug DT-UI-001
(dos fallos distintos) habría sido detectado con un test mínimo de
`handleCreate`. Es el componente con mayor impacto de usuario sin cobertura.

Tests mínimos necesarios:
- Render del formulario vacío.
- `handleCreate`: verificar que `createAlert` se despacha con los datos correctos.
- `handleCreate` exitoso: verificar que el formulario se resetea.
- `handleDryRun`: verificar que `dryRunAlertRule` se despacha.
- Botón "Limpiar": verificar que el formulario vuelve a `EMPTY_FORM`.
- `toggle()`: verificar que las acciones se añaden y quitan correctamente.

---

### DT-UI-010 — Páginas en `src/pages/` no accesibles por el router

**Prioridad:** BAJA  
**Descripción:** existen archivos en `src/pages/` que no tienen ruta en
`AppRouter.jsx`. Pueden ser componentes auxiliares, páginas en desarrollo, o
código muerto.

| Archivo | Tipo probable |
|---|---|
| `src/pages/Dashboard.jsx` | Placeholder vacío — el router usa `@ui/containers/DashboardMain` |
| `src/pages/Home.jsx` | Sin ruta registrada — posible landing page no implementada |
| `src/pages/NotFound.jsx` | Duplicado — el router usa `@screens/errors/NotFound` |
| `src/pages/Profile.jsx` | Sin ruta — el router usa `@ui/pages/Profile/Profile` |
| `src/pages/Settings.jsx` | Sin ruta — el router usa `@ui/features/Settings/Settings` |
| `pages/admin/AdminLayout.jsx` | Layout auxiliar, no es una página de ruta |
| `pages/alerts/Alerts.jsx` | Sin ruta — el router usa `@ui/pages/Alerts/Alerts` |
| `pages/audit/Audit.jsx` | Sin ruta — el router usa `@ui/pages/Audit/Audit` |
| `pages/auth/Login.jsx` | Accesible por el router vía `@screens/auth/Login` — OK |
| `pages/users/UserManagement/` | 3 archivos — `UserManagement.jsx` accesible; `UserForm.jsx` y `UserList.jsx` son sub-componentes |

Los más prioritarios son `Dashboard.jsx` y `NotFound.jsx` — son duplicados
de componentes que el router ya resuelve en otras rutas.

---

## 6. Resumen de deuda técnica

| ID | Descripción | Prioridad | Archivos |
|---|---|---|---|
| DT-UI-001 | Bug runtime: ReferenceError + stale closure en AlertConfig | ALTA | `AlertConfig.jsx`, `alerts.js` |
| DT-UI-009 | AlertConfig sin tests | ALTA | — |
| DT-UI-002 | catch vacíos en 3 reportes (ESLint error) | MEDIA | `AgentsReport`, `CampaignsReport`, `QueuesReport` |
| DT-UI-004 | `buildShareUrl` duplicada en 3 archivos (ya existe en utils/) | MEDIA | ídem |
| DT-UI-005 | Slice `navigation.js` no registrado — código muerto | MEDIA | `navigation.js`, `store.js` |
| DT-UI-006 | `userInfo` hardcodeado — selectUser existe pero no se usa | MEDIA | `AppRouter.jsx` |
| DT-UI-003 | catch vacíos en `mockInterceptor.js` (ESLint error) | BAJA | `mockInterceptor.js` |
| DT-UI-007 | `loggerMiddleware` sin guard de entorno (no activo en producción) | BAJA | `logger.js` |
| DT-UI-008 | `withLogging.js`: `console.log` sin guard de entorno | BAJA | `withLogging.js` |
| DT-UI-010 | Páginas en `src/pages/` sin ruta en el router | BAJA | 8 archivos |

---

## 7. Lo que NO es deuda técnica

- **2366 passed, 0 failed:** suite de tests en verde.
- **Gateways 7/7 cubiertos (FASE 6):** cobertura completa con metodología TDD.
- **`useEffect([], [])` en reportes:** intencional — carga al montar.
  ESLint advierte, el comportamiento es correcto.
- **`buildShareUrl` en mockInterceptor.js L2349:** catch con comentario —
  patrón correcto, no genera error.
- **`navigation.js` en `src/redux/slices/`:** tiene tests propios —
  el slice funciona, solo no está conectado al store.
- **TypeScript parcial:** coexistencia JS/TS gestionada correctamente por
  Babel y ESLint. Los 6 archivos TS cubren el módulo de permisos.
- **`react/prop-types` warnings:** no afectan runtime en producción (React 19
  eliminó la validación de PropTypes del core).
- **`loggerMiddleware`:** no está registrado en el store — no contamina logs
  de producción en el estado actual del código.

---

*Generado: 2026-05-16T06:10:22 | Commit base: 16949cc | Suite: 2366 passed*
