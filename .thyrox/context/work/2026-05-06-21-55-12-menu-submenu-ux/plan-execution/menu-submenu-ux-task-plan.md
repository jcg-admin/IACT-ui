```yml
created_at: 2026-05-06 21:55:12
updated_at: 2026-05-06 21:55:12
project: IACT-ui
work_package: 2026-05-06-21-55-12-menu-submenu-ux
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Borrador
version: 1.0.0
```

# Task Plan — Sub-menús jerárquicos en Sidebar

## Contexto

`ALL_NAV_LINKS` es plano (9 ítems). El router tiene 26 sub-rutas distribuidas en 4
módulos (Reportes ×11, Logs ×8, Acceso ×5, Admin ×2) que son inaccesibles desde el
sidebar. `SidebarNav` no tiene concepto de grupos expandibles.

## Diseño aprobado

- Nav link extendido: `{ ...actual, children?: [{ label, icon?, path, permission }] }`
- Parent click → expand/collapse (accordion). Child click → navegar.
- `useFilteredNavLinks` filtra children individualmente por `hasPermission`.
- Parent visible aunque todos sus children estén filtrados (parent tiene su propio permiso).
- Auto-expand del grupo cuya sub-ruta está activa.

## DAG de dependencias

```
T-001 (propTypes) ──┐
                    ├──→ T-003 (SidebarNav refactor) ──→ T-004 (tests SidebarNav)
T-002 (nav data) ───┘
                         T-005 (useFilteredNavLinks) ──→ T-006 (tests hook)
T-007 (ALL_NAV_LINKS children) ──→ T-008 (integración AppRouter) ──→ T-009 (tests integración)
T-010 (SCSS accordion) ──→ T-003

T-001..T-010 todos completos ──→ T-011 (full test suite) ──→ T-012..T-014 (cierre WP)
```

---

## Bloque I — Tipos y data model (base para todo)

- [x] [T-001] **IMPLEMENT** — Extender `SidebarNav.propTypes` para declarar `children`.
  En `src/components/navigation/Sidebar/SidebarNav.jsx`:
  - Agregar al shape de cada link: `children: PropTypes.arrayOf(PropTypes.shape({ label, path, permission, icon }))`
  - El campo `children` es opcional (`PropTypes.arrayOf(...).isOptional` — simplemente sin `.isRequired`)
  SPEC: G-S4.

- [x] [T-002] **IMPLEMENT** — Definir la forma extendida de nav link en `ALL_NAV_LINKS`.
  Solo el esqueleto de datos — children vacíos todavía, rellenados en T-007.
  Agregar en `AppRouter.jsx` antes de `ALL_NAV_LINKS` el comentario de diseño y la
  constante `NAV_GROUP_IDS = { REPORTS: 3, LOGS: 7, ACCESS: 4, ADMIN: 8 }` para
  identificar los 4 grupos que tendrán children.
  SPEC: G-S2.

---

## Bloque II — SidebarNav accordion

- [x] [T-003] **IMPLEMENT** — Refactorizar `SidebarNav.jsx` para soportar children.
  Dividir en tres sub-componentes en el mismo archivo:
  ```
  NavLeaf({ link, currentPath, onNavigate })       ← ítem sin children (actual)
  NavGroup({ link, isExpanded, onToggle,            ← ítem con children
             children, currentPath, onNavigate })
  SidebarNav({ navLinks, currentPath, onNavigate }) ← orquestador (mantiene expandedId)
  ```
  Lógica `expandedId`:
  - Inicializar con el id del grupo cuyo path prefix matchea `currentPath`.
  - Toggle: mismo id → null (colapsar). Otro id → expandir.
  Solo un grupo expandido a la vez (accordion).
  `NavGroup` click en el label → toggle (no navega). Click en child → `onNavigate(child)`.
  SPEC: G-S1.

- [x] [T-004] **TDD** — Tests para `SidebarNav` en `SidebarNav.test.jsx` (nuevo).
  Given/When/Then:
  (a) Link sin children → renderiza como botón simple (comportamiento actual)
  (b) Link con children → renderiza con indicador expandible (chevron o similar)
  (c) Click en parent con children → muestra/oculta children (toggle)
  (d) Click en child → llama `onNavigate(child)`, NO `onNavigate(parent)`
  (e) Group cuya sub-ruta está en `currentPath` → inicia expandido
  (f) Solo un grupo expandido a la vez (accordion — expandir B colapsa A)
  SPEC: G-S1, G-S5. Usar `@testing-library/react`.

---

## Bloque III — Filtrado por hasPermission

