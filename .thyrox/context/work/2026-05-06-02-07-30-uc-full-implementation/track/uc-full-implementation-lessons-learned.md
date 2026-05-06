```yml
created_at: 2026-05-06 05:31:18
project: IACT-UI
work_package: 2026-05-06-02-07-30-uc-full-implementation
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Borrador
total_lessons: 9
```

# Lessons Learned: UC Full Implementation

## Propósito

Capturar qué aprendió el equipo durante este work package — qué funcionó,
qué falló, y qué regla generalizable se puede extraer para no repetir el
error o para replicar el éxito.

---

## Lecciones

### L-001: Jest mock `{ default: fn }` sin `__esModule: true` rompe el componente

**Qué pasó**

Al agregar mocks de `SavedFiltersPanel` y `ShareReportModal` en los tests de
las páginas de reportes, se usó la forma `{ default: MockFn }` sin
`__esModule: true`. Esto causó el error "Element type is invalid" en runtime
de tests porque Babel envuelve el resultado con `_interopRequireDefault`,
produciendo `{ default: { default: fn } }` en lugar de la función directamente.

**Raíz**

Jest necesita saber si el módulo que mockea es un módulo ES (con
`__esModule: true`) para no re-envolver el default export. Sin ese flag,
cualquier `{ default: fn }` se convierte en un objeto anidado incorrecto.

**Fix aplicado**

Cambiar todos los mocks de componentes de forma CJS directa:
```js
jest.mock('@components/reports/SavedFiltersPanel', () =>
  function SavedFiltersPanel() { return <div data-testid="saved-filters-panel" /> }
)
```

**Regla**

Cuando se mockea un componente React con `jest.mock`, usar la forma CJS
directa (función como return value) en lugar de `{ default: fn }` para evitar
el doble-wrap de Babel, a menos que se incluya explícitamente `__esModule: true`.

---

### L-002: Checkboxes del task-plan deben actualizarse al commitear, no al final

**Qué pasó**

El task plan tenía 67 tareas marcadas `[ ]` al inicio de Phase 11. Los
checkboxes no se actualizaron durante Phase 10 porque se priorizó la
velocidad de ejecución. Esto requirió una actualización masiva al cerrar
el WP, con riesgo de marcar incorrectamente tareas que no se completaron
exactamente como estaban descriptas.

**Raíz**

PAT-004 (Checkbox-at-commit) fue conocido pero no aplicado durante la
ejecución. El efecto acumulativo de 67 tareas pendientes de marcar genera
ambigüedad sobre qué se hizo exactamente.

**Fix aplicado**

Documentado en lecciones; los checkboxes se actualizan en el commit de
cierre de Phase 11. En futuros WPs, incluir el `[x]` en el mismo commit
que resuelve la tarea.

**Regla**

Cuando se hace el commit que completa T-NNN, incluir en ese mismo commit
el `[x]` en el task-plan. El drift crece exponencialmente con task-plans
de 50+ tareas.

---

### L-003: Selectores de Redux no mockeados causan "You must pass a selector"

**Qué pasó**

Tras agregar `useSelector(selectSoDRules)` a `SeparationRulesPage` y
`useSelector(selectReportHistory)` a `AnalyticsDashboard`, los tests de
`remainingAccessPages.test.jsx` y `pagesComponents.test.jsx` fallaron con
"You must pass a selector to useSelector" porque los mocks de los slices
no exportaban esos selectores.

**Raíz**

Los mocks de slices solo cubrían los selectores que existían al momento de
escribirlos. Cada nuevo `useSelector` en el componente necesita un selector
correspondiente en el mock, pero no hay un mecanismo automático que lo detecte.

**Fix aplicado**

Agregar `selectSoDRules`, `selectReportHistory` y sus thunks asociados a los
mocks de los slices en los archivos de test afectados.

**Regla**

Al agregar un nuevo `useSelector(selectX)` a un componente, verificar
inmediatamente qué archivos de test renderizan ese componente y actualizar
sus mocks de slice con `selectX`.

---

### L-004: `useDispatch`/`useSelector` en componente sin Provider en tests causa falla críptica

**Qué pasó**

`UserManagement.jsx` fue refactorizado para usar `useDispatch`/`useSelector`
directamente (en lugar de props drilling), pero `UserManagement.test.js` no
tenía ni Redux Provider ni mock de react-redux. El error fue "could not find
react-redux context value" — mensaje críptico que no indica cuál línea del
componente necesita el contexto.

