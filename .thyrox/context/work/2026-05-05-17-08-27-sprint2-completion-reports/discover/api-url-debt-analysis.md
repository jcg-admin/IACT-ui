```yml
created_at: 2026-05-05 17:15:00
project: IACT-UI
work_package: 2026-05-05-17-08-27-sprint2-completion-reports
phase: Phase 1 — DISCOVER
author: claude
status: Aprobado
version: 1.0.0
```

# Análisis de Deuda Técnica — URLs REST en accessService.js

Análisis de fuentes canónicas en `/tmp/references/IACT-docs/source/`
para resolver TD-ACC-01..05.

## Hallazgo arquitectónico central

**La API IACT es user-centric, no access-centric.**

El `accessService.js` actual usa `/api/access/...` para todas las operaciones.
Los documentos de arquitectura muestran que las operaciones de asignación/revocación
son sub-recursos del usuario:

```
/api/users/{id}/functions/        ← asignar/revocar funciones
/api/users/{id}/access-groups/    ← asignar agrupadores (AGR)
/api/audit/export/                ← export de auditoría (módulo audit, NO access)
```

---

## TD-ACC-01 — assignFunction

| Campo | Valor |
|-------|-------|
| Método actual | `POST /access/functions/assign` |
| **URL canónica** | `POST /api/users/{userId}/functions/` |
| Tipo evidencia | **PROVEN** |
| Fuente | `requisitos/casos-uso/access/uc-acc-01/diagramas-uml/diagrama-de-secuencia.rst` |

**Extracto literal del documento:**
```
Frontend -> Assignfunctionsview: POST /api/users/{id}/functions/
```

**Diferencias adicionales con implementación actual:**
- Body: `functionId` (singular) → `function_ids` (array plural) — soporta bulk assign
- El endpoint acepta múltiples funciones en un solo request
- `expires_at` se mantiene como parámetro opcional
- Backend: `AssignFunctionsView` — deduplica con asignaciones existentes (FA-01: noop si ya asignado)

**Firma correcta del método:**
```js
async assignFunctions(userId, functionIds, expiresAt = null) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/functions/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ function_ids: functionIds, expires_at: expiresAt }),
    });
    // 201 Created (asignado) o 200 OK (noop — ya estaba asignado)
}
```

---

## TD-ACC-02 — revokeFunction

| Campo | Valor |
|-------|-------|
| Método actual | `POST /access/functions/revoke` |
| **URL canónica** | `DELETE /api/users/{userId}/functions/` |
| Tipo evidencia | **PROVEN** |
| Fuente | `requisitos/casos-uso/access/uc-acc-02/diagramas-uml/diagrama-de-secuencia.rst` |

**Extracto literal del documento:**
```
Frontend -> Revokefunctionsview: DELETE /api/users/{id}/functions/
```

**Diferencias adicionales:**
- HTTP method es `DELETE` (no `POST`)
- Body incluye `function_ids` (plural) + `revoke_reason` (requerido)
- Backend actualiza `Assignment.state = 'REVOKED'` — no DELETE físico (BR-009)
- Puede devolver warnings: `no_functions`, `critical`, `last_holder`

**Firma correcta:**
```js
async revokeFunctions(userId, functionIds, revokeReason) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/functions/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ function_ids: functionIds, revoke_reason: revokeReason }),
    });
    // 200 OK + warnings | 200 OK (noop) | 409 (last_holder protection)
}
```

---

## TD-ACC-03 — exportAudit

| Campo | Valor |
|-------|-------|
| Método actual | `POST /access/audit/export` |
| **URL canónica** | `POST /api/audit/export/` |
| Tipo evidencia | **PROVEN** |
| Fuente | `requisitos/casos-uso/audit/uc-aud-03/actores-precondiciones.rst` + `diagramas-uml/secuencia-de-exportacion-de-audit-log.rst` |

**Extracto literal del documento:**
```
POST /api/audit/export/
body: {filters, period, format: csv|json, include_archive: bool}
Response: 202 + job_id
```

**Diferencias críticas con implementación actual:**

1. **Path incorrecto**: `/access/audit/export` → `/audit/export/` (módulo audit, no access)
2. **Respuesta incorrecta**: el código actual hace `response.blob()` — la respuesta real es **async** `202 + {job_id}`, no un blob directo
3. **Body diferente**: no solo `{userId, format}` — acepta `{filters, period, format, include_archive}`
4. **Flujo async**: el worker procesa en background y notifica vía `InternalMailbox`

