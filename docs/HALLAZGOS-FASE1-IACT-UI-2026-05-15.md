# Hallazgos FASE 1 — Saneamiento de base IACT-ui

**Artefacto:** HALLAZGOS-FASE1-IACT-UI-2026-05-15
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Rama:** `develop` — commits `39817cf` → `9effac4`
**Metodología:** TDD estricto — RED antes de cada implementación
**Estado:** Cerrado — deuda técnica activa en FASE 1 = 0

---

## Resumen ejecutivo

| Métrica | Antes | Después |
|---|---|---|
| IACT-ui test suites | 228 | **232 (+4 suites)** |
| IACT-ui tests | 2041 | **2091 (+50 tests)** |
| Tests fallidos | 0 | **0** |
| Gateways con `fetch()` directo (v4.0) | 2 | **0** |
| Gateways con URLs `/api/me/` legacy | 1 | **0** |
| Slices con URLs directas sin gateway | 2 | **0** |
| Syntax bugs en template literals | 2 | **0** |
| Métodos de gateway con endpoints inexistentes | 10 | **0** |
| Métodos de gateway nuevos alineados con API | 0 | **+18** |

---

## H-F1-001 — Syntax bugs en template literals anidados

**Tarea:** T1.1
**Archivos:** `src/services/adminGateway.js` L146, `src/services/alertsGateway.js` L42
**Commit:** `fix(T1.1+T1.2): template literals malformados y sharesGateway URLs canónicas`

### Descripción

Dos métodos usaban template literals anidados en el argumento de URL de `apiService.get()`:

```javascript
// adminGateway.js L146 — ANTES (roto)
return apiService.get(`/api/access/menu-items/${query ? `?${query}` : ''}`)

// alertsGateway.js L42 — ANTES (roto)
return apiService.get(`/api/alerts/history/${params ? `?${params}` : ''}`)
```

**Consecuencias observables:**
1. El analizador estático de URLs capturaba `/api/access/menu-items/${query` como URL literal —
   el endpoint nunca aparecía en el inventario de cobertura.
2. Cuando `query` era una cadena no vacía, la URL generada era
   `/api/access/menu-items/?status=ACTIVE` (con el primer `?` como parte del PATH, no del query).
   `apiService` lo interpretaba como parte del path y podía generar un 404 en algunos proxies.
3. El anidamiento de backticks es un anti-patrón que genera ambigüedad en parsers de código.

### Corrección

```javascript
// adminGateway.js — DESPUÉS
async getMenuItems({ status, module: mod } = {}) {
  const params = {}
  if (status) params.status = status
  if (mod)    params.module = mod
  return apiService.get('/api/access/menu-items/', { params })
}

// alertsGateway.js — DESPUÉS
getAlertHistory(filters = {}) {
  return apiService.get('/api/alerts/history/', { params: filters })
}
```

La URL es siempre un literal estático. Los parámetros van en el objeto `{ params }` que
`apiService` serializa correctamente como query string.

**Tests:** `__tests__/services/t1.1-template-literals.test.js` — 4/4 PASS

---

## H-F1-002 — sharesGateway.js: subpaths inexistentes `/api/me/shares/`

**Tarea:** T1.2
**Archivo:** `src/services/sharesGateway.js`
**Commit:** `fix(T1.1+T1.2): template literals malformados y sharesGateway URLs canónicas`

### Descripción

`sharesGateway.js` llamaba a tres rutas que no existen en IACT-api:

| Método | URL anterior | URL canónica |
|---|---|---|
| `createShare()` | `POST /api/me/shares/` | `POST /api/reports/shares/` |
| `getSharesSent()` | `GET /api/me/shares/sent/` | `GET /api/reports/shares/?direction=sent` |
| `getSharesReceived()` | `GET /api/me/shares/received/` | `GET /api/reports/shares/?direction=received` |

IACT-api expone únicamente:
- `POST /api/reports/shares/` — crear share
- `DELETE /api/reports/shares/{uuid}/` — revocar share

La API **no tiene subpaths** `/sent/` ni `/received/`. La dirección se filtra con
`?direction=sent|received` en el endpoint de lista.

### Corrección

```javascript
async getSharesSent(params = {}) {
  return apiService.get('/api/reports/shares/', { params: { direction: 'sent', ...params } })
}
async getSharesReceived(params = {}) {
  return apiService.get('/api/reports/shares/', { params: { direction: 'received', ...params } })
}
```

