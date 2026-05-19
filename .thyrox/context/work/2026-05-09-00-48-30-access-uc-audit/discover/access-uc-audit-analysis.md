```yml
created_at: 2026-05-09 00:48:30
project: THYROX
work_package: 2026-05-09-00-48-30-access-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER Analysis — access-uc-audit

## Scope

Auditoría PAT-UC-AUDIT-001 sobre los 7 UCs del módulo Access:

| UC | Página | Ruta |
|----|--------|------|
| UC_ACC_01 Asignar Funciones | `AssignFunctions.jsx` | `/access/assign-functions` |
| UC_ACC_02 Revocar Funciones | `AssignFunctions.jsx` (tab revocar) | misma ruta |
| UC_ACC_03 Consultar Permisos Efectivos | `Permissions.jsx` | `/access/permissions` |
| UC_ACC_04 Asignar Agrupador | `AssignGroup.jsx` | `/access/assign-group` — auditado en WP anterior |
| UC_ACC_05 Reglas Separación | `SeparationRules.jsx` | `/access/separation-rules` — auditado en WP anterior |
| UC_ACC_08 Permiso Temporal | `TemporaryPermissions.jsx` | `/permissions/temp-permissions` |
| UC_ACC_09 Auditar Cambios | `AccessAudit.jsx` | `/access/audit/access` |

UC_ACC_04 y UC_ACC_05 fueron auditados y corregidos en WP
`permissions-fr-gaps-uml-conformance` — excluidos del scope de este WP.

---

## Verificación de rutas — PROVEN

| Página | Ruta declarada | Route en AppRouter | Estado |
|--------|---------------|-------------------|--------|
| AccessAudit | `/access/audit/access` | ✅ línea 904 | Registrada |
| Permissions | `/access/permissions` | ✅ línea 892 | Registrada |
| AssignFunctions | `/access/assign-functions` | ✅ línea 880 | Registrada |
| TemporaryPermissions | `/permissions/temp-permissions` | ✅ línea 846 | Registrada (bajo permissions, no access) |

Nav entry para "Auditoría acceso": `path: '/access/audit/access'` — línea 174 ✅

**"Permiso temporal" NO aparece en el nav del módulo Access** (líneas 166-174).
`TemporaryPermissions.jsx` es accesible solo desde la sección Permissions del nav.

---

## Análisis por UC — PAT-UC-AUDIT-001

### UC_ACC_01 — Asignar Funciones

**Flujo nominal:**
- ✅ User selector → function selector → `assignFunction` thunk
- ✅ `expiryDate` opcional (asignación con o sin expiración)
- ✅ `FunctionSelector` integra `SeparationRulesValidator` (CNST-005)
- ✅ Success message 3s auto-clear

**Flujos alternativos:**
- ✅ FA: conflictos SR → botón Asignar deshabilitado con `hasConflicts`
- ✅ FA: sin usuario / sin funciones → botón deshabilitado

**Flujos de error:**
- ✅ Error del slice → bloque rojo con mensaje de error

**Gaps:**
- ⚠️ MENOR: usuarios cargados con mock hardcoded local en `loadUsers()` en lugar de
  despachar thunk (igual que UC_ACC_02, UC_ACC_03, UC_ACC_09). No es un gap de UC
  sino de integración de datos — todos los módulos lo hacen igual.

**Veredicto UC_ACC_01: CUBIERTO** — flujo nominal + alternativos + error presentes.

---

### UC_ACC_02 — Revocar Funciones

**Spec (uc-acc-02.rst):**
- "Validar revoke_reason (≥10)" — campo obligatorio
- "Validar Assignment activo" — guard
- "Validar LastHolderSpec (funciones críticas)" — 409 si último holder
- BR-009 soft-delete: `state=REVOKED`

**Implementación actual (AssignFunctions.jsx tab revocar):**
```jsx
<button onClick={() => handleRevoke(fn.id)}>Revocar</button>
```
```js
const handleRevoke = async (catalogId) => {
    if (!selectedUser) return;
    await dispatch(revokeFunction({ userId: parseInt(selectedUser), catalogId }));
};
```

**Gaps:**
- ❌ **GAP-ACC-01 (CRÍTICO)**: No hay campo `revoke_reason` en el tab Revocar.
  El thunk acepta `revokeReason` (access.js:58) y el mock acepta `body.revoke_reason`
  (mockInterceptor.js:917). La UI siempre envía `undefined` — la spec requiere
  mínimo 10 caracteres.
- ❌ **GAP-ACC-02 (MEDIO)**: No hay guard de LastHolderSpec en el mock para revocar.
  El mock (line ~222) retorna `{ revoked: true }` sin validar si el usuario es el
  único holder de la función. La spec dice 409 si `LastHolderSpec` falla.
- ⚠️ MENOR: Sin confirmación antes de revocar — solo botón directo.

**Veredicto UC_ACC_02: PARCIAL** — flujo nominal funciona pero sin `revoke_reason` (req. de spec).

---

### UC_ACC_03 — Consultar Permisos Efectivos

**Spec (uc-acc-03.rst):**
- Calcula `effective_set` combinando Assignments directos + AGR assignments +
  ExceptionalPermissions activos no vencidos
- Self-query sin RBAC adicional; cross-user query requiere `view_assignments`
- Cache lookup (hot path)

**Implementación (Permissions.jsx):**
- ✅ `fetchUserPermissions(userId)` → `GET /api/access/permissions/{id}`
- ✅ Muestra funciones con badges por categoría
- ✅ Filtro por categoría
- ✅ Botón revocar con doble-click confirm (inline)

**Gaps:**
- ⚠️ MENOR: El filtro usa `category` pero las funciones del mock no tienen campo
  `category` estándar — el filtro podría devolver siempre todos los resultados.
- ⚠️ MENOR: No muestra distinción entre "Assignment directo", "vía AGR" y
  "ExceptionalPermission" — todos aparecen como una lista homogénea. La spec
  menciona `effective_set` combinado pero no requiere distinción visual explícita.

**Veredicto UC_ACC_03: CUBIERTO** — flujo nominal funcional. Gaps menores.

---

### UC_ACC_08 — Permiso Temporal

**Spec (uc-acc-08.rst):**
- Entidad: `ExceptionalPermission` (NO un `Assignment` regular)
- `justification` obligatorio ≥20 chars
- `expires_at` obligatorio + bounds (no puede ser pasado)
- Mailbox-or-abort HARD (P-10): sin notificación → grant no se completa
- Anti-self P-11: no puede otorgarse a sí mismo
- `UC_PERM_03` es la vista PERM del mismo UC

**Implementación actual (TemporaryPermissions.jsx):**
```jsx
import { fetchAllFunctions, assignFunction, ... } from '../../redux/slices/access';
// ...
await dispatch(assignFunction({
    userId: parseInt(selectedUser),
    catalogId: parseInt(selectedFunction),
    expiresAt: `${expiryDate}T${expiryTime}`,
}));
```

**Gaps:**
- ❌ **GAP-ACC-03 (CRÍTICO)**: `TemporaryPermissions.jsx` usa el thunk `assignFunction`
  (Assignment regular) en lugar del endpoint `ExceptionalPermission`. El endpoint
  correcto es `POST /api/users/{id}/exceptional-permissions/` (implementado en WP
  permissions-fr-gaps). La entidad `ExceptionalPermission` tiene semántica diferente
  al `Assignment` con `expires_at`.
- ❌ **GAP-ACC-04 (CRÍTICO)**: No hay campo `justification` en el formulario.
  La spec exige `justification ≥20` y el mock retorna 422 si no viene.
- ✅ Validación de fecha futura: `validateForm()` verifica `selectedDate > new Date()`
- ✅ `expiryTime` con default `23:59`

**Nota sobre `ExceptionalPermissionPage` (UC_PERM_03):**
Implementada en WP `permissions-fr-gaps-uml-conformance`. Esa página sí usa el
endpoint correcto y tiene `justification`. `TemporaryPermissions.jsx` es una
implementación paralela e incorrecta del mismo flujo — debería reescribirse para
usar `grantExceptionalPermission` thunk o eliminarse si UC_PERM_03 lo cubre.

**Veredicto UC_ACC_08: PARCIAL** — usando entidad incorrecta + falta justification.

---

### UC_ACC_09 — Auditar Cambios de Acceso

**Spec (uc-acc-09.rst):**
- Forzar `scope=MOD_Access`: event_type ∈ {`FUNCTIONS_*`, `AGR_*`, `EXCEPTIONAL_*`}
- Filtros: `actor_id` (opcional), `event_type`, `period`
- Cursor pagination
- Meta-audit: `ACC_AUDIT_QUERIED (P-44)` al consultar

**Implementación (AccessAudit.jsx):**
- ✅ Ruta `/access/audit/access` registrada correctamente
- ✅ Filtros: usuario, acción, fecha desde/hasta
- ✅ Export CSV
- ✅ CNST-009 badge (inmutable)

**Gaps:**
- ❌ **GAP-ACC-05 (MEDIO)**: `fetchAccessAudit(userId)` requiere userId — no carga
  sin usuario seleccionado. La spec indica que `actor_id` es un filtro opcional,
  no requerido. Sin user seleccionado, la tabla muestra "No hay registros" aunque
  debería cargar todos los eventos scope=MOD_Access.
- ⚠️ MENOR: Event_type names en el filtro (`ASSIGN_FUNCTION`, `REVOKE_FUNCTION`)
  no coinciden con spec (`FUNCTIONS_ASSIGNED`, `FUNCTIONS_REVOKED`). Mock usa los
  nombres del filtro — consistente internamente pero inconsistente con spec.
- ⚠️ MENOR: Sin cursor pagination — carga todo de una vez.
- ⚠️ MENOR: Meta-audit P-44 no implementado (depende de backend).

**Veredicto UC_ACC_09: PARCIAL** — carga bloqueada sin usuario seleccionado.

---

## Resumen de Gaps — PROVEN

| ID | UC | Severidad | Descripción |
|----|----|-----------|----|
| GAP-ACC-01 | UC_ACC_02 | CRÍTICO | Sin campo `revoke_reason` (≥10 requerido por spec) |
| GAP-ACC-02 | UC_ACC_02 | MEDIO | Sin mock guard `LastHolderSpec` (409 si último holder) |
| GAP-ACC-03 | UC_ACC_08 | CRÍTICO | Usa `assignFunction` thunk en vez de ExceptionalPermission |
| GAP-ACC-04 | UC_ACC_08 | CRÍTICO | Sin campo `justification` (≥20 requerido por spec) |
| GAP-ACC-05 | UC_ACC_09 | MEDIO | Audit requiere userId — spec lo define como filtro opcional |

---

## Gate 1.5

Scope aprobado. Orden de implementación propuesto:

1. **GAP-ACC-01 + GAP-ACC-02** — UC_ACC_02: revoke_reason + LastHolderSpec mock
2. **GAP-ACC-03 + GAP-ACC-04** — UC_ACC_08: reescribir TemporaryPermissions para
   usar ExceptionalPermission endpoint + justification field
3. **GAP-ACC-05** — UC_ACC_09: load sin userId requerido (filtro opcional)
