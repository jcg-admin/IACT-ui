```yml
project: IACT-UI
work_package: 2026-05-06-19-34-24-rbac-v560-spec-analysis
created_at: 2026-05-06 19:55:00
current_phase: Phase 1 — DISCOVER
author: claude
status: Borrador
```

# Auditoría RBAC v5.6.0 — Estado actual de IACT-UI

Análisis de todos los artefactos RBAC implementados en `src/` vs la spec
v5.6.0 extraída de `feature/cnst-033-uml-conformance`.

---

## 1. FunctionCatalog (`src/permissions/catalog.js`)

### Estado actual

```js
// Comentario interno: "RBAC v5.4.0"  ← desactualizado
export const FunctionCatalog = {
    VIEW_DASHBOARD:     'reports:dashboard',        // ✅
    VIEW_METRICS:       'reports:kpis',             // ✅
    VIEW_REPORTS:       'reports:view',             // ✅
    FILTER_REPORTS:     'reports:filter',           // ✅
    VIEW_CHARTS:        'reports:charts',           // ✅
    EXPORT_CSV:         'reports:export_csv',       // ✅
    EXPORT_EXCEL:       'reports:export_excel',     // ✅
    EXPORT_PDF:         'reports:export_pdf',       // ✅
    SCHEDULE_REPORTS:   'reports:schedule',         // ✅
    SHARE_REPORTS:      'reports:share',            // ✅
    // SAVE_VIEW ausente ← G-A1

    VIEW_USERS:         'users:view',               // ✅
    MANAGE_USERS:       'users:create',             // ✅
    EDIT_USERS:         'users:update',             // ✅
    DELETE_USERS:       'users:deactivate',         // ✅

    VIEW_ACCESS:        'access:view',              // ✅
    MANAGE_ACCESS:      'access:assign',            // ✅
    MANAGE_GROUPS:      'access:create_group',      // ✅
    MANAGE_SEPARATION_RULES: 'access:view_sod',     // ✅

    VIEW_AUDIT:         'audit:view',               // ✅
    SEARCH_AUDIT:       'audit:search',             // ✅
    EXPORT_AUDIT:       'audit:export',             // ✅
    VIEW_COMPLIANCE:    'audit:compliance',         // ✅

    VIEW_ALERTS:        'alerts:view',              // ✅
    MANAGE_ALERTS:      'alerts:configure',         // ✅

    VIEW_LOGS:          'logs:view_app',            // ✅
    VIEW_PIPELINE_LOGS: 'logs:view_etl',            // ✅
    SEARCH_LOGS:        'logs:search',              // ✅
    EXPORT_LOGS:        'logs:export',              // ✅
    // VIEW_INFRA_LOGS, VIEW_SYSTEM_HEALTH, VIEW_TECHNICAL_METRICS ausentes ← G-A2

    VIEW_ETL_SUPERVISION: 'pipeline:view_status',  // ✅
    RETRY_PIPELINE:       'pipeline:retry',         // ✅
    // view_pipeline_errors, view_data_availability ausentes (pero OK — no son route guards)

    VIEW_CALLS:         'operator:answer',          // ⚠ RESERVADO v5.6.0 (G-A3)
    PERFORM_CALLS:      'operator:dial_out',        // ⚠ RESERVADO v5.6.0 (G-A3)

    MANAGE_CATALOG:     'adm:manage_catalog',       // ✅
    // adm:create_sod ausente ← G-A4

    VIEW_OWN_SESSIONS:  'auth:view_own_sessions',   // ✅
}
```

### Gaps identificados

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-A1 | Media | `SAVE_VIEW = 'reports:save_view'` ausente. UC_RPT_10 (`save_view`) está en spec v5.3.0+ y en MOD_Reports. No hay ruta `/reports/saved` ni route guard. |
| G-A2 | Baja | `logs:view_infra`, `logs:view_health`, `logs:view_metrics` ausentes como constantes nombradas. Las rutas `/logs/infra`, `/logs/status`, `/logs/metrics` usan `VIEW_LOGS` en lugar de constantes específicas — funcionalmente correcto pero no refleja los 3 módulos distintos de la spec. |
| G-A3 | Media | `VIEW_CALLS = 'operator:answer'` y `PERFORM_CALLS = 'operator:dial_out'` presentes pero MOD_Operator es **RESERVADO open-closed en v5.6.0**. Deben eliminarse del catálogo activo o marcarse explícitamente como `// RESERVADO — out-of-scope v5.6.0`. |
| G-A4 | Media | `adm:create_sod` (nueva función ADM-001 de MOD_Admin v5.6.0) ausente como constante. `UC_ADM_01` requiere `create_separation_rule`. |
| G-A5 | Baja | Comentario interno dice "RBAC v5.4.0" — debe actualizarse a v5.6.0. |