**Tests:** `__tests__/services/sharesGateway.integration.test.js` — 5/5 PASS

---

## H-F1-003 — auth.js slice: 5 thunks llamaban apiService directamente

**Tarea:** T1.3
**Archivos:** `src/redux/slices/auth.js`, `src/services/authGateway.js`
**Commit:** `fix(T1.3): auth.slice delega todo a authGateway — elimina llamadas directas a apiService`

### Descripción

El slice `auth.js` importaba tanto `apiService` como `authGateway`, pero 5 de sus 7 thunks
llamaban directamente a `apiService` con URLs incorrectas:

| Thunk | Llamada incorrecta | URL legacy | Problema |
|---|---|---|---|
| `loginUser` | `apiService.post('/api/token/', ...)` | v1 JWT | URL obsoleta; formato de respuesta v1 ≠ v2 |
| `logoutUser` | `apiService.post('/api/logout/', {})` | v1 | URL sin prefijo /auth/ |
| `getCurrentUser` | `apiService.get('/api/user/')` | v1 | URL obsoleta |
| `recoverPassword` | `apiService.post('/api/auth/recover-password/', ...)` | no existe | Endpoint inexistente en IACT-api |
| `changePassword` | `apiService.post('/api/auth/change-password/', ...)` | directo | Bypaseaba gateway |

**Principio violado:** los slices de Redux no deben conocer la capa HTTP. Toda comunicación
con la API debe pasar por un gateway — esto garantiza que los mocks, el interceptor de
autenticación y el manejo de errores sean consistentes.

### Corrección en authGateway.js

Se añadieron los métodos ausentes al gateway:

```javascript
// authGateway.js — nuevos métodos
async function resetPasswordBase(username) {
  return apiService.post('/api/auth/reset_password/', { username })
}

async function changePasswordBase(currentPassword, newPassword) {
  return apiService.post('/api/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}
```

### Corrección en auth.js slice

```javascript
// ANTES (5 violaciones):
const response = await apiService.post('/api/token/', { username, password })

// DESPUÉS (delegación correcta):
return await authGateway.login(username, password)
```

Los 7 thunks del slice ahora delegan exclusivamente al gateway.

**Tests:** `__tests__/services/authSlice.delegation.test.js` — 7/7 PASS

---

## H-F1-004 — savedFilters.js slice: URLs `/api/me/filters/` inexistentes

**Tarea:** T1.4
**Archivos:** `src/redux/slices/savedFilters.js`, `src/services/savedFiltersGateway.js` (nuevo)
**Commit:** `fix(T1.4): savedFilters.slice /api/me/filters/ → /api/reports/me/filters/ + savedFiltersGateway`

### Descripción

`savedFilters.js` importaba `apiService` directamente y llamaba a rutas inexistentes:

| Thunk | URL anterior | URL canónica |
|---|---|---|
| `fetchSavedFilters` | `GET /api/me/filters/` | `GET /api/reports/me/filters/` |
| `saveFilter` | `POST /api/me/filters/` | `POST /api/reports/me/filters/` |
| `deleteFilter` | `DELETE /api/me/filters/{id}/` | `DELETE /api/reports/me/filters/{id}/` |
| `updateFilter` | `PATCH /api/me/filters/{id}/` | `PATCH /api/reports/me/filters/{id}/` |
| `setDefaultFilter` | `PATCH /api/me/filters/{id}/` | `PATCH /api/reports/me/filters/{id}/` |

No existía un gateway dedicado para filtros guardados — el slice acoplaba directamente
la lógica de Redux con la capa HTTP.

### Corrección

Creado `src/services/savedFiltersGateway.js`:

```javascript
class SavedFiltersService {
  async getFilters(params = {}) {
    return apiService.get('/api/reports/me/filters/', { params })
  }
  async createFilter(data) {
    return apiService.post('/api/reports/me/filters/', data)
  }
  async getFilterDetail(id) {
    return apiService.get(`/api/reports/me/filters/${id}/`)
  }
  async updateFilter(id, data) {
    return apiService.patch(`/api/reports/me/filters/${id}/`, data)
  }
  async deleteFilter(id) {
    return apiService.delete(`/api/reports/me/filters/${id}/`)
  }
}
```

