```yml
created_at: 2026-05-05 14:31:45
project: IACT-UI
work_package: 2026-05-05-14-31-45-rbac-access-tdd-coverage
phase: Stage 8 — PLAN EXECUTION
author: claude
status: Borrador
```

# Task Plan — RBAC Access TDD Coverage

> **Generado desde:** `discover/rbac-access-tdd-coverage-analysis.md`
> **Alcance:** TDD + clean code para 8 archivos sin cobertura del WP rbac-access-alignment
> **Ruta crítica:** T-001 → T-003 → T-005 → T-008 → T-013 → T-020 → T-023 → T-027

---

## Convención de tarea

Opción C — Tareas genéricas con trazabilidad a DISCOVER.
Cada grupo TDD sigue el ciclo: refactor clean code → test rojo → test verde → commit.
`[P]` = paralelizable dentro del grupo.

---

## Grupo 0 — Helper de test compartido

> Prerequisito para páginas y router que necesitan Redux + Router + Store.
> Sin este helper el boilerplate de cada suite es prohibitivo (R-003).

- [ ] **T-001** Crear `src/__tests__/helpers/renderWithProviders.jsx` — helper `renderWithProviders(ui, { store, route })` usando `MemoryRouter` + Redux `Provider` + store configurable
- [ ] **T-002** Commit Grupo0: `Add renderWithProviders test helper for RBAC TDD suite`

---

## Grupo 1 — catalog.js (FunctionCatalog)

> Archivo más simple: solo constantes. Sin deps externas. Primer TDD cycle.

- [ ] **T-003** [P] Crear `src/permissions/__tests__/catalog.test.js` — tests que verifican:
  - Cada constante de `FunctionCatalog` tiene formato `sistema.{dominio}.{recurso}.{accion}`
  - Ninguna constante es `undefined` o vacía
  - Al menos 25 constantes exportadas (verificado en DISCOVER: grep del archivo)
- [ ] **T-004** Commit Grupo1: `Add FunctionCatalog unit tests — format and completeness`

---

## Grupo 2 — accessService.js

> Clean code primero (getAuthHeaders), luego tests que lo validan.

- [ ] **T-005** Extraer helper privado `getAuthHeaders()` en `accessService.js` — elimina duplicación de `localStorage.getItem('accessToken')` en cada método (smell detectado en DISCOVER)
- [ ] **T-006** [P] Crear `src/services/__tests__/accessService.test.js` — tests que verifican:
  - `getFunctionGroups()` llama a `GET /access/function-groups` con header `Authorization`
  - `assignFunction(userId, catalogId, expiresAt)` llama a `POST /access/assign`
  - `revokeFunction(userId, catalogId)` llama a `DELETE /access/revoke`
  - `assignFunctionGroup(userId, functionGroupId)` llama a `POST /access/function-groups/assign`
  - Cada método usa el token correcto del `localStorage`
- [ ] **T-007** Commit Grupo2: `Extract getAuthHeaders, add accessService unit tests`

---

## Grupo 3 — accessSlice.js (RTK thunks + reducers + selectors)

> Verificar que catalogId llega al service — el invariante central post H-04.

- [ ] **T-008** Crear `src/redux/slices/__tests__/accessSlice.test.js` — tests de thunks:
  - `assignFunction` dispatched con `{ userId, catalogId }` → service recibe `catalogId` (no `undefined`)
  - `revokeFunction` dispatched con `{ userId, catalogId }` → service recibe `catalogId`
  - `validateSoD` dispatched con `{ userId, catalogId }` → service recibe `catalogId`
- [ ] **T-009** [P] Tests de reducers en `accessSlice.test.js`:
  - Estado inicial correcto (`loading: false`, `error: null`, `userPermissions: {}`)
  - `pending` → `loading: true`
  - `fulfilled` → `loading: false`, payload en estado
  - `rejected` → `loading: false`, `error` seteado
