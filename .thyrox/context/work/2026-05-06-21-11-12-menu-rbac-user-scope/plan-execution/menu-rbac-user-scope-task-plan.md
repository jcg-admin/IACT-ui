```yml
created_at: 2026-05-06 23:30:00
updated_at: 2026-05-06 23:30:00
project: IACT-ui
work_package: 2026-05-06-21-11-12-menu-rbac-user-scope
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Borrador
version: 1.0.0
```

# Task Plan — Menu RBAC User Scope

## Contexto

SP-01..SP-03 respondidos con autoridad canónica (IACT-docs commit 0db8957b):

| SP | Decisión | Fuente canónica |
|----|----------|----------------|
| SP-01 | Implementar handler explícito en mockInterceptor.js (NO bypass via file) | ADR-BACK-005 + rbac-implementation-guide.rst |
| SP-02 | Opción A: AGR-010 incluye 9 funciones (6 operacional + 3 MOD_Admin). permissions-admin.json correcto | grupos-funciones.rst:289-308 (commit 0db8957b) |
| SP-03 | Sub-menús OUT-OF-SCOPE — WP separado. Scope = filtrado plano de ALL_NAV_LINKS | uc-perm-08/patrones-diseno.rst:45-46 |

## Scope de implementación

**IN SCOPE:** Handler mock para endpoint capacidades + verificar que Admin ítem aparece con permissions-admin.json.

**OUT OF SCOPE:** Sub-menús jerárquicos (WP separado: `menu-submenu-ux`), G-M2 (two menu systems), G-M7 (orden_menu dinámico).

## Gaps cubiertos

| Gap | Severidad | En scope |
|-----|-----------|----------|
| G-M1 | CRÍTICO | ✓ T-002/T-003 |
| G-M3 | Alta | ✓ T-004 (verificación) |
| G-M2, G-M4..G-M9 | Media/Baja | Fuera de scope |

## DAG de dependencias

```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007
```

## Tasks

### Bloque I: Documentar decisiones SP

- [x] [T-001] **DOCUMENT** — Registrar decisiones SP-01..SP-03 en el WP.
  Actualizar `wp-state.md` con las decisiones canónicas y fuentes.
  Fuente: IACT-docs commit 0db8957b (grupos-funciones.rst, uc-perm-08/patrones-diseno.rst).

### Bloque II: Mock handler para /api/permisos/verificar/

- [x] [T-002] **TDD RED** — Crear `src/mocks/__tests__/mockInterceptor-permisos.test.js`.
  Tests deben verificar:
  (a) GET `/api/permisos/verificar/10/capacidades/` retorna `{ capacidades: [...] }` con
      las capacidades de `permissions.json` (user.id=10, maria.garcia);
  (b) La respuesta incluye `user_id`, `capacidades` (array de strings), `access_groups` (array);
  (c) GET `/api/permisos/verificar/99/capacidades/` retorna capacidades del admin user.
  Tests fallan porque el handler no existe (→ 404).

- [x] [T-003] **IMPLEMENT** — Agregar handler `_handlePermisosVerificar` en `mockInterceptor.js`.
  SPEC:
  - Ruta: `/api/permisos/verificar/{userId}/capacidades/`
  - Lógica: userId=10 → `permissions.json`, userId=99 → `permissions-admin.json`, otros → 404
  - Response shape: `{ user_id, capacidades, access_groups, expires_at: null }`
  - `access_groups`: codigos de grupos del user (`agr.codigo`)
  Agregar antes del bloque "Default 404" (línea 183).

### Bloque III: Verificar G-M3 (Admin nav item)

- [x] [T-004] **VERIFY** — Verificar en tests que:
  (a) `ALL_NAV_LINKS[7]` (Admin, permission=MANAGE_CATALOG) se filtra para user sin `adm:manage_catalog`;
  (b) Con `capacidades` de `permissions-admin.json` (que incluye `adm:manage_catalog`), el ítem Admin pasa el filtro.
  Agregar test en AppRouter.test.jsx o nuevo archivo.

### Bloque IV: Cierre formal WP

- [ ] [T-005] **TRACK** — Crear `track/menu-rbac-user-scope-changelog.md`.
- [ ] [T-006] **TRACK** — Crear `track/menu-rbac-user-scope-lessons.md` con ≥3 lecciones.
- [ ] [T-007] **CLOSE** — Actualizar `wp-state.md` + `now.md`. Push final + validate-phase-completion.sh.

## Métricas de éxito

| Métrica | Objetivo |
|---------|----------|
| Tests verdes | ≥ 1737 (sin regressions) |
| Handler `/capacidades/` | Implementado |
| Admin nav item | Visible con permissions-admin.json capacidades |
| Changelog | ≥ 3 entradas |
| Lessons | ≥ 3 |
