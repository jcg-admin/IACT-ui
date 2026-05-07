```yml
created_at: 2026-05-07 20:39:25
updated_at: 2026-05-07 21:10:00
project: IACT-ui
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Aprobado
version: 2.0.0
```

# Task Plan — Auditoría Mock + RBAC v5.6.x

## Restricción de naming

Todo identifier nuevo (variable, constante, thunk, prop) usa `separationRule` /
`SEPARATION_RULE` / `SR-` — nunca `sod`, `Sod`, `SOD`.
Los capacity strings del backend (`access:view_sod`, `adm:create_sod`, etc.) provienen
del spec canónico y NO se modifican (son opaque strings del API).

## Alcance total

**Bloque I:** FunctionCatalog — 26 nuevas constantes  
**Bloque II:** Naming cleanup — renombrar `SodRule`/`SOD_RULES`/`SOD-00x` en 6 archivos + 5 tests  
**Bloque III:** mockInterceptor — 4 fixes (login, functions, AGR, endpoints)  
**Bloque IV:** Alerts sub-menú — rutas + nav + TDD  
**Bloque V:** Audit sub-menú — rutas + nav + TDD  
**Bloque VI:** Permission guards — 2 fixes  
**Bloque VII:** Cierre formal WP  

## DAG de dependencias

```
T-001 (catalog constants)
    ├──→ T-009 (alerts nav — usa CONFIGURE_TEAM_ALERTS, VIEW_ALERT_HISTORY, SUBSCRIBE_ALERT)
    ├──→ T-011 (audit nav — usa SEARCH_AUDIT, EXPORT_AUDIT, VIEW_COMPLIANCE — ya existen)
    └──→ T-014 (disponibilidad fix — usa VIEW_DATA_AVAILABILITY)

T-002 (catalog TDD)  ←── T-001

T-003 (accessSlice rename)
    └──→ T-004 (SeparationRulesPage imports)

T-003..T-006 (naming cleanup) → T-007 (naming tests)

T-008 (mock login fix)
T-009.a (mock functions 67)    ← T-009.a y T-009.b = T-009 split del bloque III
T-009.b (mock AGR + endpoints)

T-001 + T-003..T-006 → T-010 (alerts routes) → T-011 (alerts nav + TDD)
T-001 + T-003..T-006 → T-012 (audit routes) → T-013 (audit nav + TDD)

T-014 (availability guard fix)    ←── T-001
T-015 (MANAGE_ACCESS fix)

All → T-016 (full suite) → T-017..T-019 (cierre)
```

---

## Bloque I — FunctionCatalog completeness

- [ ] [T-001] **IMPLEMENT** — Agregar 26 constantes faltantes a `src/permissions/catalog.js`.

  Agregar cada sección al final del módulo correspondiente:

  ```js
  // MOD_Alerts — extended (NUEVAS v5.4.0 — ALR-003..010)
  CONFIGURE_TEAM_ALERTS:    'alerts:config_team',
  PAUSE_ALERTS:             'alerts:pause',
  DISABLE_ALERTS:           'alerts:disable',
  VIEW_ALERT_HISTORY:       'alerts:history',
  ACKNOWLEDGE_ALERT:        'alerts:acknowledge',
  SUBSCRIBE_ALERT:          'alerts:subscribe',
  UNSUBSCRIBE_ALERT:        'alerts:unsubscribe',
  CONFIGURE_ALERT_SEVERITY: 'alerts:config_severity',

  // MOD_Pipeline — extended (NUEVAS — PIP-002/003)
  VIEW_PIPELINE_ERRORS:     'pipeline:view_errors',
  VIEW_DATA_AVAILABILITY:   'pipeline:availability',

  // MOD_Users — extended (NUEVAS — USR-004..008)
  LIST_USERS:               'users:list',
  SEARCH_USERS:             'users:search',
  BLOCK_USERS:              'users:block',
  UNBLOCK_USERS:            'users:unblock',
  REACTIVATE_USERS:         'users:reactivate',

  // MOD_Access — extended (NUEVAS v5.3.0/v5.4.0)
  REVOKE_FUNCTIONS:         'access:revoke',
  ASSIGN_FUNCTION_GROUPS:   'access:assign_group',
  ASSIGN_TO_GROUP:          'access:assign_to_group',
  UPDATE_SEPARATION_RULE:   'access:update_sod',
  DISABLE_SEPARATION_RULE:  'access:disable_sod',
  REVOKE_EXCEPTIONAL:       'access:revoke_exceptional',

  // MOD_Auth — extended (NUEVAS — AUTH-002/003)
  CLOSE_SESSION:            'auth:close_session',
  RESET_PASSWORD:           'auth:reset_password',

  // MOD_Admin — v5.6.x extension (ADM-004..006)
  MANAGE_MENU_CATALOG:      'adm:manage_menu_catalog',
  MANAGE_MENU_LIFECYCLE:    'adm:manage_menu_lifecycle',
  MANAGE_IS_CRITICAL:       'adm:manage_is_critical',
  ```

  SPEC: catalogo-funciones.rst §3.1..3.11. NAMING: `UPDATE_SEPARATION_RULE` y
  `DISABLE_SEPARATION_RULE` — sin SOD en el nombre de la constante.

