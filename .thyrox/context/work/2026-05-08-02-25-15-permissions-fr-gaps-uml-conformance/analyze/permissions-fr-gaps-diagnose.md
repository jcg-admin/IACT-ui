```yml
created_at: 2026-05-08 02:25:42
project: THYROX
work_package: 2026-05-08-02-25-15-permissions-fr-gaps-uml-conformance
phase: Phase 3 — ANALYZE
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# Análisis Profundo — Permissions FR Gaps

## GAP-1: SeparationRulesValidator no distingue HARD/SOFT

### Estado actual (PROVEN — Read tool)

`src/components/access/SeparationRulesValidator.jsx`:
- Props: `{ conflicts = [], selectedFunctions = [] }` — sin `severity` ni `onProceedAnyway`
- Todo conflicto muestra un panel rojo uniforme con badge "INCOMPATIBLE"
- Mensaje fijo al final: "No se puede proceder con conflictos de separación activos."
- No hay path para SOFT (advertencia + continuar)

`src/mocks/mockInterceptor.js`:
- `_handleSeparationRules()` devuelve reglas sin campo `severity`
- No existe handler para `POST /api/access/separation-rules/validate` en el interceptor
  — la URL `accessService.validateSeparationRules()` apunta a `/access/separation-rules/validate`
  pero el interceptor solo tiene `/api/admin/separation-rules/` para admin CRUD

`src/services/accessGateway.js`:
- `validateSeparationRules(userId, functionId)` → `POST /access/separation-rules/validate`
- Payload: sin documentación de respuesta — no hay `severity` en el tipo de conflicto

### Cambios necesarios

**A) `SeparationRulesValidator.jsx`**

Agregar prop `onProceedAnyway` (callback opcional). Lógica:
- Determinar si `hasHard = conflicts.some(c => c.severity === 'HARD')`
- Si `hasHard`: bloquear completamente (panel rojo, mensaje "No se puede proceder")
- Si solo SOFT: panel amarillo + botón "Entendido, proceder" → llama `onProceedAnyway()`
- Badge por conflicto: `HARD` (rojo) / `SOFT` (amarillo) en lugar de "INCOMPATIBLE" para todos

Colores:
- HARD: `backgroundColor: '#7f1d1d'`, border `#dc2626`, badge `#fca5a5`
- SOFT: `backgroundColor: '#78350f'`, border `#d97706`, badge `#fde68a`

**B) `src/mocks/mockInterceptor.js`**

Agregar handler para `POST /api/access/separation-rules/validate`:
```js
if (url.includes('/api/access/separation-rules/validate') && method === 'POST') {
  return this._handleValidateSeparationRules(body);
}
```

Handler devuelve conflicts con `severity: 'HARD' | 'SOFT'`:
```js
_handleValidateSeparationRules(body) {
  // Simular: si body.function_ids incluye funciones de auditoria → HARD conflict
  // Para testing: usuario con id ending in '9' recibe SOFT conflict
  return {
    status: 200,
    data: {
      valid: true,
      conflicts: [],
    }
  };
}
```

**C) Archivos existentes con dependencia de prop `conflicts` shape**

`src/pages/access/AssignFunctions.jsx` — usa `SeparationRulesValidator` con `conflicts` del store.
Al agregar `severity` al mock, los conflictos existentes empezarán a tener `severity` — el componente
manejará `undefined` como HARD por defecto.

### Archivos a cambiar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/components/access/SeparationRulesValidator.jsx` | Modificar — agregar HARD/SOFT UI paths |
| `src/mocks/mockInterceptor.js` | Modificar — agregar handler validate, agregar severity a reglas |
| `src/components/access/__tests__/SeparationRulesValidator.test.jsx` | Crear o modificar tests |

---

## GAP-2: AssignGroup.jsx no pre-valida separación antes del POST

### Estado actual (PROVEN — Read tool)

`src/pages/access/AssignGroup.jsx` líneas 31-35:
```js
function handleSubmit(e) {
  e.preventDefault()
  if (!userId.trim() || !groupId) return
  dispatch(assignGroupToUser({ userId: userId.trim(), groupId, expiresAt: expiresAt || null }))
}
```
No hay step de pre-validación. El error solo se ve post-POST si el backend devuelve 422.

`src/redux/slices/access.js` línea 145:
```js
export const validateSeparationRules = createAsyncThunk(
  'access/validateSeparationRules',
  async ({ userId, functionPk }, { rejectWithValue }) => {...}
)
```
Este thunk valida por `functionPk` (función individual). Para AGR necesitamos
validar el conjunto efectivo: funciones actuales del usuario + todas las funciones del AGR seleccionado.

### Cambios necesarios

**A) Nuevo endpoint mock para validación de AGR**

