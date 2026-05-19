```yml
created_at: 2026-05-09 03:30:00
project: THYROX
work_package: 2026-05-09-00-48-30-access-uc-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — access-uc-audit

## L-01: Entity-level audit must verify thunk origin, not just endpoint presence

**Observación:** `TemporaryPermissions.jsx` called `assignFunction` (Assignment entity)
with an `expires_at` field, producing a temporally-bounded Assignment rather than an
ExceptionalPermission. The endpoint for ExceptionalPermission existed and was correct
in other pages (UC_PERM_03). The bug was invisible unless you explicitly verified
which thunk each page calls against the spec's entity model.

**Lección:** PAT-UC-AUDIT-001 must include a field-level check: "which thunk / service
method does this form call?" — not just "does the page call an API?". Endpoint presence
≠ entity correctness.

## L-02: Required UI fields must be traced to spec constraints before testing

**Observación:** `revoke_reason` was accepted by the thunk and mock (correct in the
service layer) but the UI never rendered the field, so the thunk always received
`undefined`. The spec constraint (≥10 chars) was unenforceable.

**Lección:** When a spec says "campo X obligatorio ≥N chars", the audit checklist should
include: (a) field in UI, (b) field passed to thunk, (c) mock validates it. All three
must pass — one missing means the constraint is silently dropped.

## L-03: useSelector mocks must include all selectors imported by the component

**Observación:** Adding `selectUser` from `redux/selectors.js` to TemporaryPermissions
caused `TypeError: selector is not a function` in the existing test. The mock's
`useSelector` only provided `state.access.*` — `selectUser` accesses `state.auth.user`,
which was undefined when called.

**Lección:** When adding a selector to a component, immediately update the test's
`useSelector` mock (or switch to a real Redux store wrapper). Any selector that reads
a different slice than what the mock provides will crash.

## L-04: Optional filter parameters in specs often map to load-on-mount

**Observación:** GAP-ACC-05 was that AccessAudit required userId before loading. The
spec said `actor_id` is an "optional filter". The natural implication is "if no filter,
show all" — which means the table should load immediately on mount without any selection.

**Lección:** When a spec says "filtro opcional", verify that the page loads data on mount
without it. The absence of a filter should default to "show all in scope", not "show
nothing".

## L-05: Write tool requires Read tool, not Bash reads

**Observación:** A prior session read TemporaryPermissions.jsx via Bash grep/sed and
then tried to Write it — the tool rejected with "File has not been read yet". The
session was blocked until the next context window used Read tool explicitly.

**Lección:** Before Write or Edit on any file, always use Read tool (not Bash cat/grep).
This is a hard constraint of the tooling, not a style preference.
