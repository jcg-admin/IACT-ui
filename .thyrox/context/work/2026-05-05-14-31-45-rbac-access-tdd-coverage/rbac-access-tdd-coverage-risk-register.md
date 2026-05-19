```yml
project: IACT-UI
work_package: 2026-05-05-14-31-45-rbac-access-tdd-coverage
created_at: 2026-05-05 14:31:45
updated_at: 2026-05-05 14:31:45
current_phase: Phase 1 — DISCOVER
open_risks: 4
mitigated_risks: 0
closed_risks: 0
author: claude
```

# Risk Register — rbac-access-tdd-coverage

## Matriz de riesgos

| ID | Descripción | Probabilidad | Impacto | Severidad | Estado | Dueño |
|----|-------------|:------------:|:-------:|:---------:|--------|-------|
| R-001 | Clean code refactor rompe tests existentes | media | alto | alta | abierto | claude |
| R-002 | Mocks de usePermisos/store demasiado acoplados al impl | alta | medio | alta | abierto | claude |
| R-003 | Tests de páginas requieren Provider+Router+Store anidados | alta | bajo | media | abierto | claude |
| R-004 | FunctionSelector — allFunctions prop sin mock real del catálogo | media | medio | media | abierto | claude |

---

## Detalle de riesgos

### R-001: Refactor de clean code introduce regresión en tests existentes

**Descripción:** Al renombrar `selectedCodes → selectedCodenames` y extraer
`getAuthHeaders()`, un import o referencia existente en otro test podría romperse.

**Probabilidad:** media
**Impacto:** alto
**Severidad:** alta
**Estado:** abierto
**Fase de identificación:** Phase 1

**Señales de alerta**
- `npm test` falla con "cannot read property of undefined" tras renombrar
- Error de import en un test file existente

**Mitigación**
- Correr `npm test -- --watchAll=false` después de cada rename
- Usar `grep -rn "selectedCodes"` antes de renombrar para localizar todos los usos

**Plan de contingencia**
- Revertir el rename con `git checkout -- <file>` y documentar el smell sin corregirlo

---

### R-002: Mocks de usePermisos muy acoplados a implementación

**Descripción:** `usePermisos` es un hook que lee de `PermisosClient` (singleton).
Los tests de `ProtectedRoute` y `AppRouter` necesitan mockear `hasPermission`.
Si el mock replica la estructura interna del hook, un cambio al hook rompe N tests.

**Probabilidad:** alta
**Impacto:** medio
**Severidad:** alta
**Estado:** abierto
**Fase de identificación:** Phase 1

**Señales de alerta**
- Test falla con "useAuth must be used within AuthContext"
- Test falla con "PermisosClient is not defined"

**Mitigación**
- Mockear `usePermisos` a nivel de módulo: `jest.mock('../hooks/usePermisos', () => ...)`
- Nunca mockear `PermisosClient` directamente

**Plan de contingencia**
- Usar `MemoryRouter` con estado inicial en lugar de BrowserRouter para aislar

---

### R-003: Tests de páginas requieren stack complejo Provider+Router+Store

**Descripción:** `AssignFunctionsPage`, `PermissionsPage`, `TemporaryPermissionsPage`
usan `useDispatch`, `useSelector`, `useNavigate` — requieren Redux Provider +
React Router + mocks de thunks. El boilerplate puede ser alto.

**Probabilidad:** alta
**Impacto:** bajo
**Severidad:** media
**Estado:** abierto
**Fase de identificación:** Phase 1

**Mitigación**
- Crear helper `renderWithProviders(ui, { store, route })` reutilizable
- Mockear thunks con `jest.fn()` en lugar de testear el store real

---

### R-004: FunctionSelector sin mock del catálogo real

**Descripción:** Los predicados SoD operan sobre codenames del catálogo
(`GET /api/access/functions`). El endpoint no tiene mock JSON. Los tests
deben construir `allFunctions` manualmente con codenames de prueba.

**Probabilidad:** media
**Impacto:** medio
**Severidad:** media
**Estado:** abierto
**Fase de identificación:** Phase 1

**Mitigación**
- Crear fixtures de `allFunctions` en el test file con codenames que cubran
  los predicados SoD (view_pipeline_*, view_audit_*, etc.)
- No depender del mock de permissions.json (es otro endpoint)

---

## Riesgos cerrados

*(ninguno aún)*

## Checklist de gestión

- [x] Riesgos identificados en Phase 1 antes de planificar
- [x] Cada riesgo tiene señales de alerta definidas
- [x] Cada riesgo tiene plan de contingencia
- [ ] Registro actualizado al final de cada fase
- [ ] Riesgos materializados referenciados en errors/
