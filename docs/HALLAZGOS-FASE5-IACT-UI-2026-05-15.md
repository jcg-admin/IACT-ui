# Hallazgos FASE 5 — Eliminación de código muerto y referencias obsoletas

**Artefacto:** HALLAZGOS-FASE5-IACT-UI-2026-05-15
**Versión:** 1.0.0
**Fecha:** 2026-05-15
**Rama:** `develop` — commits `914d8f8` → `8902d54`
**Metodología:** TDD — tests RED antes de cada eliminación, GREEN después
**Estado:** Cerrado — deuda técnica activa en FASE 5 = 0

---

## Resumen ejecutivo

| Métrica | Antes | Después |
|---|---|---|
| Test suites | 246 | **247** (+1) |
| Tests totales | 2217 | **2221** (+4) |
| Tests fallidos | 0 | **0** |
| Gateways con endpoints inexistentes | 4 | **0** |
| Hooks con API inexistente | 1 | **0** |
| Utilidades mal clasificadas como gateways | 1 | **0** |
| Líneas de código muerto eliminadas | ~980 | — |

**Archivos eliminados:** `jobGateway.js` (188 líneas), `transactionGateway.js` (246 líneas), `alertGateway.js` (10 líneas), `exportGateway.js` (324 líneas), `useTransaction.js` (303 líneas)

**Archivos creados:** `src/utils/exportUtils.js`, `src/hooks/domain/useLocalTransaction.js`

---

## H-F5-001 — `jobGateway.js`: 188 líneas de endpoints inexistentes

**Tarea:** T5.1
**Commit:** `914d8f8`
**Líneas eliminadas:** 188

### Descripción

`jobGateway.js` implementaba un cliente para un sistema de jobs asíncronos usando cuatro endpoints que no existen en IACT-api:

| Método del gateway | Endpoint declarado | Estado en IACT-api |
|---|---|---|
| `start(jobType, filters)` | `POST /api/job/start/` | **No existe** |
| `status(jobId)` | `GET /api/job/{id}/status/` | **No existe** |
| `download(jobId)` | `GET /api/job/{id}/download/` | **No existe** |
| `cancel(jobId)` | `POST /api/job/{id}/cancel/` | **No existe** |

El gateway afectaba a cinco archivos de producción: `JobOrchestrator.js`, `useJobStatus.js`, `useJobs.js`, `JobMonitoring.jsx` (vía facade) y `ExportCSVStepper.jsx` (vía hook). Cualquier operación real sobre estos componentes lanzaría `404 Not Found` desde IACT-api.

### Corrección

La funcionalidad equivalente existe en `reportsGateway.js` (implementada en T2.5):

| `jobGateway` eliminado | Equivalente en `reportsGateway` | Endpoint |
|---|---|---|
| `start(type, filters)` | `exportReport(type, format, filters)` | `POST /api/reports/export/` |
| `status(jobId)` | `getExportJobDetail(jobId)` | `GET /api/reports/export/{id}/` |
| `download(jobId)` | `getExportJobDetail(jobId).file_url` | campo en el detail |
| `cancel(jobId)` | `cancelExport(jobId)` | `DELETE /api/reports/export/{id}/` |

Archivos refactorizados:
- `JobOrchestrator.js`: `jobService` → `reportsService`
- `useJobStatus.js`: `jobService.status` → `reportsService.getExportJobDetail`
- `useJobs.js`: todas las operaciones → equivalentes en `reportsService`

Diferencias de contrato absorbidas:
- La API retorna `job_id` (no `jobId`): normalizado con `job.job_id ?? job.jobId`
- Los estados de finalización son `DONE`/`FAILED` (mayúsculas): añadidos al `while` de polling junto con `completed`/`failed` (legacy en tests)
- No hay endpoint de descarga separado: el `file_url` está en el detail del job

---

## H-F5-002 — `transactionGateway.js` + `useTransaction.js`: sistema sin backend

**Tarea:** T5.2
**Commit:** `497cb48`
**Líneas eliminadas:** 246 (gateway) + 303 (hook) = 549 líneas

### Descripción

`transactionGateway.js` implementaba un sistema de transacciones multi-paso completo con seis endpoints:

| Endpoint declarado | Estado en IACT-api |
|---|---|
| `POST /api/transaction/start/` | **No existe** |
| `POST /api/transaction/{id}/step/` | **No existe** |
| `POST /api/transaction/{id}/confirm/` | **No existe** |
| `POST /api/transaction/{id}/cancel/` | **No existe** |
| `POST /api/transaction/{id}/conflict/{id}/resolve/` | **No existe** |
| `GET /api/transaction/{id}/status/` | **No existe** |

El hook `useTransaction.js` (303 líneas) dependía enteramente de este gateway. Era el único hook que consumía `transactionGateway`. Tres steppers de producción lo usaban:

