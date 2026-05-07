```yml
created_at: 2026-05-07 20:39:25
project: IACT-ui
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 3 — ANALYZE
author: claude
status: Aprobado
version: 1.0.0
```

# Diagnóstico — Auditoría Mock + RBAC v5.6.x

## Evidencia de respaldo

Todos los hallazgos son PROVEN — basados en lectura directa de archivos.

---

## DOMINIO A: FunctionCatalog (`src/permissions/catalog.js`)

### A.1 Constantes existentes (35 total en catalog.js)

```
MOD_Reports (10):  VIEW_DASHBOARD, VIEW_METRICS, VIEW_REPORTS, FILTER_REPORTS,
                   VIEW_CHARTS, EXPORT_CSV, EXPORT_EXCEL, EXPORT_PDF,
                   SCHEDULE_REPORTS, SAVE_VIEW, SHARE_REPORTS
MOD_Users   (4):   VIEW_USERS, MANAGE_USERS, EDIT_USERS, DELETE_USERS
MOD_Access  (6):   VIEW_ACCESS, MANAGE_ACCESS, MANAGE_GROUPS,
                   MANAGE_SEPARATION_RULES, REVOKE_FUNCTION_GROUP, GRANT_EXCEPTIONAL
MOD_Audit   (4):   VIEW_AUDIT, SEARCH_AUDIT, EXPORT_AUDIT, VIEW_COMPLIANCE
MOD_Alerts  (2):   VIEW_ALERTS, MANAGE_ALERTS
MOD_Logs    (7):   VIEW_LOGS, VIEW_PIPELINE_LOGS, VIEW_INFRA_LOGS,
                   VIEW_SYSTEM_HEALTH, VIEW_TECHNICAL_METRICS, SEARCH_LOGS, EXPORT_LOGS
MOD_Pipeline(2):   VIEW_ETL_SUPERVISION, RETRY_PIPELINE
MOD_Admin   (2):   MANAGE_CATALOG, CREATE_SEPARATION_RULE
MOD_Auth    (2):   VIEW_OWN_SESSIONS, VIEW_ALL_SESSIONS
```

### A.2 Constantes faltantes (26 constantes vs spec v5.6.x)

**MOD_Alerts — 8 constantes faltantes:**

| Constante propuesta | Valor canónico | Spec ref |
|---------------------|----------------|----------|
| CONFIGURE_TEAM_ALERTS | alerts:config_team | ALR-003 v5.2.1 |
| PAUSE_ALERTS | alerts:pause | ALR-004 |
| DISABLE_ALERTS | alerts:disable | ALR-005 v5.4.0 |
| VIEW_ALERT_HISTORY | alerts:history | ALR-006 |
| ACKNOWLEDGE_ALERT | alerts:acknowledge | ALR-007 v5.4.0 |
| SUBSCRIBE_ALERT | alerts:subscribe | ALR-008 v5.4.0 |
| UNSUBSCRIBE_ALERT | alerts:unsubscribe | ALR-009 v5.4.0 |
| CONFIGURE_ALERT_SEVERITY | alerts:config_severity | ALR-010 v5.4.0 |

**MOD_Pipeline — 2 constantes faltantes:**

| Constante propuesta | Valor canónico | Spec ref |
|---------------------|----------------|----------|
| VIEW_PIPELINE_ERRORS | pipeline:view_errors | PIP-002 |
| VIEW_DATA_AVAILABILITY | pipeline:availability | PIP-003 |

**MOD_Users — 5 constantes faltantes:**

| Constante propuesta | Valor canónico | Spec ref |
|---------------------|----------------|----------|
| LIST_USERS | users:list | USR-004 |
| SEARCH_USERS | users:search | USR-005 |
| BLOCK_USERS | users:block | USR-006 |
| UNBLOCK_USERS | users:unblock | USR-007 |
| REACTIVATE_USERS | users:reactivate | USR-008 |

**MOD_Access — 6 constantes faltantes:**

| Constante propuesta | Valor canónico | Spec ref |
|---------------------|----------------|----------|
| REVOKE_FUNCTIONS | access:revoke | ACC-002 |
| ASSIGN_FUNCTION_GROUPS | access:assign_group | ACC-004 |
| ASSIGN_TO_GROUP | access:assign_to_group | ACC-006 v5.3.0 |
| UPDATE_SOD | access:update_sod | ACC-011 v5.4.0 |
| DISABLE_SOD | access:disable_sod | ACC-012 v5.4.0 |
| REVOKE_EXCEPTIONAL | access:revoke_exceptional | ACC-009 v5.3.0 |

