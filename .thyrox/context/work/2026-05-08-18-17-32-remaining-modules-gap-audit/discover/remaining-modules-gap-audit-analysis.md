```yml
created_at: 2026-05-08 19:30:00
project: IACT-UI
work_package: 2026-05-08-18-17-32-remaining-modules-gap-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — remaining-modules-gap-audit

## Objetivo

Auditar todos los módulos **no cubiertos** por WPs anteriores:
reports avanzados (uc-rpt-09..17), alerts (uc-alr-01..05),
admin (uc-adm-01..05), audit (uc-aud-01..04), access
(uc-acc-01..09), permissions (uc-perm-01..10), logs
(uc-log-01..07) y users (uc-usr-01..07).

Aplicar PAT-UC-AUDIT-001: verificar archivo en `src/pages/` **Y**
ruta en `AppRouter.jsx`.
Aplicar PAT-UC-AUDIT-002: leer el archivo fuente antes de
clasificar como gap.

---

## 1. Módulos — Resultado por módulo

### 1.1 Reports (uc-rpt-01..17 + uc-inc-rpt-01)

| UC | Nombre | Archivo | Ruta | Estado |
|----|--------|---------|------|--------|
| uc-rpt-01..04 | Historicos/filtros/export/realtime | HistoricalReports, ReportExport, RealTimeMetrics | `/reports/*` | ✅ PRESENTE |
| uc-rpt-07 | Programar reporte | ScheduledReport.jsx | `/reports/scheduled` | ✅ PRESENTE |
| uc-rpt-08 | Acciones schedule (activar/pausar/eliminar) | ScheduledReport.jsx (inline) | — | ✅ PRESENTE (inline) |
| uc-rpt-09 | Guardar combinaciones de filtros | SavedViews.jsx | `/reports/saved` | ✅ PRESENTE |
| uc-rpt-10 | Guardar Vista | SavedViews.jsx | `/reports/saved` | ✅ PRESENTE |
| uc-rpt-11 | Compartir reporte | ShareReportModal (inline en HistoricalReports/AgentsReport) | — | ✅ PRESENTE (inline) |
| uc-rpt-12 | Reporte de Agentes | AgentsReport.jsx | `/reports/agents` | ✅ PRESENTE |
| uc-rpt-13 | Reporte de Colas | QueuesReport.jsx | `/reports/queues` | ✅ PRESENTE |
| uc-rpt-14 | Reporte de Campañas | CampaignsReport.jsx | `/reports/campaigns` | ✅ PRESENTE |
| uc-rpt-15 | Reporte de Transferencias | TransfersReport.jsx | `/reports/transfers` | ✅ PRESENTE |
| uc-rpt-16 | Reporte de Menús IVR | IVRMenusReport.jsx | `/reports/ivr-menus` | ✅ PRESENTE |
| uc-rpt-17 | Reporte de Clientes Únicos | UniqueClientsReport.jsx | `/reports/unique-clients` | ✅ PRESENTE |
| uc-inc-rpt-01 | Resolver Segmento del Usuario | — | — | ✅ BACKEND-ONLY (inclusión, sin UI) |

**PROVEN** (find + AppRouter grep): 0 gaps en reports.

---

### 1.2 Alerts (uc-alr-01..05)

| UC | Nombre | Función RBAC | Archivo | Ruta | Estado |
|----|--------|--------------|---------|------|--------|
| uc-alr-01 | Configurar Umbrales de Alertas | `configure_alerts` | AlertConfig.jsx | `/alerts/config` | ✅ PRESENTE |
| uc-alr-02 | Visualizar Alertas Activas | `view_alerts` | Alerts.jsx | `/alerts/*` | ✅ PRESENTE |
| uc-alr-03 | Reconocer Alerta | `acknowledge_alert` | — | — | ❌ **GAP** |
| uc-alr-04 | Ver Historial de Alertas | `view_alert_history` | AlertHistory.jsx | `/alerts/history` | ✅ PRESENTE |
| uc-alr-05 | Suscribirse/Desuscribirse | `subscribe_to_alert` | Subscriptions.jsx | `/alerts/subscriptions` | ✅ PRESENTE |

**GAP-ALR-01 (uc-alr-03)** — PROVEN:
- `grep -rn "ack\|acknowledge" src/services/alertsGateway.js` → 0 resultados
- `grep -rn "ack\|acknowledge" src/redux/slices/alerts.js` → 0 resultados
- `grep -n "reconoc\|ack\|acknowledge" src/pages/alerts/Alerts.jsx` → 0 resultados
- Spec: `POST /api/alerts/{alert_id}/ack/` + `{ note?: string (≤ 500 char) }` → 200

---

### 1.3 Admin (uc-adm-01..05)

| UC | Nombre | Archivo | Ruta | Estado |
|----|--------|---------|------|--------|
| uc-adm-01 | Gestionar Ciclo de Vida de Reglas SoD | SeparationRulesCatalog.jsx | `/admin/separation-rules` | ✅ PRESENTE |
| uc-adm-02 | Gestionar Catálogo de Funciones | FunctionCatalog.jsx | `/admin/functions` | ✅ PRESENTE |
| uc-adm-03 | Gestionar Catálogo de Agrupadores | AGRCatalog.jsx | `/admin/groups` | ✅ PRESENTE |
| uc-adm-04 | Gestionar Catálogo de MenuItems | MenuItemCatalog.jsx | `/admin/menu-items` | ✅ PRESENTE |
| uc-adm-05 | Gestionar Lifecycle de MenuItem | MenuItemCatalog.jsx (tab 'lifecycle') | `/admin/menu-items` | ✅ PRESENTE (tab inline) |

**PROVEN** (grep línea 5 y 109 de MenuItemCatalog.jsx confirman tab lifecycle con estados DRAFT/ACTIVE/DEPRECATED/ARCHIVED). 0 gaps en admin.

---

### 1.4 Audit (uc-aud-01..04)

| UC | Nombre | Archivo | Ruta | Estado |
|----|--------|---------|------|--------|
| uc-aud-01 | Log de Auditoría (timeline) | Audit.jsx | `/audit/*` | ✅ PRESENTE |
| uc-aud-02 | Búsqueda full-text de auditoría | AuditSearch.jsx | `/audit/search` | ✅ PRESENTE |
| uc-aud-03 | Exportar log de auditoría | Export.jsx | `/audit/export` | ✅ PRESENTE |
| uc-aud-04 | Reporte de Compliance | ComplianceReport.jsx | `/audit/compliance` | ✅ PRESENTE |

0 gaps en audit.

---

### 1.5 Access (uc-acc-01..05, uc-acc-08, uc-acc-09)

| UC | Nombre | Archivo | Ruta | Estado |
|----|--------|---------|------|--------|
| uc-acc-01 | Asignar Funciones a Usuario | AssignFunctions.jsx (tab 'asignar') | `/access/assign-functions` | ✅ PRESENTE |
| uc-acc-02 | Revocar Funciones de Usuario | AssignFunctions.jsx (tab 'revocar') | `/access/assign-functions` | ✅ PRESENTE (tab inline) |
| uc-acc-03 | Consultar Permisos Efectivos | Permissions.jsx | `/access/permissions` | ✅ PRESENTE |
| uc-acc-04 | Asignar Agrupador a Usuario | AssignGroup.jsx | `/access/assign-group`, `/permissions/assign-group` | ✅ PRESENTE |
| uc-acc-05 | Gestionar Reglas SoD | SeparationRules.jsx | `/access/separation-rules` | ✅ PRESENTE |
| uc-acc-08 | Otorgar Permiso Temporal Excepcional | TemporaryPermissions.jsx | `/permissions/temp-permissions` | ✅ PRESENTE |
| uc-acc-09 | Auditar Cambios de Acceso | AccessAudit.jsx | `/access/audit/access` | ✅ PRESENTE |

**PROVEN** (grep confirmó `revocar` tab en AssignFunctions.jsx línea 76). 0 gaps en access.

---

### 1.6 Permissions (uc-perm-01..10)

| UC | Nombre | Archivo | Ruta | Estado |
|----|--------|---------|------|--------|
| uc-perm-01 | Gestionar Asignación de Funciones | AssignFunctions.jsx | `/access/assign-functions` | ✅ PRESENTE |
| uc-perm-02 | Revocar Grupo de Permisos | RevokeGroup.jsx | `/permissions/revoke-group` | ✅ PRESENTE |
| uc-perm-03 | Otorgar Permiso Excepcional | ExceptionalPermission.jsx | `/permissions/exceptional-permission` | ✅ PRESENTE |
| uc-perm-04 | Revocar Permiso Excepcional | RevokeExceptionalPermission.jsx | `/permissions/revoke-exceptional` | ✅ PRESENTE |
| uc-perm-05 | Crear/Modificar/Retirar Grupo | GroupManagement.jsx | `/access/groups` | ✅ PRESENTE |
| uc-perm-06 | Asignar Funciones a Grupo (AGR) | GroupComposition.jsx | `/access/groups/composition` | ✅ PRESENTE |
| uc-perm-07 | Verificar Permiso de Usuario | — | — | ✅ BACKEND-ONLY (`CheckPermissionEndpoint` admin-only GET — no UI de usuario) |
| uc-perm-08 | Generar Menú Dinámico | SidebarNav (componente global) | — | ✅ PRESENTE (sidebar IS el menú dinámico vía `GET /api/me/menu/`) |
| uc-perm-09 | Auditar Acceso (write side) | PermissionsAudit.jsx | `/access/audit/permissions` | ✅ PRESENTE |
| uc-perm-10 | Consultar Auditoría de Permisos | PermissionsAudit.jsx | `/access/audit/permissions` | ✅ PRESENTE |

0 gaps en permissions.

---

### 1.7 Logs (uc-log-01..07)

| UC | Archivo | Ruta | Estado |
|----|---------|------|--------|
| uc-log-01 | Logs.jsx | `/logs` | ✅ PRESENTE |
| uc-log-02 | ETLLogs.jsx | `/logs/etl` | ✅ PRESENTE |
| uc-log-03 | LogSearch.jsx | `/logs/search` | ✅ PRESENTE |
| uc-log-04 | LogExport.jsx | `/logs/export` | ✅ PRESENTE |
| uc-log-05 | InfraLogs.jsx | `/logs/infra` | ✅ PRESENTE |
| uc-log-06 | SystemStatus.jsx | `/logs/status` | ✅ PRESENTE |
| uc-log-07 | PerformanceMetrics.jsx | `/logs/metrics` | ✅ PRESENTE |

0 gaps en logs.

---

### 1.8 Users (uc-usr-01..07)

| UC | Nombre | Archivo | Estado |
|----|--------|---------|--------|
| uc-usr-01..04 | Create/Update/Deactivate/List | UserManagement.jsx `/users` | ✅ PRESENTE |
| uc-usr-05 | Bloquear Usuario | — | ✅ RESERVADO (stub, estado=Reservado) |
| uc-usr-06 | Desbloquear Usuario | — | ✅ RESERVADO (stub, estado=Reservado) |
| uc-usr-07 | Reactivar Usuario | — | ✅ RESERVADO (stub, estado=Reservado) |

uc-usr-05..07 marcados `estado: Reservado` en spec — no requieren implementación frontend en v5.6.0.

---

## 2. Resumen de gaps

| ID | UC | Módulo | Tipo | Descripción |
|----|-----|--------|------|-------------|
| GAP-ALR-01 | uc-alr-03 | Alerts | MISSING_FEATURE | `acknowledgeAlert`: falta botón en Alerts.jsx, thunk en alertsSlice, método en alertsGateway |

**1 gap PROVEN. Todos los demás módulos completos.**

---

## 3. Decisiones de scope

| Item | Decisión | Razón |
|------|----------|-------|
| uc-perm-07 (Verificar Permiso) | BACKEND-ONLY | `CheckPermissionEndpoint` es admin-debug; spec no define UI page |
| uc-perm-08 (Menú Dinámico) | PRESENT via SidebarNav | El sidebar ya consumes `GET /api/me/menu/`; no página separada requerida |
| uc-inc-rpt-01 (Resolver Segmento) | BACKEND-ONLY | Spec: "siempre invocado como paso de inclusión, no directamente por el usuario" |
| uc-usr-05..07 (block/unblock/reactivate) | RESERVADO | Spec marca `estado: Reservado`; out-of-scope v5.6.0 |

---

## 4. Síntomas / evidencia del gap

**GAP-ALR-01 (uc-alr-03)**:

- `POST /api/alerts/{alert_id}/ack/` — handler ausente en `mockInterceptor.js`
- Spec CA-01: ack básico → 200 + state ack
- Spec CA-02: Note guardado (`note?: string ≤ 500 char`)
- Spec CA-03: Cross-segmento → 403
- Spec CA-04: Ya ack → 409 idempotente
- Spec CA-07: Suprime notificaciones futuras
- Función RBAC: `acknowledge_alert`

---

## 5. Stopping Point Manifest

| SP | Descripción | Tipo |
|----|-------------|------|
| SP-01 | Aprobar este DISCOVER + scope del gap | Human gate |
| SP-02 | Aprobar task plan antes de Phase 10 | Human gate |

**Decisión de tamaño:** WP Pequeño — 1 gap concreto.
Fases recomendadas: 1 (DISCOVER) → 8 (PLAN EXECUTION) → 10 (IMPLEMENT) → 11 (TRACK).
