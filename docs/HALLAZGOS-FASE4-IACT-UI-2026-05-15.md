# Hallazgos FASE 4 — Conexión de páginas a la capa de datos correcta

**Artefacto:** HALLAZGOS-FASE4-IACT-UI-2026-05-15
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Rama:** `develop` — commits `0155a6e` → `effe3a1`
**Metodología:** TDD — corrección guiada por tests existentes y nuevos
**Estado:** Cerrado — deuda técnica activa en FASE 4 = 0

---

## Resumen ejecutivo

| Métrica | Antes | Después |
|---|---|---|
| IACT-ui test suites | 246 | **246** (0 nuevas suites) |
| IACT-ui tests | 2216 | **2217 (+1)** |
| Tests fallidos | 0 | **0** |
| Páginas con llamadas a métodos inexistentes | 11 | **0** |
| Páginas con thunks eliminados | 2 | **0** |
| Páginas con import directo de gateway (evitable) | 4 | **0** |
| Páginas con datos mock hardcodeados | 1 | **0** |

**Páginas corregidas:** 15 en 5 tareas (T4.1–T4.5)

---

## H-F4-001 — access/AssignGroup.jsx: `validateGroupAssignment` eliminado

**Tarea:** T4.1
**Commit:** `0155a6e`
**Tests afectados:** `AssignGroupPage.test.jsx` reescrito

### Descripción

`AssignGroup.jsx` implementaba un flujo de dos pasos: validar separación → asignar. El paso de validación despachaba `validateGroupAssignment`, thunk eliminado en T3.2 porque el endpoint `/api/access/groups/{id}/validate-for-user` no existe en IACT-api.

En runtime, el dispatch lanzaba `TypeError: validateGroupAssignment is not a function` en el momento del click en "Verificar separación".

Adicionalmente, el selector `selectValidatingGroup` (también eliminado) se usaba para controlar el estado del botón — al no existir retornaba `undefined`, bloqueando el botón permanentemente.

### Corrección

El flujo de dos pasos fue reemplazado por un flujo directo con confirmación explícita mediante checkbox. El usuario completa el formulario, marca el checkbox de confirmación y despacha `assignGroupToUser` directamente.

```jsx
// ANTES (roto)
await dispatch(validateGroupAssignment({ userId, groupId }))
// → TypeError: validateGroupAssignment is not a function

// DESPUÉS
await dispatch(assignGroupToUser({ userId, groupId, expiresAt }))
// Confirmación explícita via checkbox — sin pre-validación
```

---

## H-F4-002 — access/GroupComposition.jsx: `getGroupCascadeImpact()` inexistente + gateway directo

**Tarea:** T4.1
**Commit:** `0155a6e`
**Tests afectados:** `GroupCompositionPage.test.jsx` reescrito

### Descripción

`GroupComposition.jsx` presentaba dos problemas:

**Problema 1 — gateway directo:**
```javascript
import accessService from '../../services/accessGateway'
// ...
const data = await accessService.getFunctionGroups()
```
La página llamaba `getFunctionGroups()` directamente en lugar de usar el estado Redux (`selectGroups` / `selectGroupers`). El método existe en el gateway, pero al llamarlo directamente se bypasea el interceptor de autenticación de `apiClient.js`.

**Problema 2 — método inexistente:**
```javascript
const impact = await accessService.getGroupCascadeImpact(selectedGroupId, pendingAdd)
```
`getGroupCascadeImpact()` fue eliminado en T1.5 porque el endpoint `/api/access/groups/{id}/cascade-impact` no existe en IACT-api. En runtime lanzaba `TypeError: accessService.getGroupCascadeImpact is not a function`, bloqueando completamente la adición de funciones a grupos.

### Corrección

- Eliminado `import accessService` — el componente ya no importa el gateway directamente.
- `getFunctionGroups()` → `dispatch(fetchGroupers())` + `useSelector(selectGroupers)`.
- Bloque completo de cascade impact eliminado (UI y lógica).

---

## H-F4-003 — access/GroupManagement.jsx: gateway directo en `loadGroups()`

**Tarea:** T4.1
**Commit:** `0155a6e`
**Tests afectados:** `GroupManagementPage.test.jsx` (añadido `fetchGroupers` al mock)

### Descripción

```javascript
import accessService from '../../services/accessGateway'
// ...
const loadGroups = async () => {
  const data = await accessService.getFunctionGroups()
  setLocalGroups(Array.isArray(data) ? data : [])
}
```

La función `loadGroups` llamaba directamente al gateway y guardaba el resultado en estado local, ignorando el estado Redux. Si el gateway fallaba (catch silencioso), el componente usaba los grupos de Redux como fallback pero el flujo principal era incorrecto.