- `AssignFunctionStepper.jsx` — asignación de funciones a usuario
- `CreateUserStepper.jsx` — creación de nuevo usuario
- `ExportCSVStepper.jsx` — exportación CSV con job tracking

En producción, `startTx()` lanzaría `404 Not Found` al montar cualquiera de estos tres componentes, dejándolos en estado de error permanente desde el primer render.

### Corrección

No existe endpoint equivalente en IACT-api: el sistema de transacciones multi-paso no está en el scope del proyecto.

Los steppers son fundamentalmente componentes de UI multi-paso. La lógica de negocio real (asignar función, crear usuario, exportar) se despacha desde `access.slice`, `user.slice` y `reports.slice` respectivamente. El gateway de transacciones nunca fue necesario para esa lógica.

**Creado:** `src/hooks/domain/useLocalTransaction.js` — hook con la misma API pública que `useTransaction` pero con gestión de estado puramente local (sin llamadas a la API):

```javascript
// API idéntica a useTransaction — los steppers no necesitan cambios de estructura
const { transaction, step, isLoading, error,
        startTx, nextStep, prevStep, confirmTx, cancelTx, resolveConflict }
  = useLocalTransaction('assign_function')
```

Los tres steppers fueron migrados de `useTransaction` a `useLocalTransaction` con un cambio de una línea en cada uno. La UX es idéntica.

---

## H-F5-003 — `alertGateway.js`: duplicado de `alertsGateway.js`

**Tarea:** T5.3
**Commit:** `67e0bca`
**Líneas eliminadas:** 10

### Descripción

`alertGateway.js` (distinto del correcto `alertsGateway.js`) contenía un único método:

```javascript
// alertGateway.js — 10 líneas total
const alertService = {
  async getNew(since) {
    const url = since ? `/api/alerts/?since=${since}` : '/api/alerts/'
    return apiService.get(url)
  },
}
```

Tres problemas:
1. **Duplicado:** `alertsGateway.getAlerts()` y `getActiveAlerts()` cubren la misma funcionalidad con la URL correcta (`/api/alerts/active/`)
2. **URL incorrecta:** `/api/alerts/` sin `/active/` no es un endpoint documentado en el schema OpenAPI de IACT-api
3. **Sin decoradores:** sin manejo de errores, sin logging, sin reintentos — al contrario de todos los demás gateways del proyecto

Sin uso en código de producción al momento de la eliminación (solo referenciado en su propio test).

### Corrección

Eliminado sin sustituto. `alertsGateway.getAlerts(params)` y `alertsGateway.getActiveAlerts()` son los métodos canónicos para consultar alertas.

---

## H-F5-004 — `exportGateway.js`: utilidad de UI mal clasificada como gateway

**Tarea:** T5.4
**Commit:** `6c9380b`

### Descripción

`exportGateway.js` (324 líneas) no era un gateway de API en ningún sentido: no hacía llamadas HTTP, no usaba `apiClient`, no tenía URLs. Usaba `ExcelJS` y `jsPDF` para generar archivos en el navegador (browser-side rendering).

```javascript
// exportGateway.js — sin ninguna llamada HTTP
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
```

Consecuencias del nombre incorrecto:
- Consumidores (`ReportExporter.js`, `useExport.js`) importaban desde `@api/exportGateway`, sugiriendo una llamada de red que nunca ocurría
- El desarrollador que lea el código asume que hay un endpoint `/api/export/` — no lo hay
- Viola la convención de nomenclatura del proyecto: `*Gateway.js` = cliente de API HTTP

### Corrección

Movido a `src/utils/exportUtils.js` bajo el alias `@utils/exportUtils`.

| Antes | Después |
|---|---|
| `import exportService from '@api/exportGateway'` | `import { exportToExcel, ... } from '@utils/exportUtils'` |
| Clasificado como servicio de API | Clasificado como utilidad de UI |

El alias `@utils` fue añadido a `jest.config.cjs` para que los tests puedan resolverlo:
```javascript
'^@utils/(.*)$': '<rootDir>/src/utils/$1'
```

---

## Inventario de archivos modificados

### Eliminados

| Archivo | Líneas | Razón |
|---|---|---|
| `src/services/jobGateway.js` | 188 | Endpoints inexistentes en IACT-api |
| `src/services/transactionGateway.js` | 246 | Sistema sin backend en IACT-api |
| `src/services/alertGateway.js` | 10 | Duplicado de alertsGateway con URL incorrecta |
| `src/services/exportGateway.js` | 324 | Utilidad de UI mal ubicada en servicios |
| `src/hooks/domain/useTransaction.js` | 303 | Hook que solo usaba transactionGateway |

**Total: 1.071 líneas de código muerto eliminadas**

### Creados

