```yml
created_at: 2026-05-06 02:07:30
project: IACT-UI
work_package: 2026-05-06-02-07-30-uc-full-implementation
phase: Phase 3 — DIAGNOSE
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# Análisis profundo — 15 UCs pendientes

Análisis basado en lectura directa de código fuente. Cada hallazgo
es PROVEN (observado en archivo:línea) o INFERRED (derivado de lo observado).

---

## Hallazgo transversal crítico: `window.confirm()` como anti-patrón

**PROVEN** — `window.confirm()` se usa en **10+ lugares** del codebase:

| Archivo | Línea aprox | Acción |
|---------|-------------|--------|
| `UserManagement.jsx` | l.58 | Eliminar usuario |
| `ActiveSessions.jsx` | l.62 | Revocar sesión |
| `UserList.jsx` | l.69 | Eliminar usuario |
| `SavedFiltersPanel.jsx` | l.16 | Eliminar vista guardada |
| `ScheduledReports.jsx` | l.75 | Eliminar schedule |
| `JobMonitoring.jsx` | l.162 | Cancelar job |
| `FunctionCatalogPage.jsx` | l.116 | Desactivar función |
| `AGRCatalogPage.jsx` | l.108 | Desactivar AGR |
| `GroupManagementPage.jsx` | l.123 | Desactivar grupo |

Los UCs `uc-auth-02`, `uc-alr-03` y `uc-pip-04` requieren flujos de
confirmación. Sin un `ConfirmModal` reutilizable, cada uno implementará
su propio modal de forma inconsistente.

**Conclusión:** Antes de implementar los UCs, se necesita crear
`ConfirmModal` — componente base que reemplaza `window.confirm()` en
toda la app. Es infraestructura compartida, no solo para estos UCs.

---

## Infraestructura nueva necesaria (pre-requisitos)

### INFRA-01 — `ConfirmModal` (componente shared)

**Existe:** `Modal.jsx` completo (`src/components/shared/Modal.jsx`) con:
- overlay, title, children, footer, size sm/md/lg, Escape key, backdrop click

**Falta:** Un wrapper de confirmación estándar encima de `Modal`.

**Nuevo archivo:** `src/components/shared/ConfirmModal.jsx`

```jsx
// Props: isOpen, onClose, onConfirm, title, message, confirmLabel, variant ('danger'|'warning'|'default')
// Usa <Modal> internamente con footer [Cancel] [Confirm]
// variant='danger' → botón rojo; 'warning' → naranja; 'default' → primario
```

**SCSS:** No necesario — ya existe `_modal.scss` con todas las clases.

**Tests:** `src/components/shared/__tests__/ConfirmModal.test.jsx`

---

### INFRA-02 — Permisos nuevos en `FunctionCatalog`

**Falta** en `src/permissions/catalog.js`:

```js
MANAGE_SOD_RULES:     'sistema.administracion.acceso.sod.gestionar',  // adm-01 CRUD
RETRY_PIPELINE:       'sistema.observabilidad.pipeline.reintentar',   // pip-04
SHARE_REPORTS:        'sistema.analisis.reportes.compartir',          // rpt-11
VIEW_PERMISSIONS_AUDIT: 'sistema.administracion.permisos.auditoria',  // perm-10
```

**Archivo:** `src/permissions/catalog.js` — agregar 4 constantes.

---

## Análisis por UC

### uc-adm-01 — Gestionar ciclo de vida reglas SoD

**Estado real: ❌ INCOMPLETO** (no es solo verificación)

**Qué tiene `SeparationRulesPage`:** [PROVEN — leído completo]
- ✅ Ver lista de reglas (hardcoded, no Redux)
- ✅ Toggle activa/inactiva (local state, sin persistencia)
- ✅ Ver violaciones (sección expandible)
- ❌ Crear nueva regla
- ❌ Editar regla existente (nombre, conjuntos de funciones)
- ❌ Desactivar permanentemente (diferente a toggle)
- ❌ Redux: usa `useState` local con datos mock, NO despacha al store

**Qué tiene el slice:** [PROVEN — `accessSlice.js`]
- `validateSeparationRules` — solo valida, no gestiona
- NO: `createSoDRule`, `updateSoDRule`, `deactivateSoDRule`

**Qué tiene el service:** [PROVEN — `accessService.js`]
- NO hay métodos para SoD CRUD

**Lo que falta:**
1. `accessService` → 3 métodos: `createSoDRule`, `updateSoDRule`, `deactivateSoDRule`
2. `accessSlice` → 3 thunks + state shape `sodRules: []`
3. `SeparationRulesPage` → refactor: leer de Redux + formulario crear/editar (modal)
4. Permiso `MANAGE_SOD_RULES` en `FunctionCatalog` + ruta protegida

**Archivos afectados:**
- `src/services/accessService.js` — 3 métodos nuevos
- `src/redux/slices/accessSlice.js` — 3 thunks + state
- `src/pages/access/SeparationRulesPage.jsx` — refactor completo
- `src/permissions/catalog.js` — 1 permiso
- Tests: `src/pages/access/__tests__/SeparationRulesPage.test.jsx` (nuevo)

---

### uc-auth-02 — Cerrar sesión con confirmación

**Estado real: ⚠ PARCIAL** (lógica existe, UX incompleta)

**Qué existe:** [PROVEN]
- `authSlice.logout` en `src/redux/slices/authSlice.js`
- `UserMenu.jsx` llama `onLogout` → `dispatch(logout())`
- `ActiveSessions.jsx` existe para gestión de sesiones concurrentes

**Lo que falta:**
1. `ConfirmModal` (INFRA-01) — prerequisito
2. Interceptar el click en `UserMenu` → mostrar modal antes de `dispatch(logout())`
3. El UC menciona sesiones concurrentes y cierre forzado por inactividad:
   - `sessionSlice.js` existe — verificar si tiene `forceLogoutAll`
   - Si no existe: agregar thunk `logoutAllSessions` en `sessionSlice`

**Archivos afectados:**
- `src/components/navigation/Header/UserMenu.jsx` — agregar estado modal + ConfirmModal
- `src/components/shared/ConfirmModal.jsx` (INFRA-01)
- `src/redux/slices/sessionSlice.js` — verificar/agregar `logoutAllSessions`
- Tests: actualizar `UserMenu` tests

---

### uc-alr-03 — Reconocer alerta con confirmación

**Estado real: ⚠ PARCIAL** (acción existe, sin confirmación)

**Qué existe:** [PROVEN — `AlertsPage.jsx`]
- `handleAcknowledge` → `dispatch(updateAlert({ id, status: 'acknowledged' }))`
- Botón "Confirmar" inline por alerta

**Lo que falta:**
1. `ConfirmModal` (INFRA-01) — prerequisito
2. Intercalar modal entre click y dispatch: mostrar nombre de alerta + severidad

**Archivos afectados:**
- `src/components/pages/Alerts/AlertsPage.jsx` — estado modal + ConfirmModal
- `src/components/shared/ConfirmModal.jsx` (INFRA-01)
- Tests: `src/pages/alerts/__tests__/alertsPages.test.jsx` — actualizar

---

### uc-acc-02 — Revocar funciones (flujo diferenciado)

**Estado real: ⚠ PARCIAL** (thunk existe, UI no diferenciada)

**Qué existe:** [PROVEN — `accessSlice.js`]
- `accessSlice.revokeFunction` — thunk completo
- `accessService.revokeFunctions` — método HTTP completo

**Qué tiene `AssignFunctionsPage`:** [PROVEN — leído completo]
- Solo flujo de asignación (UC-ACC-01)
- Sin UI de revocación

**Lo que falta:**
1. Agregar modo "Revocar" en `AssignFunctionsPage`:
   - Tab o toggle "Asignar / Revocar" usando clases `_tabs.scss` existentes
   - En modo revocar: mostrar funciones actualmente asignadas al usuario
   - Botón "Revocar seleccionadas" que llama `revokeFunction`
   - Campo motivo de revocación (opcional según UC)
2. `accessSlice` necesita `fetchUserAssignedFunctions` para listar qué tiene el usuario

**Archivos afectados:**
- `src/pages/access/AssignFunctionsPage.jsx` — agregar tab Revocar
- `src/redux/slices/accessSlice.js` — posible thunk `fetchUserAssignedFunctions`
- `src/services/accessService.js` — verificar si `getUserPermissions` cubre esto
- Tests: `src/pages/access/__tests__/AssignFunctionsPage.test.jsx` — actualizar

---

### uc-perm-01 + uc-perm-02 — Asignar/Revocar grupo a usuario

**Estado real: ❌ INCOMPLETO** (servicio parcial, sin slice ni UI)

**Qué existe:** [PROVEN — `accessService.js` l.157-171]
- `accessService.assignAccessGroup(userId, groupId)` — método HTTP EXISTS
  `POST /users/{userId}/access-groups/`

**Qué falta en service:**
- `accessService.revokeAccessGroup(userId, groupId)` — NO existe

**Qué falta en slice:** [PROVEN — `accessSlice.js`]
- NO: `assignGroupToUser`, `revokeGroupFromUser`, `fetchUserGroups`

**Lo que necesita perm-01:**
1. `accessSlice` → thunk `assignGroupToUser` (usa service existente)
2. `accessSlice` → thunk `fetchUserGroups` (lista grupos asignados a usuario)
3. `GroupAssignModal` — componente nuevo:
   ```
   src/components/access/GroupAssignModal.jsx
   props: isOpen, onClose, userId, username, mode ('assign'|'revoke')
   ```
4. Punto de entrada: botón en `GroupManagementPage` o sub-acción en `/users`
5. Estilos: usa `_modal.scss` + `_forms.scss` (existentes)

**Lo que necesita perm-02 (adicional a perm-01):**
1. `accessService.revokeAccessGroup(userId, groupId)` — nuevo método
2. `accessSlice` → thunk `revokeGroupFromUser`
3. `GroupAssignModal` mode='revoke' — lista grupos actuales, permite seleccionar para revocar

**Archivos afectados:**
- `src/services/accessService.js` — 1 nuevo método
- `src/redux/slices/accessSlice.js` — 3 nuevos thunks
- `src/components/access/GroupAssignModal.jsx` — nuevo componente
- `src/components/access/GroupAssignModal.test.jsx` — nuevo test
- `src/pages/access/GroupManagementPage.jsx` — botón "Asignar a usuario"

---

### uc-perm-10 — Auditoría de permisos sub-ruta

**Estado real: ⚠ PARCIAL** (datos disponibles, sin ruta propia)

**Qué existe:** [PROVEN]
- `accessSlice.fetchAccessAudit` — thunk completo
- `AccessAuditPage` — página funcional (UC-ACC-09 = auditar cambios de acceso)

**Diferencia semántica:**
- UC-ACC-09 = auditoría de *cambios en control de acceso* (quién asignó/revocó qué)
- UC-PERM-10 = auditoría de *permisos efectivos* (qué puede hacer cada usuario hoy)

**Lo que falta:**
1. Nueva ruta `/access/audit/permissions` en AppRouter
2. `PermissionsAuditPage` — nueva página que muestra permisos efectivos por usuario
   (diferente a AccessAuditPage que muestra historial de cambios)
3. Posible nuevo thunk `fetchEffectivePermissions(userId)` en `accessSlice`
4. Permiso `VIEW_PERMISSIONS_AUDIT` en FunctionCatalog

**Archivos afectados:**
- `src/router/AppRouter.jsx` — nueva ruta
- `src/pages/access/PermissionsAuditPage.jsx` — nueva página
- `src/redux/slices/accessSlice.js` — posible thunk nuevo
- `src/permissions/catalog.js` — 1 permiso

---

### uc-pip-02 — Errores ETL (vista diferenciada)

**Estado real: ⚠ CASI COMPLETO** (funcionalidad existe, no suficientemente visible)

**Qué existe:** [PROVEN — `ETLLogsPage.jsx`]
- Filtro `status` con opciones: Todos, success, **failed**, running
- Despacha `fetchETLLogs({ status: 'failed' })` al aplicar

**Lo que falta:**
- Un botón/tab de acceso rápido "Ver solo errores" que pre-configure el filtro
- Los errores actuales se muestran en la misma tabla — no hay diferenciación visual
- Badge/contador de errores recientes

**Esfuerzo:** Muy bajo — agregar botón quick-filter y clase CSS de resaltado.

**Archivos afectados:**
- `src/pages/logs/ETLLogsPage.jsx` — botón quick-filter + estilos condicionales
- Tests: actualizar o agregar test de filtro

---

### uc-pip-03 — Disponibilidad de datos ETL

**Estado real: ❌ SIN IMPLEMENTACIÓN**

**Qué existe:** ningún componente ni endpoint de disponibilidad.

**Lo que falta:**
1. `logsService.js` → método `getETLAvailability()` — nuevo
2. `logsSlice.js` → thunk `fetchETLAvailability` + state `etlAvailability: []`
3. `ETLAvailabilityPage.jsx` — nueva página:
   - Tabla de fuentes de datos con última actualización, freshness, estado
   - Ruta `/logs/etl/availability`
4. `AppRouter.jsx` — nueva ruta
5. Estilos: usa `_pages-shared.scss` + `_table.scss` (existentes)

**Archivos afectados:**
- `src/services/logsService.js` — 1 método nuevo
- `src/redux/slices/logsSlice.js` — 1 thunk + state
- `src/pages/logs/ETLAvailabilityPage.jsx` — nueva página
- `src/router/AppRouter.jsx` — nueva ruta
- Tests: `src/pages/logs/__tests__/ETLAvailabilityPage.test.jsx`

---

### uc-pip-04 — Reintento de pipeline

**Estado real: ❌ SIN IMPLEMENTACIÓN**

**Lo que falta:**
1. `logsService.js` → método `retryPipeline(pipelineId)` — nuevo
2. `logsSlice.js` → thunk `retryPipeline` con estado de retry en progreso
3. `ConfirmModal` (INFRA-01) — prerequisito para confirmación
4. Botón "Reintentar" en cada fila de `ETLLogsPage` (solo cuando status='failed')
5. Feedback post-retry: loading state + mensaje de éxito/error
6. Permiso `RETRY_PIPELINE` en FunctionCatalog

**Archivos afectados:**
- `src/services/logsService.js` — 1 método nuevo
- `src/redux/slices/logsSlice.js` — 1 thunk + estado retry
- `src/pages/logs/ETLLogsPage.jsx` — botón Reintentar + ConfirmModal
- `src/permissions/catalog.js` — 1 permiso
- Tests: actualizar `ETLLogsPage` tests

---

### uc-rpt-02 — Métricas en tiempo real

**Estado real: ✅ IMPLEMENTADO** (verificar cobertura del UC)

**Qué existe:** [PROVEN — `AnalyticsDashboard.jsx`]
- Tab `overview` con WebSocket suscrito al canal `metrics`
- `reportsSlice.updateMetrics` actualiza en tiempo real
- `MetricsCard`, `ChartComponent` renderizan los datos

**Veredicto:** UC-RPT-02 ya está cubierto por el tab `overview` de
`AnalyticsDashboard` (`/reports`). No necesita ruta separada.

**Acción:** Cerrar como ✅, actualizar coverage-analysis.

---

### uc-rpt-03 — Reportes históricos

**Estado real: ⚠ PARCIAL** (existe tab, semánticamente incompleto)

**Qué existe:** [PROVEN — `AnalyticsDashboard.jsx`]
- Tab `reports` → `ReportBuilder` (construir/generar reportes)
- Tab `overview` → métricas RT
- NO hay tab ni sección explícita de "reportes históricos ya generados"

**Lo que falta:**
- Una sección "Historial de reportes" que liste los reportes ya generados/exportados
- Puede ser nuevo tab `history` en `AnalyticsDashboard` (no nueva ruta obligatoria)
- Requiere endpoint/thunk `fetchReportHistory` en `reportsSlice`

**Esfuerzo:** Medio — nuevo tab + thunk + componente de lista.

**Archivos afectados:**
- `src/components/pages/Analytics/AnalyticsDashboard.jsx` — nuevo tab
- `src/redux/slices/reportsSlice.js` — thunk `fetchReportHistory`
- `src/services/reportsService.js` — método `getReportHistory()`
- Nuevo componente `ReportHistory.jsx` en `src/components/pages/Analytics/`
- Tests

---

### uc-rpt-09 — Configurar filtros

**Estado real: ✅ IMPLEMENTADO** (confirmar y cerrar)

**Qué existe:** [PROVEN]
- `savedFiltersSlice.js` — CRUD completo (fetch/save/delete)
- `SavedFiltersPanel.jsx` — componente standalone funcional
- `AgentsReportPage.jsx` — usa `saveFilter` vía import dinámico
- `ReportBuilder` tiene filtros de configuración inline

**Veredicto:** El UC "configurar filtros de reporte" está cubierto por
la infraestructura `savedFiltersSlice` + `SavedFiltersPanel`. No requiere
ruta propia — embedded en cada reporte es el patrón correcto.

**Acción:** Cerrar como ✅. El gap real es rpt-10 (generalizar a todos los módulos).

---

### uc-rpt-10 — Guardar vista (generalizar)

**Estado real: ⚠ PARCIAL** (infraestructura lista, aplicada en 1/6 páginas)

**Qué existe:** [PROVEN]
- `savedFiltersSlice` completo
- `SavedFiltersPanel.jsx` componente reutilizable
- `AgentsReportPage.jsx` ya lo usa (patrón establecido)

**Páginas que falta conectar** (5 páginas):
- `QueuesReportPage.jsx`
- `CampaignsReportPage.jsx`
- `TransfersReportPage.jsx`
- `IVRMenusReportPage.jsx`
- `UniqueClientsReportPage.jsx`

**Patrón a replicar** (copiar de `AgentsReportPage`):
```jsx
// 1. Importar SavedFiltersPanel
// 2. useState para nombre de vista + filtros activos
// 3. handleSaveFilter() con import dinámico de saveFilter
// 4. Renderizar <SavedFiltersPanel onApply={applyFilters} />
// 5. Botón "Guardar vista" + input nombre
```

**Esfuerzo:** Bajo-Medio — repetir patrón en 5 páginas.

**Archivos afectados:** 5 páginas existentes de reports (solo modificación).

---

### uc-rpt-11 — Compartir reporte

**Estado real: ❌ SIN IMPLEMENTACIÓN**

**Lo que falta:**
1. `reportsService.js` → método `shareReport(type, filters)` o generar URL client-side
2. `reportsSlice.js` → thunk `shareReport` + state `sharedUrl`
3. `ShareReportModal.jsx` — componente nuevo:
   - Input de URL generada (readonly + copy-to-clipboard)
   - Botón "Copiar enlace"
   - Opcional: campo email para compartir por correo
4. Botón "Compartir" en cada página de reporte
5. Permiso `SHARE_REPORTS` en FunctionCatalog
6. Estilos: usa `_modal.scss` + `_forms.scss`

**Nota:** La URL puede generarse client-side (serializar filtros en query params)
sin endpoint de backend. La opción de email sí requeriría endpoint.

**Archivos afectados:**
- `src/components/reports/ShareReportModal.jsx` — nuevo
- `src/redux/slices/reportsSlice.js` — thunk nuevo
- 5-6 páginas de reports — botón "Compartir"
- `src/permissions/catalog.js` — 1 permiso
- Tests

---

## Grafo de dependencias corregido

```
LEVEL 0 — infraestructura compartida (prerequisito global)
══════════════════════════════════════════════════════════
  INFRA-01  ConfirmModal.jsx          [Modal.jsx existe, solo wrapper nuevo]
  INFRA-02  FunctionCatalog (4 permisos nuevos)

