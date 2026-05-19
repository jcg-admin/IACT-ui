```yml
created_at: 2026-05-08 21:04:29
project: THYROX
work_package: 2026-05-08-21-01-30-menuitem-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — MenuItems UC Audit (UC_ADM_04 + UC_ADM_05)

## Objetivo

Auditar si la implementación actual de `MenuItemCatalog.jsx` +
`adminGateway.js` + `admin.js` slice + `mockInterceptor.js` cubre todos
los flujos definidos en UC_ADM_04 (catálogo) y UC_ADM_05 (lifecycle).

Fuente de verdad: `/tmp/references/IACT-docs/source/requisitos/casos-uso/admin/uc-adm-04/` y `uc-adm-05/`.

## Implementación actual

| Archivo | Rol |
|---------|-----|
| `src/pages/admin/MenuItemCatalog.jsx` | UI — tabs Catálogo + Lifecycle |
| `src/services/adminGateway.js:137-167` | HTTP layer — 6 métodos |
| `src/redux/slices/admin.js:157-498` | Thunks + reducers |
| `src/mocks/mockInterceptor.js:1615-1646` | Mock handlers |
| `src/pages/admin/__tests__/MenuItemCatalogPage.test.jsx` | 18 tests |

## Flujos cubiertos ✓

| Flujo | Evidence |
|-------|----------|
| CREATE → status=DRAFT | mock retorna `{ status: 'DRAFT', ...body }` (line 1632) |
| LIST items | `GET /api/admin/menu-items/` + `fetchMenuItems` thunk |
| UPDATE metadata | `PUT /api/admin/menu-items/{id}/` + `updateMenuItem` thunk |
| Edit disabled for ARCHIVED | `disabled={item.status === 'ARCHIVED'}` (line 259) |
| STATUS_TRANSITIONS map matches spec | DRAFT→[ACTIVE], ACTIVE→[DEPRECATED], DEPRECATED→[ACTIVE,ARCHIVED], ARCHIVED→[ACTIVE] |
| Bulk reorder `POST /bulk-reorder/` | `adminGateway:155-157`, `bulkReorderMenuItems` thunk |
| Block-archive SET `POST /block-archive/` | `adminGateway:159-163`, `blockAutoArchive` thunk |
| block_reason min 20 chars client-side | `BLOCK_REASON_MIN = 20` + button disabled guard |
| Error banners per row (transition fail) | `transitionErrors[item.id]` with `.error-banner` |
| Error banner in reorder fail | `reorderError` with `.error-banner` |
| Error banner in block-archive modal | `blockArchiveModal.error` with `.error-banner` |

## Gaps identificados

### GAP-01 — CRÍTICO: endpoints de transición incorrectos

**Spec (UC_ADM_05 flujo-principal §3.1):**
```
DRAFT → ACTIVE        POST /api/admin/menu-items/{id}/publish/
ACTIVE → DEPRECATED   POST /api/admin/menu-items/{id}/deprecate/
DEPRECATED → ACTIVE   POST /api/admin/menu-items/{id}/reactivate/
ARCHIVED → ACTIVE     POST /api/admin/menu-items/{id}/reactivate/
DEPRECATED → ARCHIVED POST /api/admin/menu-items/{id}/archive/
```

**Implementación actual (`adminGateway.js:151-153`):**
```javascript
async transitionMenuItemStatus(id, newStatus) {
  return apiService.patch(`/api/admin/menu-items/${id}/`, { status: newStatus })
}
```

**Problema:** El PATCH genérico con `{ status }` no discrimina entre
transiciones. Cada endpoint dedicado tiene precondiciones y efectos distintos:
- `/publish/` → valida que Function esté activa (EX-04: 422 function_inactive)
- `/deprecate/` → setea `deprecated_at=now()`
- `/reactivate/` → limpia `deprecated_at`, `block_auto_archive`, `block_reason`, `block_set_by`, `block_set_at`, `archived_at`
- `/archive/` → setea `archived_at=now()`, preserva `deprecated_at`

La implementación actual bypasea todas esas diferencias.

**Impacto:** Mock no simula los endpoints dedicados, tests no los verifican.

**Fix requerido:**
1. `adminGateway.js`: reemplazar `transitionMenuItemStatus(id, newStatus)` con
   4 métodos por transición: `publishMenuItem`, `deprecateMenuItem`,
   `reactivateMenuItem`, `archiveMenuItem`.
2. `admin.js`: 4 thunks separados + reducers para actualizar `menuItems`.
3. `MenuItemCatalog.jsx`: `handleTransition` mapea `newStatus` al thunk correcto.
4. `mockInterceptor.js`: handlers para cada endpoint dedicado.
5. Tests: verificar que cada botón de transición llama al thunk correcto.

### GAP-02 — MEDIO: falta DELETE /block-archive/ (FA-06)

**Spec (UC_ADM_05 FA-06):**
```
DELETE /api/admin/menu-items/{id}/block-archive/
→ UPDATE block_auto_archive=False, block_reason='', block_set_by=NULL, block_set_at=NULL
→ Audit: MENU_ITEM_BLOCK_FLAG_CLEARED
```

**Implementación actual:** solo el POST (set) existe. El DELETE (unset) está
completamente ausente en gateway, slice, mock, UI y tests.

**Fix requerido:**
1. `adminGateway.js`: método `unblockAutoArchive(id)`.
2. `admin.js`: thunk `unblockAutoArchive` + reducer que actualiza el item.
3. `MenuItemCatalog.jsx`: botón "Desbloquear archivado" visible cuando
   `item.status === 'DEPRECATED' && item.block_auto_archive === true`.
4. Mock + tests.

### GAP-03 — BAJO: PUT vs PATCH en updateMenuItem

**Spec (UC_ADM_04 FA-02):** partial update usa PATCH.

**Implementación (`adminGateway.js:148`):**
```javascript
return apiService.put(`/api/admin/menu-items/${id}/`, data)
```

**Fix:** cambiar `put` → `patch` en `updateMenuItem`.

### GAP-04 — BAJO: fetchMenuItems sin filtros

**Spec (UC_ADM_04 FA-04, CA-07):** GET con params `?status=&module=`.

**Implementación:** `GET /api/admin/menu-items/` sin parámetros.

**Fix requerido:**
1. `adminGateway.js`: aceptar `{ status, module }` opcionales.
2. `admin.js`: thunk pasa params a gateway.
3. `MenuItemCatalog.jsx`: agregar filtros de UI (select status, select module).
4. Mock: filtrar por params si presentes.

### GAP-05 — BAJO: mock no simula 409 duplicado (FA-01/EX-07)

**Spec (UC_ADM_04 FA-01):** si Function ya tiene un MenuItem asociado →
`409 Conflict` con `{ existing_menu_item_id }`.

**Mock actual (`mockInterceptor.js:1631-1633`):**
```javascript
if (method === 'POST') {
  return { status: 201, data: { id: items.length + 1, status: 'DRAFT', ...body } }
}
```

Siempre retorna 201, nunca simula el 409.

**Fix requerido:** detectar si `function_codename` ya existe en `_menuItemsData()`.

## Cobertura de tests actual

| Grupo de tests | Cobertura |
|----------------|-----------|
| Render + mount | ✓ básico |
| Tab switching | ✓ |
| Transición (dispatch + error) | ✓ pero solo verifica dispatch count, no endpoint correcto |
| Bulk reorder (éxito + error) | ✓ |
| Edit guard (ARCHIVED disabled) | ✓ |
| Block-archive modal (open, validate, dispatch, error, cancel) | ✓ completo |
| Unblock-archive (FA-06) | ✗ ausente |
| PUT vs PATCH en update | ✗ no verificado |
| GET con filtros | ✗ ausente |
| 409 duplicate Function | ✗ no simulado |
| Endpoint correcto por transición | ✗ ausente |

## Priorización

| # | Gap | Severity | Esfuerzo |
|---|-----|----------|----------|
| 1 | GAP-01: endpoints de transición | CRÍTICO | Alto (4 métodos, 4 thunks, UI routing, 4 mocks, tests) |
| 2 | GAP-02: unblock-archive DELETE | MEDIO | Medio (1 método, 1 thunk, UI, mock, tests) |
| 3 | GAP-03: PUT→PATCH | BAJO | Bajo (1 línea) |
| 4 | GAP-04: filtros GET | BAJO | Medio (gateway + UI + mock) |
| 5 | GAP-05: mock 409 duplicate | BAJO | Bajo (mock only) |

## Decisión de alcance

GAP-01 y GAP-02 son los únicos con impacto de correctness en producción.
GAP-03, GAP-04, GAP-05 son correctness del contrato de API con el backend.

WP cubre GAP-01..05. GAP-04 (filtros en UI) puede reducirse a scope mínimo:
pasar params desde gateway + mock sin UI de filtros (el backend los acepta,
pero la UI no los usa hoy — YAGNI applies para el frontend).