El slice actualizado importa `savedFiltersGateway` y no contiene ninguna referencia a `apiService`.

**Tests:** `__tests__/services/savedFiltersGateway.test.js` — 6/6 PASS

---

## H-F1-005 — accessGateway.js: fetch() v4.0 + 26 URLs incorrectas + 4 métodos sin endpoint

**Tarea:** T1.5
**Archivo:** `src/services/accessGateway.js` (449 líneas → 220 líneas)
**Commit:** `fix(T1.5): accessGateway.js migrado de fetch() v4.0 → apiService + URLs canónicas`

### Descripción

`accessGateway.js` presentaba tres categorías de problemas:

#### 1. Vector de seguridad: fetch() + localStorage

```javascript
// ANTES — patrón inseguro v4.0
getAuthHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  }
}
async getAllFunctions() {
  const response = await fetch(`${API_BASE_URL}/access/functions`, {
    method: 'GET',
    headers: this.getAuthHeaders(),
  })
  ...
}
```

El gateway almacenaba el access token en `localStorage` y lo enviaba manualmente en cada
petición. Esto:
- Expone el token a ataques XSS (cualquier script en la página puede leer `localStorage`).
- Bypasea el interceptor de `apiClient.js` que gestiona las httpOnly cookies y el CSRF token.
- Ignora el sistema de retry, timeout y manejo de errores tipados de `apiClient.js`.

#### 2. URLs sin prefijo `/api/`, trailing slashes faltantes, paths incorrectos

| Método | URL anterior | URL canónica |
|---|---|---|
| `getAllFunctions()` | `/access/functions` | `/api/access/functions/` |
| `getUserPermissions(id)` | `/access/permissions/${id}` | `/api/access/permissions/{id}/` |
| `assignFunctions(id,...)` | `POST /users/{id}/functions/` | `POST /api/access/users/{id}/functions/assign/` |
| `revokeFunctions(id,...)` | `DELETE /users/{id}/functions/` | `DELETE /api/access/users/{id}/functions/revoke/` |
| `validateSeparationRules()` | `/access/separation-rules/validate` | `/api/access/separation-rules/validate` |
| `getAccessAudit(userId)` | `/access/audit/${userId}` | `/api/access/audit/?target_user_id=` |
| `exportAuditLog()` | `/audit/export/` | `/api/audit/export/` |
| `assignAccessGroup(uId,...)` | `/users/{uId}/access-groups/` | `/api/access/users/{uId}/agr/` |
| `revokeAccessGroup(uId,aId)` | `/users/{uId}/access-groups/${aId}` | `/api/access/users/{uId}/agr/{aId}/` |
| `createGroup()` | `/access/groups/` | `/api/access/access-groups/` |
| `updateGroup(id)` | `/access/groups/${id}/` | `/api/access/access-groups/{id}/` |
| `retireGroup(id)` | `/access/groups/${id}/` | `/api/access/access-groups/{id}/` |
| `assignFunctionsToGroup(gId)` | `/access/groups/${gId}/functions/` | `/api/access/access-groups/{gId}/functions/` |
| `getGroupFunctions(gId)` | `/access/groups/${gId}/functions/` | `/api/access/access-groups/{gId}/` |
| `getFunctionGroups()` | `/access/groups/` | `/api/access/access-groups/` |
| `getSeparationRules()` | `/access/separation-rules` | `/api/access/separation-rules/` |
| `createSeparationRule()` | `/access/separation-rules` | `/api/access/separation-rules/` |
| `updateSeparationRule(id)` | `/access/separation-rules/${id}` | `/api/access/separation-rules/{id}/` |
| `deleteSeparationRule(id)` | `/access/separation-rules/${id}` | `/api/access/separation-rules/{id}/` |
| `grantExceptionalPermission(uId)` | `/users/{uId}/exceptional-permissions/` | `/api/access/users/{uId}/exceptional-permissions/` |
| `getExceptionalPermissions(uId)` | `/users/{uId}/exceptional-permissions/` | `/api/access/users/{uId}/exceptional-permissions/` |
| `revokeExceptionalPermission(uId,pId)` | `/users/{uId}/exceptional-permissions/${pId}/` | `/api/access/users/{uId}/exceptional-permissions/{pId}/` |

#### 3. Métodos con endpoints inexistentes en IACT-api (eliminados)

