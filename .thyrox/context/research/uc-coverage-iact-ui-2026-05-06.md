```yml
created_at: 2026-05-06 01:54:15
project: IACT-UI
source_branch: feature/cnst-033-uml-conformance (IACT-docs)
author: NestorMonroy
status: Borrador
```

# Análisis de cobertura — use-case-view vs IACT-UI

Cruza los 83 UCs documentados en
`source/arquitectura-tecnica/use-case-view/` (rama
`feature/cnst-033-uml-conformance` de IACT-docs) contra las
páginas y rutas implementadas en IACT-UI.

## Resumen ejecutivo

| Estado | UCs | % |
|--------|-----|---|
| ✅ Implementado | 48 | 58% |
| ⚠ Parcial (feature existe, ruta/acción incompleta) | 13 | 16% |
| ❌ Faltante (sin página/ruta en IACT-UI) | 7 | 8% |
| 🔲 Fuera de alcance IACT-UI (telephony real-time) | 15 | 18% |
| **Total** | **83** | |

> Los módulos **operator** (10 UCs) y **caller** (5 UCs) son
> UCs de operación telefónica en tiempo real — corresponden a
> un Softphone/Agent Desktop, no al panel analytics IACT-UI.
> Se marcan como fuera de alcance, no como faltantes.

---

## MODULE: auth (5 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-auth-01 | Iniciar sesión | `/login` | `LoginPage` | ✅ |
| uc-auth-02 | Cerrar sesión | — (acción en Header) | `UserMenu.jsx` → `authSlice.logout` | ⚠ Sin ruta dedicada — acción en header |
| uc-auth-03 | Recuperar contraseña | `/recover-password` | `RecoverPasswordPage` | ✅ |
| uc-auth-04 | Cambiar contraseña | `/change-password` | `ChangePasswordPage` | ✅ |
| uc-auth-05 | Gestionar sesiones | `/profile/sessions` | `ActiveSessionsPage` | ✅ |

**Faltante concreto:** uc-auth-02 no tiene página de confirmación
de logout ni flujo explícito de cerrar sesión. Se resuelve via
acción del Header pero no cubre los flujos del UC (sesiones
concurrentes, cierre forzado por inactividad).

---

## MODULE: users (4 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-usr-01 | Crear usuario | `/users` | `UserManagement` + `UserForm` | ✅ |
| uc-usr-02 | Consultar usuarios | `/users` | `UserManagement` + `UserList` | ✅ |
| uc-usr-03 | Modificar usuario | `/users` | `UserManagement` + `UserForm` (edit) | ✅ |
| uc-usr-04 | Eliminar usuario | `/users` | `UserManagement` (delete action) | ✅ |

**Cobertura: 4/4 — completa.**

---

## MODULE: access (7 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-acc-01 | Asignar funciones | `/access` + `AssignFunctionsPage` | `AssignFunctionsPage` | ✅ |
| uc-acc-02 | Revocar funciones | `/access` | `AccessPage` (acción inline) | ⚠ No tiene ruta/flujo propio, comparte `AccessPage` |
| uc-acc-03 | Consultar permisos efectivos | `/access` | `PermissionsPage` | ✅ |
| uc-acc-04 | Asignar agrupador | `/access` | `GroupersPage` | ⚠ Página existe pero no hay ruta registrada en AppRouter |
| uc-acc-05 | Gestionar reglas SoD | `/access` | `SeparationRulesPage` | ✅ |
| uc-acc-08 | Permiso temporal | `/access` | `TemporaryPermissionsPage` | ✅ |
| uc-acc-09 | Auditar cambios de acceso | `/access` | `AccessAuditPage` | ✅ |

**Nota:** uc-acc-06 y uc-acc-07 no existen en el catálogo de 83 UCs
(numeración salta del 05 al 08 — por diseño en el WP de IACT-docs).

**Pendiente:** `GroupersPage` y `SeparationRulesPage` existen en
`src/pages/access/` pero no están en las rutas del `AppRouter`.
Necesitan rutas bajo `/access/groupers` y `/access/sod-rules`.

---

