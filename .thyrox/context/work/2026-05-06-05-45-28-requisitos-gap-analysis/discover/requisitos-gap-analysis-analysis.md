```yml
created_at: 2026-05-06 05:52:29
project: IACT-UI
work_package: 2026-05-06-05-45-28-requisitos-gap-analysis
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
version: 1.0.0
```

# Análisis de Cobertura de Requisitos — IACT-UI

> Corpus fuente: `/tmp/references/IACT-docs/source/requisitos/`
> Codebase analizado: `/home/user/IACT-ui/src/`
> Análisis ejecutado: 2026-05-06 (sesión actual, datos verificados con `find`/`grep` en filesystem)

---

## Contexto del usuario final

**¿Quién usará el sistema?**
- Supervisores de call center: dashboard, reportes, alertas, permisos
- Agentes del call center: panel de operador (estado, llamadas, métricas propias)
- Administradores RBAC: gestión de funciones, SoD, grupos, usuarios
- Auditores internos/externos: compliance, exportación de auditoría

**¿Qué se quiere lograr?**
Implementar el 100% de los requisitos del corpus IACT-docs en la aplicación frontend
IACT-UI. El corpus define 83 UCs en 13 dominios. Actualmente el 76% está implementado.
El WP documenta el estado actual y sirve de base para planificar los WPs de
implementación de los módulos faltantes.

**¿Restricciones?**
- Los 5 UCs del dominio `caller` (uc-cli-*) son flujos IVR/PBX de backend — no aplican al frontend React. Excluidos del scope de IACT-UI.
- El módulo Operador (uc-opr-*) y Supervisión (uc-sup-*) requieren integración CTI/WebSocket con backend de telefonía — dependencia de backend real.
- Tests: no romper los 1551 tests existentes.

---

## Objetivo / Por qué

Completar la cobertura del frontend IACT-UI al 100% de los UCs que aplican al
dominio frontend. El corpus de requisitos es la fuente de verdad.

**Por qué importa:** Sin este análisis, los WPs de implementación no tienen un
baseline claro. Con este documento, cada WP futuro puede referenciar qué UC
implementa y cuál es su criterio de aceptación.

---

## Stakeholders

| Rol | Necesidad principal | UCs relevantes |
|-----|---------------------|----------------|
| Supervisor call center | Ver KPIs, alertas, reportes, supervisar agentes | uc-rpt-*, uc-alr-*, uc-sup-* |
| Agente call center | Panel de trabajo: estado, llamadas, métricas propias | uc-opr-* |
| Admin RBAC | Gestión de usuarios, permisos, SoD | uc-acc-*, uc-adm-*, uc-perm-*, uc-usr-* |
| Auditor | Compliance, exportación de eventos | uc-aud-*, uc-log-* |
| Data engineer | Monitoreo de pipelines ETL | uc-pip-*, uc-log-* |

---

## Estado de cobertura — baseline verificado

### Resumen

| Estado | UCs | % |
|--------|-----|---|
| ✅ Implementado (verificado en filesystem) | 63 | 76% |
| 🟡 Parcial (componente existe, workflow incompleto) | 4 | 5% |
| ❌ No implementado (módulo nuevo requerido) | 11 | 13% |
| ⛔ Excluido (no aplica al frontend) | 5 | 6% |
| **Total corpus** | **83** | **100%** |

**Scope real de IACT-UI:** 78 UCs (83 − 5 excluidos). Cobertura actual: 63/78 = **81%**.

---

### Dominio: ACCESS — ✅ 7/7

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-acc-01 | Asignar funciones a usuario | ✅ | `AssignFunctionsPage.jsx`, `accessSlice.assignFunction` |
| uc-acc-02 | Revocar funciones de usuario | ✅ | `AssignFunctionsPage.jsx` tab Revocar, `revokeFunction` |
| uc-acc-03 | Consultar permisos efectivos | ✅ | `AccessAuditPage.jsx`, `fetchAccessAudit` |
| uc-acc-04 | Asignar agrupador a usuario | ✅ | `GroupManagementPage.jsx`, `assignGroupToUser` |
| uc-acc-05 | Gestionar reglas SoD | ✅ | `SeparationRulesPage.jsx`, `createSodRule/updateSodRule` |
| uc-acc-08 | Otorgar permiso temporal | ✅ | `TemporaryPermissionsPage.jsx` |
| uc-acc-09 | Auditar cambios de acceso | ✅ | `AccessAuditPage.jsx`, `fetchAccessAudit` |

