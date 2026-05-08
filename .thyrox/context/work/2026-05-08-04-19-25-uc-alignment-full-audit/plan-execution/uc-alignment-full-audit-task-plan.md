```yml
created_at: 2026-05-08 04:35:00
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — uc-alignment-full-audit

**Baseline tests:** 1820 (verificado 2026-05-08)
**Commits:** 1 por bloque completado
**Estrategia:** TDD donde aplica. Routing primero (bajo riesgo, inmediato impacto).

---

## Bloque I — GAP-A: Routing + tests para páginas sin ruta

> ACC-01/02 (AssignFunctions), ACC-03 (Permissions), ACC-09 (AccessAudit)
> Las páginas están completas — solo necesitan ruta, nav entry y tests.

- [ ] [T-001] AppRouter: agregar ruta `/access/assign-functions` → `AssignFunctionsPage` con guard `FunctionCatalog.MANAGE_ACCESS`; lazy import `@screens/access/AssignFunctions`
- [ ] [T-002] AppRouter: agregar ruta `/access/permissions` → `PermissionsPage` con guard `FunctionCatalog.VIEW_ACCESS`; lazy import `@screens/access/Permissions`
- [ ] [T-003] AppRouter: agregar ruta `/access/audit/access` → `AccessAuditPage` con guard `FunctionCatalog.VIEW_AUDIT`; lazy import `@screens/access/AccessAudit`
- [ ] [T-004] AppRouter navLinks: agregar 3 entries al grupo Acceso (Asignar/Revocar Funciones, Permisos Efectivos, Auditoría Acceso)
- [ ] [T-005] Mock handlers: agregar handlers en `mockInterceptor.js` para `GET /functions/catalog`, `GET /users/:id/functions`, `POST /functions/assign`, `DELETE /functions/:id/user/:uid`
- [ ] [T-006] Tests `AssignFunctionsPage.test.jsx`: render básico, tab asignar, tab revocar, guard redirect
- [ ] [T-007] Tests `PermissionsPage.test.jsx`: render básico, carga permisos de usuario, filtro por categoría
- [ ] [T-008] Tests `AccessAuditPage.test.jsx`: render básico, filtros de usuario/acción/fecha

**Commit I:** `Add routing and tests for ACC-01/02/03/09 pages`

---

## Bloque II — GAP-C1: UC_PIP_04 — Retry pipeline

- [ ] [T-009] `mockInterceptor.js`: agregar handler `POST /pipeline/:id/retry` → `{ success: true, job_id: 'retry-...' }`; requiere header `X-Permission: pipeline:retry`
- [ ] [T-010] `src/redux/slices/pipeline.js` (o access): agregar thunk `retryPipeline(pipelineId)` con `rejectWithValue({ message, statusCode })`
- [ ] [T-011] `PipelineStatus.jsx`: agregar botón "Reintentar" en filas con estado `failed`; guard con `hasPermission(FunctionCatalog.RETRY_PIPELINE)`; despachar thunk; mostrar feedback toast
- [ ] [T-012] Tests `PipelineStatusPage.test.jsx`: render con item failed, botón visible, click despacha thunk, botón oculto sin permiso

**Commit II:** `Add UC_PIP_04 retry action to PipelineStatus`

---

## Bloque III — GAP-C2: UC_RPT_08 — Run-now en reportes programados

- [ ] [T-013] `mockInterceptor.js`: agregar handler `POST /schedules/:id/run-now` → `{ success: true, execution_id: 'exec-...' }`
- [ ] [T-014] `src/redux/slices/reports.js`: agregar thunk `runScheduleNow(scheduleId)` (similar a pauseSchedule/resumeSchedule existentes)
- [ ] [T-015] `ScheduledReport.jsx`: agregar botón "Ejecutar ahora" junto a pause/resume/delete; despachar `runScheduleNow`; feedback toast
- [ ] [T-016] Tests `ScheduledReportPage.test.jsx`: nuevo test para acción run-now

**Commit III:** `Add UC_RPT_08 run-now action to ScheduledReport`

---

## Bloque IV — GAP-C4: UC_RPT_11 — Compartir vista guardada

- [ ] [T-017] `mockInterceptor.js`: agregar handler `POST /saved-views/:id/share` → `{ success: true, shared_with: [userId], notification_sent: true }`; `GET /users?search=` para picker de destinatario
- [ ] [T-018] `src/redux/slices/reports.js`: agregar thunk `shareView({ viewId, targetUserIds })`
- [ ] [T-019] `SavedViews.jsx`: agregar botón "Compartir" por fila; abrir modal con selector de usuario (search); submit despacha `shareView`; visible solo con `FunctionCatalog.SHARE_REPORTS`
- [ ] [T-020] Tests `SavedViewsPage.test.jsx`: render, botón visible con permiso, modal se abre, submit llama thunk; botón oculto sin permiso

**Commit IV:** `Add UC_RPT_11 share view feature to SavedViews`

---

## Bloque V — GAP-C3: UC_RPT_09 — CRUD filtros guardados

- [ ] [T-021] `mockInterceptor.js`: agregar handlers `GET /profile/filters`, `POST /profile/filters`, `PUT /profile/filters/:id`, `DELETE /profile/filters/:id`
- [ ] [T-022] `src/redux/slices/user.js`: agregar thunks `fetchSavedFilters`, `createFilter`, `updateFilter`, `deleteFilter`
- [ ] [T-023] `src/pages/auth/SavedFilters.jsx`: nueva página CRUD — lista de filtros guardados (nombre, campos, valor), crear/editar/eliminar; accesible desde Profile o ruta directa
- [ ] [T-024] AppRouter: agregar ruta `/profile/filters` → `SavedFiltersPage` (no requiere guard especial — todos los usuarios)
- [ ] [T-025] `Profile.jsx`: agregar link/tab hacia `/profile/filters`
- [ ] [T-026] Tests `SavedFiltersPage.test.jsx`: render, crear filtro, eliminar filtro

**Commit V:** `Add UC_RPT_09 saved filters CRUD to profile`

---

## Bloque VI — GAP-B1: UC_ADM_01 — SeparationRulesCatalog

- [ ] [T-027] `mockInterceptor.js`: agregar handlers `GET /admin/separation-rules`, `POST /admin/separation-rules`, `PUT /admin/separation-rules/:id`, `PATCH /admin/separation-rules/:id/status` (activate/deactivate)
- [ ] [T-028] `src/redux/slices/admin.js` (o access): agregar thunks `fetchAdminSeparationRules`, `createSeparationRule`, `updateSeparationRule`, `toggleSeparationRuleStatus`
- [ ] [T-029] `src/pages/admin/SeparationRulesCatalog.jsx`: tabla de reglas SoD con columnas (ID, nombre, funciones grupo A, funciones grupo B, estado ACTIVE/INACTIVE); botones crear/editar/activar-desactivar; guard `CREATE_SEPARATION_RULE` para mutaciones
- [ ] [T-030] AppRouter: ruta `/admin/separation-rules` + lazy import + guard `FunctionCatalog.MANAGE_CATALOG`
- [ ] [T-031] AppRouter navLinks: agregar entry "Reglas SoD" al grupo Admin
- [ ] [T-032] Tests `SeparationRulesCatalogPage.test.jsx`: render tabla, crear regla, toggle status

**Commit VI:** `Add UC_ADM_01 SeparationRulesCatalog admin page`

---

## Bloque VII — GAP-B2+B3: UC_ADM_04 + UC_ADM_05 — MenuItemCatalog

> ADM_05 (lifecycle) implementado como sección/tab dentro de ADM_04 (catálogo).
> Decisión: una sola página MenuItemCatalog con tab "Lifecycle" (SP-01 resuelto).

- [ ] [T-033] `mockInterceptor.js`: agregar handlers `GET /admin/menu-items`, `POST /admin/menu-items`, `PUT /admin/menu-items/:id`, `PATCH /admin/menu-items/:id/status` (DRAFT→ACTIVE, ACTIVE→DEPRECATED, etc.)
- [ ] [T-034] `src/redux/slices/admin.js`: agregar thunks `fetchMenuItems`, `createMenuItem`, `updateMenuItem`, `transitionMenuItemStatus`
- [ ] [T-035] `src/pages/admin/MenuItemCatalog.jsx`: tabla de MenuItems (label, icon, route_path, parent, status); tab "Catálogo" (CRUD ADM_04) + tab "Lifecycle" (transiciones de estado ADM_05); guard `MANAGE_MENU_CATALOG` + `MANAGE_MENU_LIFECYCLE`
- [ ] [T-036] AppRouter: ruta `/admin/menu-items` + lazy import + guard `FunctionCatalog.MANAGE_MENU_CATALOG`
- [ ] [T-037] AppRouter navLinks: agregar entry "Menú Items" al grupo Admin
- [ ] [T-038] Tests `MenuItemCatalogPage.test.jsx`: render, crear item, transición DRAFT→ACTIVE, guard MANAGE_MENU_CATALOG oculta mutaciones sin permiso

**Commit VII:** `Add UC_ADM_04+ADM_05 MenuItemCatalog admin page`

---

## Bloque VIII — GAP-D: Mover UserManagement a src/pages/users/

- [ ] [T-039] Crear `src/pages/users/` y mover `src/components/pages/UserManagement/` → `src/pages/users/UserManagement/`; actualizar imports relativos internos
- [ ] [T-040] AppRouter: actualizar import de `@ui/pages/UserManagement` → `@screens/users/UserManagement` (o `../pages/users/UserManagement`)
- [ ] [T-041] Verificar que no hay otros importadores de `@ui/pages/UserManagement`
- [ ] [T-042] Correr `npx jest --no-coverage` — 0 regressions requeridas antes de commit

**Commit VIII:** `Move UserManagement to src/pages/users/ (standard location)`

---

## Cierre

- [ ] [T-043] Ejecutar `npx jest --no-coverage` — verificar ≥ 1820 + N nuevos tests (0 regressions)
- [ ] [T-044] Ejecutar `bash .claude/scripts/validate-phase-completion.sh` — exit code 0
- [ ] [T-045] Crear `track/uc-alignment-full-audit-changelog.md`
- [ ] [T-046] Push branch y actualizar `now.md`

**Total tareas:** 46
