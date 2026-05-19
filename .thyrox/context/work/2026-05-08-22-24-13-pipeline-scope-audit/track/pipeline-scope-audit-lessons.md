```yml
created_at: 2026-05-08 23:30:00
project: THYROX
work_package: 2026-05-08-22-24-13-pipeline-scope-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — pipeline-scope-audit

## L-01: URL as domain boundary, not just routing detail

`/api/etl/availability/` (process up/down) vs `/api/v1/datos/disponibilidad/`
(data freshness in minutes) are fundamentally different domain concepts —
not the same resource at different paths. The old component rendered
`available: boolean` while the spec requires `estado_frescura: fresco |
degradado | vencido`. A URL audit that only checks the path suffix misses
this; auditors must read the schema expected by the UI against the schema
delivered by the spec endpoint.

**Action:** In PAT-UC-AUDIT-001, URL checks must include schema field
verification, not just URL string comparison.

## L-02: `toRows()` normalization for flexible API responses

When a spec says an endpoint "returns availability data" without specifying
array vs. object, components should normalize with `toRows(payload)`:
`Array.isArray(payload) ? payload : [payload]`. This costs nothing and
prevents runtime errors if the backend returns a single object.

## L-03: Test-param pattern for mock state variation

The `?test_estado=stale|degradado|critico` pattern (extended from
`_handlePipelineStatus`) allows testing all alert states without separate
mock files or manual store manipulation. Applied consistently to
`_handleETLAvailability` via `?test_state=vencido`. Both follow the same
convention: absent param → nominal "happy path" fixture; param present →
edge case fixture. Recommend adopting this pattern in all future mock
handlers for components with critical alert states.

## L-04: Schema mismatch is a full-component rewrite, not a URL fix

When the schema changes (field names, types, semantics), the component
must be rewritten — incrementally patching old field references will leave
dead code. `ETLAvailability.jsx` had 4 wrong column headers, wrong badge
logic, wrong key (`item.id` → `item.dataset`), and wrong data fields.
The correct strategy is to replace the component body entirely, keeping
only the dispatch/selector wiring and page-container shell.

## L-05: Existing tests block schema migration if not updated together

The test file `ETLAvailabilityPage.test.jsx` used the old schema
(`available: boolean`, process names, "No disponible" text). Updating
the component without updating the test would block CI. Both changes
belong in the same commit — the test is documentation of the expected
behavior and must stay in sync with the component.
