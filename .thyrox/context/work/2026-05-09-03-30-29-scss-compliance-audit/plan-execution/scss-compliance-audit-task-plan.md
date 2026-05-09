```yml
created_at: 2026-05-09 03:40:00
project: THYROX
work_package: 2026-05-09-03-30-29-scss-compliance-audit
phase: Phase 8 — PLAN EXECUTION
author: NestorMonroy
status: Aprobado
```

# Task Plan — scss-compliance-audit

## Decisiones de diseño

- **DECISION-01**: Proyecto dark theme → `.error-banner` SCSS incorrecto → actualizar primero
- **DECISION-02**: Fix directo, sin soporte multi-theme
- **DECISION-03**: P-02 (flex/gap 80 instancias) excluido → TD
- **DECISION-04**: P-03 scope: UserList, ScheduledReport, SeparationRulesCatalog (entity states)
- **DECISION-05**: P-04 scope: LogSearch (nueva migración), FunctionCatalog + AGRCatalog (limpiar style redundante en wrapper ya-compliant)

## DAG de dependencias

```
T-001 → T-002 → T-003 → T-004 → T-005 (bloque I, secuencial)
T-005 → T-006 → T-007               (bloque II, depende de tests B-I verde)
T-007 → T-008 → T-009               (bloque III, independiente de B-II)
```

---

## BLOQUE I — Actualizar .error-banner + migrar 41 bloques hardcodeados

### T-001 — Actualizar `.error-banner` en `_pages-shared.scss` a dark theme

**Archivo:** `src/styles/components/_pages-shared.scss`

Reemplazar el bloque actual:
```scss
.error-banner {
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-lg;
  background: rgba($error-color, 0.08);
  border: 1px solid rgba($error-color, 0.3);
  border-radius: 0.375rem;
  color: darken($error-color, 20%);
  font-size: 0.875rem;
}
```

Por la versión dark theme coherente con los bloques existentes (`#7f1d1d`, `#dc2626`, `#fca5a5`):
```scss
.error-banner {
  padding: 12px $spacing-md;
  margin-bottom: $spacing-md;
  background: #7f1d1d;
  border: 1px solid #dc2626;
  border-radius: 4px;
  color: #fca5a5;
  font-size: 0.875rem;
}
```

Verificar: clase `role="alert"` no afectada por cambio de SCSS.

- [ ] T-001 — Actualizar .error-banner SCSS a dark theme

---

### T-002 — Migrar bloques hardcodeados en `pages/access/` (8 archivos)

Reemplazar en CADA archivo:
```jsx
// ANTES
<div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d',
  border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5',
  marginBottom: '16px' }}>
  {error}
</div>

// DESPUÉS
<div role="alert" className="error-banner">{error}</div>
```

**Archivos** (verificado `grep -rln "7f1d1d" src/pages/access/`):
- `AssignFunctions.jsx`
- `AssignGroup.jsx`
- `AccessAudit.jsx`
- `GroupManagement.jsx`
- `Groupers.jsx`
- `Permissions.jsx`
- `PermissionsAudit.jsx`
- `SeparationRules.jsx`
- `TemporaryPermissions.jsx`

Nota: preservar `role="alert"` en todos los casos — solo eliminar el `style={}`.

- [ ] T-002 — Migrar pages/access/ (9 archivos)

---

### T-003 — Migrar bloques hardcodeados en `pages/audit/` + `pages/alerts/`

