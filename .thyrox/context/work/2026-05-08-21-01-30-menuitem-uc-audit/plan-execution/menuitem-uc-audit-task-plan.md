```yml
created_at: 2026-05-08 21:09:26
project: THYROX
work_package: 2026-05-08-21-01-30-menuitem-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — menuitem-uc-audit

Fuente: `discover/menuitem-uc-audit-analysis.md`
Gaps: GAP-01 (CRÍTICO) · GAP-02 (MEDIO) · GAP-03..05 (BAJO)

## DAG de dependencias

```
T-001 → T-002 → T-003
     ↘           ↗
      T-004 ────       → T-005
                         (Block I completo)

T-006 → T-007 → T-008
     ↘           ↗
      T-009 ────       → T-010
                         (Block II completo)

T-011                    (Block III independiente)

T-012 → T-013 → T-014   (Block IV en cadena)

T-015                    (Block V independiente)
```

---

## Block I — GAP-01: endpoints de transición dedicados (CRÍTICO)

> Reemplazar el PATCH genérico `/{id}/` por 4 POST a endpoints específicos.
> Commit al completar T-005.

- [x] [T-001] `adminGateway.js` — eliminar `transitionMenuItemStatus`; agregar 4 métodos: `publishMenuItem(id)` → `POST /{id}/publish/`, `deprecateMenuItem(id)` → `POST /{id}/deprecate/`, `reactivateMenuItem(id)` → `POST /{id}/reactivate/`, `archiveMenuItem(id)` → `POST /{id}/archive/`
- [x] [T-002] `admin.js` — eliminar thunk `transitionMenuItemStatus` y su reducer; agregar 4 thunks (`publishMenuItem`, `deprecateMenuItem`, `reactivateMenuItem`, `archiveMenuItem`) + 4 pares de reducers `.fulfilled`/`.rejected` que actualizan `menuItems` por id
- [x] [T-003] `MenuItemCatalog.jsx` — actualizar imports (quitar `transitionMenuItemStatus`, agregar 4 thunks); actualizar `handleTransition(item, newStatus)` para despachar el thunk correcto según `newStatus` (ACTIVE → publish/reactivate según `item.status`, DEPRECATED → deprecate, ARCHIVED → archive)
- [x] [T-004] `mockInterceptor.js` — agregar 4 handlers ANTES del handler genérico de menu-items: `/publish/` (200, status=ACTIVE, published_at), `/deprecate/` (200, status=DEPRECATED, deprecated_at), `/reactivate/` (200, status=ACTIVE, limpia deprecated_at+archived_at+block_*), `/archive/` (200, status=ARCHIVED, archived_at, preserva deprecated_at)
- [x] [T-005] `MenuItemCatalogPage.test.jsx` — actualizar mock de imports para los 4 thunks nuevos; agregar 4 tests: cada botón de transición despacha el thunk correcto (publish para DRAFT→ACTIVE, deprecate para ACTIVE→DEPRECATED, reactivate para DEPRECATED→ACTIVE, archive para DEPRECATED→ARCHIVED)

---

## Block II — GAP-02: unblock-archive DELETE (MEDIO)

> Implementar FA-06: `DELETE /{id}/block-archive/`.
> Commit al completar T-010.

- [x] [T-006] `adminGateway.js` — agregar método `unblockAutoArchive(id)` → `DELETE /api/admin/menu-items/${id}/block-archive/`
- [x] [T-007] `admin.js` — agregar thunk `unblockAutoArchive({ id })` que llama `adminService.unblockAutoArchive(id)` + reducers `.fulfilled` (actualiza item en menuItems) y `.rejected`; exportar thunk
- [x] [T-008] `MenuItemCatalog.jsx` — en tab lifecycle, para items con `status === 'DEPRECATED'` agregar botón "Desbloquear archivado" visible solo cuando `item.block_auto_archive === true`; handler `handleUnblockArchive(itemId)` despacha el thunk con `.unwrap()`, éxito muestra feedback, error en `transitionErrors[item.id]`
- [x] [T-009] `mockInterceptor.js` — agregar handler `DELETE` para `/block-archive/` que retorna 200 con item actualizado (`block_auto_archive=false`, `block_reason=''`, `block_set_by=null`, `block_set_at=null`)
- [x] [T-010] `MenuItemCatalogPage.test.jsx` — agregar suite "unblock-archive": botón visible solo cuando `block_auto_archive=true`; despacha `unblockAutoArchive({ id })`; error muestra `role="alert"` en la fila

---

## Block III — GAP-03: PUT → PATCH en updateMenuItem (BAJO)

> Corrección de 1 línea en adminGateway.js.
> Commit al completar T-011.

- [x] [T-011] `adminGateway.js` — cambiar `apiService.put` por `apiService.patch` en método `updateMenuItem(id, data)` (línea 148)

---

## Block IV — GAP-04: filtros en fetchMenuItems (BAJO)

> Habilitar `?status=&module=` en el GET sin agregar UI de filtros.
> Commit al completar T-014.

- [ ] [T-012] `adminGateway.js` — `getMenuItems({ status, module } = {})` construye `URLSearchParams` con los parámetros no-nulos y los agrega al GET `/api/admin/menu-items/`
- [ ] [T-013] `admin.js` — `fetchMenuItems` thunk acepta argumento opcional `{ status, module }` y lo pasa a `adminService.getMenuItems(args)`
- [ ] [T-014] `mockInterceptor.js` — en `_handleAdminMenuItems` GET, leer `?status=` y `?module=` de la URL y filtrar `items` antes de retornar

---

## Block V — GAP-05: mock simula 409 duplicado de Function (BAJO)

> Una sola modificación en el handler POST del mock.
> Commit al completar T-015.

- [ ] [T-015] `mockInterceptor.js` — en `_handleAdminMenuItems` POST, verificar si `body.function_codename` ya existe en `_menuItemsData()`; si existe → retornar `{ status: 409, data: { error: 'function_already_has_menu_item', existing_menu_item_id: <id> } }`; si no → retornar 201 como antes

---

## Checklist de cierre por bloque

| Bloque | Tareas | Tests verdes | Commit |
|--------|--------|--------------|--------|
| I — GAP-01 | T-001..T-005 | ✓ suite MenuItemCatalog completa | `Fix lifecycle transition endpoints (UC_ADM_05)` |
| II — GAP-02 | T-006..T-010 | ✓ suite unblock-archive | `Add unblock-archive DELETE endpoint (UC_ADM_05 FA-06)` |
| III — GAP-03 | T-011 | ✓ tests existentes sin regresión | `Fix updateMenuItem to use PATCH` |
| IV — GAP-04 | T-012..T-014 | ✓ tests sin regresión | `Add status/module filter support to fetchMenuItems` |
| V — GAP-05 | T-015 | ✓ tests sin regresión | `Simulate 409 duplicate function in mock (UC_ADM_04 FA-01)` |
