```yml
created_at: 2026-05-05 21:14:32
project: THYROX
work_package: 2026-05-05-21-14-32-http-error-handling
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Borrador
```

# Changelog — http-error-handling WP

## Added

- `src/components/feedback/ApiErrorToast.jsx` — componente React para errores
  transitorios. Severidad semántica (danger/warning), auto-cierre 6s,
  countdown para 429, botón Reintentar para errores retryables. SRP: una
  responsabilidad por componente (T-009).

- `src/components/feedback/ServerErrorBanner.jsx` — banner persistente sticky
  para 502/503 mantenimiento. Dismiss manual, no auto-cierre (T-010).

- `src/styles/components/_feedback.scss` — estilos para ambos componentes
  usando variables SCSS del proyecto. Sin Tailwind hardcodeado (T-012).

- `src/pages/errors/NotFoundPage.jsx` — página 404 con código grande,
  ícono Material, botón "Volver al inicio" (T-014).

- `src/pages/errors/AccessDeniedPage.jsx` — página 403 con ícono `lock`,
  botones "Volver" + "Contactar soporte" (T-015).

- `src/pages/errors/ServerErrorPage.jsx` — página 500 genérica con
  botón "Recargar página" (T-016).

- `src/pages/errors/ServiceUnavailablePage.jsx` — página 503 con
  `retryAfter` desde Redux si disponible (T-017).

- `src/styles/components/_error-pages.scss` — layout compartido para
  las 4 páginas de error. Variables IACT palette (T-018).

- 11 nuevas clases de error en `src/utils/apiErrors.js`:
  `MethodNotAllowedError` (405), `RequestTimeoutError` (408), `GoneError` (410),
  `PreconditionFailedError` (412), `PayloadTooLargeError` (413),
  `UnsupportedMediaTypeError` (415), `PreconditionRequiredError` (428),
  `RateLimitError` (429 — ya existía), `RequestHeaderFieldsTooLargeError` (431),
  `UnavailableForLegalReasonsError` (451), `NotImplementedError` (501),
  `NetworkAuthRequiredError` (511) — todos RFC 6585 donde aplica (T-004).

- `auditService.logEvent()` — método append-only para BR_008 compliance (T-024).

- `docs/guides/http-error-handling.md` — guía completa de arquitectura,
  tabla de status codes, comportamientos RFC 6585, selectores, componentes,
  thunks vs directas, BR_008/BR_010 compliance (T-026).

## Changed

- `src/redux/store.js` — registrar `adminReducer`, `logsReducer`,
  `savedFiltersReducer`. Wire `errorHandlingMiddleware` +
  `errorLoggingMiddleware` (estaban como dead code — F-01, F-02) (T-001, T-002).

- `src/utils/apiErrors.js` — `getErrorClassByStatusCode` actualizado con
  22 status codes (antes: 11). `isRetryableError` incluye 408 y 413 (T-005, T-006).

- `src/redux/middleware/errorHandling.js` — 429 surfaces `retryAfter` al
  usuario; 511 redirect a `loginUrl` (captive portal — RFC 6585 §6). Importa
  `NetworkAuthRequiredError`. BR_008: audit logging en `errorLoggingMiddleware`
  via `auditService.logEvent` fire-and-forget (T-007, T-024).

- `src/redux/slices/errorSlice.js` — `handleAPIError` preserva `retryAfter`
  en `state.global`. Nuevos selectores: `selectGlobalErrorIsRetryable`,
  `selectRetryAfter`, `selectIsPersistentError`.

- `src/App.jsx` — montar `ApiErrorToast` y `ServerErrorBanner` (T-011).

- `src/styles/iact-ui-kit.scss` — importar `_feedback.scss` y `_error-pages.scss`.

- `src/router/AppRouter.jsx` — reemplazar lambdas inline con páginas importadas
  via lazy(). Agregar rutas `/server-error` y `/service-unavailable` para testing
  (T-019).

- 7 páginas de logs + 2 páginas admin — remover `selectLogsError`/`selectAdminError`
  y `{error && <div className="error-banner">}` redundantes. El middleware + ApiErrorToast
  los muestra. Admin pages mantienen `formError` (validación cliente) (T-021).

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Entradas relevantes:
- Added: centralized HTTP error handling with RFC 6585 full coverage
- Added: ApiErrorToast + ServerErrorBanner OOD components
- Added: Error pages (404/403/500/503)
- Fixed: errorHandlingMiddleware and 3 reducers were dead code (not registered in store)
- Fixed: GlobalErrorToast was never mounted
- Added: BR_008 audit logging for HTTP errors
