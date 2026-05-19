```yml
created_at: 2026-05-06 22:30:00
project: IACT-ui
work_package: 2026-05-06-21-55-12-menu-submenu-ux
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Lessons Learned — Sub-menús jerárquicos en Sidebar

## L-1: `hidden` attribute for testability vs CSS `max-height` for animation

**Problema:** `toBeVisible()` in `@testing-library/react` evaluates computed CSS, which jsdom
does not compute. A `max-height: 0` collapsed list is considered "visible" by the test since
jsdom doesn't apply stylesheets.

**Solución:** Use the `hidden` HTML attribute on the `<ul>` when collapsed. This makes
`not.toBeVisible()` work correctly in jsdom AND the CSS `max-height` transition still fires
in the browser (the browser ignores `max-height` animation on `hidden` elements, but applying
`--open` class removes `hidden` first, and the CSS transition works normally with JS toggle).

**Patrón correcto:** `hidden={!isExpanded}` on the children `<ul>` + CSS class
`navGroup__children--open` for the transition. Both coexist: the `hidden` attribute is
removed before CSS transitions apply.

## L-2: Parent route prefix matching requires anchored `startsWith`

**Problema:** If `currentPath` is `/reports/historical` and we check
`link.path === currentPath`, the parent Reportes (`/reports`) is never matched.
If we use `currentPath.startsWith(link.path)`, then `/logs` would match `/logs/etl`
AND `/logs/export`, correct — but `/log` would also match `/logs`, incorrect.

**Solución:** Always append `/` when checking prefix: `currentPath.startsWith(link.path + '/')`.
This prevents false positives from partial segment matches. Applied in both `NavLeaf` active
detection and in the initial `expandedId` computation.

## L-3: `NAV_GROUP_IDS` as a named constant prevents magic-number drift

When children were added to `ALL_NAV_LINKS`, referring to group IDs by number (`id: 3`) in
multiple places would silently break if IDs changed. Using `NAV_GROUP_IDS.REPORTS = 3` as a
named constant makes the intent explicit and co-located with the nav config.

## L-4: Integration tests against real mock data catch permission-string mismatches early

The T-010 test imported `permissions-admin.json` directly and used the actual `capacidades`
array. This immediately surfaced that `access:assign_to_group` (in the mock) ≠ `access:assign`
(MANAGE_ACCESS in FunctionCatalog), confirming the admin user correctly does NOT see the Acceso
group (parent needs VIEW_ACCESS = `access:view` which admin lacks). Without this test,
the filtering logic would appear correct in unit tests but fail in real browser sessions.

## L-5: `useFilteredNavLinks` should preserve the `??  []` fallback for leaf items

Leaf nav links (Dashboard, Usuarios, Ajustes) do not have a `children` property.
The `.map()` that adds `children: link.children?.filter(...) ?? []` must return `[]` for
leaves, not `undefined`. SidebarNav checks `link.children && link.children.length > 0` — a
`children: []` array renders a `NavLeaf` (correct). An `undefined` would also work currently
but is less explicit; `[]` is the canonical "no children" signal.
