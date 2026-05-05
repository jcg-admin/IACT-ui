```yml
created_at: 2026-05-05 21:14:32
project: THYROX
work_package: 2026-05-05-21-14-32-http-error-handling
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
version: 1.0.0
```

# DISCOVER — HTTP Error Handling

## Problema central

El proyecto tiene infraestructura de manejo de errores parcialmente construida pero
con dos brechas críticas que invalidan la arquitectura diseñada:

1. **El middleware de errores existe pero no está registrado en el store.**
2. **Las páginas nuevas mezclan tres patrones incompatibles de manejo de errores.**

---

## Hallazgos

### F-01 — errorHandlingMiddleware no está wired [PROVEN]

`src/redux/middleware/errorHandling.js` define `errorHandlingMiddleware`,
`errorLoggingMiddleware` y `autoRetryMiddleware`. Sin embargo, `src/redux/store.js`
no los importa ni registra. El middleware es dead code.

```js
// store.js — middleware actual
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({ serializableCheck: { ... } })
// ← errorHandlingMiddleware NUNCA se llama
```

**Impacto:** Ningún thunk rechazado llega a `errorSlice`. `GlobalErrorToast` nunca
muestra nada. El sistema centralizado de errores no funciona.

### F-02 — 3 nuevos reducers no registrados en store [PROVEN]

`adminSlice`, `logsSlice`, `savedFiltersSlice` existen como archivos pero no están
importados en `store.js`. Las páginas admin, logs y SavedFiltersPanel fallarán con
`state.admin is undefined`, `state.logs is undefined`, etc.

### F-03 — 3 patrones de error mezclados en páginas [PROVEN]

Verificado por `grep` en `src/pages/`:

| Patrón | Páginas | Problema |
|--------|---------|---------|
| RTK thunk + `.error-banner` local | 14 páginas logs/admin | Error duplicado si se wire el middleware |
| Llamada directa + `try/catch` + `.error-banner` | 11 páginas reports/access | Nunca llega al middleware; error invisible a `errorSlice` |
| RTK thunk sin banner | 0 páginas | El patrón correcto no existe aún |

### F-04 — Cobertura de status codes en apiErrors.js [PROVEN]

**Cubiertos:** 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504

**No cubiertos — relevantes para IACT (API REST + Django DRF):**

| Código | Nombre | Relevancia IACT |
|--------|--------|-----------------|
| 405 | Method Not Allowed | Llamadas a endpoints con método incorrecto |
| 408 | Request Timeout (server-side) | Distinto a `TimeoutError` (client-side) |
| 410 | Gone | Recurso permanentemente eliminado (vs 404 no encontrado) |
| 412 | Precondition Failed | Actualizaciones condicionales (If-Match) |
| 413 | Payload Too Large | Exportaciones, uploads de archivos grandes |
| 415 | Unsupported Media Type | Errores de Content-Type en requests |
| 428 | Precondition Required (RFC 6585) | Servidor requiere request condicional |
| 431 | Request Header Fields Too Large (RFC 6585) | Headers de auth muy grandes |
| 451 | Unavailable For Legal Reasons | Contenido bloqueado legalmente |
| 501 | Not Implemented | Endpoint no implementado aún |
| 511 | Network Authentication Required (RFC 6585) | Captive portal — requiere redirect |

**No relevantes para IACT** (WebDAV, HTTP/2 específicos, obsoletos):
207, 208, 226, 305, 306, 406, 407, 411, 414, 416, 417, 418, 421, 423, 424,
426, 505, 506, 507, 508, 510

### F-05 — 429 RateLimitError existe pero su handling es solo console.warn [PROVEN]

```js
} else if (error instanceof RateLimitError) {
  console.warn('[API] Rate limit exceeded:', error.message);
}
```

RFC 6585 §4 especifica que la respuesta DEBE incluir `Retry-After` header.
`RateLimitError` captura `retryAfter` pero el middleware no hace nada con él
(no agenda retry automático, no informa al usuario).

### F-06 — 511 requiere comportamiento especial [INFERRED]

RFC 6585 §6: 511 es generado por proxies intermediarios (captive portals), no
por el origin server. La respuesta contiene un HTML con redirect a la página de
login de red. El client debe:

1. No cachear la respuesta (MUST NOT)
2. Redirigir al usuario a la URL indicada en el body
3. No confundir con autenticación de aplicación (son capas distintas)

Ninguna de estas acciones está implementada.

### F-07 — GlobalErrorToast no está montado en el árbol de componentes [PROVEN]

`ErrorDisplay.jsx` exporta `GlobalErrorToast` y `ErrorBanner`. Verificado con
`grep -rn "GlobalErrorToast\|ErrorBanner\|ErrorDisplay" src/` (excluyendo el
archivo fuente y tests): cero resultados. No están importados en ningún componente.

El sistema centralizado de errores tiene tres partes rotas simultáneamente:
F-01 (middleware no wired) + F-07 (componente no montado) + F-03 (páginas no
usan el patrón correcto). El resultado neto es que `errorSlice` existe pero
nunca se usa.

---

## Alcance del WP

### En scope

1. **Wire el middleware** en `store.js` (errorHandlingMiddleware, errorLoggingMiddleware)
2. **Registrar reducers faltantes** (admin, logs, savedFilters) en store
3. **Agregar status codes faltantes** (405, 408, 410, 412, 413, 415, 428, 431, 451, 501, 511)
   a `apiErrors.js` + `getErrorClassByStatusCode`
4. **Middleware enhancements** para 429 (retry info al usuario) y 511 (redirect captive portal)
5. **Verificar y montar** `GlobalErrorToast` en el árbol de componentes (F-07)
6. **Estandarizar páginas** — eliminar `.error-banner` redundante en páginas que
   usen thunks; convertir report pages a thunks o documentar excepción
7. **Documentar** la arquitectura de errores y los status codes HTTP en `docs/guides/`

### Out of scope

- WebDAV status codes (207, 208, 423, 424, 507, 508) — no relevantes para IACT
- Modificar el backend para que retorne los nuevos status codes
- Implementar retry automático completo (está en `createResilientService` — es
  una capa separada)
- Cambiar `apiService` internals — solo se agrega cobertura de status codes

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| F-07 confirmado: GlobalErrorToast no montado | Alta | Alto | Verificar App.jsx antes de wire middleware |
| Páginas con try/catch local generan error doble al wire middleware | Media | Medio | Estandarizar antes de wire |
| 511 redirect interrumpe flujo de auth | Baja | Alto | Implementar con whitelist de URLs conocidas |
```
