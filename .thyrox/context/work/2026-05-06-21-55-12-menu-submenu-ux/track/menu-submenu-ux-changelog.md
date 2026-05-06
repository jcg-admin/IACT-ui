```yml
created_at: 2026-05-06 22:30:00
project: IACT-ui
work_package: 2026-05-06-21-55-12-menu-submenu-ux
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Changelog — Sub-menús jerárquicos en Sidebar

## Added

- `SidebarNav.jsx` — `NavLeaf` sub-component: renders leaf nav items (no children) identical to prior behavior (T-001, T-003)
- `SidebarNav.jsx` — `NavGroup` sub-component: accordion group with expandable children, chevron indicator, `hidden` attribute for toggling, auto-expand when active route is in group (T-003)
- `SidebarNav.jsx` — `childShape` PropTypes definition with `{ label, path, permission, icon }` shape; `children` field added to nav link PropTypes (T-001)
- `SidebarNav.test.jsx` — 8 new tests covering: leaf rendering, group expand/collapse, child navigation (not parent), auto-expand on mount, accordion exclusivity (T-004)
- `AppRouter.jsx` — `NAV_GROUP_IDS = { REPORTS: 3, LOGS: 7, ACCESS: 4, ADMIN: 8 }` constant (T-002)
- `AppRouter.jsx` — 28 children across 4 nav groups in `ALL_NAV_LINKS`: Admin×2, Logs×9, Reports×11, Access×6 (T-007)
- `AppRouter.test.jsx` — 5 tests for `useFilteredNavLinks` children-filtering logic (T-006)
- `AppRouter.test.jsx` — 4 integration tests (T-009): VIEW_REPORTS only, MANAGE_CATALOG, MANAGE_ACCESS/MANAGE_GROUPS split, VIEW_LOGS only
- `AppRouter.test.jsx` — 4 tests verifying permissions-admin.json user (userId=99) sees Admin+Logs+Ajustes only (T-010)
- `SidebarNav.scss` — `.navGroup__header`, `.navGroup__chevron`, `.navGroup__chevron--open`, `.navGroup__children`, `.navGroup__children--open`, `.navItem--child`, `.navLink--child` (T-008)

## Changed

- `SidebarNav.jsx` — `SidebarNav` component refactored from flat `<ul>` to orchestrator that dispatches to `NavLeaf` or `NavGroup` based on `children` presence. Accepts new props: `currentPath` (replaces `currentPage` string comparison). Maintains `isCollapsed` support (T-003)
- `AppRouter.jsx` — `useFilteredNavLinks` extended to also filter `children` arrays by `hasPermission`. Parent visible even when all children are filtered (T-005)

## Status de promoción a CHANGELOG.md raíz

Pendiente de merge a `main`. Entradas para promover:
- Added: hierarchical accordion sidebar navigation (28 sub-routes now reachable)
- Changed: `useFilteredNavLinks` filters children individually by RBAC permission
