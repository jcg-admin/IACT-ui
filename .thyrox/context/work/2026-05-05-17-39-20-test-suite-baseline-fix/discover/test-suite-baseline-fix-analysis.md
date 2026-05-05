```yml
created_at: 2026-05-05 17:39:20
project: IACT-UI
author: claude
status: Aprobado
```

# DISCOVER — Test Suite Baseline Fix

## Contexto

Sprint 2 completado con 916/939 tests GREEN. Quedan 4 test suites con 23
failures que son pre-existentes al Sprint 2 (verificado con git stash).
Este WP las resuelve para llevar la base a 0 suites fallando.

## Síntomas observados (PROVEN)

```
FAIL src/permissions/__tests__/catalog.test.js     — 1 failure
FAIL __tests__/integration/AppIntegration.test.js  — 6 failures
FAIL __tests__/integration/Redux.test.js           — 4 failures
FAIL __tests__/layouts/DashboardLayout.test.js     — 15 failures (aprox)
```

Verificación: `npx jest --no-coverage` → 4 suites fallando, 23 failures.

## Causa raíz por suite

### 1. `catalog.test.js` — Permiso con segmentos extra

```
Expected: 4 parts
Received: 5 parts
Value: 'sistema.analisis.metricas.tiemporeal.ver'
```

`VIEW_REALTIME_METRICS` tiene 5 segmentos dot-separated.
El contrato del catalog exige exactamente 4: `sistema.{domain}.{resource}.{action}`.
Fix: consolidar `metricas.tiemporeal` → `metricas_tiempo_real`.

### 2. `DashboardLayout.test.js` — Falta Provider Redux

`DashboardLayout` usa `useDispatch()` internamente pero el test solo envuelve
con `BrowserRouter`. Sin `<Provider store={}>`, React-Redux lanza error.
Fix: agregar `configureStore` + `Provider` en el test wrapper.

### 3. `Redux.test.js` + `AppIntegration.test.js` — `userSlice` sin campos de auth

Los tests esperan en `state.user`:
- `isAuthenticated: false`
- `user: null`

El `userSlice.js` actual tiene estado `{ users[], loading, error, total }`.
Los actions `setUser` y `logout` existen pero no gestionan `isAuthenticated`/`user`.
Fix: añadir esos campos al initial state y actualizar los reducers correspondientes.

## Decisiones arquitectónicas

**ADR-1 (INFERRED — aplicar patrón existente):**
`userSlice` es el slice de lista de usuarios (CRUD, paginación).
`authSlice` debería ser el slice de sesión (isAuthenticated, currentUser).
Sin embargo, los tests de integración importan `userReducer` esperando campos de auth,
y `authSlice.js` existe separado. La solución menos disruptiva es agregar los campos
`isAuthenticated` y `user` (current user session) al `userSlice` como campos ortogonales —
no duplicar el auth state sino extenderlo. Mantiene retrocompat con los tests de userSlice
existentes (que solo prueban `users[]`).

**Alternativa descartada:** Actualizar los tests de integración para importar `authSlice`.
Riesgo: introduce más cambios en código de tests. Los tests de integración son contrato
estable — la implementación debe adaptarse.

## Scope

| Fix | Archivo | Tipo |
|-----|---------|------|
| F-01 | `src/permissions/catalog.js` | 1 línea |
| F-02 | `src/redux/slices/userSlice.js` | +4 líneas initial state + reducers |
| F-03 | `__tests__/layouts/DashboardLayout.test.js` | +Provider wrapper |

## Criterios de éxito

- 0 test suites fallando
- 939/939 tests (o más) GREEN
- No regresiones en las 106 suites que ya pasan