---

## 2. `FunctionCatalogPage.jsx` — Validación de codename

### Estado actual

```js
// FunctionCatalogPage.jsx:20
const CODENAME_REGEX = /^[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$/
// Valida: "sistema.dominio.recurso.accion" (4 segmentos con punto)
```

Placeholder de input:
```
"sistema.dominio.recurso.accion"
```

### Gap

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-B1 | **CRÍTICO** | El regex exige `a.b.c.d` (4 segmentos con punto) pero el catálogo v5.6.0 usa `{modulo}:{accion}` con **dos puntos** (ej. `reports:view`, `adm:create_sod`). Todo codename válido de la spec es rechazado por `CODENAME_REGEX`. Un admin que intente registrar `reports:view` recibe error de validación. El formato dot-4 nunca fue el formato canónico — es un artefacto del esquema anterior. |

**Evidencia:** `FunctionCatalog.js` mismo no contiene ningún codename en formato `a.b.c.d`. Todos son `{modulo}:{accion}`.

---

## 3. `AGRCatalogPage.jsx` — Validación de codename

### Estado actual

```js
// AGRCatalogPage.jsx:19
const EMPTY_FORM = { codename: '', name: '', description: '' }
// No tiene CODENAME_REGEX — no valida formato del codename de AGR.
```

Placeholder de input:
```
"Buscar por codename o nombre..."
```

### Gap

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-B2 | Baja | AGRCatalogPage **no valida formato** del codename. El spec dice que los AGR usan snake_case sin prefijo (ej. `basic_operator_group`). La falta de validación permite crear AGRs con nombres arbitrarios que violen STD-013. |

---

## 4. `permissions.json` — Mock user data

### Estado actual

```json
{
  "user": { "grupos": ["report_viewer_group", "data_exporter_group"] },
  "capacidades": [
    "auth:view_own_sessions", "auth:view_all_sessions",
    "reports:view", "reports:dashboard", "reports:kpis", "reports:charts",
    "reports:filter", "reports:export_csv", "reports:export_excel",
    "reports:export_pdf",
    "reports:schedule",          ← ⚠ no está en AGR-002 ni AGR-004
    "users:view",
    "alerts:view", "alerts:configure", "alerts:history",
    "access:view",               ← ⚠ no está en AGR-002 ni AGR-004
    "logs:view_app",             ← ⚠ no está en AGR-002 ni AGR-004
    "logs:search",               ← ⚠ no está en AGR-002 ni AGR-004
    "pipeline:view_status"       ← ⚠ no está en AGR-002 ni AGR-004
  ]
}
```

### Análisis de consistencia con grupos declarados

Según la spec v5.6.0:
- **AGR-002** (`report_viewer_group`): AGR-001 base (6 fns) + `filter_reports`, `view_users` = 8 capacidades
- **AGR-004** (`data_exporter_group`): AGR-003 (11) + `export_csv/excel/pdf` = 14 capacidades

Las 14 capacidades de AGR-004 son:
`view_own_sessions`, `view_all_active_sessions`, `view_reports`, `view_dashboard`,
`view_kpis`, `view_charts`, `filter_reports`, `view_users`, `view_alerts`,
`configure_alerts`, `view_alert_history`, `export_csv`, `export_excel`, `export_pdf`

Mapeo a capacidades: `auth:view_own_sessions`, `auth:view_all_sessions`,
`reports:view`, `reports:dashboard`, `reports:kpis`, `reports:charts`,
`reports:filter`, `users:view`, `alerts:view`, `alerts:configure`,
`alerts:history`, `reports:export_csv`, `reports:export_excel`, `reports:export_pdf`

