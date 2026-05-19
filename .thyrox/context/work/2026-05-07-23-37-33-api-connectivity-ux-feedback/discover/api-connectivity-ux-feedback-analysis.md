```yml
created_at: 2026-05-07 23:39:44
project: THYROX
author: NestorMonroy
status: Borrador
version: 1.0.0
```

# Phase 1 — DISCOVER: api-connectivity-ux-feedback

## Síntesis ejecutiva

La aplicación IACT-UI tiene **dos capas de abstracción correctamente diseñadas**
(service layer → Redux thunks → components) pero **6 puntos donde la capa de servicio
está cortocircuitada** con datos locales: el componente o el servicio retorna datos
hardcodeados en lugar de delegar a `apiService`. Esto crea una brecha entre lo que
el usuario ve (datos estáticos, acciones sin efecto real) y lo que el backend espera.

Además, el sistema de feedback UX (spinners y errores) existe y está correctamente
wired en el store, pero **sólo 2 de ~20 páginas con thunks** lo consumen de forma
global — el resto usa estado local de cada slice.

---

## Hallazgo 1 — DashboardPage: bypass total de service layer

**Severidad:** CRÍTICA  
**Archivo:** `src/components/containers/DashboardPage.jsx`

```js
// DashboardPage.jsx — línea 7
import { mockFetchDashboardData } from '@mocks/dashboardMocks'
// …
const data = await mockFetchDashboardData()   // nunca llama apiService
```

**Causa raíz:** `DashboardPage` (el dashboard principal en `/dashboard`) importa
directamente la función mock — nunca pasa por el service layer.

**Agravante:** El slice `dashboardSlice.js` también tiene un `fetchDashboardData` thunk
que internamente llama `getMockDashboardData()` desde `@mocks/dashboardData` (otra función
mock). Son dos rutas paralelas, ambas hardcodeadas.

**Contraste:** `AnalyticsDashboard` (en `/analytics`) SÍ usa `reportsService.getDashboardMetrics()`
vía `fetchDashboardMetrics` thunk de `reportsSlice`, que apunta al endpoint real
`/api/reports/metrics/dashboard/`. Pero ese endpoint no tiene handler en `mockInterceptor`.

**Fix requerido:**
1. `DashboardPage` → usar `fetchDashboardMetrics` (thunk de `reportsSlice`) en lugar de `mockFetchDashboardData`.
2. Añadir handler `_handleDashboardMetrics()` en `mockInterceptor` para `/api/reports/metrics/dashboard/`.
3. `dashboardSlice.fetchDashboardData` puede deprecarse (ya no es el thunk canónico).

---

## Hallazgo 2 — ActiveSessions: componente completamente aislado

**Severidad:** ALTA  
**Archivo:** `src/components/features/SessionManagement/ActiveSessions.jsx`

```js
// ActiveSessions.jsx — dentro de loadSessions()
const mockSessions = [
  { id: 'session-1', device: 'Chrome on MacOS', ip: '192.168.1.100', … },
  { id: 'session-2', device: 'Safari on iPhone', … },
  { id: 'session-3', device: 'Firefox on Windows', … },
]
setSessions(mockSessions)  // datos hardcodeados, sin API call
```

```js
// handleRevokeSession() — sin API call
setSessions(prev => prev.filter(s => s.id !== sessionId))
```

**Causa raíz:** No existe un `sessionService` para sesiones del usuario autenticado,
ni thunks Redux para listar/revocar sesiones activas.

**Nota:** `sessionSlice` existe pero gestiona transacciones y jobs, NO sesiones del usuario.

**Permisos disponibles en catalog:** `auth:view_own_sessions`, `auth:manage_sessions`,
`auth:view_all_sessions` — las funciones están definidas pero la UI no las usa.

