```yml
created_at: 2026-05-08 21:48:44
project: THYROX
work_package: 2026-05-08-21-34-20-admin-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — admin-uc-audit

## L-01: 202 Accepted es una respuesta válida — el frontend debe manejarla

**Hallazgo:** `deactivateFunction` retornaba 200 siempre. El spec (FA-04) define 202
cuando la función tiene asignaciones activas. La UI no usaba `.unwrap()`, así que
incluso si el mock retornara 202, el `warnings[]` nunca llegaría al componente.

**Lección:** HTTP 202 Accepted con payload informativo requiere: (1) mock que
lo simule, (2) `.unwrap()` en el dispatch para leer el payload, (3) UI que
inspeccione `result.warnings?.length` y muestre el aviso. El flujo falla en
silencio si cualquiera de los 3 eslabones falta.

**Patrón:** Para endpoints que pueden retornar 200 O 202 con semántica distinta,
la UI debe leer el payload en ambos casos, no solo checar si hubo error.

## L-02: Firma de método mock — `url` como primer parámetro cuando se necesita id

**Hallazgo:** `_handleAdminFunctions(method, body)` no recibía `url` como parámetro.
Al agregar la lógica de deactivate con assignments (que necesita el id del endpoint),
fue necesario cambiar la firma a `_handleAdminFunctions(url, method, body)` y actualizar
el call site en el routing.

**Lección:** Si un handler de mock necesita extraer el id del recurso (de la URL), debe
recibir `url` como primer parámetro. El patrón consistente es `(url, method, body)`.
Handlers que ya lo usaban (`_handleAGRFunctions`, `_handleMenuItemPublish`) son el
modelo correcto. Handlers que no lo usaban (`_handleAdminFunctions`) son el anti-patrón.

**Verificación:** Al refactorizar, verificar que el call site pase `url` correctamente
y que la recursión interna (e.g., `this._handleAdminFunctions(url, 'GET', null)`)
también lo pase.

## L-03: is_system como campo del fixture, no lógica ad-hoc

**Hallazgo:** El mock de AGRs no tenía campo `is_system`. El handler `_handleAGRFunctions`
no podía implementar la guarda FA-04 sin este campo. El fix correcto fue:
(1) agregar `is_system: true/false` al fixture AGRS, (2) que el handler
consulte el fixture vía `_handleAdminAGR('GET', null).data.results`.

**Lección:** Los campos de comportamiento del backend (is_system, is_active, block_auto_archive)
deben existir en los fixtures del mock. Si el spec define que un campo controla una
guarda de acceso, el mock debe tenerlo — no simularlo con lógica hardcoded basada en IDs.

**Anti-patrón:** `if (id > 10) return 403` — frágil, no refleja el campo del backend.
**Patrón:** `if (agr && agr.is_system === false) return 403` — lee el campo real.

## L-04: SoD conflict en AGR — cruce contra separationRulesData

**Hallazgo:** El handler `_handleAGRFunctions` POST no cruzaba contra las reglas
de separación existentes. El cruce se implementó consultando `this._separationRulesData()`
y verificando si el codename nuevo aparece en group_a de una regla activa junto a
funciones ya presentes en el AGR.

**Lección:** Los mocks deben mantener consistencia referencial entre recursos
relacionados. Las reglas SoD y las composiciones de AGR son interdependientes en
el backend — el mock debe reflejar esa interdependencia para que los tests sean
representativos.

## L-05: GAP-01 — PUT vs PATCH: el mock acepta ambos, oculta el bug

**Hallazgo:** El mock `_handleAdminSeparationRules` tenía un handler `PUT` explícito
que procesaba la actualización correctamente. Esto ocultó el bug de `updateSeparationRule`
usando `apiService.put`. En el backend real, PUT requeriría todos los campos del
recurso; PATCH acepta subconjuntos. El fix fue 1 línea pero tardó en identificarse
porque el mock no fallaba.

**Lección:** Un mock que acepta el método incorrecto es un mock que oculta bugs de
contrato. La regla: si el spec dice PATCH, el mock solo debe aceptar PATCH en ese
endpoint (retornar 405 para PUT). El patrón correcto es validar el método
explícitamente como primer check, no al final como fallthrough.
