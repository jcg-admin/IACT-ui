```yml
created_at: 2026-05-07 20:39:25
updated_at: 2026-05-07 20:39:25
project: IACT-ui
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Borrador
version: 1.0.0
```

# Task Plan — Auditoría Mock + RBAC v5.6.x

## Contexto

18 hallazgos identificados en 4 dominios (FunctionCatalog, mockInterceptor,
nav sub-menus, permission guards). Todos los hallazgos P0..P2 están IN SCOPE.

## DAG de dependencias

```
T-001 (catalog constants) ──────────────────────────────────────────────────┐
                                                                             │
T-002 (login fix) ────────────────────────────────────────────────────────── ├──→ T-009 (verify end-to-end)
T-003 (admin functions) ──────────────────────────────────────────────────── ├──→ T-009
T-004 (AGR count + SoD fix) ─────────────────────────────────────────────── ├──→ T-009
T-005 (report/menu endpoints) ────────────────────────────────────────────── ├──→ T-009
                                                                             │
T-001 ──→ T-006 (alerts routes + nav) ──→ T-007 (alerts TDD) ──────────────┤
T-001 ──→ T-008 (audit routes + nav) ──→ T-007.5 (audit TDD) ──────────────┤
T-001 ──→ T-010 (availability fix) ─────────────────────────────────────────┤
                                                                             │
All ──→ T-011 (full suite) ──→ T-012..T-014 (cierre WP)
```

---

## Bloque I — FunctionCatalog completeness

- [ ] [T-001] **IMPLEMENT** — Agregar 26 constantes faltantes a `src/permissions/catalog.js`.

  **MOD_Alerts (8):**
  ```js
  CONFIGURE_TEAM_ALERTS:     'alerts:config_team',
  PAUSE_ALERTS:              'alerts:pause',
  DISABLE_ALERTS:            'alerts:disable',
  VIEW_ALERT_HISTORY:        'alerts:history',
  ACKNOWLEDGE_ALERT:         'alerts:acknowledge',
  SUBSCRIBE_ALERT:           'alerts:subscribe',
  UNSUBSCRIBE_ALERT:         'alerts:unsubscribe',
  CONFIGURE_ALERT_SEVERITY:  'alerts:config_severity',
  ```

  **MOD_Pipeline (2):**
  ```js
  VIEW_PIPELINE_ERRORS:      'pipeline:view_errors',
  VIEW_DATA_AVAILABILITY:    'pipeline:availability',
  ```

  **MOD_Users (5):**
  ```js
  LIST_USERS:                'users:list',
  SEARCH_USERS:              'users:search',
  BLOCK_USERS:               'users:block',
  UNBLOCK_USERS:             'users:unblock',
  REACTIVATE_USERS:          'users:reactivate',
  ```

  **MOD_Access (6):**
  ```js
  REVOKE_FUNCTIONS:          'access:revoke',
  ASSIGN_FUNCTION_GROUPS:    'access:assign_group',
  ASSIGN_TO_GROUP:           'access:assign_to_group',
  UPDATE_SOD:                'access:update_sod',
  DISABLE_SOD:               'access:disable_sod',
  REVOKE_EXCEPTIONAL:        'access:revoke_exceptional',
  ```

  **MOD_Auth (2):**
  ```js
  CLOSE_SESSION:             'auth:close_session',
  RESET_PASSWORD:            'auth:reset_password',
  ```

  **MOD_Admin v5.6.x (3):**
  ```js
  MANAGE_MENU_CATALOG:       'adm:manage_menu_catalog',
  MANAGE_MENU_LIFECYCLE:     'adm:manage_menu_lifecycle',
  MANAGE_IS_CRITICAL:        'adm:manage_is_critical',
  ```

  SPEC: H-09..H-14, catalogo-funciones.rst §3.1..3.11.

- [ ] [T-002] **TDD** — Tests para `catalog.js` en `src/permissions/__tests__/catalog.test.js`.
  Verificar que cada nuevo valor coincide con el string canónico del spec:
  ```js
  it('Alerts constants match RBAC v5.6.x spec')
  it('Pipeline constants match RBAC v5.6.x spec')
  it('Users management constants match spec')
  it('Access management constants match spec')
  it('Auth management constants match spec')
  it('Admin v5.6.x extension constants match spec')
  ```
  SPEC: H-09..H-14.