### Dominio: ADMIN — ✅ 3/3

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-adm-01 | Gestionar ciclo de vida SoD | ✅ | `SeparationRulesPage.jsx`, `FunctionCatalogPage.jsx` |
| uc-adm-02 | Gestionar catálogo de funciones | ✅ | `FunctionCatalogPage.jsx` |
| uc-adm-03 | Gestionar catálogo de agrupadores | ✅ | `AGRCatalogPage.jsx` |

### Dominio: ALERTS — ✅ 5/5

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-alr-01 | Configurar umbrales de alertas | ✅ | `AlertConfigPage.jsx` |
| uc-alr-02 | Ver alertas abiertas | ✅ | `AlertsPage.jsx`, `fetchAlerts` |
| uc-alr-03 | Reconocer alerta | ✅ | `AlertsPage.jsx` con `ConfirmModal` |
| uc-alr-04 | Analizar tendencias de alertas | ✅ | `AlertHistoryPage.jsx` |
| uc-alr-05 | Gestionar suscripciones | ✅ | `SubscriptionsPage.jsx` |

### Dominio: AUDIT — ✅ 4/4

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-aud-01 | Listar eventos de auditoría | ✅ | `AuditPage.jsx` |
| uc-aud-02 | Buscar eventos de auditoría | ✅ | `AuditSearchPage.jsx` |
| uc-aud-03 | Exportar eventos de auditoría | ✅ | `audit/ExportPage.jsx` |
| uc-aud-04 | Generar reporte de compliance | ✅ | `ComplianceReportPage.jsx` |

### Dominio: AUTH — ✅ 5/5

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-auth-01 | Iniciar sesión | ✅ | `LoginPage`, `authSlice.loginUser` |
| uc-auth-02 | Cerrar sesión | ✅ | `UserMenu` + `ConfirmModal`, `logoutUser` |
| uc-auth-03 | Recuperar contraseña | ✅ | `RecoverPasswordPage.jsx` |
| uc-auth-04 | Cambiar contraseña | ✅ | `ChangePasswordPage.jsx` |
| uc-auth-05 | Gestionar sesiones activas | ✅ | `ActiveSessions` component |

### Dominio: CALLER — ⛔ 0/5 (excluido — no frontend)

| UC | Título | Estado | Razón exclusión |
|----|--------|--------|-----------------|
| uc-cli-01 | Recibir llamada externa | ⛔ | Flujo IVR/PBX — actor externo, no autenticado en el sistema React |
| uc-cli-02 | Procesar llamada en IVR | ⛔ | Sistema de menús IVR — backend de telefonía |
| uc-cli-03 | Encolar llamada | ⛔ | Infraestructura ACD/PBX |
| uc-cli-04 | Contestar llamada por agente | ⛔ | Flujo interno del ACD |
| uc-cli-05 | Finalizar llamada | ⛔ | Trigger backend post-llamada |

> **Decisión de scope:** Los UCs uc-cli-* describen flujos del sistema telefónico
> backend (IVR, PBX, ACD). No tienen representación como pantallas en el dashboard
> React. Excluidos permanentemente del scope de IACT-UI. Los efectos de estos flujos
> (CallSummary, logs ETL) sí son visibles en reportes y logs.

### Dominio: LOGS — ✅ 7/7

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-log-01 | Ver logs del sistema | ✅ | `LogsPage.jsx` |
| uc-log-02 | Ver logs de ETL | ✅ | `ETLLogsPage.jsx` |
| uc-log-03 | Buscar en logs | ✅ | `LogSearchPage.jsx` |
| uc-log-04 | Exportar logs | ✅ | `LogExportPage.jsx` |
| uc-log-05 | Ver logs de infraestructura | ✅ | `InfraLogsPage.jsx` |
| uc-log-06 | Ver estado del sistema | ✅ | `SystemStatusPage.jsx` |
| uc-log-07 | Ver métricas Prometheus | ✅ | `PerformanceMetricsPage.jsx` |

