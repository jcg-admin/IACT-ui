```yml
created_at: 2026-05-08 21:58:00
project: THYROX
work_package: 2026-05-08-21-54-06-reports-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — reports-uc-audit

## Scope

UC_RPT_08 · UC_RPT_09 · UC_RPT_11 — módulo Reports.
Fuente: `/tmp/references/IACT-docs/source/requisitos/casos-uso/reports/`
(branch `feature/cnst-033-uml-conformance`). Spec completa en los 3 UCs.
Implementación: `src/pages/reports/`, `src/services/reportsGateway.js`,
`src/redux/slices/reports.js`, `src/redux/slices/savedFilters.js`,
`src/components/reports/`, `src/mocks/mockInterceptor.js`.

---

## UC_RPT_08 — Scheduled Reports (List/Detail/Runs)

**Flujo principal:** GET list con filtros opcionales, GET detail, GET runs paginado.

### Estado de implementación base

- ✅ `getScheduledReports()` → `GET /api/reports/scheduled/` — gateway + thunk + mock
- ✅ `getScheduledRuns(id)` → `GET /scheduled/{id}/runs/` — gateway + mock `_handleScheduleHistory`
- ✅ Sub-actions pause/resume/delete/run — gateway + mock `_handleScheduleSubAction`

### GAP-01 — No existe `getScheduledDetail(id)` en gateway (BAJO)

**Evidencia (PROVEN):**
```
reportsGateway.js:107  async getScheduledReports() {  ← list sin {id}
reports.js: sin thunk fetchScheduledDetail
```
Spec §3.2: "GET /scheduled/{id}/. Auth + RBAC. Verificar ownership o scope."
La URL `/scheduled/{id}/` con GET cae en el mock handler de sub-actions que
solo acepta `method !== 'GET'`, por lo que retorna 404.

### GAP-02 — Mock no soporta filtros `?status=` y `?frequency=` (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js:1620  _handleScheduledReports(method, body)
```
Handler GET retorna los 3 schedules siempre. FA-02 requiere `status=active`
filtrando solo los activos. El gateway y el thunk tampoco aceptan filtros.

### GAP-03 — Mock `_handleScheduleHistory` no incluye run fallido (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js: status: 'ok' en ambos runs del fixture
```
FA-04: "Detalle incluye snapshot del último run (success/failed + error_code)."
El fixture de runs no tiene ningún run con `status: 'failed'` + `error_code`.
Imposible testear el estado de error en la UI.

---

## UC_RPT_09 — Saved Filters (CRUD + Apply)

**Flujo principal:** POST crear filtro, CRUD sobre `/me/filters/`, aplicar con
`?saved_filter_id=X`. Validaciones: nombre único, ≤50 filtros por user,
filtros válidos dentro del segmento del user.

### Estado de implementación base

- ✅ `savedFiltersSlice.js`: `fetchSavedFilters`, `saveFilter`, `deleteFilter`
- ✅ `SavedFiltersPanel.jsx`: lista, borra, aplica via `onApply(sf.filters)` (client-side)
- ✅ `HistoricalReports.jsx`: integra `SavedFiltersPanel` con `onApply`

### GAP-04 — URL mismatch: `/api/reports/saved-filters/` vs `/api/me/filters/` (MEDIO)

**Evidencia (PROVEN):**
```
savedFilters.js:7   return await apiService.get('/api/reports/saved-filters/')
savedFilters.js:18  return await apiService.post('/api/reports/saved-filters/', ...)
```
Spec §3.2: "CRUD estándar sobre `/me/filters/` con ownership por defecto."
El frontend usa `/api/reports/saved-filters/` — URL diferente al spec.

**Impacto:** En integración real, las requests del frontend llegan a un endpoint
que el backend no tiene registrado bajo esa ruta.

### GAP-05 — No existe `updateFilter` thunk (BAJO)

**Evidencia (PROVEN):**
```
savedFilters.js: solo fetchSavedFilters, saveFilter, deleteFilter
```
Spec §3.2: "CRUD estándar" incluye UPDATE. No hay `PATCH /me/filters/{id}/`.

### GAP-06 — No existe campo `is_default` — FA-04 no implementado (BAJO)

**Evidencia (PROVEN):**
```
SavedFiltersPanel.jsx: no renderiza ningún control "default"
savedFilters.js initialState: no campo is_default
```
FA-04: "User puede marcar 1 filtro como default para un report_type. Frontend
lo aplica automáticamente al abrir el reporte."

### GAP-07 — Mock no tiene handler para saved-filters (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js: grep saved.filter → 0 resultados
```
Cualquier llamada a `/api/reports/saved-filters/` o `/api/me/filters/` retorna
404 en desarrollo. No se puede testear el flujo completo.

### GAP-08 — Mock no simula FA-01 nombre duplicado → 400 (BAJO)

**Evidencia (PROVEN):** No existe handler → no puede simular 400 NAME_DUPLICATE.

---

## UC_RPT_11 — Report Sharing (POST/GET/DELETE + Scope)

**Flujo principal:** POST crea ShareEntry (target user/AGR, expires_at), backend
aplica con scope del receptor (CNST-008), mailbox notify, GET sent/received,
DELETE revoke.

### Estado de implementación base — DESVIACIÓN CRÍTICA

**Evidencia (PROVEN):**
```
ShareReportModal.jsx: copia URL al clipboard — sin llamada al backend
reports.js:38  export const shareReport = createAsyncThunk(
reports.js:42    return reportsService.generateShareUrl(type, filters)
reportsGateway.js:217  generateShareUrl(type, filters = {}) {
reportsGateway.js:220    return `${base}/reports/shared?${params}`
```

La implementación actual es una funcionalidad de "copiar enlace" — genera una
URL local con parámetros y la pega en el clipboard. No hay:
- POST al backend (`/api/reports/shares/`)
- Concepto de `target_user_id`, `target_agr_id`, ni `expires_at`
- Endpoints GET sent/received
- DELETE para revocar
- Mailbox notification
- Aplicación de scope del receptor (CNST-008)

### GAP-09 — shareReport thunk no hace POST al backend (CRÍTICO — fuera de scope)

**Evidencia (PROVEN):**
```
reportsGateway.js:217  generateShareUrl() { return `${base}/reports/shared?...` }
```
El thunk llama a una función que retorna un string URL — no es una llamada HTTP.
Esto no es un bug corregible en el contexto de este WP: es una feature completa
que requiere su propio WP con diseño y task plan separados.

**Decisión de scope:** GAP-09 + todo lo relacionado con UC_RPT_11 se extrae
fuera de este WP. Se crea recomendación de WP `reports-share-backend` al cierre.

La ShareReportModal existente (copy-URL) puede quedar como implementación parcial
de la UX (FA-05: "rápida aplicación") mientras la feature de sharing real se implementa.

---

## Resumen de gaps en scope

| ID | UC | Severidad | Descripción | Archivos afectados |
|----|-----|-----------|-------------|-------------------|
| GAP-01 | UC_RPT_08 | BAJO | No existe `getScheduledDetail(id)` — gateway + mock GET detail | reportsGateway.js, reports.js, mockInterceptor.js |
| GAP-02 | UC_RPT_08 | BAJO | Mock GET list no filtra por `?status=` ni `?frequency=` (FA-02) | mockInterceptor.js, reportsGateway.js, reports.js |
| GAP-03 | UC_RPT_08 | BAJO | Mock runs no incluye run fallido con error_code (FA-04) | mockInterceptor.js |
| GAP-04 | UC_RPT_09 | MEDIO | URL mismatch: `/api/reports/saved-filters/` vs `/api/me/filters/` | savedFilters.js |
| GAP-05 | UC_RPT_09 | BAJO | No existe `updateFilter` thunk (spec §3.2 CRUD) | savedFilters.js |
| GAP-06 | UC_RPT_09 | BAJO | No existe campo `is_default` — FA-04 no implementado | savedFilters.js, SavedFiltersPanel.jsx |
| GAP-07 | UC_RPT_09 | BAJO | Mock no tiene handler saved-filters — todo retorna 404 | mockInterceptor.js |
| GAP-08 | UC_RPT_09 | BAJO | Mock no simula FA-01 nombre duplicado → 400 | mockInterceptor.js |

**Fuera de scope (nuevo WP):**
- GAP-09: UC_RPT_11 — shareReport es copy-URL, no POST al backend. Requiere WP dedicado `reports-share-backend`.

---

## Patrón PAT-UC-AUDIT-001

Aplicado: spec completa leída (flujo-principal + flujos-alternos) para los 3 UCs.
Implementación verificada con Read/Grep en archivos fuente reales.

## Exit criteria Phase 1

- [x] Spec UC_RPT_08/09/11 leída completa
- [x] Implementación auditada (gateway, slices, components, mock)
- [x] 8 gaps en scope clasificados con evidencia PROVEN
- [x] GAP-09 (UC_RPT_11) extraído como nuevo WP recommendation
