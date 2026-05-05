```yml
created_at: 2026-05-05 21:14:32
project: THYROX
work_package: 2026-05-05-21-14-32-http-error-handling
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — HTTP Error Handling

> **Generado desde:** `discover/http-error-handling-analysis.md`
> **Ruta crítica:** Wave 1 (fix foundation) → Wave 2 (status codes) →
> Wave 3 (pages) → Wave 4 (docs)

---

## Wave 1 — Corregir la foundation (bloqueante para todo lo demás)

### T-001: Registrar reducers faltantes en store.js
Agregar imports y reducers para `adminSlice`, `logsSlice`, `savedFiltersSlice`
en `src/redux/store.js`. Sin esto las páginas admin, logs y SavedFiltersPanel
fallan al acceder a `state.admin`, `state.logs`, `state.savedFilters`.
- [ ] **T-001** Registrar adminReducer, logsReducer, savedFiltersReducer en store

### T-002: Montar GlobalErrorToast en el árbol de componentes
Verificar `src/App.jsx` o el layout raíz. Importar `GlobalErrorToast` desde
`@components/shared/ErrorDisplay` y montarlo una sola vez dentro del `<Provider>`.
- [ ] **T-002** Montar GlobalErrorToast en App.jsx o DashboardLayout

### T-003: Wire errorHandlingMiddleware + errorLoggingMiddleware en store.js
Importar ambos middlewares desde `@redux/middleware/errorHandling` y agregarlos
al chain en `configureStore`. El orden es: `[...getDefaultMiddleware(), errorLoggingMiddleware, errorHandlingMiddleware]`
(logging antes que handling para capturar el error antes de que sea procesado).
- [ ] **T-003** Wire middlewares en store.js

### T-004: Commit Wave 1
- [ ] **T-004** Commit Wave 1 — foundation wired

---

## Wave 2 — Completar cobertura de status codes

### T-005: Agregar clases de error faltantes a apiErrors.js
Agregar (siguiendo el patrón existente de la clase `APIError`):

```js
// 405
export class MethodNotAllowedError extends APIError {
  constructor(method = 'Unknown', url = '') {
    super(`Method ${method} not allowed for ${url}`, 'METHOD_NOT_ALLOWED', 405)
    this.name = 'MethodNotAllowedError'
  }
}

// 408 (server-side timeout, distinto a TimeoutError que es client-side)
export class RequestTimeoutError extends APIError {
  constructor() {
    super('The server timed out waiting for the request.', 'REQUEST_TIMEOUT', 408)
    this.name = 'RequestTimeoutError'
  }
}

// 410
export class GoneError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} has been permanently removed.`, 'GONE', 410)
    this.name = 'GoneError'
    this.resource = resource
  }
}

// 412
export class PreconditionFailedError extends APIError {
  constructor() {
    super('Precondition in request headers was not met.', 'PRECONDITION_FAILED', 412)
    this.name = 'PreconditionFailedError'
  }
}

// 413
export class PayloadTooLargeError extends APIError {
  constructor(retryAfter = null) {
    super('Request payload is too large.', 'PAYLOAD_TOO_LARGE', 413)
    this.name = 'PayloadTooLargeError'
    this.retryAfter = retryAfter
  }
}

// 415
export class UnsupportedMediaTypeError extends APIError {
  constructor(mediaType = '') {
    super(`Media type ${mediaType} is not supported.`, 'UNSUPPORTED_MEDIA_TYPE', 415)
    this.name = 'UnsupportedMediaTypeError'
  }
}

// 428 — RFC 6585 §3
export class PreconditionRequiredError extends APIError {
  constructor() {
    super('This request must be conditional (e.g., use If-Match).', 'PRECONDITION_REQUIRED', 428)
    this.name = 'PreconditionRequiredError'
  }
}

// 431 — RFC 6585 §5
export class RequestHeaderFieldsTooLargeError extends APIError {
  constructor() {
    super('Request header fields are too large.', 'REQUEST_HEADER_FIELDS_TOO_LARGE', 431)
    this.name = 'RequestHeaderFieldsTooLargeError'
  }
}

// 451
export class UnavailableForLegalReasonsError extends APIError {
  constructor() {
    super('This content is unavailable for legal reasons.', 'UNAVAILABLE_FOR_LEGAL_REASONS', 451)
    this.name = 'UnavailableForLegalReasonsError'
  }
}

// 501
export class NotImplementedError extends APIError {
  constructor(method = '') {
    super(`${method} is not implemented by this server.`, 'NOT_IMPLEMENTED', 501)
    this.name = 'NotImplementedError'
  }
}

// 511 — RFC 6585 §6 (captive portal)
export class NetworkAuthRequiredError extends APIError {
  constructor(loginUrl = null) {
    super('Network authentication required.', 'NETWORK_AUTH_REQUIRED', 511)
    this.name = 'NetworkAuthRequiredError'
    this.loginUrl = loginUrl  // URL a la que redirigir (del body HTML del captive portal)
  }
}
```

- [ ] **T-005** Agregar 11 clases de error a apiErrors.js

