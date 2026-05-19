```yml
created_at: 2026-05-08 18:00:00
project: IACT-UI
work_package: 2026-05-08-15-44-55-auth-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — auth-uc-audit

## L-01: `.unwrap()` is mandatory for reading thunk payloads

When migrating from local inline async thunks to centralized RTK thunks,
`.unwrap()` is required on the dispatched result to both read the
fulfilled payload and properly surface rejected errors.

Without `.unwrap()`, `dispatch(thunk())` returns an action object
(always "resolved"), not the actual server payload. `result?.next_step`
would always be `undefined` even on success, and rejected thunks would
not throw — errors would silently disappear.

**Pattern:**
```js
const result = await dispatch(myThunk(args)).unwrap()
// result is now the actual fulfilled payload
if (result?.next_step) navigate(result.next_step)
```

**Applies to:** Any component reading the fulfilled value of a dispatched
RTK thunk. All auth pages (Login, RecoverPassword, ChangePassword) now
follow this pattern.

## L-02: Module-level mock reference for useNavigate tests

When testing navigation after async dispatch, the mock for `useNavigate`
must be defined at module level and return a stable reference:

```js
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))
```

If you do `useNavigate: () => jest.fn()` instead, each `useNavigate()`
call returns a different function instance — you can never assert that
*your* navigate was called. This was the root cause of navigation tests
failing silently in `containerComponents.test.jsx` before the fix.

## L-03: getState() in thunks for user id — avoid parameter threading

When a thunk needs the current user's id, use `getState()` inside the
thunk rather than threading the id through as a parameter from the component.

```js
// Correct pattern (T-009)
async (_, { getState }) => {
  const userId = getState().auth?.user?.id
  await apiService.post(`/api/users/${userId}/close-all-sessions/`)
}
```

This keeps the component API clean (`dispatch(logoutAllSessions())` with no
args) and avoids selector duplication at the call site.

## L-04: Test stores must include all slices that connected components use

When a component is updated to use `useSelector` from a new slice (e.g.,
MainLayout adding `useSelector(selectUser)` in T-008), every test suite
that renders that component — including integration tests and unrelated
feature tests — must include that reducer in their mock store.

The regression pattern: a component becomes "Redux-connected" mid-WP,
breaking test suites that previously did not need a Provider. Audit all
test files that render the changed component (direct or ancestor) before
committing the change.

## L-05: PAT-GIT-001 — git mv requires explicit re-add after edits

After `git mv src/A.jsx src/B.jsx`, any subsequent edits to `src/B.jsx`
show as unstaged "modified" — they do NOT auto-stage with the rename.
Must `git add src/B.jsx` explicitly before commit.

Running `git status` after `git mv` (before any edits) confirms the rename
is staged correctly. Post-edit `git status` shows "Changes not staged" for
the new path — this is expected and correct, not an error.

## L-06: Consumer audit before structural moves

Before moving a file (`git mv`), grep for all import paths that reference
the old location — not just in source, but in test files, integration
tests, and any config. Missing even one consumer leaves a broken import
that only surfaces at runtime (or in test suites that aren't run in the
same block).

```bash
grep -r "containers/Login" --include="*.js" --include="*.jsx" --include="*.ts" .
```

In this WP, `tests/integration/login.integration.test.js` was the missed
consumer that required a post-block regression fix.
