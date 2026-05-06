```yml
created_at: 2026-05-06 02:07:30
project: IACT-UI
work_package: 2026-05-06-02-07-30-uc-full-implementation
phase: Phase 3 — DIAGNOSE
author: NestorMonroy
status: Aprobado
```

# Grafo de dependencias — 15 UCs pendientes

Análisis de dependencias técnicas reales basado en:
- Slices Redux existentes (`src/redux/slices/`)
- Componentes existentes (`src/pages/`, `src/components/`)
- Rutas registradas en `AppRouter.jsx`

**Módulos telephony (operator, supervision, caller) = fuera de scope. Eliminados.**

---

## Hallazgos del análisis de código

| UC | Slice/Action existente | Componente existente | Nuevo código necesario |
|----|----------------------|---------------------|----------------------|
| uc-auth-02 | `authSlice.logout` ✓ | `UserMenu.jsx` con `onLogout` ✓ | Solo modal de confirmación |
| uc-acc-02 | `accessSlice.revokeFunction` ✓ | `AssignFunctionsPage` ✓ | Separar UI revocar/asignar |
| uc-perm-01 | ❌ Sin `assignGroupToUser` | ❌ Sin modal | Thunk nuevo + modal nuevo |
| uc-perm-02 | ❌ Sin `revokeGroupFromUser` | ❌ Sin modal | Thunk nuevo — reutiliza modal de perm-01 |
| uc-perm-10 | `accessSlice.fetchAccessAudit` ✓ | `AccessAuditPage` ✓ | Solo nueva ruta + split de componente |
| uc-alr-03 | `alertsSlice.updateAlert` ✓ (status='acknowledged') | `AlertsPage.handleAcknowledge` inline ✓ | Solo modal de confirmación |
| uc-rpt-02 | `reportsSlice.fetchDashboardMetrics` ✓ | `DashboardPage` ✓ | Nueva ruta + sub-sección |
| uc-rpt-03 | — | `AnalyticsDashboard` ✓ | Sub-ruta `/reports/historical` |
| uc-rpt-09 | `savedFiltersSlice` completo ✓ | Embedded en `ReportBuilder` ✓ | **DECISIÓN** (no código nuevo) |
| uc-rpt-10 | `savedFiltersSlice` completo ✓ | Solo en `AgentsReportPage` ✓ | Replicar a 5 páginas más |
| uc-rpt-11 | ❌ Sin share action | ❌ Sin modal | Thunk nuevo + modal nuevo |
| uc-pip-02 | `logsSlice.fetchETLLogs` ✓ | `ETLLogsPage` ✓ | Tab/filtro UI en página existente |
| uc-pip-03 | ❌ Sin `fetchETLAvailability` | ❌ Sin componente | Thunk nuevo + página nueva |
| uc-pip-04 | ❌ Sin `retryPipeline` | ❌ Sin acción | Thunk nuevo + modal confirmación |
| uc-adm-01 | `accessSlice.validateSeparationRules` ✓ | `SeparationRulesPage` recién registrada | **VERIFICACIÓN** |

---

## Grafo de dependencias (DAG)

