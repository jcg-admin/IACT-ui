```yml
created_at: 2026-05-05 14:31:45
project: IACT-UI
work_package: 2026-05-05-14-31-45-rbac-access-tdd-coverage
phase: Phase 1 — DISCOVER
author: claude
status: Aprobado
version: 1.0.0
```

# DISCOVER — RBAC Access TDD Coverage

## Objetivo / Por qué

El WP `rbac-access-alignment` implementó 6 correcciones (H-01..H-06) en el módulo
RBAC sin tests. La auditoría (`audit-report`) reveló:
- 0 tests para FunctionSelector, accessSlice (access), accessService, FunctionCatalog
- AppRouter con cobertura shallow (sin comportamiento real de ProtectedRoute)
- 0 tests para las 3 páginas de acceso que dispatch thunks

El usuario también pide **clean code** como principio transversal: TDD como motor
de refactoring además de verificación.

## Contexto del usuario final

**Rol:** Desarrolladores del equipo IACT que mantienen el módulo RBAC.
**Qué quieren lograr:** Tests que sirvan como documentación viva y red de seguridad
para futuros cambios en el módulo de acceso.
**Restricción clave:** No romper los 97/97 tests existentes. TDD estricto — test
rojo primero, clean code durante.

## Stakeholders

| Stakeholder | Necesidad |
|-------------|-----------|
| Desarrolladores IACT | Tests legibles que expliquen el comportamiento esperado |
| Equipo QA | Cobertura verificable en CI/CD |
| Usuario final | Sistema RBAC que funcione correctamente en runtime |

## Inventario de cobertura (PROVEN — verificado con find)

| Archivo | Tests actuales | Comportamiento sin cubrir |
|---------|---------------|--------------------------|
| `FunctionSelector.jsx` | ❌ ninguno | SoD predicados, toggle, conflictos, categorías |
| `accessSlice.js` | ❌ ninguno | catalogId en thunks, reducers, selectors |
| `accessService.js` | ❌ ninguno | getFunctionGroups, endpoints, método renombrado |
| `catalog.js` | ❌ ninguno | constantes de FunctionCatalog, formato sistema.*.*.* |
| `AppRouter.jsx` | ⚠️ shallow | ProtectedRoute guarda rutas, /access-denied, rutas ITER4/5/6 |
| `AssignFunctionsPage.jsx` | ❌ ninguno | dispatch con catalogId, flujo SoD |
| `PermissionsPage.jsx` | ❌ ninguno | revoke con catalogId, confirmación |
| `TemporaryPermissionsPage.jsx` | ❌ ninguno | assign temporal con catalogId |

## Smells de clean code detectados (PROVEN)

Identificados al leer el código antes de escribir tests:

| Archivo | Smell | Corrección TDD |
|---------|-------|----------------|
| `FunctionSelector.jsx` | `selectedCodes` contiene codenames, no "codes" | Renombrar → `selectedCodenames` |
| `FunctionSelector.jsx` | `getFilteredFunctions` itera FUNCTION_CATEGORIES con `_` como ignorado | Limpiar variable muda |
| `accessSlice.js` | Un solo `loading` boolean para múltiples operaciones async → race condition silenciosa | Separar `loadingOp` por acción o dejar documentado |
| `accessService.js` | Token leído con `localStorage.getItem` en cada método → duplicación | Extraer `getAuthHeaders()` helper privado |
| `AppRouter.jsx` | Lazy pages con `Promise.resolve({default: () => ...})` inline → verboso | Extraer a constantes con nombre descriptivo |

## Atributos de calidad

- **Legibilidad:** Cada test describe un comportamiento en lenguaje humano (Given/When/Then implícito)
- **Aislamiento:** Mocks de servicios/store en cada suite — sin dependencias cruzadas
- **Velocidad:** Tests unitarios sin DOM real donde posible; RTL para componentes

## Fuera de alcance

- Tests E2E (Cypress/Playwright)
- Tests de `PermissionsService.js` (backend-contract dependent — H-03 diferido)
- Tests de páginas ITER5 (Alerts) e ITER6 (Audit) — no modificadas en este WP

## Criterios de éxito

1. Cada archivo del scope tiene al menos una suite de tests
2. Los SoD predicados de FunctionSelector tienen tests parametrizados
3. Los thunks de accessSlice verifican que `catalogId` llega al service
4. `FunctionCatalog` verifica el formato `sistema.*.*.*` de todas las constantes
5. AppRouter verifica redirección a `/access-denied` sin permiso
6. Los smells de clean code identificados están corregidos
7. `npm test` sigue en 97+ suites / 771+ tests pasando

## Mapa epistémico

| Categoría | Claims |
|-----------|--------|
| **PROVEN** | 8 archivos sin suite de tests (verificado con `find`) · 5 smells detectados (lectura directa del código) · 97/97 tests actuales (npm test) |
| **INFERRED** | El smell de `loading` boolean compartido causa race conditions bajo carga concurrente (no observable en tests síncronos pero es un invariant violation conocido de RTK) |
| **SPECULATIVE** | Los tests de páginas de acceso revelarán más smells en el manejo de errores |

**Ratio de calibración:** 7 PROVEN + 1 INFERRED / 9 total = 89% ✓

## Stopping Point Manifest

| ID | Fase | Tipo | Evento | Acción requerida |
|----|------|------|--------|-----------------|
| SP-01 | 1→8 | gate-fase | DISCOVER completo | Usuario aprueba análisis → iniciar PLAN EXECUTION |
| SP-02 | 8→10 | gate-fase | Task plan listo | Usuario aprueba T-NNN → iniciar EXECUTE |
| SP-03 | 10→11 | gate-operacion | Todos los T-NNN `[x]` | Ejecutar `validate-phase-completion.sh` |
| SP-04 | 11→12 | gate-fase | TRACK completo | Usuario decide cerrar WP o abrir fixes |