- [ ] [T-002] **TDD** — Tests en `src/permissions/__tests__/catalog.test.js`.

  Agregar bloque `describe('FunctionCatalog v5.6.x extension')` con:
  - Cada nueva constante tiene el valor canónico del spec
  - `UPDATE_SEPARATION_RULE` mapea a `'access:update_sod'`
  - `DISABLE_SEPARATION_RULE` mapea a `'access:disable_sod'`
  - No hay constantes que contengan `'SOD'` en el nombre del key (verificar con
    `Object.keys(FunctionCatalog).every(k => !k.includes('SOD'))`)
  SPEC: catalogo-funciones.rst §3.1..3.11.

---

## Bloque II — Naming cleanup (SOD → separation-rule)

**Inventario de cambios requeridos:**

| Archivo | Cambio |
|---------|--------|
| `redux/slices/accessSlice.js` | thunks: `fetchSodRules`→`fetchSeparationRules`, `createSodRule`→`createSeparationRule`, `updateSodRule`→`updateSeparationRule`, `deleteSodRule`→`deleteSeparationRule`; action types: `access/fetchSodRules`→`access/fetchSeparationRules`, etc. |
| `pages/access/SeparationRulesPage.jsx` | imports + usos: `fetchSodRules`→`fetchSeparationRules`, `updateSodRule`→`updateSeparationRule`, `deleteSodRule`→`deleteSeparationRule`; var: `sodRules`→`separationRules` |
| `components/access/SeparationRulesValidator.jsx` | var: `SOD_RULES_INFO`→`SEPARATION_RULES_INFO`; keys: `'SOD-001'`→`'SR-001'`, `'SOD-002'`→`'SR-002'`, `'SOD-003'`→`'SR-003'` |
| `components/access/FunctionSelector.jsx` | var: `SOD_RULES`→`SEPARATION_RULES`; keys: `'SOD-001'`→`'SR-001'`, etc. |
| `pages/access/AssignFunctionsPage.jsx` | texto JSX: `SOD-001`→`SR-001`, etc. |
| `pages/audit/ComplianceReportPage.jsx` | `regulations: ['SOD']`→`regulations: ['separation-rules']` |
| `mocks/mockInterceptor.js` | en `_handleSeparationRules`: `name/code 'SOD-001'`→`'SR-001'`, `'SOD-002'`→`'SR-002'`, `'SOD-003'`→`'SR-003'`; corregir `pipeline:execute`→ codenames canónicos |

- [ ] [T-003] **REFACTOR** — Renombrar thunks en `src/redux/slices/accessSlice.js`.

  Cambios (replace_all):
  - `fetchSodRules` → `fetchSeparationRules` (función + action type `access/fetchSodRules`→`access/fetchSeparationRules`)
  - `createSodRule` → `createSeparationRule`
  - `updateSodRule` → `updateSeparationRule`
  - `deleteSodRule` → `deleteSeparationRule`

  Los exports con nombre nuevo. Verificar que los `addCase` en `extraReducers` usen
  los nuevos nombres de thunk. SPEC: naming convention (no Sod en identifiers).