---

## Bloque II — mockInterceptor fixes

- [ ] [T-003] **FIX** — Corregir `_handleLogin` en `src/mocks/mockInterceptor.js`.
  
  Cambiar credenciales demo para que retornen userId válido en PERMISOS_BY_USER_ID:
  ```js
  // Demo analista (AGR-002+AGR-004)
  if (credentials.username === 'demo' && credentials.password === 'demo123') {
    return { status: 200, data: { user: { id: 10, username: 'maria.garcia', ... } } }
  }
  // Admin del sistema (AGR-010)
  if (credentials.username === 'admin' && credentials.password === 'admin123') {
    return { status: 200, data: { user: { id: 99, username: 'sistema.admin', ... } } }
  }
  ```
  
  También actualizar `_handleGetUser` para retornar datos del usuario correcto
  según la sesión activa. Como el mock es stateless, hacer `_handleGetUser` retornar
  los datos de userId=10 para la demo.
  SPEC: H-01, H-06.

- [ ] [T-004] **IMPLEMENT** — Completar `_handleAdminFunctions` con las 67 funciones canónicas.

  Reemplazar el array FUNCTIONS actual (20 entradas) con las 67 funciones de v5.6.x.
  Estructura de cada entrada: `{ id, codename, name, domain, active }`.
  
  Módulos y counts: MOD_Auth(4), MOD_Users(9), MOD_Access(12), MOD_Pipeline(4),
  MOD_Reports(11), MOD_Alerts(10), MOD_Audit(4), MOD_Logs(7), MOD_Admin(6, 3+3 v5.6.x).
  Total: 67 activas.
  
  Las 13 reservadas (MOD_Operator×10 + MOD_Supervision×3) se incluyen con `active: false`.
  SPEC: H-02, catalogo-funciones.rst §3.1..3.11.

- [ ] [T-005] **FIX** — Corregir `_handleAdminAGR` y `_handleSeparationRules`.
  
  `_handleAdminAGR`: Cambiar `functions_count: 6` a `functions_count: 9` para
  `system_admin_group` (AGR-010).
  
  `_handleSeparationRules`: Reemplazar `pipeline:execute` (no canónico) con
  capacidades reales. Usar SoD derivados de los AGRs canónicos:
  ```js
  { id: 1, name: 'SOD-001', description: 'Admin usuarios vs Auditoría',
    group_a: ['users:create', 'users:update', 'users:deactivate'],
    group_b: ['audit:view', 'audit:search', 'audit:export'],
    state: 'ACTIVE', violations: 0 },
  { id: 2, name: 'SOD-002', description: 'Admin permisos vs Auditoría',
    group_a: ['access:assign', 'access:revoke'],
    group_b: ['audit:view', 'audit:search'],
    state: 'ACTIVE', violations: 0 },
  { id: 3, name: 'SOD-003', description: 'Pipeline vs Auditoría',
    group_a: ['pipeline:view_status', 'pipeline:retry'],
    group_b: ['audit:export', 'audit:compliance'],
    state: 'ACTIVE', violations: 0 },
  ```
  SPEC: H-03, H-04.

- [ ] [T-006] **IMPLEMENT** — Agregar handlers para endpoints faltantes.

  **Report endpoints faltantes:**
  ```
  /api/reports/realtime/    → handler _handleRealtimeReport()
  /api/reports/scheduled/   → handler _handleScheduledReports()
  ```
  Nota: `/reports/historical` en nav → hace fetch a `/api/reports/history/` que YA existe
  en `_handleReportHistory`. Verificar el componente — si usa un path diferente, ajustar
  el routing en mockInterceptor. No crear duplicado si el handler ya existe.

  **Menu endpoint:**
  ```
  /api/menu/{userId}/  → handler _handleGetMenu(url)
  ```
  Retornar estructura de menú básica compatible con lo que espera `useMenu()` hook.
  Revisar `src/hooks/usePermisos.ts` para conocer el formato esperado del response.
  SPEC: H-05.

---

## Bloque III — Alerts sub-menus