- [ ] **T-010** [P] Tests de selectors:
  - `selectLoading` retorna `state.access.loading`
  - `selectError` retorna `state.access.error`
- [ ] **T-011** Commit Grupo3: `Add accessSlice TDD — thunks verify catalogId, reducers, selectors`

---

## Grupo 4 — FunctionSelector.jsx (SoD, toggle, conflictos)

> El archivo con más lógica crítica. Clean code primero para que los tests sean legibles.

- [ ] **T-012** Renombrar `selectedCodes → selectedCodenames` en `FunctionSelector.jsx` — smell detectado en DISCOVER (son codenames, no "codes"). Verificar con `grep -rn "selectedCodes"` que no haya otros usos antes de renombrar.
- [ ] **T-013** Limpiar variable muda `_` en `getFilteredFunctions` — reemplazar por nombre descriptivo o eliminar
- [ ] **T-014** Crear `src/components/access/__tests__/FunctionSelector.test.jsx` — tests parametrizados de SoD:
  - SOD-001: `view_pipeline_*` ∩ `view_audit_*` → conflicto
  - SOD-001: `view_pipeline_*` ∩ `request_pipeline_*` → sin conflicto (mismo set A)
  - SOD-002: `view_users_*` ∩ `view_audit_*` → conflicto
  - SOD-003: `manage_access_*` ∩ `view_audit_*` → conflicto
  - Codename sin prefijo conocido → sin conflicto (no falso positivo)
- [ ] **T-015** [P] Tests de toggle en `FunctionSelector.test.jsx`:
  - Click en función no seleccionada → aparece en `selectedCodenames`
  - Click en función ya seleccionada → se elimina de `selectedCodenames`
  - Toggle llama a `onChange` con el nuevo set
- [ ] **T-016** [P] Tests de filtro de categorías:
  - Filtro `PIPELINE` → solo funciones con `category === 'PIPELINE'`
  - Sin filtro → retorna todas las funciones
- [ ] **T-017** [P] Tests de detección de conflictos en UI:
  - Función con conflicto SoD → render con indicador visual (clase o atributo `data-conflict`)
  - Función sin conflicto → sin indicador
- [ ] **T-018** Commit Grupo4: `Rename selectedCodenames, add FunctionSelector TDD — SoD, toggle, categories`

---

## Grupo 5 — AppRouter.jsx

> Verificar comportamiento de guard + rutas. Mockear `usePermisos` a nivel módulo (R-002).

- [ ] **T-019** Crear `src/router/__tests__/AppRouter.test.jsx` — tests de guardas:
  - Usuario sin permiso `VIEW_ACCESS` → render `/access-denied` en lugar de `/access/*`
  - Usuario con permiso → render componente de la ruta
  - Ruta `/access-denied` existe y renderiza sin auth
- [ ] **T-020** [P] Tests de rutas ITER4/5/6 en `AppRouter.test.jsx`:
  - `/access/*` protegido con `FunctionCatalog.VIEW_ACCESS`
  - `/audit/*` protegido con `FunctionCatalog.VIEW_AUDIT`
  - `/alerts/*` protegido con `FunctionCatalog.VIEW_ALERTS`
- [ ] **T-021** Commit Grupo5: `Add AppRouter TDD — ProtectedRoute guard, /access-denied, ITER4/5/6`

---

## Grupo 6 — Páginas de acceso (3 páginas)

> Usar `renderWithProviders` de T-001. Mockear thunks con `jest.fn()`.

- [ ] **T-022** Crear `src/pages/access/__tests__/AssignFunctionsPage.test.jsx`:
  - Dispatch de `assignFunction` recibe `{ userId, catalogId }` (no `functionId`)
  - Submit sin usuario seleccionado → no dispatcha
  - Submit con funciones seleccionadas → dispatcha por cada función del set
- [ ] **T-023** Crear `src/pages/access/__tests__/PermissionsPage.test.jsx`:
  - Click "Revocar" → primer click muestra "Confirmar" (estado `revokeConfirm`)
  - Click "Confirmar" → dispatch de `revokeFunction` con `{ userId, catalogId }`
  - Dispatch recibe `catalogId`, no `functionId`