### Dominio: OPERATOR — ❌ 0/10 (módulo nuevo)

| UC | Título | Estado | Descripción del UC |
|----|--------|--------|--------------------|
| uc-opr-01 | Cambiar estado del agente | ❌ | Disponible / Ocupado / Break — routing ACD |
| uc-opr-02 | Aceptar oferta de llamada | ❌ | Aceptar ring del ACD, iniciar conversación |
| uc-opr-03 | Iniciar llamada saliente | ❌ | Outbound manual o preview dial |
| uc-opr-04 | Pausar audio (hold/unhold) | ❌ | Hold con música de espera |
| uc-opr-05 | Transferir llamada | ❌ | Warm/blind transfer a agente o cola |
| uc-opr-06 | Registrar disposición | ❌ | Wrap-up post-llamada con catálogo configurable |
| uc-opr-07 | Gestionar break | ❌ | Tipos Lunch/Training/Admin con quota policy |
| uc-opr-08 | Ver métricas propias | ❌ | Self-service: KPIs del propio agente |
| uc-opr-09 | Ver historial propias llamadas | ❌ | Lista paginada inbound+outbound propias |
| uc-opr-10 | Leer buzón interno | ❌ | Mensajería interna CNST-002 (no email externo) |

### Dominio: PERMISSIONS — ✅ 10/10

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-perm-01 | Asignar grupo a usuario | ✅ | `GroupAssignModal mode='assign'` |
| uc-perm-02 | Revocar grupo de usuario | ✅ | `GroupAssignModal mode='revoke'` |
| uc-perm-03 | Conceder permiso excepcional | ✅ | `TemporaryPermissionsPage.jsx` |
| uc-perm-04 | Revocar permiso excepcional | ✅ | `PermissionsPage.jsx` + thunks |
| uc-perm-05 | Crear/modificar grupo | ✅ | `GroupManagementPage.jsx` |
| uc-perm-06 | Asignar funciones a grupo | ✅ | `GroupCompositionPage.jsx` |
| uc-perm-07 | Verificar permiso de usuario | ✅ | `PermissionsPage.jsx`, `fetchUserPermissions` |
| uc-perm-08 | Generar menú dinámico | ✅ | `DashboardLayout` usa permisos efectivos para nav |
| uc-perm-09 | Auditar acceso (write side) | ✅ | `AccessAuditPage.jsx` — visualización del trail |
| uc-perm-10 | Consultar auditoría de permisos | ✅ | `PermissionsAuditPage.jsx` |

### Dominio: PIPELINE — ✅ 3/4, 🟡 1/4

| UC | Título | Estado | Evidencia / Gap |
|----|--------|--------|-----------------|
| uc-pip-01 | Ver estado del pipeline ETL | 🟡 | `ETLLogsPage` da visibilidad parcial; falta página de estado general con lag/throughput/health metrics |
| uc-pip-02 | Diagnosticar pipeline fallado | ✅ | `ETLLogsPage.jsx` filtro "Solo errores" + detail view |
| uc-pip-03 | Ver timestamp último refresh | ✅ | `ETLAvailabilityPage.jsx` con freshness badges |
| uc-pip-04 | Reintentar pipeline fallado | ✅ | `ETLLogsPage.jsx` retry con `ConfirmModal` |

### Dominio: REPORTS — ✅ 14/16, 🟡 2/16

