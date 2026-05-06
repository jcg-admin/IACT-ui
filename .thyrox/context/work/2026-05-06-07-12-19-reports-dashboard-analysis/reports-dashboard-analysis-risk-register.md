```yml
created_at: 2026-05-06 07:12:19
project: THYROX
work_package: 2026-05-06-07-12-19-reports-dashboard-analysis
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
updated_at: 2026-05-06 07:12:19
```

# Risk Register — reports-dashboard-analysis

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-01 | Spec de reportes hace referencia a endpoints aún no definidos en backend | Alta | Medio | Documentar como "pendiente de backend spec" sin bloquear análisis UI |
| R-02 | Algunos UCs de reportes tienen dependencia entre sí (rpt-07 → rpt-08) | Media | Alto | Analizar el grafo de dependencias antes de cualquier propuesta de implementación |
| R-03 | Dashboard puede referirse a múltiples módulos distintos (supervision vs reports) | Alta | Medio | Delimitar por UC y módulo antes de consolidar |