**Fix requerido:**
1. `authService` → añadir `getActiveSessions()` y `revokeSession(sessionId)`.
2. `authSlice` (o nuevo `userSessionsSlice`) → thunks `fetchActiveSessions` y `revokeSession`.
3. `ActiveSessions` → usar thunks Redux, eliminar mock local.
4. `mockInterceptor` → handler para `GET /api/auth/sessions/` y `DELETE /api/auth/sessions/{id}/`.

---

## Hallazgo 3 — PipelineStatus: mock en la capa de servicio

**Severidad:** ALTA  
**Archivo:** `src/services/logsService.js`

```js
// logsService.js — con TODO explícito
// TODO: replace mock — GET /api/v1/etl/supervision/
async getPipelineStatus() {
  return {
    estado_general: 'ok',
    ultima_ejecucion_exitosa: { trimestre: 'Q2_26', … },
    …
  }
}
```

**Causa raíz:** El thunk `fetchPipelineStatus` en `logsSlice` está correctamente
estructurado y pasa por `logsService.getPipelineStatus()`, pero el servicio retorna
datos hardcodeados — nunca llama `apiService.get(...)`.

**Contraste:** Todos los demás métodos de `logsService` (getLogs, getETLLogs,
getInfraLogs, etc.) sí usan `apiService.get(...)`. Este es el único mock.

**Fix requerido:**
1. `logsService.getPipelineStatus()` → `return apiService.get('/api/v1/etl/supervision/')`.
2. `mockInterceptor` → handler para `GET /api/v1/etl/supervision/` con datos mock correctos.

---

## Hallazgo 4 — Scheduled Reports sub-acciones: 5 métodos mock en servicio

**Severidad:** ALTA  
**Archivo:** `src/services/reportsService.js`

Cinco métodos con `// TODO: replace mock` explícito:

| Método | TODO endpoint |
|--------|--------------|
| `pauseSchedule(id)` | `PATCH /api/reports/scheduled/{id}/pause/` |
| `resumeSchedule(id)` | `PATCH /api/reports/scheduled/{id}/resume/` |
| `deleteSchedule(id)` | `DELETE /api/reports/scheduled/{id}/` |
| `runScheduleNow(id)` | `POST /api/reports/scheduled/{id}/run/` |
| `getScheduleHistory(id)` | `GET /api/reports/scheduled/{id}/runs/` |

**Nota importante:** `fetchScheduledReports` (GET lista) y `createScheduledReport` (POST)
ya usan `apiService` correctamente. El mock está solo en las sub-acciones sobre un schedule
existente.

**Estado del mockInterceptor:** `_handleScheduledReports` maneja `GET` (lista) y `POST`
(crear) pero **no maneja las sub-acciones** con ID en la URL. Cuando el frontend llama
`PATCH /api/reports/scheduled/1/pause/`, cae en el `if (url.includes('/api/reports/scheduled/'))`
del mock pero la lógica solo discrimina `method === 'POST'` y si no, retorna la lista.

**Fix requerido:**
1. `reportsService`: reemplazar 5 métodos mock por llamadas a `apiService`.
2. `mockInterceptor`: extender `_handleScheduledReports` para manejar sub-rutas con ID.

---

## Hallazgo 5 — RealTimeMetrics SSE: hook real vs método fantasma

**Severidad:** BAJA (split documentado)  
**Archivos:** `src/hooks/domain/useRealTimeMetrics.js`, `src/services/reportsService.js`

**El hook ESTÁ correctamente implementado con SSE real:**
```js
// useRealTimeMetrics.js
const es = new EventSource('/api/realtime/metrics/')
es.addEventListener('metrics', (e) => { setMetrics(JSON.parse(e.data)) })
```

**Pero existe un método orphan en reportsService:**
```js
// reportsService.js — TODO, no usado por la página
// TODO: replace mock — GET /api/realtime/metrics/ (SSE)
async getRealTimeMetrics() {
  return { timestamp: …, queue_count: 12, … }  // datos estáticos
}
```

**Causa raíz:** `reportsService.getRealTimeMetrics()` es un método huérfano — nadie lo
llama (la página usa el hook directo). El TODO confunde sobre si está implementado o no.