- [ ] [T-004] **REFACTOR** — Actualizar `src/pages/access/SeparationRulesPage.jsx`.

  - Imports: usar `fetchSeparationRules`, `updateSeparationRule`, `deleteSeparationRule`
  - Variables locales: `sodRules` → `separationRules`
  - Todos los `dispatch(fetchSodRules(...))` → `dispatch(fetchSeparationRules(...))`
  - `dispatch(updateSodRule(...))` → `dispatch(updateSeparationRule(...))`
  - `dispatch(deleteSodRule(...))` → `dispatch(deleteSeparationRule(...))`
  SPEC: naming convention.

- [ ] [T-005] **REFACTOR** — `src/components/access/SeparationRulesValidator.jsx`.

  - `const SOD_RULES_INFO` → `const SEPARATION_RULES_INFO`
  - Keys del objeto: `'SOD-001'` → `'SR-001'`, `'SOD-002'` → `'SR-002'`, `'SOD-003'` → `'SR-003'`
  - Uso: `SOD_RULES_INFO[conflict.rule]` → `SEPARATION_RULES_INFO[conflict.rule]`
  SPEC: naming convention.

- [ ] [T-006] **REFACTOR** — `src/components/access/FunctionSelector.jsx`.

  - `const SOD_RULES` → `const SEPARATION_RULES`
  - Keys: `'SOD-001'` → `'SR-001'`, etc.
  - `Object.entries(SOD_RULES)` → `Object.entries(SEPARATION_RULES)`
  SPEC: naming convention.

- [ ] [T-007] **REFACTOR** — Textos y datos residuales.

  En `src/pages/access/AssignFunctionsPage.jsx`:
  ```jsx
  // ANTES:
  <li>SOD-001: PIP-* incompatible con AUD-*</li>
  <li>SOD-002: USR-* incompatible con AUD-*</li>
  <li>SOD-003: ACC-* incompatible con AUD-*</li>
  // DESPUÉS:
  <li>SR-001: PIP-* incompatible con AUD-*</li>
  <li>SR-002: USR-* incompatible con AUD-*</li>
  <li>SR-003: ACC-* incompatible con AUD-*</li>
  ```

  En `src/pages/audit/ComplianceReportPage.jsx`:
  ```js
  // ANTES: regulations: ['SOD']
  // DESPUÉS: regulations: ['separation-rules']
  ```
  SPEC: naming convention.

- [ ] [T-008] **TDD** — Actualizar 5 test files que referencian naming antiguo.

  Archivos:
  - `src/redux/slices/__tests__/accessSlice.test.js` — imports y usos de `fetchSodRules` etc.
  - `src/pages/access/__tests__/SeparationRulesPage.test.jsx` — mocks de thunks
  - `src/pages/access/__tests__/remainingAccessPages.test.jsx` — referencias SOD
  - `src/components/access/__tests__/FunctionSelector.test.jsx` — referencias SOD_RULES
  - `src/components/access/__tests__/accessComponents.test.jsx` — referencias SOD

  Para cada uno: actualizar imports y mocks para usar los nuevos nombres.
  No agregar casos nuevos — solo actualizar los existentes para que compilen y pasen.
  SPEC: naming convention.

---

## Bloque III — mockInterceptor alignment