| Capacidad en mock | Justificación en spec | Estado |
|-------------------|----------------------|--------|
| `auth:view_own_sessions` | AGR-001 base ✅ | OK |
| `auth:view_all_sessions` | AGR-001 base ✅ | OK |
| `reports:view` | AGR-001 ✅ | OK |
| `reports:dashboard` | AGR-001 ✅ | OK |
| `reports:kpis` | AGR-001 ✅ | OK |
| `reports:charts` | AGR-001 ✅ | OK |
| `reports:filter` | AGR-002 ✅ | OK |
| `reports:export_csv` | AGR-004 ✅ | OK |
| `reports:export_excel` | AGR-004 ✅ | OK |
| `reports:export_pdf` | AGR-004 ✅ | OK |
| `users:view` | AGR-002 ✅ | OK |
| `alerts:view` | AGR-003→AGR-004 ✅ | OK |
| `alerts:configure` | AGR-003→AGR-004 ✅ | OK |
| `alerts:history` | AGR-003→AGR-004 ✅ | OK |
| `reports:schedule` | MOD_Reports pero NO en AGR-002/004 | **INCONSISTENTE** |
| `access:view` | AGR-007 (permission_admin) — no en AGR-002/004 | **INCONSISTENTE** |
| `logs:view_app` | AGR-010 (system_admin) — no en AGR-002/004 | **INCONSISTENTE** |
| `logs:search` | AGR-010 — no en AGR-002/004 | **INCONSISTENTE** |
| `pipeline:view_status` | AGR-009 (pipeline_admin) — no en AGR-002/004 | **INCONSISTENTE** |

### Gaps

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-C1 | Media | 5 capacidades en el mock no pertenecen a los grupos declarados (AGR-002 + AGR-004): `reports:schedule`, `access:view`, `logs:view_app`, `logs:search`, `pipeline:view_status`. El mock funciona porque la app solo verifica capacidades, pero la inconsistencia rompe la fidelidad con la spec AGR. |
| G-C2 | Baja | `funciones_accesibles[].nombre_completo` tiene valor `"reports"`, `"users"`, etc. (el módulo, no el nombre completo). El campo es semánticamente incorrecto — debería llamarse `module` o simplemente omitirse dado que la app usa `capacidades`. |
| G-C3 | Baja | `funciones_accesibles` tiene solo 6 entradas cuando el usuario tiene 14+ capacidades de AGR-002+004. Este array se usa para menú navegación — estaría incompleto. |
| G-C4 | Baja | AGR-011 (`call_center_operator_group`) y AGR-012 (`call_center_supervisor_group`) no aparecen en ningún mock. Están RESERVADOS en v5.6.0 — está bien no incluirlos, pero si hay tests que esperan ver los 12 AGRs tendrían que filtrarse. |
| G-C5 | Media | `adm:manage_catalog`, `adm:create_sod`, `access:assign_to_group` (MOD_Admin v5.6.0) no están en ningún escenario del mock. Para probar FunctionCatalogPage/AGRCatalogPage se necesita un usuario con `adm:manage_catalog`. |

---

## 5. Mock Interceptor (`src/mocks/mockInterceptor.js`)

### Endpoints admin auditados

| Endpoint | Handler | Estado |
|----------|---------|--------|
| `GET /api/admin/functions/` | — | **404 (sin handler)** |
| `POST /api/admin/functions/` | — | **404 (sin handler)** |
| `PATCH /api/admin/functions/{id}/` | — | **404 (sin handler)** |
| `GET /api/admin/agr/` | — | **404 (sin handler)** |
| `POST /api/admin/agr/` | — | **404 (sin handler)** |
| `PATCH /api/admin/agr/{id}/` | — | **404 (sin handler)** |
| `GET /api/admin/separation-rules/` | `_handleSeparationRules()` ✅ | OK |

### Gaps

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-D1 | **ALTA** | `GET /api/admin/functions/` sin handler → `FunctionCatalogPage` recibe 404 al montar → estado vacío → tabla vacía. Funcionalidad completamente bloqueada en mock. |
| G-D2 | **ALTA** | `GET /api/admin/agr/` sin handler → `AGRCatalogPage` mismo problema. |
| G-D3 | Media | `POST/PATCH /api/admin/functions/` y `/api/admin/agr/` sin handlers → create/update/deactivate fallan silenciosamente en mock (dispatch rechazado por 404). |

---

## 6. PermissionGate y usePermisos (capas de verificación)

### Estado actual

