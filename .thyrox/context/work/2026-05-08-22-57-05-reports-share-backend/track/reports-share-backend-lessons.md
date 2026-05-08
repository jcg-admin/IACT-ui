```yml
created_at: 2026-05-08 23:07:28
project: THYROX
work_package: 2026-05-08-22-57-05-reports-share-backend
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — reports-share-backend

## L-01: Dual-mode props pattern for backward compat

When a modal is used by many callers (7 pages), adding an optional discriminator
prop (`viewId = null`) enables new behavior without touching any existing call
sites. Null = legacy, non-null = new mode. This is cleaner than a `mode` string
prop because it's typed by content (the actual ID vs. absence).

## L-02: `createStatus` separate from `loading` in slice

Using a dedicated `createStatus` field (`null/'pending'/'success'/'error'`) in
the slice instead of the shared `loading` boolean allows the modal form to show
its own feedback cycle independently from page-level list loading. The
`resetCreateStatus` action cleans up after the modal closes so the next open
starts fresh.

## L-03: EX-06/EX-07 validation belongs in the mock, not the UI

The self-share guard (EX-06) and invalid expiry guard (EX-07) are backend
validations. Implementing them in `_handleShares()` rather than in the form
component keeps the UI simple (it just shows whatever error comes back) and
tests the real API contract: the form submits and the backend rejects if
invalid.

## L-04: `_error()` extension pattern

Adding an optional `code` param to `_error(status, message, code)` follows
the existing method's open/closed principle — callers that don't pass `code`
get the same response as before, while new callers can return domain error
codes (SELF_SHARE, INVALID_EXPIRES) that the slice captures in
`action.payload.code`.

## L-05: Tab count in button label (UX pattern)

Showing `Enviadas (N)` and `Recibidas (N)` in the tab buttons gives the user
immediate context before switching tabs, avoiding a blank table surprise. The
count comes directly from the store selectors so it updates reactively when
shares are revoked or received.

## Score de calidad

| Criterio | Resultado |
|----------|-----------|
| Todos los T-NNN completados | 9/9 [x] |
| Tests verdes | 1948/1948 |
| Sin regresiones | ✓ |
| Backward compat preservada | ✓ (7 páginas sin tocar) |
| Commits por bloque | 4 commits + WP |
| Push realizado | ✓ |
