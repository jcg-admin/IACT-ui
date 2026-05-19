```yml
created_at: 2026-05-05 14:08:34
project: IACT-UI
work_package: 2026-05-05-14-08-34-rbac-access-alignment
phase: Phase 1 — DISCOVER
author: claude
status: Aprobado
version: 2.0.0
```

# DISCOVER — RBAC Access Module Alignment

## Fuente del análisis

Análisis externo aportado por el usuario en dos entregas, referenciando
CIA-RBAC-002, CNST-033 y DEC-001. Estos identificadores no existen como
documentos formales en el repo — son convenciones de diseño del backend
IACT que impactan al frontend.

## Infraestructura RBAC existente (PROVEN)

Antes de los hallazgos: el sistema YA tiene implementados:

- `src/components/ProtectedRoute.tsx` — ProtectedRoute completo con variantes
  (single permission, Any, All). Usa `usePermisos().hasPermission(permission)`.
- `src/components/PermissionGate.tsx` — PermissionGate completo con render
  props y variantes.
- `src/hooks/usePermisos.ts` — Hook que obtiene capacidades del backend vía
  `PermisosClient` y expone `hasPermission(capacidad: string)`.
- Notación de capacidades: `sistema.{dominio}.{recurso}.{accion}`
  (ejemplo: `sistema.vistas.dashboards.ver`)

El análisis externo que propone crear `src/permissions/ProtectedRoute.jsx`
desde cero es incorrecto — el componente ya existe y funciona. Lo que falta
es: wiring en `AppRouter.jsx` y `FunctionCatalog` como registro de
constantes de capacidades.

## Planos de cambio: dependientes vs independientes

| Plano | Archivos | Depende del backend |
|-------|----------|---------------------|
| A — Contrato API | `permissions.json`, `PermissionsService.js` | SÍ — Django debe cambiar primero |
| B — SoD codenames | `FunctionSelector.jsx` | SÍ — necesita codenames reales del catálogo |
| C — Nomenclatura | `accessService.js`, `accessSlice.js` | NO |
| D — Router RBAC | `AppRouter.jsx`, `src/permissions/catalog.js` | NO — usa capacidades ya disponibles |

## Hallazgos detallados

### H-01 — SoD regex vs predicados (CRÍTICO — OBSERVABLE)

**Archivo:** `src/components/access/FunctionSelector.jsx:15-21`

```js
// Actual — regex contra function_id (PIP-*, AUD-*)
const SOD_RULES = {
    'SOD-001': { setA: /^PIP-/, setB: /^AUD-/ },
};
// detectConflicts evalúa contra func.code — que será un codename como
// 'view_pipeline_status', nunca 'PIP-001'. Reglas silenciosamente rotas.
```

Fix especificado por el análisis externo:
```js
// Correcto — predicados sobre codenames
const SOD_RULES = {
    'SOD-001': {
        setA: (codename) =>
            codename.startsWith('view_pipeline') ||
            codename.startsWith('view_data') ||
            codename.startsWith('request_pipeline'),
        setB: (codename) =>
            codename.startsWith('view_audit') ||
            codename.startsWith('search_audit') ||
            codename.startsWith('export_audit') ||
            codename.startsWith('generate_compliance'),
        desc: 'pipeline_audit_separation',
    },
};
```

### H-02 — Categorías en español (MEDIA — OBSERVABLE)

**Archivo:** `src/components/access/FunctionSelector.jsx:8-16`

```js
// Actual — keys en español
USUARIO: 'Usuarios', AUDITORIA: 'Auditoria', ACCESO: 'Control de Acceso'

// Correcto — keys en inglés, labels descriptivos
USERS: 'Users', AUDIT: 'Audit', ACCESS: 'Access Control'
```

### H-03 — PermissionsService contrato backend (FALSA ALARMA — INFERRED)

Verificado contra `src/mocks/permissions.json`: el backend Django sirve
`funciones_accesibles`, `nombre`, `dominio`, `icono`. El servicio normaliza
correctamente a `code`, `domain`, `icon`.

**Cuando el backend cambie** (Plano A — backend dependency):
- Mock: `funciones_accesibles` → `accessible_functions`, `nombre` → `name`
- Service: adaptar `normalizePermissions` para leer campos en inglés
- Este es un cambio coordinado backend+frontend, no solo frontend.

**Acción ahora:** No tocar. Documentar como deuda técnica coordinada.

### H-04 — functionId ambigüedad (ALTA — OBSERVABLE)

**Archivo:** `src/redux/slices/accessSlice.js:38-49`

`functionId` en `assignFunction` thunk es el `id` numérico del catálogo
(operación de asignación UC_ACC_01). No es el codename (operación de
autorización en runtime). El parámetro debe llamarse `catalogId` para
distinguir los dos planos.

### H-05 — groupers vs function_groups (MEDIA — OBSERVABLE)

**Archivo:** `src/services/accessService.js:111-145`

Métodos y endpoints usan `groupers` / `grouperId`. El término canónico
del sistema es `function_group`. Fix: renombrar métodos y endpoints.

### H-06 — AppRouter sin ProtectedRoute (ALTA — OBSERVABLE)

`AppRouter.jsx` no usa `ProtectedRoute` ni `PermissionGate`. Las rutas
`/dashboard`, `/profile`, `/settings` son públicas. No hay rutas para el
módulo Access (ITER4: UC_ACC_01–09).

Fix: crear `src/permissions/catalog.js` con constantes de capacidades en
notación `sistema.*.*.*`, y aplicar `ProtectedRoute` en AppRouter para las
rutas que lo requieran.

## Mapa de implementación

```
Independientes (implementar ahora):
  C1. accessService.js   — groupers → function_groups
  C2. accessSlice.js     — functionId → catalogId + comentario invariante
  D1. catalog.js (nuevo) — FunctionCatalog con capacidades sistema.*.*.*
  D2. AppRouter.jsx      — ProtectedRoute + rutas Access module

Backend-dependientes (documentar, no implementar):
  A1. permissions.json   — campos en inglés (coordinar con Django)
  A2. PermissionsService — simplificar normalización
  B1. FunctionSelector   — SoD predicados + categorías inglés
      (los predicados deben coincidir con codenames reales del catálogo
       que retorna GET /api/access/functions — endpoint sin mock aún)
```

**Nota sobre H-01/B1:** El fix de FunctionSelector depende de conocer los
codenames reales que retorna el catálogo de funciones. El mock actual de
`permissions.json` es para el endpoint del usuario autenticado, no para el
catálogo de administración. Implementar los predicados SoD con los codenames
especificados por el análisis externo y marcar como INFERRED hasta que el
backend confirme el catálogo completo.