**pages/audit/** (4 archivos):
- `Audit.jsx`
- `AuditSearch.jsx`
- `ComplianceReport.jsx`
- `Export.jsx`

**pages/alerts/** (3 archivos):
- `AlertConfig.jsx`
- `AlertHistory.jsx`
- `Alerts.jsx`

- [ ] T-003 — Migrar pages/audit/ + pages/alerts/ (7 archivos)

---

### T-004 — Migrar bloques hardcodeados en `pages/logs/`, `pages/permissions/`, `pages/reports/`

**pages/logs/** (3 archivos):
- `ETLAvailability.jsx`
- `ETLErrors.jsx`
- `PipelineStatus.jsx`

**pages/permissions/** (3 archivos):
- `ExceptionalPermission.jsx`
- `RevokeExceptionalPermission.jsx`
- `RevokeGroup.jsx`

**pages/reports/** (2 archivos):
- `RealTimeMetrics.jsx`
- `ScheduledReport.jsx`

- [ ] T-004 — Migrar pages/logs/ + pages/permissions/ + pages/reports/ (8 archivos)

---

### T-005 — Migrar bloques hardcodeados en `components/` + verificación final

**Archivos** (verificado `grep -rln "7f1d1d" src/components/`):
- `containers/UserManagement.jsx`
- `features/Jobs/JobList.jsx`
- `features/Transactions/TransactionList.jsx`
- `features/UserManagement/UserList.jsx`
- `access/FunctionSelector.jsx`
- `access/PermissionsTable.jsx`
- `access/SeparationRulesValidator.jsx`
- `reports/ShareReportModal.jsx`

**Verificación post-migración:**
```bash
grep -rn "7f1d1d" src/ | grep -v "test\|__tests__\|\.scss"
# Debe retornar 0 resultados
```

Ejecutar suite completa: `npx jest --no-coverage` → 1989+ tests deben pasar.

Commit: "Migrate all hardcoded error blocks to .error-banner"

- [ ] T-005 — Migrar components/ (8 archivos) + verificar 0 instancias + commit B-I

---

## BLOQUE II — Migrar entity-state badges a `.status-badge`

### T-006 — `UserList.jsx` — STATE_BADGE map → `.status-badge`

**Archivo:** `src/components/features/UserManagement/UserList.jsx`

Reemplazar:
```js
const STATE_BADGE = {
  ACTIVE: 'badge-primary',
  INACTIVE: 'badge-secondary',
  BLOCKED: 'badge-warning',
  ELIMINATED: 'badge-danger',
}
// ...
<span className={`badge ${STATE_BADGE[user.state] || 'badge-secondary'}`}>
```

Por:
```js
const STATE_CLASS = {
  ACTIVE: 'status-active',
  INACTIVE: 'status-inactive',
  BLOCKED: 'status-blocked',
  ELIMINATED: 'status-eliminated',
}
// ...
<span className={`status-badge ${STATE_CLASS[user.state] || 'status-inactive'}`}>
```

Verificar: `_pages-shared.scss` tiene `.status-badge.status-active`, `.status-inactive`,
`.status-blocked`, `.status-failure.status-error.status-eliminated` — todos cubiertos.

Ejecutar: `npx jest src/pages/users/UserManagement/__tests__/ --no-coverage`

- [ ] T-006 — UserList.jsx STATE_BADGE → status-badge

---

### T-007 — `ScheduledReport.jsx` + `SeparationRulesCatalog.jsx` → `.status-badge`

**ScheduledReport.jsx** — render inline en Table:
```jsx
// ANTES
<span className={`badge ${v === 'active' ? 'badge-success' : 'badge-warning'}`}>
  {v === 'active' ? 'Activo' : 'Pausado'}
</span>

// DESPUÉS
<span className={`status-badge ${v === 'active' ? 'status-active' : 'status-inactive'}`}>
  {v === 'active' ? 'Activo' : 'Pausado'}
</span>
```

**SeparationRulesCatalog.jsx** — render de isActive:
```jsx
// ANTES
<span className={`badge badge-${v ? 'success' : 'secondary'}`}>
  {v ? 'Activa' : 'Inactiva'}
</span>

// DESPUÉS
<span className={`status-badge ${v ? 'status-active' : 'status-inactive'}`}>
  {v ? 'Activa' : 'Inactiva'}
</span>
```

Ejecutar suite + commit B-II: "Migrate entity state badges to status-badge pattern"

- [ ] T-007 — ScheduledReport + SeparationRulesCatalog → status-badge + commit B-II

---

## BLOQUE III — Estandarizar search-bar

### T-008 — Limpiar `style={}` redundante en wrappers ya-compliant

`FunctionCatalog.jsx` y `AGRCatalog.jsx` ya usan `className="search-bar"` pero tienen
`style={{ display: 'flex', gap: '8px', ... }}` redundante en el mismo elemento —
el SCSS ya aplica `display: flex; gap: $spacing-sm`.

Eliminar el atributo `style={}` del wrapper `<div className="search-bar" style={...}>`.
Preservar cualquier `style` en hijos si existe.

- [ ] T-008 — Eliminar style redundante en FunctionCatalog + AGRCatalog search wrappers

---

### T-009 — Migrar `LogSearch.jsx` a `.search-bar` + commit B-III

**Archivo:** `src/pages/logs/LogSearch.jsx`

```jsx
// ANTES
<form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Buscar en logs..."
    style={{ flex: 1 }}
  />
  <button className="btn btn-primary" type="submit">Buscar</button>
</form>

// DESPUÉS
<form onSubmit={handleSubmit} className="search-bar">
  <input
    type="text"
    className="search-input"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Buscar en logs..."
  />
  <button className="btn btn-primary" type="submit">Buscar</button>
</form>
```

Nota: `_pages-shared.scss .search-bar` tiene `margin-bottom: $spacing-lg (24px)` — igual
al inline, correcto. `.search-input` tiene `flex: 1` — igual al inline `style={{ flex: 1 }}`.

Ejecutar suite completa: `npx jest --no-coverage` → 1989+ tests.
Commit B-III: "Standardize search-bar wrappers per scss-page-patterns guide"

- [ ] T-009 — LogSearch.jsx → search-bar + commit B-III

---

## Métricas de éxito

| Métrica | Baseline | Target |
|---------|----------|--------|
| Instancias `#7f1d1d` en src/ | 41 | 0 |
| Archivos con `className="error-banner"` | 30 | 71 (+41) |
| Páginas con `status-badge` | 2 | 5 |
| Wrappers con search-bar | 3 | 4 |
| Tests pasando | 1989 | ≥ 1989 |
