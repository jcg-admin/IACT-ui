```yml
created_at: 2026-05-08 19:35:00
project: IACT-UI
work_package: 2026-05-08-18-17-32-remaining-modules-gap-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — remaining-modules-gap-audit

**SP-02 pendiente aprobación** · **1 gap (GAP-ALR-01)** · **5 tareas atómicas** · **1 bloque (DAG lineal)**

**Decisión de diseño:** `note` opcional ≤500 chars (spec CA-02). No se define mínimo. Modal con textarea facultativa (puede enviarse vacío). Botón "Reconocer" visible solo si `alert.state === 'firing'`.

---

## DAG de dependencias

```
T-001 (mock handler) → T-002 (gateway method) → T-003 (slice thunk) → T-004 (Alerts.jsx UI) → T-005 (tests)
```

---

## Block I — GAP-ALR-01: uc-alr-03 Reconocer Alerta

- [ ] [T-001] **mockInterceptor.js** — Routing: añadir ANTES del bloque genérico `/api/alerts` la ruta `if (url.match(/\/api\/alerts\/([^/]+)\/ack\//) && method === 'POST')`. Añadir `this._acknowledgedAlerts = new Set()` al constructor. Añadir método `_handleAcknowledgeAlert(url, body)`: extrae `alertId` del URL, si ya en `_acknowledgedAlerts` retorna 409 `{ error: 'Ya reconocida', code: 'ALREADY_ACKNOWLEDGED' }`, sino agrega al Set y retorna 200 `{ id: alertId, state: 'acknowledged', acknowledged_by: 'demo', acknowledged_at: new Date().toISOString(), note: body?.note ?? null }`. Actualizar `_handleGetAlerts` para que las alertas devueltas incluyan `state: 'firing'` (o `state: 'acknowledged'` si el id está en `_acknowledgedAlerts`). *(GAP-ALR-01)*

- [ ] [T-002] **alertsGateway.js** — Añadir método `acknowledgeAlert(alertId, note = null)`: `return apiService.post('/api/alerts/${alertId}/ack/', { note })`. *(GAP-ALR-01)*

- [ ] [T-003] **alerts.js (slice)** — Añadir `acknowledgeAlert` thunk:
  ```
  export const acknowledgeAlert = createAsyncThunk(
    'alerts/acknowledgeAlert',
    async ({ alertId, note }, { rejectWithValue }) => {
      try {
        return await alertsService.acknowledgeAlert(alertId, note)
      } catch (error) {
        return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
      }
    }
  )
  ```
  Añadir `extraReducers` para `acknowledgeAlert.fulfilled`: actualizar la alerta en `state.alerts` donde `a.id === action.payload.id`, setear `state = 'acknowledged'`. *(GAP-ALR-01)*

- [ ] [T-004] **Alerts.jsx** — Agregar estado `ackModal: { isOpen: false, alertId: null, note: '' }` y `ackError`. Añadir función `openAckModal(alertId)`, `closeAckModal()`, `handleConfirmAck` (async, `.unwrap()`, catch 409: setear `ackError` con mensaje informativo, modal permanece abierto). Añadir botón "Reconocer" inline en cada fila SOLO cuando `alert.state === 'firing'`. Añadir modal inline con textarea para `note` (aria-label="Nota de reconocimiento", maxLength=500, opcional — no necesita validación mínima), contador de chars, `role="alert"` para error 409 "Esta alerta ya fue reconocida". Confirmar button siempre habilitado (note es opcional). *(GAP-ALR-01)*

- [ ] [T-005] **Alerts.jsx tests** — Crear `src/pages/alerts/__tests__/AlertAcknowledge.test.jsx`. Tests requeridos: (a) botón "Reconocer" visible para alerta `state: 'firing'`, (b) botón NO visible para alerta `state: 'acknowledged'`, (c) click abre modal con textarea de nota, (d) confirm sin nota dispatcha `acknowledgeAlert({ alertId, note: '' })`, (e) confirm con nota dispatcha con nota, (f) 409 muestra `role="alert"` con "ya fue reconocida" y modal permanece abierto. *(GAP-ALR-01)*

---

## Criterios de completación

- [ ] Todas las tareas T-001..T-005 en `[x]`
- [ ] `npm test -- --watchAll=false` pasa sin failures
- [ ] 0 regressions en alertsSlice.test.js y alertsGateway.test.js
- [ ] Nuevos tests cubren: firing→ack, already-acked 409, note opcional
