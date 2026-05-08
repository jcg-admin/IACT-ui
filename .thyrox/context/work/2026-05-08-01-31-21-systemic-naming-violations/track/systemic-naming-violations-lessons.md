```yml
created_at: 2026-05-08 08:00:00
project: IACT-UI
work_package: 2026-05-08-01-31-21-systemic-naming-violations
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — systemic-naming-violations

## L-01: Sed substitution order matters for compound names

**Problema:** When renaming `AlertsPage` → `AlertsOverview` with a global sed
`s/AlertsPage/AlertsOverview/g`, the pattern `AcknowledgeAlertsPage` also matched
because it contains `AlertsPage` as a substring. This silently produced
`AcknowledgeAlertsOverview` — an undefined variable that broke tests.

**Solución:** For compound names with shared substrings, always process the longer
pattern first, or use word-boundary anchors (`\b`) in the sed expression.

**Patrón correcto:**
```bash
# Longer pattern first
sed -i 's/AcknowledgeAlertsPage/AlertsHub/g; s/AlertsPage/AlertsOverview/g'
# OR use boundaries
sed -i 's/\bAlertsPage\b/AlertsOverview/g'
```

## L-02: Test files outside src/ must be included in grep scope

**Problema:** Import updates targeted `src/` and `tests/` but missed `__tests__/`
at the repo root. Tests failed with "Cannot find module '../../src/redux/slices/uiSlice'"
after the HAL-2 slice renames.

**Solución:** Always include all three directories in grep/sed scopes:
`/home/user/IACT-ui/src/ /home/user/IACT-ui/tests/ /home/user/IACT-ui/__tests__/`

## L-03: Default exports from modules must be updated along with named exports

**Problema:** `apiErrors.js` had `export class APIError` (renamed to `HttpError`)
but also had a `export default { APIError, ... }` default export that still referenced
`APIError` by name. This caused a runtime ReferenceError when the default export
was destructured.

**Solución:** After renaming a class/function, always grep the same file for
references to the old name in default export blocks, `instanceof` checks, and
`Error.captureStackTrace` calls.

## L-04: HAL-4 alias renames have zero test failures when done atomically

**Miedo inicial:** Alias renames were tagged "CRÍTICO — 374 refs" and placed last.
The actual execution was smooth: bulk sed across the three directories, update
webpack.config.js and jest.config.cjs simultaneously, run tests → 1799 green
in one pass.

**Lección:** The blast radius fear was justified but the execution risk was
manageable when done atomically. The order (HAL-4 last) was correct because
HAL-1..3 renames generated new imports using the old aliases, which would have
needed a second pass if aliases had been renamed first.

## L-05: `this.name` runtime string vs class identifier

**Dilema:** When renaming `APIError` → `HttpError`, the `this.name = 'APIError'`
assignment is a runtime string that affects `error.name` — a stable observable
property referenced in tests as `{ name: 'APIError' }`.

**Decisión:** Update both the class identifier AND `this.name` to `HttpError`,
then update the test assertion to `{ name: 'HttpError' }`. Keeping `this.name`
as `'APIError'` would have preserved backwards compatibility but left an acronym
in the runtime observable, which contradicts HAL-6.

## L-06: 0 test regressions across 6 commits, 419 file changes

The WP closed with 1799/1799 tests passing after processing:
- HAL-5: 5 hook renames → ~30 consumer files
- HAL-1: 57 page renames → ~80 consumer files
- HAL-2: 17 slice renames → ~170 consumer files
- HAL-3: 20 service renames → ~130 consumer files
- HAL-6: 3 identifier renames → ~17 consumer files
- HAL-4: 5 alias renames → ~155 consumer files

Total: ~580 files touched, 0 regressions. The TDD baseline of 1799 tests
acted as a reliable safety net throughout.
