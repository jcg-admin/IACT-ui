```yml
project: IACT-UI
work_package: 2026-05-05-16-31-59-rbac-naming-refactor
created_at: 2026-05-05 16:31:59
current_phase: Phase 11 — TRACK/EVALUATE
status: closed
author: claude
branch: claude/project-analysis-N9IkV
size: mediano
methodology: deep-review + refactor
```

# WP — RBAC Naming Refactor (v5.2.1 alignment)

## Objetivo

Alinear el código de IACT-UI con el estándar de nomenclatura RBAC v5.2.1
que establece: **nombres descriptivos en inglés, sin acrónimos en identificadores de código**.

## Disparador

Revisión de `MODELO_RBAC_IACT_v5_2_1.md` reveló que `validateSoD` en
`accessSlice.js` viola la regla v5.2.1:
- `manage_separation_rules` (descriptivo) — NO `gestiona_sod`
- `validate_separation_rules` (backend) — NO `validate_sod`
- `pipeline_audit_separation` (nombre de regla) — sin prefijo `sod_`

## Scope

- Análisis completo de violaciones de naming v5.2.1 en `src/`
- Refactor de todos los identificadores que usen acrónimos de dominio
  prohibidos: SoD, ETL, AGR, IVR en nombres de funciones/variables
- Documentar hallazgos en este WP
- Tests actualizados en el mismo commit que cada rename

## Fuente de verdad

`/tmp/references/IACT-docs/temp-holding/RBAC/MODELO_RBAC_IACT_v5_2_1.md`