## MODULE: permissions (10 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-perm-01 | Asignar grupo a usuario | — | Sin página dedicada | ⚠ Acción probable en `/users` o `/access/groups` pero no implementada |
| uc-perm-02 | Revocar grupo a usuario | — | Sin página dedicada | ⚠ Igual que perm-01 |
| uc-perm-03 | Conceder permiso excepcional | `/access` | `TemporaryPermissionsPage` | ✅ |
| uc-perm-04 | Revocar permiso excepcional | `/access` | `TemporaryPermissionsPage` (revoke action) | ✅ |
| uc-perm-05 | Crear grupo de permisos | `/access/groups` | `GroupManagementPage` | ✅ |
| uc-perm-06 | Asignar funciones a grupo | `/access/groups/composition` | `GroupCompositionPage` | ✅ |
| uc-perm-07 | Verificar permiso de usuario | `/access` | `PermissionsPage` | ✅ |
| uc-perm-08 | Generar menú dinámico | — (runtime) | `AppRouter` + `usePermisos` hook | ✅ |
| uc-perm-09 | Auditar acceso write-side | `/access` | `AccessAuditPage` | ✅ |
| uc-perm-10 | Consultar auditoría de permisos | `/access` | `AccessAuditPage` | ⚠ Comparte página con perm-09, sin sub-ruta diferenciada |

**Pendientes concretos:**
- uc-perm-01: necesita flujo "asignar grupo a usuario" — puede ser
  modal en `/users/<id>` o sub-página en `/access`.
- uc-perm-02: necesita flujo "revocar grupo a usuario" — simetría
  con perm-01.
- uc-perm-10: si los requerimientos distinguen "auditoría de permisos
  (cambios al modelo de permisos)" de "auditoría de acceso (logs de
  quién hizo qué)", necesita sub-ruta propia.

---

## MODULE: reports (16 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-inc-rpt-01 | Resolver segmento (inclusión) | — | Lógica backend (`SegmentResolver`) | N/A — no requiere UI |
| uc-rpt-01 | Ver dashboard | `/dashboard` | `DashboardPage` | ✅ |
| uc-rpt-02 | Ver métricas en tiempo real | `/reports` | `AnalyticsDashboard` (WebSocket metrics) | ✅ WebSocket suscribe canal `metrics` — análisis profundo 2026-05-06 |
| uc-rpt-03 | Ver reportes históricos | `/reports` | `AnalyticsDashboard` | ⚠ Aggregado con otros UCs en la misma página |
| uc-rpt-04 | Exportar reporte | `/reports` + ExportHub | `ReportBuilder` + `ExportHub` | ✅ |
| uc-rpt-07 | Programar reporte | `/reports` | `ScheduledReports` | ✅ |
| uc-rpt-08 | Ver reportes programados | `/reports` | `ScheduledReports` | ✅ |
| uc-rpt-09 | Configurar filtros | `/reports` | `ReportBuilder` + `SavedFiltersPanel` | ✅ savedFiltersSlice CRUD completo + SavedFiltersPanel wired — análisis profundo 2026-05-06 |
| uc-rpt-10 | Guardar vista | — | `AgentsReportPage` (saveFilter) | ⚠ Solo implementado en Agents, no global |
| uc-rpt-11 | Compartir reporte | — | Sin implementación | ❌ |
| uc-rpt-12 | Reporte de agentes | `/reports/agents` | `AgentsReportPage` | ✅ |
| uc-rpt-13 | Reporte de colas | `/reports/queues` | `QueuesReportPage` | ✅ |
| uc-rpt-14 | Reporte de campañas | `/reports/campaigns` | `CampaignsReportPage` | ✅ |
| uc-rpt-15 | Reporte de transferencias | `/reports/transfers` | `TransfersReportPage` | ✅ |
| uc-rpt-16 | Reporte de menús IVR | `/reports/ivr-menus` | `IVRMenusReportPage` | ✅ |
| uc-rpt-17 | Reporte de clientes únicos | `/reports/unique-clients` | `UniqueClientsReportPage` | ✅ |

**Faltante concreto:** uc-rpt-11 (compartir reporte) — ningún
componente implementa sharing de reportes (link, email, permisos).

---

## MODULE: alerts (5 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-alr-01 | Configurar umbrales | `/alerts` | `AlertConfigPage` | ✅ |
| uc-alr-02 | Ver alertas activas | `/alerts` | `AlertsPage` | ✅ |
| uc-alr-03 | Reconocer alerta | `/alerts` | `AlertsPage` (action inline) | ⚠ Acción en lista, sin flujo de confirmación dedicado |
| uc-alr-04 | Ver historial de alertas | `/alerts` | `AlertHistoryPage` | ✅ |
| uc-alr-05 | Gestionar suscripciones | `/alerts` | `SubscriptionsPage` | ✅ |

**Nota:** `TemplatesPage` existe en `src/pages/alerts/` pero no está
documentada en los 83 UCs ni en el AppRouter. Puede ser una feature
extra o un UC pendiente de documentar en IACT-docs.

---

