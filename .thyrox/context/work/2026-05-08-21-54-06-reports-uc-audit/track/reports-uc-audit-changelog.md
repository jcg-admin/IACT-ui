```yml
created_at: 2026-05-08 22:25:00
project: THYROX
work_package: 2026-05-08-21-54-06-reports-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — WP reports-uc-audit

## Added

- **reportsGateway.js: `getScheduledDetail(id)`** (Block I, GAP-01)
  - `GET /api/reports/scheduled/${id}/` — cierra spec §3.2 detail endpoint
- **reports.js: `fetchScheduledDetail` thunk + `scheduledDetail` state** (Block I, GAP-01)
  - `initialState.scheduledDetail: null`; extraReducers pending/fulfilled/rejected
- **mockInterceptor.js: `_handleScheduleDetail(url)`** (Block I, GAP-01)
  - GET `/scheduled/{id}/` → busca en `_scheduledReportsData()` por id; 404 si no existe
- **mockInterceptor.js: `_scheduledReportsData()` fixture** (Block II, GAP-02)
  - Fixture extraído como método; incluye campo `status: 'active'|'inactive'` para filtrado
- **mockInterceptor.js: filter support en `_handleScheduledReports`** (Block II, GAP-02)
  - Acepta `url` como primer parámetro; filtra por `?status=` y `?frequency=` via URL params
- **mockInterceptor.js: run `status: 'failed'` en `_handleScheduleHistory`** (Block III, GAP-03)
  - Tercer run con `status: 'failed'`, `error_code: 'TIMEOUT'`, `rows_processed: 0` (FA-04)
- **savedFilters.js: `updateFilter` thunk** (Block V, GAP-05)
  - `PATCH /api/me/filters/${id}/` con `{ name, filters }`; actualiza ítem en array por id
- **savedFilters.js: `setDefaultFilter` thunk** (Block VI, GAP-06)
  - `PATCH /api/me/filters/${id}/` con `{ is_default: true }`; reducer sets is_default exclusivo
- **SavedFiltersPanel.jsx: `is_default` UI** (Block VI, GAP-06)
  - Botón "☆" por filtro para despachar `setDefaultFilter`; estilo dorado cuando `is_default: true`
  - Star prefix "★ " en nombre del filtro default
  - `useEffect` auto-aplica el filtro default al montar (UC_RPT_09 FA-04)
- **mockInterceptor.js: `_handleSavedFilters(url, method, body)`** (Block VII, GAP-07/08)
  - Fixture `_savedFiltersStore` (2 items, 1 default) con `_savedFiltersNextId` auto-incremental
  - GET → lista completa
  - POST → verifica nombre duplicado → 400 NAME_DUPLICATE (FA-01); crea ítem con id auto
  - PATCH → actualiza o aplica is_default exclusivo
  - DELETE → elimina por id
- **mockInterceptor.js: routing `/api/me/filters/`** (Block VII, GAP-13)
  - URLs `/api/me/filters/` (con y sin id) → `_handleSavedFilters`

## Changed

- **reportsGateway.js: `getScheduledReports(params = {})`** (Block II, GAP-02)
  - Ahora acepta `params` y los pasa a `apiService.get` como `{ params }`
- **reports.js: `fetchScheduledReports`** (Block II, GAP-02)
  - Acepta `params = {}` y los pasa a `reportsService.getScheduledReports(params)`
- **savedFilters.js: URL `/api/reports/saved-filters/` → `/api/me/filters/`** (Block IV, GAP-04)
  - `fetchSavedFilters`, `saveFilter`, `deleteFilter` — todas las requests corregidas
- **mockInterceptor.js: routing `/api/reports/scheduled/`** (Block I)
  - Orden corregido: `/runs/` check antes de `/{id}/` para evitar falso match
  - GET `/{id}/` ahora llama `_handleScheduleDetail` antes de llegar al list handler
  - `_handleScheduledReports` recibe `url` como primer parámetro
- **reportsService.test.js** (Block II)
  - Test `getScheduledReports` actualizado para esperar `{ params: {} }` como segundo arg

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entradas candidatas:
- Fix: saved-filters URL now correctly targets `/api/me/filters/` per spec (UC_RPT_09)
- Add: `getScheduledDetail` and `fetchScheduledDetail` for schedule detail view (UC_RPT_08)
- Add: `is_default` auto-apply in SavedFiltersPanel (UC_RPT_09 FA-04)
- Add: `updateFilter` and `setDefaultFilter` thunks complete CRUD (UC_RPT_09)
