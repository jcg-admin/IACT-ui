```yml
project: IACT-UI
work_package: 2026-05-06-19-34-24-rbac-v560-spec-analysis
created_at: 2026-05-06 19:34:24
current_phase: Phase 1 — DISCOVER (completa) → listo para Phase 10 IMPLEMENT
status: Activo
author: claude
source: feature/cnst-033-uml-conformance (IACT-docs, commit c2c61825)
size: mediano (Phase 1 + Phase 10 ITER-A..F + Phase 11)
```

# WP — RBAC v5.6.0 Alignment (IACT-UI)

Alineación de la implementación IACT-UI con el vocabulario canónico
RBAC v5.6.0 publicado en `feature/cnst-033-uml-conformance` (IACT-docs).

## Phase 1 DISCOVER — completa

Tres artefactos producidos:

- `discover/rbac-v560-spec-analysis.md` — catálogo canónico v5.6.0:
  64 funciones activas (9 módulos), 13 reservadas open-closed
  (MOD_Operator + MOD_Supervision), 12 AGRs, 3 reglas SoD.
  Changelog v5.5.0 → v5.6.0 documentado.

- `discover/iact-ui-rbac-implementation-audit.md` — auditoría de
  implementación: 19 gaps en 6 artefactos (1 CRÍTICO, 2 ALTA,
  6 MEDIA, 10 BAJA). Tier de correcciones 1..3 priorizado.

- `discover/dependency-graph-analysis.md` — grafo de dependencias DAG:
  19 gaps agrupados en 6 ITERs ordenados por dependencias.
  ITER-A (crítico primero) → ITER-B → ITER-C → ITER-D → ITER-E → ITER-F.

## Plan de ejecución aprobado (Phase 10)

| ITER | Gaps | Artefactos principales |
|------|------|------------------------|
| ITER-A | G-A3, G-A4, G-A5, G-B1 | catalog.js, FunctionCatalogPage |
| ITER-B | G-A2, G-A1, G-E1, G-E2, G-E3 | catalog.js, AppRouter |
| ITER-C | G-D1, G-D2 | mockInterceptor (GET handlers) |
| ITER-D | G-D3, G-C1..G-C5 | mockInterceptor (CRUD), permissions.json |
| ITER-E | G-E4 | SavedViewsPage (nueva), AppRouter |
| ITER-F | G-B2 | AGRCatalogPage |