### Corrección

- Eliminado `import accessService`.
- `loadGroups()` → `dispatch(fetchGroupers())` en `useEffect`.
- Los grupos se leen de `useSelector(selectGroups)` directamente.

---

## H-F4-004 — alerts/AlertConfig.jsx: `validateCondition()` inexistente

**Tarea:** T4.2
**Commit:** `fe34795`

### Descripción

```javascript
import alertsGateway from '../../services/alertsGateway'
// ...
const result = await alertsGateway.validateCondition({ metric, scope, threshold, window })
```

`validateCondition()` fue eliminado del gateway en T2.1 porque el endpoint `/api/alerts/validate-condition/` no existe en IACT-api. En runtime lanzaba `TypeError: alertsGateway.validateCondition is not a function` al hacer click en "Probar condición (dry-run)".

El endpoint correcto para validar condiciones sin persistir es `POST /api/alerts/rules/dry-run/`, implementado como `dryRunAlertRule` thunk en T3.1.

### Corrección

```javascript
// ANTES
const result = await alertsGateway.validateCondition({ metric, scope, threshold, window })
setDryRunResult({ ok: true, data: result })

// DESPUÉS
await dispatch(dryRunAlertRule({ metric, scope, threshold, window }))
// resultado en Redux state via selectDryRunResult
const dryRunResult = useSelector(selectDryRunResult)
```

---

## H-F4-005 — alerts/Templates.jsx: `fetchTemplates` y `selectTemplates` eliminados

**Tarea:** T4.2
**Commit:** `fe34795`

### Descripción

```javascript
import { fetchTemplates, selectTemplates, selectLoading } from '../../redux/slices/alerts'
// ...
useEffect(() => {
  dispatch(fetchTemplates()) // → TypeError: fetchTemplates is not a function
}, [dispatch])
```

`fetchTemplates` y `selectTemplates` fueron eliminados del slice en T3.1 porque el endpoint `/api/alerts/templates/` no existe en IACT-api. La página lanzaba `TypeError` en el mount.

La página mostraba datos hardcodeados localmente (6 plantillas estáticas) que no dependían de la respuesta del dispatch — el dispatch solo lanzaba el error sin afectar la UI visible.

### Corrección

Eliminados todos los imports de Redux del componente. La página es ahora un componente React puro (`useState` local) que muestra las plantillas estáticas sin ninguna llamada a la API. No se pierde funcionalidad porque el endpoint no existe.

---

## H-F4-006 — audit/Export.jsx: modelo blob incorrecto + gateway directo

**Tarea:** T4.3
**Commit:** `34697b1`

### Descripción

```javascript
import auditService from '../../services/auditGateway'
// ...
const blob = await auditService.exportLogs(exportConfig.format, filters)
const url = window.URL.createObjectURL(blob)
downloadLink.click()
```

Dos problemas encadenados:

**Problema 1:** La página importaba `auditService` directamente en lugar de despachar el thunk `exportAuditLogs` del slice.

**Problema 2 (crítico):** En T1.6 se corrigió `auditGateway.exportLogs()` para retornar `{ job_id }` en lugar de un blob. La exportación de auditoría en IACT-api es **asíncrona** — el backend encola el job y retorna un identificador. La página intentaba hacer `window.URL.createObjectURL({ job_id: '...' })`, lo que lanzaba `TypeError: Failed to execute 'createObjectURL' on 'URL': No matching signature`.

### Corrección

La página fue reescrita para usar el modelo async correcto:

```javascript
// DESPUÉS — modelo async
await dispatch(exportAuditLogs({ format, filters }))
const exportJobId = useSelector(selectExportJobId)
// La UI muestra el job_id para seguimiento
```

La UI ahora muestra el `job_id` recibido con instrucciones de seguimiento, en lugar de intentar una descarga directa que nunca funcionó.

---

## H-F4-007 — users/UserManagement.jsx: gateway directo + datos mock

**Tarea:** T4.4
**Commit:** `2209cb2`

### Descripción

`UserManagement.jsx` acumulaba cinco problemas:

| Función | Problema | Impacto |
|---|---|---|
| `loadUsers()` | Datos mock hardcodeados (3 usuarios estáticos) | La página nunca cargó usuarios reales |
| `handleCreateUser()` | Usa `userAuth.createAccount()` facade, no slice | createUser thunk no se usa |
| `handleBlockUser()` | `userGateway.blockUser()` directo | Bypasea Redux — el estado no se actualiza globalmente |
| `handleUnblockUser()` | `userGateway.unblockUser()` directo | Bypasea Redux — el estado no se actualiza globalmente |
| `handleConfirmDeactivate()` | Actualiza estado local sin despachar thunk | deactivateUser thunk nunca se usa |

