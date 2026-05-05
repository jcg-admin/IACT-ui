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
> **Referencias:** BR_008, BR_010, FR-059..FR-065 (IACT-docs), mx-template alerts
> **Ruta crítica:** Wave 1 (foundation) → Wave 2 (status codes) →
> Wave 3 (error display) → Wave 4 (error pages) → Wave 5 (pages) → Wave 6 (docs)

---

## Wave 1 — Corregir la foundation (bloqueante)

- [ ] **T-001** Registrar adminReducer, logsReducer, savedFiltersReducer en `store.js`
- [ ] **T-002** Wire `errorHandlingMiddleware` + `errorLoggingMiddleware` en `store.js`
- [ ] **T-003** Commit Wave 1

---

## Wave 2 — Completar cobertura de status codes

- [ ] **T-004** Agregar 11 clases de error a `apiErrors.js`:
  `MethodNotAllowedError` (405), `RequestTimeoutError` (408), `GoneError` (410),
  `PreconditionFailedError` (412), `PayloadTooLargeError` (413),
  `UnsupportedMediaTypeError` (415), `PreconditionRequiredError` (428 RFC 6585),
  `RequestHeaderFieldsTooLargeError` (431 RFC 6585),
  `UnavailableForLegalReasonsError` (451), `NotImplementedError` (501),
  `NetworkAuthRequiredError` (511 RFC 6585)
- [ ] **T-005** Actualizar `getErrorClassByStatusCode` con los 11 nuevos códigos
- [ ] **T-006** Actualizar `isRetryableError` — agregar 408, 413 con retryAfter
- [ ] **T-007** Mejorar middleware: 429 muestra retryAfter al usuario; 511 hace redirect a loginUrl
- [ ] **T-008** Commit Wave 2

---

## Wave 3 — Sistema de error display por tipo

> El nombre `GlobalErrorToast` no describe intención (solo scope).
> Distintos errores requieren distinto UX. Referencia: mx-template alerts.
> Estructura mx-template: `alert-icon` (Material icon) + `close` + `<b>tipo:</b>` + mensaje.

### Estrategia por tipo de error

| Error | UX | Componente |
|-------|-----|------------|
| 400/422 validación | Inline en el form | No es componente global |
| 401 | Redirect silencioso a login | Middleware (sin componente) |
| 403 | Página `/access-denied` | Página dedicada |
| 408/429 rate limit | Toast con retryAfter countdown | `ApiErrorToast` |
| 500/502 | Toast descartable | `ApiErrorToast` |
| 503 mantenimiento | Banner persistente (no auto-cierra) | `ServerErrorBanner` |
| Red/timeout | Toast con botón "Reintentar" | `ApiErrorToast` |
| 511 captive portal | Redirect inmediato | Middleware (sin componente) |

- [ ] **T-009** Crear `src/components/feedback/ApiErrorToast.jsx`
  - Lee `state.error.global` via `selectGlobalError`
  - Variantes por tipo: info / success / warning / danger (siguiendo mx-template)
  - Ícono semántico por severidad: `info_outline` / `check` / `warning` / `error_outline`
  - Auto-cierre 6s para errores transitorios; sin auto-cierre para 503
  - Botón "Reintentar" cuando `isRetryableError` es true
  - Para 429: muestra countdown `Retry-After` en segundos
  - Reemplaza/renombra `GlobalErrorToast` (que ya no se usa en ningún lugar)

- [ ] **T-010** Crear `src/components/feedback/ServerErrorBanner.jsx`
  - Banner fijo en top de página (no toast flotante)
  - Solo se muestra para 503 (Service Unavailable) y 502 (Bad Gateway)
  - Ícono `warning` + mensaje + botón dismiss manual
  - Lee `state.error.global` con filtro por statusCode

- [ ] **T-011** Montar `ApiErrorToast` y `ServerErrorBanner` en `App.jsx` o layout raíz
  - Dentro del `<Provider>`, fuera de las rutas
  - Un solo punto de montaje para todo el árbol

- [ ] **T-012** Crear `src/styles/components/_feedback.scss`
  - Estilos para `.api-error-toast` y `.server-error-banner`
  - Basado en variables SCSS del proyecto (`$error-color`, `$warning-color`, etc.)
  - Estructura inspirada en mx-template: icon + tipo en negrita + mensaje + close
  - Toast: posición fixed bottom-right, z-index: $z-index-tooltip
  - Banner: posición sticky top:0, z-index: $z-index-sticky

- [ ] **T-013** Commit Wave 3

---

## Wave 4 — Páginas de error HTTP

> Actualmente solo existe `NotFound.jsx` sin estilos y `AccessDeniedPage` inline en AppRouter.
> Referencia de diseño: mx-template `alert-danger`/`alert-warning` + iconografía Material Icons.