- [x] [T-005] **IMPLEMENT** — Actualizar `useFilteredNavLinks` en `AppRouter.jsx`.
  Lógica nueva:
  ```js
  function useFilteredNavLinks() {
    const { hasPermission, loading } = usePermisos()
    if (loading) return ALL_NAV_LINKS.slice(0, 1)
    return ALL_NAV_LINKS
      .filter(link => hasPermission(link.permission))
      .map(link => ({
        ...link,
        children: link.children?.filter(c => hasPermission(c.permission)) ?? [],
      }))
  }
  ```
  SPEC: G-S3. Un parent puede tener 0 children visibles (aún aparece el parent).

- [x] [T-006] **TDD** — Tests para `useFilteredNavLinks` en `AppRouter.test.jsx`.
  (a) Parent con permiso + children con permiso → parent visible, children filtrados
  (b) Parent con permiso + todos children sin permiso → parent visible, children=[]
  (c) Parent sin permiso → parent oculto (children no importan)
  (d) En loading → solo Dashboard
  SPEC: G-S3. Mockear `usePermisos` como ya se hace en AppRouter.test.jsx.

---

## Bloque IV — Rellenar ALL_NAV_LINKS con children reales

- [x] [T-007] **IMPLEMENT** — Agregar children a los 4 grupos en `ALL_NAV_LINKS`.

  **Admin (id=8):**
  ```js
  children: [
    { label: 'Funciones RBAC', icon: 'list-check', path: '/admin/functions', permission: FunctionCatalog.MANAGE_CATALOG },
    { label: 'Grupos AGR',     icon: 'users-cog',  path: '/admin/groups',    permission: FunctionCatalog.MANAGE_CATALOG },
  ]
  ```

  **Logs (id=7):**
  ```js
  children: [
    { label: 'App logs',         icon: 'file-alt',     path: '/logs',                  permission: FunctionCatalog.VIEW_LOGS },
    { label: 'ETL logs',         icon: 'exchange-alt',  path: '/logs/etl',              permission: FunctionCatalog.VIEW_PIPELINE_LOGS },
    { label: 'Disponibilidad',   icon: 'heartbeat',    path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_PIPELINE_LOGS },
    { label: 'Buscar',           icon: 'search',       path: '/logs/search',           permission: FunctionCatalog.SEARCH_LOGS },
    { label: 'Exportar',         icon: 'download',     path: '/logs/export',           permission: FunctionCatalog.EXPORT_LOGS },
    { label: 'Infraestructura',  icon: 'server',       path: '/logs/infra',            permission: FunctionCatalog.VIEW_INFRA_LOGS },
    { label: 'Estado sistema',   icon: 'heartbeat',    path: '/logs/status',           permission: FunctionCatalog.VIEW_SYSTEM_HEALTH },
    { label: 'Métricas técnicas',icon: 'chart-line',   path: '/logs/metrics',          permission: FunctionCatalog.VIEW_TECHNICAL_METRICS },
    { label: 'Supervisión ETL',  icon: 'project-diagram', path: '/logs/pipeline',      permission: FunctionCatalog.VIEW_ETL_SUPERVISION },
  ]
  ```

  **Reportes (id=3):**
  ```js
  children: [
    { label: 'Históricos',       icon: 'chart-bar',    path: '/reports/historical',    permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Agentes IVR',      icon: 'headset',      path: '/reports/agents',        permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Colas IVR',        icon: 'list-ol',      path: '/reports/queues',        permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Campañas',         icon: 'bullhorn',     path: '/reports/campaigns',     permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Transferencias',   icon: 'exchange-alt', path: '/reports/transfers',     permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Menús IVR',        icon: 'sitemap',      path: '/reports/ivr-menus',     permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Clientes únicos',  icon: 'user-check',   path: '/reports/unique-clients',permission: FunctionCatalog.VIEW_REPORTS },
    { label: 'Tiempo real',      icon: 'tachometer-alt',path: '/reports/realtime',     permission: FunctionCatalog.VIEW_METRICS },
    { label: 'Programados',      icon: 'calendar-alt', path: '/reports/scheduled',     permission: FunctionCatalog.SCHEDULE_REPORTS },
    { label: 'Exportar',         icon: 'file-export',  path: '/reports/export',        permission: FunctionCatalog.EXPORT_CSV },
    { label: 'Vistas guardadas', icon: 'bookmark',     path: '/reports/saved',         permission: FunctionCatalog.SAVE_VIEW },
  ]
  ```

  **Acceso (id=4):**
  ```js
  children: [
    { label: 'Grupos de acceso', icon: 'users',        path: '/access/groups',          permission: FunctionCatalog.MANAGE_GROUPS },
    { label: 'Composición',      icon: 'layer-group',  path: '/access/groups/composition', permission: FunctionCatalog.MANAGE_GROUPS },
    { label: 'Agrupadores',      icon: 'object-group', path: '/access/groupers',         permission: FunctionCatalog.MANAGE_ACCESS },
    { label: 'Reglas SoD',       icon: 'ban',          path: '/access/separation-rules', permission: FunctionCatalog.MANAGE_SEPARATION_RULES },
    { label: 'Segmentos',        icon: 'filter',       path: '/access/segments',         permission: FunctionCatalog.MANAGE_ACCESS },
    { label: 'Asignar grupo',    icon: 'user-plus',    path: '/access/assign-group',     permission: FunctionCatalog.MANAGE_ACCESS },
  ]
  ```

  SPEC: G-S2. Orden: Admin primero (más simple), luego Logs, Reportes, Acceso.

