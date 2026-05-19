```yml
created_at: 2026-05-06 08:14:41
project: THYROX
work_package: 2026-05-06-08-10-48-rbac-permissions-mock-alignment
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# DISCOVER — RBAC Permissions Mock Alignment

## Resumen ejecutivo

El mock de permisos (`permissions.json`) y el catálogo de funciones del cliente
(`FunctionCatalog.js`) usan la notación `sistema.{domain}.{resource}.{action}` que
fue inventada para IACT-UI y no existe en la especificación real RBAC v5.4.0.
La especificación real usa `{module}:{action}` (ej: `reports:dashboard`,
`pipeline:view_status`). Adicionalmente, el mock incluye funciones que no existen
en el catálogo oficial (tickets, clientes) y grupos inventados (atencion_cliente,
visualizacion_metricas) en lugar de los AGR-001..012 del spec.

**Impacto directo:** Cuando el backend real se integre, todas las verificaciones
`hasPermission()` devolverán `false` porque las cadenas no coincidirán.

---

## Hallazgos de contexto

### H-001 — Sistema de permisos del lado cliente (PROVEN)

`hasPermission()` en `useFilteredNavLinks()` y `ProtectedRoute` compara strings:
```js
// usePermisos.ts:119
return capacidades.includes(capacidad);
```
FunctionCatalog constants se pasan directamente como el argumento `capacidad`.
El mock `permissions.json` provee las strings en el array `capacidades`.

Resultado: si `FunctionCatalog.VIEW_DASHBOARD = 'reports:dashboard'` y
`permissions.json.capacidades` no contiene `'reports:dashboard'`, la ruta
queda bloqueada para el usuario mock.

### H-002 — Notación de función: catálogo actual vs spec RBAC v5.4.0 (PROVEN)

| Catálogo actual | Spec v5.4.0 | Módulo spec |
|---|---|---|
| `sistema.vistas.dashboards.ver` | `reports:dashboard` | MOD_Reports |
| `sistema.analisis.metricas.ver` | `reports:kpis` | MOD_Reports |
| `sistema.analisis.reportes.ver` | `reports:view` | MOD_Reports |
| `sistema.analisis.reportes.exportar` | `reports:export_csv` | MOD_Reports |
| `sistema.operaciones.llamadas.ver` | `operator:answer` | MOD_Operator |
| `sistema.operaciones.llamadas.realizar` | `operator:dial_out` | MOD_Operator |
| `sistema.administracion.usuarios.ver` | `users:view` | MOD_Users |
| `sistema.administracion.usuarios.gestionar` | `users:create` | MOD_Users |
| `sistema.administracion.usuarios.editar` | `users:update` | MOD_Users |
| `sistema.administracion.usuarios.eliminar` | `users:deactivate` | MOD_Users |
| `sistema.administracion.acceso.ver` | `access:view` | MOD_Access |
| `sistema.administracion.acceso.gestionar` | `access:assign` | MOD_Access |
| `sistema.administracion.acceso.asignar` | `access:assign` | MOD_Access (dup!) |
| `sistema.administracion.acceso.sod` | `access:view_sod` | MOD_Access |
| `sistema.auditoria.logs.ver` | `audit:view` | MOD_Audit |
| `sistema.auditoria.logs.buscar` | `audit:search` | MOD_Audit |
| `sistema.auditoria.logs.exportar` | `audit:export` | MOD_Audit |
| `sistema.auditoria.compliance.ver` | `audit:compliance` | MOD_Audit |
| `sistema.alertas.notificaciones.ver` | `alerts:view` | MOD_Alerts |
| `sistema.alertas.notificaciones.gestionar` | `alerts:configure` | MOD_Alerts |
| `sistema.administracion.grupos.gestionar` | `access:create_group` | MOD_Access |
| `sistema.administracion.catalogo.gestionar` | `adm:manage_catalog` | MOD_Admin |
| `sistema.observabilidad.logs.ver` | `logs:view_app` | MOD_Logs |
| `sistema.administracion.sod.gestionar` | `access:update_sod` | MOD_Access |
| `sistema.observabilidad.pipeline.ver` | `pipeline:view_status` | MOD_Pipeline |
| `sistema.observabilidad.pipeline.reintentar` | `pipeline:retry` | MOD_Pipeline |
| `sistema.analisis.reportes.programar` | `reports:schedule` | MOD_Reports |
| `sistema.analisis.reportes.compartir` | `reports:share` | MOD_Reports |
| `sistema.administracion.permisos.auditoria` | `access:view` | MOD_Access (dup de VIEW_ACCESS!) |

### H-003 — Funciones inventadas sin equivalente en RBAC v5.4.0 (PROVEN)

Las siguientes están en `FunctionCatalog.js` pero NO existen en el catálogo oficial:

| Constante | Valor actual | Estado |
|---|---|---|
| `VIEW_TICKETS` | `sistema.operaciones.tickets.ver` | **NO existe en spec** |
| `CREATE_TICKETS` | `sistema.operaciones.tickets.crear` | **NO existe en spec** |
| `EDIT_TICKETS` | `sistema.operaciones.tickets.editar` | **NO existe en spec** |
| `VIEW_CLIENTS` | `sistema.operaciones.clientes.ver` | **NO existe en spec** |
| `VIEW_REALTIME_METRICS` | `sistema.analisis.metricas_tiempo_real.ver` | **NO existe en spec** |
| `SUPER_ADMIN` | `sistema.administracion.sistema.superadmin` | **NO existe en spec** |
| `VIEW_CONFIG` | `sistema.configuracion.parametros.ver` | **NO existe en spec** |
| `EDIT_CONFIG` | `sistema.configuracion.parametros.editar` | **NO existe en spec** |
| `MANAGE_ACCESS` | duplica `ASSIGN_FUNCTIONS` → ambos `access:assign` | **Duplicado** |
| `VIEW_PERMISSIONS_AUDIT` | `sistema.administracion.permisos.auditoria` | **Duplica VIEW_ACCESS** |
| `VIEW_METRICS` | `sistema.analisis.metricas.ver` | **Debería ser `reports:kpis`** |

**Nota sobre SUPER_ADMIN y VIEW_CONFIG:** No están en RBAC v5.4.0, pero
AppRouter.jsx los usa para las rutas `/admin` y `/settings`. Necesitan tratamiento
especial al alinear (ver sección de decisiones pendientes).

### H-004 — Funciones spec v5.4.0 no representadas en FunctionCatalog (PROVEN)

Las siguientes funciones del catálogo oficial NO están en `FunctionCatalog.js`:

**MOD_Reports (faltantes):**
- `reports:filter` (filter_reports)
- `reports:export_excel`, `reports:export_pdf` (exportación granular)
- `reports:charts` (view_charts)
- `reports:save_view` (save_view)

**MOD_Users (faltantes):**
- `users:list`, `users:search`, `users:block`, `users:unblock`, `users:reactivate`

**MOD_Access (faltantes):**
- `access:revoke`, `access:assign_group`, `access:revoke_group`
- `access:grant_exceptional`, `access:revoke_exceptional`
- `access:assign_to_group`, `access:disable_sod`

**MOD_Alerts (faltantes):**
- `alerts:config_team`, `alerts:pause`, `alerts:disable`, `alerts:history`
- `alerts:acknowledge`, `alerts:subscribe`, `alerts:unsubscribe`, `alerts:config_severity`

**MOD_Logs (faltantes):**
- `logs:export`, `logs:search`
- `logs:view_etl`, `logs:view_infra`, `logs:view_health`, `logs:view_metrics`

**MOD_Auth (completo — no en AppRouter pero relevante):**
- `auth:view_own_sessions`, `auth:close_session`, `auth:reset_password`, `auth:view_all_sessions`

**MOD_Operator (completo — necesario para Operator Dashboard UC-OPR-08):**
- `operator:agent_state`, `operator:answer`, `operator:dial_out`, `operator:hold`
- `operator:transfer`, `operator:disposition`, `operator:break`
- `operator:own_dashboard`, `operator:own_history`, `operator:mailbox`

**MOD_Supervision (completo):**
- `supervision:monitor`, `supervision:barge_in`, `supervision:broadcast`

**MOD_Pipeline (faltantes):**
- `pipeline:view_errors`, `pipeline:availability`

**MOD_Admin (faltantes):**
- `adm:create_sod`

### H-005 — Grupos de funciones mock vs spec (PROVEN)

`permissions.json` tiene grupos inventados:
```json
"grupos": [
  { "id": 1, "codigo": "atencion_cliente", ... },
  { "id": 2, "codigo": "visualizacion_metricas", ... }
]
```

Grupos reales RBAC v5.4.0 (12 AGRs):
- AGR-001 `basic_operator_group` — visualización básica
- AGR-002 `report_viewer_group` — análisis sin exportación (8 funciones)
- AGR-003 `quality_supervisor_group` — análisis + filtros
- AGR-004 `data_exporter_group` — exportación autorizada
- AGR-005 `alert_manager_group` — gestión completa alertas
- AGR-006 `user_admin_group` — administración de identidades
- AGR-007 `permission_admin_group` — gestión RBAC
- AGR-008 `auditor_group` — solo auditoría
- AGR-009 `pipeline_admin_group` — supervisión ETL
- AGR-010 `system_admin_group` — administración técnica
- AGR-011 `call_center_operator_group` — acciones operativas agente
- AGR-012 `call_center_supervisor_group` — supervisión tiempo real

**Persona mock correcta:** `maria.garcia` como analista → AGR-002 (`report_viewer_group`)
con capacidades: `auth:view_own_sessions`, `auth:view_all_sessions`, `reports:view`,
`reports:dashboard`, `reports:kpis`, `reports:charts`, `reports:filter`, `users:view`.

### H-006 — Test catalog.test.js bloquea migración de notación (PROVEN)

`catalog.test.js` valida que TODOS los valores sigan `sistema.{domain}.{resource}.{action}`:
```js
it.each(entries)('%s follows sistema.{domain}.{resource}.{action} format', (key, value) => {
    const parts = value.split('.');
    expect(parts.length).toBe(4);
    expect(parts[0]).toBe('sistema');
});
```
Y hardcodea dos valores:
```js
expect(FunctionCatalog.VIEW_ACCESS).toBe('sistema.administracion.acceso.ver');
expect(FunctionCatalog.VIEW_AUDIT).toBe('sistema.auditoria.logs.ver');
```

Este test DEBE actualizarse junto con `FunctionCatalog.js`.

### H-007 — PermissionGate.tsx tiene docstrings con notación vieja (PROVEN)

`src/components/PermissionGate.tsx` tiene JSDoc con ejemplos `sistema.vistas.dashboards.ver`.
Son comentarios, no afectan runtime, pero generan confusión. Deben actualizarse.

### H-008 — Duplicados en FunctionCatalog (PROVEN)

- `MANAGE_ACCESS` y `ASSIGN_FUNCTIONS` ambos apuntan a `access:assign` en spec
- `VIEW_ACCESS` y `VIEW_PERMISSIONS_AUDIT` ambos apuntan a `access:view` en spec

Los duplicados deben resolverse: mantener el más semántico y eliminar el alias.

---

## Inventario de archivos a modificar

| Archivo | Tipo de cambio | Impacto test |
|---|---|---|
| `src/permissions/catalog.js` | Reescribir notaciones, añadir funciones spec, eliminar inventadas | Sí — catalog.test.js |
| `src/mocks/permissions.json` | Reemplazar grupos inventados, reemplazar capacidades | Sí — si tests usan strings |
| `src/permissions/__tests__/catalog.test.js` | Actualizar validación de formato + valores hardcoded | Test file mismo |
| `src/components/PermissionGate.tsx` | Actualizar ejemplos JSDoc (solo comentarios) | No — solo docs |

**AppRouter.jsx:** NO requiere cambio — usa constantes FunctionCatalog, no strings directas.
**useFilteredNavLinks.js:** NO requiere cambio — recibe constantes desde AppRouter.
**ProtectedRoute.jsx:** NO requiere cambio — recibe prop `permission` que es constante.

---

## Decisiones pendientes (gate humano)

### DP-001 — SUPER_ADMIN y VIEW_CONFIG no están en spec

AppRouter.jsx usa `FunctionCatalog.SUPER_ADMIN` para `/admin` y
`FunctionCatalog.VIEW_CONFIG` para `/settings`.

Opciones:
- **A (pragmática):** Mantener como constantes extra-spec con notación `admin:super`
  y `config:view` (misma forma module:action pero módulos no en catálogo oficial).
  La UI sigue funcionando; se documenta como "extensiones UI no en RBAC backend".
- **B (estricta):** Eliminar rutas `/admin` y `/settings` de AppRouter hasta que
  el spec las formalice.
- **C (mapeado):** Mapear SUPER_ADMIN → `adm:manage_catalog` (admin_sistema tier) y
  VIEW_CONFIG → alguna función existente de MOD_Admin.

### DP-002 — Funciones inventadas usadas en rutas (VIEW_TICKETS, VIEW_CLIENTS, etc.)

Ninguna ruta en AppRouter.jsx usa `VIEW_TICKETS`, `CREATE_TICKETS`, `EDIT_TICKETS`,
`VIEW_CLIENTS`. Solo existen en el catálogo pero no en AppRouter.

Opciones:
- **A (limpieza):** Eliminar del catálogo — no causan daño al routing.
- **B (reserva):** Mantener como `DEPRECATED` comentados — podría ser tickets v2.

### DP-003 — Alcance de capacidades en permissions.json

¿Qué perfil mock más completo conviene?

- **A (analista básico):** AGR-002 solamente (8 funciones) — acceso limitado para demo
- **B (data analyst):** AGR-002 + AGR-004 (exportación) — demo con más features
- **C (supervisor completo):** AGR-003 + AGR-004 + AGR-005 — demo completo

---

## Stakeholders / actores identificados

- **Desarrolladores IACT-UI** — consumidores directos de FunctionCatalog y permissions.json
- **Backend RBAC** — fuente de verdad que retornará capacidades en notación spec
- **QA** — 1602 tests que no deben romper

---

## Riesgos preliminares

| ID | Riesgo | Probabilidad | Impacto |
|---|---|---|---|
| R-001 | Tests que hardcodean strings `sistema.X` rompen | Alta | Alto |
| R-002 | AppRouter rutas a /admin y /settings sin capacidad en spec | Alta | Medio |
| R-003 | Renaming constantes rompe consumers no encontrados | Media | Alto |
| R-004 | permissions.json persona mock pierde acceso a features existentes | Media | Medio |

---

## Alcance propuesto (para gate humano)

**In scope:**
1. `FunctionCatalog.js` — migrar notación `sistema.X.Y.Z` → `module:action` para todos los mappings confirmados; añadir funciones spec faltantes relevantes para rutas existentes
2. `permissions.json` — reemplazar grupos inventados → AGR reales; reemplazar capacidades → strings spec
3. `catalog.test.js` — actualizar format validator y valores hardcoded
4. `PermissionGate.tsx` — actualizar ejemplos JSDoc (solo comentarios)

**Out of scope (depende de DP-001..003):**
- Implementar rutas para MOD_Operator (UC-OPR-*) — WP separado
- Cambiar AppRouter.jsx estructura de rutas
- Implementar refresh de permisos desde backend real