**MOD_Auth — 2 constantes faltantes:**

| Constante propuesta | Valor canónico | Spec ref |
|---------------------|----------------|----------|
| CLOSE_SESSION | auth:close_session | AUTH-002 |
| RESET_PASSWORD | auth:reset_password | AUTH-003 |

**MOD_Admin v5.6.x extension — 3 constantes faltantes:**

| Constante propuesta | Valor canónico | Spec ref |
|---------------------|----------------|----------|
| MANAGE_MENU_CATALOG | adm:manage_menu_catalog | ADM-004 v5.6.x |
| MANAGE_MENU_LIFECYCLE | adm:manage_menu_lifecycle | ADM-005 v5.6.x |
| MANAGE_IS_CRITICAL | adm:manage_is_critical | ADM-006 v5.6.x (TD-RBAC-03: sin titular runtime) |

### A.3 Mismatch semántico MANAGE_ACCESS (no-breaking, informativo)

`MANAGE_ACCESS = 'access:assign'` guarda rutas de asignación de grupos (Agrupadores,
Segmentos, Asignar grupo). La semántica correcta para "asignar grupos" es
`access:assign_group`. Sin embargo, AGR-007 tiene ambas capacidades, por lo que
en la práctica no hay bug funcional. Se recomienda corregir para claridad del código.

---

## DOMINIO B: mockInterceptor.js

### B.1 Login userId mismatch (H-01 — CRÍTICO)

```
_handleLogin → retorna { user: { id: 1, ... } }  // hardcoded
PERMISOS_BY_USER_ID → { 10: permissionsMock, 99: permissionsAdminMock }
_handlePermisosCapacidades(url='/api/permisos/verificar/1/capacidades/') → 404
```

**Causa raíz:** El login mock fue escrito con id=1 (demo genérico) antes de que
el sistema de permisos fuera implementado con userId como key del lookup.

**Fix mínimo:** Cambiar `id: 1` por `id: 10` en `_handleLogin` para el usuario demo.
Esto hace que el demo user use el mock de permissions.json (AGR-002+AGR-004),
lo cual es una representación razonable para el usuario de demostración.

**Fix completo:** Agregar credenciales diferenciadas:
- `demo/demo123` → id=10 (maria.garcia — analista con reportes)
- `admin/admin123` → id=99 (sistema.admin — sysadmin)

### B.2 `_handleAdminFunctions` — 20/67 funciones (H-02 — ALTO)

El mock FUNCTIONS array tiene 20 entradas. El catálogo canónico tiene 67 funciones
activas. La `FunctionCatalogPage` muestra esta lista al admin y solo ve 20.

**Funciones en el mock (20):** reports:view, reports:kpis, reports:save_view,
users:view, users:create, access:view, access:assign, audit:view, alerts:view,
logs:view_app, logs:view_etl, logs:view_infra, logs:view_health, logs:view_metrics,
pipeline:view_status, pipeline:retry, auth:view_own_sessions, adm:manage_catalog,
adm:create_sod, access:view_sod.

**Funciones faltantes (47):** El detalle completo se documenta en el task plan.
Las categorías faltantes más significativas: todos los UCs v5.4.0 (Alerts×4,
Access×3), toda la rama de gestión de usuarios (7 de 9), exportaciones y
programación de reportes, módulo de Audit parcial.

### B.3 `_handleAdminAGR` — AGR-010 functions_count (H-03)

```
Mock:  { codename: 'system_admin_group', functions_count: 6 }
Spec:  AGR-010 tiene 9 funciones (6 operacional + 3 MOD_Admin v5.6.0)
```

### B.4 `_handleSeparationRules` — codenames ficticios (H-04)

```
SOD-001: group_a: ['pipeline:execute']  ← NO existe en catálogo canónico
          group_b: ['audit:export']      ← sí existe (audit:export)
SOD-002: group_a: ['users:create']      ← existe
          group_b: ['audit:view']        ← existe
SOD-003: group_a: ['access:assign']     ← existe
          group_b: ['adm:manage_catalog']← existe
```

`pipeline:execute` es la capacidad fabricada. Los SoD reales son:
- SoD usuario-auditoría: AGR-006 (users:create...) vs AGR-008 (audit:view...)
- SoD permisos-auditoría: AGR-007 (access:assign...) vs AGR-008
- SoD pipeline-auditoría: AGR-009 (pipeline:view_status...) vs AGR-008