**Fix requerido:**
1. `mockInterceptor` → NO es posible simular SSE con `apiService.get()`. Necesita handler
   especial que, en modo dev, simule la secuencia de eventos SSE desde el interceptor.
2. `reportsService.getRealTimeMetrics()` → eliminar o marcar como `@deprecated`.

---

## Hallazgo 6 — loadingMiddleware: datos generados pero no consumidos

**Severidad:** MEDIA  
**Archivo:** `src/redux/middleware/loadingMiddleware.js`

**El middleware está wired correctamente:**
```js
// store.js
.concat(loadingMiddleware, errorLoggingMiddleware, errorHandlingMiddleware)
```

**El middleware funciona para todos los thunks:**
- Cuando `reports/fetchScheduledReports/pending` → `incrementContext('reports')`
- Cuando `logs/fetchPipelineStatus/pending` → `incrementContext('logs')`
- Cuando `dashboard/fetchData/pending` → `incrementContext('dashboard')`

**Pero solo 2 páginas consumen el estado global:**
```js
// LogsPage.jsx, ETLLogsPage.jsx — los únicos
const isLoading = useSelector(selectIsLoading('logs'))
```

**El resto usa estado local del slice:**
```js
// ScheduledReportPage.jsx — estado local
const loading = useSelector(selectReportsLoading)   // state.reports.loading
// PipelineStatusPage.jsx — estado local
const loading = useSelector(selectLogsLoading)       // state.logs.loading
```

**Evaluación:** No es un bug. Ambos enfoques son válidos. El loading local de slice
es más granular. El problema es que la inversión del WP anterior
(`ui-feedback-naming-and-loading`) se hizo para 2 páginas y el patrón no se propagó.

**Fix requerido:**
- Decidir si propagar `selectIsLoading(context)` al resto de páginas, o documentar
  que el middleware se usa sólo donde hace falta loading compartido entre rutas.
- Si se quiere consistencia global: migrar todas las páginas al patrón `selectIsLoading`.

---

## Hallazgo 7 — errorHandlingMiddleware: errores como strings, no objetos

**Severidad:** MEDIA  
**Archivo:** `src/redux/middleware/errorHandling.js`

El middleware espera objetos de error con `.statusCode`, `.toJSON()`, etc.:
```js
if (error instanceof UnauthorizedError) { … }
if (error instanceof RateLimitError) { … error.toJSON() … }
store.dispatch(setContextError({ context, error }))
```

Pero todos los thunks usan `rejectWithValue(error.message)` — pasan un **string**:
```js
// reportsSlice.js — patrón en todos los thunks
} catch (error) {
  return rejectWithValue(error.message)  // string, no objeto Error
}
```

**Consecuencia:** `errorHandlingMiddleware` recibe `action.payload = "Network Error"` 
(string). Las guardas `instanceof` fallan silenciosamente. `setContextError` recibe
`{ context: 'reports', error: "Network Error" }` — el slice almacena un string donde
espera un objeto.

**ApiErrorAlert funciona igual:** `selectGlobalError` retorna ese string, y el componente
hace `error.message` → undefined → muestra undefined al usuario.

**Fix requerido:**
1. Thunks → `rejectWithValue({ message: error.message, statusCode: error.response?.status })`
2. O bien: `errorHandlingMiddleware` → defender contra strings y normalizar antes de dispatch.

---

## Hallazgo 8 — Dashboard duplicado: DashboardPage vs AnalyticsDashboard

**Severidad:** MEDIA (deuda estructural)  
**Archivos:** `src/components/containers/DashboardPage.jsx`, `src/components/pages/Analytics/AnalyticsDashboard.jsx`

Dos páginas con propósito solapado:

