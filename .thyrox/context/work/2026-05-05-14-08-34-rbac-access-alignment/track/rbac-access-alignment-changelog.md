```yml
created_at: 2026-05-05 14:08:34
updated_at: 2026-05-05 14:25:00
project: IACT-UI
work_package: 2026-05-05-14-08-34-rbac-access-alignment
phase: Phase 10 — EXECUTE
author: claude
status: En progreso
```

# Changelog — rbac-access-alignment

## Added

- `src/permissions/catalog.js` — FunctionCatalog con ~25 constantes de capacidades
  en notación `sistema.{dominio}.{recurso}.{accion}`, alineadas con el mock
  `permissions.json` y el backend Django (H-06).

## Changed

- `src/components/access/FunctionSelector.jsx` — SoD rules cambiadas de regex
  `/^PIP-/` (silenciosamente rotas) a predicados `(codename) => codename.startsWith(...)`
  que operan sobre codenames reales del catálogo RBAC (H-01).
- `src/components/access/FunctionSelector.jsx` — Claves de FUNCTION_CATEGORIES
  cambiadas de español (USUARIO, AUDITORIA, ACCESO, CONFIGURACION) a inglés
  (USERS, AUDIT, ACCESS, CONFIG) — labels de UI sin cambios (H-02).
- `src/redux/slices/accessSlice.js` — Parámetro `functionId` en thunk
  `assignFunction` renombrado a `catalogId` con comentario de invariante que
  distingue el plano de catálogo (asignación UC_ACC_01) del plano de codename
  (autorización en runtime) (H-04).
- `src/services/accessService.js` — Métodos `getGroupers()` y `assignGrouper()`
  renombrados a `getFunctionGroups()` y `assignFunctionGroup()`. Endpoints
  `access/groupers` → `access/function-groups` (H-05).
- `src/router/AppRouter.jsx` — Rutas `/dashboard`, `/settings`, `/access/*`,
  `/audit/*`, `/alerts/*` protegidas con `ProtectedRoute` usando constantes
  del FunctionCatalog. Rutas para módulos ITER4/5/6 agregadas. Ruta
  `/access-denied` agregada (H-06).

## Aceptado / no fixeado

- `src/services/permissions/PermissionsService.js` — El servicio mapea campos
  del backend en español (`funciones_accesibles`, `nombre`, `dominio`) a campos
  ingleses en el frontend. El análisis externo lo marcó como violación pero es
  el patrón adaptador correcto — el backend Django sirve en español (verificado
  contra el mock). No se toca. El fix vendrá cuando el backend cambie su
  contrato (coordinar con equipo Django) (H-03).

## Pendiente (backend-dependent)

- `src/mocks/permissions.json` — Cambiar `funciones_accesibles` → `accessible_functions`,
  `nombre` → `name`, `dominio` → `domain`, etc. Solo cuando el backend cambie.
- `src/services/permissions/PermissionsService.js` — Simplificar normalización
  una vez el contrato sea en inglés.
- `src/components/access/FunctionSelector.jsx` — Predicados SoD deben verificarse
  contra el catálogo real de funciones (GET /api/access/functions) cuando el
  backend implemente DEC-001. Los codenames usados actualmente son INFERRED.

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Candidato a versión minor.
