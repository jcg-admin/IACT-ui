```yml
created_at: 2026-05-06 21:55:12
project: IACT-ui
work_package: 2026-05-06-21-55-12-menu-submenu-ux
phase: Phase 10 — IMPLEMENT
status: Activo
author: claude
size: mediano
```

# WP — Sub-menús jerárquicos en Sidebar

## Trigger

SP-03 del WP `menu-rbac-user-scope` determinó que sub-menús son UX, no RBAC —
requieren WP separado. `ALL_NAV_LINKS` es plano (9 ítems) pero el router tiene:
- **Reportes**: 11 sub-rutas (`/reports/*`)
- **Logs**: 8 sub-rutas (`/logs/*`) con 6 permisos diferentes
- **Acceso**: 5 sub-rutas (`/access/*`) con 3 permisos diferentes
- **Admin**: 2 sub-rutas (`/admin/*`) con mismo permiso

Ninguna de estas sub-rutas es alcanzable desde el sidebar — el usuario debe
conocer las URLs directamente o ser redirigido vía links internos.

## Objetivo

Extender `ALL_NAV_LINKS` con children, actualizar `SidebarNav` para renderizar
grupos expandibles, y filtrar children por `hasPermission` para que solo aparezcan
las sub-rutas accesibles a cada AGR.

## Fuente canónica

- `uc-perm-08/patrones-diseno.rst:45-46` — menú complementa UX, endpoint es la barrera
- `grupos-funciones.rst` — AGR×función mapping para determinar qué sub-ítems son visibles
