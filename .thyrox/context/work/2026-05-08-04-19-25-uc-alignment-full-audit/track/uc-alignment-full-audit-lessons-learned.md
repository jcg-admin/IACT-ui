```yml
created_at: 2026-05-08 04:58:37
project: THYROX
work_package: 2026-05-08-04-19-25-uc-alignment-full-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
total_lessons: 6
```

# Lessons Learned — uc-alignment-full-audit

## Propósito

WP de auditoría completa de alineación UC→implementación. 66 UCs de Fase 1 inventariados.
4 categorías de gaps encontradas y resueltas (GAP-A routing, GAP-B páginas faltantes,
GAP-C parciales pre-existentes, GAP-D deuda estructural).

---

## Lecciones

### L-001: Páginas sin ruta son invisibles en la auditoría de UCs

**Qué pasó**

AssignFunctions.jsx, Permissions.jsx y AccessAudit.jsx existían completas con lógica de
negocio, state management y UI — pero no tenían rutas en AppRouter. Desde el inventario de
`src/pages/access/` eran visibles; desde la perspectiva del usuario eran inaccesibles.

**Raíz**

El proceso de desarrollo creó las páginas pero no las conectó al router, posiblemente
porque se implementaron como preparación para un sprint posterior que nunca terminó el wiring.

**Fix aplicado**

T-001..T-005: rutas + nav entries + lazy imports agregados en AppRouter. Tests creados en
el mismo bloque (T-006..T-008). Commit I: `Add routing and tests for ACC-01/02/03/09 pages`.

**Regla**

Cuando se audita alineación UC→implementación, verificar SIEMPRE AppRouter (rutas) además
de `src/pages/` (archivos). Un archivo sin ruta no cuenta como UC implementado.

---

### L-002: La distinción UC_ADM_01 vs UC_ACC_05 requería lectura de spec, no inferencia

**Qué pasó**

Ambos UCs involucran reglas de separación de funciones. UC_ACC_05 es la vista operacional
(operadores consultan reglas activas). UC_ADM_01 es el lifecycle admin (quién puede crear,
modificar, activar/desactivar las reglas que existen). Se marcó como "ambigüedad" en DISCOVER
porque el nombre "SeparationRules" aparece en ambos módulos.

**Raíz**

Sin leer el spec de ambos UCs, la diferencia no es deducible solo del nombre del archivo o
la ruta. La confusión era SPECULATIVE hasta leer los docs.

**Fix aplicado**

Se leyeron ambas specs en IACT-docs antes de ejecutar. Se resolvió: UC_ACC_05 tiene guard
`view_separation_rules` (lectura), UC_ADM_01 tiene guards `create_separation_rule` /
`update_separation_rule` / `disable_separation_rule` (lifecycle completo).

**Regla**

Cuando dos UCs comparten dominio pero módulos diferentes, NO inferir distinción por contexto.
Leer el spec de ambos antes de categorizar como duplicado o distinto. Claims SPECULATIVE
no pueden categorizar UCs en el task plan.

---

### L-003: UC_PIP_04, UC_RPT_08, UC_RPT_09, UC_RPT_11 estaban pre-implementados y testeados

**Qué pasó**

El DISCOVER marcó estos 4 UCs como "parciales" basándose en búsqueda de keywords. En Phase 10
la verificación real mostró que todos estaban completos con thunks, handlers de mock y tests.

**Raíz**

La búsqueda de keywords (`grep runNow`, `grep shareView`) no es suficiente para determinar
si un UC está completo — el feature puede usar nombres distintos al codename del UC
(e.g., `retryPipeline` en logs slice, no en pipeline slice).

**Fix aplicado**

Verificación explícita en IMPLEMENT: leer el componente destino + tests + slice antes de
concluir que falta algo. T-009..T-026 cerrados como "pre-existentes" sin trabajo adicional.

**Regla**

Cuando DISCOVER categoriza un UC como "parcial" sin haber leído el archivo fuente completo,
el claim es INFERRED. En IMPLEMENT, verificar el componente real antes de planificar trabajo.
Un UC puede estar completo con nombres distintos a los del spec.

---

### L-004: git mv + Edit en la misma sesión produce cambios no staged

**Qué pasó**

Al mover `UserManagement` con `git mv` y luego editar el archivo renombrado con la herramienta
Edit, el git mv ya estaba staged (rename) pero las ediciones posteriores quedaron como
"unstaged modifications" al archivo nuevo. Esto confundió el `validate-phase-completion.sh`.

**Raíz**

`git mv` genera dos operaciones en el index: delete del original + add del nuevo. Las ediciones
posteriores al nuevo path son modificaciones sobre ese add — aparecen como cambios no staged
porque el `git add` del mv no capturó las ediciones post-mv.

**Fix aplicado**

Commit adicional `Fix import paths in moved UserManagement files` para capturar los cambios.
Después de cualquier `git mv + Edit`, hacer `git status` antes de commitear para detectar
modificaciones residuales.

**Regla**

Cuando se hace `git mv` + ediciones en el mismo flujo: siempre ejecutar `git status` después
de la edición para confirmar que el archivo nuevo está staged con sus cambios. Si aparece
como "modified" (no staged), hacer `git add` explícito antes del commit.

---

### L-005: Task plan con 46 tareas sin checkboxes [x] — PAT-004 no se siguió

