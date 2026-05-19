```yml
created_at: 2026-05-08 04:19:25
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — UC Alignment Full Audit

## 1. Objetivo y Contexto

Auditoría completa de alineación entre los casos de uso documentados en
IACT-docs (branch `feature/cnst-033-uml-conformance`) y la implementación
actual en `src/` de IACT-UI. El WP anterior (`permissions-fr-gaps-uml-conformance`)
cerró 6 gaps del módulo de permisos/acceso. Este WP extiende el análisis a
todos los módulos de Fase 1.

**Fuente de verdad UCs:** `/tmp/references/IACT-docs/source/requisitos/casos-uso/`
**Implementación auditada:** `/home/user/IACT-ui/src/`

---

## 2. Universo de UCs auditados

**Total catálogo IACT:** 80 UCs en 13 módulos.

**Fase 1 (IN SCOPE — 66 UCs):** AUTH, USR, ACC, PERM, RPT, ALR, PIP, AUD,
LOG, ADM.

**Fase 2 (OUT OF SCOPE — 19 UCs):** OPR, SUP, CLI. Justificación: dominio
operativo call-center, requiere contexto de CTI/telefonía distinto al
dashboard RBAC analytics. Exclusión explícita documentada.

> Nota: La matriz de dependencias reporta 61 UCs en Fase 1 sin incluir ADM
> (5 UCs). El scope correcto de este WP es 61 + 5 = 66 UCs de Fase 1.

### 2.1 Distribución por módulo (Fase 1)

| Módulo | UCs | IDs |
|--------|-----|-----|
| AUTH | 5 | UC_AUTH_01..05 |
| USR | 7 | UC_USR_01..07 |
| ACC | 7 | UC_ACC_01, 02, 03, 04, 05, 08, 09 |
| PERM | 10 | UC_PERM_01..10 |
| RPT | 18 | UC_INC_RPT_01, UC_RPT_01..17 |
| ALR | 5 | UC_ALR_01..05 |
| PIP | 4 | UC_PIP_01..04 |
| AUD | 4 | UC_AUD_01..04 |
| LOG | 7 | UC_LOG_01..07 |
| ADM | 5 | UC_ADM_01..05 |
| **Total** | **72** | |

> Nota: UC_INC_RPT_01 (Resolver Segmento) es UC de backend ETL — no
> requiere página UI. Los 17 UC_RPT + INC dan 18 RPT entries pero solo
> 16 son UI-relevantes.

---

## 3. Metodología de auditoría

Para cada UC se verifica:
1. **¿Existe página?** — `src/pages/{módulo}/`, `src/components/pages/`, o feature component
2. **¿Tiene ruta?** — Ruta en `AppRouter.jsx` que la renderiza
3. **¿Tiene guard de permiso?** — `<ProtectedRoute permission={...}>` wrapping la ruta
4. **¿Tiene tests?** — Archivo `__tests__/*.test.jsx` con cobertura del happy path
5. **¿Implementación completa?** — Todos los flujos del UC spec cubiertos

---

## 4. Resultado de la auditoría

### 4.1 Estado por módulo

#### AUTH (5/5 — completo)

| UC | Nombre | Página | Ruta | Guard | Tests | Estado |
|----|--------|--------|------|-------|-------|--------|
| UC_AUTH_01 | Iniciar Sesión | `Login` (containers) | `/login` | — público | ✓ | ✓ |
| UC_AUTH_02 | Cerrar Sesión | Header logout btn | nav | — | ✓ | ✓ feature |
| UC_AUTH_03 | Recuperar Contraseña | `RecoverPassword.jsx` | `/recover-password` | — público | ✓ | ✓ |
| UC_AUTH_04 | Cambiar Contraseña | `ChangePassword.jsx` | `/change-password` | ✓ | ✓ | ✓ |
| UC_AUTH_05 | Gestionar Sesiones | `ActiveSessions` (features) | `/profile/sessions` | ✓ | ✓ | ✓ |

#### USR (7/7 cubiertos — estructura no estándar)

| UC | Nombre | Página | Ruta | Estado |
|----|--------|--------|------|--------|
| UC_USR_01..06 | CRUD + block/unblock usuarios | `UserManagement` (components/pages/) | `/users` | ⚠ ubicación |
| UC_USR_07 | Editar perfil propio | `Profile.jsx` | `/profile` | ✓ |

**GAP estructural:** `UserManagement` vive en `src/components/pages/UserManagement/` en lugar
de `src/pages/users/`. AppRouter importa vía `@ui/pages/UserManagement`. Funciona, pero
viola la convención de nomenclatura del proyecto (sistematizada en WP systemic-naming-violations).

#### ACC (4/7 — 3 gaps de routing)

| UC | Nombre | Página | Ruta | Guard | Estado |
|----|--------|--------|------|-------|--------|
| UC_ACC_01 | Asignar Funciones | `AssignFunctions.jsx` ✓ | **MISSING** | — | ❌ sin ruta |
| UC_ACC_02 | Revocar Funciones | tab 'revocar' en AssignFunctions ✓ | **MISSING** | — | ❌ sin ruta |
| UC_ACC_03 | Consultar Permisos Efectivos | `Permissions.jsx` ✓ | **MISSING** | — | ❌ sin ruta |
| UC_ACC_04 | Asignar Agrupador | `AssignGroup.jsx` | `/access/assign-group` | ✓ | ✓ |
| UC_ACC_05 | Gestionar Reglas SoD | `SeparationRules.jsx` | `/access/separation-rules` | ✓ | ✓ |
| UC_ACC_08 | Permiso Temporal | `TemporaryPermissions.jsx` | `/permissions/temp-permissions` | ✓ | ✓ |
| UC_ACC_09 | Auditar Cambios Acceso | `AccessAudit.jsx` ✓ | **MISSING** | — | ❌ sin ruta |

> **PROVEN:** Las 3 páginas existen con implementación completa. El gap es
> exclusivamente de routing en AppRouter.jsx — ninguna ruta las renderiza.

#### PERM (8/10 — 2 UCs son middleware, no UI)

| UC | Nombre | Página | Ruta | Estado |
|----|--------|--------|------|--------|
| UC_PERM_01 | Asignar Grupo a Usuario | `AssignGroup.jsx` | `/permissions/assign-group` | ✓ |
| UC_PERM_02 | Revocar Grupo a Usuario | `RevokeGroup.jsx` | `/permissions/revoke-group` | ✓ |
| UC_PERM_03 | Conceder Permiso Excepcional | `ExceptionalPermission.jsx` | `/permissions/exceptional-permission` | ✓ |
| UC_PERM_04 | Revocar Permiso Excepcional | `RevokeExceptionalPermission.jsx` | `/permissions/revoke-exceptional` | ✓ |
| UC_PERM_05 | Crear Grupo de Permisos | `GroupManagement.jsx` | `/access/groups` | ✓ |
| UC_PERM_06 | Asignar Funciones a Grupo | `GroupComposition.jsx` | `/access/groups/composition` | ✓ |
| UC_PERM_07 | Verificar Permiso de Usuario | `ProtectedRoute` + middleware | — | ✓ RBAC gate |
| UC_PERM_08 | Generar Menú Dinámico | `useFilteredNavLinks` hook | — | ✓ hook |
| UC_PERM_09 | Auditar Acceso Write-Side | `PermissionsAudit.jsx` | `/access/audit/permissions` | ✓ |
| UC_PERM_10 | Consultar Auditoría Permisos | `PermissionsAudit.jsx` | `/access/audit/permissions` | ✓ |

#### RPT (14/18 — 4 gaps de features)

| UC | Nombre | Página | Ruta | Estado |
|----|--------|--------|------|--------|
| UC_INC_RPT_01 | Resolver Segmento | ETL backend | — | ✓ excluido UI |
| UC_RPT_01 | Ver Dashboard | `Dashboard.jsx` | `/dashboard` | ✓ |
| UC_RPT_02 | Ver Métricas Tiempo Real | `RealTimeMetrics.jsx` | `/reports/realtime` | ✓ |
| UC_RPT_03 | Ver Reportes Históricos | `HistoricalReports.jsx` | `/reports/historical` | ✓ |
| UC_RPT_04 | Exportar Reporte | `ReportExport.jsx` | `/reports/export` | ✓ |
| UC_RPT_07 | Programar Reporte | `ScheduledReport.jsx` | `/reports/scheduled` | ✓ |
| UC_RPT_08 | Ver Reportes Programados | `ScheduledReport.jsx` (parcial) | `/reports/scheduled` | ⚠ parcial |
| UC_RPT_09 | Configurar Filtros | **MISSING** | **MISSING** | ❌ sin implementación |
| UC_RPT_10 | Guardar Vista | `SavedViews.jsx` | `/reports/saved` | ✓ |
| UC_RPT_11 | Compartir Reporte | **MISSING feature** en SavedViews | `/reports/saved` | ❌ parcial |
| UC_RPT_12 | Reporte de Agentes | `AgentsReport.jsx` | `/reports/agents` | ✓ |
| UC_RPT_13 | Reporte de Colas | `QueuesReport.jsx` | `/reports/queues` | ✓ |
| UC_RPT_14 | Reporte de Campañas | `CampaignsReport.jsx` | `/reports/campaigns` | ✓ |
| UC_RPT_15 | Reporte de Transferencias | `TransfersReport.jsx` | `/reports/transfers` | ✓ |
| UC_RPT_16 | Reporte de Menús IVR | `IVRMenusReport.jsx` | `/reports/ivr-menus` | ✓ |
| UC_RPT_17 | Reporte de Clientes Únicos | `UniqueClientsReport.jsx` | `/reports/unique-clients` | ✓ |

> **UC_RPT_08 parcial:** pause/resume/delete ✓; "run-now" no implementado.
> **UC_RPT_09:** CRUD de filtros guardados del usuario — ninguna UI. `manage_own_filters` RBAC implícito.
> **UC_RPT_11:** Compartir vista guardada con otros usuarios. `share_reports` RBAC. `reportShareUrl.js` existe como utility pero sin UI en SavedViews.jsx.

#### ALR (5/5 — completo)

| UC | Nombre | Página | Ruta | Estado |
|----|--------|--------|------|--------|
| UC_ALR_01 | Configurar Umbrales | `AlertConfig.jsx` | `/alerts/config` | ✓ |
| UC_ALR_02 | Ver Alertas Activas | `Alerts.jsx` | `/alerts` | ✓ |
| UC_ALR_03 | Reconocer Alerta | acción en `Alerts.jsx` | `/alerts` | ✓ feature |
| UC_ALR_04 | Ver Historial de Alertas | `AlertHistory.jsx` | `/alerts/history` | ✓ |
| UC_ALR_05 | Gestionar Suscripciones | `Subscriptions.jsx` | `/alerts/subscriptions` | ✓ |

#### PIP (3/4 — 1 feature parcial)

| UC | Nombre | Página | Ruta | Estado |
|----|--------|--------|------|--------|
| UC_PIP_01 | Supervisar ETL | `PipelineStatus.jsx` | `/logs/pipeline` | ✓ |
| UC_PIP_02 | Consultar Errores ETL | `ETLLogs.jsx` | `/logs/etl` | ✓ |
| UC_PIP_03 | Consultar Disponibilidad | `ETLAvailability.jsx` | `/logs/etl/availability` | ✓ |
| UC_PIP_04 | Solicitar Reintento Pipeline | **MISSING feature** en PipelineStatus | — | ❌ parcial |

> **UC_PIP_04:** "Re-encolar pipeline failed para nueva ejecución." RBAC: `request_pipeline_retry`.
> PipelineStatus.jsx existe pero no implementa botón de retry ni despacha thunk para ello.

#### AUD (4/4 — completo)

| UC | Nombre | Estado |
|----|--------|--------|
| UC_AUD_01 | Consultar Auditoría General | `Audit.jsx` `/audit` ✓ |
| UC_AUD_02 | Buscar Auditoría | `AuditSearch.jsx` `/audit/search` ✓ |
| UC_AUD_03 | Exportar Auditoría Async | `Export.jsx` `/audit/export` ✓ |
| UC_AUD_04 | Generar Reporte Compliance | `ComplianceReport.jsx` `/audit/compliance` ✓ |

#### LOG (7/7 — completo)

| UC | Nombre | Estado |
|----|--------|--------|
| UC_LOG_01 | Consultar Logs Sistema | `Logs.jsx` `/logs` ✓ |
| UC_LOG_02 | Consultar Logs ETL | `ETLLogs.jsx` `/logs/etl` ✓ |
| UC_LOG_03 | Buscar Logs | `LogSearch.jsx` `/logs/search` ✓ |
| UC_LOG_04 | Exportar Logs | `LogExport.jsx` `/logs/export` ✓ |
| UC_LOG_05 | Ver Logs Infraestructura | `InfraLogs.jsx` `/logs/infra` ✓ |
| UC_LOG_06 | Ver Estado del Sistema | `SystemStatus.jsx` `/logs/status` ✓ |
| UC_LOG_07 | Ver Métricas Técnicas | `PerformanceMetrics.jsx` `/logs/metrics` ✓ |

#### ADM (2/5 — 3 gaps)

| UC | Nombre | Página | Ruta | Estado |
|----|--------|--------|------|--------|
| UC_ADM_01 | Gestionar Ciclo de Vida Reglas SoD | **MISSING** | **MISSING** | ❌ sin página |
| UC_ADM_02 | Gestionar Catálogo de Funciones | `FunctionCatalog.jsx` | `/admin/functions` | ✓ |
| UC_ADM_03 | Gestionar Catálogo Agrupadores | `AGRCatalog.jsx` | `/admin/groups` | ✓ |
| UC_ADM_04 | Gestionar Catálogo MenuItems | **MISSING** | **MISSING** | ❌ sin página |
| UC_ADM_05 | Gestionar Lifecycle MenuItem | **MISSING** | **MISSING** | ❌ sin página |

---

## 5. Ambigüedades resueltas

### 5.1 UC_ADM_01 vs UC_ACC_05 — Son UCs distintos

**PROVEN** (fuente: specs leídas en esta sesión):

- **UC_ACC_05** (MOD_Access): Vista operativa + CRUD de reglas SoD para
  operadores. Actor: `view_separation_rules`. Implementado en
  `SeparationRules.jsx` → `/access/separation-rules`. ✓ **completo**

- **UC_ADM_01** (MOD_Admin): Gestión del modelo — qué reglas EXISTEN. Actor:
  `create_separation_rule`, `update_separation_rule`, `disable_separation_rule`.
  Crea la 4a regla, modifica conjuntos de funciones mutuamente excluyentes,
  activa/desactiva. **Sin implementación.** Necesita página en `/admin/`.

**Decisión: UC_ADM_01 necesita página nueva.** No es duplicado de UC_ACC_05.

### 5.2 UC_ACC_02 — Cubierto por tab 'revocar' en AssignFunctions

`AssignFunctions.jsx` implementa tabs 'asignar' / 'revocar'. Importa
`revokeFunction` thunk. Tab 'revocar' carga funciones asignadas al usuario
y permite revocarlas. UC_ACC_02 está cubierto por la misma página que
UC_ACC_01. El gap es solo de routing (ninguna ruta apunta a AssignFunctions).

### 5.3 UC_PIP_04 — Feature action, no página separada

"Re-encolar pipeline failed" es una acción sobre un pipeline item en
PipelineStatus. No requiere página dedicada. El gap es: botón/acción de
retry + thunk + mock handler + guard `request_pipeline_retry`.

### 5.4 UC_RPT_08 — Parcialmente cubierto

`ScheduledReport.jsx` implementa pause/resume/delete. El "run-now" (ejecutar
inmediatamente un reporte programado) no está. El gap es agregar esa acción.

### 5.5 UC_RPT_09 — Feature de perfil, no página separada

CRUD de filtros guardados del usuario (`manage_own_filters` RBAC implícito).
Viven en el perfil del usuario. Implementación natural: sección en
`Profile.jsx` o sub-ruta `/profile/filters`. No requiere página en `/reports/`.

### 5.6 UC_RPT_11 — Feature en SavedViews, no página separada

Compartir una vista guardada con otros usuarios. RBAC: `share_reports`.
`reportShareUrl.js` existe como utility. El gap es: botón "Compartir" en
`SavedViews.jsx` + modal de selección de destinatario + mock handler.

---

## 6. Inventario consolidado de gaps

### Categoría A — Routing (páginas completas sin ruta)

| ID | Página | UC cubiertos | Ruta propuesta | Guard |
|----|--------|--------------|----------------|-------|
| GAP-A1 | `AssignFunctions.jsx` | UC_ACC_01, UC_ACC_02 | `/access/assign-functions` | `ASSIGN_FUNCTION` |
| GAP-A2 | `Permissions.jsx` | UC_ACC_03 | `/access/permissions` | `VIEW_ACCESS` |
| GAP-A3 | `AccessAudit.jsx` | UC_ACC_09 | `/access/audit/access` | `VIEW_AUDIT` |

### Categoría B — Páginas nuevas requeridas

| ID | UC | Nombre UC | Ruta propuesta | RBAC |
|----|-----|-----------|----------------|------|
| GAP-B1 | UC_ADM_01 | Gestionar Ciclo de Vida Reglas SoD | `/admin/separation-rules` | `create_separation_rule` |
| GAP-B2 | UC_ADM_04 | Gestionar Catálogo MenuItems | `/admin/menu-items` | `manage_menu_catalog` |
| GAP-B3 | UC_ADM_05 | Gestionar Lifecycle MenuItem | `/admin/menu-items/lifecycle` | `manage_menu_lifecycle` |

### Categoría C — Features parciales en páginas existentes

| ID | UC | Feature faltante | Página target | RBAC |
|----|-----|-----------------|---------------|------|
| GAP-C1 | UC_PIP_04 | Botón retry en pipeline failed | `PipelineStatus.jsx` | `request_pipeline_retry` |
| GAP-C2 | UC_RPT_08 | Acción "run-now" en scheduled reports | `ScheduledReport.jsx` | `view_reports` |
| GAP-C3 | UC_RPT_09 | CRUD filtros guardados | `Profile.jsx` / `/profile/filters` | implícito |
| GAP-C4 | UC_RPT_11 | Feature compartir vista | `SavedViews.jsx` | `share_reports` |

### Categoría D — Estructura no estándar

| ID | Situación actual | Estándar esperado |
|----|-----------------|-------------------|
| GAP-D1 | `src/components/pages/UserManagement/` | `src/pages/users/` |

---

## 7. UCs correctamente implementados

**AUTH:** 5/5 ✓
**USR:** 7/7 ✓ (con nota estructural GAP-D1)
**ACC:** 4/7 ✓ directamente; 3 sin ruta (GAP-A1, A2, A3)
**PERM:** 10/10 ✓
**RPT:** 14/18 ✓ directamente; 4 con gaps de feature (GAP-C2, C3, C4) + 1 excluido UI
**ALR:** 5/5 ✓
**PIP:** 3/4 ✓; 1 con gap de feature (GAP-C1)
**AUD:** 4/4 ✓
**LOG:** 7/7 ✓
**ADM:** 2/5 ✓; 3 sin página (GAP-B1, B2, B3)

**Total gaps activos: 11** (3 routing + 3 páginas nuevas + 4 features + 1 estructura)

---

## 8. Stopping Point Manifest

| SP-ID | Condición | Acción requerida |
|-------|-----------|-----------------|
| SP-01 | Antes de crear páginas ADM_04/ADM_05 | Confirmar si ADM_05 es tab de ADM_04 o página separada |
| SP-02 | Antes de mover UserManagement (GAP-D1) | Confirmar que los tests pasan post-mv |
| SP-03 | Después de Phase 10 IMPLEMENT | Ejecutar `npx jest --no-coverage` — 0 regressions |
| SP-04 | Cierre WP | Validar con `bash .claude/scripts/validate-phase-completion.sh` |