```
LEVEL 0 — Paralelos, sin bloqueos (9 UCs)
══════════════════════════════════════════

 uc-adm-01 ──── VERIFICACIÓN: ¿SeparationRulesPage cubre lifecycle admin (crear/editar/desactivar)?
                              accessSlice.validateSeparationRules ya existe.
                              Si cubre → cerrar UC. Si no → agregar CRUD mínimo.

 uc-auth-02 ─── authSlice.logout + UserMenu.onLogout YA EXISTEN
                Agregar LogoutConfirmModal entre click y dispatch.
                No requiere Redux nuevo.

 uc-alr-03 ──── alertsSlice.updateAlert({status:'acknowledged'}) YA EXISTE
                AlertsPage ya llama handleAcknowledge inline.
                Envolver en AcknowledgeAlertModal (pedir confirmación).
                No requiere Redux nuevo.

 uc-acc-02 ──── accessSlice.revokeFunction YA EXISTE
                AssignFunctionsPage tiene el contexto.
                Separar UI: tab "Asignar" / tab "Revocar" o acción diferenciada.
                No requiere Redux nuevo.

 uc-perm-01 ─── NUEVO thunk accessSlice.assignGroupToUser + GroupAssignModal.
                Punto de entrada: botón en UserManagement (/users) o GroupManagementPage.

 uc-perm-10 ─── accessSlice.fetchAccessAudit YA EXISTE
                Crear nueva ruta /access/audit/permissions + PermissionsAuditPage
                (split de AccessAuditPage actual).

 uc-rpt-09 ──── savedFiltersSlice COMPLETO (fetch/save/delete) YA EXISTE
                DECISIÓN: embedded en ReportBuilder es suficiente para el UC.
                No requiere ruta propia. → Cerrar con documentación de decisión.

 uc-rpt-02 ──── reportsSlice.fetchDashboardMetrics YA EXISTE
                Crear sub-sección en DashboardPage o ruta /reports/realtime.
                No requiere Redux nuevo.

 uc-pip-02 ──── logsSlice.fetchETLLogs YA EXISTE
                ETLLogsPage ya muestra logs ETL.
                Agregar tab "Errores" con filtro status=error.
                No requiere Redux nuevo.


LEVEL 1 — Dependen de un nodo Level 0 (5 UCs)
══════════════════════════════════════════════

 uc-perm-02 ─── DEPENDE DE: uc-perm-01
                Reutiliza GroupAssignModal con prop mode='revoke'.
                NUEVO thunk accessSlice.revokeGroupFromUser.
                Implementar en mismo commit que perm-01 (son simétricos).

 uc-rpt-10 ──── DEPENDE DE: uc-rpt-09 (decisión del modelo de filtros)
                savedFiltersSlice YA EXISTE.
                Replicar patrón de AgentsReportPage a:
                QueuesReportPage, CampaignsReportPage, TransfersReportPage,
                IVRMenusReportPage, UniqueClientsReportPage (5 páginas).
                No requiere Redux nuevo.

 uc-rpt-03 ──── RECOMENDADO DESPUÉS DE: uc-rpt-02 (patrón route-split en reports)
                Sub-ruta /reports/historical + split de AnalyticsDashboard.
                uc-rpt-02 y uc-rpt-03 pueden ir en el mismo commit.

 uc-pip-03 ──── RECOMENDADO DESPUÉS DE: uc-pip-02 (slice ETL establecido)
                NUEVO thunk logsSlice.fetchETLAvailability.
                Nueva ruta /logs/etl/availability + ETLAvailabilityPage.
                [PARALELO con pip-04]

 uc-pip-04 ──── RECOMENDADO DESPUÉS DE: uc-pip-02 (slice ETL establecido)
                NUEVO thunk logsSlice.retryPipeline.
                Acción en ETLLogsPage + PipelineRetryModal (confirmación).
                [PARALELO con pip-03]


LEVEL 2 — Depende de Level 1 (1 UC)
═════════════════════════════════════

 uc-rpt-11 ──── RECOMENDADO DESPUÉS DE: uc-rpt-10 (savedFilters generalizado)
                Compartir = generar URL con parámetros del filtro activo
                O compartir un savedFilter guardado (rpt-10 necesario para esto).
                NUEVO thunk reportsSlice.shareReport + ShareReportModal.
```

---

## Orden de ejecución recomendado

```
Iteración 1 — Decisiones y verificaciones (sin código):
  uc-adm-01  → ¿SeparationRulesPage cubre? → cerrar o agregar CRUD
  uc-rpt-09  → ¿filtros necesitan ruta? → No → documentar decisión y cerrar

Iteración 2 — Modales de confirmación (Level 0, bajo riesgo):
  uc-auth-02 → LogoutConfirmModal
  uc-alr-03  → AcknowledgeAlertModal

Iteración 3 — Grupos a usuario (Level 0→1, un par):
  uc-perm-01 + uc-perm-02 → GroupAssignModal (mode=assign/revoke)
                           → accessSlice.assignGroupToUser + revokeGroupFromUser

Iteración 4 — Access/Permissions UI (Level 0):
  uc-acc-02  → Tab Revocar en AssignFunctionsPage
  uc-perm-10 → PermissionsAuditPage + ruta /access/audit/permissions

Iteración 5 — Pipeline ETL (Level 0→1):
  uc-pip-02  → Tab Errores en ETLLogsPage
  uc-pip-03  → ETLAvailabilityPage (paralelo)
  uc-pip-04  → PipelineRetryModal (paralelo)

Iteración 6 — Reports (Level 0→1→2):
  uc-rpt-02  → Ruta métricas RT
  uc-rpt-03  → Sub-ruta historical (mismo commit que rpt-02)
  uc-rpt-10  → saveFilter en 5 páginas más
  uc-rpt-11  → ShareReportModal
```

---

## Nuevo código necesario por iteración

| Iteración | Archivos nuevos | Archivos modificados | Redux nuevo |
|-----------|----------------|---------------------|-------------|
| 1 — Decisiones | 0 | 0 (solo docs) | 0 |
| 2 — Modales confirmación | `LogoutConfirmModal.jsx`, `AcknowledgeAlertModal.jsx` + tests | `UserMenu.jsx`, `AlertsPage.jsx` | 0 |
| 3 — Group assign/revoke | `GroupAssignModal.jsx` + tests | `UserManagement.jsx` o `GroupManagementPage` | 2 thunks en `accessSlice` |
| 4 — Access UI | `PermissionsAuditPage.jsx` + tests | `AssignFunctionsPage.jsx`, `AppRouter.jsx` | 0 |
| 5 — Pipeline ETL | `ETLAvailabilityPage.jsx`, `PipelineRetryModal.jsx` + tests | `ETLLogsPage.jsx`, `AppRouter.jsx` | 2 thunks en `logsSlice` |
| 6 — Reports | `ShareReportModal.jsx` + tests | 5×ReportPage + `AnalyticsDashboard.jsx`, `AppRouter.jsx` | 1 thunk en `reportsSlice` |

**Total estimado:** ~12 archivos nuevos, ~15 archivos modificados, 5 nuevos thunks Redux.
