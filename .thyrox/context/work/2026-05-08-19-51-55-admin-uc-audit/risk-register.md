```yml
project: IACT-UI
work_package: 2026-05-08-19-51-55-admin-uc-audit
created_at: 2026-05-08 19:51:55
updated_at: 2026-05-08 19:51:55
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
```

# Risk Register — admin-uc-audit

| ID | Riesgo | Probabilidad | Impacto | Estado |
|----|--------|-------------|---------|--------|
| R-01 | GAP-ADM-03 requiere nuevo componente AGRComposition con mock endpoints — scope mayor al estimado | MEDIA | ALTO | Abierto |
| R-02 | `block_auto_archive` tiene 4 campos relacionados (block_reason, block_set_by, block_set_at) — mock puede necesitar estado persistente entre requests | MEDIA | MEDIO | Abierto |
| R-03 | SeparationRulesCatalog usa `result.error` check (no `.unwrap()`) — si se agrega error display hay que migrar a `.unwrap()` para consistencia | BAJA | BAJO | Abierto |
| R-04 | AGR composition endpoints (`/api/admin/system-groups/`) usan ruta diferente a AGR catalog (`/api/admin/agr/`) — routing cuidadoso en mockInterceptor | MEDIA | BAJO | Abierto |