| UC | Título | Estado | Evidencia / Gap |
|----|--------|--------|-----------------|
| uc-rpt-01 | Ver dashboard | ✅ | `Dashboard.jsx`, `AnalyticsDashboard.jsx` |
| uc-rpt-02 | Ver métricas en tiempo real | 🟡 | `AnalyticsDashboard` tiene charts; falta WebSocket sub-minuto para datos live |
| uc-rpt-03 | Ver reportes históricos | ✅ | Tab Historial en `AnalyticsDashboard` + `fetchReportHistory` |
| uc-rpt-04 | Exportar reporte | ✅ | `ExportHub`, `LogExportPage.jsx` |
| uc-rpt-07 | Programar reporte | 🟡 | `ScheduledReports.jsx` existe como componente; falta slice/thunk + página dedicada con CRUD |
| uc-rpt-08 | Ver reportes programados | 🟡 | Mismo componente; falta gestión (pause/resume/delete/run-now) |
| uc-rpt-09 | Guardar filtros | ✅ | `SavedFiltersPanel` + `savedFiltersSlice` |
| uc-rpt-10 | Guardar vista completa | ✅ | `SavedFiltersPanel` en 6 páginas de reportes |
| uc-rpt-11 | Compartir vista | ✅ | `ShareReportModal` en 6 páginas + `generateShareUrl` |
| uc-rpt-12 | Reporte de agentes | ✅ | `AgentsReportPage.jsx` |
| uc-rpt-13 | Reporte de colas | ✅ | `QueuesReportPage.jsx` |
| uc-rpt-14 | Reporte de campañas | ✅ | `CampaignsReportPage.jsx` |
| uc-rpt-15 | Reporte de transferencias | ✅ | `TransfersReportPage.jsx` |
| uc-rpt-16 | Reporte de menús IVR | ✅ | `IVRMenusReportPage.jsx` |
| uc-rpt-17 | Reporte de clientes únicos | ✅ | `UniqueClientsReportPage.jsx` |
| uc-inc-rpt-01 | Resolver segmento del usuario | ✅ | `SegmentsPage.jsx` + lógica RBAC de segmentación |

### Dominio: SUPERVISION — ❌ 3/3 (módulo CTI nuevo)

| UC | Título | Estado | Descripción del UC |
|----|--------|--------|--------------------|
| uc-sup-01 | Modos de supervisión (silent/whisper) | ❌ | Escuchar llamada en vivo — requiere integración CTI WebSocket |
| uc-sup-02 | Supervisión invasiva (barge-in) | ❌ | Intervenir en llamada activa — requiere CTI |
| uc-sup-03 | Enviar mensaje a agente | ❌ | Broadcast vía SSE a agentes en llamada |

### Dominio: USERS — ✅ 4/4

| UC | Título | Estado | Evidencia |
|----|--------|--------|-----------|
| uc-usr-01 | Crear usuario | ✅ | `UserManagement.jsx`, `createUser` |
| uc-usr-02 | Consultar usuarios | ✅ | `UserManagement.jsx`, `fetchUsers` |
| uc-usr-03 | Modificar usuario | ✅ | `UserManagement.jsx`, `updateUser` |
| uc-usr-04 | Eliminar usuario (baja lógica) | ✅ | `UserManagement.jsx`, `deactivateUser` |

---

## Uso operacional

El sistema será usado por:
- **Supervisores**: dashboard + alertas en tiempo de trabajo (turno de 8h). Reportes
  al inicio del día para planificación.
- **Agentes**: panel de operador activo durante toda la jornada — alta frecuencia de
  uso, latencia crítica (<200ms para cambio de estado).
- **Admins RBAC**: uso puntual (onboarding, incidentes de permisos).

---

## Atributos de calidad

| Atributo | Relevancia | Referencia en corpus |
|----------|-----------|---------------------|
| Rendimiento | Alta — agentes usan el panel en tiempo real | CNST-009, uc-opr-* |
| Seguridad | Crítica — datos PII de callers hasheados | CNST-026, uc-cli-* |
| Auditabilidad | Crítica — SOX/ISO compliance | uc-aud-*, uc-perm-09 |
| Usabilidad | Alta — agentes usan bajo presión de llamada | uc-opr-01..07 |
| Disponibilidad | Alta — sistema de producción 24/7 | uc-sup-01, uc-alr-* |

---

## Restricciones identificadas