Adicionalmente, `users` y `loading` eran estado local (`useState`) en lugar de leer del store Redux (`selectUsers`, `selectUsersLoading`), lo que impedía que otros componentes observaran los cambios.

### Corrección

Cada operación fue reemplazada por el thunk correcto del `user.slice`:

```javascript
// DESPUÉS
const users   = useSelector(selectUsers)
const loading = useSelector(selectUsersLoading)

useEffect(() => { dispatch(fetchUsers()) }, [dispatch])

const handleCreateUser   = async (data) => dispatch(createUser(data))
const handleBlockUser    = async (id)   => dispatch(blockUser(id))
const handleUnblockUser  = async (id)   => dispatch(unblockUser(id))
const handleConfirmDeactivate = async () => dispatch(deactivateUser(userId))
const handleUpdateUser   = async (data) => dispatch(patchUser({ id, data }))
```

---

## H-F4-008 — reports/: 8 páginas con métodos incorrectos o inexistentes

**Tarea:** T4.5
**Commit:** `effe3a1`

### Descripción

Las páginas de reports presentaban tres categorías de errores:

#### Categoría A — `generateShareUrl()` inexistente (7 páginas)

Las páginas `AgentsReport`, `CampaignsReport`, `HistoricalReports`, `IVRMenusReport`, `QueuesReport`, `TransfersReport` y `UniqueClientsReport` llamaban:

```javascript
const url = reportsService.generateShareUrl('agents', filters)
```

`generateShareUrl()` no existe en `reportsGateway.js`. Al abrir el modal de compartir, se lanzaba `TypeError: reportsService.generateShareUrl is not a function`.

**Corrección:** implementada como función utilitaria client-side en cada página:

```javascript
function buildShareUrl(reportType, filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
  )
  return `${window.location.origin}/reports/${reportType}${params.toString() ? '?' + params : ''}`
}
```

No requiere llamada a la API — la URL se construye del `window.location` actual.

#### Categoría B — nombres de métodos incorrectos (3 páginas)

| Página | Llamada incorrecta | Método correcto en gateway |
|---|---|---|
| `IVRMenusReport.jsx` | `getIvrMenus()` | `getIVRMenusReport()` |
| `TransfersReport.jsx` | `getTransfersByCentro()` | `getIVRTransfersReport()` |
| `UniqueClientsReport.jsx` | `getUniqueClients()` | `getUniqueClientsReport()` |

Los tres métodos incorrectos lanzaban `TypeError: reportsService.X is not a function`, bloqueando la carga de datos en cada reporte.

#### Categoría C — `cancelExportJob()` incorrecto (1 página)

```javascript
// ReportExport.jsx
await reportsService.cancelExportJob(jobId)  // → TypeError

// Corrección
await reportsService.cancelExport(jobId)     // método correcto
```

---

## Inventario de cambios por archivo

| Archivo | Tarea | Tipo | Descripción |
|---|---|---|---|
| `pages/access/AssignGroup.jsx` | T4.1 | fix | validateGroupAssignment → flujo directo con checkbox |
| `pages/access/GroupComposition.jsx` | T4.1 | fix | gateway directo eliminado; getGroupCascadeImpact eliminado |
| `pages/access/GroupManagement.jsx` | T4.1 | fix | loadGroups() → dispatch(fetchGroupers()) |
| `pages/alerts/AlertConfig.jsx` | T4.2 | fix | validateCondition() → dryRunAlertRule thunk |
| `pages/alerts/Templates.jsx` | T4.2 | fix | fetchTemplates eliminado; componente estático puro |
| `pages/audit/Export.jsx` | T4.3 | fix+rewrite | modelo blob → modelo async job_id |
| `pages/users/UserManagement/UserManagement.jsx` | T4.4 | fix | gateway directo → thunks; datos mock → fetchUsers |
| `pages/reports/AgentsReport.jsx` | T4.5 | fix | generateShareUrl → buildShareUrl |
| `pages/reports/CampaignsReport.jsx` | T4.5 | fix | generateShareUrl → buildShareUrl |
| `pages/reports/HistoricalReports.jsx` | T4.5 | fix | generateShareUrl → buildShareUrl |
| `pages/reports/IVRMenusReport.jsx` | T4.5 | fix | getIvrMenus + generateShareUrl → corregidos |
| `pages/reports/QueuesReport.jsx` | T4.5 | fix | generateShareUrl → buildShareUrl |
| `pages/reports/TransfersReport.jsx` | T4.5 | fix | getTransfersByCentro + generateShareUrl → corregidos |
| `pages/reports/UniqueClientsReport.jsx` | T4.5 | fix | getUniqueClients + generateShareUrl → corregidos |
| `pages/reports/ReportExport.jsx` | T4.5 | fix | cancelExportJob → cancelExport |
| `pages/access/__tests__/AssignGroupPage.test.jsx` | T4.1 | rewrite | flujo sin validateGroupAssignment |
| `pages/access/__tests__/GroupCompositionPage.test.jsx` | T4.1 | rewrite | sin getGroupCascadeImpact |
| `pages/access/__tests__/GroupManagementPage.test.jsx` | T4.1 | fix | añadido fetchGroupers al mock |
| `pages/alerts/__tests__/alertsPages.test.jsx` | T4.2 | fix | eliminado fetchTemplates/auditGateway mock; añadido dryRunAlertRule |
| `pages/audit/__tests__/auditPages.test.jsx` | T4.3 | fix | modelo async; exportAuditLogs + selectExportJobId |
| `pages/users/UserManagement/__tests__/GroupAssign.test.jsx` | T4.4 | fix | user state añadido al selector mock |
| `pages/users/UserManagement/__tests__/UserManagement.test.js` | T4.4 | fix | user state + mock slice; datos john_doe |
| `pages/reports/__tests__/TransfersReportPage.test.jsx` | T4.5 | fix | getTransfersByCentro → getIVRTransfersReport |
| `pages/reports/__tests__/IVRMenusReportPage.test.jsx` | T4.5 | fix | getIvrMenus → getIVRMenusReport |
| `pages/reports/__tests__/UniqueClientsReportPage.test.jsx` | T4.5 | fix | getUniqueClients → getUniqueClientsReport |
| `pages/reports/__tests__/ReportExportPage.test.jsx` | T4.5 | fix | cancelExportJob → cancelExport |
| `components/pages/__tests__/remainingPages.test.jsx` | T4.4 | fix | user state añadido al store de prueba |

