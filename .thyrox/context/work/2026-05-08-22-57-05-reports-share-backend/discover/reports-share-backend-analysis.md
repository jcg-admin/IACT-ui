```yml
created_at: 2026-05-08 22:57:05
project: THYROX
work_package: 2026-05-08-22-57-05-reports-share-backend
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# Análisis DISCOVER — reports-share-backend (UC_RPT_11)

## Contexto

UC_RPT_11 "Compartir Reporte" fue excluido del WP `reports-uc-audit` porque la implementación
actual (`ShareReportModal.jsx`) es un copy-URL-to-clipboard sin backend. El spec requiere un
sistema completo con ShareEntry, RBAC `share_reports`, mailbox notify, y CNST-008 scope isolation.

---

## Estado actual (PROVEN)

### Lo que existe

| Artefacto | Ubicación | Qué hace |
|-----------|-----------|----------|
| `ShareReportModal.jsx` | `src/components/reports/` | Muestra URL + botón "Copiar enlace". Sin formulario de share. |
| `generateShareUrl()` | `src/services/reportsGateway.js:227` | Construye URL local con `window.location + params`. Sin API call. |
| `shareReport` thunk | `src/redux/slices/reports.js:50-54` | Llama `generateShareUrl()` — retorna string, nunca POST al backend. |
| `sharedUrl` state | `reports.js:176` | Guarda el string de URL generado localmente. |
| Mock `/api/me/shares/` | `mockInterceptor.js` | **Inexistente** — 0 resultados `grep "me/shares"`. |

### Lo que NO existe (gaps)

- **GAP-01 (CRÍTICO)**: `POST /api/me/shares/` — no existe ni endpoint ni mock ni thunk real.
- **GAP-02 (CRÍTICO)**: `GET /api/me/shares/sent/` — no existe.
- **GAP-03 (CRÍTICO)**: `GET /api/me/shares/received/` — no existe.
- **GAP-04 (CRÍTICO)**: `DELETE /api/me/shares/{id}/` — no existe.
- **GAP-05 (MEDIO)**: `ShareReportModal.jsx` — no tiene formulario (target, permission, expires_at).
- **GAP-06 (MEDIO)**: No existe página `SharedViews.jsx` para listar/revocar shares.
- **GAP-07 (BAJO)**: `sharesGateway.js` — no existe service dedicado para shares.
- **GAP-08 (BAJO)**: `sharesSlice.js` — no existe slice dedicado; `shareReport` thunk en reports.js es incorrecto.

---

## Spec UC_RPT_11 — Resumen de flujos relevantes (fuente de verdad)

### Flujo principal (3.1 Compartir)
- `POST /api/me/shares/` con `{ view_id, target_type, target_id, permission, expires_at?, message? }`
- RBAC `share_reports` + validar owner == invoker + target válido + no self-share + expires_at futuro
- Crear ShareEntry → Audit REPORT_SHARED → Mailbox notify → 201

### Flujo aplicar share (3.2)
- `GET /api/reports/{type}/?view_id=X` — backend resuelve ShareEntry activo
- Receptor aplica con SU scope (CNST-008) — no ve datos del owner

### Flujos de gestión (3.3-3.5)
- `GET /api/me/shares/sent/` — lista shares emitidos
- `GET /api/me/shares/received/` — lista shares recibidos
- `DELETE /api/me/shares/{id}/` → Audit REPORT_SHARE_REVOKED + 204

### Flujos alternos críticos
- FA-01: receptor sin segmento → 400 USER_WITHOUT_SEGMENT al apply
- FA-02: receptor con scope distinto → aplica con su scope (CNST-008)
- FA-03: target AGR → todos los users con AGR activo pueden apply
- FA-04: expires_at pasado → 403 SHARE_EXPIRED al apply

### Excepciones
- EX-02: sin `share_reports` → 403
- EX-04: no es owner de la view → 403
- EX-06: self-share → 400
- EX-07: expires_at en pasado al crear → 400
- EX-08: share expirado al apply → 403 SHARE_EXPIRED
- EX-09: share revocado al apply → 403 SHARE_NOT_FOUND

---

## Scope del WP — frontend + mock

### In scope

| Componente | Qué implementar |
|------------|-----------------|
| `sharesGateway.js` (nuevo) | `createShare`, `revokeShare`, `getSharesSent`, `getSharesReceived` |
| `sharesSlice.js` (nuevo) | thunks + state + selectors para todas las operaciones share |
| `ShareReportModal.jsx` (rewrite) | Formulario: target_type select, target_id input, permission radio, expires_at date, message textarea. FA-01/FA-04 error handling. |
| `SharedViews.jsx` (nuevo) | Página con tabs Enviados/Recibidos. Revocar desde enviados. Apply desde recibidos. |
| `mockInterceptor.js` | `_handleShares(url, method, body)` — CRUD completo con ShareEntry in-memory + EX-06/07 validation |
| AppRouter + nav | Ruta `/reports/shares` con permiso `share_reports` |

### Out of scope (no simulable significativamente en frontend)

- CA-04 scope isolation real (mock retorna datos ficticios, no aplica CNST-008 real)
- CA-03 AGR resolution dinámica (mock tiene fixture estático de AGR membership)
- Mailbox integration real (mock crea entrada en mailbox store si existe)
- Cascade delete de SavedView (mock elimina shares relacionados)

---

## Dependencias identificadas

- `src/redux/slices/savedFilters.js` — necesito el modelo de `view_id` (los filtros guardados son las "saved views" del spec)
- `src/permissions/catalog.js:82` — `VIEW_PIPELINE_ERRORS` existe; `share_reports` necesito verificar si existe como `SHARE_REPORTS`

---

## Riesgo

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| `savedFilters` ≠ `savedViews` en el spec — puede haber desalineación de modelo | MEDIO | Leer savedFilters slice antes de T-001 para confirmar `id` compatible con `view_id` |
| `ShareReportModal` es usado por 7 páginas de reportes — rewrite puede romper integraciones | MEDIO | Mantener props `isOpen`/`onClose` existentes; agregar `viewId` prop nueva para activar modo backend |