| Archivo | Propósito |
|---|---|
| `src/utils/exportUtils.js` | Contenido de exportGateway.js en ubicación correcta |
| `src/hooks/domain/useLocalTransaction.js` | Sustituto de useTransaction con estado local puro |

### Refactorizados (consumidores de código eliminado)

| Archivo | Cambio |
|---|---|
| `src/facades/JobOrchestrator.js` | `jobService` → `reportsService` |
| `src/hooks/domain/useJobStatus.js` | `jobService.status` → `reportsService.getExportJobDetail` |
| `src/hooks/domain/useJobs.js` | todas las operaciones → equivalentes en reportsService |
| `src/facades/ReportExporter.js` | `@api/exportGateway` → `@utils/exportUtils` |
| `src/hooks/domain/useExport.js` | `@api/exportGateway` → `@utils/exportUtils` |
| `src/components/transaction/AssignFunctionStepper.jsx` | `useTransaction` → `useLocalTransaction` |
| `src/components/transaction/CreateUserStepper.jsx` | `useTransaction` → `useLocalTransaction` |
| `src/components/transaction/ExportCSVStepper.jsx` | `useTransaction` + `useJobStatus` → `useLocalTransaction` |
| `src/hooks/domain/index.js` | export useTransaction → useLocalTransaction |
| `src/hooks/index.js` | export useTransaction → useLocalTransaction |
| `src/services/index.js` | documentación de gateways eliminados |
| `jest.config.cjs` | añadido alias `@utils → src/utils/` |

### Tests actualizados

| Archivo | Cambio |
|---|---|
| `src/services/__tests__/jobService.test.js` | Verifica eliminación + reportsGateway cubre funcionalidad |
| `src/services/__tests__/transactionService.test.js` | Verifica eliminación + useLocalTransaction como sustituto |
| `src/services/__tests__/alertService.test.js` | Verifica eliminación + alertsGateway cubre funcionalidad |
| `src/services/__tests__/exportService.test.js` | Path actualizado a `@utils/exportUtils` |
| `src/facades/__tests__/JobOrchestrator.test.js` | Mock jobGateway → reportsGateway |
| `src/hooks/__tests__/useJobs.test.js` | Mock jobGateway → reportsGateway |
| `src/hooks/__tests__/useExport.test.js` | Mock `@api/exportGateway` → `@utils/exportUtils` |
| `src/components/transaction/__tests__/transactionSteppers.test.jsx` | Mock useTransaction → useLocalTransaction |
| `tests/integration/react-query.integration.test.js` | jobService → reportsService |
| `__tests__/services/t5.1-no-jobGateway.test.js` | Test estructural nuevo (verifica eliminación) |

---

## Estado de `src/services/` post-FASE 5

```
src/services/
├── accessGateway.js      ← activo
├── adminGateway.js       ← activo
├── alertsGateway.js      ← activo (consolida alertGateway eliminado)
├── apiClient.js          ← activo
├── auditGateway.js       ← activo
├── authGateway.js        ← activo
├── createResilient.js    ← activo
├── errorLogger.js        ← activo
├── index.js              ← activo (documentado)
├── logsGateway.js        ← activo
├── navigationGateway.js  ← activo
├── notificationGateway.js← activo
├── reportsGateway.js     ← activo (consolida jobGateway eliminado)
├── savedFiltersGateway.js← activo
├── secureStorage.js      ← activo
├── security.js           ← activo
├── sharesGateway.js      ← activo
├── userGateway.js        ← activo
└── websocketGateway.js   ← activo
```

**Gateways eliminados:** 4 (`jobGateway`, `transactionGateway`, `alertGateway`, `exportGateway`)

---

## Verificación final

```
# IACT-ui
npm test -- --no-coverage
  Test Suites: 247 passed, 247 total   (+1 respecto a FASE 4)
  Tests:       2221 passed, 2221 total  (+4 respecto a FASE 4)
  Fallos:      0

# Deuda técnica activa (imports activos a código eliminado):
  jobGateway:         0 referencias
  transactionGateway: 0 referencias
  alertGateway:       0 referencias
  exportGateway:      0 referencias
  useTransaction:     0 referencias
```

### Commits de FASE 5

| Commit | Tarea | Descripción |
|---|---|---|
| `914d8f8` | T5.1 | remove(jobGateway): 188 líneas, funcionalidad en reportsGateway |
| `497cb48` | T5.2 | remove(transactionGateway + useTransaction): 549 líneas |
| `67e0bca` | T5.3 | remove(alertGateway): 10 líneas, consolidado en alertsGateway |
| `6c9380b` | T5.4 | refactor(exportGateway): → utils/exportUtils.js |
| `86c400c` | T5.5 | docs(services/index): documentar gateways eliminados |
| `8902d54` | T5.5 | fix: barrel files + tests post-eliminación |
