```yml
created_at: 2026-05-08 21:30:00
project: THYROX
work_package: 2026-05-08-21-01-30-menuitem-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — menuitem-uc-audit

## L-01: Endpoints dedicados vs PATCH genérico — el spec es la autoridad

**Hallazgo:** `transitionMenuItemStatus` usaba `PATCH /{id}/ { status }` — un endpoint
genérico que no distingue entre transiciones. El spec define 4 endpoints POST separados
con semántica propia (campos timestamp, limpieza de block_*).

**Lección:** Cuando el spec define endpoints dedicados por operación, el frontend DEBE
usarlos aunque un PATCH genérico funcione funcionalmente. La razón: cada endpoint
encapsula su propia precondición en el backend (e.g., `/publish/` valida Function activa).
Un PATCH genérico bypasea esas precondiciones.

**Patrón:** En la columna "endpoint" del spec, si hay 4 URLs distintas → hay 4 métodos
distintos en el gateway. No colapsar en un método con parámetro `action`.

## L-02: Routing de transición — DRAFT es el único caso especial para publish

**Hallazgo:** La lógica inicial de `handleTransition` era:
```
ACTIVE ? (ARCHIVED ? reactivate : publish)
```
Incorrecto: DEPRECATED→ACTIVE también iba a `publish`. La condición correcta es:
```
ACTIVE ? (DRAFT ? publish : reactivate)
```
Solo DRAFT→ACTIVE usa publish. Todos los otros caminos hacia ACTIVE usan reactivate.

**Lección:** Al mapear transiciones de estado, verificar TODOS los estados de origen
para un mismo estado destino. La tabla del spec (§3.1) es la fuente de verdad.

**Detección:** El test `DEPRECATED → ACTIVE dispatches reactivateMenuItem` atrapó el bug
en el mismo PR. TDD efectivo.

## L-03: `block_auto_archive` es un atributo del item, no estado externo

**Hallazgo:** El botón "Bloquear/Desbloquear archivado" dependía del estado
`block_auto_archive` del item. La visibilidad del botón correcto requiere leer este
campo del item en el store — no es estado local del componente.

**Lección:** Los atributos de lifecycle (status, block_auto_archive, deprecated_at) deben
vivir en el store Redux y actualizarse en el reducer `.fulfilled`. El componente los lee
del selector — no los infiere localmente.

## L-04: PUT vs PATCH — el método HTTP importa para el contrato backend

**Hallazgo:** `updateMenuItem` usaba PUT (reemplazo completo) cuando el spec indica PATCH
(actualización parcial). Aunque el mock aceptaba ambos, un backend real rechaza un PUT
sin todos los campos obligatorios.

**Lección:** El método HTTP es parte del contrato de la API, no un detalle de
implementación. Usar el método del spec, no el conveniente.

## L-05: Filtros en gateway sin UI — separación de capas correcta

**Hallazgo:** GAP-04 requería `?status=&module=` en el GET. La decisión de alcance fue:
implementar el soporte en gateway + thunk + mock, pero NO agregar UI de filtros (YAGNI).

**Lección:** El gateway siempre debe soportar los params del backend aunque la UI no los
use todavía. Esto permite que otros consumidores (tests de integración, futures features)
los usen sin cambiar el gateway. La UI y el gateway evolucionan a ritmos distintos.