### T-006: Actualizar getErrorClassByStatusCode
Agregar los 11 nuevos status codes al mapa:
```js
405: MethodNotAllowedError,
408: RequestTimeoutError,
410: GoneError,
412: PreconditionFailedError,
413: PayloadTooLargeError,
415: UnsupportedMediaTypeError,
428: PreconditionRequiredError,
431: RequestHeaderFieldsTooLargeError,
451: UnavailableForLegalReasonsError,
501: NotImplementedError,
511: NetworkAuthRequiredError,
```
- [ ] **T-006** Actualizar getErrorClassByStatusCode

### T-007: Actualizar isRetryableError
Agregar `REQUEST_TIMEOUT` (408) y `SERVICE_UNAVAILABLE` ya existe. 413 con
`retryAfter` también es retryable.
- [ ] **T-007** Actualizar isRetryableError con nuevos códigos retryables

### T-008: Middleware — mejorar handling de 429 y agregar 511
```js
// 429 ya tiene el retryAfter — informar al usuario cuánto esperar
} else if (error instanceof RateLimitError) {
  const wait = error.retryAfter
  store.dispatch(setGlobalError({
    message: `Demasiadas solicitudes. Intenta en ${wait} segundos.`,
    code: 'RATE_LIMIT',
    retryAfter: wait,
  }))
}

// 511 — captive portal redirect
if (error instanceof NetworkAuthRequiredError && error.loginUrl) {
  window.location.href = error.loginUrl
  return next(action)
}
```
- [ ] **T-008** Mejorar middleware para 429 (info al usuario) y 511 (redirect)

### T-009: Commit Wave 2
- [ ] **T-009** Commit Wave 2 — status codes completos

---

## Wave 3 — Estandarizar páginas

### T-010: Quitar .error-banner de páginas que usan thunks RTK
Las páginas de logs y admin usan RTK thunks → el middleware (ya wired tras T-003)
captura los errores → `GlobalErrorToast` los muestra. El `.error-banner` local
es redundante.

Páginas a actualizar: LogsPage, ETLLogsPage, LogSearchPage, LogExportPage,
InfraLogsPage, SystemStatusPage, PerformanceMetricsPage, FunctionCatalogPage,
AGRCatalogPage.

Remover: `{error && <div className="error-banner">...}` y el `const error = useSelector(selectXxxError)` si solo se usaba para el banner.

- [ ] **T-010** Remover error-banner redundante en páginas con thunks RTK (9 páginas)

### T-011: Convertir report pages a thunks en reportsSlice
Las 6 páginas de reportes llaman `reportsService.getXxx()` directo. Agregar a
`reportsSlice.js` los thunks faltantes:

```js
export const fetchAgentsReport = createAsyncThunk('reports/fetchAgentsReport',
  async (filters, { rejectWithValue }) => {
    try { return await reportsService.getAgentsReport(filters) }
    catch (error) { return rejectWithValue(error.message) }
  }
)
// + fetchQueuesReport, fetchCampaignsReport
```

Para TransfersReport, IVRMenusReport, UniqueClientsReport (que no tienen método
en reportsService aún): agregar métodos a reportsService.js primero.

Actualizar las páginas para usar `dispatch(fetchXxxReport(filters))` +
`useSelector(selectXxxReport)` en lugar de estado local.

- [ ] **T-011** Agregar thunks faltantes a reportsSlice + métodos a reportsService
- [ ] **T-012** Actualizar 6 páginas de reportes a thunks + quitar try/catch local

### T-013: Estandarizar pages de access con try/catch
Las páginas de access (GroupManagementPage, GroupCompositionPage,
AssignFunctionsPage, etc.) mezclan dispatch de thunks con llamadas directas.
Revisar cuál es el patrón correcto para cada una y estandarizar.

- [ ] **T-013** Auditar y estandarizar pages de access (GroupManagement, GroupComposition)

### T-014: Commit Wave 3
- [ ] **T-014** Commit Wave 3 — páginas estandarizadas

---

## Wave 4 — Documentación

### T-015: docs/guides/http-error-handling.md
Documentar:
- Arquitectura del sistema de errores (apiErrors → apiService → middleware → errorSlice → GlobalErrorToast)
- Tabla completa de status codes cubiertos (con clase de error y comportamiento)
- Cuándo usar thunks vs llamadas directas (y por qué thunks)
- Cómo leer errores por contexto (`selectContextError('logs')`)
- Los 4 status codes del RFC 6585 y su comportamiento especial

- [ ] **T-015** Crear docs/guides/http-error-handling.md

### T-016: Commit Wave 4 + push
- [ ] **T-016** Commit Wave 4 — documentación

---

## DAG de dependencias

```
T-001 ──┐
T-002 ──┤── T-004 → T-009 → T-014 → T-016
T-003 ──┘
T-005 ──┐
T-006 ──┤── T-009
T-007 ──┤
T-008 ──┘
T-010 ──┐
T-011 ──┤── T-014
T-012 ──┤  (T-012 depende de T-011)
T-013 ──┘
T-015 → T-016  (depende de T-009 y T-014)
```

---

## Resumen

| Wave | Tareas | Archivos afectados |
|------|--------|--------------------|
| W1 Foundation | T-001..T-004 | store.js, App.jsx |
| W2 Status codes | T-005..T-009 | apiErrors.js, errorHandling.js |
| W3 Páginas | T-010..T-014 | 15+ páginas, reportsSlice.js, reportsService.js |
| W4 Docs | T-015..T-016 | docs/guides/ |
| **Total** | **16 tareas** | |
