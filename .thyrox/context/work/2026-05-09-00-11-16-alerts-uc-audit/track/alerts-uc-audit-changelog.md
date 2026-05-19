```yml
created_at: 2026-05-09 00:11:16
project: THYROX
work_package: 2026-05-09-00-11-16-alerts-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — alerts-uc-audit

## Added

- `alertsGateway.bulkAcknowledgeAlerts(alertIds)` — POST /api/alerts/bulk-ack/ (UC_ALR_03 FA-03)
- `alertsGateway.toggleAlertStatus(alertId, status)` — PATCH /api/alerts/rules/{id}/ (UC_ALR_01 FA-02)
- `mockInterceptor._handleAlertRule()` — POST/PUT/PATCH /api/alerts/rules/
- `mockInterceptor._handleValidateCondition()` — POST /api/alerts/validate-condition/
- `mockInterceptor._handleAlertHistory()` — GET /api/alerts/history/ with time_to_ack + time_to_resolve fixtures
- `mockInterceptor._handleAlertSubscription()` — POST/DELETE /api/alerts/subscriptions/
- `mockInterceptor._handleGetMySubscriptions()` — GET /api/alerts/subscriptions/me/ with spec fixtures
- `mockInterceptor._handleBulkAcknowledgeAlerts()` — POST /api/alerts/bulk-ack/
- `mockInterceptor._resolvedAlerts`, `_knownAlertIds` — for EX-03/FA-02 guards

## Changed

- `alertsGateway.js` — full rewrite from raw `fetch()` + `localStorage.getItem('accessToken')`
  to `apiService` (GAP-ALR-06). 15 methods migrated. UC comments corrected.
- `AlertConfig.jsx` — form schema rewritten: `category/channels/frequency` → `metric/scope/
  severity/actions/cooldown_minutes/window`. CNST-001 fix (EMAIL/SMS removed). FA-02 (status
  radio), FA-03 (dry-run button) added (GAP-ALR-01).
- `Subscriptions.jsx` — model rewritten: `alert_id/channels/frequency` → `subscription_type
  {rule_id|severity_filter|scope_filter}`. CNST-001 fix. (GAP-ALR-05)
- `Alerts.jsx` — filter changed from `category` to `severity`. Sort by severity DESC +
  fired_at DESC. Auto-refresh 10s interval (FA-03). (GAP-ALR-02)
- `alerts.js` slice — `selectActiveAlerts` now filters `state === 'firing'` (was `is_active`).
  `acknowledgeAlert.fulfilled` stores `ack_by`, `ack_at`, `ack_note`. (GAP-ALR-02)
- `AlertHistory.jsx` — range > 1 year validation (EX-03). Columns `time_to_ack` +
  `time_to_resolve` added (CA-05/CA-06). Filter changed to severity. (GAP-ALR-04)
- `mockInterceptor._handleGetAlerts()` — fixtures updated with spec fields (metric, scope,
  rule_id, fired_at, state). (GAP-ALR-01/02)
- `mockInterceptor._handleAcknowledgeAlert()` — guards: EX-03 (404), EX-06 (400), FA-02 (409
  resolved). (GAP-ALR-03)
- `alertsGateway.subscribeToAlert()` — signature changed from `(alertId, channels, frequency)`
  to `(subscriptionData)` (GAP-ALR-05)
- UC comment labels corrected in all 5 alert files (GAP-ALR-07)

## Status de promoción a CHANGELOG.md raíz

Pendiente hasta merge a main con bump de versión.
