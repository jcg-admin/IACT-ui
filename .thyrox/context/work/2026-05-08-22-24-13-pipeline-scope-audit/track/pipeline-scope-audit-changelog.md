```yml
created_at: 2026-05-08 23:30:00
project: THYROX
work_package: 2026-05-08-22-24-13-pipeline-scope-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — pipeline-scope-audit

## Added

- `src/pages/logs/PipelineStatus.jsx` — `stale: '#f97316'` entry added to
  `ESTADO_COLOR` map; inline comment lists all 4 valid states
  `ok | degradado | critico | stale` (T-001, GAP-01).

- `src/services/logsGateway.js` — `getPipelineErrors(params = {})` method
  targeting `GET /api/v1/etl/errores/` with `params` forwarding (T-003, GAP-04).

- `src/redux/slices/logs.js` — `fetchPipelineErrors` thunk
  (`logs/fetchPipelineErrors`), `pipelineErrors: []` in initialState,
  pending/fulfilled/rejected extraReducers, `selectPipelineErrors` selector
  (T-004, GAP-05).

- `src/mocks/mockInterceptor.js` — `_handlePipelineErrors(url)`: fixture of
  3 failed runs with `error_message`, `error_type` (TIMEOUT x2,
  DATA_VALIDATION x1), `correlation_id`; supports `?error_type=` and
  `?trimestre=` filters; routing for `/api/v1/etl/errores/` (T-005, GAP-06).

- `src/mocks/mockInterceptor.js` — `_handleETLAvailability(url)`: fixture
  with fresco + vencido datasets; `?test_state=vencido` forces all-vencido
  scenario; routing for `/api/v1/datos/disponibilidad/` (T-009, GAP-09/10).

- `src/pages/logs/__tests__/ETLAvailabilityPage.test.jsx` — 7 tests covering
  new schema: badge rendering, FA-01 stale banner (positive + negative),
  minutos_desde_etl column, and dataset name rendering.

## Changed

- `src/mocks/mockInterceptor.js` — `_handlePipelineStatus(url)` extended to
  read `?test_estado=` query param; returns stale/degradado/critico/ok
  fixtures accordingly; routing updated to pass `url` (T-002, GAP-02).

- `src/services/logsGateway.js` — `getETLAvailability()` URL corrected from
  `/api/etl/availability/` to `/api/v1/datos/disponibilidad/`; accepts
  `trimestre` optional param (T-006, GAP-07).

- `src/redux/slices/logs.js` — `fetchETLAvailability` updated to accept
  `{ trimestre }` optional param and forward to
  `logsService.getETLAvailability(trimestre)` (T-007, GAP-08).

- `src/pages/logs/ETLAvailability.jsx` — full rewrite for correct spec
  schema: columns Dataset | Estado Frescura | Minutos desde ETL | Última
  actualización; `estado_frescura` badges (fresco → badge-success,
  degradado → badge-warning, vencido → badge-danger); FA-01 stale banner
  `role="alert"` when any dataset is vencido; handles both array and
  single-object API responses via `toRows()` (T-008, GAP-07/08/09/10).

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a main con bump de versión. Entradas candidatas:
- `Added`: Pipeline errors endpoint support (UC_PIP_02)
- `Fixed`: ETL availability URL and schema (UC_PIP_03)
- `Added`: Stale state support for pipeline status (UC_PIP_01)