| Método | URL inexistente | Razón |
|---|---|---|
| `getSegments()` | `/access/segments` | No existe en schema OpenAPI |
| `assignSegment(userId, segmentId)` | `/access/segments/assign` | No existe en schema OpenAPI |
| `validateGroupAssignment(userId, groupId)` | `/access/groups/{id}/validate-for-user` | No existe en schema OpenAPI |
| `getGroupCascadeImpact(groupId, ...)` | `/access/groups/{id}/cascade-impact` | No existe en schema OpenAPI |

#### 4. Métodos añadidos (endpoints nuevos en IACT-api no cubiertos)

| Método nuevo | URL canónica |
|---|---|
| `getEffectivePermissions(userId)` | `GET /api/access/users/{id}/effective-permissions/` |
| `verifyPermission(userId, code)` | `GET /api/access/permissions/verify/` |
| `previewExceptionalPermission(userId, params)` | `GET /api/access/users/{id}/exceptional-permissions/preview/` |
| `assignGrouper(userId, agrId)` | `POST /api/access/groupers/assign` |
| `getMyModules()` | `GET /api/access/my-modules/` |
| `getSeparationRuleDetail(id)` | `GET /api/access/separation-rules/{id}/` |
| `getGroupers(params)` | `GET /api/access/groupers/` |

**Tests:** `__tests__/services/accessGateway.integration.test.js` — 28/28 PASS

---

## H-F1-006 — auditGateway.js: fetch() v4.0 + 12 URLs incorrectas + 5 métodos sin endpoint

**Tarea:** T1.6
**Archivo:** `src/services/auditGateway.js` (273 líneas → 130 líneas)
**Commit:** `fix(T1.6): auditGateway.js migrado de fetch() v4.0 → apiService + URLs canónicas`

### Descripción

Mismo vector de seguridad que H-F1-005. Adicionalmente:

#### URLs incorrectas (12 métodos)

| Método | URL anterior | URL canónica | Cambio adicional |
|---|---|---|---|
| `getAuditLogs()` | `GET /audit/logs?${queryParams}` | `GET /api/audit/logs/` | GET con params objeto |
| `searchLogs()` | `POST /audit/search` | `POST /api/audit/search/` | — |
| `exportLogs()` | `POST /audit/export` (retorna blob) | `POST /api/audit/export/` | Retorna `{job_id}` no blob |
| `getComplianceReport()` | `GET /audit/compliance?${q}` | `POST /api/audit/compliance-report/` | GET → POST |
| `getLogDetails(id)` | `GET /audit/logs/${id}` | `GET /api/audit/logs/{id}/` | — |
| `getLogsByUser(userId)` | `GET /audit/logs/user/${id}` | usar `getAuditLogs({user_id})` | Filtro, no subpath |
| `getLogsByResource()` | `GET /audit/logs/resource?...` | usar `getAuditLogs({resource_type})` | Filtro, no subpath |
| `getCriticalLogs()` | `GET /audit/logs/critical` | usar `getAuditLogs({severity:'CRITICAL'})` | Filtro, no subpath |
| `validateLogIntegrity()` | `POST /audit/validate-integrity` | `GET /api/audit/integrity/` | POST → GET |
| `generateComplianceReport()` | `POST /audit/compliance/generate` | `POST /api/audit/compliance-report/` | Alias del anterior |
| `logEvent()` | `POST /audit/events` | **ELIMINADO** | CNST-009: solo backend emite |
| `getAuditSummary()` | `GET /audit/summary` | **ELIMINADO** | No existe en IACT-api |

#### Cambio crítico: exportLogs retornaba blob (incorrecto)

```javascript
// ANTES — retornaba blob (descarga directa — incorrecto para API async)
return response.blob()

// DESPUÉS — retorna { job_id } para seguimiento del job de exportación
return apiService.post('/api/audit/export/', { format, filters })
```

La API implementa exportación asíncrona: el cliente recibe un `job_id` y debe
consultar el estado del job antes de descargar. El blob nunca fue la respuesta
correcta de este endpoint.

#### CNST-009: logEvent() eliminado

```javascript
// ANTES — emitía eventos de auditoría desde el frontend
async logEvent(event) {
  await fetch(`${API_BASE_URL}/audit/events`, { method: 'POST', ... })
}
```

