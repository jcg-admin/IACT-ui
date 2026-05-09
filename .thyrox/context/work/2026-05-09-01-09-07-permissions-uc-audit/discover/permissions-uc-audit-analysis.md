```yml
created_at: 2026-05-09 01:09:07
project: THYROX
work_package: 2026-05-09-01-09-07-permissions-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER Analysis — permissions-uc-audit

## Scope

Auditoría PAT-UC-AUDIT-001 sobre los 10 UCs del módulo Permissions:

| UC | Nombre | Página / Componente | Ruta |
|----|--------|---------------------|------|
| UC_PERM_01 | Asignar Grupo a Usuario (vista PERM) | `AssignGroup.jsx` | `/permissions/assign-group` |
| UC_PERM_02 | Revocar Grupo a Usuario (vista PERM) | `RevokeGroup.jsx` | `/permissions/revoke-group` |
| UC_PERM_03 | Conceder Permiso Excepcional | `ExceptionalPermission.jsx` | `/permissions/exceptional-permission` |
| UC_PERM_04 | Revocar Permiso Excepcional | `RevokeExceptionalPermission.jsx` | `/permissions/revoke-exceptional` |
| UC_PERM_05 | Crear/Modificar/Retirar Grupo de Permisos | `GroupManagement.jsx` | `/access/groups` |
| UC_PERM_06 | Asignar Funciones a Grupo (composición AGR) | `GroupComposition.jsx` | `/access/groups/composition` |
| UC_PERM_07 | Verificar Permiso de Usuario | `usePermisos.ts` + `useFilteredNavLinks()` | (interno) |
| UC_PERM_08 | Generar Menú Dinámico | `useFilteredNavLinks()` + `AppRouter.jsx` | (interno) |
| UC_PERM_09 | Auditar Acceso (write side) | (backend — FE delega) | N/A frontend |
| UC_PERM_10 | Consultar Auditoría de Permisos | `PermissionsAudit.jsx` | `/access/audit/permissions` |

**Contexto WP anterior:** `permissions-fr-gaps-uml-conformance` implementó:
- GAP-3: `ExceptionalPermission.jsx` (UC_PERM_03)
- GAP-4: `RevokeExceptionalPermission.jsx` (UC_PERM_04)
- GAP-2: `AssignGroup.jsx` flujo 2 pasos
- GAP-5: `GroupComposition.jsx` cascade impact preview

---

## Verificación de rutas — PROVEN

| Página | Ruta declarada | Route en AppRouter | Estado |
|--------|---------------|-------------------|--------|
| AssignGroup | `/permissions/assign-group` | ✅ línea 824 | Registrada |
| RevokeGroup | `/permissions/revoke-group` | ✅ línea 835 | Registrada |
| ExceptionalPermission | `/permissions/exceptional-permission` | ✅ línea 857 | Registrada |
| RevokeExceptionalPermission | `/permissions/revoke-exceptional` | ✅ línea 868 | Registrada |
| GroupManagement | `/access/groups` | ✅ línea 464 | Registrada (bajo acceso, no permissions) |
| GroupComposition | `/access/groups/composition` | ✅ línea 474 | Registrada |
| PermissionsAudit | `/access/audit/permissions` | ✅ línea 522 | Registrada |

**Nota:** UC_PERM_05 y UC_PERM_06 se sirven bajo `/access/groups` y `/access/groups/composition`
— nav en sección "Acceso", no "Permissions". No es un gap de UC, es una decisión de
arquitectura de navegación.

---

## Análisis por UC — PAT-UC-AUDIT-001

### UC_PERM_01 — Asignar Grupo a Usuario (vista PERM)

**Spec:** flujo idéntico al UC_ACC_04 pero desde catálogo de AGRs.
PASO 5: modal que muestra composición explícita del AGR antes de confirmar.
PASO 16: refresh catalogo con count +1.

**Implementación (AssignGroup.jsx):**
- ✅ Flujo nominal: selección user + AGR → `assignAccessGroup` thunk → POST
- ✅ `expiryDate` opcional
- ✅ SoD pre-validación (GAP-2 de permissions-fr-gaps: flujo 2 pasos)
- ✅ FA-06 cubierto: selección desde AGR o desde user (mismo form)

**Gaps:**
- ⚠️ MENOR: El modal de confirmación no expande la composición del AGR (PASO 5 spec).
  AssignGroup.jsx muestra confirmación con nombre del AGR pero no lista las funciones que
  otorga. La spec especifica "defensa contra asignaciones por nombre sin saber qué contienen".
  No bloquea el flujo nominal pero es un gap de UX contra spec.
- ⚠️ MENOR: FA-08 (preview pre-write sin persistir) — no implementado. Fuera de scope
  explícito como "potencial".

**Veredicto UC_PERM_01: CUBIERTO** — flujo nominal + SoD alternativo cubiertos. Gap de
composición display es menor (UX, no bloquea el flujo).

---

### UC_PERM_02 — Revocar Grupo a Usuario (vista PERM)

**Spec:**
- PASO 3: ingresa `revoke_reason` (EX-06: vacio → 400)
- PASO 4: modal con composición expandida + warnings
- PASO 5: doble confirmación si `warnings.critical_revoked` no vacío

**Implementación (RevokeGroup.jsx):**
```jsx
function isValid() {
    return userId.trim() !== '' && groupId !== '' && revokeReason.trim().length >= 1
}
```
- ✅ `revoke_reason` existe en UI y se pasa al thunk
- ✅ Submit deshabilitado sin motivo

**Gaps:**
- ❌ **GAP-PERM-01 (MEDIO):** `revoke_reason` valida `≥ 1 char` en UI pero la spec (y la
  práctica establecida en UC_ACC_02) indica que debe ser significativo. El mock de
  DELETE `/api/users/{id}/access-groups/{agr_id}/` retorna `{ revoked: true }` sin
  ninguna validación de `revoke_reason`. No hay guard `REASON_TOO_SHORT` en el mock.
  La spec dice EX-06 es "revoke_reason vacio" → 400, lo que implica que el mock debe
  validarlo. El ≥1 char en UI es demasiado permisivo (vs. ≥10 establecido en UC_ACC_02).
- ❌ **GAP-PERM-02 (MEDIO):** Modal de composición expandida con warnings no implementado
  (PASO 4 spec). RevokeGroup.jsx revoca directamente sin mostrar las funciones que se
  revocarán ni warnings de funciones críticas. La spec especifica doble confirmación si
  `warnings.critical_revoked` no vacío — esto es un flujo de seguridad, no solo UX.
- ⚠️ MENOR: FA-06 (preview pre-revoke sin persistir) no implementado. Spec lo define como
  flujo alterno pero marcado como diferenciador de la vista PERM.

**Veredicto UC_PERM_02: PARCIAL** — flujo nominal básico funciona pero sin validación de
motivo significativa y sin modal de composición/warnings.

---

### UC_PERM_03 — Conceder Permiso Excepcional

**Spec:** `justification ≥ 20 chars` (confirmado en arch spec línea
"Validar payload (justification ≥20 + expires_at bounds)"). Anti-self P-11.
Mailbox-or-abort HARD (P-10). AuditEvent EXCEPTIONAL_PERMISSION_GRANTED.

**Implementación (ExceptionalPermission.jsx):**
```jsx
const justificationValid = justification.trim().length >= 10
```

**Gaps:**
- ❌ **GAP-PERM-03 (CRÍTICO):** `justification` valida `≥ 10 chars` en UI pero la spec
  dice `≥ 20 chars` (confirmado en arch spec). El mock `_handleGrantExceptionalPermission`
  fue actualizado en el WP access-uc-audit con validación ≥20 en el mock, pero el componente
  PERM sigue requiriendo solo ≥10. Discrepancia: TemporaryPermissions.jsx (reescrito en
  access-uc-audit) valida ≥20 correctamente; ExceptionalPermission.jsx (permissions-fr-gaps)
  valida solo ≥10.
- ✅ Anti-self P-11: `isAntiSelf` implementado y muestra `role="alert"`
- ✅ expires_at: validated `>= today && <= maxDate (90 días)` — correcto
- ✅ `supervisor_notified` en success card — P-10 confirmación visible
- ✅ Success card con audit_event mostrado — CNST-009

**Veredicto UC_PERM_03: PARCIAL** — correcto salvo justification min (10 en UI vs. 20 en spec).

---

### UC_PERM_04 — Revocar Permiso Excepcional

**Spec:**
- PASO 3: `revoke_reason` obligatorio
- FA-01: permission ya REVOKED → 200 informativo (idempotente, no error)
- FA-02: permission EXPIRED → 400 INVALID_STATE
- EX-07: auto-revocación P-11 → 400 SELF_REVOKE_FORBIDDEN
- EX-08: revoke_reason ausente / corta → 400

**Implementación (RevokeExceptionalPermission.jsx):**
- ✅ Flujo nominal: buscar permisos del user → select → confirm modal → dispatch `revokeExceptionalPermission`
- ✅ Confirm modal de 2 pasos (Revocar → Confirmar / Cancelar)
- ✅ Error con `role="alert"`

**Gaps:**
- ❌ **GAP-PERM-04 (MEDIO):** No hay campo `revoke_reason` en el formulario de revocación.
  `revokeExceptionalPermission` thunk acepta `{ userId, permissionId }` sin `reason`. La
  spec dice EX-08: `revoke_reason ausente → 400`. El mock de DELETE simplemente retorna
  OK sin validar reason. El flujo revoca sin que el admin proporcione justificación.
- ⚠️ MENOR: FA-01 (idempotencia: ya REVOKED → 200 informativo) no distinguido en UI.
  Si se revoca un permiso ya revocado, el mock retornaría un error que se muestra como
  error genérico, no como 200 informativo. Baja criticidad (el usuario no debería ver
  permisos ya revocados en la lista).
- ⚠️ MENOR: FA-02 (EXPIRED → 400 INVALID_STATE) no tiene manejo específico — se muestra
  como error genérico. La lista solo muestra activos, así que es poco probable verlo.

**Veredicto UC_PERM_04: PARCIAL** — falta `revoke_reason` en el formulario.

---

### UC_PERM_05 — Crear/Modificar/Retirar Grupo de Permisos

**Spec:**
- 3.A Crear: POST `/api/access-groups/` con `code` único, `name`, descrip. EX-06: CODE_DUPLICATE (409).
- 3.B Modificar: PATCH — `code` es INMUTABLE post-create. EX-10: CODE_IMMUTABLE (400) si PATCH incluye `code`.
- 3.C Retirar: DELETE con `retire_reason ≥ 20 chars`. EX-08: retire_reason missing → 400.
  `state=RETIRED` (soft-delete). FA-02: si users asignados → warning con count.
- EX-04: predefinido no mutable → 400 PREDEFINED_NOT_MUTABLE.

**Implementación (GroupManagement.jsx):**
- `deactivateGroup(id)` → PATCH `{ active: false }` a `/api/access/groups/{id}/`
- No DELETE, no retire_reason, no RETIRED state — usa PATCH `active=false`
- Formulario de create/edit solo tiene `name` y `description`, sin campo `code`

**Gaps:**
- ❌ **GAP-PERM-05 (CRÍTICO):** `deactivateGroup` usa PATCH `{ active: false }` en lugar
  de DELETE con `retire_reason`. La spec define la operación como "retirar" (soft-delete
  a `state=RETIRED`), no "desactivar". Sin `retire_reason`, sin guard de predefinidos,
  sin count de users asignados.
- ❌ **GAP-PERM-06 (CRÍTICO):** Formulario de crear grupo no tiene campo `code`. La spec
  requiere `code` con formato regex `^[a-z][a-z0-9_]+_group$` como campo obligatorio.
  GroupManagement solo toma `name` y `description` — el backend asigna code automáticamente
  o la implementación no está alineada con el spec.
- ❌ **GAP-PERM-07 (MEDIO):** No hay validación de CODE_DUPLICATE (409) en UI ni en mock
  para el endpoint `/api/access/groups/`. El mock retorna 200/201 sin verificar unicidad.
- ❌ **GAP-PERM-08 (MEDIO):** No hay guard PREDEFINED_NOT_MUTABLE — GroupManagement no
  distingue grupos predefinidos de custom al mostrar botones de editar/eliminar.

**Veredicto UC_PERM_05: PARCIAL** — crear y editar básicos funcionan pero retire usa
endpoint/semántica incorrectos y falta campo `code` en create.

---

### UC_PERM_06 — Asignar Funciones a Grupo (composición AGR)

**Spec:**
- `change_reason` obligatorio (EX-07: validation error si ausente)
- Cascade SoD validation (PASO 11) — all-or-nothing strict
- EX-08: CASCADE_SOD_VIOLATION (409) si algún user viola SoD tras el cambio

**Implementación (GroupComposition.jsx):**
- ✅ `assignFunctionsToGroup` con add/remove logic
- ✅ Cascade impact preview: `_handleGroupCascadeImpact` — muestra user count afectado
- ✅ 2-paso: preview primero, commit después

**Gaps:**
- ❌ **GAP-PERM-09 (MEDIO):** No hay campo `change_reason` en el formulario. La spec (EX-07)
  requiere `change_reason` y retorna 400 si ausente. GroupComposition envía `functionIds`
  sin reason.
- ⚠️ MENOR: Mock de `assignFunctionsToGroup` no valida `change_reason`. Coherente con
  la UI (que no lo envía).

**Veredicto UC_PERM_06: PARCIAL** — flujo principal funciona pero sin `change_reason`
obligatorio.

---

### UC_PERM_07 — Verificar Permiso de Usuario

**Spec:** `GET /api/users/{id}/permissions/check/?function={code}`. Cache lookup.
UC interno llamado por UC_PERM_08 (menu). No emite audit por escala.

**Implementación:**
- `usePermisos.ts` — implementación con `PermisosClient` (TypeScript SDK separado del main store)
- `useFilteredNavLinks()` en AppRouter — filtra navlinks por `hasPermission(permission)`

**Gaps:**
- ⚠️ MENOR: `usePermisos.ts` usa `PermisosClient` (lib externa) en lugar del store Redux.
  Es una implementación válida pero desacoplada del patrón del proyecto (Redux slices).
  No es un gap de UC ya que la funcionalidad (verificar permisos) está cubierta.
- ✅ `hasPermission()` funcionando en nav
- ✅ `useFilteredNavLinks()` filtra children individualmente

**Veredicto UC_PERM_07: CUBIERTO** — flujo de verificación funciona vía `usePermisos`.
No hay gaps de spec.

---

### UC_PERM_08 — Generar Menú Dinámico

**Spec:** `GET /api/me/menu/`. Cache con TTL 300s. Jerarquía domain→section→action filtrada
por `effective_set` del user.

**Implementación:**
- `useFilteredNavLinks()` en AppRouter usa `hasPermission()` del `usePermisos.ts` hook
- Filtra `ALL_NAV_LINKS` por permission de cada link y child
- **No llama** `GET /api/me/menu/` — construye el menú client-side desde `ALL_NAV_LINKS`

**Gaps:**
- ⚠️ MENOR/DISEÑO: La spec define `GET /api/me/menu/` como endpoint backend que construye
  la jerarquía. La implementación construye el menú completamente client-side con las rutas
  hardcoded en `ALL_NAV_LINKS`. Este es un gap de arquitectura (server-driven vs.
  client-driven menu) pero no bloquea la funcionalidad en un SPA.
  El menú se filtra correctamente por permisos del user — el resultado final es equivalente
  al especificado. No se considera un gap crítico para este WP de auditoría de UI.

**Veredicto UC_PERM_08: CUBIERTO** — menú filtrado por permisos funciona. Gap de
arquitectura (server vs. client side) es fuera de scope de esta auditoría UI.

---

### UC_PERM_09 — Auditar Acceso (write side)

**Spec:** UC interno del backend. El frontend lo invoca implícitamente al hacer mutaciones
(assign, revoke, grant). No hay componente frontend específico para UC_PERM_09.

**Implementación:**
- Todos los thunks de mutación (assignFunction, revokeFunction, grantExceptionalPermission,
  revokeExceptionalPermission, assignAccessGroup, etc.) delegan al backend que emite el AuditEvent.
- El frontend no tiene lógica de audit directo — correcto por spec.

**Veredicto UC_PERM_09: CUBIERTO** — sin gaps. UC es responsabilidad del backend; el
frontend no debe implementar lógica de audit.

---

### UC_PERM_10 — Consultar Auditoría de Permisos

**Spec:** `GET /api/audit-events/` con filtros. Cursor pagination. `view_audit_log` RBAC.

**Implementación (PermissionsAudit.jsx):**
```jsx
dispatch(fetchAccessAudit())
const permissionsLog = (allLog || []).filter((entry) =>
    PERMISSION_ACTIONS.includes(entry.action)
)
```

**Gaps:**
- ❌ **GAP-PERM-10 (MEDIO):** `PermissionsAudit.jsx` usa `fetchAccessAudit()` (mismo thunk
  del módulo Access) y filtra client-side por `PERMISSION_ACTIONS`. La spec define un
  endpoint dedicado `GET /api/audit-events/` con filtros server-side. El client-side filter
  sobre los datos de acceso mezcla la data — si el usuario carga muchos eventos, el filter
  pierde algunos (sin paginación server-side).
- ❌ **GAP-PERM-11 (MEDIO):** Las acciones en `PERMISSION_ACTIONS` son
  `['ASSIGN_PERMISSION', 'REVOKE_PERMISSION', 'ASSIGN_GROUP', 'REVOKE_GROUP']` — no coinciden
  con los event_type de la spec (`EXCEPTIONAL_PERMISSION_GRANTED`, `EXCEPTIONAL_PERMISSION_REVOKED`,
  `AGR_ASSIGNED`, `AGR_REVOKED`). La tabla mostrará siempre vacía porque el mock usa los
  nombres del spec, no los del filter.
- ⚠️ MENOR: Sin filtros en UI (actor_id, event_type, período) — solo muestra tabla.

**Veredicto UC_PERM_10: PARCIAL** — tabla existe pero filter vacío siempre (event_type
mismatch) + acoplada al thunk de Access en lugar de endpoint dedicado.

---

## Resumen de Gaps — PROVEN

| ID | UC | Severidad | Descripción |
|----|----|-----------|----|
| GAP-PERM-01 | UC_PERM_02 | MEDIO | `revoke_reason` valida ≥1 en UI (debería ≥10); mock no valida reason en DELETE |
| GAP-PERM-02 | UC_PERM_02 | MEDIO | Modal composición expandida + double-confirm en warnings.critical_revoked ausente |
| GAP-PERM-03 | UC_PERM_03 | CRÍTICO | `justification` valida ≥10 en UI pero spec dice ≥20 |
| GAP-PERM-04 | UC_PERM_04 | MEDIO | Sin campo `revoke_reason` en RevokeExceptionalPermission.jsx |
| GAP-PERM-05 | UC_PERM_05 | CRÍTICO | `deactivateGroup` usa PATCH `{active:false}` en lugar de DELETE con `retire_reason` |
| GAP-PERM-06 | UC_PERM_05 | CRÍTICO | Formulario create-group sin campo `code` (spec lo requiere con regex) |
| GAP-PERM-07 | UC_PERM_05 | MEDIO | Sin guard CODE_DUPLICATE (409) en mock ni UI |
| GAP-PERM-08 | UC_PERM_05 | MEDIO | Sin guard PREDEFINED_NOT_MUTABLE — botones editar/delete en predefinidos |
| GAP-PERM-09 | UC_PERM_06 | MEDIO | Sin campo `change_reason` en GroupComposition (spec EX-07 lo requiere) |
| GAP-PERM-10 | UC_PERM_10 | MEDIO | PermissionsAudit usa fetchAccessAudit + client-side filter (debería endpoint dedicado) |
| GAP-PERM-11 | UC_PERM_10 | MEDIO | event_type names mismatch: UI usa nombres distintos a los del spec — tabla vacía siempre |

---

## Gate 1.5 — Orden de implementación propuesto

**Prioridad crítica primero:**

1. **GAP-PERM-03** — justification min: fix en ExceptionalPermission.jsx (1 línea)
2. **GAP-PERM-05 + GAP-PERM-06 + GAP-PERM-07 + GAP-PERM-08** — GroupManagement rewrite
   (retire con reason, code field, mock guards predefinidos/duplicados)
3. **GAP-PERM-01 + GAP-PERM-04** — revoke_reason en RevokeGroup + RevokeExceptionalPermission
4. **GAP-PERM-09** — change_reason en GroupComposition
5. **GAP-PERM-10 + GAP-PERM-11** — PermissionsAudit event_type fix + endpoint correcto

UCs cubiertos sin gaps críticos (UC_PERM_01, UC_PERM_07, UC_PERM_08, UC_PERM_09): excluidos
de implementación.