- [ ] [T-007] **IMPLEMENT** — Registrar sub-rutas de Alertas en `AppRouter.jsx`.
  
  Agregar imports lazy para los 4 sub-pages:
  ```js
  const AlertConfigPage = lazy(() => import('@pages/alerts/AlertConfigPage'))
  const AlertHistoryPage = lazy(() => import('@pages/alerts/AlertHistoryPage'))
  const TemplatesPage = lazy(() => import('@pages/alerts/TemplatesPage'))
  const SubscriptionsPage = lazy(() => import('@pages/alerts/SubscriptionsPage'))
  ```
  
  Registrar rutas con ProtectedRoute dentro de `/alerts/*`:
  - `/alerts` → AlertsPage (VIEW_ALERTS) — ya existe
  - `/alerts/config` → AlertConfigPage (MANAGE_ALERTS)
  - `/alerts/history` → AlertHistoryPage (VIEW_ALERT_HISTORY)
  - `/alerts/templates` → TemplatesPage (CONFIGURE_TEAM_ALERTS)
  - `/alerts/subscriptions` → SubscriptionsPage (SUBSCRIBE_ALERT)
  
  SPEC: H-16, D.1 del diagnóstico.

- [ ] [T-008] **IMPLEMENT** — Agregar children de Alertas a `ALL_NAV_LINKS` (id=6).
  
  ```js
  {
    id: 6, label: 'Alertas', icon: 'bell', path: '/alerts',
    permission: FunctionCatalog.VIEW_ALERTS,
    children: [
      { label: 'Ver alertas',    icon: 'bell',         path: '/alerts',               permission: FunctionCatalog.VIEW_ALERTS },
      { label: 'Configurar',     icon: 'sliders-h',    path: '/alerts/config',        permission: FunctionCatalog.MANAGE_ALERTS },
      { label: 'Historial',      icon: 'history',      path: '/alerts/history',       permission: FunctionCatalog.VIEW_ALERT_HISTORY },
      { label: 'Plantillas',     icon: 'clipboard-list',path: '/alerts/templates',   permission: FunctionCatalog.CONFIGURE_TEAM_ALERTS },
      { label: 'Suscripciones',  icon: 'rss',          path: '/alerts/subscriptions', permission: FunctionCatalog.SUBSCRIBE_ALERT },
    ]
  }
  ```
  
  Requires T-001 (CONFIGURE_TEAM_ALERTS, VIEW_ALERT_HISTORY, SUBSCRIBE_ALERT).
  SPEC: H-16, D.1 del diagnóstico.

---

## Bloque IV — Audit sub-menus

- [ ] [T-009] **IMPLEMENT** — Registrar sub-rutas de Auditoría en `AppRouter.jsx`.
  
  Agregar imports lazy:
  ```js
  const AuditSearchPage = lazy(() => import('@pages/audit/AuditSearchPage'))
  const AuditExportPage = lazy(() => import('@pages/audit/ExportPage'))
  const ComplianceReportPage = lazy(() => import('@pages/audit/ComplianceReportPage'))
  ```
  
  Registrar rutas dentro de `/audit/*`:
  - `/audit` → AuditPage (VIEW_AUDIT) — ya existe
  - `/audit/search` → AuditSearchPage (SEARCH_AUDIT)
  - `/audit/export` → AuditExportPage (EXPORT_AUDIT)
  - `/audit/compliance` → ComplianceReportPage (VIEW_COMPLIANCE)
  
  SPEC: H-17, D.2 del diagnóstico.

- [ ] [T-010] **IMPLEMENT** — Agregar children de Auditoría a `ALL_NAV_LINKS` (id=5).
  
  ```js
  {
    id: 5, label: 'Auditoría', icon: 'history', path: '/audit',
    permission: FunctionCatalog.VIEW_AUDIT,
    children: [
      { label: 'Log de auditoría', icon: 'list',          path: '/audit',             permission: FunctionCatalog.VIEW_AUDIT },
      { label: 'Buscar',           icon: 'search',         path: '/audit/search',     permission: FunctionCatalog.SEARCH_AUDIT },
      { label: 'Exportar',         icon: 'file-download',  path: '/audit/export',     permission: FunctionCatalog.EXPORT_AUDIT },
      { label: 'Cumplimiento',     icon: 'shield-alt',     path: '/audit/compliance', permission: FunctionCatalog.VIEW_COMPLIANCE },
    ]
  }
  ```
  
  SPEC: H-17, D.2 del diagnóstico.

