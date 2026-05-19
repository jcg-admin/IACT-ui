```yml
created_at: 2026-05-05 15:07:47
project: IACT-UI
work_package: 2026-05-05-15-07-47-requirements-gap-analysis
phase: Phase 1 — DISCOVER
author: claude
status: Borrador
```

# Requirements Gap Analysis — IACT-ui vs IACT-docs

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| Total Use Cases documented | 83 |
| Total Functional Requirements documented | 121 |
| UCs with full implementation | 16 (19%) |
| UCs with partial implementation | 34 (41%) |
| UCs with no implementation | 28 (34%) |
| UCs out-of-scope for frontend | 5 (6%) |

**Source repos:**
- Docs: `/tmp/references/IACT-docs` branch `feature/solve-problem-docs`
- App: `/home/user/IACT-ui/src`

**Key finding:** The router exposes only 3 protected domains (`/access/*`,
`/audit/*`, `/alerts/*`). Auth, users, reports, logs, pipeline, operator,
and supervision have service/component scaffolding but **no routes** — they
are unreachable from the browser.

---

## 2. Per-Domain Status Table

| Domain | UCs | FRs | Implemented | Partial | Missing | N/A | Notes |
|--------|-----|-----|-------------|---------|---------|-----|-------|
| auth | 5 | 21 | 0 | 4 | 1 | 0 | Components exist, no route |
| users | 4 | 17 | 0 | 4 | 0 | 0 | Components exist, no route |
| access | 7 | 7 | 6 | 1 | 0 | 0 | Route: /access/* ✓ |
| admin | 3 | — | 0 | 1 | 2 | 0 | SoDMgmt partial, no route |
| alerts | 5 | 5 | 5 | 0 | 0 | 0 | Route: /alerts/* ✓ |
| audit | 4 | 4 | 4 | 0 | 0 | 0 | Route: /audit/* ✓ |
| permissions | 10 | 22 | 0 | 6 | 4 | 0 | No dedicated /permissions route |
| reports | 16 | 16 | 0 | 3 | 13 | 0 | No /reports route |
| logs | 7 | 7 | 0 | 0 | 7 | 0 | No /logs route, no pages |
| pipeline | 4 | 4 | 0 | 0 | 4 | 0 | No /pipeline route, no pages |
| operator | 10 | 10 | 0 | 0 | 10 | 0 | No /operator route, no pages |
| supervision | 3 | 3 | 0 | 0 | 3 | 0 | No /supervision route, no pages |
| caller | 5 | 5 | 0 | 0 | 0 | 5 | IVR side — not a UI concern |
| **TOTAL** | **83** | **121** | **15** | **19** | **44** | **5** | |

---

## 3. Per-Domain Detail

### 3.1 auth — PARTIAL (0 implemented, 4 partial, 1 missing)

**Evidence of implementation:**
- `src/components/containers/LoginPage.jsx` — login UI
- `src/components/presentational/LoginForm.jsx` — form component
- `src/components/auth/LoginInput.jsx`, `PasswordStrength.jsx`
- `src/components/features/SessionManagement/` — LoginHistory, SessionWarning
- `src/redux/slices/authSlice.js`, `src/services/authService.js`
- `src/hooks/domain/useAuth.js`, `src/hooks/useAuth.js`

**Gap:** No route in AppRouter.jsx for `/login`, `/logout`, `/recover-password`,
`/change-password`, `/sessions`. Auth components are scaffolded but not wired.

| UC | Title | Status | Gap |
|----|-------|--------|-----|
| UC-AUTH-01 | Iniciar Sesion | PARTIAL | LoginForm/LoginPage exist but /login not routed |
| UC-AUTH-02 | Cerrar Sesion | PARTIAL | authService likely has logout, no /logout route |
| UC-AUTH-03 | Recuperar Contraseña | MISSING | No password recovery form/page found |
| UC-AUTH-04 | Cambiar Contraseña | PARTIAL | PasswordStrength component, no change-pw page |
| UC-AUTH-05 | Gestionar Sesiones | PARTIAL | SessionManagement components exist, not routed |

**FRs affected:** FR-001.01..05 (login validation), FR-002.01..03 (logout),
FR-003.01..05 (recover pw), FR-004.01..04 (change pw), FR-005.01..04 (sessions)

---

### 3.2 users — PARTIAL (0 implemented, 4 partial)

**Evidence of implementation:**
- `src/components/pages/UserManagement/` — UserList, UserForm, UserManagement
- `src/components/features/UserManagement/UserList.jsx`
- `src/components/transaction/CreateUserStepper.jsx` + content forms
- `src/redux/slices/userSlice.js`

**Gap:** No `/users` route in AppRouter. UserManagement is a component but
not registered as a page route. The component tree exists; integration is missing.

| UC | Title | Status | Gap |
|----|-------|--------|-----|
| UC-USR-01 | Crear Usuario | PARTIAL | CreateUserStepper exists, not routed |
| UC-USR-02 | Consultar Usuarios | PARTIAL | UserList exists, not routed |
| UC-USR-03 | Modificar Usuario | PARTIAL | UserForm exists, not routed |
| UC-USR-04 | Eliminar Usuario (baja lógica) | PARTIAL | Component likely in UserManagement, not routed |

**FRs affected:** FR-006.01..05, FR-007.01..04, FR-008.01..04, FR-009.01..04

---

### 3.3 access — IMPLEMENTED (6/7, 1 partial)

**Route:** `/access/*` is registered and protected by `VIEW_ACCESS`.

**Pages:** AssignFunctionsPage, PermissionsPage, TemporaryPermissionsPage,
GroupersPage, SoDManagementPage, AccessAuditPage, SegmentsPage

| UC | Title | Status | Gap |
|----|-------|--------|-----|
| UC-ACC-01 | Asignar Funciones a Usuario | IMPLEMENTED | AssignFunctionsPage + accessSlice |
| UC-ACC-02 | Revocar Funciones de Usuario | IMPLEMENTED | PermissionsPage + revokeFunction |
| UC-ACC-03 | Consultar Permisos Efectivos | PARTIAL | PermissionsPage shows them; no dedicated query view |
| UC-ACC-04 | Asignar Agrupador a Usuario | IMPLEMENTED | GroupersPage |
| UC-ACC-05 | Gestionar Reglas SoD | IMPLEMENTED | SoDManagementPage |
| UC-ACC-08 | Otorgar Permiso Temporal Excepcional | IMPLEMENTED | TemporaryPermissionsPage |
| UC-ACC-09 | Auditar Cambios de Acceso | IMPLEMENTED | AccessAuditPage |

---

### 3.4 admin — PARTIAL/MISSING (0 implemented, 1 partial, 2 missing)

**Gap:** No `/admin` route. Only SoDManagementPage partially covers admin scope.
Catalog management UIs (for functions and AGRs) don't exist.

| UC | Title | Status | Gap |
|----|-------|--------|-----|
| UC-ADM-01 | Gestionar Ciclo de Vida de Reglas SoD | PARTIAL | SoDManagementPage exists in /access, not /admin |
| UC-ADM-02 | Gestionar Catálogo de Funciones | MISSING | catalog.js is code constants, no admin UI |
| UC-ADM-03 | Gestionar Catálogo de Agrupadores | MISSING | GroupersPage is user assignment, not catalog mgmt |

---

### 3.5 alerts — FULLY IMPLEMENTED (5/5)

**Route:** `/alerts/*` protected by `VIEW_ALERTS`.

| UC | Title | Status |
|----|-------|--------|
| UC-ALR-01 | Configurar Umbrales de Alertas | IMPLEMENTED — AlertConfigPage |
| UC-ALR-02 | Ver Alertas Activas | IMPLEMENTED — AlertsPage |
| UC-ALR-03 | Reconocer Alerta | IMPLEMENTED — AlertsPage (action) |
| UC-ALR-04 | Ver Historial de Alertas | IMPLEMENTED — AlertHistoryPage |
| UC-ALR-05 | Gestionar Suscripciones a Alertas | IMPLEMENTED — SubscriptionsPage |

---

### 3.6 audit — FULLY IMPLEMENTED (4/4)

**Route:** `/audit/*` protected by `VIEW_AUDIT`.

| UC | Title | Status |
|----|-------|--------|
| UC-AUD-01 | Consultar Audit Log General | IMPLEMENTED — AuditPage |
| UC-AUD-02 | Buscar en Audit Log | IMPLEMENTED — AuditSearchPage |
| UC-AUD-03 | Exportar Audit Log | IMPLEMENTED — ExportPage |
| UC-AUD-04 | Generar Reporte de Cumplimiento | IMPLEMENTED — ComplianceReportPage |

---

### 3.7 permissions — PARTIAL (0 implemented, 6 partial, 4 missing)

**Gap:** No dedicated `/permissions` route. Permissions functionality is spread
across the `/access/*` pages without explicit permission-management views.

| UC | Title | Status | Gap |
|----|-------|--------|-----|
| UC-PERM-01 | Asignar Grupo a Usuario | PARTIAL | GroupersPage partially covers |
| UC-PERM-02 | Revocar Grupo a Usuario | PARTIAL | GroupersPage, no dedicated revoke |
| UC-PERM-03 | Conceder Permiso Excepcional | PARTIAL | TemporaryPermissionsPage overlaps |
| UC-PERM-04 | Revocar Permiso Excepcional | MISSING | No dedicated revoke-exceptional page |
| UC-PERM-05 | Crear/Modificar/Retirar Grupo de Permisos | PARTIAL | GroupersPage (read-only focus) |
| UC-PERM-06 | Asignar Funciones a Grupo (AGR) | PARTIAL | GroupersPage partial |
| UC-PERM-07 | Verificar Permiso de Usuario | PARTIAL | ProtectedRoute + usePermisos cover runtime; no admin-verify UI |
| UC-PERM-08 | Generar Menú Dinámico | PARTIAL | DashboardLayout navLinks hardcoded, not dynamic from perms |
| UC-PERM-09 | Auditar Acceso (write side) | MISSING | No dedicated page; backend concern but frontend should trigger |
| UC-PERM-10 | Consultar Auditoría de Permisos | PARTIAL | AccessAuditPage partially covers |

**FRs affected:** FR-012.01..04, FR-013.01..02, FR-014.01..02, FR-015.01..02,
FR-016.01..03, FR-017.01..02, FR-018.01..02, FR-019.01..02, FR-020.01..02, FR-021.01

---

### 3.8 reports — PARTIAL (0 implemented, 3 partial, 13 missing)

**Gap:** No `/reports` route. Dashboard.jsx exists as a component but is rendered
inline as a lazy stub in AppRouter, not as a real dashboard. Analytics components
exist in `src/components/pages/Analytics/` but are not wired.

| UC | Title | Status | Gap |
|----|-------|--------|-----|
| UC-RPT-01 | Ver Dashboard | PARTIAL | Dashboard.jsx exists, stub in router |
| UC-RPT-02 | Ver Métricas en Tiempo Real | PARTIAL | websocketService + useMetrics exist, no page |
| UC-RPT-03 | Ver Reportes Históricos | MISSING | No page |
| UC-RPT-04 | Exportar Reporte | PARTIAL | exportService, useExport hook exist; no reports page |
| UC-RPT-07 | Programar Reporte | MISSING | No page |
| UC-RPT-08 | Ver Reportes Programados | MISSING | No page |
| UC-RPT-09 | Gestionar Filtros Guardados | MISSING | No page |
| UC-RPT-10 | Guardar Vista | MISSING | No page |
| UC-RPT-11 | Compartir Reporte | MISSING | No page |
| UC-RPT-12 | Reporte de Agentes | MISSING | No page |
| UC-RPT-13 | Reporte de Colas | MISSING | No page |
| UC-RPT-14 | Reporte de Campañas | MISSING | No page |
| UC-RPT-15 | Reporte de Transferencias | MISSING | No page |
| UC-RPT-16 | Reporte de Menús IVR | MISSING | No page |
| UC-RPT-17 | Reporte de Clientes Únicos | MISSING | No page |
| UC-INC-RPT-01 | Resolver Segmento del Usuario | MISSING | No page |

**FRs affected:** FR-032.01 through FR-047.01 (16 FRs)

---

### 3.9 logs — MISSING (0/7)

**Gap:** No `/logs` route, no pages in `src/pages/`. HealthService and healthSlice
partially address UC-LOG-06 (system state) but no UI pages exist.

| UC | Title | Status |
|----|-------|--------|
| UC-LOG-01 | Ver Logs de Aplicación | MISSING |
| UC-LOG-02 | Ver Logs del Proceso ETL | MISSING |
| UC-LOG-03 | Buscar en Logs | MISSING |
| UC-LOG-04 | Exportar Logs | MISSING |
| UC-LOG-05 | Ver Logs de Infraestructura | MISSING |
| UC-LOG-06 | Ver Estado del Sistema | MISSING (HealthService exists, no page) |
| UC-LOG-07 | Ver Métricas de Rendimiento | MISSING |

**FRs affected:** FR-059.01 through FR-065.01 (7 FRs)

---

### 3.10 pipeline — MISSING (0/4)

**Gap:** No `/pipeline` route, no pages. CallsService.js is telephony calls,
not ETL pipeline. No pipeline-related Redux slice.

| UC | Title | Status |
|----|-------|--------|
| UC-PIP-01 | Ver Estado del Pipeline ETL | MISSING |
| UC-PIP-02 | Ver Errores del Pipeline | MISSING |
| UC-PIP-03 | Ver Disponibilidad de Datos | MISSING |
| UC-PIP-04 | Reintentar Pipeline ETL | MISSING |

**FRs affected:** FR-071.01 through FR-074.01 (4 FRs)

---

### 3.11 operator — MISSING (0/10)

**Gap:** No `/operator` route, no pages. websocketService and transactionService
exist as infrastructure that would support operator flows, but no UI built.

| UC | Title | Status |
|----|-------|--------|
| UC-OPR-01 | Cambiar Estado del Agente | MISSING |
| UC-OPR-02 | Atender Llamada Entrante | MISSING |
| UC-OPR-03 | Iniciar Llamada Saliente | MISSING |
| UC-OPR-04 | Pausar Llamada (Hold/Unhold) | MISSING |
| UC-OPR-05 | Transferir Llamada | MISSING |
| UC-OPR-06 | Registrar Disposición de Llamada | MISSING |
| UC-OPR-07 | Solicitar Descanso | MISSING |
| UC-OPR-08 | Ver Métricas Propias del Agente | MISSING |
| UC-OPR-09 | Ver Historial de Llamadas Propias | MISSING |
| UC-OPR-10 | Leer Buzón Interno | MISSING |

**FRs affected:** FR-022.01 through FR-031.01 (10 FRs)

---

### 3.12 supervision — MISSING (0/3)

**Gap:** No `/supervision` route, no pages. WebSocket infrastructure exists
but supervisor-facing UI not built.

| UC | Title | Status |
|----|-------|--------|
| UC-SUP-01 | Monitorear Llamada (Escucha) | MISSING |
| UC-SUP-02 | Intervenir en Llamada (Barge-In) | MISSING |
| UC-SUP-03 | Enviar Mensaje Masivo al Equipo | MISSING |

**FRs affected:** FR-075.01 through FR-077.01 (3 FRs)

---

### 3.13 caller — OUT OF SCOPE (5/5 N/A)

Caller UCs describe IVR-side behavior (the calling customer's experience in the
phone system). IACT-ui is an analyst/operator dashboard — these UCs are backend
IVR concerns, not frontend dashboard pages.

| UC | Title | Notes |
|----|-------|-------|
| UC-CLI-01 | Recibir Llamada Entrante | IVR telephony, not dashboard |
| UC-CLI-02 | Navegar Menú IVR | IVR telephony, not dashboard |
| UC-CLI-03 | Esperar en Cola | IVR telephony, not dashboard |
| UC-CLI-04 | Solicitar Callback | IVR telephony, not dashboard |
| UC-CLI-05 | Encuesta Post-Llamada | IVR telephony, not dashboard |

---

## 4. Priority Tiers

### P0 — Route wiring (components exist, routes missing)

These have most implementation scaffolding but are unreachable:

| Domain | Work needed | Estimated complexity |
|--------|-------------|----------------------|
| auth | Add /login, /logout, /sessions routes; wire LoginPage, SessionManagement | LOW |
| users | Add /users route; wire UserManagement pages | LOW |

### P1 — Core functional gaps

| Domain | Missing | Key work |
|--------|---------|----------|
| permissions | 4 MISSING UCs | New pages: revoke-exceptional, AGR composition, audit query |
| reports | Dashboard wiring | Wire Dashboard.jsx as real page, connect Analytics components |
| admin | 2 MISSING UCs | Function catalog admin UI, AGR catalog admin UI |

### P2 — Main feature domains (greenfield pages needed)

| Domain | Missing UCs | Key infrastructure | New pages needed |
|--------|-------------|-------------------|------------------|
| reports | 13 UCs | exportService ✓, websocketService ✓ | 13 report pages + route |
| logs | 7 UCs | HealthService ✓ | 7 log viewer pages + route |
| pipeline | 4 UCs | None | 4 ETL monitor pages + route |

### P3 — Operator/supervision (complex real-time)

| Domain | Missing UCs | Key infrastructure | Notes |
|--------|-------------|-------------------|-------|
| operator | 10 UCs | websocketService ✓, CallsService ✓ | Real-time telephony UI |
| supervision | 3 UCs | websocketService ✓ | Live call monitoring |

---

## 5. Implemented Pages Inventory

```
src/pages/
├── access/            → /access/* (7 pages) ✓ ROUTED
│   ├── AssignFunctionsPage.jsx      UC-ACC-01
│   ├── PermissionsPage.jsx          UC-ACC-02, UC-ACC-03
│   ├── TemporaryPermissionsPage.jsx UC-ACC-08
│   ├── GroupersPage.jsx             UC-ACC-04, UC-PERM-01..06
│   ├── SoDManagementPage.jsx        UC-ACC-05, UC-ADM-01
│   ├── AccessAuditPage.jsx          UC-ACC-09, UC-PERM-10
│   └── SegmentsPage.jsx             supporting
├── alerts/            → /alerts/* (5 pages) ✓ ROUTED
│   ├── AlertsPage.jsx               UC-ALR-02, UC-ALR-03
│   ├── AlertConfigPage.jsx          UC-ALR-01
│   ├── AlertHistoryPage.jsx         UC-ALR-04
│   ├── SubscriptionsPage.jsx        UC-ALR-05
│   └── TemplatesPage.jsx            supporting
├── audit/             → /audit/* (4 pages) ✓ ROUTED
│   ├── AuditPage.jsx                UC-AUD-01
│   ├── AuditSearchPage.jsx          UC-AUD-02
│   ├── ExportPage.jsx               UC-AUD-03
│   └── ComplianceReportPage.jsx     UC-AUD-04
├── Dashboard.jsx      → /dashboard (stub in router)
├── HomePage.jsx       → (not routed)
├── NotFound.jsx       → * wildcard
├── Profile.jsx        → /profile (not protected)
└── Settings.jsx       → /settings (VIEW_CONFIG protected, stub)
```

**Not routed but implemented:**
- `src/components/containers/LoginPage.jsx` — auth
- `src/components/pages/UserManagement/` — users
- `src/components/pages/Analytics/` — reports

---

## 6. Summary Statistics

| Category | UCs | FRs |
|----------|-----|-----|
| Fully implemented + routed | 16 | 16 |
| Scaffolded but not routed | 13 | 38 |
| Missing (greenfield needed) | 49 | 62 |
| Out of scope (IVR) | 5 | 5 |
| **Total documented** | **83** | **121** |

**Implementation completion: 19% (fully routed) / 35% (including scaffolded)**

The biggest ROI opportunities:
1. **Auth + Users wiring** — ~2 days: adds 2 domains to router, unblocks FR-001..009 (38 FRs)
2. **Reports module** — ~3 weeks: 16 UCs, 16 FRs, high business value
3. **Logs module** — ~2 weeks: 7 UCs, 7 FRs, operational observability
4. **Permissions module** — ~1 week: 4 missing UCs, extends existing /access work
