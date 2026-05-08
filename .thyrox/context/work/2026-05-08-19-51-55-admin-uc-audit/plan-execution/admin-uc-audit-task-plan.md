```yml
created_at: 2026-05-08 19:55:00
project: IACT-UI
work_package: 2026-05-08-19-51-55-admin-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — admin-uc-audit

**8 gaps → 19 tareas atómicas · 6 bloques · DAG lineal por bloque · Bloques I/III/V paralelos entre sí**

---

## Decisiones de diseño

**D-01 — AGR Composition UI:** Tab "Composición" en AGRCatalog.jsx (patrón
MenuItemCatalog con tabs). `selectedAgrId` state → panel inline. Patrón
consistente con el resto de la codebase; evita modal separado.

**D-02 — bulkReorder UI:** Botón "Modo reordenar" en catalog tab activa inputs
numéricos de `display_order` por fila. "Guardar orden" envía batch. Más simple
que drag-and-drop y suficiente para la spec CA-08.

**D-03 — Error display patrón:** Todos los formularios que pueden recibir error
del backend usarán `.unwrap()` + catch con `setFormError`. No más `if (!result.error)`.
Consistente con AlertAcknowledge (L-01 del WP anterior).

**D-04 — mock _systemGroupFunctions:** `new Map()` inicializada en constructor con
composiciones default para los 10 AGRs. Estado mutable dentro de la instancia (como
`_acknowledgedAlerts`). Se resetea en cada page reload (comportamiento esperado en dev).

**D-05 — block-archive mock:** `_blockedMenuItems = new Set()` en constructor.
Validación de `block_reason.length >= 20` en el handler antes de agregar al Set.

**D-06 — publish-inactive mock:** `_inactiveFunctionsByItemId = new Set()` de IDs de
items cuya función está inactiva. Default vacío. Se controla desde tests vía mock
del dispatch con `.unwrap()` → rejección 422.

---

## DAG de dependencias por bloque

```
Block I (GAP-ADM-03):
T-001 → T-002 → T-003 → T-004 → T-005

Block II (GAP-ADM-01):
T-006 → T-007 → T-008

Block III (GAP-ADM-04-BULKREORDER):
T-009 → T-010 → T-011 → T-012

Block IV (GAP-ADM-04-ARCHIVED + GAP-ADM-05-PUBLISH):
T-013 → T-014

Block V (GAP-ADM-05-BLOCKARCHIVE):
T-015 → T-016 → T-017 → T-018