**Qué pasó**

El task plan tenía 46 tareas. Todas se implementaron y commitearon, pero ningún checkbox
fue marcado `[x]` durante la ejecución. Se descubrió en Phase 11 al revisar el plan.

**Raíz**

La sesión de Phase 10 fue interrumpida (context limit) y la continuación no tenía visibilidad
del estado de los checkboxes. PAT-004 dice "checkbox-at-commit": el `[x]` debe ir en el
mismo commit que implementa la tarea. Si no va en el commit, se pierde.

**Fix aplicado**

Actualización masiva en Phase 11: `sed -i 's/^- \[ \]/- [x]/g' task-plan.md`.
Esta es la corrección válida pero subóptima — la evidencia de completación ya existe en git,
solo faltaba el registro visual.

**Regla**

PAT-004 es obligatorio: incluir el checkbox `[x]` en el mismo commit que implementa T-NNN.
No acumular checkboxes para una "sesión de cierre". Si el plan tiene >10 tareas sin marcar
al llegar a Phase 11, es señal de que PAT-004 no se siguió durante IMPLEMENT.

---

### L-006: Structural debt (GAP-D) es bajo riesgo si el único importador es AppRouter

**Qué pasó**

El riesgo R-01 (mover UserManagement rompe imports) y R-05 (tests se rompen) se estimaron
como ALTA probabilidad + ALTO impacto. En la práctica:
- Solo AppRouter usaba `@ui/pages/UserManagement`
- Solo 1 test externo (`remainingPages.test.jsx`) referenciaba la ruta directa
- El git mv + 2 ediciones resolvió todo en ~10 minutos

**Raíz**

La estimación de riesgo asumió múltiples importadores, pero el módulo tenía un punto de
entrada único (barrel via AppRouter). Módulos bien encapsulados tienen bajo blast radius.

**Fix aplicado**

T-041: verificación explícita de importadores con grep antes de mover. Resultado: 1 en
AppRouter, 1 en test. Ambos actualizados en el mismo commit o el siguiente.

**Regla**

Antes de estimar riesgo de `mv` estructural, ejecutar `grep -rn "@ui/pages/ModuleName"` para
conocer el blast radius real. Si hay ≤3 importadores, el riesgo es BAJO aunque el módulo
parezca crítico. Encapsulamiento reduce el riesgo de movimiento estructural.

---

## Patrones identificados

| Patrón | Lecciones relacionadas | Acción sistémica |
|--------|------------------------|------------------|
| **Verificación real vs inferencia** | L-002, L-003 | En IMPLEMENT, siempre leer el archivo fuente antes de planificar trabajo; no confiar en grep de keywords |
| **PAT-004 drift** | L-005 | Agregar validación de checkboxes al script `validate-phase-completion.sh` como check adicional |
| **git mv + Edit produce unstaged** | L-004 | Agregar nota en SKILL.md de workflow-implement: "después de git mv, ejecutar git status antes del commit" |
| **Routing gap invisible** | L-001 | En auditorías de UC: verificar AppRouter además de src/pages/ — una página sin ruta no es UC implementado |

---

## Qué replicar

- **Bloque-first con commit por bloque**: agrupar tareas relacionadas en bloques con commit
  al final de cada uno facilita el rollback granular y la trazabilidad. Funcionó bien en
  los 8 bloques de este WP.

- **Resolución de ambigüedades en DISCOVER antes de planificar**: documentar las ambigüedades
  como puntos de parada (SP) y resolverlas con lectura de spec antes de crear el task plan
  evitó planificación errónea para UC_ADM_01 vs UC_ACC_05.

- **TDD en admin pages (Bloque VI/VII)**: crear los tests primero (SeparationRulesCatalogPage,
  MenuItemCatalogPage) definió exactamente qué `aria-label` necesitaba cada botón, lo que
  guió la implementación del JSX directamente.

---

## Deuda epistémica

Claims heredados de stages anteriores que no fueron re-verificados en stages posteriores:

| Claim | Origen | Estado | Acción |
|-------|--------|--------|--------|
| "UC_RPT_09 no tiene página dedicada — será sección en Profile" | Stage 1 DISCOVER | `descartado-en-stage-10` — SavedFiltersPanel existe como componente integrado en múltiples pages | Ninguna — resuelto |
| "UC_PIP_04 retry no existe en PipelineStatus.jsx" | Stage 1 DISCOVER (grep vacío) | `descartado-en-stage-10` — `retryPipeline` existe en ETLLogs/logs slice | Ninguna — resuelto |
| "R-03: `request_pipeline_retry` RBAC puede no existir" | Stage 1 risk register | `descartado-en-stage-10` — `RETRY_PIPELINE: 'pipeline:retry'` confirmado en FunctionCatalog | Ninguna — resuelto |

---

## Deuda pendiente

No se identificó deuda técnica nueva durante este WP. Las deudas pre-existentes en
`technical-debt.md` no fueron afectadas por el scope de este WP.

---

## Checklist de cierre

- [x] Cada lección tiene raíz identificada (no solo síntoma)
- [x] Cada lección tiene regla generalizable
- [x] Patrones sistémicos documentados si aplica
- [x] Deuda técnica registrada con prioridad (ninguna nueva)
- [x] Documento commiteado en `work/.../track/lessons-learned.md`
