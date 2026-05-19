```yml
created_at: 2026-05-08 22:57:05
project: THYROX
work_package: 2026-05-08-22-57-05-reports-share-backend
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — reports-share-backend

Fuente: `discover/reports-share-backend-analysis.md`
Gaps: GAP-01..04 (CRÍTICO) · GAP-05/06 (MEDIO) · GAP-07/08 (BAJO)

## Diseño de integración — decisión de backward compat

`ShareReportModal` es usado por 7 páginas con props `{ isOpen, url, onClose }`.
El rewrite mantiene esos props y agrega `viewId` (opcional). Comportamiento:
- `viewId` presente → modo share backend (formulario + POST)
- Solo `url` → modo legacy URL-copy (sin cambios para las 7 páginas)

El punto de entrada al nuevo flujo es `SavedFiltersPanel`: agrega botón "Compartir"
por cada filtro guardado, que abre el modal con `viewId = filter.id`.

## DAG de dependencias

```
T-001 → T-002 → T-003                   (Block I — Gateway + Slice + Mock)

T-004                                    (Block II — ShareReportModal rewrite)
  └── depends on T-002 (sharesSlice exports)

T-005 → T-006                            (Block III — SavedFiltersPanel + SharedViews)
  └── depends on T-002

T-007                                    (Block IV — Router + Nav)
  └── depends on T-005/T-006

T-008 → T-009                            (Block V — Tests)
  └── depends on T-004/T-005