Block VI (GAP-ADM-02-FILTER):
T-019 (independiente — sin dependencias)
```

Bloques I, II, III, V, VI son independientes entre sí.
Block IV puede correr en paralelo con Block II o III.

---

## Block I — GAP-ADM-03: Composición de AGR de sistema (ALTA)

- [ ] [T-001] **mockInterceptor.js — State + handlers system-groups**

  Constructor: añadir `this._systemGroupFunctions = new Map()` con composiciones
  default:
  ```js
  const defaultCompositions = {
    1: ['pipeline:view_status', 'pipeline:execute'],
    2: ['reports:view', 'reports:export', 'reports:kpis'],
    3: ['audit:view', 'audit:search', 'audit:compliance'],
    4: [],  // sin funciones por default
    5: ['alerts:view', 'alerts:acknowledge'],
    6: ['users:view', 'users:manage', 'users:create'],
    7: ['access:assign', 'access:revoke', 'access:view'],
    8: ['audit:view', 'audit:export'],
    9: ['pipeline:execute', 'pipeline:stop'],
    10: ['adm:manage_functions', 'adm:manage_catalog'],
  }
  Object.entries(defaultCompositions).forEach(([id, fns]) =>
    this._systemGroupFunctions.set(parseInt(id), new Set(fns))
  )
  ```

  Routing en `intercept()` — ANTES del bloque `/api/admin/agr/`:
  ```js
  // UC-ADM-03 — impact preview
  if (url.match(/\/api\/admin\/system-groups\/(\d+)\/impact\//) && method === 'GET') {
    return this._handleAGRImpact(url)
  }
  // UC-ADM-03 — remove specific function (DELETE con ID en URL)
  if (url.match(/\/api\/admin\/system-groups\/(\d+)\/functions\/([^/]+)\//) && method === 'DELETE') {
    return this._handleAGRRemoveFunction(url)
  }
  // UC-ADM-03 — list + add functions (GET/POST)
  if (url.match(/\/api\/admin\/system-groups\/(\d+)\/functions\//)) {
    return this._handleAGRFunctions(url, method, body)
  }
  ```

  Handlers nuevos:
  ```js
  _handleAGRFunctions(url, method, body) {
    const id = parseInt(url.match(/\/system-groups\/(\d+)\//)[1])
    const fns = this._systemGroupFunctions.get(id) || new Set()
    if (method === 'GET') {
      return { status: 200, data: { functions: [...fns], count: fns.size } }
    }
    if (method === 'POST') {
      const codename = body?.function_codename
      if (!codename) return this._error(400, 'function_codename required')
      if (fns.has(codename)) return { status: 409, data: { error: 'Función ya asignada al AGR', code: 'ALREADY_ASSIGNED' } }
      fns.add(codename)
      this._systemGroupFunctions.set(id, fns)
      return { status: 201, data: { agr_id: id, function_codename: codename, assigned_at: new Date().toISOString() } }
    }
    return this._error(405, 'Method not allowed')
  }

  _handleAGRRemoveFunction(url) {
    const match = url.match(/\/system-groups\/(\d+)\/functions\/([^/]+)\//)
    const groupId = parseInt(match[1])
    const codename = match[2]
    const fns = this._systemGroupFunctions.get(groupId)
    if (fns) fns.delete(codename)
    return { status: 204, data: null }
  }

  _handleAGRImpact(url) {
    const id = parseInt(url.match(/\/system-groups\/(\d+)\//)[1])
    const fns = this._systemGroupFunctions.get(id) || new Set()
    return {
      status: 200,
      data: {
        agr_id: id,
        affected_users: fns.size * 2,   // mock heurístico
        preview_function_count: fns.size,
        functions_preview: [...fns].slice(0, 5),
      },
    }
  }
  ```
  *(GAP-ADM-03)*

- [ ] [T-002] **adminGateway.js — Métodos composición AGR**

  Añadir en la clase `AdminService`, debajo del bloque AGRs existente:
  ```js
  // ── Composición de AGR de sistema (UC-ADM-03) ────────────────────────────

  async getAGRComposition(agrId) {
    return apiService.get(`/api/admin/system-groups/${agrId}/functions/`)
  }

  async addFunctionToAGR(agrId, functionCodename) {
    return apiService.post(`/api/admin/system-groups/${agrId}/functions/`, {
      function_codename: functionCodename,
    })
  }

  async removeFunctionFromAGR(agrId, functionCodename) {
    return apiService.delete(`/api/admin/system-groups/${agrId}/functions/${functionCodename}/`)
  }

  async getAGRImpact(agrId) {
    return apiService.get(`/api/admin/system-groups/${agrId}/impact/`)
  }
  ```

  Verificar que `apiService` expone `.delete()`. Si no, usar
  `apiService.request('DELETE', url)` o equivalent.
  *(GAP-ADM-03)*

- [ ] [T-003] **admin.js slice — Thunks + estado composición**

  Añadir al `initialState`:
  ```js
  systemGroupCompositions: {},   // { [agrId]: { functions: [], impact: null, loading: false, error: null } }
  ```

  Thunks nuevos (patrón idéntico a los existentes):
  ```js
  export const fetchAGRComposition = createAsyncThunk(
    'admin/fetchAGRComposition',
    async (agrId, { rejectWithValue }) => { ... return adminService.getAGRComposition(agrId) }
  )
  export const addFunctionToAGR = createAsyncThunk(
    'admin/addFunctionToAGR',
    async ({ agrId, functionCodename }, { rejectWithValue }) => { ... }
  )
  export const removeFunctionFromAGR = createAsyncThunk(
    'admin/removeFunctionFromAGR',
    async ({ agrId, functionCodename }, { rejectWithValue }) => { ... }
  )
  export const fetchAGRImpact = createAsyncThunk(
    'admin/fetchAGRImpact',
    async (agrId, { rejectWithValue }) => { ... return adminService.getAGRImpact(agrId) }
  )
  ```

  `extraReducers` para cada thunk:
  - `fetchAGRComposition.fulfilled`: `state.systemGroupCompositions[agrId].functions = payload.functions`
  - `addFunctionToAGR.fulfilled`: push codename al array de functions del agrId correspondiente
  - `removeFunctionFromAGR.fulfilled`: filter out el codename
  - `fetchAGRImpact.fulfilled`: `state.systemGroupCompositions[agrId].impact = payload`
  - Todos los `.rejected`: setear error en el substate del agrId

  Selectores:
  ```js
  export const selectAGRComposition = (agrId) => (state) =>
    state.admin.systemGroupCompositions[agrId] ?? { functions: [], impact: null }
  ```
  *(GAP-ADM-03)*

- [ ] [T-004] **AGRCatalog.jsx — Tab "Composición"**

  Convertir AGRCatalog de página plana a layout con tabs `['catalog', 'composition']`
  (mismo patrón que MenuItemCatalog). Tab actual de CRUD pasa a ser "Catálogo".

  Tab "Composición":
  ```jsx
  // Estado adicional en el componente
  const [selectedAgrId, setSelectedAgrId] = useState(null)
  const [addCodename, setAddCodename] = useState('')
  const [compositionError, setCompositionError] = useState(null)

  // Selector dinámico
  const composition = useSelector(selectAGRComposition(selectedAgrId))
  ```

  UI del tab "Composición":
  1. Tabla de AGRs con columnas: Codename / Nombre / Funciones (count) / Botón "Gestionar"
  2. Cuando `selectedAgrId !== null`:
     - Panel inline (debajo de la tabla) con heading `Composición: {agr.name}`
     - Sección "Impacto": "X usuarios afectados" (desde `composition.impact`)
     - Lista de funciones actuales: `<code>codename</code>` + botón "Remover" por fila
       - `aria-label={Remover ${codename} del AGR}`
       - onClick → dispatch `removeFunctionFromAGR({ agrId: selectedAgrId, functionCodename: codename })`
     - Sección "Agregar función":
       - Input con `aria-label="Codename de función a agregar"` + placeholder "modulo:accion"
       - Botón "Agregar" (siempre habilitado — el backend valida)
       - onClick → async, `.unwrap()`, catch error → `setCompositionError(err.message)`
       - Si error: `<div role="alert">{compositionError}</div>`
     - Botón "Cerrar panel" → `setSelectedAgrId(null)`

  Al hacer click en "Gestionar" de un AGR:
  ```js
  const handleSelectAGR = (agr) => {
    setSelectedAgrId(agr.id)
    setCompositionError(null)
    dispatch(fetchAGRComposition(agr.id))
    dispatch(fetchAGRImpact(agr.id))
  }
  ```
  *(GAP-ADM-03)*

- [ ] [T-005] **Tests — AGR composition**

  Crear `src/pages/admin/__tests__/AGRComposition.test.jsx`.

  Setup mock: añadir a `admin` state `systemGroupCompositions: { 1: { functions: ['pipeline:view_status', 'pipeline:execute'], impact: { affected_users: 4 } } }`.
  Añadir al mock del slice: `fetchAGRComposition`, `fetchAGRImpact`, `addFunctionToAGR`, `removeFunctionFromAGR`, `selectAGRComposition`.

  Tests requeridos:
  (a) Tab "Composición" está presente en la página
  (b) Click "Gestionar" en un AGR → dispatcha `fetchAGRComposition` y `fetchAGRImpact`
  (c) Panel muestra funciones de la composición actual
  (d) Panel muestra cuenta de usuarios afectados (impact)
  (e) Click "Remover" en función → dispatcha `removeFunctionFromAGR`
  (f) Submit "Agregar función" → dispatcha `addFunctionToAGR` con codename correcto
  (g) Error 409 desde unwrap → muestra `role="alert"` con mensaje de error
  (h) "Cerrar panel" → `selectedAgrId` vuelve a null
  *(GAP-ADM-03)*

---

## Block II — GAP-ADM-01: Validación disjunción SoD + display de errores

- [ ] [T-006] **mockInterceptor.js — Validación disjunción en `_handleAdminSeparationRules`**

  En el handler POST (antes de construir `newRule`):
  ```js
  if (method === 'POST') {
    const groupA = body?.group_a ?? []
    const groupB = body?.group_b ?? []
    const intersection = groupA.filter(f => groupB.includes(f))
    if (intersection.length > 0) {
      return {
        status: 400,
        data: {
          error: 'Los grupos A y B no pueden tener funciones en común',
          code: 'NON_DISJOINT_GROUPS',
          overlap: intersection,
        },
      }
    }
    // ... resto del POST handler
  }
  ```

  También en PUT (actualización):
  ```js
  if (method === 'PUT') {
    const groupA = body?.group_a ?? []
    const groupB = body?.group_b ?? []
    const intersection = groupA.filter(f => groupB.includes(f))
    if (intersection.length > 0) {
      return { status: 400, data: { error: 'Los grupos A y B no pueden tener funciones en común', code: 'NON_DISJOINT_GROUPS', overlap: intersection } }
    }
    return { status: 200, data: { ...rule, ...body } }
  }
  ```
  *(GAP-ADM-01)*

- [ ] [T-007] **SeparationRulesCatalog.jsx — Validación client-side + display de errores**

  1. Añadir estado `[formError, setFormError] = useState(null)`.

  2. Añadir div de error en el JSX del formulario (antes de `<div className="form-actions">`):
  ```jsx
  {formError && (
    <div className="error-banner" role="alert" style={{ marginBottom: '12px' }}>
      {formError}
    </div>
  )}
  ```

  3. En `handleSubmit`, antes del dispatch, añadir validación client-side:
  ```js
  const handleSubmit = async (e) => {
    e.preventDefault()
    const groupAArr = form.group_a.split(',').map(s => s.trim()).filter(Boolean)
    const groupBArr = form.group_b.split(',').map(s => s.trim()).filter(Boolean)
    const overlap = groupAArr.filter(f => groupBArr.includes(f))
    if (overlap.length > 0) {
      setFormError(`Los grupos A y B no pueden tener funciones en común: ${overlap.join(', ')}`)
      return
    }
    setFormError(null)
    const payload = { ...form, group_a: groupAArr, group_b: groupBArr }
    try {
      if (editingRule) {
        await dispatch(updateSeparationRule({ id: editingRule.id, data: payload })).unwrap()
      } else {
        await dispatch(createSeparationRule(payload)).unwrap()
      }
      setShowForm(false)
      setFeedback({ type: 'success', msg: editingRule ? 'Regla actualizada' : 'Regla creada' })
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setFormError(err?.message || 'Error al guardar la regla')
    }
  }
  ```

  4. Al abrir el formulario (create o edit), resetear `setFormError(null)`.
  *(GAP-ADM-01)*

- [ ] [T-008] **Tests — SoD form validation**

  Añadir casos en `SeparationRulesCatalogPage.test.jsx` (o nuevo
  `src/pages/admin/__tests__/SeparationRulesValidation.test.jsx` si el archivo es grande).

  Setup: `mockDispatch.mockImplementation(action => ({ ...action, unwrap: () => Promise.resolve({ id: 99 }) }))`

  Tests requeridos:
  (a) Formulario create con group_a y group_b con función en común → muestra `role="alert"` con mensaje "no pueden tener funciones en común" y NO dispatcha
  (b) Formulario create con grupos disjuntos → dispatcha `createSeparationRule` sin error
  (c) Error backend (unwrap rechaza con `{ message: 'Error remoto' }`) → muestra el mensaje en el formulario, modal permanece abierto
  (d) Al abrir "Nueva regla" por segunda vez (después de un error previo) → error anterior limpiado
  *(GAP-ADM-01)*

---

## Block III — GAP-ADM-04-BULKREORDER: Bulk reorder de MenuItems

- [ ] [T-009] **mockInterceptor.js + adminGateway.js — Endpoint bulk-reorder**

  **mockInterceptor.js** — Routing ANTES del bloque genérico `/api/admin/menu-items/`:
  ```js
  // UC-ADM-04 CA-08: bulk reorder atómico
  if (url.includes('/api/admin/menu-items/bulk-reorder/') && method === 'PATCH') {
    return this._handleMenuItemsBulkReorder(body)
  }
  ```

  Handler:
  ```js
  _handleMenuItemsBulkReorder(body) {
    const items = body?.items ?? []
    if (!Array.isArray(items) || items.length === 0) {
      return this._error(400, 'items array required')
    }
    const validIds = new Set(this._menuItemsData().map(i => i.id))
    const invalidIds = items.filter(i => !validIds.has(i.id)).map(i => i.id)
    if (invalidIds.length > 0) {
      return { status: 422, data: { error: 'invalid_ids', invalid_ids: invalidIds } }
    }
    const updated = items.map(({ id, display_order }) => ({
      ...this._menuItemsData().find(i => i.id === id),
      display_order,
    }))
    return { status: 200, data: { items: updated, audit: 'MENU_ITEM_BULK_REORDERED' } }
  }
  ```

  **adminGateway.js** — Añadir método en bloque MenuItems:
  ```js
  async bulkReorderMenuItems(items) {
    // items: [{ id, display_order }, ...]
    return apiService.patch('/api/admin/menu-items/bulk-reorder/', { items })
  }
  ```
  *(GAP-ADM-04-BULKREORDER)*

- [ ] [T-010] **admin.js slice — `bulkReorderMenuItems` thunk + reducer**

  Thunk:
  ```js
  export const bulkReorderMenuItems = createAsyncThunk(
    'admin/bulkReorderMenuItems',
    async (items, { rejectWithValue }) => {
      try {
        return await adminService.bulkReorderMenuItems(items)
      } catch (error) {
        return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
      }
    }
  )
  ```

  `extraReducers`:
  ```js
  builder
    .addCase(bulkReorderMenuItems.fulfilled, (state, action) => {
      const updated = action.payload?.items ?? []
      updated.forEach(({ id, display_order }) => {
        const item = state.menuItems.find(i => i.id === id)
        if (item) item.display_order = display_order
      })
    })
    .addCase(bulkReorderMenuItems.rejected, (state, action) => {
      state.error = action.payload
    })
  ```
  *(GAP-ADM-04-BULKREORDER)*

- [ ] [T-011] **MenuItemCatalog.jsx — UI de reordenamiento en catalog tab**

  Añadir estado en el componente:
  ```js
  const [reorderMode, setReorderMode] = useState(false)
  const [orderValues, setOrderValues] = useState({})  // { [id]: display_order }
  const [reorderError, setReorderError] = useState(null)
  ```

  Cuando `reorderMode` se activa, inicializar `orderValues` desde `items`:
  ```js
  const enterReorderMode = () => {
    setOrderValues(Object.fromEntries(items.map(i => [i.id, i.display_order])))
    setReorderMode(true)
  }
  ```

  En el catalog tab, añadir botón "Reordenar" (junto a "Nuevo item"):
  ```jsx
  {!reorderMode && (
    <button className="btn btn-secondary" onClick={enterReorderMode} style={{ marginBottom: '12px' }}>
      Reordenar
    </button>
  )}
  ```

  Cuando `reorderMode === true`, la columna "Orden" de la tabla muestra inputs:
  ```jsx
  <td>
    {reorderMode ? (
      <input
        type="number"
        value={orderValues[item.id] ?? item.display_order}
        onChange={e => setOrderValues(v => ({ ...v, [item.id]: parseInt(e.target.value, 10) }))}
        style={{ width: '60px' }}
        aria-label={`Orden de ${item.label}`}
      />
    ) : (
      item.display_order
    )}
  </td>
  ```

  Debajo de la tabla (solo cuando `reorderMode`):
  ```jsx
  {reorderMode && (
    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      {reorderError && <div role="alert" style={{ color: 'red' }}>{reorderError}</div>}
      <button className="btn btn-primary" onClick={handleSaveOrder}>Guardar orden</button>
      <button className="btn btn-secondary" onClick={() => { setReorderMode(false); setReorderError(null) }}>Cancelar</button>
    </div>
  )}
  ```

  Handler:
  ```js
  const handleSaveOrder = async () => {
    const payload = items.map(i => ({ id: i.id, display_order: orderValues[i.id] ?? i.display_order }))
    try {
      await dispatch(bulkReorderMenuItems(payload)).unwrap()
      setReorderMode(false)
      showFeedback('Orden actualizado')
    } catch (err) {
      setReorderError(err?.message || 'Error al guardar el orden')
    }
  }
  ```
  *(GAP-ADM-04-BULKREORDER)*

- [ ] [T-012] **Tests — Bulk reorder**

  Añadir casos en `MenuItemCatalogPage.test.jsx` o nuevo `MenuItemBulkReorder.test.jsx`.

  Setup: `bulkReorderMenuItems: jest.fn((items) => ({ type: 'admin/bulkReorderMenuItems', payload: items }))` en el mock del slice.
  `mockDispatch.mockImplementation(action => ({ ...action, unwrap: () => Promise.resolve({ items: [] }) }))`

  Tests requeridos:
  (a) Click "Reordenar" muestra inputs de orden por fila
  (b) Click "Cancelar" en modo reordenar → oculta inputs, vuelve a valores originales
  (c) Click "Guardar orden" → dispatcha `bulkReorderMenuItems` con array de `{id, display_order}` de todos los items
  (d) Error 422 desde unwrap → muestra `role="alert"` con mensaje de error
  *(GAP-ADM-04-BULKREORDER)*

---

## Block IV — GAP-ADM-04-ARCHIVED-EDIT + GAP-ADM-05-PUBLISH-INACTIVE

- [ ] [T-013] **MenuItemCatalog.jsx + mockInterceptor.js — Guards de UI**

  **MenuItemCatalog.jsx — Catalog tab:**
  Botón "Editar" deshabilitado para items con `status === 'ARCHIVED'`:
  ```jsx
  <button
    className="btn btn-sm btn-secondary"
    onClick={() => handleOpenEdit(item)}
    aria-label={`Editar ${item.label}`}
    disabled={item.status === 'ARCHIVED'}
    aria-disabled={item.status === 'ARCHIVED'}
  >
    Editar
  </button>
  ```

  **MenuItemCatalog.jsx — Lifecycle tab:**
  Añadir estado `[transitionErrors, setTransitionErrors] = useState({})` (map id→mensaje).

  Modificar `handleTransition` para usar `.unwrap()`:
  ```js
  const handleTransition = async (item, newStatus) => {
    try {
      await dispatch(transitionMenuItemStatus({ id: item.id, newStatus })).unwrap()
      setTransitionErrors(e => ({ ...e, [item.id]: null }))
      showFeedback(`${item.label}: ${STATUS_LABELS[newStatus]}`)
    } catch (err) {
      setTransitionErrors(e => ({ ...e, [item.id]: err?.message || 'Error en la transición' }))
    }
  }
  ```

  En la fila de lifecycle table, añadir error inline bajo los botones:
  ```jsx
  {transitionErrors[item.id] && (
    <div role="alert" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
      {transitionErrors[item.id]}
    </div>
  )}
  ```

  **mockInterceptor.js — `_handleAdminMenuItems` PATCH:**
  Añadir validación de función inactiva al publicar (DRAFT → ACTIVE).
  Usar flag `_inactiveFunctionsByItemId = new Set()` en constructor (default vacío).
  En el handler PATCH:
  ```js
  if (body?.status === 'ACTIVE' && item.status === 'DRAFT') {
    if (this._inactiveFunctionsByItemId.has(id)) {
      return { status: 422, data: { error: 'function_inactive', message: 'La función asociada está inactiva' } }
    }
  }
  ```
  *(GAP-ADM-04-ARCHIVED-EDIT, GAP-ADM-05-PUBLISH-INACTIVE)*

- [ ] [T-014] **Tests — Guards de edición y publicación**

  Añadir casos en `MenuItemCatalogPage.test.jsx`.

  Para ARCHIVED-EDIT:
  (a) Botón "Editar" en item con `status: 'ARCHIVED'` tiene atributo `disabled`
  (b) Botón "Editar" en item con `status: 'ACTIVE'` NO tiene `disabled`

  Para PUBLISH-INACTIVE (simular error vía mock dispatch):
  Setup: `mockDispatch.mockImplementation(action => ({ ...action, unwrap: () => Promise.reject({ message: 'La función asociada está inactiva' }) }))` en el test específico.
  (c) Click en transición → dispatch falla → `role="alert"` con mensaje de error visible en la fila
  (d) Transición exitosa → feedback visible, sin error en fila
  *(GAP-ADM-04-ARCHIVED-EDIT, GAP-ADM-05-PUBLISH-INACTIVE)*

---

## Block V — GAP-ADM-05-BLOCKARCHIVE: Bloquear archivado automático

- [ ] [T-015] **mockInterceptor.js + adminGateway.js — Endpoint block-archive**

  **mockInterceptor.js** — Constructor: añadir `this._blockedMenuItems = new Map()`.
  Routing ANTES del bloque genérico `/api/admin/menu-items/`:
  ```js
  // UC-ADM-05 CA-07: bloquear archivado automático
  if (url.match(/\/api\/admin\/menu-items\/(\d+)\/block-archive\//) && method === 'POST') {
    return this._handleBlockAutoArchive(url, body)
  }
  ```

  Handler:
  ```js
  _handleBlockAutoArchive(url, body) {
    const id = parseInt(url.match(/\/menu-items\/(\d+)\//)[1])
    const reason = body?.block_reason ?? ''
    if (reason.length < 20) {
      return {
        status: 422,
        data: {
          error: 'block_reason_too_short',
          message: `La razón debe tener al menos 20 caracteres (actual: ${reason.length})`,
          min_length: 20,
        },
      }
    }
    this._blockedMenuItems.set(id, {
      block_auto_archive: true,
      block_reason: reason,
      block_set_by: 'demo',
      block_set_at: new Date().toISOString(),
    })
    const item = this._menuItemsData().find(i => i.id === id) || {}
    return {
      status: 200,
      data: {
        ...item,
        block_auto_archive: true,
        block_reason: reason,
        block_set_by: 'demo',
        block_set_at: new Date().toISOString(),
      },
    }
  }
  ```

  **adminGateway.js** — Añadir método en bloque MenuItems:
  ```js
  async blockAutoArchive(id, blockReason) {
    return apiService.post(`/api/admin/menu-items/${id}/block-archive/`, {
      block_reason: blockReason,
    })
  }
  ```
  *(GAP-ADM-05-BLOCKARCHIVE)*

- [ ] [T-016] **admin.js slice — `blockAutoArchive` thunk + reducer**

  Thunk:
  ```js
  export const blockAutoArchive = createAsyncThunk(
    'admin/blockAutoArchive',
    async ({ id, blockReason }, { rejectWithValue }) => {
      try {
        return await adminService.blockAutoArchive(id, blockReason)
      } catch (error) {
        return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
      }
    }
  )
  ```

  `extraReducers`:
  ```js
  builder
    .addCase(blockAutoArchive.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.menuItems.findIndex(i => i.id === updated.id)
      if (idx !== -1) state.menuItems[idx] = updated
    })
    .addCase(blockAutoArchive.rejected, (state, action) => {
      state.error = action.payload
    })
  ```
  *(GAP-ADM-05-BLOCKARCHIVE)*

- [ ] [T-017] **MenuItemCatalog.jsx — UI block-archive en lifecycle tab**

  Añadir estado:
  ```js
  const [blockArchiveModal, setBlockArchiveModal] = useState({ isOpen: false, itemId: null, reason: '', error: null })
  const BLOCK_REASON_MIN = 20
  ```

  En la fila del lifecycle table para items con `item.status === 'DEPRECATED'`, añadir
  (junto a los botones de transición):
  ```jsx
  <button
    className="btn btn-sm btn-outline"
    onClick={() => setBlockArchiveModal({ isOpen: true, itemId: item.id, reason: '', error: null })}
    aria-label={`Bloquear archivado de ${item.label}`}
  >
    Bloquear archivado
  </button>
  ```

  Modal inline (renderizado al final del tab "lifecycle", cuando `blockArchiveModal.isOpen`):
  ```jsx
  {blockArchiveModal.isOpen && (
    <div role="dialog" aria-label="Bloquear archivado automático">
      <h3>Bloquear archivado automático</h3>
      <textarea
        aria-label="Razón para bloquear el archivado"
        maxLength={500}
        value={blockArchiveModal.reason}
        onChange={e => setBlockArchiveModal(m => ({ ...m, reason: e.target.value }))}
        placeholder="Describe el motivo del bloqueo (mínimo 20 caracteres)..."
        rows={3}
      />
      <small>{blockArchiveModal.reason.length}/500 · mínimo {BLOCK_REASON_MIN}</small>
      {blockArchiveModal.error && (
        <div role="alert">{blockArchiveModal.error}</div>
      )}
      <div>
        <button
          className="btn btn-primary"
          disabled={blockArchiveModal.reason.length < BLOCK_REASON_MIN}
          onClick={handleConfirmBlockArchive}
        >
          Confirmar bloqueo
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setBlockArchiveModal({ isOpen: false, itemId: null, reason: '', error: null })}
        >
          Cancelar
        </button>
      </div>
    </div>
  )}
  ```

  Handler:
  ```js
  const handleConfirmBlockArchive = async () => {
    try {
      await dispatch(blockAutoArchive({
        id: blockArchiveModal.itemId,
        blockReason: blockArchiveModal.reason,
      })).unwrap()
      setBlockArchiveModal({ isOpen: false, itemId: null, reason: '', error: null })
      showFeedback('Archivado bloqueado correctamente')
    } catch (err) {
      setBlockArchiveModal(m => ({ ...m, error: err?.message || 'Error al bloquear el archivado' }))
    }
  }
  ```
  *(GAP-ADM-05-BLOCKARCHIVE)*

- [ ] [T-018] **Tests — Block-archive lifecycle**

  Crear `src/pages/admin/__tests__/MenuItemBlockArchive.test.jsx`.

  Setup mock slice: añadir `blockAutoArchive: jest.fn(args => ({ type: 'admin/blockAutoArchive', payload: args }))`.
  Items mock: incluir un item con `status: 'DEPRECATED'`.

  Tests requeridos:
  (a) Botón "Bloquear archivado" visible SOLO para items con `status === 'DEPRECATED'`
  (b) Botón no visible para items ACTIVE, DRAFT, ARCHIVED
  (c) Modal se abre al clickear "Bloquear archivado"
  (d) Botón "Confirmar bloqueo" DESHABILITADO cuando reason < 20 chars
  (e) Botón habilitado cuando reason ≥ 20 chars
  (f) Confirm → dispatcha `blockAutoArchive` con `{ id, blockReason }`
  (g) Error 422 (unwrap rechaza) → `role="alert"` visible, modal permanece abierto
  (h) Cancelar → modal se cierra sin dispatch
  *(GAP-ADM-05-BLOCKARCHIVE)*

---

## Block VI — GAP-ADM-02-FILTER: Filtros en catálogo de funciones (BAJA)

- [ ] [T-019] **FunctionCatalog.jsx — Filtros domain y estado (client-side)**

  Añadir estado:
  ```js
  const [filterDomain, setFilterDomain] = useState('')
  const [filterActive, setFilterActive] = useState('')   // '', 'active', 'inactive'
  ```

  Modificar la computación `filtered` para aplicar los 3 filtros (search + domain + active):
  ```js
  const filtered = functions.filter((fn) => {
    const searchQuery = search.toLowerCase()
    const matchesSearch = fn.codename?.toLowerCase().includes(searchQuery) ||
      fn.name?.toLowerCase().includes(searchQuery)
    const matchesDomain = !filterDomain || fn.domain === filterDomain
    const matchesActive = !filterActive ||
      (filterActive === 'active' ? fn.active !== false : fn.active === false)
    return matchesSearch && matchesDomain && matchesActive
  })
  ```

  Añadir en la barra de búsqueda (junto al input existente):
  ```jsx
  {/* Filtro domain */}
  <select
    value={filterDomain}
    onChange={e => setFilterDomain(e.target.value)}
    aria-label="Filtrar por dominio"
    style={{ marginLeft: '8px', padding: '8px', background: '#1f2937', color: '#fff', border: '1px solid #374151' }}
  >
    <option value="">Todos los dominios</option>
    {[...new Set(functions.map(f => f.domain).filter(Boolean))].sort().map(d => (
      <option key={d} value={d}>{d}</option>
    ))}
  </select>

  {/* Filtro estado */}
  <select
    value={filterActive}
    onChange={e => setFilterActive(e.target.value)}
    aria-label="Filtrar por estado"
    style={{ marginLeft: '8px', padding: '8px', background: '#1f2937', color: '#fff', border: '1px solid #374151' }}
  >
    <option value="">Todos los estados</option>
    <option value="active">Solo activas</option>
    <option value="inactive">Solo inactivas</option>
  </select>
  ```

  No se requieren tests adicionales — filtro client-side sobre datos ya testeados.
  *(GAP-ADM-02-FILTER)*

---

## Criterios de completación

- [ ] Todas las tareas T-001..T-019 en `[x]`
- [ ] `npm test -- --watchAll=false` sin failures (base: 1866 tests, esperado: +25-30 nuevos)
- [ ] 0 regressions en tests existentes de admin (AGRCatalogPage, FunctionCatalogPage, SeparationRulesCatalogPage, MenuItemCatalogPage, adminService, adminSlice)
- [ ] GAP-ADM-03: panel de composición funcional — agregar, remover, impact visible
- [ ] GAP-ADM-01: error disjunción visible en formulario SoD
- [ ] GAP-ADM-04: bulk reorder operativo + edit bloqueado para ARCHIVED
- [ ] GAP-ADM-05: block-archive modal funcional con validación ≥20 chars + error display en transiciones