---

## Bloque V — Permission guard fixes

- [ ] [T-011] **FIX** — Corregir permission guard del sub-ítem "Disponibilidad" en Logs.
  
  En `ALL_NAV_LINKS` (Logs children), cambiar:
  ```js
  // ANTES:
  { label: 'Disponibilidad', ..., path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_PIPELINE_LOGS }
  // DESPUÉS:
  { label: 'Disponibilidad', ..., path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_DATA_AVAILABILITY }
  ```
  
  Requires T-001 (VIEW_DATA_AVAILABILITY).
  SPEC: H-15.

- [ ] [T-012] **FIX** — Corregir semántica de MANAGE_ACCESS en nav items y route guards.
  
  En `ALL_NAV_LINKS` (Access children):
  ```js
  // "Agrupadores", "Segmentos", "Asignar grupo" — cambiar a ASSIGN_FUNCTION_GROUPS
  { label: 'Agrupadores', ..., permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS }
  { label: 'Segmentos',   ..., permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS }
  { label: 'Asignar grupo',..., permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS }
  ```
  
  También actualizar las routes en AppRouter que usan MANAGE_ACCESS para esas rutas.
  
  Requires T-001 (ASSIGN_FUNCTION_GROUPS = 'access:assign_group').
  SPEC: H-18.

---

## Bloque VI — TDD de integración

- [ ] [T-013] **TDD** — Tests de integración para Alerts y Audit nav filtering.
  En `AppRouter.test.jsx`:
  ```js
  // Alerts nav
  it('usuario con VIEW_ALERTS pero sin MANAGE_ALERTS no ve "Configurar" en Alertas')
  it('usuario con VIEW_ALERT_HISTORY ve sub-ítem Historial')
  it('usuario sin VIEW_ALERTS no ve el grupo Alertas')
  
  // Audit nav
  it('usuario con VIEW_AUDIT pero sin SEARCH_AUDIT no ve sub-ítem Buscar')
  it('usuario con EXPORT_AUDIT ve sub-ítem Exportar')
  it('usuario con VIEW_COMPLIANCE ve sub-ítem Cumplimiento')
  ```
  Mockear `usePermisos` para controlar las capacidades.
  SPEC: H-16, H-17.

---

## Bloque VII — Cierre formal WP

- [ ] [T-014] **VERIFY** — Suite completa. Target: ≥ 1769 tests + nuevos (sin regressions).
  ```bash
  npm test -- --watchAll=false 2>&1 | tail -5
  ```

- [ ] [T-015] **TRACK** — Crear `track/mock-rbac-full-audit-changelog.md`.

- [ ] [T-016] **TRACK** — Crear `track/mock-rbac-full-audit-lessons.md` (≥ 3 lecciones).

- [ ] [T-017] **CLOSE** — Actualizar `wp-state.md` + `now.md`. Push + validate-phase-completion.sh.

---

## Métricas de éxito

| Métrica | Objetivo |
|---------|----------|
| Tests verdes | ≥ 1769 + nuevos |
| catalog.js constantes | 61 total (35 actuales + 26 nuevas) |
| Demo login → permisos | userId=10, capacidades visibles |
| _handleAdminFunctions | 67 funciones activas + 13 reservadas |
| Alerts en sidebar | grupo accordion con 5 children |
| Audit en sidebar | grupo accordion con 4 children |
| "Disponibilidad" guard | pipeline:availability |
| SoD codenames | solo capacidades canónicas |

## Commits por bloque

- Bloque I: `Add 26 missing FunctionCatalog constants for RBAC v5.6.x`
- Bloque II: `Fix mockInterceptor alignment with RBAC v5.6.x spec`
- Bloque III+IV: `Add Alerts and Audit accordion sub-menus to sidebar`
- Bloque V: `Fix permission guard mismatches in nav`
- Bloque VI+VII: `TDD for Alerts/Audit nav + full suite verification`
