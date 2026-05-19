```yml
project: THYROX
work_package: 2026-05-08-21-34-20-admin-uc-audit
created_at: 2026-05-08 21:38:29
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
```

# Risk Register — admin-uc-audit

| ID | Descripción | Probabilidad | Impacto | Mitigación | Estado |
|----|-------------|:---:|:---:|---|---|
| R-01 | GAP-04: warning 202 no expuesto al usuario — asignaciones afectadas silenciosamente | Alta | Alto | Implementar `.unwrap()` + UI warning panel en FunctionCatalog.jsx | Abierto |
| R-02 | Mock PUT handler para separation rules oculta bug PUT→PATCH hasta integración real | Media | Medio | Fix en gateway + mock (GAP-01) | Abierto |
| R-03 | SoD conflict en AGR sin detalle de regla — debugging difícil en integración | Baja | Bajo | Mock retorna detalle de regla violada (GAP-07) | Abierto |
| R-04 | Regresión en suite SeparationRulesCatalog al cambiar PUT→PATCH | Baja | Bajo | Verificar tests existentes antes del fix | Abierto |
