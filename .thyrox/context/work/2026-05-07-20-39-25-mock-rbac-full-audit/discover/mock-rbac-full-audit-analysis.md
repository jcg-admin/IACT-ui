```yml
created_at: 2026-05-07 20:39:25
project: IACT-ui
work_package: 2026-05-07-20-39-25-mock-rbac-full-audit
phase: Phase 1 — DISCOVER
author: claude
status: Aprobado
version: 1.0.0
```

# Análisis DISCOVER — Auditoría Mock + RBAC v5.6.x

## Contexto

El WP `menu-submenu-ux` implementó 28 sub-rutas en el sidebar accordion.
La implementación se apoya en tres capas: (1) `FunctionCatalog.js` / `catalog.js`
para los permission strings, (2) `ALL_NAV_LINKS` en AppRouter para la estructura
del menú, y (3) el sistema mock (mockInterceptor.js + permissions*.json) para
simular las respuestas del backend.

Durante el análisis post-cierre de ese WP se descubrió que ninguna de esas
tres capas está completamente alineada con el catálogo canónico RBAC v5.6.x
(catalogo-funciones.rst — 67 funciones activas en 11 módulos).

## Fuentes consultadas

- `catalogo-funciones.rst` — 67 funciones en MOD_Auth/Users/Access/Pipeline/Reports/Alerts/Audit/Logs/Admin (9 módulos activos)
- `grupos-funciones.rst` — 12 AGRs (10 activos, 2 RESERVADOS)
- `mapeo-uc.rst` — mapeo function→UC
- `src/mocks/mockInterceptor.js` — 1028 líneas, clase MockInterceptor
- `src/mocks/permissions.json` — userId=10 (AGR-002+AGR-004)
- `src/mocks/permissions-admin.json` — userId=99 (AGR-010)
- `src/permissions/catalog.js` — FunctionCatalog con ~35 constantes
- `src/router/AppRouter.jsx` — ALL_NAV_LINKS (9 tops + 28 children)

## Hallazgos por capa

### Capa 1: mockInterceptor.js

**H-01 [CRÍTICO] Login userId mismatch**
`_handleLogin` retorna `id: 1` para demo/demo123.
`PERMISOS_BY_USER_ID` solo tiene keys 10 y 99.
→ `_handlePermisosCapacidades` retorna HTTP 404 para userId=1.
→ Demo user no puede usar la aplicación.

**H-02 [ALTO] `_handleAdminFunctions` — lista incompleta (20/67)**
El GET handler retorna 20 funciones.
El catálogo canónico tiene 67 funciones activas.
Faltan 47 funciones de MOD_Auth (3), MOD_Users (7), MOD_Access (9),
MOD_Pipeline (2), MOD_Reports (8), MOD_Alerts (9), MOD_Audit (3), MOD_Logs (2),
MOD_Admin v5.6.x (3).

**H-03 [MEDIO] `_handleAdminAGR` — AGR-010 functions_count incorrecto**
Mock retorna `functions_count: 6` para system_admin_group.
Spec (grupos-funciones.rst §4.2): AGR-010 tiene 9 funciones.

**H-04 [MEDIO] `_handleSeparationRules` — codenames no canónicos**
Usa `pipeline:execute` — capacidad inexistente en el catálogo canónico.
Las reglas reales SoD (AGR-006 vs AGR-008, AGR-007 vs AGR-008, AGR-009 vs AGR-008)
deberían usar los codenames de las funciones reales involucradas.

**H-05 [ALTO] Endpoints faltantes para páginas implementadas**
Páginas `/reports/realtime`, `/reports/scheduled`, `/reports/historical`
existen en el router pero no tienen handlers en mockInterceptor.
`useMenu()` hook llama a un endpoint de menú que no existe en el mock.

**H-06 [BAJO] `_handleGetUser` siempre retorna userId=1**
No importa qué usuario inició sesión, el perfil devuelto es el hardcoded demo.
Inconsistencia con el sistema de permisos que distingue userId 10 vs 99.

### Capa 2: permissions.json / permissions-admin.json

**H-07 [INFO] permissions.json (AGR-002+AGR-004) — CORRECTO**
Las 14 capacidades en el archivo coinciden exactamente con la unión AGR-004
(que hereda AGR-003 → AGR-002 → AGR-001). No hay errores en este archivo.

**H-08 [INFO] permissions-admin.json (AGR-010) — CORRECTO para 9 funciones canónicas**
Las 9 capacidades coinciden con el listado de AGR-010 en grupos-funciones.rst.
Las 3 funciones v5.6.x extension (adm:manage_menu_catalog, adm:manage_menu_lifecycle,
adm:manage_is_critical) no están en AGR-010 según la spec — no hace falta agregarlas.

### Capa 3: FunctionCatalog.js (permissions/catalog.js)

**H-09 [ALTO] Constantes faltantes para Alerts (8 funciones)**
Spec define 10 funciones en MOD_Alerts. catalog.js solo tiene 2 constantes
(VIEW_ALERTS, MANAGE_ALERTS). Faltan:
- CONFIGURE_TEAM_ALERTS = 'alerts:config_team'
- PAUSE_ALERTS = 'alerts:pause'
- DISABLE_ALERTS = 'alerts:disable'
- VIEW_ALERT_HISTORY = 'alerts:history'
- ACKNOWLEDGE_ALERT = 'alerts:acknowledge'
- SUBSCRIBE_ALERT = 'alerts:subscribe'
- UNSUBSCRIBE_ALERT = 'alerts:unsubscribe'
- CONFIGURE_ALERT_SEVERITY = 'alerts:config_severity'

