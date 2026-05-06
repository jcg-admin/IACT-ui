```yml
created_at: 2026-05-06 05:38:24
project: IACT-UI
work_package: 2026-05-06-02-07-30-uc-full-implementation
phase: Phase 12 — STANDARDIZE
author: NestorMonroy
status: Borrador
```

# Patterns — uc-full-implementation

## Patrones adoptados

### PAT-UI-001: CJS mock factory para componentes React en Jest

**Origen:** L-001 (lessons-learned) — mock drift con `{ default: fn }` sin `__esModule`

**Patrón:**
```js
// CORRECTO — CJS factory directa
jest.mock('@components/reports/SavedFiltersPanel', () =>
  function SavedFiltersPanel({ onSave }) {
    return <div data-testid="saved-filters-panel" />
  }
)

// INCORRECTO — double-wrap de Babel cuando falta __esModule: true
jest.mock('@components/reports/SavedFiltersPanel', () => ({
  default: ({ onSave }) => <div data-testid="saved-filters-panel" />,
}))
```

**Cuándo usar:** Siempre que se mockee un componente React importado con `import X from '...'`.
Si el mock usa `{ default: fn }`, agregar `__esModule: true` o cambiar a forma CJS.

**Propagado a:** `frontend-react.instructions.md` — Regla 7

---

### PAT-UI-002: Mock-first service pattern para endpoints ausentes

**Origen:** L-007 — 10 UCs con backend ausente desbloqueados con mock-first

**Patrón:**
```js
// En el service, método mock-first
async getETLAvailability() {
  // TODO: replace mock — GET /api/etl/availability
  return [
    { source: 'CRM', lastUpdate: new Date().toISOString(), status: 'ok', freshnessMinutes: 12 },
    { source: 'PBX', lastUpdate: new Date().toISOString(), status: 'error', freshnessMinutes: 180 },
  ]
}
```

**Cuándo usar:** Cuando el backend no tiene el endpoint listo pero la UI debe avanzar.
El componente queda 100% funcional para tests y demo. La activación del endpoint real
es un cambio de 1 línea en el service method.

**Propagado a:** `frontend-react.instructions.md` — Regla 8

---

### PAT-UI-003: Slice mock coverage — grep antes de agregar export

**Origen:** L-003 / L-008 — 5 suites rotas por mock drift en slices

**Patrón:**
```bash
# Antes de agregar un nuevo selector/thunk a un slice:
grep -r "from '@redux/slices/accessSlice'" src --include="*.test.*" -l
# → lista de test files que importan el slice
# → actualizar sus mocks en el mismo commit
```

**Cuándo usar:** Al agregar cualquier nuevo export (selector, thunk, action) a un slice
existente. La regla aplica también a componentes: grep los test files que los importan.

**Propagado a:** `frontend-react.instructions.md` — Regla 9

---

### PAT-UI-004: ITER = 1 commit granularity

**Origen:** L-009 — 7 commits / 7 ITERs produce historial reversible y coherente

**Patrón:**
- 1 ITER = 1 grupo de UCs temáticamente relacionados
- 1 ITER = 1 commit con todos sus archivos
- Subject del commit: `Add ITER-N: descripción de los UCs`
- No un commit por T-NNN (demasiado granular), no un commit al final del WP (demasiado grueso)

**Cuándo usar:** WPs con múltiples UCs. La granularidad correcta permite `git revert <hash>`
de una feature completa sin afectar otras.

**Propagado a:** `.claude/rules/commit-conventions.md` — nota de granularidad de WP

---

## Updates a guidelines

### `frontend-react.instructions.md`

Agregadas 3 reglas nuevas (Reglas 7, 8, 9):

| Regla | Descripción | Origen |
|-------|-------------|--------|
| Regla 7 | CJS mock factory para componentes React | PAT-UI-001 (L-001) |
| Regla 8 | Mock-first service para endpoints ausentes | PAT-UI-002 (L-007) |
| Regla 9 | Grep consumers antes de agregar exports a slices | PAT-UI-003 (L-003/L-008) |

---

## Updates a skills

Ninguno — el WP no modificó procesos de THYROX ni introdujo nuevos tipos de análisis.

---

## ADRs creados

Ninguno — las decisiones de implementación (mock-first, CJS mocks, ITER granularity)
son convenciones de código, no decisiones arquitectónicas permanentes del sistema.
Se propagan a guidelines, no a ADRs.

---

## Próximos WPs sugeridos

| WP sugerido | Origen | Prioridad |
|-------------|--------|-----------|
| `backend-endpoints-activation` | TD-P-001: activar endpoints reales para 10 UCs mock-first | Media |
| `uc-iter-1-3-completion` | ITER-1..3 (uc-auth-02, alr-03, acc-02, adm-01, perm-01/02/10) ya en git pero task-plan describe trabajo adicional no cubierto | Alta |
| `npm-security-audit` | TD-003: 4 vulnerabilidades moderadas | Media |
| `router-completion` | TD-005: react-router-dom@6 rutas incompletas | Media |
