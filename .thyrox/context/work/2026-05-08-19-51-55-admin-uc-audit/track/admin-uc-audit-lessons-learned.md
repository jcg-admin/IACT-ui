```yml
created_at: 2026-05-08 20:27:28
project: IACT-UI
work_package: 2026-05-08-19-51-55-admin-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Borrador
total_lessons: 5
```

# Lessons Learned: admin-uc-audit

## Propósito

Capturar qué aprendió el equipo durante este work package — qué funcionó, qué falló, y qué regla generalizable se puede extraer para no repetir el error o para replicar el éxito.

---

## Lecciones

### L-01: Un GAP "entirely absent" (no-mock, no-UI, no-slice) exige implementar 5 capas en el orden correcto

**Qué pasó**

GAP-ADM-03 (composición de AGR) no tenía ninguna capa: ni mock handler, ni gateway method, ni Redux thunk, ni componente React, ni tests. El orden de implementación era crítico: si el componente se escribe antes del slice selector, el componente falla en el tipo; si el mock se registra después del routing genérico, las requests caen en el handler incorrecto.

**Raíz**

Los gaps "entirely absent" no tienen dependencias parciales que guíen el orden — hay que derivarlo del DAG de dependencias: mock → gateway → slice → UI → tests (mismo orden que la data flow real).

**Fix aplicado**

T-001 (mock) → T-002 (gateway) → T-003 (slice) → T-004 (UI) → T-005 (tests). Cada tarea verificable de forma aislada antes de avanzar.

**Regla**

Cuando un gap está "entirely absent", derivar el orden de implementación del data flow: mock-server primero, gateway segundo, slice tercero, UI cuarto, tests quinto. No invertir.

---

### L-02: Route ordering en mockInterceptor: siempre registrar específico antes de genérico

**Qué pasó**

Las rutas `/api/admin/system-groups/{id}/functions/{codename}/` (DELETE) y `/api/admin/system-groups/{id}/impact/` deben registrarse **antes** del matcher genérico `/api/admin/system-groups/{id}/functions/`. Si se invierten, el handler de lista-y-agregar captura los DELETEs e IMPACTs y responde con method-not-allowed.

**Raíz**

El intercept loop evalúa condiciones en orden: el primer `if` que hace match gana. Los matchers que incluyen más segmentos de URL deben ir primero que los que coinciden con un prefijo de esa misma URL.

**Fix aplicado**

En `intercept()`: DELETE/impact antes del GET/POST de funciones; bulk-reorder y block-archive antes del handler genérico de menu-items.

**Regla**

Cuando [un handler es un prefijo de otro handler en mockInterceptor], registrar el más específico (más segmentos, más condiciones) antes del más genérico. Siempre. (L-02 también documentada en WP remaining-modules-gap-audit — patrón recurrente.)

---

### L-03: `selectAGRComposition` es un factory selector — el test existente necesita actualizarse cuando se añade al componente

**Qué pasó**

`AGRCatalogPage.test.jsx` existía antes de T-004 y no mockeaba `selectAGRComposition`. Al añadir la llamada `useSelector(selectAGRComposition(selectedAgrId))` al componente, todos los tests existentes fallaron con `TypeError: selectAGRComposition is not a function`.

**Raíz**

El test file del componente mockeaba el módulo `redux/slices/admin` pero solo exportaba los selectores que el componente usaba originalmente. Los selectores nuevos añadidos al componente no se autopropagan al mock.

**Fix aplicado**

Añadir `selectAGRComposition: (agrId) => (s) => s.admin.systemGroupCompositions[agrId] ?? { functions: [], impact: null }` al mock de `AGRCatalogPage.test.jsx`, junto con `systemGroupCompositions: {}` en el state stub y los 4 thunks nuevos.

**Regla**

Cuando [se añaden exports a un slice usado en tests existentes], actualizar los mocks del test file del componente en la misma tarea (no en una tarea posterior). Los test files descubren la omisión en el mismo run, no en el siguiente.

---

### L-04: `block_auto_archive` requería estado persistente en el mock — el Map en constructor es el patrón correcto

**Qué pasó**

R-02 advertía que `block_auto_archive` podría necesitar estado persistente entre requests. En la implementación, `this._blockedMenuItems = new Map()` en el constructor resultó suficiente: el handler almacena el bloqueo en el Map y lo respeta en requests subsiguientes dentro de la misma sesión de dev.

