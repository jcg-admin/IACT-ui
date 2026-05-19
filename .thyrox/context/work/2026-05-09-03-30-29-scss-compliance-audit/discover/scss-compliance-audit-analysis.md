```yml
created_at: 2026-05-09 03:30:29
project: THYROX
work_package: 2026-05-09-03-30-29-scss-compliance-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — scss-compliance-audit

## Problema

La guía `docs/guides/scss-page-patterns.md` define un sistema de clases compartidas
en `_pages-shared.scss`. El análisis del codebase revela incumplimiento sistemático
en 4 dimensiones. Los componentes usan estilos inline con colores hardcodeados en
lugar de las clases del design system.

## Fuente de verdad

- **Guía:** `docs/guides/scss-page-patterns.md`
- **Implementación SCSS:** `src/styles/components/_pages-shared.scss`
- **Variables:** `src/styles/abstracts/_variables.scss`

---

## P-01 — Bloques de error hardcodeados en lugar de `.error-banner`

**PROVEN** (verificado con grep):

```
41 líneas con backgroundColor: '#7f1d1d'
Patrón completo (color + border + text):
  style={{ padding: '12px', backgroundColor: '#7f1d1d',
           border: '1px solid #dc2626', borderRadius: '4px',
           color: '#fca5a5', marginBottom: '16px' }}
```

**31 archivos afectados** (PROVEN — `grep -rln "7f1d1d" src/pages/ src/components/`):

| Módulo | Archivos |
|--------|---------|
| access/ | AssignFunctions, AssignGroup, AccessAudit, GroupManagement, Groupers, Permissions, PermissionsAudit, SeparationRules, TemporaryPermissions |
| audit/ | Audit, AuditSearch, ComplianceReport, Export |
| alerts/ | AlertConfig, AlertHistory, Alerts |
| logs/ | ETLAvailability, ETLErrors, PipelineStatus |
| permissions/ | ExceptionalPermission, RevokeExceptionalPermission, RevokeGroup |
| reports/ | RealTimeMetrics, ScheduledReport |
| components/ | FunctionSelector, JobList, PermissionsTable, SeparationRulesValidator, ShareReportModal, TransactionList, UserList, UserManagement |

**Constraint crítica — mismatch visual:** `_pages-shared.scss` define:
```scss
.error-banner {
  background: rgba($error-color, 0.08);   // tint claro (~rgba(239,68,68,0.08))
  border: 1px solid rgba($error-color, 0.3);
  color: darken($error-color, 20%);        // rojo oscuro
}
```
Los bloques hardcodeados usan dark theme (`#7f1d1d` maroon + `#fca5a5` salmon).
**El SCSS debe actualizarse para el dark theme antes de migrar los bloques.**

**Decisión de scope:**
1. Actualizar `.error-banner` en `_pages-shared.scss` → dark theme colors
2. Migrar los 41 bloques a `className="error-banner"`

---

## P-02 — Estilos `display:flex` + `gap` inline

**PROVEN:** 80 instancias de `display: 'flex'` combinado con `gap:` en inline styles.

**Decisión de scope:** EXCLUIDO de este WP. Los 80 casos son heterogéneos (gaps distintos,
dirección distinta, alignment distinto). La migración masiva requeriría clases adicionales
en `_pages-shared.scss` que no existen hoy y supondría riesgo visual sin regresión testing.
Se documenta como deuda técnica pendiente para un WP futuro específico.

---

## P-03 — `badge-*` en lugar de `.status-badge` para estados de entidad

**PROVEN:**
- 20 instancias de `badge-success/badge-danger/badge-warning` en src/pages/
- Solo 2 archivos usan `status-badge` (Profile.jsx, Audit.jsx en src/components/pages/)
- La guía muestra: `<span className="status-badge status-active">Activo</span>`

**Archivos con patrones STATE_BADGE map:**

| Archivo | Patrón | Valores |
|---------|--------|---------|
| `UserList.jsx` | `STATE_BADGE = { ACTIVE: 'badge-primary', BLOCKED: 'badge-warning', ... }` | Entity states |
| `SystemStatus.jsx` | `STATUS_BADGE = { UP: 'badge-success', DOWN: 'badge-danger', ... }` | System states |
| `ETLLogs.jsx` | `STATUS_BADGE = { success: 'badge-success', failed: 'badge-danger', ... }` | Job states |
| `ScheduledReport.jsx` | `badge-success/badge-warning` inline en render | Schedule states |

**Constraint:** La guía dice "`.badge, .badge-danger` → usar iact-kit" pero también
muestra `status-badge` para estados de entidades. Ambos patrones coexisten en la guía.

**Decisión de scope:** INCLUIDO parcialmente. Solo migrar los `STATE_BADGE` / `STATUS_BADGE`
maps en páginas de entidades (no sistema ni jobs) donde el estado es semántico
(ACTIVE/INACTIVE/BLOCKED/ELIMINATED). ETLLogs y SystemStatus usan estados técnicos — quedan
con `badge-*` (apropiados para estados ad-hoc).

---

## P-04 — Inputs de búsqueda sin `.search-bar`

**PROVEN:**
- 3 usos de `className.*search-bar` en el proyecto
- 7 instancias de `placeholder.*[Bb]uscar` en src/pages/ (candidatos)

**Decisión de scope:** INCLUIDO. Solo los casos donde hay un `<input>` de búsqueda
envuelto en un div flex inline — convertir wrapper a `className="search-bar"` e input
a `className="search-input"`. Los inputs sin wrapper flex quedan fuera.

---

## __mocks__/ — Sin acción requerida

**PROVEN:** `__mocks__/` contiene 4 archivos de mocks de librerías externas:
- `styleMock.js` — CSS/SCSS imports
- `fileMock.js` — imágenes
- `react-select.js` — librería react-select
- `react-date-picker.js` — librería react-date-picker

El mocking de datos del proyecto vive en `src/mocks/mockInterceptor.js` integrado en
`apiClient.js`. Los tests mockean con `jest.mock()` inline. Sistema correcto — no tocar.

---

## Scope aprobado — 3 bloques

| Bloque | Alcance | Archivos est. | Riesgo |
|--------|---------|---------------|--------|
| B-I | Actualizar `.error-banner` SCSS + migrar 41 bloques hardcodeados | 31 src + 1 SCSS | Bajo |
| B-II | Migrar STATE_BADGE entities → `status-badge status-*` | 3–4 páginas | Bajo |
| B-III | Estandarizar search-bar wrapper en páginas con inputs de búsqueda | 4–7 páginas | Bajo |

P-02 (flex/gap) → documentado como TD, excluido de scope.

## Exit criteria

- `_pages-shared.scss .error-banner` usa colores dark theme coherentes
- 0 instancias de `backgroundColor: '#7f1d1d'` en src/ (fuera de tests)
- Páginas con estados ACTIVE/INACTIVE/BLOCKED usan `.status-badge` + modifier
- Inputs de búsqueda en wrapper flex → `search-bar` / `search-input`
- 1989+ tests pasan (0 regresiones)
