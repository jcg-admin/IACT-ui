# HTTP Error Handling — IACT UI

Guía de arquitectura del sistema centralizado de manejo de errores HTTP.

---

## Arquitectura

```
API call fails
      │
      ▼
apiService (fetch/axios)
      │  throws typed error class
      ▼
RTK thunk → action.type.endsWith('/rejected')
      │
      ├─► errorLoggingMiddleware
      │       └─► console.error + auditService.logEvent (BR_008)
      │
      └─► errorHandlingMiddleware
              ├─► 401 → window.dispatchEvent('auth:unauthorized')
              ├─► 429 → setGlobalError with retryAfter
              ├─► 511 → window.location.href = loginUrl
              └─► rest → setContextError(context) OR handleAPIError
                              │
                              ▼
                         errorSlice.global / errorSlice.byContext
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             ApiErrorToast       ServerErrorBanner
           (transient errors)   (502/503 persistent)
```

---

## Status codes — cobertura completa

| Código | Clase | Retryable | UX |
|--------|-------|-----------|-----|
| 400 | `BadRequestError` | No | Inline en form |
| 401 | `UnauthorizedError` | No | Redirect silencioso a login (middleware) |
| 403 | `ForbiddenError` | No | `/access-denied` page |
| 404 | `NotFoundError` | No | `ApiErrorToast` danger |
| 405 | `MethodNotAllowedError` | No | `ApiErrorToast` danger |
| 408 | `RequestTimeoutError` | Sí | `ApiErrorToast` warning + Reintentar |
| 410 | `GoneError` | No | `ApiErrorToast` danger |
| 412 | `PreconditionFailedError` | No | `ApiErrorToast` danger |
| 413 | `PayloadTooLargeError` | Sí | `ApiErrorToast` warning + Reintentar |
| 415 | `UnsupportedMediaTypeError` | No | `ApiErrorToast` danger |
| 422 | `ValidationError` | No | Inline en form (campo por campo) |
| 428 | `PreconditionRequiredError` (RFC 6585) | No | `ApiErrorToast` danger |
| 429 | `RateLimitError` (RFC 6585) | Sí | `ApiErrorToast` warning + countdown `retryAfter` |
| 431 | `RequestHeaderFieldsTooLargeError` (RFC 6585) | No | `ApiErrorToast` danger |
| 451 | `UnavailableForLegalReasonsError` | No | `ApiErrorToast` danger |
| 500 | `InternalServerError` | No | `ApiErrorToast` danger |
| 501 | `NotImplementedError` | No | `ApiErrorToast` danger |
| 502 | `BadGatewayError` | Sí | `ServerErrorBanner` (persistente) |
| 503 | `ServiceUnavailableError` | Sí | `ServerErrorBanner` (persistente) |
| 504 | `GatewayTimeoutError` | Sí | `ApiErrorToast` warning + Reintentar |
| 511 | `NetworkAuthRequiredError` (RFC 6585) | No | Redirect a loginUrl (middleware) |

### Códigos RFC 6585 — comportamientos especiales

- **428 Precondition Required**: El servidor requiere `If-Match` header. Pedir al usuario que recargue antes de enviar.
- **429 Too Many Requests**: DEBE incluir `Retry-After` header. El middleware extrae `retryAfter` y lo pasa al estado. `ApiErrorToast` muestra countdown.
- **431 Request Header Fields Too Large**: Token JWT o cookies demasiado grandes. Indica problema de configuración.
- **511 Network Authentication Required**: Generado por un **proxy** (captive portal), no el origin server. El middleware redirige al usuario a `loginUrl` del body (RFC 6585 §6). No cachear, no confundir con 401 (autenticación de aplicación).

---

## Thunks vs llamadas directas

### Cuándo usar thunks RTK (patrón recomendado)

```js
// En el componente:
dispatch(fetchLogs({ date_from, date_to }))
// No try/catch, no local error state — el middleware lo maneja
```

