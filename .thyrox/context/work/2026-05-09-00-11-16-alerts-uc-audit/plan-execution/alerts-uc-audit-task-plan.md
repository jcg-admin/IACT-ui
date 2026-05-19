```yml
created_at: 2026-05-09 00:11:16
project: THYROX
work_package: 2026-05-09-00-11-16-alerts-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — alerts-uc-audit

Orden aprobado: GAP-ALR-06 → GAP-ALR-01+05 → GAP-ALR-02+04 → GAP-ALR-03 → GAP-ALR-07

---

## Block I — GAP-ALR-06: Gateway migration (prerequisite)

- [x] [T-001] Migrar `src/services/alertsGateway.js` — reemplazar todos los bloques
  `localStorage.getItem('accessToken')` + `fetch()` raw por `apiService` de `apiClient.js`.
  327 líneas, ~15 métodos. Patrón: `apiService.get/post/put/patch/delete(path, body)`.
  Actualizar imports al inicio del archivo. No cambiar firma pública de métodos.

---

## Block II — GAP-ALR-01: AlertConfig schema correction

- [x] [T-002] Reescribir estado del formulario en `src/pages/alerts/AlertConfig.jsx`:
  eliminar `category`, `channels`, `frequency`; agregar `metric` (select: SL/abandon_rate/
  queue_depth/TMO/login_failures), `scope` (select: segment/queue/campaign),
  `severity` (select: info/warning/critical), `actions` (checkboxes: mailbox_notify_user/
  mailbox_notify_agr/create_incident_ticket), `cooldown_minutes` (number), `window` (number,
  rolling N minutes). Eliminar EMAIL/SMS de cualquier opción. Actualizar fixtures inline
  (líneas 48-112) con schema correcto.

- [x] [T-003] Actualizar fixture de alertas en `src/mocks/mockInterceptor.js:1441-1466`
  (`_handleGetAlerts`): agregar campos `metric`, `scope`, `rule_id`, `status` a cada
  alerta. Agregar handler para `POST/PUT /api/alerts/rules/` con schema correcto
  (metric/scope/severity/actions/cooldown_minutes/window).

- [x] [T-004] Agregar FA-02 y FA-03 a `src/pages/alerts/AlertConfig.jsx`:
  FA-02: botón "Pausar/Reanudar" en vista de regla existente que despacha thunk de
  toggle de `status {active→paused|paused→active}`;
  FA-03: botón "Probar condición" que despacha validateCondition y muestra resultado.

---

## Block II — GAP-ALR-05: Subscriptions schema correction

- [x] [T-005] Reescribir `src/pages/alerts/Subscriptions.jsx`: eliminar modelo
  `alert_id/channels/frequency`. Nuevo modelo: `subscription_type` (radio: rule_id |
  severity_filter | scope_filter). Cuando `type=rule_id`, mostrar select de regla
  disponible. Cuando `type=severity_filter`, mostrar select de severity. Cuando
  `type=scope_filter`, mostrar select de scope. Eliminar `getChannelLabel`, display de
  canales y frecuencia. Actualizar botón unsubscribe para usar `sub.id`.

- [x] [T-006] Actualizar fixtures de suscripciones en `src/mocks/mockInterceptor.js`:
  reemplazar estructura `alert_id/channels/frequency` en `_subscriptionsData` (o donde
  estén definidos) por `subscription_type/rule_id/severity_filter/scope_filter`.
  Verificar que el handler de `POST /api/alerts/subscriptions/` acepte el nuevo schema.

---

## Block III — GAP-ALR-02: Alerts.jsx behavioral

- [x] [T-007] Corregir `src/redux/slices/alerts.js`:
  `selectActiveAlerts` — cambiar filtro de `is_active === true` a `state === 'firing'`.
  `acknowledgeAlert.fulfilled` reducer — agregar actualización de campos `ack_by`,
  `ack_at`, `ack_note` en el alert correspondiente (desde `action.payload`).

- [x] [T-008] Corregir `src/pages/alerts/Alerts.jsx`:
  Cambiar `categoryFilter` por `severityFilter` (valores: '' / info / warning / critical).
  Actualizar select de filtro con opciones de severity. Reemplazar `getCategoryColor` por
  función basada en severity. Agregar `.sort()` por severity DESC (critical > warning > info)
  + fired_at DESC antes del render.

- [x] [T-009] Agregar auto-refresh 10s a `src/pages/alerts/Alerts.jsx`:
  `useEffect` con `setInterval(() => dispatch(fetchAlerts()), 10000)` + cleanup en return.
  Interval pausado cuando hay modal abierto (usar ref de flag).

---

## Block III — GAP-ALR-04: AlertHistory validation + fields

- [x] [T-010] Agregar validación de rango en `src/pages/alerts/AlertHistory.jsx` (EX-03):
  antes de despachar `fetchAlertHistory`, verificar que `dateTo - dateFrom <= 365 días`.
  Si supera, mostrar mensaje de error inline: "El rango máximo es de 1 año."
  No despachar el thunk si la validación falla.

- [x] [T-011] Agregar columnas `time_to_ack` y `time_to_resolve` en `AlertHistory.jsx`
  (CA-05/CA-06): agregar a `COLUMNS` del `ReportTable` con labels "Tiempo a reconocer"
  y "Tiempo a resolver". Formato: minutos o `—` si null.
  Actualizar fixture en mock `_handleAlertHistory` con campos `time_to_ack` y
  `time_to_resolve` (números o null).

---

## Block IV — GAP-ALR-03: Mock acknowledge guards

- [x] [T-012] Ampliar `_handleAcknowledgeAlert` en `src/mocks/mockInterceptor.js:1469`:
  (1) `state === 'resolved' → 409 ALREADY_RESOLVED` (FA-02);
  (2) alertId no en `_alertsData` → 404 not found (EX-03);
  (3) `body?.note?.length > 500 → 400 NOTE_TOO_LONG` (EX-06).
  Mantener el guard existente `ALREADY_ACKNOWLEDGED → 409` sin modificar.

- [x] [T-013] Agregar endpoint bulk-ack a `src/mocks/mockInterceptor.js` (FA-03):
  `POST /api/alerts/bulk-ack/` — acepta `{ alert_ids: string[] }`, itera cada id
  aplicando la misma lógica que `_handleAcknowledgeAlert`. Retorna
  `{ acknowledged: [], skipped: [] }`. Registrar la ruta en el dispatcher antes del
  bloque genérico de `/api/alerts/`.

---

## Block V — GAP-ALR-07: Annotation fixes

- [x] [T-014] Corregir comentarios UC en los 5 archivos:
  - `src/pages/alerts/Alerts.jsx:4`: `UC_ALR_01` → `UC_ALR_02`
  - `src/pages/alerts/AlertConfig.jsx:4`: `UC_ALR_02` → `UC_ALR_01`
  - `src/pages/alerts/AlertHistory.jsx:4`: `UC_ALR_03` → `UC_ALR_04`
  - `src/pages/alerts/Subscriptions.jsx:4`: `UC_ALR_04` → `UC_ALR_05`
  - `src/services/alertsGateway.js:11`: label `UC_ALR_01` → `UC_ALR_02` en getAlerts
  - `src/services/alertsGateway.js:155`: label `UC_ALR_04` → `UC_ALR_05` en subscriptions
  - `src/services/alertsGateway.js:31`: label `UC_ALR_02` → `UC_ALR_01` en createAlert

---

## Commits esperados

| Bloque | Commit subject |
|--------|---------------|
| I | Migrate alertsGateway to apiService |
| II-a | Rewrite AlertConfig form to spec schema (UC_ALR_01) |
| II-b | Rewrite Subscriptions to spec subscription_type model |
| III | Fix Alerts severity filter, sort, auto-refresh; slice ack fields |
| III-b | Add AlertHistory range validation and ack/resolve time columns |
| IV | Add mock acknowledge guards (resolved, 404, note>500, bulk-ack) |
| V | Fix UC comment annotations in alerts module |
