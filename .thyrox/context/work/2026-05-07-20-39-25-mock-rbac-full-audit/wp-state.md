```yml
created_at: 2026-05-07 20:39:25
project: IACT-ui
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 3 — ANALYZE (activa)
status: Activo
author: claude
size: grande
```

# WP — Auditoría completa Mock + RBAC v5.6.x

## Trigger

Análisis post-menu-submenu-ux reveló que la implementación del sidebar
se basa en mocks y constantes incompletos. El análisis del WP previo
no consideró: (1) cómo funciona el mock internamente (mockInterceptor.js),
(2) los datos de reportes y alertas, (3) las funciones RBAC en su versión
actual v5.6.x (67 funciones canónicas).

El usuario solicitó explícitamente: "realiza un análisis profundo y
documentalo en un nuevo wp".

## Objetivo

Documentar la brecha completa entre:
- El sistema mock actual (mockInterceptor.js + permissions*.json)
- La especificación RBAC v5.6.x canónica (catalogo-funciones.rst + grupos-funciones.rst)
- FunctionCatalog.js y las constantes que usa el frontend
- Los sub-menús del sidebar y los permisos que los guardan

Producir un task plan que cierre todas las brechas identificadas.

## Fuente canónica

- `/tmp/references/IACT-docs/source/requisitos/reglas-negocio/rbac/catalogo-funciones.rst`
- `/tmp/references/IACT-docs/source/requisitos/reglas-negocio/rbac/grupos-funciones.rst`
- `/tmp/references/IACT-docs/source/requisitos/reglas-negocio/rbac/mapeo-uc.rst`
- `src/mocks/mockInterceptor.js`
- `src/mocks/permissions.json` + `src/mocks/permissions-admin.json`
- `src/constants/FunctionCatalog.js`
- `src/router/AppRouter.jsx` (ALL_NAV_LINKS)