**Firma correcta:**
```js
async exportAuditLog(filters, period, format = 'csv', includeArchive = false) {
    const response = await fetch(`${API_BASE_URL}/audit/export/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ filters, period, format, include_archive: includeArchive }),
    });
    // 202 Accepted { job_id: UUID }
    return response.json(); // { job_id }  — NO blob
}
```

---

## TD-ACC-04 — assignFunctionGroup

| Campo | Valor |
|-------|-------|
| Método actual | `POST /access/function-groups/assign` |
| **URL canónica** | `POST /api/users/{userId}/access-groups/` |
| Tipo evidencia | **PROVEN** |
| Fuente | `requisitos/casos-uso/access/uc-acc-04/diagramas-uml/diagrama-de-secuencia.rst` |

**Extracto literal del documento:**
```
Frontend -> Assignagrview: POST /api/users/{id}/access-groups/
```

**Diferencias adicionales:**
- El recurso se llama `access-groups` (AGR), no `function-groups`
- Body: `{agr_id, expires_at}` — ID del AccessGroup, no del FunctionGroup
- Backend view: `AssignAGRView`
- En IACT, los `FunctionGroup` se asignan como `AccessGroup` (AGR) que los contiene

**Firma correcta:**
```js
async assignAccessGroup(userId, agrId, expiresAt = null) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/access-groups/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ agr_id: agrId, expires_at: expiresAt }),
    });
    // 201 Created | 200 OK (noop) | 409 (SoD violation)
}
```

---

## TD-ACC-05 — assignSegment

| Campo | Valor |
|-------|-------|
| Método actual | `POST /access/segments/assign` |
| **URL canónica** | `POST /api/users/{userId}/segments/` (inferida) |
| Tipo evidencia | **INFERRED** |
| Fuente | Patrón user-centric de UC-ACC-01, UC-ACC-04. `SegmentResolver` es un stub pendiente de desarrollo en `domain-model/segment-resolver.rst` |

**Razonamiento para INFERRED:**
- Todas las operaciones de asignación siguen `/api/users/{id}/{recurso}/`
- `SegmentResolver` está marcado como `estado: Pendiente` — no hay UC spec
- No se encontró endpoint explícito en ningún documento

**Recomendación:** Mantener como deuda técnica pendiente hasta que el backend publique el contrato de este endpoint. No corregir sin confirmación del backend.

---

## Tabla consolidada de correcciones

| TD | Método actual | URL actual | Método correcto | URL canónica | Body correcto | Evidencia |
|----|--------------|-----------|-----------------|-------------|---------------|-----------|
| ACC-01 | `POST` | `/access/functions/assign` | `POST` | `/users/{id}/functions/` | `{function_ids[], expires_at}` | PROVEN |
| ACC-02 | `POST` | `/access/functions/revoke` | `DELETE` | `/users/{id}/functions/` | `{function_ids[], revoke_reason}` | PROVEN |
| ACC-03 | `POST` | `/access/audit/export` | `POST` | `/audit/export/` | `{filters, period, format, include_archive}` | PROVEN |
| ACC-04 | `POST` | `/access/function-groups/assign` | `POST` | `/users/{id}/access-groups/` | `{agr_id, expires_at}` | PROVEN |
| ACC-05 | `POST` | `/access/segments/assign` | `POST` | `/users/{id}/segments/` | `{segment_id}` | INFERRED |

---

## Impacto en mockInterceptor.js

Las URLs del mock deben actualizarse en sincronía. Handlers actuales a crear/actualizar:

```
POST /api/users/:userId/functions/       ← TD-ACC-01 (nuevo handler)
DELETE /api/users/:userId/functions/     ← TD-ACC-02 (nuevo handler)
POST /api/audit/export/                  ← TD-ACC-03 (path corregido + respuesta 202+job_id)
POST /api/users/:userId/access-groups/  ← TD-ACC-04 (nuevo handler)
```

---

## Métodos del frontend que cambian de nombre

| Método actual | Método correcto | Razón |
|---------------|----------------|-------|
| `assignFunction(userId, functionId)` | `assignFunctions(userId, functionIds[])` | API bulk + nombre plural |
| `revokeFunction(userId, functionId)` | `revokeFunctions(userId, functionIds[], reason)` | API bulk + reason requerido |
| `exportAudit(userId, format)` | `exportAuditLog(filters, period, format, includeArchive)` | Parámetros reales del endpoint |
| `assignFunctionGroup(userId, groupId)` | `assignAccessGroup(userId, agrId, expiresAt)` | Nomenclatura AGR |

---

## Fuentes consultadas (PROVEN)

- `arquitectura-tecnica/design-view/seq-access.rst` — secuencia de asignación de AccessGroup
- `arquitectura-tecnica/design-view/seq-audit.rst` — secuencia de búsqueda y export de audit
- `requisitos/casos-uso/access/uc-acc-01/diagramas-uml/diagrama-de-secuencia.rst` — URL canónica TD-ACC-01
- `requisitos/casos-uso/access/uc-acc-02/diagramas-uml/diagrama-de-secuencia.rst` — URL canónica TD-ACC-02
- `requisitos/casos-uso/access/uc-acc-04/diagramas-uml/diagrama-de-secuencia.rst` — URL canónica TD-ACC-04
- `requisitos/casos-uso/audit/uc-aud-03/actores-precondiciones.rst` — URL y body TD-ACC-03
- `requisitos/casos-uso/audit/uc-aud-03/diagramas-uml/secuencia-de-exportacion-de-audit-log.rst` — flujo async
- `arquitectura-tecnica/domain-model/assignment.rst` — Assignment UUID, AssignmentState
- `arquitectura-tecnica/domain-model/export-job.rst` — ExportJob async con job_id
- `backend/adr-back-006-rbac-estrategia-implementacion.rst` — vocabulario canónico Django
