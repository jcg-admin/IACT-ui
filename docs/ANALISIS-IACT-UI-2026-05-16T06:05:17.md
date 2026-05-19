# ANALISIS-IACT-UI-2026-05-16T06:05:17

**Documento:** ANALISIS-IACT-UI-2026-05-16T06:05:17  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Rama:** develop  
**Commit base:** 16949cc  
**Propósito:** Inventario completo del estado actual, errores activos y deuda técnica. Base para el plan de implementación.

---

## 1. Identidad del proyecto

| Atributo | Valor |
|---|---|
| Nombre | `iact-dashboard` |
| Versión | 1.0.0 |
| Framework | React 19.0.0 + Redux Toolkit 2.0.0 |
| Bundler | Webpack 5.88.0 |
| Testing | Jest 29.7.0 + Testing Library React 16.3.2 |
| Linting | ESLint 9.39.4 (flat config) |
| TypeScript | Parcial — 6 archivos `.ts`/`.tsx` sobre base JS |
| Estado del router | React Router DOM 6.20.0 |
| Datos remotos | Axios/fetch vía `apiClient.js` + React Query 5.100.5 |

---

## 2. Estado de la suite de tests

```
2366 passed   0 failed   0 skipped
250 test suites
```

### Distribución por área

| Área | Archivos de test |
|---|---|
| `__tests__/` (raíz) | 161 |
| `pages/` | 65 |
| `components/` | 60 |
| `services/` | 29 |
| `state/` + `redux/` | 20 |
| `hooks/` | 7 |
| `utils/` | 3 |
| `facades/` | 2 |
| `decorators/` + `context/` | 2 |
| **Total** | **250** |

### Historial reciente (FASE 6)

La FASE 6 cerrada el 2026-05-15 añadió 145 tests de cobertura de gateways:

| Gateway | Tests añadidos |
|---|---|
| `accessGateway.js` | 64 |
| `auditGateway.js` | 28 |
| `alertsGateway.js` | 37 |
| `userGateway.js` | 22 |
| `sharesGateway.js` | 14 |
| `navigationGateway.js` | 6 |
| `savedFiltersGateway.js` | 15 |
| **Total** | **186** |

---

## 3. Estado de ESLint

**Resumen:** 8 errores, 461 warnings.

### 3.1 Errores (bloquean CI según configuración)

#### Error E-001 — `no-undef`: `setDryRunResult` no declarado

**Archivo:** `src/pages/alerts/AlertConfig.jsx`  
**Líneas:** 76, 272  
**Severidad:** error

`setDryRunResult` se usa en dos lugares pero nunca se declara. El componente
migró `dryRunResult` de `useState` local a Redux (`selectDryRunResult`), pero
olvidó eliminar las llamadas al setter del estado local.

```jsx
// L55: correcto — lee del store
const dryRunResultStore = useSelector(selectDryRunResult)
const dryRunResult = dryRunResultStore

// L76: FALLA — setDryRunResult nunca fue declarado
setDryRunResult(null)

// L272: FALLA — igual
onClick={() => { setConfig({ ...EMPTY_FORM }); setDryRunResult(null) }}
```

**Causa raíz:** refactorización incompleta de `useState` → Redux. El `useState`
fue eliminado pero sus referencias de escritura permanecieron.

**Impacto en runtime:** el componente lanza `ReferenceError: setDryRunResult is not defined`
al ejecutar `handleCreate()` (cuando la alerta se crea con éxito) o al pulsar
"Limpiar". La funcionalidad de creación de alertas está rota en producción.

**No tiene test:** no existe ningún archivo `AlertConfig.test.*` en el repositorio.

---

#### Errores E-002 a E-007 — `no-empty`: bloques `catch` vacíos

**Severidad:** error

