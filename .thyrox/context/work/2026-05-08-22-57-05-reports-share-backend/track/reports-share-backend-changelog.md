```yml
created_at: 2026-05-08 23:06:32
project: THYROX
work_package: 2026-05-08-22-57-05-reports-share-backend
phase: Phase 10 — IMPLEMENT
author: NestorMonroy
status: Borrador
```

# Changelog — reports-share-backend

## Added

- `src/services/sharesGateway.js` — `SharesService` class with 4 methods:
  `createShare`, `revokeShare`, `getSharesSent`, `getSharesReceived`. Targets
  `/api/me/shares/` endpoints (T-001).

- `src/redux/slices/shares.js` — dedicated shares slice with thunks
  (`createShare`, `revokeShare`, `fetchSharesSent`, `fetchSharesReceived`),
  `createStatus` state machine (`null/'pending'/'success'/'error'`),
  `resetCreateStatus` action, and 5 selectors. Registered in store.js (T-002).

- `src/mocks/mockInterceptor.js` — shares routing and `_handleShares()` handler
  supporting GET /sent/, GET /received/, POST (with EX-06 self-share + EX-07
  expires_at guards), DELETE /{id}/. Seeded with 2 sent + 2 received fixtures.
  `_error()` extended to accept optional `code` parameter (T-003).

- `src/pages/reports/SharedViews.jsx` — new page with Enviados/Recibidos tabs,
  revokeShare confirm flow, fetches both lists on mount (T-006).

- `src/pages/reports/__tests__/SharedViewsPage.test.jsx` — 7 tests covering
  page render, mount dispatches, empty state, sent/received tables, revoke
  with confirm/cancel (T-009).

## Changed

- `src/components/reports/ShareReportModal.jsx` — rewritten as dual-mode
  component. `viewId=null` preserves legacy URL-copy behavior for 7 existing
  report pages. `viewId` present → backend share form (T-004).

- `src/components/reports/SavedFiltersPanel.jsx` — added "↗" share button per
  filter row, local `shareModal` state, renders `ShareReportModal` in backend
  mode with `viewId = filter.id` (T-005).

- `src/router/AppRouter.jsx` — added `SharedViewsPage` lazy import, nav entry
  "Vistas compartidas" under Reports group, route `/reports/shares` with
  `VIEW_REPORTS` permission guard (T-007).

- `src/components/reports/__tests__/ShareReportModal.test.jsx` — kept 5
  legacy URL-copy tests, added 6 backend-mode tests covering form render,
  target_id visibility, AGR placeholder, createShare dispatch, success
  state (T-008).

## Status de promoción a CHANGELOG.md raíz

Pendiente — promover al merge a main bajo la próxima release que incluya UC_RPT_11.

Refs: GAP-01, GAP-02, GAP-03, GAP-04, GAP-05, GAP-06, T-001..T-009