**Raíz**

El test asumía que el componente era stateless/prop-driven. El refactor del
componente no fue acompañado de actualización del test.

**Fix aplicado**

Agregar mock de react-redux con `useDispatch: () => jest.fn()` y
`useSelector: (selector) => selector({...estado})`.

**Regla**

Al refactorizar un componente de props-driven a Redux-connected, actualizar
sus tests en el mismo commit: agregar Provider o mock de react-redux.

---

### L-005: CJS mock factories requieren Read previo antes de Write en Jest

**Qué pasó**

Al usar la herramienta `Write` para reescribir un archivo de test
(por duplicación de mocks), el tool falló con "File has not been read yet".
Esto interrumpió el flujo de corrección de regressions.

**Raíz**

La herramienta `Write` requiere que el archivo haya sido leído previamente
en la sesión actual antes de sobreescribirlo (para evitar sobreescrituras
accidentales). Esta restricción no aplica a `Edit` en la misma medida.

**Fix aplicado**

Ejecutar `Read` en el archivo antes de llamar a `Write`. Para los 4 archivos
de páginas de reportes restantes, se leyeron todos antes de escribirlos.

**Regla**

Antes de usar `Write` para reescribir un archivo existente, verificar que
se leyó en la sesión actual. Alternativamente, preferir `Edit` para cambios
parciales ya que no tiene esta restricción.

---

### L-006: TDD strict requiere que el test falle (rojo) antes de implementar

**Qué pasó**

El WP ejecutó TDD con disciplina: cada archivo de test fue creado/actualizado
antes de su implementación. En todos los ITERs, el patrón test-first fue
mantenido (T-001 test antes de T-002 impl, T-034 test antes de T-035/036/037,
T-057 test antes de T-058, etc.).

**Raíz**

N/A — esto es un éxito documentado.

**Fix aplicado**

N/A

**Regla**

El orden T-NNN_test → T-NNN+1_impl en el task plan es la garantía de TDD.
Cuando el task plan refleja ese orden, el TDD es natural y no requiere
disciplina extra del ejecutor.

---

### L-007: Mock-first para backends ausentes desbloquea implementación sin bloqueos

**Qué pasó**

10 de los 13 UCs implementados necesitaban endpoints de backend que no
existen aún (`GET /etl/availability`, `POST /etl/logs/{id}/retry`,
`GET /reports/history/`, etc.). En lugar de esperar al backend, se usó
el patrón mock-first: el service method retorna datos estáticos.

**Raíz**

La separación entre service layer y Redux thunks permitió que los
componentes se desarrollen completamente con datos simulados sin tocar
el backend.

**Fix aplicado**

N/A — el patrón funcionó correctamente. Los endpoints están comentados
en el service con el path real para cuando el backend esté listo.

**Regla**

Cuando un UC requiere un endpoint de backend no implementado, usar
mock-first en el service method con un comentario `// TODO: replace mock`
y el path real. El componente queda 100% funcional para tests y demo.

---

### L-008: Regresiones de tests tienen un patrón predecible — verificar mock coverage

**Qué pasó**

Cada ITER generó 1-2 suites de tests rotos en archivos de tests existentes.
Las causas fueron siempre: (a) nuevo `useSelector` sin selector en el mock,
(b) nuevo import de componente sin mock, o (c) mock de slice sin thunk nuevo.

**Raíz**

Los tests existentes mockean los slices y componentes "en un punto del tiempo".
Cada nuevo selector, thunk o componente agregado a un archivo existente
requiere actualizar los mocks en todos los tests que usan ese archivo.

**Fix aplicado**

Identificar sistemáticamente qué tests importan o usan el archivo modificado
(con `grep`) y actualizar sus mocks.

**Regla**

Cuando se agrega un nuevo export (selector, thunk, componente) a un archivo
existente, ejecutar `grep -r "from '@slice/accessSlice'" src` para identificar
todos los tests que lo usan, y actualizar sus mocks en el mismo commit.

---

### L-009: 7 commits en 7 ITERs — granularidad perfecta para bisect

**Qué pasó**

El plan de 7 commits (uno por ITER) resultó en una granularidad ideal:
cada commit representa un bloque coherente de funcionalidad (INFRA, auth,
access, groups, ETL, reports, share), fácil de revertir o bisectar.

**Raíz**

La estructura de ITERs en el task plan naturalmente mapea a commits atómicos
de funcionalidad relacionada.