| ID | Archivo | Línea | Contexto |
|---|---|---|---|
| E-002 | `src/pages/reports/AgentsReport.jsx` | 62 | `catch (_) {}` en `handleSaveView` |
| E-003 | `src/pages/reports/CampaignsReport.jsx` | 60 | `catch (_) {}` en `handleSaveView` |
| E-004 | `src/pages/reports/QueuesReport.jsx` | 62 | `catch (_) {}` en `handleSaveView` |
| E-005 | `src/mocks/mockInterceptor.js` | 1935 | `catch (_) {}` en parsing de URL |
| E-006 | `src/mocks/mockInterceptor.js` | 2012 | `catch (_) {}` en parsing de URL |
| E-007 | `src/mocks/mockInterceptor.js` | 2062 | `catch (_) {}` en parsing de URL |

Los tres reportes (AgentsReport, CampaignsReport, QueuesReport) comparten el
mismo patrón: `handleSaveView` hace un import dinámico de `savedFilters` y lo
descarta silenciosamente si falla. En los tres casos la intención de silenciar
el error es legítima (guardar una vista es opcional), pero ESLint requiere al
menos un comentario descriptivo dentro del bloque.

Los tres en `mockInterceptor.js` son parsings de URL con `new URL()` que pueden
fallar en URLs relativas — también intencionales.

**Corrección mínima:** añadir un comentario descriptivo:
```jsx
} catch (_) { /* guardar vista es opcional — continuar sin error */ }
```

**Error E-008:** `mockInterceptor.js` L2349 ya tiene comentario (`/* URL may not have query string */`)
y no genera error — patrón correcto.

---

### 3.2 Warnings (461 total)

#### W-001 — `react/prop-types`: PropTypes no declarados o incompletos

**Estimado:** ~200 warnings (la categoría más numerosa)  
**Distribución:** 88 archivos `.jsx` con componentes que reciben props sin PropTypes declarados.

La regla está configurada como `warn` en `eslint.config.mjs`. El proyecto usa
React 19 donde PropTypes son opcionales (la validación en runtime fue eliminada
de React core), pero ESLint sigue emitiendo el warning para componentes JS.
Los 6 archivos TypeScript (`PermissionGate.tsx`, `ProtectedRoute.tsx`, etc.)
están exentos — la regla `no-undef` está desactivada para `.ts`/`.tsx`.

#### W-002 — `no-unused-vars`: variables importadas o declaradas sin usar

**Estimado:** ~150 warnings  
**Patrón más frecuente:** imports de íconos, constantes o utilidades añadidas
durante el desarrollo y nunca eliminadas.

#### W-003 — `react-hooks/exhaustive-deps`: dependencias faltantes en useEffect/useCallback

**Estimado:** ~80 warnings  
**Contexto:** 252 ocurrencias de `useEffect`/`useCallback` en código no-test.
Un subconjunto tiene arrays de dependencias incompletos. Esta categoría es la
de mayor riesgo: puede causar stale closures o bucles de render infinito.

#### W-004 — `no-console`: `console.log` en código de producción

**Estimado:** ~30 warnings  
**Archivos afectados:** 33 archivos con `console.*`, de los cuales ~30 tienen
`console.log` (no permitido) y el resto usa `console.error`/`console.warn`
(permitidos por configuración: `{ allow: ['error', 'warn'] }`).

---

## 4. Arquitectura de la aplicación

### 4.1 Stack y capas

```
Entrada       src/index.js → AppProviders → App.jsx
Router        src/router/ (React Router DOM 6)
Estado        Redux Toolkit (src/redux/) + React Query (local)
Gateways      src/services/*Gateway.js (HTTP → IACT-api)
Páginas       src/pages/ (36 páginas en 5 módulos)
Componentes   src/components/ (shared, layout, features)
Permisos      src/permissions/catalog.js + usePermisos.ts + PermissionGate.tsx
Mocks         src/mocks/mockInterceptor.js (2768 líneas)
Estilos       SCSS + iact-kit (design system propio)
```

### 4.2 Módulos de páginas

| Módulo | Páginas | Descripción |
|---|---|---|
| `pages/access/` | 11 | RBAC: grupos, funciones, separación de roles, permisos temporales |
| `pages/reports/` | ~8 | Reportes IVR + ACD (AgentsReport, CampaignsReport, QueuesReport, UniqueClientsReport…) |
| `pages/alerts/` | 2+ | Gestión de alertas (`AlertConfig.jsx` con el error E-001) |
| `pages/admin/` | 3+ | Catálogos de administración (FunctionCatalog, AGRCatalog) |
| `pages/` (raíz) | 5 | Dashboard, Home, Profile, Settings, NotFound |