| | DashboardPage | AnalyticsDashboard |
|---|---|---|
| Ruta | `/dashboard` (principal) | `/analytics` |
| Datos | `mockFetchDashboardData()` directo | `fetchDashboardMetrics` thunk real |
| Slice | `dashboardSlice` (metrics, charts) | `reportsSlice` (metrics, history) |
| WebSocket | No | Sí (`websocketService`) |

**Evaluación:** `DashboardPage` es la página principal pero tiene la implementación
inferior. `AnalyticsDashboard` tiene el thunk real pero no es la ruta `/dashboard`.
La decisión correcta es hacer que `/dashboard` use la misma infraestructura que `AnalyticsDashboard`.

---

## Estado de los middlewares

| Middleware | Wired | Funciona correctamente | Consumido por UI |
|------------|-------|----------------------|-----------------|
| `loadingMiddleware` | ✅ store.js | ✅ para todos los thunks | ⚠️ Solo LogsPage + ETLLogsPage |
| `errorHandlingMiddleware` | ✅ store.js | ⚠️ Falla silenciosamente con strings | ✅ ApiErrorAlert (global) |
| `errorLoggingMiddleware` | ✅ store.js | ✅ console.error + auditService | — (logging only) |

---

## Evaluación de necesidad de middleware adicional

### Retry middleware
- `autoRetryMiddleware` existe en `errorHandling.js` pero es **informativo** — solo hace `console.log`.
- `apiService` no tiene retry automático.
- **Veredicto:** Implementar retry real en `apiService` (p.ej. axios-retry o manual) es más efectivo que hacerlo en middleware.

### Timeout middleware
- `apiService` usa axios. Axios tiene `timeout` configurable pero no está en el config actual.
- **Veredicto:** Añadir `timeout: 30000` a la config de `apiService` — no requiere nuevo middleware.

### Auth-refresh middleware
- El `errorHandlingMiddleware` ya detecta `UnauthorizedError` y dispara `auth:unauthorized` custom event.
- No hay interceptor axios para refrescar el token 401 automáticamente.
- **Veredicto:** Añadir interceptor axios 401 en `apiService` que intente refresh antes de logout — más efectivo que middleware Redux.

**Conclusión:** No se necesitan middlewares Redux nuevos. Las funcionalidades faltantes
se implementan mejor en `apiService` (retry, timeout, auth-refresh).

---

## Mapa de gaps vs fixes

```
GAP                          FIX                              DONDE
───────────────────────────────────────────────────────────────────────
1. DashboardPage mock       → usar fetchDashboardMetrics      DashboardPage.jsx
                             + handler mockInterceptor        mockInterceptor.js

2. ActiveSessions mock      → authService.getActiveSessions   authService.js (nuevo)
                             + thunk fetchActiveSessions       authSlice.js (nuevo)
                             + handler mockInterceptor         mockInterceptor.js
                             + connect ActiveSessions          ActiveSessions.jsx

3. PipelineStatus mock      → logsService call apiService     logsService.js
   (en servicio)              + handler mockInterceptor        mockInterceptor.js

4. ScheduledReports 5 TODOs → 5 métodos → apiService.X       reportsService.js
                             + sub-actions handler             mockInterceptor.js

5. SSE sin mock dev         → SSE mock handler                mockInterceptor.js (especial)
                             + remove getRealTimeMetrics()     reportsService.js

6. Error strings vs objects → normalizar rejectWithValue      todos los thunks
                             O defender middleware             errorHandling.js

7. loadingMiddleware gap    → documentar o propagar           decisión de diseño
```

---

## Stopping Point Manifest

| ID | Gate | Descripción |
|----|------|-------------|
| SP-01 | ✅ | Confirmar apertura del WP (aprobado por usuario) |
| SP-02 | 1→3 | Revisión del DISCOVER analysis — antes de crear task plan |

---

## Próxima fase recomendada

Phase 8 — PLAN EXECUTION: crear task plan con T-001..T-NNN cubriendo los 7 gaps.
El WP es de tamaño **mediano** → fases 1, 3(este análisis), 8, 10, 11.