- [ ] [T-009] **FIX** — Corregir `_handleLogin` en `src/mocks/mockInterceptor.js`.

  ```js
  _handleLogin(credentials) {
    // Demo analista (AGR-002+AGR-004) — retorna userId válido en PERMISOS_BY_USER_ID
    if (credentials.username === 'demo' && credentials.password === 'demo123') {
      return {
        status: 200,
        data: {
          user: {
            id: 10,
            username: 'maria.garcia',
            email: 'maria.garcia@callcenter.com',
            first_name: 'María', last_name: 'García',
            role: 'analyst',
            date_joined: new Date().toISOString(),
          },
        },
      };
    }
    // Admin del sistema (AGR-010)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        status: 200,
        data: {
          user: {
            id: 99,
            username: 'sistema.admin',
            email: 'sistema.admin@callcenter.com',
            first_name: 'Sistema', last_name: 'Admin',
            role: 'sysadmin',
            date_joined: new Date().toISOString(),
          },
        },
      };
    }
    return this._error(401, 'Invalid credentials');
  }
  ```

  También actualizar `_handleGetUser` para retornar id=10 (demo analista).
  SPEC: H-01, H-06.

- [ ] [T-010] **IMPLEMENT** — Completar `_handleAdminFunctions` con las 67 funciones canónicas.

  Reemplazar el array FUNCTIONS (20 entradas) con las 67 funciones activas del spec.
  Usar el orden de módulos del catálogo: MOD_Auth(4), MOD_Users(9), MOD_Access(12),
  MOD_Pipeline(4), MOD_Reports(11), MOD_Alerts(10), MOD_Audit(4), MOD_Logs(7),
  MOD_Admin(6: 3 baseline + 3 v5.6.x).

  Las 13 reservadas (MOD_Operator×10 + MOD_Supervision×3) agregar con `active: false`
  al final del array.

  Estructura de cada entrada: `{ id, codename, name, domain, active }`.
  SPEC: H-02, catalogo-funciones.rst §3.1..3.11.

- [ ] [T-011] **FIX** — Corregir datos en `_handleAdminAGR` y `_handleSeparationRules`.

  `_handleAdminAGR`: Cambiar `functions_count: 6` → `functions_count: 9` para
  `system_admin_group` (id=10, AGR-010).

  `_handleSeparationRules`: Reemplazar los 3 SoD con codenames canónicos y usar
  prefijo `SR-` en name/code:
  ```js
  [
    {
      id: 1, name: 'SR-001', code: 'SR-001',
      description: 'Admin usuarios vs Auditoría',
      group_a: ['users:create', 'users:update', 'users:deactivate'],
      group_b: ['audit:view', 'audit:search', 'audit:export'],
      state: 'ACTIVE', violations: 0,
    },
    {
      id: 2, name: 'SR-002', code: 'SR-002',
      description: 'Admin permisos vs Auditoría',
      group_a: ['access:assign', 'access:revoke'],
      group_b: ['audit:view', 'audit:search'],
      state: 'ACTIVE', violations: 0,
    },
    {
      id: 3, name: 'SR-003', code: 'SR-003',
      description: 'Pipeline vs Auditoría',
      group_a: ['pipeline:view_status', 'pipeline:retry'],
      group_b: ['audit:export', 'audit:compliance'],
      state: 'ACTIVE', violations: 0,
    },
  ]
  ```
  SPEC: H-03, H-04.

