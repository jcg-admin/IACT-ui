```yml
created_at: 2026-05-08 21:48:44
project: THYROX
work_package: 2026-05-08-21-34-20-admin-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — WP admin-uc-audit

## Added

- **mockInterceptor.js: 4 new SR behaviors** (Block II/III, GAP-02/03)
  - Toggle PATCH on already-inactive SR → 409 ALREADY_INACTIVE (FA-04)
  - POST with duplicate `name` → 409 DUPLICATE_NAME (FA-03)
- **mockInterceptor.js: function catalog 202 warning flow** (Block IV, GAP-04)
  - PATCH deactivate with active assignments → 202 + warnings[] + affected_users
  - Hardcoded codenames with assignments: pipeline:execute, users:manage, access:assign
- **mockInterceptor.js: function catalog POST 409** (Block V, GAP-05)
  - POST with duplicate codename → 409 DUPLICATE_CODENAME (FA-01)
- **mockInterceptor.js: AGR is_system guard** (Block VI, GAP-06)
  - `is_system` field added to all 10 AGR fixtures (+ non-system id=20 for testing)
  - POST to non-system AGR → 403 NOT_SYSTEM_AGR (FA-04)
- **mockInterceptor.js: AGR SoD conflict detection** (Block VII, GAP-07)
  - POST crosses against `_separationRulesData()` for active rules
  - Conflict → 400 SOD_CONFLICT + rule_code + conflicting_function (FA-03)
- **SeparationRulesCatalog.jsx: `handleToggleStatus` error branch** (Block II, GAP-02)
  - else clause sets `feedback({ type: 'danger', msg })` for rejected dispatch
  - role=alert surfaces to user immediately
- **FunctionCatalog.jsx: `handleDeactivate` with `.unwrap()` + warning panel** (Block IV, GAP-04)
  - `deactivateWarning` + `deactivateError` state added
  - `.unwrap()` catches 202 warnings and surfaces "asignaciones activas" role=alert
  - catch block shows error role=alert
- **admin.js: `deactivateWarnings` field in initial state** (Block IV, GAP-04)
  - Reducer `.fulfilled` stores `warnings` by function id
  - `delete state.deactivateWarnings[id]` on clean deactivate
- **SeparationRulesCatalogPage.test.jsx: 1 new test** — toggle 409 shows role=alert
- **FunctionCatalogPage.test.jsx: 3 new tests** — deactivate 202 warning, throw, no-warning
- **AGRComposition.test.jsx: 1 new test** — addFunctionToAGR 403 non-system shows role=alert

## Changed

- **adminGateway.js: `updateSeparationRule`** PUT → PATCH (Block I, GAP-01)
- **mockInterceptor.js: `_handleAdminFunctions` signature** receives `url` as first param
  (routing call updated to pass url); GET recursion uses `url` consistently
- **mockInterceptor.js: `_handleAdminAGR` AGRS fixture** added `is_system` field to all AGRs;
  added id=20 non-system AGR for guard testing

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entradas candidatas:
- Fix: `updateSeparationRule` now uses PATCH per UC_ADM_01 spec
- Add: `deactivateFunction` 202 warning flow surfaced in UI (UC_ADM_02 FA-04)
- Add: is_system guard in AGR composition mock (UC_ADM_03 FA-04)
