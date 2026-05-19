```yml
created_at: 2026-05-06 23:45:00
project: IACT-ui
work_package: 2026-05-06-21-11-12-menu-rbac-user-scope
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Borrador
```

# Changelog — Menu RBAC User Scope

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)

---

## [Phase 10 IMPLEMENT — T-001..T-004]

### Added

- **T-002/T-003 (G-M1):** Handler `_handlePermisosCapacidades` en `mockInterceptor.js`.
  Ruta `GET /api/permisos/verificar/{userId}/capacidades/` retorna `{ user_id, capacidades,
  access_groups, expires_at }` usando mapa `PERMISOS_BY_USER_ID` (userId=10 → permissions.json,
  userId=99 → permissions-admin.json, otros → 404).
  Antes del fix: usePermisos retornaba capacidades=[] → sidebar vacío en modo mock.
  Ahora: filtrado correcto de ALL_NAV_LINKS según AGR del usuario.

- **T-003:** Importaciones module-level de `permissions.json` y `permissions-admin.json`
  en mockInterceptor.js para Webpack compatibility y tree shaking.

- **T-002:** Test file `src/mocks/__tests__/mockInterceptor-permisos.test.js` con 8 tests:
  200 para user 10 y 99, forma del response, capacidades específicas, 404 para userId desconocido.

- **T-004 (G-M3):** 2 tests en `AppRouter.test.jsx` verificando que el ítem Admin del sidebar
  (`MANAGE_CATALOG = 'adm:manage_catalog'`) se filtra correctamente. Sin `adm:manage_catalog`
  → Admin no aparece. Con capacidades de `permissions-admin.json` → Admin aparece.

### Aceptado / no fixeado

- **G-M2:** Dos sistemas de menú paralelos (MainLayout legacy vs AppRouter). No fixeado — el
  sistema legacy está en proceso de deprecación. OUT OF SCOPE para este WP.
- **G-M4:** AGR-009 pipeline_admin_group sin nav item para `pipeline:view_status`. Requiere
  nueva ruta en AppRouter — WP separado.
- **G-M5:** AGR-005 alert_manager_group sin `auth:view_own_sessions`. Gap en composición
  de AGR en el spec — no es un bug de frontend.
- **G-M6:** `funciones_accesibles` en permissions.json no consumido por menú actual. Legacy field.
- **G-M7:** Orden del menú hardcoded. OUT OF SCOPE — diseño intencional de la configuración plana.
- **G-M8:** Sin escenario de AGR múltiple violando SoD. Test coverage gap — WP separado.
- **G-M9:** Sub-menús. OUT OF SCOPE (SP-03). WP separado `menu-submenu-ux`.

---

## Métricas finales

| Métrica | Valor |
|---------|-------|
| Tests totales | **1748** |
| Test suites | 211 |
| Regressions | 0 |
| Handler `/capacidades/` | ✓ Implementado |
| Admin nav visible con admin user | ✓ Verificado (2 tests) |

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entrada relevante: Added `_handlePermisosCapacidades` handler.