- [ ] [T-012] **IMPLEMENT** — Agregar handlers para endpoints faltantes en `mockInterceptor.js`.

  **Verificar primero:** `/reports/historical` en el componente hace fetch a
  `/api/reports/history/` (ya existe handler `_handleReportHistory`) — NO crear duplicado.
  Verificar en `HistoricalReportsPage.jsx` qué endpoint llama.

  **Agregar handlers nuevos:**

  `/api/permisos/verificar/{userId}/menu/` → `_handleGetMenu(url)`:
  ```js
  _handleGetMenu(url) {
    const match = url.match(/\/api\/permisos\/verificar\/(\d+)\/menu\//)
    const userId = parseInt(match[1], 10)
    return {
      status: 200,
      data: {
        usuario_id: userId,
        menu: {
          reports: ['view_reports', 'view_dashboard'],
          alerts:  ['view_alerts'],
          logs:    ['view_application_logs'],
          admin:   userId === 99 ? ['manage_function_catalog'] : [],
        },
      },
    }
  }
  ```

  `/api/reports/realtime/` → `_handleRealtimeMetrics()` (retornar métricas básicas):
  ```js
  _handleRealtimeMetrics() {
    return {
      status: 200,
      data: {
        active_calls: 42,
        agents_available: 12,
        queue_length: 7,
        avg_handle_time: 185,
        timestamp: new Date().toISOString(),
      },
    }
  }
  ```

  `/api/reports/scheduled/` → `_handleScheduledReports(method, body)` (GET lista, POST crear):
  ```js
  _handleScheduledReports(method, body) {
    const SCHEDULED = [
      { id: 1, name: 'Reporte diario agentes', frequency: 'daily', next_run: '2026-05-08T08:00:00Z', active: true },
      { id: 2, name: 'Resumen semanal campañas', frequency: 'weekly', next_run: '2026-05-12T08:00:00Z', active: true },
    ]
    if (method === 'POST') {
      return { status: 201, data: { ...body, id: 99, active: true } }
    }
    return { status: 200, data: { results: SCHEDULED, count: SCHEDULED.length } }
  }
  ```

  Agregar las 3 rutas al `intercept()`:
  ```js
  if (url.match(/\/api\/permisos\/verificar\/\d+\/menu\//)) {
    return this._handleGetMenu(url)
  }
  if (url.includes('/api/reports/realtime/')) {
    return this._handleRealtimeMetrics()
  }
  if (url.includes('/api/reports/scheduled/')) {
    return this._handleScheduledReports(method, body)
  }
  ```
  SPEC: H-05.

---

## Bloque IV — Alerts sub-menú

- [ ] [T-013] **IMPLEMENT** — Registrar sub-rutas de Alertas en `src/router/AppRouter.jsx`.

  Agregar imports lazy:
  ```js
  const AlertConfigPage     = lazy(() => import('@pages/alerts/AlertConfigPage'))
  const AlertHistoryPage    = lazy(() => import('@pages/alerts/AlertHistoryPage'))
  const AlertTemplatesPage  = lazy(() => import('@pages/alerts/TemplatesPage'))
  const SubscriptionsPage   = lazy(() => import('@pages/alerts/SubscriptionsPage'))
  ```

  Reemplazar el bloque `/alerts/*` actual (catch-all simple) con rutas individuales:
  ```jsx
  <Route path="/alerts" element={<ProtectedRoute permission={FunctionCatalog.VIEW_ALERTS}>
    <Suspense fallback={<RouteLoadingFallback />}><AlertsPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/alerts/config" element={<ProtectedRoute permission={FunctionCatalog.MANAGE_ALERTS}>
    <Suspense fallback={<RouteLoadingFallback />}><AlertConfigPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/alerts/history" element={<ProtectedRoute permission={FunctionCatalog.VIEW_ALERT_HISTORY}>
    <Suspense fallback={<RouteLoadingFallback />}><AlertHistoryPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/alerts/templates" element={<ProtectedRoute permission={FunctionCatalog.CONFIGURE_TEAM_ALERTS}>
    <Suspense fallback={<RouteLoadingFallback />}><AlertTemplatesPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/alerts/subscriptions" element={<ProtectedRoute permission={FunctionCatalog.SUBSCRIBE_ALERT}>
    <Suspense fallback={<RouteLoadingFallback />}><SubscriptionsPage /></Suspense>
  </ProtectedRoute>} />
  ```

  Requires T-001 (VIEW_ALERT_HISTORY, CONFIGURE_TEAM_ALERTS, SUBSCRIBE_ALERT).
  SPEC: H-16.