- [ ] **T-014** Crear `src/pages/errors/NotFoundPage.jsx` (reemplaza `NotFound.jsx` y el inline)
  - Código de error grande (404), ícono, mensaje amigable, botón "Volver al inicio"
  - Usa variables SCSS: `$primary-color`, `$secondary-color`, `$gray-200`

- [ ] **T-015** Crear `src/pages/errors/AccessDeniedPage.jsx` (extrae inline de AppRouter)
  - 403 con ícono `lock`, mensaje explicativo, botón "Volver" + link a soporte

- [ ] **T-016** Crear `src/pages/errors/ServerErrorPage.jsx`
  - Genérico para 500 — ícono `error_outline`, "Error interno del servidor", botón reload

- [ ] **T-017** Crear `src/pages/errors/ServiceUnavailablePage.jsx`
  - 503 — ícono `build`, "Servicio en mantenimiento", Retry-After si disponible

- [ ] **T-018** Crear `src/styles/components/_error-pages.scss`
  - Estilos compartidos para las 4 páginas de error
  - Layout centrado, código de error tipografía grande, colores de la paleta IACT

- [ ] **T-019** Actualizar `AppRouter.jsx` — usar páginas extraídas, agregar ruta 500 (para testing)

- [ ] **T-020** Commit Wave 4

---

## Wave 5 — Estandarizar páginas existentes

### T-021: Quitar .error-banner redundante en páginas con thunks RTK
Páginas de logs y admin usan RTK thunks → middleware (ya wired tras T-002)
captura errores → `ApiErrorToast` los muestra. El `.error-banner` local duplica.
Remover `{error && <div className="error-banner">...}` y el selector local de error.

- [ ] **T-021** Quitar error-banner local de 9 páginas (logs + admin)

### T-022: Convertir report pages a thunks
Las 6 páginas de reportes usan `reportsService.getXxx()` directo.
Agregar thunks a `reportsSlice` + métodos a `reportsService` (transfers, ivr-menus, unique-clients).
Actualizar páginas para usar dispatch + selector.

- [ ] **T-022** Agregar thunks + métodos faltantes a reportsSlice/reportsService
- [ ] **T-023** Actualizar 6 páginas de reportes a thunks, quitar try/catch + error local

### T-024: BR_008 — logging de errores frontend
BR_008 requiere registro de todo acceso incluyendo resultado (éxito/fallo).
El `errorLoggingMiddleware` ya captura errores pero solo hace `console.error`.
Extender para enviar a `auditService` cuando hay un error HTTP autenticado.

- [ ] **T-024** Extender errorLoggingMiddleware para llamar auditService.logEvent en errores 4xx/5xx

- [ ] **T-025** Commit Wave 5

---

## Wave 6 — Documentación

- [ ] **T-026** Crear `docs/guides/http-error-handling.md`
  Documentar:
  - Arquitectura (apiErrors → apiService → middleware → errorSlice → ApiErrorToast)
  - Tabla completa de status codes con clase, comportamiento y UX
  - Los 4 códigos RFC 6585 y comportamiento especial (428, 429, 431, 511)
  - Cuándo usar thunks vs llamadas directas
  - Cómo leer errores por contexto (`selectContextError('logs')`)
  - Requisitos BR_008/BR_010 y cómo los cumple el sistema

- [ ] **T-027** Commit Wave 6 + push final

---

## DAG de dependencias

```
T-001 ──┐
T-002 ──┘── T-003

T-004 ──┐
T-005 ──┤── T-008
T-006 ──┤
T-007 ──┘

T-009 ──┐
T-010 ──┤
T-011 ──┤── T-013  (T-011 depende de T-009 y T-010)
T-012 ──┘

T-014 ──┐
T-015 ──┤
T-016 ──┤── T-020
T-017 ──┤
T-018 ──┤
T-019 ──┘  (T-019 depende de T-014..T-017)

T-021 ──┐
T-022 ──┤── T-025  (T-023 depende de T-022)
T-023 ──┤
T-024 ──┘

T-026 → T-027  (depende de T-008, T-013, T-020, T-025)
```

Bloqueante global: T-003 debe completarse antes de T-013 (montar Toast requiere middleware wired).

---

## Resumen

| Wave | Tareas | Descripción |
|------|--------|-------------|
| W1 Foundation | T-001..T-003 | store.js — reducers + middleware |
| W2 Status codes | T-004..T-008 | apiErrors.js — 11 nuevos códigos RFC |
| W3 Error display | T-009..T-013 | ApiErrorToast + ServerErrorBanner por tipo |
| W4 Error pages | T-014..T-020 | 404/403/500/503 con estilos IACT |
| W5 Pages | T-021..T-025 | Estandarizar páginas + BR_008 audit |
| W6 Docs | T-026..T-027 | Guía completa |
| **Total** | **27 tareas** | |
