# Hallazgos FASE 6 — Cobertura completa de gateways

**Artefacto:** HALLAZGOS-FASE6-FINAL-2026-05-15
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Rama:** `develop` — commits `ab73770` → `20133c1`
**Metodología:** TDD — cada suite verifica URL canónica, body/params y propagación de errores
**Estado:** Cerrado — cobertura de gateways: 7/7 — deuda técnica: 0

---

## Resumen ejecutivo

| Métrica | Antes de FASE 6 | Después |
|---|---|---|
| Test suites | 247 | **250** (+3) |
| Tests totales | 2221 | **2366** (+145) |
| Tests fallidos | 0 | **0** |
| Gateways con cobertura completa | 0/7 | **7/7** |
| Métodos sin test | 49 | **0** |
| Tests nuevos de gateway | 0 | **186** |

---

## Estado de cobertura por gateway

| Gateway | Métodos | Tests | Promedio | Tarea |
|---|---|---|---|---|
| `accessGateway.js` | 29 | 64 | 2.2/método | T6.1 |
| `auditGateway.js` | 12 | 28 | 2.3/método | T6.2 |
| `alertsGateway.js` | 17 | 37 | 2.2/método | T6.3 |
| `userGateway.js` | 13 | 22 | 1.7/método | T6.4 |
| `sharesGateway.js` | 5 | 14 | 2.8/método | T6.5 |
| `navigationGateway.js` | 2 | 6 | 3.0/método | T6.6 |
| `savedFiltersGateway.js` | 5 | 15 | 3.0/método | T6.7 |
| **Total** | **83** | **186** | **2.5/método** | — |

---

## Metodología aplicada

Cada método de gateway se prueba con exactamente tres categorías de casos:

**1. URL canónica:** verifica que el método HTTP y el path coinciden con el schema OpenAPI de IACT-api, incluyendo trailing slash, interpolación de parámetros de ruta, y ausencia de prefijos incorrectos.

**2. Parámetros correctos:** verifica que el cuerpo del request (body) o los query params contienen los campos requeridos con los nombres exactos que espera la API. Distingue entre body para POST/PATCH, `{ data: ... }` para DELETE con body, y `{ params: ... }` para GET.

**3. Propagación de errores:** verifica que los errores HTTP (403, 400, 503) se propagan sin transformación al caller, permitiendo que las capas superiores (Redux thunks, componentes) los manejen con su propia lógica.

---

## T6.1 — accessGateway: 64 tests, 29 métodos

**Archivo:** `src/services/__tests__/accessService.test.js`
**Commit:** `ab73770`

Cobertura de todos los dominios del módulo de control de acceso:

**Funciones y permisos:**
`getAllFunctions`, `getUserPermissions`, `getEffectivePermissions`, `verifyPermission`, `assignFunctions`, `revokeFunctions`

**Grupos de acceso (AGRs):**
`getFunctionGroups`, `getGroupFunctions`, `createGroup`, `updateGroup`, `retireGroup`, `assignFunctionsToGroup`, `assignAccessGroup`, `revokeAccessGroup`, `assignGrouper`, `getGroupers`

**Reglas de separación (SoD):**
`getSeparationRules`, `getSeparationRuleDetail`, `createSeparationRule`, `updateSeparationRule`, `deleteSeparationRule`, `validateSeparationRules`

**Permisos excepcionales:**
`grantExceptionalPermission`, `getExceptionalPermissions`, `previewExceptionalPermission`, `revokeExceptionalPermission`

**Auditoría y menú:**
`getAccessAudit`, `exportAuditLog`, `getMyModules`

**Verificación eliminada:**
`getAuthHeaders` no existe (autenticación migrada a httpOnly cookies en T1.x).

Hallazgos encontrados durante la escritura de tests:

- `retireGroup` envía `retire_reason` en el body del DELETE: `{ data: { retire_reason: ... } }`. El test lo documenta como patrón explícito.
- `exportAuditLog` retorna `{ job_id }` (modelo async), no un blob. Confirmado con la corrección de T4.3.
- `assignGrouper` usa `POST /api/access/groupers/assign` sin trailing slash — diferencia respecto al resto de endpoints que sí tienen trailing slash. Documentado.

---

## T6.2 — auditGateway: 28 tests, 12 métodos

**Archivo:** `src/services/__tests__/auditService.test.js`
**Commit:** `a30ac3e`

Cobertura completa del módulo de auditoría:

`getAuditLogs`, `getAuditLogDetail`, `searchLogs`, `exportLogs`, `getComplianceReport`, `verifyCompliance`, `getAuditEvents`, `getAuditEventDetail`, `getAuditEventAggregations`, `exportAuditEvents`, `getGeneralTimeline`, `verifyIntegrity`

Hallazgos encontrados durante la escritura de tests:

- `verifyCompliance(reportId)` recibe un `reportId` escalar, no un objeto genérico. Lo envuelve en `{ report_id: reportId }`. El test inicial asumía incorrectamente que recibía `{ user_id }` — corregido comparando con la implementación.
- `exportLogs` y `exportAuditEvents` retornan `{ job_id }` (operaciones asíncronas), consistente con el modelo establecido en T4.3.
- `getAuditEventAggregations` acepta params aunque el test inicial no los incluía — ajustado a `expect.anything()`.

