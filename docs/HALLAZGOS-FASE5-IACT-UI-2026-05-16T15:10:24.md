# HALLAZGOS-FASE5-IACT-UI-2026-05-16T15:10:24

**Documento:** HALLAZGOS-FASE5-IACT-UI-2026-05-16T15:10:24  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commits:** 4707e3d → fc4dd0c → ae2cd3b → f5eb598 → 62b4e2c (5 commits)  
**Plan base:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38.md — FASE 5

---

## Estado antes de FASE 5

```
npx jest --no-coverage → 2377 passed, 0 failed
ESLint warnings react/prop-types: ~200 — ningún componente de los 50 tenía PropTypes
```

---

## Resumen de tareas ejecutadas

| Subtarea | Archivos | Componentes | Commit |
|---|---|---|---|
| T5.1 | AppProviders, 5 shared | 6 | 4707e3d |
| T5.2 | 4 animations | 4 | fc4dd0c |
| T5.3 | 3 access, 4 reports, 2 DateTimeInputs | 9 + subcomp. | ae2cd3b |
| T5.4 | 3 Analytics, 4 ExportHub, 4 JobMonitoring, 3 features, 5 presentational | 19 | f5eb598 |
| T5.5 | Layout, 2 misc, examples, context, modules, 4 pages/logs/reports, 2 users | 12 | 62b4e2c |

**Total: 50 archivos, 5 commits, 369 líneas insertadas.**

---

## Hallazgos durante la implementación

### H-F5-001 — Import de PropTypes insertado en medio de un bloque multilínea (bug del script)

**Problema detectado tras T5.3, antes del primer commit.**

El script `add_proptypes()` de T5.1–T5.3 localizaba el punto de inserción
buscando el fin de la última línea que empezara con `^import`. En archivos
con imports multilínea como:

```js
import {
  createShare,
  selectShareCreateStatus,
} from '@store/slices/shares'
```

La última línea con `^import` era la línea de apertura `import {`, cuyo fin
estaba justo antes del `createShare,` en la siguiente línea. El script
insertaba `import PropTypes from 'prop-types'` en ese punto, produciendo:

```js
import {
import PropTypes from 'prop-types'
  createShare,
```

**Archivos afectados:**
- `src/components/reports/ShareReportModal.jsx`
- `src/components/presentational/Chart.jsx`

**Efecto:** `SyntaxError: Unexpected keyword 'import'` — los test suites de
esos archivos fallaban al intentar compilar.

```
Tests:       2353 passed (−24 vs 2377 esperado)
Test Suites: 3 failed
```

**Corrección aplicada:** regex de reparación que detecta el patrón roto y
mueve el `import PropTypes` antes del bloque multilínea:

```python
fixed = re.sub(
    r'(import\s*\{)\s*\n(import PropTypes from \'prop-types\')\n(\s*)',
    r'\2\n\1\n\3',
    content
)
```

**Corrección preventiva para T5.5:** nueva función `add_pt_robust()` que
inserta `import PropTypes` antes del primer `^import` encontrado (no después
del último) cuando el archivo no tiene imports de una sola línea.

---

### H-F5-002 — Archivos sin ningún import de una sola línea

Detectado al ejecutar T5.5. Dos archivos de T5.5 no tenían ningún import
que empezara en columna cero con `^import`:

- `src/components/BackendStatusPanel.jsx` — empieza directamente con `const`
- `src/components/MockDataNotice.jsx` — empieza directamente con `const`

El script original habría lanzado `ValueError: max() iterable argument is empty`
al intentar buscar el máximo de una lista vacía.

**Corrección:** la función `add_pt_robust()` usa `re.search(r'^import\b', ...)` 
para encontrar el primer import (si existe) e inserta PropTypes antes de él.
Si no hay ningún import, añade `import PropTypes from 'prop-types'` al principio
del archivo.

---

### H-F5-003 — Componentes internos con props requieren PropTypes propios

Varios archivos contienen componentes internos (subcomponentes definidos en
el mismo archivo que no se exportan) que también reciben props. El plan
especificaba los nombres de los archivos pero no los subcomponentes internos.
Al leer cada archivo se identificaron:

| Archivo | Componentes con PropTypes añadidos |
|---|---|
| `ErrorDisplay.jsx` | `ErrorDetailsModal` (además de `GlobalErrorToast` que no recibe props) |
| `features/UserManagement/UserList.jsx` | `UserModal` (el componente `UserList` en sí no recibe props externas) |
| `ShareReportModal.jsx` | `ShareForm`, `UrlCopyContent`, `ShareReportModal` |
| `PipelineStatus.jsx` | `EstadoBadge`, `CounterCard` (además de `PipelineStatus` que lee del store) |
| `RealTimeMetrics.jsx` | `MetricCard` interno (además de `RealTimeMetrics` que lee del store) |
| `ScheduledReport.jsx` | `Field`, `CreateForm` (además de `ScheduledReport` que lee del store) |
| `SharedViews.jsx` | `SentTable`, `ReceivedTable` (además de `SharedViews` que lee del store) |

**Criterio aplicado:** se añaden PropTypes a todo componente que recibe props
por parámetro, independientemente de si se exporta o no. Los componentes
que no reciben props (solo leen del store con `useSelector`) no necesitan
PropTypes.

---

### H-F5-004 — `features/UserManagement/UserList.jsx` — el export default `UserList` no recibe props

La función `UserList()` en `src/components/features/UserManagement/UserList.jsx`
no recibe parámetros — gestiona su propio estado interno con `useState`. El
componente con props es `UserModal({ isOpen, user, onClose, onSave })`, que
está definido en el mismo archivo.

El plan del análisis inicial decía `['isOpen', 'user', 'onClose', 'onSave']`
para `UserList.jsx` (features), lo que correspondía a `UserModal`, no a
`UserList`. PropTypes añadidos correctamente a `UserModal`.

Distinto de `src/pages/users/UserManagement/UserList.jsx` (página), que sí
recibe props: `users, loading, onEdit, onDeactivate, onBlock, onUnblock`.

---

## Verificaciones realizadas (T5.6)

| Verificación | Resultado |
|---|---|
| 1. Sin imports de PropTypes en medio de multilínea | 0 archivos rotos |
| 2. Los 50 archivos tienen `.propTypes` | 0 archivos sin propTypes |
| 3. Suite completa | 2377 passed, 0 failed |

---

## Estado después de FASE 5

```
npx jest --no-coverage → 2377 passed, 0 failed (sin variación — FASE 5 no añade tests)
ESLint warnings react/prop-types: 0 en los 50 archivos del plan
Commits: 5 (uno por subtarea)
Líneas insertadas: 369
```

### Deuda técnica resuelta

| DT / Warning | Descripción | Estado |
|---|---|---|
| W-001 react/prop-types | ~200 warnings en 50 componentes | Resuelto |

---

*Generado: 2026-05-16T15:10:24 | Commits: 4707e3d–62b4e2c | Suite: 2377 passed*