En `mockInterceptor.js`, agregar handler:
```
POST /api/access/groups/{groupId}/validate-for-user
Body: { user_id: "..." }
Response: { valid: true|false, conflicts: [...], cascade_affected: 0 }
```

**B) Nuevo thunk en `access.js`**

```js
export const validateGroupAssignment = createAsyncThunk(
  'access/validateGroupAssignment',
  async ({ userId, groupId }, { rejectWithValue }) => {
    try {
      return await accessService.validateGroupAssignment(userId, groupId);
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
    }
  }
);
```

**C) Nuevo método en `accessGateway.js`**

```js
async validateGroupAssignment(userId, groupId) {
  const response = await fetch(`${API_BASE_URL}/access/groups/${groupId}/validate-for-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  // ... error handling
}
```

**D) `AssignGroup.jsx` — flujo de 2 pasos**

```
Step 1: usuario selecciona userId + groupId → "Verificar"
Step 2a: sin conflictos → mostrar "Sin conflictos, proceder" → submit normal
Step 2b: solo SOFT → SeparationRulesValidator con onProceedAnyway → submit si confirma
Step 2c: HARD → SeparationRulesValidator bloqueante → no submit
```

Estado local nuevo: `step: 'form' | 'review'`, `validationResult: null | {valid, conflicts}`

### Archivos a cambiar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/access/AssignGroup.jsx` | Modificar — flujo 2 pasos |
| `src/redux/slices/access.js` | Modificar — agregar `validateGroupAssignment` thunk |
| `src/services/accessGateway.js` | Modificar — agregar `validateGroupAssignment` |
| `src/mocks/mockInterceptor.js` | Modificar — agregar handler groups/{id}/validate-for-user |
| `src/pages/access/__tests__/AssignGroupPage.test.jsx` | Modificar — agregar tests del flujo 2 pasos |

---

## GAP-3: Sin página para UC_PERM_03 "Conceder Permiso Excepcional"

### Estado actual (PROVEN — Read tool + grep)

El router `AppRouter.jsx` línea 807:
```js
{/* Permisos — UC-PERM-03: permisos temporales (misma página que /access/temp-permissions) */}
<Route path="/permissions/temp-permissions" element={...TemporaryPermissionsPage...} />
```

Este mapeo es incorrecto. UC_PERM_03 es "Conceder Permiso Excepcional" (FR-014-01/02), no
"Permisos Temporales" (UC_ACC_08). `TemporaryPermissions.jsx` cubre UC_ACC_08.

Diferencias críticas UC_ACC_08 vs UC_PERM_03:

| Aspecto | UC_ACC_08 (TemporaryPermissions.jsx) | UC_PERM_03 (no existe) |
|---------|--------------------------------------|------------------------|
| Endpoint | `assignFunction` con expiresAt | `POST /api/users/{id}/exceptional-permissions/` |
| Justificación | No | Sí — obligatoria, no vacía |
| Anti-self P-11 | No | Sí — invoker ≠ target_user |
| Validación separación | No | Sí — conjunto efectivo post-concesión |
| Notificación supervisor | No | Sí — InternalMessage obligatorio |
| AuditEvent | Genérico | `EXCEPTIONAL_PERMISSION_GRANTED` high-priority |

`src/permissions/catalog.js` línea 67: `// MOD_Access — extended (UC_PERM_02, UC_PERM_03)` — los
códigos GRANT_EXCEPTIONAL y REVOKE_EXCEPTIONAL ya existen en el catálogo.

### Cambios necesarios

**A) Nueva página `src/pages/permissions/ExceptionalPermission.jsx`**

Secciones:
1. Header: "Conceder Permiso Excepcional — UC_PERM_03"
2. Formulario:
   - `targetUserId` (select o input) — con validación anti-self al cambiar
   - `permissionCode` (select — funciones del catálogo)
   - `justification` (textarea — obligatorio, minLength 10)
   - `expiresAt` (date+time — required, within MAX_EXCEPTIONAL_DAYS from today)
3. Warning anti-self: banner si targetUserId === currentUserId
4. Resultado de validación separación (SeparationRulesValidator si conflictos)
5. Submit: POST con los 4 campos

Estado local: `{ step: 'form'|'review', conflicts: [], antiSelfError: false }`

**B) Mock endpoint en `mockInterceptor.js`**

```js
if (url.match(/\/api\/users\/\d+\/exceptional-permissions\/$/) && method === 'POST') {
  return this._handleGrantExceptionalPermission(url, body);
}
```

Handler:
```js
_handleGrantExceptionalPermission(url, body) {
  const userId = parseInt(url.match(/\/api\/users\/(\d+)\//)[1]);
  if (!body.justification || body.justification.trim().length === 0) {
    return this._error(422, 'justification required');
  }
  if (!body.expires_at) {
    return this._error(422, 'expires_at required');
  }
  return {
    status: 201,
    data: {
      id: Date.now(),
      user_id: userId,
      permission_code: body.permission_code,
      justification: body.justification,
      expires_at: body.expires_at,
      granted_at: new Date().toISOString(),
      supervisor_notified: true,
      audit_event: 'EXCEPTIONAL_PERMISSION_GRANTED',
    }
  };
}
```

