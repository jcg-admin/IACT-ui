```yml
created_at: 2026-05-09 00:11:16
project: THYROX
work_package: 2026-05-09-00-11-16-alerts-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# Phase 1 DISCOVER — alerts-uc-audit

## Objetivo

Auditoría profunda de flujos alternativos y de error en los 5 UCs del módulo Alertas
(UC_ALR_01..05). El WP `remaining-modules-gap-audit` identificó GAP-ALR-01 (acknowledgeAlert)
como único gap. Este WP valida si los UCs cubren nominal + alternativos + excepciones
usando PAT-UC-AUDIT-001.

## Fuentes auditadas

| Fuente | Path | Estado |
|--------|------|--------|
| UC specs | `/tmp/references/IACT-docs/source/requisitos/casos-uso/alerts/uc-alr-0{1..5}/` | PROVEN — leídos completos |
| Página principal | `src/pages/alerts/Alerts.jsx` | PROVEN |
| Configuración de reglas | `src/pages/alerts/AlertConfig.jsx` | PROVEN |
| Historial | `src/pages/alerts/AlertHistory.jsx` | PROVEN |
| Suscripciones | `src/pages/alerts/Subscriptions.jsx` | PROVEN |
| Redux slice | `src/redux/slices/alerts.js` | PROVEN |
| Gateway | `src/services/alertsGateway.js` | PROVEN |
| Mock | `src/mocks/mockInterceptor.js` | PROVEN |

## Gap registry

### GAP-ALR-06 (INFRA — PREREQUISITO) — alertsGateway usa fetch raw

**Evidencia (PROVEN):**
- `src/services/alertsGateway.js:14-15`: `localStorage.getItem('accessToken')` + `fetch()`
- Todos los demás gateways del proyecto usan `apiService` de `apiClient.js`
- 15+ métodos en alertsGateway.js repiten el mismo patrón manualmente

**Impacto:** Inconsistencia en manejo de errores con el resto del proyecto. El gateway no
respeta el error handling middleware ni el patrón de retries/tokens del `apiService`.

**Decisión de usuario:** Resolver primero — es prerequisito de todos los demás gaps.

---

### GAP-ALR-01 (UC_ALR_01 — CRÍTICO) — AlertConfig schema incorrecto

**UC spec:** `metric ∈ {SL, abandon_rate, queue_depth, TMO, login_failures}`, `scope
{segment|queue|campaign}`, `severity {info|warning|critical}`, `actions
[mailbox_notify_user, mailbox_notify_agr, create_incident_ticket]`, `cooldown_minutes`,
`window (rolling N minutes)`, `status {active|paused}`.

**CNST-001:** "NO email externo — actions via mailbox interno only."

**Evidencia (PROVEN):**
- `src/pages/alerts/AlertConfig.jsx:13`: `const CHANNELS = ['EMAIL', 'SMS', 'IN_APP', 'PUSH']`
  → viola CNST-001
- `AlertConfig.jsx:19`: `category: 'SISTEMA'` en estado inicial → campo inexistente en spec
- `AlertConfig.jsx:23-24`: `channels: ['IN_APP'], frequency: 'REALTIME'` → campos spec-incorrectos
- `AlertConfig.jsx:48-112`: fixtures inline con schema `category/channels/frequency` → todo incorrecto
- `AlertConfig.jsx:200`: `value={config.category}` → campo no existe en spec
- `AlertConfig.jsx:239-244`: checkboxes de canales EMAIL/SMS — viola CNST-001
- `AlertConfig.jsx:261`: `value={config.frequency}` → campo no existe en spec

**Flujos faltantes:**
- FA-02: pause/resume de regla activa — no implementado
- FA-03: dry-run test de condición — no implementado
- FA-04: cooldown display en vista — no implementado (campo no existe en form)
- FA-05: validación de mailbox target — no implementado

---

### GAP-ALR-05 (UC_ALR_05 — CRÍTICO) — Subscriptions schema incorrecto

**UC spec:** `subscription_type ∈ {rule_id, severity_filter, scope_filter}`, campos:
`rule_id` (cuando type=rule_id), `severity_filter` (cuando type=severity_filter),
`scope_filter` (cuando type=scope_filter).

**Evidencia (PROVEN):**
- `src/pages/alerts/Subscriptions.jsx:29-34`: fixture `{ alert_id: 1, channels: ['EMAIL',
  'IN_APP'], frequency: 'REALTIME' }` → schema completamente incorrecto
- `Subscriptions.jsx:43-44`: `channels: ['EMAIL', 'SMS']` → viola CNST-001
- `Subscriptions.jsx:75-79`: `getChannelLabel` con EMAIL/SMS — viola CNST-001
- `Subscriptions.jsx:150`: `<strong>Canales:</strong> {getChannelLabel(sub.channels)}` →
  campo no existe en spec
- `Subscriptions.jsx:153`: `<strong>Frecuencia:</strong> {sub.frequency}` → campo no existe en spec

---

### GAP-ALR-02 (UC_ALR_02 — MEDIO) — Alerts.jsx filtro y comportamiento

**UC spec:** filtrar por `severity ∈ {info|warning|critical}`, ordenar por severity DESC
+ fired_at DESC, auto-refresh cada 10 segundos (FA-03).

**Evidencia (PROVEN):**
- `src/pages/alerts/Alerts.jsx:21`: `const [categoryFilter, setCategoryFilter] = useState('')`
  → filtra por `category` que no existe en spec
- `Alerts.jsx:53-54`: `filtered.filter(a => a.category === categoryFilter)` → campo inexistente
- `Alerts.jsx:67-74`: `getCategoryColor(category)` → función basada en campo no-spec
- Sin `setInterval` ni `useEffect` con polling → FA-03 no implementado
- Sin `.sort()` por severity DESC → ordenamiento no garantizado

**Redux slice:**
- `src/redux/slices/alerts.js` — `selectActiveAlerts` usa `is_active` boolean
  (no `state === 'firing'`) → schema mismatch
- `acknowledgeAlert.fulfilled` reducer no persiste `ack_by`, `ack_at`, `ack_note`

---

### GAP-ALR-04 (UC_ALR_04 — MEDIO) — AlertHistory validaciones y campos

**UC spec:** rango máximo 1 año (FA-01/EX-03), campos time-to-ack (CA-05) y
time-to-resolve (CA-06) en historial.

**Evidencia (PROVEN):**
- `src/pages/alerts/AlertHistory.jsx`: sin validación de rango > 365 días → EX-03 no cubierta
- `AlertHistory.jsx`: sin columnas `time_to_ack` / `time_to_resolve` → CA-05/CA-06 no cubiertas
- `AlertHistory.jsx:4`: comentario `UC_ALR_03` → debería ser `UC_ALR_04`

---

### GAP-ALR-03 (UC_ALR_03 — BAJO) — Mock gaps acknowledge

**UC spec FA-02:** alerta en estado `resolved` → 409 (no se puede re-reconocer).
**UC spec EX-03:** alertId no encontrado → 404.
**UC spec EX-06:** note > 500 chars → 400.
**UC spec FA-03:** bulk-ack hasta 50 alertas simultáneas.

**Evidencia (PROVEN):**
- `src/mocks/mockInterceptor.js:1469-1487`: `_handleAcknowledgeAlert` — solo guarda
  `ALREADY_ACKNOWLEDGED` (409 para re-ack) ✓, pero:
  - Sin guard `state === 'resolved' → 409` (FA-02) ✗
  - Sin `alertId not in fixtures → 404` (EX-03) ✗
  - Sin `note.length > 500 → 400` (EX-06) ✗
- Sin endpoint bulk-ack en mock (FA-03) ✗

---

### GAP-ALR-07 (ANNOTATIONS — BAJO) — Comentarios UC incorrectos

**Evidencia (PROVEN):**
- `src/pages/alerts/Alerts.jsx:4`: `UC_ALR_01` → debería ser `UC_ALR_02`
- `src/pages/alerts/AlertConfig.jsx:4`: `UC_ALR_02` → debería ser `UC_ALR_01`
- `src/pages/alerts/AlertHistory.jsx:4`: `UC_ALR_03` → debería ser `UC_ALR_04`
- `src/pages/alerts/Subscriptions.jsx:4`: `UC_ALR_04` → debería ser `UC_ALR_05`
- `src/services/alertsGateway.js:11`: `UC_ALR_01: Obtener todas las alertas` →
  correcto es UC_ALR_02
- `src/services/alertsGateway.js:155`: `UC_ALR_04: Suscribirse a una alerta` →
  correcto es UC_ALR_05

## Resumen de impacto

| GAP | Severidad | Impacto | Resolución |
|-----|-----------|---------|------------|
| GAP-ALR-06 | INFRA | fetch raw en todo gateway | Migrar a apiService |
| GAP-ALR-01 | CRÍTICO | Schema incorrecto, CNST-001 violado | Rewrite AlertConfig form |
| GAP-ALR-05 | CRÍTICO | Schema incorrecto, CNST-001 violado | Rewrite Subscriptions model |
| GAP-ALR-02 | MEDIO | Filtro incorrecto, sin auto-refresh, sin sort | Fix page + slice |
| GAP-ALR-04 | MEDIO | Sin range validation, sin ack/resolve times | Fix page |
| GAP-ALR-03 | BAJO | Mock incompleto (3 guards + bulk-ack) | Fix mock |
| GAP-ALR-07 | BAJO | Comentarios UC incorrectos | Fix annotations |

## Orden de implementación (aprobado por usuario)

1. GAP-ALR-06 — prerequisito: gateway migration
2. GAP-ALR-01 + GAP-ALR-05 — schemas críticos + mock fixtures compartidos
3. GAP-ALR-02 + GAP-ALR-04 — behavioral (dependen de schema correcto)
4. GAP-ALR-03 — mock-only
5. GAP-ALR-07 — annotations (sin impacto funcional)
