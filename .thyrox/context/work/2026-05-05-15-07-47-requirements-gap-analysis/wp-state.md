```yml
project: IACT-UI
work_package: 2026-05-05-15-07-47-requirements-gap-analysis
created_at: 2026-05-05 15:07:47
current_phase: Phase 3 — DIAGNOSE
status: active
author: claude
branch: claude/project-analysis-N9IkV
size: grande
methodology: deep-review gap analysis
```

# WP — Requirements Gap Analysis

## Objetivo

Revisar profundamente cuántos requisitos documentados en IACT-docs
(branch `feature/solve-problem-docs`) no tienen implementación en IACT-ui.
Producir un gap report con estado por dominio y priorización de trabajo pendiente.

## Scope

- Fuente de requisitos: `/tmp/references/IACT-docs/source/requisitos/`
  - `requisitos-funcionales/` — 120+ FRs en 14 dominios
  - `casos-uso/` — 80+ UCs en 14 dominios
  - `business-requirements/` — 8 BREQs
- Target de implementación: `/home/user/IACT-ui/src/`

## Dominios a analizar

| Dominio | UCs | FRs |
|---------|-----|-----|
| auth | 5 | 21 |
| users | 4 | 17 |
| access | 7 | 7 |
| permissions | 10 | 22 |
| operator | 10 | 10 |
| reports | 13+ | 16 |
| alerts | 5 | 5 |
| audit | 4 | 4 |
| logs | 7 | 7 |
| caller | 5 | 5 |
| pipeline | 4 | 4 |
| supervision | 3 | 3 |
| users (adm) | 3 | — |
| admin | 3 | — |