Usar thunks cuando:
- La operación modifica estado compartido (logs, reports, admin data)
- El error debe ser visible en toda la aplicación
- Se necesita tracking via `errorLoggingMiddleware`

### Cuándo usar llamadas directas (excepción documentada)

```js
// Forma directa — solo para operaciones de UI puntual
try {
  await reportsService.exportReport(filters)
} catch (e) {
  // Mostrar error local si es UI-only y no afecta estado global
}
```

Usar directas solo para:
- Operaciones sin estado Redux correspondiente
- Errores que son responsabilidad exclusiva del componente (e.g. validación de formulario)

---

## Leer errores por contexto

Los thunks populan `state.error.byContext[context]` donde `context = action.type.split('/')[0]`.

```js
// Selector por contexto
import { selectContextError } from '@redux/slices/errorSlice'

const logsError = useSelector(selectContextError('logs'))
const dashboardError = useSelector(selectContextError('dashboard'))
```

El contexto se extrae automáticamente del action type:
- `logs/fetchLogs/rejected` → context `'logs'`
- `dashboard/fetchMetrics/rejected` → context `'dashboard'`

---

## Selectores disponibles

| Selector | Retorna |
|----------|---------|
| `selectGlobalError` | Error global actual `{code, message, statusCode, retryAfter}` |
| `selectContextError(ctx)` | Error de un contexto específico |
| `selectGlobalErrorIsRetryable` | `true` si tiene `retryAfter` |
| `selectRetryAfter` | Segundos para reintentar (429/408) |
| `selectIsPersistentError` | `true` para 502/503 (→ `ServerErrorBanner`) |
| `selectErrorHistory` | Últimos 10 errores |

---

## Componentes de display

### `ApiErrorToast`

- Montado en `App.jsx` fuera de las rutas
- Lee `selectGlobalError`
- Omite errores 502/503 (manejados por `ServerErrorBanner`)
- Auto-cierre 6s para errores transitorios
- Sin auto-cierre para errores con retryAfter (usuario debe esperar countdown)
- Botón "Reintentar" cuando `isRetryableError = true` y countdown terminó
- Severidad: `danger` (4xx/5xx), `warning` (429/408/413)

### `ServerErrorBanner`

- Montado en `App.jsx` encima del router
- Solo visible para 502/503
- Banner sticky top, no flotante
- Dismiss manual (sin auto-cierre — el servicio puede estar horas en mantenimiento)
- Ícono `build` para 503 (mantenimiento), `warning` para 502

---

## BR_008 / BR_010 — Compliance

**BR_008**: Todo acceso al sistema debe ser registrado (usuario, timestamp, acción, resultado).

**BR_010**: Los logs de auditoría son inmutables (append-only).

Implementación:
1. `errorLoggingMiddleware` detecta thunks rechazados con `statusCode >= 400`
2. Si el usuario está autenticado, llama `auditService.logEvent()` (fire-and-forget)
3. `auditService.logEvent()` hace POST a `/api/audit/events` — endpoint append-only
4. Nunca lanza excepción — audit logging no debe interrumpir el flujo de UI

Campos registrados:
```json
{
  "event_type": "HTTP_ERROR",
  "timestamp": "2026-05-05T21:14:32Z",
  "user_id": "usr_123",
  "action": "logs/fetchLogs",
  "status_code": 500,
  "error_code": "INTERNAL_SERVER_ERROR",
  "message": "Internal server error",
  "retryable": false
}
```

---

## Páginas de error HTTP

| Ruta | Página | Cuándo usar |
|------|--------|-------------|
| `/access-denied` | `AccessDeniedPage` | 403 Forbidden — redirect desde middleware |
| `/server-error` | `ServerErrorPage` | 500 — para testing / redirect manual |
| `/service-unavailable` | `ServiceUnavailablePage` | 503 — para testing / redirect manual |
| `*` (catch-all) | `NotFoundPage` | 404 — ruta no existe en el router |