- [ ] [T-014] **IMPLEMENT** — Agregar children de Alertas a `ALL_NAV_LINKS` (id=6).

  Reemplazar la entrada plana de Alertas con:
  ```js
  {
    id: 6, label: 'Alertas', icon: 'bell', path: '/alerts',
    permission: FunctionCatalog.VIEW_ALERTS,
    children: [
      { label: 'Ver alertas',    icon: 'bell',          path: '/alerts',               permission: FunctionCatalog.VIEW_ALERTS },
      { label: 'Configurar',     icon: 'sliders-h',     path: '/alerts/config',        permission: FunctionCatalog.MANAGE_ALERTS },
      { label: 'Historial',      icon: 'history',       path: '/alerts/history',       permission: FunctionCatalog.VIEW_ALERT_HISTORY },
      { label: 'Plantillas',     icon: 'clipboard-list',path: '/alerts/templates',     permission: FunctionCatalog.CONFIGURE_TEAM_ALERTS },
      { label: 'Suscripciones',  icon: 'rss',           path: '/alerts/subscriptions', permission: FunctionCatalog.SUBSCRIBE_ALERT },
    ]
  }
  ```
  Requires T-001, T-013. SPEC: H-16.

- [ ] [T-015] **TDD** — Tests para nav de Alertas en `AppRouter.test.jsx`.

  ```js
  describe('Alerts nav filtering')
    it('usuario con VIEW_ALERTS ve el grupo Alertas')
    it('usuario con VIEW_ALERTS y sin MANAGE_ALERTS no ve "Configurar"')
    it('usuario con VIEW_ALERT_HISTORY ve sub-ítem Historial')
    it('usuario con CONFIGURE_TEAM_ALERTS ve sub-ítem Plantillas')
    it('usuario sin VIEW_ALERTS no ve el grupo Alertas entero')
  ```
  SPEC: H-16.

---

## Bloque V — Audit sub-menú

- [ ] [T-016] **IMPLEMENT** — Registrar sub-rutas de Auditoría en `src/router/AppRouter.jsx`.

  Agregar imports lazy:
  ```js
  const AuditSearchPage       = lazy(() => import('@pages/audit/AuditSearchPage'))
  const AuditExportPage       = lazy(() => import('@pages/audit/ExportPage'))
  const ComplianceReportPage  = lazy(() => import('@pages/audit/ComplianceReportPage'))
  ```

  Reemplazar el bloque `/audit/*` con rutas individuales:
  ```jsx
  <Route path="/audit" element={<ProtectedRoute permission={FunctionCatalog.VIEW_AUDIT}>
    <Suspense fallback={<RouteLoadingFallback />}><AuditPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/audit/search" element={<ProtectedRoute permission={FunctionCatalog.SEARCH_AUDIT}>
    <Suspense fallback={<RouteLoadingFallback />}><AuditSearchPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/audit/export" element={<ProtectedRoute permission={FunctionCatalog.EXPORT_AUDIT}>
    <Suspense fallback={<RouteLoadingFallback />}><AuditExportPage /></Suspense>
  </ProtectedRoute>} />
  <Route path="/audit/compliance" element={<ProtectedRoute permission={FunctionCatalog.VIEW_COMPLIANCE}>
    <Suspense fallback={<RouteLoadingFallback />}><ComplianceReportPage /></Suspense>
  </ProtectedRoute>} />
  ```

  Nota: SEARCH_AUDIT, EXPORT_AUDIT, VIEW_COMPLIANCE ya existen en catalog.js actual.
  SPEC: H-17.

- [ ] [T-017] **IMPLEMENT** — Agregar children de Auditoría a `ALL_NAV_LINKS` (id=5).

  Reemplazar la entrada plana de Auditoría con:
  ```js
  {
    id: 5, label: 'Auditoría', icon: 'history', path: '/audit',
    permission: FunctionCatalog.VIEW_AUDIT,
    children: [
      { label: 'Log de auditoría', icon: 'list',         path: '/audit',             permission: FunctionCatalog.VIEW_AUDIT },
      { label: 'Buscar',           icon: 'search',       path: '/audit/search',      permission: FunctionCatalog.SEARCH_AUDIT },
      { label: 'Exportar',         icon: 'file-download',path: '/audit/export',      permission: FunctionCatalog.EXPORT_AUDIT },
      { label: 'Cumplimiento',     icon: 'shield-alt',   path: '/audit/compliance',  permission: FunctionCatalog.VIEW_COMPLIANCE },
    ]
  }
  ```
  Requires T-016. SPEC: H-17.