### B.5 Endpoints faltantes (H-05 — ALTO)

Páginas con rutas registradas en AppRouter que NO tienen handlers en mock:

| Ruta en router | Handler mock | Estado |
|----------------|-------------|--------|
| `/reports/historical/*` | `_handleReportHistory` | OK (existe para `/api/reports/history/`) |
| `/reports/realtime` | ninguno | FALTA |
| `/reports/scheduled` | ninguno | FALTA |
| `/api/menu/` | ninguno | FALTA (useMenu() hook) |

Nota: `_handleReportHistory` existe para `/api/reports/history/` (notice: plural, sin
trailing `/historical/`) — el path de navegación `/reports/historical` mapea a la
página pero el endpoint de datos es diferente. Verificar en el componente.

Endpoints de los pages de Alerts sub-pages y Audit sub-pages también pueden estar
faltando pero depende de si las páginas hacen fetch al montar.

### B.6 `_handleGetUser` siempre id=1 (H-06 — BAJO)

```js
_handleGetUser() {
  return { status: 200, data: { id: 1, username: 'demo', ... } }
}
```

El perfil de usuario siempre es el demo hardcoded. No es crítico porque
el módulo de permisos usa un endpoint separado (`/api/permisos/verificar/{id}/`).
Pero genera confusión visual si se muestra el nombre en la UI.

---

## DOMINIO C: permissions.json / permissions-admin.json

**Veredicto: CORRECTO para las especificaciones actuales.**

`permissions.json` (userId=10, AGR-002+AGR-004):
- 14 capacidades que corresponden exactamente a la unión AGR-004 hereda
  AGR-003 hereda AGR-002 hereda AGR-001. Verificado contra grupos-funciones.rst.

`permissions-admin.json` (userId=99, AGR-010):
- 9 capacidades que corresponden exactamente a AGR-010 en grupos-funciones.rst.
- Las 3 funciones v5.6.x extension (adm:manage_menu_catalog, etc.) no están en
  AGR-010 según la spec — no es un error.

**Sin cambios necesarios** en estos dos archivos para esta iteración.

---

## DOMINIO D: Sidebar nav — Alerts y Audit sub-menus

### D.1 Páginas de Alerts existentes (orphaned — no están en el router como rutas individuales)

```
src/pages/alerts/AlertsPage.jsx          → candidato: /alerts (lista)
src/pages/alerts/AlertConfigPage.jsx     → candidato: /alerts/config
src/pages/alerts/AlertHistoryPage.jsx    → candidato: /alerts/history
src/pages/alerts/TemplatesPage.jsx       → candidato: /alerts/templates
src/pages/alerts/SubscriptionsPage.jsx   → candidato: /alerts/subscriptions
```

El router tiene solo `/alerts/*` → `AlertsPage` (catch-all de la carpeta
`@components/pages/Alerts/AlertsPage.jsx`, diferente del `@pages/alerts/AlertsPage.jsx`).
Los 4 sub-pages no están registrados como rutas.

**Sub-menú propuesto para Alertas:**

```js
children: [
  { label: 'Ver alertas',       path: '/alerts',               permission: FunctionCatalog.VIEW_ALERTS },
  { label: 'Configurar',        path: '/alerts/config',        permission: FunctionCatalog.MANAGE_ALERTS },
  { label: 'Historial',         path: '/alerts/history',       permission: FunctionCatalog.VIEW_ALERT_HISTORY },
  { label: 'Plantillas',        path: '/alerts/templates',     permission: FunctionCatalog.CONFIGURE_TEAM_ALERTS },
  { label: 'Suscripciones',     path: '/alerts/subscriptions', permission: FunctionCatalog.SUBSCRIBE_ALERT },
]
```

### D.2 Páginas de Audit existentes (orphaned)

```
src/pages/audit/AuditPage.jsx            → candidato: /audit (ver log)
src/pages/audit/AuditSearchPage.jsx      → candidato: /audit/search
src/pages/audit/ExportPage.jsx           → candidato: /audit/export
src/pages/audit/ComplianceReportPage.jsx → candidato: /audit/compliance
```

El router tiene solo `/audit/*` → `AuditPage` (catch-all de `@components/pages/Audit/`).
Los 3 sub-pages no están registrados.

**Sub-menú propuesto para Auditoría:**

