```yml
created_at: 2026-05-08 18:45:00
project: IACT-UI
work_package: 2026-05-08-18-08-31-pipeline-scope-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — pipeline-scope-audit

## Added

- `src/mocks/mockInterceptor.js` — `_handleRetryPipeline`: handler for
  `POST /api/etl/logs/{id}/retry/`. Returns 202 on success, 409 when
  `_pipelineRunning` is true, 422 when `motivo.length < 20`. Added
  `this._pipelineRunning = false` to constructor (T-001 / GAP-PIP-03)
- `src/pages/logs/ETLLogs.jsx` — inline retry modal with `<textarea>`
  for motivo (min 20, max 500 chars), character counter, Confirmar
  button disabled until minimum met (T-002 / GAP-PIP-02)
- `src/pages/logs/ETLLogs.jsx` — 409 Conflict inline error message
  displayed in modal without closing it (T-004 / GAP-PIP-04)

## Changed

- `src/redux/slices/logs.js` — `retryPipeline` thunk signature:
  `(logId)` → `({ logId, motivo })` (T-003 / GAP-PIP-01)
- `src/services/logsGateway.js` — `retryPipeline({ logId, motivo })`:
  now sends `{ motivo }` in POST body (T-003 / GAP-PIP-01)
- `src/pages/logs/__tests__/PipelineRetry.test.jsx` — updated mock
  signature; added 4 new tests: motivo textarea visible, Confirmar
  disabled when short, enabled when ≥ 20 chars, 409 error message

## Aceptado / no fixeado

- **Operator module (10 UCs)**: out-of-scope per IACT-docs v5.6.0
  (extension point for future release). No implementation created.
- **Supervision module (3 UCs)**: out-of-scope per IACT-docs v5.6.0.
  No implementation created.
- **motivo max length**: spec only defines min 20. No CNST defines a
  maximum for text fields. UI limit set to 500 chars as design decision.

## Status de promoción a CHANGELOG.md raíz

Pendiente hasta merge a `main`. Relevant entries: Added (retry mock
handler, motivo field, 409 handling), Changed (thunk signature, gateway
service, tests).
