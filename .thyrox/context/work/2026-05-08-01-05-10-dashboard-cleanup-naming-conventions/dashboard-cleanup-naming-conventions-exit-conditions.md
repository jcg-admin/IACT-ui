```yml
created_at: 2026-05-08 01:05:10
project: IACT-UI
work_package: 2026-05-08-01-05-10-dashboard-cleanup-naming-conventions
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Exit Conditions — dashboard-cleanup-naming-conventions

## Condiciones de éxito del WP

El WP se considera completo cuando TODAS las siguientes condiciones son verdaderas:

### EC-01: Dashboard sin mock hardcodeado

- [ ] `dashboardSlice.js` no contiene ningún import de `@mocks/dashboardData`
- [ ] `dashboardSlice.js` no contiene ninguna llamada a `getMockDashboardData()`
- [ ] `Dashboard.jsx` obtiene datos reales (via `reportsSlice` o endpoint conectado)
- [ ] `useDashboard.js` no despacha thunks que llamen a mock data

```bash
# Verificación
grep -rn "getMockDashboardData" src/ | grep -v "\.test\." | grep -v "__tests__"
# Resultado esperado: 0 líneas
```

### EC-02: HAL-2 — `AlertManager` renombrado

- [ ] Clase `AlertManager` renombrada a `AlertsGateway` (o nombre aprobado en Phase 3)
- [ ] Archivo `alertManager.js` renombrado a `alertsGateway.js`
- [ ] `alertsSlice.js` actualizado con el nuevo import path
- [ ] `services/index.js` actualizado si re-exportaba por nombre antiguo
- [ ] Archivo de test renombrado a `alertsGateway.test.js`

```bash
grep -rn "alertManager\|AlertManager" src/ | grep -v "node_modules"
# Resultado esperado: 0 líneas
```

### EC-03: HAL-3 — `CSRFManager` / `CSPHelper` renombrados internamente

- [ ] `CSRFManager` renombrado a nombre aprobado en Phase 3 dentro de `securityService.js`
- [ ] `CSPHelper` renombrado a nombre aprobado en Phase 3 dentro de `securityService.js`
- [ ] Las instancias exportadas (`csrfManager`, `cspHelper`) mantienen sus nombres de
  variable de instancia (renaming solo de la clase, no de la instancia exportada —
  para no romper consumidores en `services/index.js`)

### EC-04: HAL-4 — Variables de una sola letra corregidas

- [ ] `UserManagement.jsx:46` — `const q` → `const searchQuery`
- [ ] `AGRCatalogPage.jsx:42` — `const q` → `const searchQuery`
- [ ] `FunctionCatalogPage.jsx:42` — `const q` → `const searchQuery`
- [ ] `ExportPage.jsx:50` — `const a` → `const downloadLink`
- [ ] `AccessAuditPage.jsx:108` — `const a` → `const downloadLink`
- [ ] `AlertHistoryPage.jsx:76` — `const a` → `const downloadLink`
- [ ] `UniqueClientsReportPage.jsx:75` — `const v` → variable descriptiva aprobada en Phase 3

```bash
grep -rn "const [qav] " src/components src/pages | grep -v "node_modules" | grep -v "\.test\."
# Resultado esperado: 0 líneas (solo los en iteradores, que no aparecen así)
```

### EC-05: HAL-5 — Archivos con sufijos prohibidos renombrados

- [ ] `src/services/utils/cloneUtils.js` → `cloneDeep.js` (o nombre aprobado)
- [ ] Todos los imports de `cloneUtils` actualizados (3 consumidores)
- [ ] `src/utils/reportShareUtils.js` → `reportShareUrl.js`
- [ ] `src/components/features/SessionManagement/SessionManager.jsx` → `SessionProvider.jsx` (o nombre aprobado en Phase 3)
- [ ] `src/components/features/SessionManagement/index.js` re-export actualizado
- [ ] `src/components/pages/Analytics/ReportBuilder.jsx` → `CustomReportForm.jsx` (o nombre aprobado)
- [ ] `src/components/pages/Analytics/AnalyticsDashboard.jsx` import actualizado

### EC-06: Tests verdes — sin regressions

- [ ] `npm test -- --watchAll=false` retorna 1825+ tests passing, 0 failing
- [ ] No hay imports rotos de archivos renombrados
- [ ] No hay referencias a clases o funciones con nombres anteriores en código de producción

### EC-07: Deuda sistémica documentada (no resuelta)

- [ ] TD-NM-001..006 creados en backlog de deuda técnica (naming sistémico de HAL-6)
- [ ] Cada TD tiene descripción, cantidad de archivos afectados, y WP sugerido

---

## Condiciones fuera de scope (no son exit conditions)

Las siguientes violaciones del doc `CLEAN_CODE_NAMING_PRINCIPLES — Frontend` fueron
identificadas pero excluidas explícitamente de este WP:

| Exclusión | Razón | TD |
|-----------|-------|-----|
| Renombrar 56 archivos `*Page.jsx` | Requiere WP dedicado con análisis de router | TD-NM-001 |
| Renombrar 16 archivos `*Slice.js` | Requiere actualización masiva de imports + tests | TD-NM-002 |
| Renombrar 20 archivos `*Service.js` | Afecta todos los imports del codebase | TD-NM-003 |
| Cambiar aliases de Webpack | Requiere actualizar jest.config.cjs + todos los imports `@components`, `@utils` | TD-NM-004 |
| Hooks con nombre técnico (`useAuth`, `useAPI`, etc.) | Afecta componentes que los consumen + tests | TD-NM-005 |
| Acrónimos en identifiers (`Auth`, `API`, `RBAC`) | Spread masivo en codebase | TD-NM-006 |