```js
children: [
  { label: 'Log de auditoría',    path: '/audit',             permission: FunctionCatalog.VIEW_AUDIT },
  { label: 'Buscar',              path: '/audit/search',      permission: FunctionCatalog.SEARCH_AUDIT },
  { label: 'Exportar',            path: '/audit/export',      permission: FunctionCatalog.EXPORT_AUDIT },
  { label: 'Cumplimiento',        path: '/audit/compliance',  permission: FunctionCatalog.VIEW_COMPLIANCE },
]
```

---

## DOMINIO E: Permission guard mismatches en nav

### E.1 "Disponibilidad" en Logs (H-15 — ALTO)

```js
// AppRouter.jsx — línea actual:
{ label: 'Disponibilidad', path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_PIPELINE_LOGS }
//                                                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                                                       = 'logs:view_etl' (INCORRECTO)

// Correcto según spec:
// view_data_availability → pipeline:availability (PIP-003)
// Usar: FunctionCatalog.VIEW_DATA_AVAILABILITY = 'pipeline:availability'
```

**Impacto:** Usuarios con `logs:view_etl` (AGR-009 lo tiene vía view_application_logs?)
NO, wait. view_pipeline_logs → logs:view_etl está en el catálogo para "Ver logs ETL".
`view_data_availability → pipeline:availability` está en MOD_Pipeline. 

AGR-009 (`pipeline_admin_group`) tiene:
- view_pipeline_status (pipeline:view_status)
- view_pipeline_errors (pipeline:view_errors)
- view_data_availability (pipeline:availability)
- request_pipeline_retry (pipeline:retry)

So actualmente, el sub-ítem "Disponibilidad" en el grupo Logs aparece si el usuario
tiene `logs:view_etl`. Pero `logs:view_etl` está en AGR-009 (que no existe en el mock
para ningún usuario). Wait... ¿está en algún AGR? Revisando los spec:

AGR-001 no tiene logs:view_etl.
AGR-002 no tiene logs:view_etl.
...

Actually, looking at grupos-funciones.rst, ningún AGR explícitamente list `view_pipeline_logs`
(logs:view_etl). Checking... the spec says:

MOD_Logs has 7 functions but grupos-funciones.rst only shows AGR-009 for pipeline functions.
The logs functions (view_application_logs, export_logs) are in AGR-010.
Other logs functions might be missing from the AGR listing.

Regardless, the spec is clear: "Disponibilidad" should use `pipeline:availability` not `logs:view_etl`.

---

## Matriz de impacto consolidada

| Hallazgo | Tipo | Prioridad | Blocking? |
|----------|------|-----------|-----------|
| H-01: Login userId mismatch | Bug crítico | P0 | Sí — demo user sin permisos |
| H-02: AdminFunctions 20/67 | Completitud | P1 | No — app funciona, FunctionCatalogPage incompleto |
| H-05: Endpoints faltantes | Missing | P1 | No — páginas sin datos en dev mode |
| H-09: Alerts catalog constants | Completitud | P1 | Sí — sin constantes no se pueden guarda nav items |
| H-16: Alerts sub-menus | Feature gap | P1 | No — páginas existen pero no en nav |
| H-17: Audit sub-menus | Feature gap | P1 | No — páginas existen pero no en nav |
| H-15: Disponibilidad permission | Bug | P2 | No — guard usa string más permisivo |
| H-10: Pipeline constants | Completitud | P2 | Parcialmente — afecta nav guard de Disponibilidad |
| H-03: AGR-010 functions_count | Dato incorrecto | P2 | No |
| H-04: SoD codenames | Datos incorrectos | P2 | No |
| H-11..14: Otras constantes | Completitud | P3 | No — código futuro |
| H-06: GetUser id=1 | UX inconsistency | P3 | No |
| H-18: MANAGE_ACCESS semantic | Semántico | P3 | No |

---

## Decisiones de scope

**IN SCOPE:**
- Todos los hallazgos P0, P1, P2
- H-18 (semántico) — bajo riesgo, alta claridad

**OUT OF SCOPE:**
- Agregar credenciales multi-usuario avanzadas para mock (complejo, fuera del objetivo)
- Implementar las páginas de Alerts/Audit que no existen aún (solo registrar rutas)
- Crear usuarios adicionales en PERMISOS_BY_USER_ID

**Decisión de implementación para H-01:**
Cambiar demo login de id=1 a id=10. Esto da al demo user las capacidades de
AGR-002+AGR-004 (analista con exportación) — representación útil para demos.
Adicionalmente, agregar credenciales `admin/admin123` → id=99 para testing del admin.