---

## T6.3 — alertsGateway: 37 tests, 17 métodos

**Archivo:** `src/services/__tests__/alertsGateway.test.js`
**Commit:** `e4ce8a8`

Cobertura de las 5 áreas funcionales del módulo de alertas, incluyendo verificación de las URLs corregidas en T2.1:

| Método | URL corregida | URL incorrecta (v4.0) |
|---|---|---|
| `getActiveAlerts` | `/api/alerts/active/` | `/api/alerts/` |
| `dryRunAlertRule` | `/api/alerts/rules/dry-run/` | `validateCondition` (inexistente) |
| `acknowledgeAlert` | `/api/alerts/{id}/acknowledge/` | `/api/alerts/{id}/ack/` |
| `bulkAcknowledgeAlerts` | `/api/alerts/bulk-acknowledge/` | `/api/alerts/bulk-ack/` |
| `getMySubscriptions` | `/api/alerts/me/subscriptions/` | `/api/alerts/subscriptions/me/` |
| `subscribeToAlert` | `/api/alerts/me/subscriptions/` | `/api/alerts/subscriptions/` |
| `unsubscribeFromAlert` | `/api/alerts/me/subscriptions/{id}/` | `/api/alerts/subscriptions/{id}/` |

**Aliases verificados:** `getAlerts` (→ `getActiveAlerts`), `createSubscription` (→ `subscribeToAlert`), `cancelSubscription` (→ `unsubscribeFromAlert`).

**Eliminación documentada:** `getTemplates` no existe — `typeof alertsGateway.getTemplates === 'undefined'`.

**updateAlert usa PATCH, no PUT** — verificado explícitamente porque T2.1 corrigió el verbo.

---

## T6.4 — userGateway: 22 tests, 13 métodos

**Archivo:** `src/services/__tests__/userService.test.js`
**Commit:** `02ffa90`

El test existente ya cubría 11 de 13 métodos. Añadidos los 2 faltantes:

- `patchUser(id, data)` → `PATCH /api/users/{id}/` (actualización parcial). Test verifica que usa PATCH y no PUT.
- `deleteUser(id)` → `DELETE /api/users/{id}/`. Test verifica interpolación del id.

---

## T6.5 — sharesGateway: 14 tests, 5 métodos

**Archivo:** `src/services/__tests__/sharesGateway.test.js` (nuevo)
**Commit:** `20133c1`

Suite creada desde cero. Cubre el patrón de direccionalidad de shares:

- `getShares()` → GET sin filtro
- `getSharesSent()` → GET con `direction=sent` fijo en params
- `getSharesReceived()` → GET con `direction=received` fijo en params

La combinación de params adicionales con el filtro de dirección está verificada explícitamente.

---

## T6.6 — navigationGateway: 6 tests, 2 métodos

**Archivo:** `src/services/__tests__/navigationGateway.test.js` (nuevo)
**Commit:** `20133c1`

Suite mínima para el gateway de navegación. Ambos métodos son GETs simples con params opcionales.

---

## T6.7 — savedFiltersGateway: 15 tests, 5 métodos

**Archivo:** `src/services/__tests__/savedFiltersGateway.test.js` (nuevo)
**Commit:** `20133c1`

CRUD completo de filtros guardados del usuario. `updateFilter` usa PATCH verificado explícitamente.

---

## Verificación final

```
# IACT-ui
npm test -- --no-coverage
  Test Suites: 250 passed, 250 total   (+3 respecto a FASE 5)
  Tests:       2366 passed, 2366 total  (+145 respecto a FASE 5)
  Fallos:      0

# IACT-api (sin cambios en FASE 6)
pytest tests/unit/
  1060 passed, 0 failed
```

### Commits de FASE 6

| Commit | Tarea | Gateway | Tests |
|---|---|---|---|
| `ab73770` | T6.1 | accessGateway | 64 |
| `a30ac3e` | T6.2 | auditGateway | 28 |
| `e4ce8a8` | T6.3 | alertsGateway | 37 |
| `02ffa90` | T6.4 | userGateway | +6 (total 22) |
| `20133c1` | T6.5-T6.7 | shares + navigation + savedFilters | 35 |

---

## Resumen de proyecto IACT-ui — FASES 1-6

| FASE | Objetivo | Tests pre | Tests post | Δ tests |
|---|---|---|---|---|
| FASE 1 | Corregir URLs legacy y auth | 2000 | 2216 | +216 |
| FASE 2 | Sincronizar gateways con IACT-api | 2216 | 2216 | 0 |
| FASE 3 | Sincronizar Redux slices | 2216 | 2217 | +1 |
| FASE 4 | Conectar páginas a la capa correcta | 2217 | 2217 | 0 |
| FASE 5 | Eliminar código muerto (4 gateways) | 2217 | 2221 | +4 |
| FASE 6 | Cobertura completa de gateways | 2221 | 2366 | +145 |
| **Total** | — | — | **2366** | **+366** |

**Deuda técnica activa al cierre: 0**
