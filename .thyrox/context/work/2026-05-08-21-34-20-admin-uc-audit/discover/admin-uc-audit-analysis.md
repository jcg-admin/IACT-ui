```yml
created_at: 2026-05-08 21:38:29
project: THYROX
work_package: 2026-05-08-21-34-20-admin-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — admin-uc-audit

## Scope

UC_ADM_01..UC_ADM_05 — módulo Admin.
Fuente de verdad: `/tmp/references/IACT-docs/source/requisitos/casos-uso/admin/`
(branch `feature/cnst-033-uml-conformance`).
Implementación: `src/pages/admin/` + `src/services/adminGateway.js` +
`src/redux/slices/admin.js` + `src/mocks/mockInterceptor.js`.

**UC_ADM_04 / UC_ADM_05 (MenuItemCatalog):** CERRADOS en WP `menuitem-uc-audit`.
Todos los gaps (endpoints de transición, unblock-archive, PUT→PATCH, filtros,
mock 409 duplicado) implementados y testeados. No se reabren.

---

## UC_ADM_01 — SeparationRulesCatalog

**Flujo principal:** POST crear, PATCH update, toggle ACTIVE→INACTIVE (bajas
lógicas, BR-009). Enforcement reload en cada cambio.

### GAP-01 — `updateSeparationRule` usa PUT en lugar de PATCH (BAJO)

**Evidencia (PROVEN):**
```
adminGateway.js:110  return apiService.put(`/api/admin/separation-rules/${id}/`, data)
```
Spec §3.2: "CRUD estándar" — el verbo correcto para actualización parcial es PATCH.
El mock acepta PUT y lo procesa en `_handleAdminSeparationRules` método PUT,
por lo que funciona en desarrollo, pero viola el contrato de la API real.

**Impacto:** Backend real rechazará PUT sin todos los campos obligatorios.

### GAP-02 — Mock no simula FA-04 (toggle ya inactiva → 409) (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js:1361  if (method === 'PATCH') {
mockInterceptor.js:1362    return { status: 200, data: { ...rule, isActive: !rule.isActive } }
```
Mock siempre retorna 200 y alterna `isActive`. FA-04 requiere 409 cuando la
regla ya está inactiva. La UI no puede testearse contra este error.

### GAP-03 — Mock no simula FA-03 (nombre duplicado → 409 para SR) (BAJO)

**Evidencia (PROVEN):**
Mock POST crea nuevas reglas sin verificar duplicados de `name`. FA-03 exige 409
Conflict para nombres duplicados. No existe fixture de regla duplicada ni handler.

---

## UC_ADM_02 — FunctionCatalog

**Flujo principal:** POST crear función, PATCH update/deactivate,
listado con filtros module/state.

### GAP-04 — Deactivate con asignaciones activas: 202+warning no implementado (CRÍTICO)

**Evidencia (PROVEN):**
```
adminGateway.js:53   async deactivateFunction(id) {
adminGateway.js:55     return apiService.patch(`/api/admin/functions/${id}/`, { active: false })
mockInterceptor.js:1077  if (method === 'PATCH') {
mockInterceptor.js:1078    return { status: 200, data: { ...body, active: body.active !== false } }
FunctionCatalog.jsx:123  const handleDeactivate = (fn) => {
FunctionCatalog.jsx:125    dispatch(deactivateFunction(fn.id))
```
Spec FA-04: cuando la función tiene asignaciones activas → 202 + lista de
warnings. Mock retorna 200 siempre. UI despacha sin `.unwrap()` — el payload
202 nunca se lee. El usuario no ve advertencia de impacto.

**Impacto:** Usuarios con asignaciones activas se ven afectados silenciosamente.