---

## Bloque V — SCSS para accordion

- [x] [T-008] **IMPLEMENT** — Actualizar `SidebarNav.scss` con estilos de accordion.
  Agregar:
  ```scss
  .navGroup {
    &__header { display:flex; align-items:center; justify-content:space-between; }
    &__chevron { transition: transform 0.2s ease; }
    &__chevron--open { transform: rotate(90deg); }
    &__children {
      padding-left: 1rem;
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.2s ease-out;
      &--open { max-height: 400px; }
    }
  }
  ```
  El estado expandido/colapsado se controla via clases CSS — no inline styles.
  SPEC: G-S1 (visual).

---

## Bloque VI — Integración y tests finales

- [x] [T-009] **TDD** — Tests de integración en `AppRouter.test.jsx` (o nuevo `SidebarNav.integration.test.jsx`).
  Verificar el flujo completo:
  (a) Usuario con `VIEW_REPORTS` y sin `VIEW_METRICS` → sub-item "Tiempo real" no aparece
  (b) Usuario con `MANAGE_CATALOG` → Admin group con 2 children visibles
  (c) Usuario sin `MANAGE_GROUPS` pero con `MANAGE_ACCESS` → en Acceso, "Grupos de acceso" oculto, "Agrupadores" visible
  (d) Usuario sin ninguna capacidad de Logs excepto `VIEW_LOGS` → 8 children de logs ocultos excepto "App logs"
  SPEC: G-S2, G-S3.

- [x] [T-010] **VERIFY** — Verificar que `permissions-admin.json` (userId=99) produce el
  conjunto correcto de nav items + children visibles:
  capacidades admin = `adm:manage_catalog, auth:view_all_sessions, logs:view_app, logs:export`
  Esperado: Admin (2 children), Logs (App logs + Exportar), Ajustes. Sin Reportes, sin Acceso.
  SPEC: G-S3 + verificación end-to-end de permissions-admin.json.

---

## Bloque VII — Cierre formal WP

- [x] [T-011] **VERIFY** — Correr suite completa. Target: ≥ 1748 + nuevos tests.
- [x] [T-012] **TRACK** — Crear `track/menu-submenu-ux-changelog.md`.
- [x] [T-013] **TRACK** — Crear `track/menu-submenu-ux-lessons.md` (≥ 3 lecciones).
- [x] [T-014] **CLOSE** — Actualizar `wp-state.md` + `now.md`. Push + validate-phase-completion.sh.

---

## Métricas de éxito

| Métrica | Objetivo |
|---------|----------|
| Tests verdes | ≥ 1748 + nuevos (sin regressions) |
| Grupos con children | 4 (Admin, Logs, Reportes, Acceso) |
| Children totales en nav | 28 (2+9+11+6) |
| SidebarNav soporta accordion | ✓ |
| `useFilteredNavLinks` filtra children | ✓ |
| Admin user ve sub-ítems correctos | ✓ |

## Notas de implementación

- T-001 y T-002 son independientes entre sí — se pueden hacer en paralelo.
- T-003 y T-004 van juntos (TDD: tests primero → implementar).
- T-005 y T-006 van juntos (TDD: tests primero → implementar).
- T-007 puede hacerse en paralelo con T-003..T-006 (son datos, no lógica).
- T-008 (SCSS) depende solo de que T-003 defina las clases CSS necesarias.
- T-009..T-010 requieren T-003, T-005, T-007 completos.
- Commit por bloque: Bloque I+II (T-001..T-004), Bloque III (T-005..T-006),
  Bloque IV+V (T-007..T-008), Bloque VI (T-009..T-010), Bloque VII (T-011..T-014).