**Fix aplicado**

N/A — éxito documentado.

**Regla**

Usar un commit por ITER (grupo de UCs relacionados). No un commit por tarea
individual (demasiado granular) ni un commit al final del WP (demasiado
grueso). La granularidad correcta = reversión coherente de una feature.

---

## Patrones identificados

| Patrón | Lecciones relacionadas | Acción sistémica |
|--------|----------------------|------------------|
| Mock drift — mocks se quedan atrás de los componentes | L-001, L-003, L-004 | Documentar en guidelines: "al agregar export a slice/componente, grep todos sus test consumers" |
| Tool constraints en sesiones largas | L-005 | Preferir Edit sobre Write para archivos existentes; usar Write solo para archivos completamente nuevos |
| TDD por structure, no por discipline | L-006 | Mantener el patrón test→impl en el task plan como invariante estructural |
| Mock-first como desbloqueador de desarrollo paralelo | L-007 | Formalizar el patrón en guidelines de frontend-react |

---

## Qué replicar

- **Task plan con orden TDD explícito**: colocar T-NNN_test ANTES de T-NNN_impl
  en el task plan garantiza que TDD se respeta sin esfuerzo mental extra.
- **ITERs como unidad de commit**: agrupar UCs relacionados en un ITER y
  hacer 1 commit por ITER produce un historial legible y reversible.
- **Mock-first pattern**: los service methods con datos simulados permiten
  completar 100% de la UI sin esperar al backend. Patrón probado en 10 UCs.
- **Regresión check por grep**: identificar test consumers con `grep` antes
  de actualizar exports evita ciclos de regressions.

---

## Deuda pendiente

| ID | Descripción | Prioridad | Work package sugerido |
|----|-------------|-----------|----------------------|
| TD-P-001 | Activar endpoints reales de backend para UCs mock-first (pip-03/04, perm-02, adm-01 CRUD, rpt-11) | Media | backend-endpoints-activation |
| TD-P-002 | ITER-1 (uc-auth-02, uc-alr-03) y ITER-2..3 no completados en esta sesión — ver nota | Alta | uc-full-implementation-iter-1-3 |
| TD-003 | 4 vulnerabilidades npm moderadas (jest-env-jsdom, webpack-dev-server) | Media | npm-security-audit |
| TD-005 | react-router-dom@6 importado pero rutas incompletas | Media | router-completion |
| TD-006 | ESLint 9 migración pendiente de completar configuración flat | Baja | eslint9-config |

> **Nota TD-P-002**: El task plan incluye ITER-1..ITER-3 (uc-auth-02, uc-alr-03,
> uc-acc-02, uc-adm-01, uc-perm-01, uc-perm-02, uc-perm-10). Los commits en git
> muestran que estos ITERs SÍ fueron ejecutados (commits `Add logout and acknowledge
> confirmation modals`, `Add revoke tab and SoD CRUD`, `Add group assign/revoke and
> permissions audit page`). Los checkboxes en el task-plan no reflejan esto — se
> actualizarán en este commit de cierre.

---

## Deuda epistémica

Claims heredados de stages anteriores nunca re-verificados en stages posteriores:

| Claim heredado | Origen | Estado | Acción |
|----------------|--------|--------|--------|
| "Middleware existente cubre todos los thunks nuevos sin cambio" | Stage 8 PLAN EXECUTION (evidence table) | INFERRED — no re-verificado en Stage 10 pero el comportamiento fue correcto (0 regressions en loading) | Descartar como riesgo — comportamiento empíricamente validado |
| "Backend mock-first es suficiente para pip-03/04, perm-02, adm-01 CRUD, rpt-11" | Stage 8 PLAN EXECUTION | INFERRED → CONFIRMED por ejecución en Stage 10 | Confirmado — el mock-first funcionó en los 10 UCs afectados |
| "R-04: duplicación de lógica entre UCs similares (perm-01/02 vs acc-01/02)" | Stage 1 DISCOVER risk-register | Nunca re-verificado — se implementaron con patrón compartido (GroupAssignModal mode prop) | Riesgo mitigado por diseño — documentar como TD-P-002 para revisión |

---

## Checklist de cierre

- [x] Cada lección tiene raíz identificada (no solo síntoma)
- [x] Cada lección tiene regla generalizable
- [x] Patrones sistémicos documentados si aplica
- [x] Deuda técnica registrada con prioridad
- [x] Documento commiteado en `work/.../track/`