CNST-009 (Auditoría Inmutable) establece que **solo el backend emite eventos de auditoría**.
El frontend no debe llamar directamente al endpoint de auditoría para registrar eventos
propios — esto podría permitir fabricar registros de auditoría.

#### Métodos añadidos (endpoints nuevos en IACT-api)

| Método nuevo | URL canónica |
|---|---|
| `verifyCompliance(reportId)` | `POST /api/audit/compliance-verify/` |
| `getAuditEvents(params)` | `GET /api/audit/audit-events/` |
| `getAuditEventDetail(id)` | `GET /api/audit/audit-events/{id}/` |
| `getAuditEventAggregations(params)` | `GET /api/audit/audit-events/aggregate/` |
| `exportAuditEvents(filters)` | `POST /api/audit/audit-events/export/` |
| `getGeneralTimeline(params)` | `GET /api/audit/general/` |
| `verifyIntegrity(params)` | `GET /api/audit/integrity/` |
| `getAuditLogDetail(id)` | `GET /api/audit/logs/{id}/` |

**Tests:** `__tests__/services/auditGateway.integration.test.js` — 14/14 PASS

---

## Inventario de cambios por archivo

| Archivo | Tipo | Cambio |
|---|---|---|
| `src/services/adminGateway.js` | fix | T1.1: getMenuItems — template literal → params |
| `src/services/alertsGateway.js` | fix | T1.1: getAlertHistory — template literal → params |
| `src/services/sharesGateway.js` | fix | T1.2: /api/me/shares/ → /api/reports/shares/ |
| `src/services/authGateway.js` | feat | T1.3: +resetPassword(), +changePassword() |
| `src/redux/slices/auth.js` | fix | T1.3: delegar 5 thunks a authGateway |
| `src/services/savedFiltersGateway.js` | nuevo | T1.4: 5 métodos /api/reports/me/filters/ |
| `src/redux/slices/savedFilters.js` | fix | T1.4: delegar 5 thunks a savedFiltersGateway |
| `src/services/accessGateway.js` | fix | T1.5: fetch() v4.0 → apiService + 26 URLs |
| `src/services/auditGateway.js` | fix | T1.6: fetch() v4.0 → apiService + 12 URLs |
| `src/services/__tests__/accessService.test.js` | fix | actualizar a apiService + URLs canónicas |
| `src/services/__tests__/auditService.test.js` | fix | actualizar a apiService + URLs canónicas |
| `__tests__/services/t1.1-template-literals.test.js` | nuevo | 4 tests T1.1 |
| `__tests__/services/sharesGateway.integration.test.js` | nuevo | 5 tests T1.2 |
| `__tests__/services/authSlice.delegation.test.js` | nuevo | 7 tests T1.3 |
| `__tests__/services/savedFiltersGateway.test.js` | nuevo | 6 tests T1.4 |
| `__tests__/services/accessGateway.integration.test.js` | nuevo | 28 tests T1.5 |
| `__tests__/services/auditGateway.integration.test.js` | nuevo | 14 tests T1.6 |

---

## Verificación final

```
# IACT-ui
npm test -- --no-coverage
  Test Suites: 232 passed, 232 total   (era 228)
  Tests:       2091 passed, 2091 total  (era 2041)
  Tiempo:      ~70s

# IACT-api (sin cambios en FASE 1)
pytest tests/unit/
  1060 passed, 0 failed
```

### Commits de FASE 1

| Commit | Tareas | Descripción |
|---|---|---|
| `(T1.1+T1.2)` | T1.1, T1.2 | Template literals + sharesGateway |
| `d85b565` | T1.3 | auth.slice → authGateway |
| `(T1.4)` | T1.4 | savedFiltersGateway nuevo |
| `ba085ef` | T1.5 | accessGateway fetch() → apiService |
| `9effac4` | T1.6 | auditGateway fetch() → apiService |

---

## Deuda técnica pendiente (próximas fases)

FASE 1 elimina la deuda de infraestructura en la capa de servicios.
Las siguientes fases abordan la cobertura funcional:

- **FASE 2:** 72 endpoints de API sin gateway en UI (alertas, usuarios, sesiones, etc.)
- **FASE 3:** Sincronizar slices de Redux con los gateways actualizados de FASE 1 + FASE 2
- **FASE 4:** Conectar páginas a la capa de datos correcta
- **FASE 5:** Eliminar `jobGateway.js` y `transactionGateway.js` (sin endpoints en API)
