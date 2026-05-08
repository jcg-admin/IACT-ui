```yml
created_at: 2026-05-08 22:10:00
project: THYROX
work_package: 2026-05-08-21-54-06-reports-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — reports-uc-audit

Fuente: `discover/reports-uc-audit-analysis.md`
Gaps: GAP-04 (MEDIO) · GAP-01/02/03/05/06/07/08 (BAJO)

## DAG de dependencias

```
T-001 → T-002 → T-003        (Block I — GAP-01: getScheduledDetail)

T-004 → T-005 → T-006        (Block II — GAP-02: filtros status/frequency)

T-007                         (Block III — GAP-03: run fallido en mock)

T-008                         (Block IV — GAP-04: URL mismatch MEDIO)

T-009                         (Block V — GAP-05: updateFilter thunk)

T-010 → T-011                 (Block VI — GAP-06: is_default field)

T-012 → T-013                 (Block VII — GAP-07/08: mock saved-filters handler)
```

---

## Block I — GAP-01: getScheduledDetail(id) (BAJO)

> Agregar endpoint detail al gateway + thunk + mock handler GET /scheduled/{id}/.
> Commit al completar T-003.

- [x] [T-001] `src/services/reportsGateway.js` — agregar método
  `getScheduledDetail(id)` que hace `GET /api/reports/scheduled/${id}/` y
  retorna la respuesta; colocar después de `getScheduledReports()` (~línea 115)

- [x] [T-002] `src/redux/slices/reports.js` — agregar thunk
  `fetchScheduledDetail` usando `createAsyncThunk` que llama
  `reportsService.getScheduledDetail(id)` y guarda en
  `state.scheduledDetail`; agregar campo `scheduledDetail: null` a
  `initialState`; agregar `extraReducers` para pending/fulfilled/rejected

- [x] [T-003] `src/mocks/mockInterceptor.js` — en `_handleScheduleSubAction`:
  antes del check `method !== 'GET'`, agregar branch para
  `method === 'GET'` sin subAction (URL termina en `/{id}/` sin sufijo):
  buscar el schedule en `_scheduledReportsData()` por id; si existe →
  retornar `{ status: 200, data: schedule }`; si no → `{ status: 404 }`

---

## Block II — GAP-02: Filtros status/frequency en list (BAJO)

> Gateway acepta params, mock filtra por status y frequency.
> Commit al completar T-006.

- [ ] [T-004] `src/services/reportsGateway.js` — modificar `getScheduledReports()`
  para aceptar parámetro `params = {}` (objeto con `status`, `frequency`, etc.)
  y pasarlo a la request: `apiService.get('/api/reports/scheduled/', { params })`

- [ ] [T-005] `src/redux/slices/reports.js` — modificar thunk
  `fetchScheduledReports` para aceptar `params` opcionalmente y
  pasarlo a `reportsService.getScheduledReports(params)`

- [ ] [T-006] `src/mocks/mockInterceptor.js` — en `_handleScheduledReports`
  método GET: extraer `params` de la URL (parseando query string) o del
  request body; filtrar `_scheduledReportsData()` por `status` si presente;
  filtrar por `frequency` si presente; retornar solo los que pasen el filtro

---

## Block III — GAP-03: Run fallido en mock (BAJO)

> Agregar 1 run con status 'failed' + error_code al fixture de runs.
> Commit al completar T-007.

- [ ] [T-007] `src/mocks/mockInterceptor.js` — en `_handleScheduleHistory`:
  agregar al array de runs devueltos un tercer run con
  `{ id: 3, schedule_id: <id>, status: 'failed', error_code: 'TIMEOUT',
    started_at: '2026-05-07T08:00:00Z', ended_at: '2026-05-07T08:05:00Z',
    rows_processed: 0 }`; así el fixture cubre success + failed (FA-04)

---

## Block IV — GAP-04: URL mismatch saved-filters (MEDIO)

> Cambiar `/api/reports/saved-filters/` → `/api/me/filters/` en todos los
> endpoints del savedFilters slice.
> Commit al completar T-008.

- [ ] [T-008] `src/redux/slices/savedFilters.js` — reemplazar todas las
  ocurrencias de `'/api/reports/saved-filters/'` por `'/api/me/filters/'`
  en los thunks `fetchSavedFilters`, `saveFilter`, `deleteFilter`
  (y en `updateFilter` cuando se cree en T-009)

---

## Block V — GAP-05: updateFilter thunk (BAJO)

> Agregar PATCH /api/me/filters/{id}/ para completar CRUD.
> Commit al completar T-009.

- [ ] [T-009] `src/redux/slices/savedFilters.js` — agregar thunk
  `updateFilter` usando `createAsyncThunk` que hace
  `PATCH /api/me/filters/${id}/` con `{ name, filters }`;
  agregar `extraReducers` para fulfilled (actualizar ítem en array `filters`
  por id) y rejected; exportar el thunk

---

## Block VI — GAP-06: is_default field (BAJO)

> Agregar campo is_default al slice y UI toggle en SavedFiltersPanel.
> Commit al completar T-011.

- [ ] [T-010] `src/redux/slices/savedFilters.js` — en el thunk `saveFilter`:
  incluir `is_default` en el body si viene en el payload; agregar thunk
  `setDefaultFilter` que hace `PATCH /api/me/filters/${id}/` con
  `{ is_default: true }` para marcar como default; en initialState agregar
  soporte implícito (el campo llega del backend en cada ítem)

- [ ] [T-011] `src/components/reports/SavedFiltersPanel.jsx` — agregar botón
  "⭐" o "Default" por cada filtro en la lista; al hacer click, despachar
  `setDefaultFilter(sf.id)`; marcar con estilo visual el filtro que tiene
  `sf.is_default === true`; al montar el panel, si hay un filtro default,
  llamar `onApply(defaultFilter.filters)` automáticamente (FA-04: "Frontend
  lo aplica automáticamente al abrir el reporte")

---

## Block VII — GAP-07 + GAP-08: Mock saved-filters handler (BAJO)

> Crear handler completo para /api/me/filters/ con CRUD + 400 NAME_DUPLICATE.
> Commit al completar T-013.

- [ ] [T-012] `src/mocks/mockInterceptor.js` — agregar método
  `_handleSavedFilters(url, method, body)`:
  - GET: retornar `{ status: 200, data: { results: this._savedFiltersData(), count: N } }`
  - POST: verificar nombre duplicado → `{ status: 400, data: { error: 'Nombre duplicado', code: 'NAME_DUPLICATE' } }`;
    si no duplicado → crear ítem, agregar a `_savedFiltersStore`, retornar 201
  - PATCH: buscar por id en URL, actualizar ítem, retornar 200
  - DELETE: buscar por id en URL, eliminar ítem, retornar 204
  - agregar `_savedFiltersData()` con fixture de 2 filtros (nombres únicos, is_default: true/false)
  - agregar `_savedFiltersStore` array inicializado en constructor

- [ ] [T-013] `src/mocks/mockInterceptor.js` — en el método `_routeRequest`
  (o equivalente de routing): agregar catch para URLs que coincidan con
  `/api/me/filters/` (con o sin id al final) → despachar a
  `this._handleSavedFilters(url, method, body)`

---

## Checklist de cierre por bloque

| Bloque | Tareas | Commit |
|--------|--------|--------|
| I — GAP-01 | T-001..T-003 | `Add getScheduledDetail gateway, thunk and mock (UC_RPT_08)` |
| II — GAP-02 | T-004..T-006 | `Add status/frequency filter support to scheduled reports` |
| III — GAP-03 | T-007 | `Add failed run fixture to schedule history mock (UC_RPT_08 FA-04)` |
| IV — GAP-04 | T-008 | `Fix saved-filters URL to /api/me/filters/ per spec (UC_RPT_09)` |
| V — GAP-05 | T-009 | `Add updateFilter PATCH thunk (UC_RPT_09 CRUD)` |
| VI — GAP-06 | T-010..T-011 | `Add is_default field and auto-apply in SavedFiltersPanel (UC_RPT_09 FA-04)` |
| VII — GAP-07/08 | T-012..T-013 | `Add saved-filters mock handler with NAME_DUPLICATE 400 (UC_RPT_09)` |