### GAP-05 — Mock no simula FA-01 (codename duplicado → 409 para Function) (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js:1061  if (method === 'POST') {
mockInterceptor.js:1062    if (!body || !body.codename || !body.name) {
mockInterceptor.js:1063      return this._error(400, 'codename and name are required')
```
Mock valida presencia de campos pero no unicidad de codename. FA-01 exige 409
Conflict para codenames duplicados. No hay fixture ni check de duplicado.

---

## UC_ADM_03 — AGRCatalog (Composition + Impact)

**Flujo principal:** POST añadir función al AGR, DELETE quitar, GET composición,
GET impact preview. Solo AGRs de sistema (is_system=True).

### GAP-06 — Mock no guarda `is_system` (FA-04: no-sistema → 403) (MEDIO)

**Evidencia (PROVEN):**
```
mockInterceptor.js:1813  if (method === 'POST') {
mockInterceptor.js:1814    const codename = body?.function_codename
mockInterceptor.js:1818    if (fns.has(codename)) {
mockInterceptor.js:1819      return { status: 409, ... }
```
Handler `_handleAGRFunctions` no verifica si el AGR destino tiene
`is_system=True`. FA-04 requiere 403 cuando el AGR no es de sistema. El mock
permite añadir funciones a cualquier AGR sin distinción.

**Datos AGR en mock:** Los AGRs de la fixture tienen campo `active: true` pero
no tienen campo `is_system`. El handler no puede implementar la guarda sin
este campo en el fixture.

### GAP-07 — Mock no simula FA-03 (conflicto SoD → 400 + detalle de regla) (BAJO)

**Evidencia (PROVEN):**
```
mockInterceptor.js:1818  if (fns.has(codename)) {
mockInterceptor.js:1819    return { status: 409, ... 'ALREADY_ASSIGNED' }
```
Mock detecta duplicados (FA-02 → 409) correctamente. Pero FA-03 requiere 400
cuando agregar la función viola una regla SoD existente. El mock no cruza
contra `_separationRulesData()` ni retorna el detalle de la regla violada.

---

## Resumen de gaps

| ID | UC | Severidad | Descripción | Archivos afectados |
|----|-----|-----------|-------------|-------------------|
| GAP-01 | UC_ADM_01 | BAJO | `updateSeparationRule` PUT → PATCH | adminGateway.js |
| GAP-02 | UC_ADM_01 | BAJO | Mock: toggle inactiva → 409 no simulado (FA-04) | mockInterceptor.js |
| GAP-03 | UC_ADM_01 | BAJO | Mock: nombre duplicado SR → 409 no simulado (FA-03) | mockInterceptor.js |
| GAP-04 | UC_ADM_02 | CRÍTICO | Deactivate 202+warning no implementado (FA-04) | adminGateway.js, admin.js, FunctionCatalog.jsx, mockInterceptor.js |
| GAP-05 | UC_ADM_02 | BAJO | Mock: codename duplicado → 409 no simulado (FA-01) | mockInterceptor.js |
| GAP-06 | UC_ADM_03 | MEDIO | Mock: no-sistema AGR → 403 no simulado (FA-04) | mockInterceptor.js, fixtures |
| GAP-07 | UC_ADM_03 | BAJO | Mock: conflicto SoD → 400+detalle no simulado (FA-03) | mockInterceptor.js |

**UC_ADM_04/05:** CERRADOS (menuitem-uc-audit WP). No aplicable.

---

## Patrón PAT-UC-AUDIT-001

Aplicado: spec leído completo (flujo-principal + flujos-alternos + criterios-aceptacion)
antes de clasificar gaps. Implementación verificada con Read/Grep en archivos reales.
Sin claims SPECULATIVE en la clasificación de gaps.

## Exit criteria Phase 1

- [x] Spec UC_ADM_01..03 leído
- [x] Implementación auditada (adminGateway.js, admin.js, mockInterceptor.js,
      FunctionCatalog.jsx, SeparationRulesCatalog.jsx)
- [x] 7 gaps clasificados con evidencia PROVEN
- [x] UC_ADM_04/05 confirmados cerrados