### 4.3 Redux: dos stores paralelos

El proyecto tiene **dos directorios de estado Redux**:
- `src/redux/` — store principal (16 slices: auth, alerts, access, reports, user…)
- `src/state/` — store secundario (appConfig, health)

Ambos coexisten. No hay evidencia de conflicto, pero la separación no está
documentada en ningún ADR.

### 4.4 TypeScript parcial

6 archivos TypeScript en una base JS:
- `src/components/PermissionGate.tsx` — guard de permisos
- `src/components/ProtectedRoute.tsx` — guard de rutas
- `src/config/api.config.ts` — configuración de API
- `src/hooks/usePermisos.ts` — hook de permisos RBAC
- `src/lib/permisos-client.ts` — cliente de permisos
- `src/types/permisos.types.ts` — tipos del módulo RBAC

La coexistencia JS/TS está gestionada por `@babel/preset-typescript` en Babel
y por el bloque específico de `eslint.config.mjs` para archivos `.ts`/`.tsx`.

### 4.5 Permisos RBAC (client-side)

`src/permissions/catalog.js` define 60+ códigos de permiso en notación `MOD-NNN`
alineados con IACT-api `create_functions.py` v5.4.0. Los guards UX (`PermissionGate`,
`usePermisos`) son solo de presentación — la autorización real ocurre en el backend.

---

## 5. Deuda técnica identificada

### DT-UI-001 — Error E-001: `setDryRunResult` no declarado (runtime crash)

**Prioridad:** ALTA  
**Tipo:** Bug de producción — `ReferenceError` al crear alertas o limpiar el formulario  
**Archivo:** `src/pages/alerts/AlertConfig.jsx` (L76, L272)  
**Corrección:** eliminar las dos llamadas a `setDryRunResult(null)`. La limpieza
del resultado del dry-run debe hacerse con `dispatch(clearDryRunResult())` o
equivalente según el slice de Redux `alerts`.  
**Test:** crear `AlertConfig.test.jsx` — actualmente sin cobertura.

---

### DT-UI-002 — Errores E-002/E-003/E-004: catch vacíos en reportes (3 archivos)

**Prioridad:** MEDIA  
**Tipo:** ESLint error — bloquea CI si se activa `--max-warnings 0`  
**Archivos:** `AgentsReport.jsx`, `CampaignsReport.jsx`, `QueuesReport.jsx`  
**Corrección:** añadir comentario descriptivo en el bloque `catch`:
```jsx
} catch (_) { /* guardar vista es opcional — continuar sin bloquear */ }
```
**Patrón:** los tres archivos son casi idénticos — la corrección es mecánica y se
aplica una sola vez con propagación a los otros dos.

---

### DT-UI-003 — Errores E-005/E-006/E-007: catch vacíos en mockInterceptor.js

**Prioridad:** BAJA  
**Tipo:** ESLint error — código de mock, no afecta producción  
**Archivo:** `src/mocks/mockInterceptor.js` (L1935, L2012, L2062)  
**Corrección:** añadir comentario descriptivo en cada bloque:
```js
} catch (_) { /* URL relativa sin hostname — ignorar */ }
```

---

### DT-UI-004 — Warnings W-003: react-hooks/exhaustive-deps (riesgo de stale closure)

**Prioridad:** MEDIA  
**Tipo:** Warning ESLint — riesgo de bugs sutiles en runtime  
**Alcance:** subconjunto de los 252 `useEffect`/`useCallback` en código no-test  
**Corrección:** inventario de los casos con dependencias faltantes y corrección
caso por caso. Algunos son falsos positivos (dependencias intencionalmente omitidas
para que el efecto se ejecute solo una vez); esos deben documentarse con
`// eslint-disable-next-line react-hooks/exhaustive-deps` y comentario de razón.

---

### DT-UI-005 — Warnings W-001/W-002: react/prop-types y no-unused-vars (~350 warnings)