## MODULE: pipeline (4 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-pip-01 | Supervisar ETL | `/logs/etl` | `ETLLogsPage` | ✅ |
| uc-pip-02 | Consultar errores ETL | `/logs/etl` | `ETLLogsPage` (error filter) | ⚠ Mismo componente que pip-01, sin sub-vista diferenciada |
| uc-pip-03 | Consultar disponibilidad de datos | — | Sin implementación | ❌ |
| uc-pip-04 | Solicitar reintento de pipeline | — | Sin implementación | ❌ |

**Faltantes concretos:**
- uc-pip-03: vista de disponibilidad/freshness de datos del ETL.
  Candidato a sub-ruta `/logs/etl/availability`.
- uc-pip-04: acción de reintento de pipeline — requiere botón +
  confirmación en `ETLLogsPage` o sub-página `/logs/etl/retry`.

---

## MODULE: audit (4 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-aud-01 | Consultar auditoría general | `/audit` | `AuditPage` | ✅ |
| uc-aud-02 | Buscar auditoría | `/audit` | `AuditSearchPage` | ✅ |
| uc-aud-03 | Exportar auditoría (async) | `/audit` | `ExportPage` | ✅ |
| uc-aud-04 | Generar reporte de compliance | `/audit` | `ComplianceReportPage` | ✅ |

**Cobertura: 4/4 — completa.**

---

## MODULE: logs (7 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-log-01 | Consultar logs del sistema | `/logs` | `LogsPage` | ✅ |
| uc-log-02 | Consultar logs del ETL | `/logs/etl` | `ETLLogsPage` | ✅ |
| uc-log-03 | Buscar logs | `/logs/search` | `LogSearchPage` | ✅ |
| uc-log-04 | Exportar logs | `/logs/export` | `LogExportPage` | ✅ |
| uc-log-05 | Ver logs de infraestructura | `/logs/infra` | `InfraLogsPage` | ✅ |
| uc-log-06 | Ver estado del sistema | `/logs/status` | `SystemStatusPage` | ✅ |
| uc-log-07 | Ver métricas técnicas | `/logs/metrics` | `PerformanceMetricsPage` | ✅ |

**Cobertura: 7/7 — completa.**

---

## MODULE: operator (10 UCs) — 🔲 Fuera de alcance

| UC | Descripción |
|----|-------------|
| uc-opr-01 | Cambiar estado del agente |
| uc-opr-02 | Atender llamada entrante |
| uc-opr-03 | Realizar llamada saliente |
| uc-opr-04 | Hold/Unhold llamada |
| uc-opr-05 | Transferir llamada |
| uc-opr-06 | Ingresar disposition |
| uc-opr-07 | Solicitar break/pausa |
| uc-opr-08 | Ver propio dashboard |
| uc-opr-09 | Ver propio historial de llamadas |
| uc-opr-10 | Recibir notificación del supervisor |

**Alcance:** Estos UCs corresponden al **Softphone / Agent Desktop**
(la interfaz que el agente telefónico usa durante su jornada).
IACT-UI es el panel de analytics y administración — no cubre
operación telefónica en tiempo real.

**Excepción potencial:** uc-opr-08 (ver propio dashboard) podría
tener un equivalente en IACT-UI si el agente accede al portal para
ver sus propias métricas históricas. Actualmente no implementado.

---

## MODULE: supervision (3 UCs) — 🔲 Fuera de alcance

| UC | Descripción |
|----|-------------|
| uc-sup-01 | Monitorear llamada (whisper) |
| uc-sup-02 | Barge-in en llamada |
| uc-sup-03 | Mensaje broadcast al equipo |

**Alcance:** Operaciones de supervisión en tiempo real sobre
llamadas activas. Pertenecen al Softphone/Supervisor Desktop,
no al panel analytics.

---

## MODULE: caller (5 UCs) — 🔲 Fuera de alcance

| UC | Descripción |
|----|-------------|
| uc-cli-01 | Iniciar llamada al call center |
| uc-cli-02 | Navegar IVR |
| uc-cli-03 | Esperar en cola |
| uc-cli-04 | Solicitar callback |
| uc-cli-05 | Calificar atención post-call |

**Alcance:** UCs del **caller externo** (la persona que llama al
call center). IACT-UI no tiene interfaz para callers — estos UCs
son del sistema telefónico (IVR engine), no del panel admin.

---

## MODULE: admin (3 UCs)