- [ ] [T-018] **TDD** — Tests para nav de Auditoría en `AppRouter.test.jsx`.

  ```js
  describe('Audit nav filtering')
    it('usuario con VIEW_AUDIT ve el grupo Auditoría')
    it('usuario con VIEW_AUDIT y sin SEARCH_AUDIT no ve sub-ítem Buscar')
    it('usuario con EXPORT_AUDIT ve sub-ítem Exportar')
    it('usuario con VIEW_COMPLIANCE ve sub-ítem Cumplimiento')
    it('usuario sin VIEW_AUDIT no ve el grupo Auditoría')
  ```
  SPEC: H-17.

---

## Bloque VI — Permission guard fixes

- [ ] [T-019] **FIX** — Corregir guard del sub-ítem "Disponibilidad" en `ALL_NAV_LINKS`.

  En el array children del grupo Logs (id=7):
  ```js
  // ANTES:
  { label: 'Disponibilidad', ..., path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_PIPELINE_LOGS }
  // DESPUÉS:
  { label: 'Disponibilidad', ..., path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_DATA_AVAILABILITY }
  ```

  Requires T-001 (VIEW_DATA_AVAILABILITY). SPEC: H-15.

- [ ] [T-020] **FIX** — Corregir semántica de `MANAGE_ACCESS` en nav items de Acceso.

  En `ALL_NAV_LINKS` children de Acceso (id=4), cambiar los tres items que usan
  `FunctionCatalog.MANAGE_ACCESS` por `FunctionCatalog.ASSIGN_FUNCTION_GROUPS`:
  ```js
  { label: 'Agrupadores', ..., permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS },
  { label: 'Segmentos',   ..., permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS },
  { label: 'Asignar grupo',..., permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS },
  ```

  También actualizar las `<ProtectedRoute>` correspondientes en AppRouter para esas rutas.
  Requires T-001 (ASSIGN_FUNCTION_GROUPS = 'access:assign_group'). SPEC: H-18.

---

## Bloque VII — Cierre formal WP

- [ ] [T-021] **VERIFY** — Suite completa. Target: ≥ 1769 tests + nuevos (sin regressions).
  ```bash
  npm test -- --watchAll=false 2>&1 | tail -10
  ```

- [ ] [T-022] **TRACK** — Crear `track/mock-rbac-full-audit-changelog.md`.

- [ ] [T-023] **TRACK** — Crear `track/mock-rbac-full-audit-lessons.md` (≥ 3 lecciones).

- [ ] [T-024] **CLOSE** — Actualizar `wp-state.md` + `now.md`. Push + validate-phase-completion.sh.

---

## Métricas de éxito

| Métrica | Objetivo |
|---------|----------|
| Tests verdes | ≥ 1769 + nuevos, 0 regressions |
| `grep -rn "SodRule\|sodRule\|SOD_RULES" src/ --include="*.js" --include="*.jsx"` | 0 resultados |
| catalog.js constantes | 61 total (35 + 26 nuevas) |
| Demo login → permisos | userId=10, capacidades visibles |
| `_handleAdminFunctions` | 67 activas + 13 reservadas |
| Alerts en sidebar | grupo accordion, 5 children |
| Audit en sidebar | grupo accordion, 4 children |
| Guard "Disponibilidad" | `pipeline:availability` |

## Commits por bloque

| Bloque | Mensaje |
|--------|---------|
| I (T-001..T-002) | `Add 26 missing FunctionCatalog constants for RBAC v5.6.x` |
| II (T-003..T-008) | `Rename SodRule identifiers to SeparationRule throughout codebase` |
| III (T-009..T-012) | `Fix mockInterceptor alignment with RBAC v5.6.x spec` |
| IV (T-013..T-015) | `Add Alerts accordion sub-menu with 5 protected routes` |
| V (T-016..T-018) | `Add Audit accordion sub-menu with 4 protected routes` |
| VI (T-019..T-020) | `Fix permission guard mismatches in nav and routes` |
| VII (T-021..T-024) | `WP mock-rbac-full-audit — Phase 11 TRACK complete` |