- [ ] **T-024** Crear `src/pages/access/__tests__/TemporaryPermissionsPage.test.jsx`:
  - Dispatch de `assignFunction` con `expiresAt` + `catalogId: parseInt(selectedFunction)`
  - Campo `expiresAt` requerido → sin fecha no dispatcha
- [ ] **T-025** Commit Grupo6: `Add TDD for AssignFunctionsPage, PermissionsPage, TemporaryPermissionsPage`

---

## Cierre

- [ ] **T-026** Ejecutar `npm test -- --watchAll=false` y verificar que pasan ≥97 suites / ≥771 tests (baseline PROVEN en DISCOVER). Documentar el conteo real.
- [ ] **T-027** Push y actualizar `now.md` — `phase: Phase 11 — TRACK/EVALUATE`

---

## DAG de dependencias

```
T-001 → T-002 (helper)
             ↓
T-003 → T-004 (catalog)
             ↓
T-005 → T-006 → T-007 (accessService)
                    ↓
T-008 → T-009 → T-010 → T-011 (accessSlice)
                              ↓
T-012 → T-013 → T-014..T-017 → T-018 (FunctionSelector)
                                    ↓
             T-019 → T-020 → T-021 (AppRouter)
                                 ↓
             T-022 → T-023 → T-024 → T-025 (Pages)
                                          ↓
                              T-026 → T-027 (Cierre)
```

---

## Evidencia de respaldo

| Claim | Tipo | Fuente | Confianza | Origen |
|-------|------|--------|-----------|--------|
| 8 archivos sin suite de tests | PROVEN | `find src -path "*__tests__*access*"` → 0 resultados en DISCOVER | alta | nuevo |
| 97 suites / 771 tests baseline | PROVEN | `npm test` output en sesión DISCOVER | alta | nuevo |
| `selectedCodes` naming smell | PROVEN | Lectura directa de `FunctionSelector.jsx` en DISCOVER | alta | nuevo |
| `localStorage.getItem` duplicado en accessService | PROVEN | Lectura directa de `accessService.js` en DISCOVER | alta | nuevo |
| SOD predicados activos sobre codenames | PROVEN | `FunctionSelector.jsx` post H-01 — `startsWith('view_pipeline')` | alta | heredado |
| Mocks de `usePermisos` requieren nivel-módulo | INFERRED | Hook usa `PermisosClient` singleton — mockear la instancia internamente crea acoplamiento (R-002) | media | nuevo |
| `renderWithProviders` elimina boilerplate de páginas | INFERRED | Pages usan `useDispatch` + `useSelector` + `useNavigate` — requieren 3 providers (R-003) | media | nuevo |

---

## Out-of-scope

- Tests E2E (Cypress/Playwright) — fuera de alcance declarado en DISCOVER
- Tests de `PermissionsService.js` — backend-contract dependent (H-03 diferido)
- Fix del smell `loading` boolean en accessSlice — documentar como TD si el test lo expone pero el fix es invasivo
- Páginas ITER5 (Alerts) e ITER6 (Audit) — no modificadas en rbac-access-alignment

---

## Resumen de progreso

| Grupo | Tareas | Completadas | Pendientes |
|-------|--------|-------------|------------|
| **Grupo 0 — Helper** | 2 | 0 | 2 |
| **Grupo 1 — catalog.js** | 2 | 0 | 2 |
| **Grupo 2 — accessService** | 3 | 0 | 3 |
| **Grupo 3 — accessSlice** | 4 | 0 | 4 |
| **Grupo 4 — FunctionSelector** | 7 | 0 | 7 |
| **Grupo 5 — AppRouter** | 3 | 0 | 3 |
| **Grupo 6 — Pages** | 4 | 0 | 4 |
| **Cierre** | 2 | 0 | 2 |
| **Total** | **27** | **0** | **27** |