**Prioridad:** BAJA (no afecta runtime)  
**Tipo:** Warning ESLint — calidad de código  
**Alcance:** ~88 componentes sin PropTypes, ~150 imports no usados  
**Corrección:**
- `react/prop-types`: añadir PropTypes o migrar los componentes afectados a TypeScript.
- `no-unused-vars`: eliminar los imports no utilizados.

---

### DT-UI-006 — Warnings W-004: console.log en código de producción (~30 instancias)

**Prioridad:** BAJA  
**Tipo:** Warning ESLint — polución de logs en producción  
**Alcance:** 33 archivos con `console.*`, ~30 con `console.log` no permitido  
**Corrección:** eliminar o reemplazar por `console.error`/`console.warn` donde
corresponda; usar el `errorLogger.js` del proyecto para errores estructurados.

---

### DT-UI-007 — Dos stores Redux sin documentación de separación

**Prioridad:** BAJA  
**Tipo:** Deuda arquitectónica — sin impacto en runtime  
**Descripción:** `src/redux/` y `src/state/` coexisten sin un ADR que explique
la separación. `src/state/` tiene solo 2 slices (appConfig, health) mientras
`src/redux/` tiene 16. La ausencia de criterio documentado dificulta decidir
en qué store añadir nuevo estado.

---

### DT-UI-008 — AlertConfig.jsx sin cobertura de tests

**Prioridad:** MEDIA  
**Tipo:** Deuda de cobertura — componente crítico sin tests  
**Descripción:** `AlertConfig.jsx` gestiona la creación de alertas (290 líneas,
formulario multi-campo con dry-run). No existe ningún test para este componente.
El bug E-001 habría sido detectado con un test mínimo de la función `handleCreate`.

---

## 6. Resumen de deuda técnica

| ID | Tipo | Prioridad | Archivos afectados |
|---|---|---|---|
| DT-UI-001 | Bug runtime (ReferenceError) | ALTA | `AlertConfig.jsx` |
| DT-UI-002 | ESLint error | MEDIA | `AgentsReport.jsx`, `CampaignsReport.jsx`, `QueuesReport.jsx` |
| DT-UI-003 | ESLint error (mock) | BAJA | `mockInterceptor.js` |
| DT-UI-004 | ESLint warning / riesgo runtime | MEDIA | Múltiples (hooks) |
| DT-UI-005 | ESLint warning / calidad | BAJA | ~88 componentes, ~150 imports |
| DT-UI-006 | ESLint warning / logs producción | BAJA | ~33 archivos |
| DT-UI-007 | Deuda arquitectónica | BAJA | `src/redux/`, `src/state/` |
| DT-UI-008 | Cobertura de tests | MEDIA | `AlertConfig.jsx` |

---

## 7. Lo que NO es deuda técnica

- **2366 passed, 0 failed:** la suite de tests está en verde. No hay regresiones.
- **FASE 6 cerrada:** cobertura de gateways 7/7, 186 tests nuevos, deuda de gateways = 0.
- **Mocks funcionales:** `mockInterceptor.js` intercepta correctamente todas las URLs
  de IACT-api, incluyendo los endpoints IVR (`/api/reports/ivr/*`).
- **Permisos RBAC alineados:** `catalog.js` sincronizado con IACT-api v5.4.0.
- **TypeScript parcial intencional:** los 6 archivos TS cubren el módulo de permisos
  (el más crítico para tipado). La migración incremental es válida.

---

## 8. Archivos clave para el plan de implementación

| Archivo | Relevancia |
|---|---|
| `src/pages/alerts/AlertConfig.jsx` | DT-UI-001 + DT-UI-008 — corrección + test |
| `src/pages/reports/AgentsReport.jsx` | DT-UI-002 |
| `src/pages/reports/CampaignsReport.jsx` | DT-UI-002 |
| `src/pages/reports/QueuesReport.jsx` | DT-UI-002 |
| `src/mocks/mockInterceptor.js` | DT-UI-003 |
| `eslint.config.mjs` | Configuración de las reglas |
| `src/redux/slices/alerts.js` | Slice necesario para corregir DT-UI-001 |

---

*Generado: 2026-05-16T06:05:17 | Commit base: 16949cc | Suite: 2366 passed*