**H-10 [MEDIO] Constantes faltantes para Pipeline (2 funciones)**
Spec define 4 funciones. catalog.js tiene VIEW_ETL_SUPERVISION y RETRY_PIPELINE.
Faltan:
- VIEW_PIPELINE_ERRORS = 'pipeline:view_errors'
- VIEW_DATA_AVAILABILITY = 'pipeline:availability'

**H-11 [MEDIO] Constantes faltantes para Users (5 funciones)**
catalog.js tiene VIEW_USERS, MANAGE_USERS, EDIT_USERS, DELETE_USERS (4).
Spec define 9 funciones. Faltan:
- LIST_USERS = 'users:list'
- SEARCH_USERS = 'users:search'
- BLOCK_USERS = 'users:block'
- UNBLOCK_USERS = 'users:unblock'
- REACTIVATE_USERS = 'users:reactivate'

**H-12 [MEDIO] Constantes faltantes para Access (6 funciones)**
Faltan vs spec (12 funciones totales en MOD_Access):
- REVOKE_FUNCTIONS = 'access:revoke'
- ASSIGN_FUNCTION_GROUPS = 'access:assign_group'
- ASSIGN_TO_GROUP = 'access:assign_to_group'
- UPDATE_SOD = 'access:update_sod'
- DISABLE_SOD = 'access:disable_sod'
- REVOKE_EXCEPTIONAL = 'access:revoke_exceptional'

**H-13 [MEDIO] Constantes faltantes para Auth (2 funciones)**
Faltan:
- CLOSE_SESSION = 'auth:close_session'
- RESET_PASSWORD = 'auth:reset_password'

**H-14 [BAJO] Constantes faltantes para Admin v5.6.x (3 extensiones)**
Las 3 funciones de extensión no tienen constantes:
- MANAGE_MENU_CATALOG = 'adm:manage_menu_catalog'
- MANAGE_MENU_LIFECYCLE = 'adm:manage_menu_lifecycle'
- MANAGE_IS_CRITICAL = 'adm:manage_is_critical'

### Capa 4: ALL_NAV_LINKS + permission guards

**H-15 [ALTO] Permission incorrecto en nav "Disponibilidad" (/logs/etl/availability)**
El sub-ítem usa `FunctionCatalog.VIEW_PIPELINE_LOGS` (= 'logs:view_etl').
Spec: `view_data_availability → pipeline:availability` (UC-052).
El guard correcto es VIEW_DATA_AVAILABILITY = 'pipeline:availability'.

**H-16 [ALTO] Módulo Alertas sin sub-menú**
El sidebar tiene solo un ítem plano para Alertas (VIEW_ALERTS).
MOD_Alerts tiene 10 funciones con páginas en el router:
`/alerts` (ver), `/alerts/configure` (configurar personal),
`/alerts/team` (configurar equipo), `/alerts/history` (historial).
Falta la estructura de sub-menú accordion.

**H-17 [MEDIO] Módulo Auditoría sin sub-menú**
El sidebar tiene solo `{ id: 5, label: 'Auditoría', path: '/audit', permission: VIEW_AUDIT }`.
MOD_Audit tiene 4 funciones: view, search, export, compliance.
Posibles sub-rutas: `/audit` (ver), `/audit/search`, `/audit/export`, `/audit/compliance`.
Hay que verificar si existen las páginas correspondientes en el router.

**H-18 [BAJO] MANAGE_ACCESS semánticamente ambiguo**
`MANAGE_ACCESS = 'access:assign'` guarda "Agrupadores", "Segmentos", "Asignar grupo"
en el nav. Estas acciones son más afines a `access:assign_group` (assign_function_groups).
Los usuarios de AGR-007 tienen ambas capacidades, por lo que en la práctica funciona,
pero el nombre del constant y el string son semánticamente incorrectos para estas rutas.

## Resumen de brechas por prioridad

| ID | Área | Tipo | Impacto |
|----|------|------|---------|
| H-01 | mockInterceptor | Bug crítico | Demo user sin permisos |
| H-02 | mockInterceptor | Completitud | FunctionCatalogPage incompleto |
| H-15 | nav guard | Bug | Disponibilidad visible para logs:view_etl, no pipeline:availability |
| H-16 | sidebar nav | Feature gap | Alertas sin sub-menú |
| H-09 | FunctionCatalog | Completitud | No se pueden guardar rutas de Alerts |
| H-10 | FunctionCatalog | Completitud | No se pueden guardar rutas de Pipeline |
| H-03 | mockInterceptor | Dato incorrecto | AGR-010 muestra 6 en lugar de 9 funciones |
| H-04 | mockInterceptor | Codenames | SoD reglas usan capacidades ficticias |
| H-05 | mockInterceptor | Missing | Páginas accesibles pero sin datos |
| H-17 | sidebar nav | Feature gap | Auditoría sin sub-menú |
| H-11..14 | FunctionCatalog | Completitud | Constantes faltantes para code futuro |
| H-06 | mockInterceptor | UX inconsistency | Perfil de usuario siempre demo |
| H-18 | nav guard | Semántico | MANAGE_ACCESS apunta a capacidad incorrecta |

## Stopping Point Manifest

| SP | Condición | Acción requerida |
|----|-----------|------------------|
| SP-01 | Tamaño del WP > 10 tareas | Agrupar por bloque con 1 commit por bloque |
| SP-02 | Modificación de ALL_NAV_LINKS con nuevos sub-menús | Requiere TDD antes de cambiar el dato |
| SP-03 | Endpoints nuevos en mockInterceptor | Verificar que no rompen handlers existentes |
