```yml
created_at: 2026-05-05 17:39:20
project: IACT-UI
work_package: 2026-05-05-17-39-20-test-suite-baseline-fix
phase: Phase 8 — PLAN EXECUTION
author: claude
status: Borrador
```

# Task Plan — Test Suite Baseline Fix

Objetivo: 0 suites fallando. 3 fixes atómicos + commit.

---

## F-01 — catalog.js: VIEW_REALTIME_METRICS segmentos extra

- [x] **F-01** `src/permissions/catalog.js` línea 60:
  - Cambiar `'sistema.analisis.metricas.tiemporeal.ver'`
  - → `'sistema.analisis.metricas_tiempo_real.ver'`
  - Tests verdes: `catalog.test.js`

---

## F-02 — userSlice: añadir campos de sesión

- [x] **F-02** `src/redux/slices/userSlice.js`:
  - Añadir al `initialState`: `isAuthenticated: false, user: null`
  - Actualizar `setUser` reducer: `state.isAuthenticated = true; state.user = action.payload`
  - Actualizar `logout` reducer: `state.isAuthenticated = false; state.user = null`
  - Tests verdes: `Redux.test.js`, `AppIntegration.test.js`

---

## F-03 — DashboardLayout.test.js: añadir Provider

- [x] **F-03** `__tests__/layouts/DashboardLayout.test.js`:
  - Importar `configureStore` + `Provider` + slices necesarios
  - Crear `renderWithProviders(component)` que envuelva con `Provider` + `BrowserRouter`
  - Reemplazar todas las llamadas `renderWithRouter` por `renderWithProviders`
  - Tests verdes: `DashboardLayout.test.js`

---

## Commit final

- [x] Commit con checkboxes actualizados y push