`PermissionGate.tsx` — ✅ Correcto. Usa `{module}:{action}` notation via `permission` prop.
Soporta 4 variantes: `PermissionGate`, `PermissionGateAny`, `PermissionGateAll`, `PermissionGateRender`.

`usePermisos.ts` — ✅ Correcto. Usa `PermisosClient` que llama al API,
cachea `capacidades: string[]` y expone `hasPermission(permission: string) → bool`.

No hay gaps en estas capas. La arquitectura es correcta.

---

## 7. AppRouter — Route guards

### Estado actual (mapeado)

| Ruta | ProtectedRoute (FunctionCatalog.*) | Capacidad | Módulo spec | Estado |
|------|------------------------------------|-----------|-------------|--------|
| `/dashboard` | VIEW_DASHBOARD | `reports:dashboard` | MOD_Reports | ✅ |
| `/users` | VIEW_USERS | `users:view` | MOD_Users | ✅ |
| `/reports` | VIEW_REPORTS | `reports:view` | MOD_Reports | ✅ |
| `/settings` | VIEW_OWN_SESSIONS | `auth:view_own_sessions` | MOD_Auth | ✅ |
| `/access/*` | VIEW_ACCESS | `access:view` | MOD_Access | ✅ |
| `/audit/*` | VIEW_AUDIT | `audit:view` | MOD_Audit | ✅ |
| `/alerts/*` | VIEW_ALERTS | `alerts:view` | MOD_Alerts | ✅ |
| `/access/groups` | MANAGE_GROUPS | `access:create_group` | MOD_Access | ✅ |
| `/access/groupers` | MANAGE_ACCESS | `access:assign` | MOD_Access | ✅ |
| `/access/separation-rules` | MANAGE_SEPARATION_RULES | `access:view_sod` | MOD_Access | ✅ |
| `/access/segments` | MANAGE_ACCESS | `access:assign` | MOD_Access | ✅ |
| `/access/assign-group` | MANAGE_ACCESS | `access:assign` | MOD_Access | ✅ |
| `/access/audit/permissions` | VIEW_ACCESS | `access:view` | MOD_Access | ✅ |
| `/alerts/templates` | MANAGE_ALERTS | `alerts:configure` | MOD_Alerts | ✅ |
| `/logs` | VIEW_LOGS | `logs:view_app` | MOD_Logs | ✅ |
| `/logs/etl` | VIEW_LOGS | `logs:view_app` | MOD_Logs | ⚠ debería ser VIEW_PIPELINE_LOGS (`logs:view_etl`) |
| `/logs/etl/availability` | VIEW_LOGS | `logs:view_app` | MOD_Logs | ⚠ debería ser VIEW_PIPELINE_LOGS |
| `/logs/infra` | VIEW_LOGS | `logs:view_app` | MOD_Logs | ⚠ debería ser logs:view_infra (ausente en catalog) |
| `/logs/status` | VIEW_LOGS | `logs:view_app` | MOD_Logs | ⚠ debería ser logs:view_health (ausente) |
| `/logs/metrics` | VIEW_LOGS | `logs:view_app` | MOD_Logs | ⚠ debería ser logs:view_metrics (ausente) |
| `/logs/pipeline` | VIEW_ETL_SUPERVISION | `pipeline:view_status` | MOD_Pipeline | ✅ |
| `/reports/scheduled` | SCHEDULE_REPORTS | `reports:schedule` | MOD_Reports | ✅ |
| `/reports/realtime` | VIEW_DASHBOARD | `reports:dashboard` | MOD_Reports | ⚠ debería ser VIEW_METRICS (`reports:kpis`) |
| `/reports/historical` | VIEW_REPORTS | `reports:view` | MOD_Reports | ✅ |
| `/reports/export` | EXPORT_CSV | `reports:export_csv` | MOD_Reports | ✅ |
| `/permissions/assign-group` | MANAGE_ACCESS | `access:assign` | MOD_Access | ✅ |
| `/permissions/revoke-group` | MANAGE_ACCESS | `access:assign` | MOD_Access | ✅ |
| `/permissions/temp-permissions` | MANAGE_ACCESS | `access:assign` | MOD_Access | ✅ |
| `/admin/functions` | MANAGE_CATALOG | `adm:manage_catalog` | MOD_Admin | ✅ |
| `/admin/groups` | MANAGE_CATALOG | `adm:manage_catalog` | MOD_Admin | ✅ |

