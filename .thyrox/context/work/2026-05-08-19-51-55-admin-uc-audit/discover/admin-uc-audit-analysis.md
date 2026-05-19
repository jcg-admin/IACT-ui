```yml
created_at: 2026-05-08 19:51:55
project: IACT-UI
work_package: 2026-05-08-19-51-55-admin-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Discover — admin-uc-audit

## Objetivo

Auditoría profunda del módulo admin (UC_ADM_01..05) comparando la spec
(`source/requisitos/casos-uso/admin/`) contra la implementación actual
en `src/pages/admin/` + `src/redux/slices/admin.js` +
`src/services/adminGateway.js` + `src/mocks/mockInterceptor.js`.

## Fuentes verificadas

**Spec leída (PROVEN):**
- `uc-adm-01`: informacion-general, flujo-principal, criterios-aceptacion, datos-involucrados
- `uc-adm-02`: informacion-general, flujo-principal, criterios-aceptacion, datos-involucrados
- `uc-adm-03`: informacion-general, flujo-principal, criterios-aceptacion, datos-involucrados
- `uc-adm-04`: informacion-general, flujo-principal, criterios-aceptacion, datos-involucrados
- `uc-adm-05`: informacion-general, flujo-principal, criterios-aceptacion, datos-involucrados

**Implementación leída (PROVEN):**
- `src/pages/admin/SeparationRulesCatalog.jsx` (194 líneas)
- `src/pages/admin/FunctionCatalog.jsx` (273 líneas)
- `src/pages/admin/AGRCatalog.jsx` (257 líneas)
- `src/pages/admin/MenuItemCatalog.jsx` (246 líneas)
- `src/redux/slices/admin.js` (379 líneas)
- `src/services/adminGateway.js` (138 líneas)
- `src/mocks/mockInterceptor.js` (handlers admin: líneas 1000–1283, 1549–1580)

---

## UC-ADM-01: Gestionar ciclo de vida de reglas SoD

### Implementado ✓
- GET `_handleAdminSeparationRules` → lista rules
- POST `createSeparationRule` → mock retorna 201
- PUT `updateSeparationRule` → mock retorna 200
- PATCH `toggleSeparationRuleStatus` → alterna `isActive`
- UI: form CREATE/UPDATE con group_a y group_b (CSV → array)
- UI: toggle Activar/Desactivar

### GAP-ADM-01: Sin validación de disjunción group_a ∩ group_b

**Spec CA-02:** "Conjuntos no disjuntos rechazado 400."

**Observación (PROVEN):** `SeparationRulesCatalog.jsx` no verifica que las
funciones en `group_a` y `group_b` sean disjuntas antes de hacer submit.
El mock `_handleAdminSeparationRules` no valida disjunción: hace
`{ id, code, isActive: true, violations: 0, ...body }` sin check.
Además, si el backend retorna error, el componente hace `if (!result.error)`
silenciosamente — sin mostrar el error al usuario.

**Gaps concretos:**
- A. No hay validación client-side de disjunción antes de submit
- B. No hay display de error 400 del backend en el formulario (solo
  éxito tiene feedback; error se silencia)

**Clasificación:** PROVEN — código fuente leído.

---

## UC-ADM-02: Gestionar catálogo de funciones

### Implementado ✓
- GET `fetchFunctions` → lista funciones
- POST `createFunction` → 201
- PATCH `updateFunction` → 200 (codename disabled en form cuando editando)
- PATCH `deactivateFunction` → `{ active: false }`
- UI: search por codename/nombre, codename inmutable en edit

### GAP-ADM-02-FILTER: Sin filtro por module/state

**Spec CA-11:** "Listado filtrando por module y state."

**Observación (PROVEN):** `FunctionCatalog.jsx` tiene search por codename/nombre
(local) pero no hay dropdown de filtro por `domain`/`module` ni por
`is_active` state. El spec exige este filtro en el listado.

**Clasificación:** PROVEN.

### Aceptado / sin gap
- Codename inmutable en edit: ✓ (campo `disabled` cuando `!!editingId`)
- CA-06 (deactivate bloques nuevas asignaciones): backend concern
- CA-08 (audit): backend concern
- No existe CA de "impact list" para deactivate en uc-adm-02 (solo en uc-adm-03)

---

## UC-ADM-03: Gestionar composición de AGR de sistema

### CRÍTICO — UC enteramente no implementado

**Spec flujo-principal:**
- `POST /api/admin/system-groups/{id}/functions/` — agregar función a AGR
- `DELETE /api/admin/system-groups/{id}/functions/{func_id}/` — remover función
- `GET /api/admin/system-groups/{id}/impact/` — preview impacto

**Spec criterios CA-01..CA-10:** CRUD composición + validaciones SoD + recálculo.

**Observación (PROVEN):** `AGRCatalog.jsx` implementa CRUD de metadatos (codename,
name, description, deactivate) pero NO gestiona composición de funciones.
`adminGateway.js` NO tiene métodos para `system-groups/{id}/functions/`.
`mockInterceptor.js` NO tiene handlers para `/api/admin/system-groups/`.

**Gaps concretos:**
- A. Sin UI para ver qué funciones tiene un AGR (composición actual)
- B. Sin UI para agregar función a AGR (POST /system-groups/{id}/functions/)
- C. Sin UI para remover función de AGR (DELETE)
- D. Sin UI para impact preview antes de cambiar composición
- E. Mock sin handlers para estos endpoints
- F. adminGateway sin métodos para composición

**Clasificación:** PROVEN — endpoints completamente ausentes del stack.
**Severidad:** ALTA — UC-ADM-03 es UC completo no implementado.

---

## UC-ADM-04: Gestionar catálogo de MenuItems

### Implementado ✓
- GET/POST/PUT/PATCH: presentes en mock, gateway y slice
- UI: form CREATE/UPDATE + tabla con status badge
- Nuevo item empieza en DRAFT (mock retorna `status: 'DRAFT'` en POST)

### GAP-ADM-04-BULKREORDER: Sin bulk reorder

**Spec CA-08:** "`PATCH .../bulk-reorder/` con lista `{id, display_order}` →
atómico, 1 audit, rollback si ID inválido."

**Observación (PROVEN):** No existe endpoint `bulk-reorder` en adminGateway.js,
ni en mockInterceptor, ni botón/UI en MenuItemCatalog.jsx para reordenar
múltiples items. El campo `display_order` se puede editar uno a uno pero
no hay flujo atómico de reordenamiento bulk.

**Clasificación:** PROVEN.

### GAP-ADM-04-ARCHIVED-EDIT: Edit habilitado para items ARCHIVED

**Spec CA-06:** "UPDATE bloqueado en ARCHIVED — status 409 `menu_item_archived`."

**Observación (PROVEN):** `MenuItemCatalog.jsx` (línea 183) muestra botón
"Editar" para TODOS los items independientemente del status. No hay guard
que deshabilite el botón cuando `item.status === 'ARCHIVED'`.

**Clasificación:** PROVEN.

---

## UC-ADM-05: Gestionar lifecycle de MenuItem

### Implementado ✓
- Transiciones DRAFT→ACTIVE, ACTIVE→DEPRECATED, DEPRECATED→[ACTIVE,ARCHIVED], ARCHIVED→ACTIVE
- UI: tab "Lifecycle" con botones de transición por item
- Mock: PATCH con `{ status: newStatus }` alterna correctamente

### GAP-ADM-05-BLOCKARCHIVE: Sin flujo block_auto_archive

**Spec CA-07:** "`POST .../block-archive/` con `block_reason` mínimo 20 chars
→ 422 si < 20."
**Spec CA-08/09:** Auto-archive a 90d; bloqueado si `block_auto_archive=True`.
**Spec CA-03:** Reactivate desde DEPRECATED limpia `block_auto_archive`,
`block_reason`, `block_set_by`, `block_set_at`.

**Observación (PROVEN):** No existe endpoint `block-archive` en adminGateway.js
ni mock handler. La UI del lifecycle tab no muestra ningún control para
`block_auto_archive`. Los items DEPRECATED no tienen opción de bloquear
el archivado automático.

**Clasificación:** PROVEN.

### GAP-ADM-05-PUBLISH-INACTIVE: Sin validación Function inactiva al publicar

**Spec CA-06:** "Publicar con Function inactiva → 422 `function_inactive`."

**Observación (PROVEN):** El botón "→ Activo" en el lifecycle tab no verifica
que la Function subyacente esté activa. El mock `_handleAdminMenuItems`
PATCH retorna siempre 200, sin verificar el estado de la función.
Si el backend real retorna 422, el UI mostraría error silencioso (igual que ADM-01).

**Clasificación:** PROVEN.

---

## Resumen de gaps

| ID | UC | Descripción | Severidad |
|----|-----|-------------|-----------|
| GAP-ADM-01-DISJOINT | adm-01 | Sin validación disjunción group_a/group_b | MEDIA |
| GAP-ADM-01-ERRORDISPLAY | adm-01 | Sin display de errores backend en formulario SoD | MEDIA |
| GAP-ADM-02-FILTER | adm-02 | Sin filtro por module/state en catálogo funciones | BAJA |
| GAP-ADM-03 | adm-03 | UC completo no implementado: composición AGR | ALTA |
| GAP-ADM-04-BULKREORDER | adm-04 | Sin bulk reorder de MenuItems | MEDIA |
| GAP-ADM-04-ARCHIVED-EDIT | adm-04 | Edit habilitado para items ARCHIVED | BAJA |
| GAP-ADM-05-BLOCKARCHIVE | adm-05 | Sin flujo block_auto_archive en lifecycle | MEDIA |
| GAP-ADM-05-PUBLISH-INACTIVE | adm-05 | Sin validación función inactiva al publicar | BAJA |

**Total: 8 gaps** — 1 ALTA, 4 MEDIA, 3 BAJA.

---

## Decisión de scope propuesta

### In-scope (v5.6.0 frontend)
- GAP-ADM-03: AGR composition — UC completo, no implementado, ALTA prioridad
- GAP-ADM-01-DISJOINT + GAP-ADM-01-ERRORDISPLAY: validación formulario SoD
- GAP-ADM-04-ARCHIVED-EDIT: guard de UI trivial
- GAP-ADM-05-BLOCKARCHIVE: flujo bloqueo auto-archive con block_reason

### Out-of-scope (backend/scheduler)
- CA-08/09/10 de uc-adm-05 (job de auto-archive): scheduler backend
- CA-10 de uc-adm-01 (EnforcementEngine reload): backend
- CA-08 de todos los UCs (audit): backend concern
- GAP-ADM-02-FILTER: nice-to-have, baja prioridad

## Próximo paso

Gate 1 → Phase 8 PLAN EXECUTION: descomponer gaps en-scope en tareas T-NNN.
```