| UC | Descripción | Ruta IACT-UI | Componente | Estado |
|----|-------------|--------------|------------|--------|
| uc-adm-01 | Gestionar ciclo de vida reglas SoD | — | Sin ruta admin dedicada para SoD | ⚠ `SeparationRulesPage` existe en `src/pages/access/` pero no registrada en AppRouter bajo `/admin/` |
| uc-adm-02 | Gestionar catálogo de funciones | `/admin/functions` | `FunctionCatalogPage` | ✅ |
| uc-adm-03 | Gestionar catálogo de agrupadores | `/admin/groups` | `AGRCatalogPage` | ✅ |

---

## Lista consolidada de pendientes en IACT-UI

### ❌ UCs sin implementación (7)

| UC | Módulo | Descripción | Componente propuesto |
|----|--------|-------------|----------------------|
| uc-rpt-11 | reports | Compartir reporte | `ShareReportModal` o `/reports/shared` |
| uc-pip-03 | pipeline | Consultar disponibilidad de datos | Sub-vista en `ETLLogsPage` o `/logs/etl/availability` |
| uc-pip-04 | pipeline | Solicitar reintento de pipeline | Acción en `ETLLogsPage` + confirmación |
| uc-opr-08 | operator* | Ver propio dashboard (agente) | `/my-stats` — si se decide incluir en IACT-UI |

*uc-opr-08 es discutible — ver sección operator.

### ⚠ UCs parciales con gap claro (13)

| UC | Gap concreto | Acción sugerida |
|----|-------------|-----------------|
| uc-auth-02 | Logout sin flujo de confirmación/sesiones concurrentes | Agregar `LogoutConfirmModal` en `UserMenu` |
| uc-acc-02 | Revocar funciones comparte página con asignar | Sub-acción diferenciada en `AccessPage` o `AssignFunctionsPage` |
| uc-acc-04 | `GroupersPage` existe pero sin ruta en AppRouter | Registrar `/access/groupers` → `GroupersPage` |
| uc-adm-01 | `SeparationRulesPage` sin ruta en AppRouter | Registrar `/admin/sod-rules` o `/access/sod-rules` |
| uc-perm-01 | Asignar grupo a usuario sin flujo dedicado | Modal/sub-página en `/users/:id/groups` |
| uc-perm-02 | Revocar grupo a usuario sin flujo dedicado | Simetría con perm-01 |
| uc-perm-10 | Auditoría de permisos comparte vista con perm-09 | Sub-ruta `/access/audit/permissions` |
| uc-rpt-02 | Métricas RT sin ruta diferenciada de dashboard | Sub-sección en `DashboardPage` o `/reports/realtime` |
| uc-rpt-03 | Reportes históricos dentro de `AnalyticsDashboard` | Sub-ruta `/reports/historical` |
| uc-rpt-09 | Configurar filtros embedded en `ReportBuilder` | Confirmar si requiere ruta propia |
| uc-rpt-10 | Guardar vista solo en `AgentsReportPage` | Generalizar `saveFilter` a todos los módulos de reports |
| uc-alr-03 | Reconocer alerta sin flujo de confirmación | `AcknowledgeAlertModal` en `AlertsPage` |
| uc-pip-02 | Errores ETL comparten vista con supervisión ETL | Sub-filtro o tab en `ETLLogsPage` |

### Rutas en `src/pages/` sin registrar en AppRouter

Páginas que existen pero no tienen ruta:

| Archivo | Ruta sugerida | UC relacionado |
|---------|---------------|----------------|
| `src/pages/access/GroupersPage.jsx` | `/access/groupers` | uc-acc-04 |
| `src/pages/access/SeparationRulesPage.jsx` | `/access/sod-rules` o `/admin/sod-rules` | uc-adm-01 |
| `src/pages/access/SegmentsPage.jsx` | `/access/segments` | — (UC no documentado) |
| `src/pages/alerts/TemplatesPage.jsx` | `/alerts/templates` | — (UC no documentado en IACT-docs) |

---

## Módulos 100% cubiertos

| Módulo | UCs | Estado |
|--------|-----|--------|
| users | 4/4 | ✅ |
| audit | 4/4 | ✅ |
| logs | 7/7 | ✅ |

---

## Siguiente paso sugerido

Priorizar por impacto:

1. **Rutas faltantes en AppRouter** (acc-04, adm-01, segments, templates)
   — costo bajo, páginas ya existen.
2. **uc-perm-01 / uc-perm-02** (asignar/revocar grupo a usuario)
   — flujos críticos del modelo de permisos.
3. **uc-pip-03 / uc-pip-04** (disponibilidad + reintento ETL)
   — necesarios para operaciones de pipeline.
4. **uc-rpt-11** (compartir reporte) — feature de colaboración.
5. **uc-rpt-10** (guardar vista global) — generalizar lo que ya
   existe en AgentsReportPage.