**Raíz**

El mock reseta en cada page reload (no en cada request), que es el comportamiento correcto para desarrollo. El Map sobrevive entre requests HTTP de la misma sesión de navegador.

**Fix aplicado**

Constructor: `this._blockedMenuItems = new Map()`. Handler `_handleBlockAutoArchive` lee/escribe el Map. No se necesitó estado de sesión más complejo.

**Regla**

Cuando [el mock necesita estado que persiste entre requests], usar instancia `Map`/`Set` en el constructor del MockInterceptor (como `_acknowledgedAlerts`, `_systemGroupFunctions`). El estado vive la vida de la instancia (page reload = reset), que equivale al comportamiento esperado del backend real en dev.

---

### L-05: Naming "SoD" en código existente — limpiar en el mismo WP que toca el archivo

**Qué pasó**

El usuario señaló que el proyecto no usa "SoD" — se usa exclusivamente "Separación de Funciones"/"SeparationRules". Al editar `SeparationRulesCatalog.jsx` para T-007, se encontraron referencias a "SoD" en el comentario de cabecera, el `page-subtitle`, y el `aria-label` del formulario.

**Raíz**

El renaming sistémico SOD→SeparationRule fue ejecutado en el WP `mock-rbac-full-audit` pero no alcanzó todos los textos en JSX (solo el código de lógica). El JSX con strings literales quedó sin actualizar.

**Fix aplicado**

Limpiar todos los textos "SoD" al editar `SeparationRulesCatalog.jsx` en T-007. No abrir un WP separado para naming residual de un único archivo.

**Regla**

Cuando [se edita un archivo que tiene naming residual de un renaming anterior], limpiarlo en el mismo Edit/Write. No posponer a un WP de deuda técnica si el archivo ya está abierto.

---

## Patrones identificados

| Patrón | Lecciones relacionadas | Acción sistémica |
|--------|----------------------|------------------|
| Route ordering en mockInterceptor | L-02 | Documentar en CLAUDE.md o en `mockInterceptor` header: "específico antes que genérico, siempre" |
| Test file drift al añadir exports al slice | L-03 | En PAT-UC-AUDIT-001: al añadir slice exports, incluir "actualizar mocks de tests existentes" como checklist item |
| Constructor Map/Set para estado de mock | L-04 | Patrón ya establecido — documentar en referencias del WP como PAT-MOCK-STATE-001 |

---

## Qué replicar

- **Bloque I primero, bloque VI último**: El bloque de mayor impacto (AGR Composition, ALTA) primero, el de menor impacto (filtros client-side, BAJA) último. Maximiza valor entregado temprano.
- **9 tests para el componente principal del bloque**: AGRComposition.test.jsx con 9 tests cubre todos los flows relevantes sin ser excesivo. Ratio "tests por handler" = 2-3 es la zona óptima.
- **`.unwrap()` consistente desde el primer bloque**: Establecer el patrón `.unwrap() + catch` en el bloque I (T-004) hace que los bloques II-V simplemente lo sigan, sin necesidad de retrofitting.

---

## Deuda epistémica

Claims del WP que no se re-verificaron en stages posteriores:

| Claim | Origen | Estado | Acción |
|-------|--------|--------|--------|
| "GAP-ADM-03 es ALTA prioridad" clasificado desde Phase 1 DISCOVER | Phase 1 | `confirmado-en-phase-10` — AGRComposition.test.jsx con 9 tests implementado primero | Ninguna |
| "bulk-reorder no requiere nuevo componente, solo botón en tabla existente" | Phase 8 PLAN EXECUTION | `confirmado-en-phase-10` — implementado como `reorderMode` toggle en MenuItemCatalog | Ninguna |
| "filtros client-side no requieren tests adicionales" | Phase 8 PLAN EXECUTION, T-019 spec | `confirmado-en-phase-10` — 8 tests existentes siguen pasando sin tests nuevos | Ninguna |

Sin deuda epistémica no resuelta.

---

## Deuda pendiente

Sin deuda nueva identificada en este WP. Los 8 gaps auditados están cerrados.

---

## Checklist de cierre

- [x] Cada lección tiene raíz identificada (no solo síntoma)
- [x] Cada lección tiene regla generalizable
- [x] Patrones sistémicos documentados si aplica
- [x] Deuda técnica registrada con prioridad (ninguna nueva)
- [x] Documento commiteado en `work/.../track/lessons-learned.md`