LEVEL 1 — UCs sin dependencias entre sí (paralelos después de INFRA)
═════════════════════════════════════════════════════════════════════
  uc-adm-01  SoD CRUD                [accessService(3) + accessSlice(3) + SeparationRulesPage refactor]
  uc-auth-02 LogoutConfirmModal      [UserMenu + ConfirmModal(INFRA-01) + sessionSlice verify]
  uc-alr-03  AcknowledgeAlertModal   [AlertsPage + ConfirmModal(INFRA-01)]
  uc-acc-02  RevokeFunctions tab     [AssignFunctionsPage + tab UI]
  uc-perm-01 AssignGroupModal        [accessService(1exist) + accessSlice(2new) + GroupAssignModal(new)]
  uc-perm-10 PermissionsAuditPage    [nueva página + nueva ruta + posible thunk]
  uc-pip-02  ETL errors quick-filter [ETLLogsPage solo UI]
  uc-pip-03  ETLAvailabilityPage     [logsService(1) + logsSlice(1) + página nueva]
  uc-rpt-02  ✅ YA IMPLEMENTADO      [WebSocket en AnalyticsDashboard tab overview]
  uc-rpt-09  ✅ YA IMPLEMENTADO      [savedFiltersSlice + SavedFiltersPanel]
  uc-rpt-10  saveFilter x5 páginas   [5 páginas existentes, sin código nuevo de infra]