**C) Nuevo thunk en permissions slice (o access slice)**

Verificar si existe `src/redux/slices/permissions.js`. Si no, agregar `grantExceptionalPermission`
thunk en `access.js`.

**D) AppRouter.jsx — corregir ruta y agregar nueva**

```js
// Corrección: UC-PERM-03 → ExceptionalPermission (no TemporaryPermissions)
const ExceptionalPermissionPage = lazy(() => import('@screens/permissions/ExceptionalPermission'))

// Ruta:
<Route path="/permissions/exceptional-permission" element={
  <ProtectedRoute permission={FunctionCatalog.GRANT_EXCEPTIONAL}>
    <Suspense fallback={<RouteLoadingFallback />}>
      <ExceptionalPermissionPage />
    </Suspense>
  </ProtectedRoute>
} />
```

La ruta `/permissions/temp-permissions` puede mantenerse como alias o actualizarse en el nav.

**E) SidebarNav — link al nuevo item**

En AppRouter.jsx línea donde se definen los nav links de permissions, agregar/actualizar entry.

### Archivos a cambiar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/permissions/ExceptionalPermission.jsx` | Crear |
| `src/pages/permissions/__tests__/ExceptionalPermissionPage.test.jsx` | Crear |
| `src/mocks/mockInterceptor.js` | Modificar — agregar handler |
| `src/redux/slices/access.js` | Modificar — agregar thunk (o crear permissions slice) |
| `src/services/accessGateway.js` | Modificar — agregar `grantExceptionalPermission` |
| `src/router/AppRouter.jsx` | Modificar — agregar ruta + lazy import |

---

## GAP-4: Sin página para UC-015 "Revocar Permiso Excepcional"

### Estado actual (PROVEN — grep + ls)

No existe ningún archivo relacionado con revocación de permisos excepcionales.
Solo existe `RevokeGroup.jsx` para UC-PERM-02 (revocar grupo).

`mockInterceptor.js` línea 125: solo tiene DELETE `/api/users/{id}/access-groups/{id}` (revocar grupo).
No hay handler para `DELETE /api/users/{id}/exceptional-permissions/{ep_id}`.

### Cambios necesarios

**A) Nueva página `src/pages/permissions/RevokeExceptionalPermission.jsx`**

Flujo:
1. Campo userId para seleccionar usuario
2. Fetch de permisos excepcionales activos: `GET /api/users/{id}/exceptional-permissions/`
3. Tabla de permisos activos con: código, justificación, expires_at, otorgado_por
4. Botón "Revocar" por permiso → confirm dialog → DELETE

**B) Mock endpoints en `mockInterceptor.js`**

```js
if (url.match(/\/api\/users\/\d+\/exceptional-permissions\/$/) && method === 'GET') {
  return this._handleListExceptionalPermissions(url);
}
if (url.match(/\/api\/users\/\d+\/exceptional-permissions\/\d+\/$/) && method === 'DELETE') {
  return this._handleRevokeExceptionalPermission();
}
```

**C) Thunks en `access.js`**

```js
export const fetchExceptionalPermissions = createAsyncThunk(...)
export const revokeExceptionalPermission = createAsyncThunk(...)
```

**D) `accessGateway.js`**

```js
async getExceptionalPermissions(userId) { ... GET /api/users/{userId}/exceptional-permissions/ }
async revokeExceptionalPermission(userId, permissionId) { ... DELETE }
```

**E) `AppRouter.jsx`**

```js
const RevokeExceptionalPermissionPage = lazy(() =>
  import('@screens/permissions/RevokeExceptionalPermission'))

<Route path="/permissions/revoke-exceptional"
  element={<ProtectedRoute permission={FunctionCatalog.REVOKE_EXCEPTIONAL}>
    <RevokeExceptionalPermissionPage />
  </ProtectedRoute>}
/>
```

### Archivos a cambiar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/permissions/RevokeExceptionalPermission.jsx` | Crear |
| `src/pages/permissions/__tests__/RevokeExceptionalPermissionPage.test.jsx` | Crear |
| `src/mocks/mockInterceptor.js` | Modificar — 2 handlers |
| `src/redux/slices/access.js` | Modificar — 2 thunks |
| `src/services/accessGateway.js` | Modificar — 2 métodos |
| `src/router/AppRouter.jsx` | Modificar — ruta + lazy import |

---

## GAP-5: GroupComposition.jsx no muestra cascade_affected_user_count

### Estado actual (PROVEN — Read tool)

