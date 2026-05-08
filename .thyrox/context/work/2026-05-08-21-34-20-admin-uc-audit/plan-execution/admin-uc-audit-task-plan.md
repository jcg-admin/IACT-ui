```yml
created_at: 2026-05-08 21:38:29
project: THYROX
work_package: 2026-05-08-21-34-20-admin-uc-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Borrador
```

# Task Plan — admin-uc-audit

Fuente: `discover/admin-uc-audit-analysis.md`
Gaps: GAP-04 (CRÍTICO) · GAP-06 (MEDIO) · GAP-01/02/03/05/07 (BAJO)

## DAG de dependencias

```
T-001                         (Block I — GAP-01, independiente)

T-002 → T-003                 (Block II — GAP-02, separationRule toggle 409)

T-004                         (Block III — GAP-03, SR duplicado 409)

T-005 → T-006 → T-007 → T-008
                               (Block IV — GAP-04, CRÍTICO: deactivate 202+warning)

T-009                         (Block V — GAP-05, function codename 409)

T-010 → T-011                 (Block VI — GAP-06, is_system guard 403)

T-012                         (Block VII — GAP-07, SoD conflict 400+detalle)
```

---

## Block I — GAP-01: PUT → PATCH en updateSeparationRule (BAJO)

> 1 línea en adminGateway.js. Commit al completar T-001.

- [x] [T-001] `adminGateway.js` — cambiar `apiService.put` por `apiService.patch` en método
  `updateSeparationRule(id, data)` (línea 110)

---

## Block II — GAP-02: Mock simula FA-04 toggle inactiva → 409 (BAJO)

> Mock debe detectar si la regla ya está inactiva y retornar 409.
> Commit al completar T-003.

- [x] [T-002] `mockInterceptor.js` — en `_handleAdminSeparationRules` método PATCH: verificar
  `!rule.isActive` antes del toggle; si ya inactiva → retornar
  `{ status: 409, data: { error: 'Regla ya inactiva', code: 'ALREADY_INACTIVE' } }`
- [x] [T-003] `src/pages/admin/__tests__/SeparationRulesCatalogPage.test.jsx` — agregar test:
  "toggle inactiva → error 409 mostrado al usuario" (despachar toggle sobre rule con
  `isActive=false`, verificar que `role="alert"` aparece)

---

## Block III — GAP-03: Mock simula FA-03 nombre duplicado SR → 409 (BAJO)

> Mock POST debe verificar unicidad de `name`. Commit al completar T-004.

- [x] [T-004] `mockInterceptor.js` — en `_handleAdminSeparationRules` método POST:
  verificar si `body.name` ya existe en `this._separationRulesData()`; si existe →
  retornar `{ status: 409, data: { error: 'Nombre de regla duplicado', code: 'DUPLICATE_NAME' } }`

---

## Block IV — GAP-04: Deactivate 202+warning completo (CRÍTICO)

> El flujo completo: mock → thunk → UI warning panel.
> Commit al completar T-008.

- [x] [T-005] `mockInterceptor.js` — en `_handleAdminFunctions` método PATCH: cuando
  `body.active === false`, verificar si la función tiene asignaciones ficticias activas
  (usar lista hardcoded de codenames con asignaciones: e.g., codenames que contengan
  `'pipeline:execute'`, `'users:manage'`); si tiene → retornar
  `{ status: 202, data: { id, active: false, warnings: ['function_has_active_assignments'],
  affected_users: 3 } }`; si no tiene → retornar 200 como antes
- [x] [T-006] `adminGateway.js` — `deactivateFunction(id)` ya usa PATCH con `{ active: false }` —
  no requiere cambio en endpoint; verificar y documentar en comentario de código que
  202 es respuesta válida además de 200
- [x] [T-007] `admin.js` — en thunk `deactivateFunction`: el payload puede ser 202 con warnings;
  el reducer `.fulfilled` debe guardar `warnings` en `state.deactivateWarnings[id]`; agregar
  campo `deactivateWarnings: {}` al estado inicial si no existe
- [x] [T-008] `FunctionCatalog.jsx` — cambiar `handleDeactivate` para usar `.unwrap()`:
  `const result = await dispatch(deactivateFunction(fn.id)).unwrap()`; si `result.warnings?.length`
  → mostrar panel de advertencia con mensaje "Esta función tiene asignaciones activas.
  La función se desactivó pero las asignaciones existentes no se renovarán." con
  `role="alert"`; catch → mostrar error en `role="alert"`

---

## Block V — GAP-05: Mock simula FA-01 codename duplicado Function → 409 (BAJO)

> Mock POST de functions debe verificar unicidad de codename. Commit al completar T-009.

- [x] [T-009] `mockInterceptor.js` — en `_handleAdminFunctions` método POST:
  verificar si `body.codename` ya existe en la lista `FUNCTIONS` del handler GET;
  si existe → retornar `{ status: 409, data: { error: 'Codename ya existe', code: 'DUPLICATE_CODENAME' } }`

---

## Block VI — GAP-06: Mock guarda is_system → 403 (MEDIO)

> Agregar campo `is_system` a fixtures AGR + guarda en handler.
> Commit al completar T-011.

- [x] [T-010] `mockInterceptor.js` — en `_groupsData()` (o fixture AGR equivalente):
  agregar campo `is_system: true/false` a cada AGR; marcar AGRs con id ≤ 10 como
  `is_system: true`, resto como `is_system: false`; en `_handleAGRFunctions` POST:
  buscar el AGR por `id`, verificar `!agr.is_system`; si no es sistema →
  retornar `{ status: 403, data: { error: 'AGR no es de sistema', code: 'NOT_SYSTEM_AGR' } }`
- [x] [T-011] `src/pages/admin/__tests__/AGRComposition.test.jsx` — agregar test:
  "añadir función a AGR no-sistema → error 403 mostrado"; mockear thunk para retornar
  el error 403, verificar que `role="alert"` aparece en la UI

---

## Block VII — GAP-07: Mock simula FA-03 conflicto SoD en AGR (BAJO)

> Handler AGR POST cruza contra separationRulesData. Commit al completar T-012.

- [x] [T-012] `mockInterceptor.js` — en `_handleAGRFunctions` POST: después de verificar
  duplicados, llamar `this._separationRulesData()` y verificar si `codename` aparece
  en `group_a` de una regla activa junto a alguna función ya en el AGR; si conflicto →
  retornar `{ status: 400, data: { error: 'Conflicto SoD', code: 'SOD_CONFLICT',
  rule_code: <código regla>, conflicting_function: <codename> } }`

---

## Checklist de cierre por bloque

| Bloque | Tareas | Commit |
|--------|--------|--------|
| I — GAP-01 | T-001 | `Fix updateSeparationRule to use PATCH` |
| II — GAP-02 | T-002..T-003 | `Simulate FA-04 inactive toggle 409 in mock` |
| III — GAP-03 | T-004 | `Simulate FA-03 duplicate SR name 409 in mock` |
| IV — GAP-04 | T-005..T-008 | `Implement deactivate 202 warning flow (UC_ADM_02 FA-04)` |
| V — GAP-05 | T-009 | `Simulate FA-01 duplicate codename 409 in mock` |
| VI — GAP-06 | T-010..T-011 | `Add is_system guard to AGR composition mock (UC_ADM_03 FA-04)` |
| VII — GAP-07 | T-012 | `Simulate SoD conflict 400 in AGR composition mock` |