---

## Clasificación de hallazgos por severidad

| Severidad | Hallazgos | Descripción |
|---|---|---|
| Runtime crash | 7 | `TypeError: X is not a function` — la página falla al interactuar |
| Funcionalidad rota | 2 | No carga datos reales (datos mock) / no actualiza estado global |
| Incorrecto silencioso | 1 | blob vs job_id — no falla visiblemente pero el resultado es incorrecto |

**Total de páginas con errores en runtime bloqueantes:** 11 de 15 páginas corregidas.

---

## Aclaración de scope: llamadas directas a gateway que son válidas

Las siguientes páginas realizan llamadas directas al gateway (no a través de Redux) a métodos que **existen** con URLs canónicas correctas. Este patrón es una decisión de diseño válida — estado local con `useEffect` — y **no constituye deuda técnica**:

- `AgentsReport.jsx` → `reportsService.getAgentsReport()`
- `CampaignsReport.jsx` → `reportsService.getCampaignsReport()`
- `HistoricalReports.jsx` → `reportsService.getReportHistory()`
- `IVRMenusReport.jsx` → `reportsService.getIVRMenusReport()`
- `QueuesReport.jsx` → `reportsService.getQueuesReport()`
- `TransfersReport.jsx` → `reportsService.getIVRTransfersReport()`
- `UniqueClientsReport.jsx` → `reportsService.getUniqueClientsReport()`
- `ReportExport.jsx` → `reportsService.exportReport()`, `reportsService.getExportJobStatus()`, `reportsService.cancelExport()`

Estas páginas usan `apiService` (con interceptor de autenticación correcto), URLs canónicas del schema OpenAPI, y no tienen estado compartido que requiera Redux. La refactorización a Redux global es una mejora opcional fuera del scope de FASE 4.

---

## Verificación final

```
# IACT-ui
npm test -- --no-coverage
  Test Suites: 246 passed, 246 total
  Tests:       2217 passed, 2217 total  (+1 respecto a FASE 3)
  Tiempo:      ~75s

# IACT-api (sin cambios en FASE 4)
pytest tests/unit/
  1060 passed, 0 failed
```

### Commits de FASE 4

| Commit | Tarea | Descripción |
|---|---|---|
| `0155a6e` | T4.1 | pages/access — 3 páginas |
| `fe34795` | T4.2 | pages/alerts — 2 páginas |
| `34697b1` | T4.3 | pages/audit — Export.jsx |
| `2209cb2` | T4.4 | pages/users — UserManagement.jsx |
| `effe3a1` | T4.5 | pages/reports — 8 páginas |

---

## Deuda técnica pendiente (FASE 5)

FASE 4 elimina todos los errores en runtime de la capa de páginas.

- **FASE 5:** Eliminar `jobGateway.js` (188 líneas, endpoints inexistentes) y `transactionGateway.js` (246 líneas, fuera de scope). Actualizar todo código que los importe.