| Restricción | Tipo | Impacto |
|-------------|------|---------|
| uc-cli-* excluidos del scope | Scope | 5 UCs menos — no implementar en React |
| uc-opr-02..05 dependen de CTI | Técnica | Requiere integración WebSocket con PBX backend |
| uc-sup-01..02 dependen de CTI | Técnica | Monitor de llamadas en vivo — backend real |
| CNST-026: sin PII en logs | Legal | caller_hash obligatorio — no implementable en frontend |
| 1551 tests actuales deben pasar | Técnica | No romper baseline de tests |

---

## Fuera de alcance (excluido formalmente)

1. **uc-cli-01..05** — flujos IVR/PBX: responsabilidad del sistema backend de telefonía
2. **Integración CTI real** para uc-opr-02..05 y uc-sup-01..02 — depende del backend
3. **Persistencia real de reporting programado** — el backend de scheduling no existe

---

## Criterios de éxito del WP

1. Artefacto de análisis completo con 83 UCs clasificados y evidencia verificada
2. Decisiones de scope registradas (qué se implementa, qué se excluye y por qué)
3. Plan de WPs derivados para los módulos pendientes
4. 0 ambigüedades de scope al finalizar el WP

---

## Gaps a implementar — priorización

### GRUPO A — Parciales (4 UCs) — Alta prioridad
Componentes existen, falta completar el workflow:

| UC | Título | Qué falta |
|----|--------|-----------|
| uc-rpt-07 | Programar reporte | Slice + thunk + página CRUD de schedules |
| uc-rpt-08 | Ver reportes programados | Gestión pause/resume/delete/run-now |
| uc-pip-01 | Estado del pipeline ETL | Página dedicada con lag/throughput/health |
| uc-rpt-02 | Métricas en tiempo real | WebSocket sub-minuto o polling agresivo |

### GRUPO B — Módulo Operador (10 UCs) — Media prioridad
Panel de agente completo — no existe ningún archivo en src/:

| UC | Título | Complejidad |
|----|--------|-------------|
| uc-opr-01 | Cambiar estado del agente | Media — estado + routing signal |
| uc-opr-06 | Registrar disposición (wrap-up) | Media — catálogo + formulario |
| uc-opr-07 | Gestionar break | Media — quota policy + aprobación |
| uc-opr-08 | Ver métricas propias | Baja — tabla/chart self-service |
| uc-opr-09 | Ver historial propias llamadas | Baja — lista paginada |
| uc-opr-10 | Leer buzón interno | Media — inbox + SSE |
| uc-opr-02 | Aceptar oferta de llamada | Alta — depende de CTI |
| uc-opr-03 | Iniciar llamada saliente | Alta — depende de CTI |
| uc-opr-04 | Hold/Unhold | Alta — depende de CTI |
| uc-opr-05 | Transferir llamada | Alta — depende de CTI |

### GRUPO C — Módulo Supervisión (3 UCs) — Baja prioridad (depende de CTI backend)

| UC | Título | Bloqueador |
|----|--------|-----------|
| uc-sup-01 | Monitor llamadas (silent/whisper) | Backend CTI WebSocket |
| uc-sup-02 | Barge-in | Backend CTI WebSocket |
| uc-sup-03 | Mensajería broadcast SSE | Backend SSE endpoint |

---

## Stopping Point Manifest

| SP | Fase | Tipo | Evento | Acción requerida |
|----|------|------|--------|-----------------|
| SP-01 | Phase 1 → Phase 3 | gate-fase | Análisis DISCOVER completo | Confirmar scope: UCs excluidos, grupos A/B/C aprobados |
| SP-02 | Phase 3 → Phase 8 | gate-decision | Priorización de grupos | Decidir si implementar Grupo B (Operador) o solo Grupo A (Parciales) primero |
| SP-03 | Phase 8 → Phase 10 | gate-fase | Task plan aprobado | Confirmar plan de tareas antes de ejecutar |
| SP-04 | Phase 10 → Phase 11 | gate-operacion | Tests green, 0 regressions | Ejecutar suite completa antes de cerrar |
