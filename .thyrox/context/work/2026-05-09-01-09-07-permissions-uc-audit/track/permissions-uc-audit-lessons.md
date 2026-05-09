```yml
created_at: 2026-05-09 02:30:00
project: THYROX
work_package: 2026-05-09-01-09-07-permissions-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — permissions-uc-audit

## L-01: Same UC can be implemented in two places with different validation

**Observación:** UC_PERM_03 (ExceptionalPermission) had `justification >= 10` in
`ExceptionalPermission.jsx` (permissions-fr-gaps WP) while `TemporaryPermissions.jsx`
(access-uc-audit WP) had correctly implemented `>= 20`. The mock was updated correctly
in the access WP, but the permissions UI was left behind.

**Lección:** When the same entity/thunk is used in multiple components across different
modules, a change to one component doesn't automatically validate the other. PAT-UC-AUDIT-001
must explicitly check ALL components that use the same spec entity — not just the most recent
one added.

## L-02: window.confirm is untestable and must be replaced with state-driven modals

**Observación:** GroupManagement used `window.confirm()` before dispatching deactivate.
In tests, window.confirm cannot be easily asserted and requires jest.spyOn hacks. The retire
flow required a reason field, making window.confirm structurally insufficient.

**Lección:** Any flow that requires user input (motivo, confirmación con datos adicionales)
must use a React state-driven modal, not window.confirm. The modal pattern is testable via
RTL's `getByRole('button', { name: /confirmar/i })` without spying.

## L-03: jest.spyOn without restoreAllMocks breaks subsequent tests

**Observación:** The loading test used `jest.spyOn(require('react-redux'), 'useSelector')`
without restoring. This permanently overrode useSelector for all subsequent tests in the
describe block, causing them to see loading=true + groups=[] even though the mock setup
provided GROUPS.

**Lección:** Any test that uses `jest.spyOn` must call `jest.restoreAllMocks()` in `afterEach`.
Alternatively, use `jest.spyOn().mockReturnValueOnce()` to limit scope to one call.

## L-04: Class field state in mock handlers creates shared mutable state across tests

**Observación:** `_ACCESS_GROUPS = [...]` as a class field in MockInterceptor means all
tests share the same array. A test that calls POST creates a new group that persists into
the next test. This is acceptable for integration-style mocks but must be documented.

**Lección:** If mock handler state needs to be isolated per test, either reset it in
`beforeEach` (e.g., via `mockInterceptor._ACCESS_GROUPS = [...]`) or use a factory method
that returns a fresh array per call. For audit-focused mocks, shared state is usually OK.

## L-05: `getFunctionGroups` mock returning [] overwrites Redux groups

**Observación:** GroupManagement calls `accessService.getFunctionGroups()` in an async
`loadGroups()` function. When mocked to return `[]`, the async resolution happened AFTER
the Redux groups useEffect set localGroups to GROUPS — overwriting them back to [].

**Lección:** When a component uses both a direct service call and Redux selector for the
same data, test mocks must be consistent. The safest approach is to make the service mock
reject (triggering the catch fallback) rather than return `[]`, which would override valid Redux state.