Commit Block I:   T-001..T-003
Commit Block II:  T-004
Commit Block III: T-005..T-007
Commit Block IV:  T-008..T-009
```

---

## Block I — Gateway + Slice + Mock (GAP-01..04/07/08)

> Infraestructura backend: gateway, slice, mock. Sin UI.

- [x] [T-001] `src/services/sharesGateway.js` (NUEVO) — crear clase `SharesService` con 4 métodos:
  - `createShare({ view_id, target_type, target_id, permission, expires_at, message })` → `POST /api/me/shares/`
  - `revokeShare(shareId)` → `DELETE /api/me/shares/${shareId}/`
  - `getSharesSent(params = {})` → `GET /api/me/shares/sent/`
  - `getSharesReceived(params = {})` → `GET /api/me/shares/received/`
  - Exportar `default new SharesService()`

- [x] [T-002] `src/redux/slices/shares.js` (NUEVO) — slice dedicado:
  - thunks: `createShare`, `revokeShare`, `fetchSharesSent`, `fetchSharesReceived`
  - `initialState: { sent: [], received: [], loading: false, error: null, createStatus: null }`
  - `createStatus`: `null | 'pending' | 'success' | 'error'` para feedback en el modal
  - `extraReducers` para los 4 thunks (pending/fulfilled/rejected)
  - `reducers: { resetCreateStatus: (state) => { state.createStatus = null; state.error = null } }`
  - Selectors: `selectSharesSent`, `selectSharesReceived`, `selectSharesLoading`, `selectSharesError`,
    `selectShareCreateStatus`
  - Registrar en `src/redux/store.js` bajo la key `shares`

- [x] [T-003] `src/mocks/mockInterceptor.js` — agregar routing para `/api/me/shares/`:
  - Routing: antes del fallback 404, insertar check para `/api/me/shares/sent/`,
    `/api/me/shares/received/`, y `/api/me/shares/{id}/` y `/api/me/shares/`
  - `resetSharesStore()` public method (llamado desde constructor) inicializa:
    - `_sharesSentStore`: 2 shares enviados (target_type: 'user' y 'agr')
    - `_sharesReceivedStore`: 2 shares recibidos (uno activo, uno expirado)
    - `_sharesNextId`: 100
  - `_handleShares(url, method, body)`:
    - `GET` + `/sent/` → `{ status: 200, data: this._sharesSentStore }`
    - `GET` + `/received/` → `{ status: 200, data: this._sharesReceivedStore }`
    - `POST` → validar EX-06 (body.target_id === 1 y target_type 'user' → `400 SELF_SHARE`);
      validar EX-07 (`expires_at` en pasado → `400 INVALID_EXPIRES`);
      crear ShareEntry con todos los campos + `id`, `created_at`, `revoked_at: null`;
      push a `_sharesSentStore`; retornar `{ status: 201, data: newShare }`
    - `DELETE` (`url.match(/\/api\/me\/shares\/(\d+)\//)`) → set `revoked_at = now()`;
      retornar `{ status: 204, data: null }`; si no existe → `{ status: 404 }`
  - Fixture `_sharesSentStore` campos: `{ id, view_id, owner_id, target_type, target_id,
    permission, expires_at, revoked_at, created_at, view_name (display) }`
  - Fixture `_sharesReceivedStore` campos: mismos + `owner_name (display)`

---

## Block II — ShareReportModal rewrite (GAP-05)

> Reescribir el modal para soportar el nuevo flujo backend. Backward compat con 7 páginas.

- [x] [T-004] `src/components/reports/ShareReportModal.jsx` — rewrite con dual-mode:
  - Props: `{ isOpen, onClose, url = '', viewId = null, viewName = '' }`
  - **Modo URL-copy** (cuando `viewId` es null): renderizar igual que antes —
    input readonly + botón Copiar. Los 7 report pages NO se tocan.
  - **Modo share backend** (cuando `viewId` no es null):
    - Formulario: `target_type` (select: `usuario | agr | público`),
      `target_id` (input texto — visible cuando target_type no es 'segment_public'),
      `permission` (radio: `leer | clonar`), `expires_at` (date input opcional),
      `message` (textarea opcional ≤200 chars)
    - Botón "Compartir" → dispatch `createShare({ view_id: viewId, target_type, target_id, permission, expires_at, message })`
    - Estado `createStatus === 'success'` → mostrar confirmación "Vista compartida" + botón Cerrar
    - Estado `createStatus === 'error'` → mostrar `role="alert"` con `sharesError`
    - Al cerrar → dispatch `resetCreateStatus()`
  - Importar `createShare`, `resetCreateStatus`, `selectShareCreateStatus`, `selectSharesError`
    desde `@store/slices/shares`
  - Actualizar tests en `ShareReportModal.test.jsx`:
    - Tests modo URL-copy: conservar los 5 tests existentes (backward compat)
    - Agregar tests modo share backend: formulario visible, dispatch createShare, success state, error state

---

## Block III — SavedFiltersPanel + SharedViews + Router (GAP-05/06)

> Punto de entrada al nuevo flujo y página de gestión.

- [x] [T-005] `src/components/reports/SavedFiltersPanel.jsx` — agregar botón "Compartir" por filtro:
  - Junto al botón "★" existente, agregar botón "↗" (compartir) por cada filtro
  - Al click → abrir `ShareReportModal` con `viewId = filter.id` y `viewName = filter.name`
  - Estado local: `{ shareModal: { isOpen: false, viewId: null, viewName: '' } }`
  - Renderizar `<ShareReportModal isOpen viewId viewName onClose />` al pie del panel

- [x] [T-006] `src/pages/reports/SharedViews.jsx` (NUEVO) — página gestión de shares:
  - Dos tabs: "Enviados" y "Recibidos"
  - Tab Enviados: `useSelector(selectSharesSent)` → tabla con columnas:
    Vista | Destinatario | Permiso | Expira | Estado | Acción
    - Estado: `revoked_at` !== null → "Revocado", `expires_at < now()` → "Expirado", else "Activo"
    - Acción: botón "Revocar" (solo si activo) → confirm dialog → dispatch `revokeShare(share.id)`
  - Tab Recibidos: `useSelector(selectSharesReceived)` → tabla con columnas:
    Vista | Compartida por | Permiso | Expira | Estado
    - Estado: igual que enviados
  - `useEffect` despacha `fetchSharesSent()` y `fetchSharesReceived()` al montar

- [x] [T-007] `src/router/AppRouter.jsx` — agregar:
  - `const SharedViewsPage = lazy(() => import('@screens/reports/SharedViews'))`
  - Ruta `/reports/shares` con `ProtectedRoute permission={FunctionCatalog.SHARE_REPORTS}`
  - Nav entry en grupo Reports: `{ label: 'Vistas compartidas', icon: 'share-alt', path: '/reports/shares', permission: FunctionCatalog.SHARE_REPORTS }`

---

## Block IV — Tests (GAP-05/06)

- [x] [T-008] `src/components/reports/__tests__/ShareReportModal.test.jsx` — actualizar:
  - Conservar los 5 tests modo URL-copy
  - Agregar describe `modo share backend (UC_RPT_11)`:
    - `renders share form when viewId is provided`
    - `shows target_id input only when target_type is not segment_public`
    - `dispatches createShare on submit`
    - `shows success state when createStatus is success`
    - `shows error alert when createStatus is error`
    - `dispatches resetCreateStatus on close`

- [x] [T-009] `src/pages/reports/__tests__/SharedViewsPage.test.jsx` (NUEVO):
  - `renders page with Enviados and Recibidos tabs`
  - `dispatches fetchSharesSent and fetchSharesReceived on mount`
  - `renders sent shares table`
  - `renders received shares table`
  - `shows Revocar button only for active shares`
  - `dispatches revokeShare with confirm`
  - `shows empty state for each tab`

---

## Checklist de cierre por bloque

| Bloque | Tareas | Commit |
|--------|--------|--------|
| I — Gateway/Slice/Mock | T-001..T-003 | `Add shares gateway, slice and mock handler (UC_RPT_11)` |
| II — Modal rewrite | T-004 | `Rewrite ShareReportModal with backend share mode (UC_RPT_11)` |
| III — Panel/Page/Router | T-005..T-007 | `Add share entry point in SavedFiltersPanel and SharedViews page (UC_RPT_11)` |
| IV — Tests | T-008..T-009 | `Add tests for share modal and shared views page (UC_RPT_11)` |
