```yml
created_at: 2026-05-08 20:00:00
project: IACT-UI
work_package: 2026-05-08-18-17-32-remaining-modules-gap-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — remaining-modules-gap-audit

## Added

- `src/pages/alerts/__tests__/AlertAcknowledge.test.jsx` — 7 tests for
  uc-alr-03: Reconocer button visible for firing alerts, hidden for
  acknowledged, modal with optional note textarea, dispatch with/without
  note, 409 "ya fue reconocida" error in modal (GAP-ALR-01)

## Changed

- `src/mocks/mockInterceptor.js` — Constructor: `_acknowledgedAlerts = new Set()`.
  Routing: `POST /api/alerts/{id}/ack/` handled BEFORE generic `/api/alerts`
  block. `_handleGetAlerts`: alerts now include `state: 'firing'` (or
  `'acknowledged'` when in Set). New `_handleAcknowledgeAlert`: 200 on
  success, 409 with `ALREADY_ACKNOWLEDGED` code when already acked.
  (T-001 / GAP-ALR-01)

- `src/services/alertsGateway.js` — Added `acknowledgeAlert(alertId, note)`
  method: `POST /api/alerts/{alertId}/ack/` with `{ note }` body. Throws
  with `error.response.status` on non-ok responses. (T-002 / GAP-ALR-01)

- `src/redux/slices/alerts.js` — Added `acknowledgeAlert` thunk
  (`createAsyncThunk`) with `rejectWithValue({ message, statusCode })`.
  Added `extraReducers` cases: pending clears error, fulfilled updates
  `alert.state = 'acknowledged'` in store, rejected sets error.
  (T-003 / GAP-ALR-01)

- `src/pages/alerts/Alerts.jsx` — Added acknowledge modal (uc-alr-03):
  `ackModal` state, `openAckModal`/`closeAckModal`/`handleConfirmAck`
  functions, Reconocer button visible only for `state === 'firing'`,
  modal with optional `<textarea>` (NOTE_MAX=500, char counter),
  `role="alert"` error div for 409 "Esta alerta ya fue reconocida".
  Also updated `getStatusBadge` to handle `state` field.
  (T-004 / GAP-ALR-01)

## Aceptado / no implementado

- **Módulos operator/supervision**: confirmados out-of-scope (IACT-docs
  `warning:: Modulo reservado`) — ya documentado en pipeline-scope-audit.
- **uc-usr-05..07**: `estado: Reservado` en spec — no requieren UI en v5.6.0.
- **uc-perm-07/08**: backend-only — CheckPermissionEndpoint admin-only y
  sidebar IS el menú dinámico.
- **Todos los demás módulos (8)**: 0 gaps adicionales encontrados.

## Status de promoción a CHANGELOG.md raíz

Pendiente hasta merge a `main`. Entradas relevantes: Changed (mockInterceptor
ack handler, alertsGateway method, alerts slice thunk, Alerts.jsx modal),
Added (AlertAcknowledge.test.jsx).