LEVEL 2 — dependen de un nodo Level 1
══════════════════════════════════════
  uc-perm-02  RevokeGroupModal       [← perm-01: reutiliza GroupAssignModal mode=revoke]
                                     [accessService(1new) + accessSlice(1new)]
  uc-pip-04   PipelineRetryModal     [← pip-02 (ETL state) + INFRA-01 (ConfirmModal)]
                                     [logsService(1) + logsSlice(1) + ETLLogsPage button]
  uc-rpt-03   ReportHistory tab      [← rpt-02 ✅ (patrón tab establecido)]
                                     [reportsService(1) + reportsSlice(1) + ReportHistory.jsx]

LEVEL 3 — el más profundo
══════════════════════════
  uc-rpt-11   ShareReportModal       [← rpt-10 (savedFilters generalizado)]
                                     [reportsSlice(1) + ShareReportModal.jsx + 6 páginas]
```

---

## Inventario completo de código nuevo

### Archivos nuevos

| Archivo | Tipo | Bloquea |
|---------|------|---------|
| `src/components/shared/ConfirmModal.jsx` | Componente | auth-02, alr-03, pip-04 |
| `src/components/shared/__tests__/ConfirmModal.test.jsx` | Test | — |
| `src/components/access/GroupAssignModal.jsx` | Componente | perm-01, perm-02 |
| `src/components/access/__tests__/GroupAssignModal.test.jsx` | Test | — |
| `src/components/reports/ShareReportModal.jsx` | Componente | rpt-11 |
| `src/components/pages/Analytics/ReportHistory.jsx` | Componente | rpt-03 |
| `src/pages/access/PermissionsAuditPage.jsx` | Página | perm-10 |
| `src/pages/access/__tests__/PermissionsAuditPage.test.jsx` | Test | — |
| `src/pages/logs/ETLAvailabilityPage.jsx` | Página | pip-03 |
| `src/pages/logs/__tests__/ETLAvailabilityPage.test.jsx` | Test | — |

**Total archivos nuevos: 10**

### Archivos modificados

| Archivo | Cambio | UC |
|---------|--------|-----|
| `src/permissions/catalog.js` | 4 constantes nuevas | adm-01, perm-10, pip-04, rpt-11 |
| `src/router/AppRouter.jsx` | 2 rutas nuevas (perm-10, pip-03) | perm-10, pip-03 |
| `src/services/accessService.js` | 3 métodos SoD + 1 revokeGroup | adm-01, perm-02 |
| `src/services/logsService.js` | 2 métodos (availability, retry) | pip-03, pip-04 |
| `src/services/reportsService.js` | 2 métodos (history, share) | rpt-03, rpt-11 |
| `src/redux/slices/accessSlice.js` | 6 thunks nuevos | adm-01, perm-01/02, perm-10 |
| `src/redux/slices/logsSlice.js` | 2 thunks nuevos | pip-03, pip-04 |
| `src/redux/slices/reportsSlice.js` | 2 thunks nuevos | rpt-03, rpt-11 |
| `src/redux/slices/sessionSlice.js` | verificar/agregar logoutAllSessions | auth-02 |
| `src/pages/access/SeparationRulesPage.jsx` | refactor completo (CRUD) | adm-01 |
| `src/pages/access/AssignFunctionsPage.jsx` | agregar tab Revocar | acc-02 |
| `src/pages/access/GroupManagementPage.jsx` | botón Asignar/Revocar usuario | perm-01/02 |
| `src/components/navigation/Header/UserMenu.jsx` | ConfirmModal logout | auth-02 |
| `src/components/pages/Alerts/AlertsPage.jsx` | ConfirmModal acknowledge | alr-03 |
| `src/pages/logs/ETLLogsPage.jsx` | quick-filter errores + retry button | pip-02, pip-04 |
| `src/components/pages/Analytics/AnalyticsDashboard.jsx` | tab History | rpt-03 |
| `src/pages/reports/QueuesReportPage.jsx` | saveFilter pattern | rpt-10 |
| `src/pages/reports/CampaignsReportPage.jsx` | saveFilter pattern | rpt-10 |
| `src/pages/reports/TransfersReportPage.jsx` | saveFilter pattern | rpt-10 |
| `src/pages/reports/IVRMenusReportPage.jsx` | saveFilter pattern | rpt-10 |
| `src/pages/reports/UniqueClientsReportPage.jsx` | saveFilter pattern | rpt-10 |
| `src/pages/reports/AgentsReportPage.jsx` | botón Compartir | rpt-11 |

**Total archivos modificados: 22**

### Redux nuevo

| Slice | Thunks nuevos | State nuevo |
|-------|---------------|-------------|
| `accessSlice` | `createSoDRule`, `updateSoDRule`, `deactivateSoDRule`, `assignGroupToUser`, `revokeGroupFromUser`, `fetchUserGroups`, `fetchEffectivePermissions` | `sodRules: []`, `userGroups: {}`, `effectivePermissions: {}` |
| `logsSlice` | `fetchETLAvailability`, `retryPipeline` | `etlAvailability: []`, `retryStatus: {}` |
| `reportsSlice` | `fetchReportHistory`, `shareReport` | `reportHistory: []`, `sharedUrl: null` |
| `sessionSlice` | `logoutAllSessions` (verificar) | — |

**Total thunks nuevos: ~10 | Total state shape nuevo: ~6 campos**

### Middleware
**No se necesita middleware nuevo.** El `loadingMiddleware` + `errorHandlingMiddleware`
cubren todas las operaciones nuevas. Los nuevos thunks siguen el patrón
`pending/fulfilled/rejected` que ambos middlewares ya manejan.

### SCSS
**No se necesita SCSS nuevo** para la mayoría de los UCs:
- Modales → `_modal.scss` existente
- Tabs → `_tabs.scss` existente
- Páginas nuevas → `_pages-shared.scss` existente
- Tablas → `_table.scss` existente

**Posibles adiciones menores:**
- `ETLAvailabilityPage` → clases de estado de freshness (si no existe en `_badges.scss`)
- `ShareReportModal` → estilos del input copy-to-clipboard (si no hay precedente)

---

## UCs cerrados (eran ⚠, ahora ✅)

| UC | Razón |
|----|-------|
| uc-rpt-02 | AnalyticsDashboard tab `overview` con WebSocket ya cubre "métricas en tiempo real" |
| uc-rpt-09 | `savedFiltersSlice` + `SavedFiltersPanel` ya cubre "configurar filtros"; el gap es rpt-10 |

---

## Orden de ejecución actualizado

```
ITER 0 — Infraestructura (prerequisito de todo):
  ConfirmModal.jsx + FunctionCatalog permisos

ITER 1 — Modales de confirmación (bajo riesgo, INFRA-01 lista):
  uc-auth-02 + uc-alr-03

ITER 2 — Access CRUD (flujos de revocación):
  uc-acc-02 (RevokeFunctions tab)
  uc-adm-01 (SoD CRUD — más complejo)

ITER 3 — Groups (perm-01 → perm-02):
  uc-perm-01 → uc-perm-02 (secuencial)
  uc-perm-10 (paralelo con perm-01)

ITER 4 — Pipeline ETL (pip-02 → pip-03/pip-04 paralelos):
  uc-pip-02 → uc-pip-03 paralelo con uc-pip-04

ITER 5 — Reports generalization:
  uc-rpt-10 (x5 páginas)
  uc-rpt-03 (History tab)

ITER 6 — Share:
  uc-rpt-11 (ShareReportModal)
```

**Cerrar como ✅ ahora:** uc-rpt-02, uc-rpt-09