`src/pages/access/GroupComposition.jsx` líneas 91-103:
```js
const handleConfirmAdd = async () => {
  if (!selectedGroupId || pendingAdd.length === 0) return;
  const newIds = Array.from(new Set([...assignedIds, ...pendingAdd]));
  setSubmitting(true);
  try {
    await dispatch(assignFunctionsToGroup({ groupId: selectedGroupId, functionIds: newIds }));
    dispatch(fetchGroupFunctions(selectedGroupId));
    setSelectorOpen(false);
    setPendingAdd([]);
  } finally { setSubmitting(false); }
};
```

No hay step de preview ni `cascade_affected_user_count`.

### Cambios necesarios

**A) Nuevo endpoint mock**

```
GET /api/access/groups/{groupId}/cascade-impact?add_function_ids=f1,f2
Response: { cascade_affected_user_count: 3, conflicts: [...] }
```

**B) Thunk o service call directo en GroupComposition.jsx**

Antes de `handleConfirmAdd`, llamar preview:
1. Si `cascade_affected_user_count > 0`: mostrar en el modal de confirmación
2. Si hay conflicts (422 post-submit): mostrar per-user conflict details

**C) Modificar el modal de confirmación**

En el modal, antes de "Agregar (N)", mostrar el impacto:
```
⚠️ Esta acción afectará 3 usuarios. ¿Continuar?
```

Si hay cascade conflicts después del submit, mostrar el detalle de qué usuarios tienen conflicto.

**D) `accessGateway.js`**

```js
async getGroupCascadeImpact(groupId, addFunctionIds) {
  const params = addFunctionIds.join(',');
  const response = await fetch(
    `${API_BASE_URL}/access/groups/${groupId}/cascade-impact?add_function_ids=${params}`
  );
  // ...
}
```

### Archivos a cambiar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/access/GroupComposition.jsx` | Modificar — preview step en modal |
| `src/mocks/mockInterceptor.js` | Modificar — agregar cascade-impact handler |
| `src/services/accessGateway.js` | Modificar — agregar `getGroupCascadeImpact` |
| `src/pages/access/__tests__/GroupCompositionPage.test.jsx` | Modificar — tests del cascade |

---

## GAP-6: Label "SoD" en ComplianceReport.jsx (cosmético)

### Estado actual (PROVEN — Read tool)

`src/pages/audit/ComplianceReport.jsx` línea 47:
```js
{ name: 'Segregación de Deberes (SoD)', status: 'COMPLIANT', violations: 0, percentage: 100 },
```

### Cambio necesario

Línea 47: cambiar string de display.

```js
{ name: 'Separación de Funciones', status: 'COMPLIANT', violations: 0, percentage: 100 },
```

### Archivos a cambiar

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/pages/audit/ComplianceReport.jsx` | Modificar — 1 string, línea 47 |

---

## Dependencias entre gaps

```
GAP-1 (SeparationRulesValidator HARD/SOFT)
  ↓ usa
GAP-2 (AssignGroup pre-validación) — usa el componente actualizado del GAP-1
GAP-3 (ExceptionalPermission) — usa SeparationRulesValidator para conflictos post-concesión

GAP-2 requiere: validateGroupAssignment endpoint (nuevo) + thunk (nuevo)
GAP-3 requiere: grantExceptionalPermission endpoint (nuevo) + thunk (nuevo)
GAP-4 requiere: fetchExceptionalPermissions + revokeExceptionalPermission (nuevos)
GAP-5 requiere: getGroupCascadeImpact (nuevo service + mock)
GAP-6: independiente, trivial
```

## Orden de implementación propuesto

1. **GAP-6** — trivial, sin dependencias (1 línea)
2. **GAP-1** — base para otros gaps (SeparationRulesValidator HARD/SOFT)
3. **GAP-2** — usa GAP-1, flujo de assign-group
4. **GAP-5** — cascade en GroupComposition
5. **GAP-3** — página nueva más compleja, usa GAP-1 (SeparationRulesValidator)
6. **GAP-4** — página nueva, más simple que GAP-3

## Estimación de impacto en tests

| Gap | Tests nuevos estimados |
|-----|------------------------|
| GAP-1 | 4-6 tests (HARD block, SOFT warn, SOFT proceed, no conflicts) |
| GAP-2 | 6-8 tests (form step, validation step, HARD block, SOFT confirm, submit success) |
| GAP-3 | 8-10 tests (render, anti-self, justification validation, expires_at, submit, 201) |
| GAP-4 | 5-6 tests (list, revoke confirm, revoke success) |
| GAP-5 | 4-5 tests (cascade preview, cascade count display, cascade conflict) |
| GAP-6 | 0 (string change, existing test verifica render) |
| **Total** | ~30-35 tests nuevos |

Suite actual: 1799 tests. Post-implementación: ~1830-1834.
