```yml
created_at: 2026-05-09 03:51:19
project: THYROX
work_package: 2026-05-09-03-30-29-scss-compliance-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — scss-compliance-audit

## Changed

- `_pages-shared.scss` `.error-banner`: actualizado a dark theme con variables SCSS.
  `background-color: darken($error-color, 45%)` (~#7f1d1d), `border: 1px solid
  darken($error-color, 20%)` (~#dc2626), `color: lighten($error-color, 30%)` (~#fca5a5).
  Antes usaba `rgba($error-color, 0.08)` (light theme) — incorrecto para el proyecto.

- 30 bloques de error inline (`style={{ backgroundColor: '#7f1d1d', ... }}`) migrados a
  `className="error-banner"` en 25 archivos. `role="alert"` agregado donde faltaba.
  Archivos: AssignGroup, PermissionsAudit, AssignFunctions, AccessAudit, Groupers,
  TemporaryPermissions, Permissions (pages/access/); Audit, AuditSearch, ComplianceReport,
  Export (pages/audit/); AlertConfig, Alerts, AlertHistory (pages/alerts/);
  ETLAvailability, ETLErrors, PipelineStatus (pages/logs/); RevokeExceptionalPermission,
  RevokeGroup, ExceptionalPermission (pages/permissions/); ScheduledReport, RealTimeMetrics
  (pages/reports/); UserManagement (containers/), FunctionSelector (access/),
  ShareReportModal (reports/).

- `UserList.jsx` (pages/users/UserManagement): `STATE_BADGE` map migrado a `STATE_CLASS`
  con valores `status-active/status-inactive/status-blocked/status-eliminated`.
  `<span class="badge badge-*">` → `<span class="status-badge status-*">`.

- `ScheduledReport.jsx`: status render `badge-success/badge-warning` →
  `status-badge status-active/status-inactive`.

- `SeparationRulesCatalog.jsx`: isActive render `badge-success/badge-secondary` →
  `status-badge status-active/status-inactive`.

- `FunctionCatalog.jsx`: `style={{ display: 'flex', gap: '8px', flexWrap: 'wrap',
  alignItems: 'center' }}` eliminado del wrapper `.search-bar` — redundante con SCSS.

- `LogSearch.jsx`: `<form style={{ display: 'flex', ... }}>` migrado a
  `<form className="search-bar">` con `<input className="search-input">`.

## Fixed

- `UserList.test.js`: 4 assertions de clase de badge actualizadas de `badge-primary/
  secondary/warning/danger` a `status-badge.status-active/inactive/blocked/eliminated`.

## Aceptado / no migrado

- 11 usos de `#7f1d1d` preservados intencionalmente: mapas de color de estado
  (`JobList.jsx`, `TransactionList.jsx`), fondos condicionales para entidades expiradas
  (`Permissions.jsx`, `PermissionsTable.jsx`), container bivalente rojo/ámbar
  (`SeparationRulesValidator.jsx`), span de función en preview-revoke (`RevokeGroup.jsx`),
  marcadores UI en `SeparationRules.jsx` (violations badge, incompatible label, violations
  summary) y resultado de dry-run en `AlertConfig.jsx`. Documentados como TD-CSS-001.

- P-02 (80 instancias flex+gap inline) excluido de scope — heterogeneidad de gap values
  y alignment hace inviable una clase utilitaria única. Documentado como TD-CSS-002.

## Status de promoción a CHANGELOG.md raíz

Pendiente merge a main. Entrada candidata bajo `## Changed`:
- `scss-compliance-audit`: migra 30 error banners a `.error-banner`, estandariza
  `status-badge` en UserList/ScheduledReport/SeparationRulesCatalog, limpia search-bar
  wrappers en FunctionCatalog y LogSearch