### Gaps

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-E1 | Baja | `/logs/etl` y `/logs/etl/availability` usan `VIEW_LOGS` (`logs:view_app`) pero la spec tiene `view_pipeline_logs` (`logs:view_etl`) para ETL logs. El guard debería ser `VIEW_PIPELINE_LOGS`. |
| G-E2 | Baja | `/logs/infra`, `/logs/status`, `/logs/metrics` usan `VIEW_LOGS` porque las constantes granulares (`logs:view_infra`, `logs:view_health`, `logs:view_metrics`) no existen en `catalog.js`. Relacionado con G-A2. |
| G-E3 | Baja | `/reports/realtime` usa `VIEW_DASHBOARD` (`reports:dashboard`) — semánticamente debería ser `VIEW_METRICS` (`reports:kpis`) para `RealTimeMetricsPage`. |
| G-E4 | Baja | Ruta `/reports/saved` para UC_RPT_10 (`save_view`) inexistente. No hay página `SavedViewsPage` ni ruta. Relacionado con G-A1. |

---

## 8. Resumen consolidado de gaps

### Por severidad

| Severidad | Cantidad | IDs |
|-----------|---------|-----|
| CRÍTICO | 1 | G-B1 |
| ALTA | 2 | G-D1, G-D2 |
| MEDIA | 5 | G-A1, G-A3, G-A4, G-C1, G-C5, G-D3 |
| BAJA | 9 | G-A2, G-A5, G-B2, G-C2, G-C3, G-C4, G-E1, G-E2, G-E3, G-E4 |

### Por artefacto

| Artefacto | Gaps |
|-----------|------|
| `src/permissions/catalog.js` | G-A1..G-A5 |
| `src/pages/admin/FunctionCatalogPage.jsx` | G-B1 |
| `src/pages/admin/AGRCatalogPage.jsx` | G-B2 |
| `src/mocks/permissions.json` | G-C1..G-C5 |
| `src/mocks/mockInterceptor.js` | G-D1..G-D3 |
| `src/router/AppRouter.jsx` | G-E1..G-E4 |

### Lo que está BIEN (no tocar)

- `PermissionGate.tsx` — arquitectura correcta, 4 variantes, callbacks
- `usePermisos.ts` — caché + hasPermission correcto
- Notación `{modulo}:{accion}` en `capacidades` del mock — ✅ alineada con spec
- Todas las rutas admin (`/admin/functions`, `/admin/groups`) con `MANAGE_CATALOG` — ✅
- `src/services/accessService.js` — URL `/access/separation-rules` ya corregida
- `adminSlice.js` — thunks CRUD correctos
- Routes `/reports/scheduled`, `/reports/export`, `/permissions/*` — ✅

---

## 9. Prioridad de correcciones

### Tier 1 — Funcionalidad bloqueada (hacer primero)
1. **G-D1/G-D2:** Agregar handlers `GET /api/admin/functions/` y `GET /api/admin/agr/` al mockInterceptor con datos de muestra coherentes con el catálogo v5.6.0 (64 funciones activas, 12 AGRs activos)
2. **G-B1:** Corregir `CODENAME_REGEX` en `FunctionCatalogPage.jsx` a `/^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/` (formato `{modulo}:{accion}`)

### Tier 2 — Alineación con spec v5.6.0
3. **G-A3:** Eliminar o marcar como RESERVADO `VIEW_CALLS` y `PERFORM_CALLS` en `catalog.js`
4. **G-A4:** Agregar `CREATE_SEPARATION_RULE = 'adm:create_sod'` a `catalog.js`
5. **G-C1:** Alinear `capacidades` en `permissions.json` con la composición real de AGR-002+004 (eliminar `reports:schedule`, `access:view`, `logs:view_app`, `logs:search`, `pipeline:view_status`)

### Tier 3 — Mejoras de completitud
6. **G-A5:** Actualizar comentario de `catalog.js` de v5.4.0 a v5.6.0
7. **G-A2:** Agregar `VIEW_INFRA_LOGS`, `VIEW_SYSTEM_HEALTH`, `VIEW_TECHNICAL_METRICS` a `catalog.js`
8. **G-D3:** Agregar handlers POST/PATCH para admin/functions y admin/agr
9. **G-E1/G-E2:** Actualizar route guards de logs granulares
10. **G-C5:** Agregar escenario de usuario admin en `permissions.json`
