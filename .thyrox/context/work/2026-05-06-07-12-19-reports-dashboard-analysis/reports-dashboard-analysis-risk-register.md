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
| R-02 | Algunos UCs de reportes tienen dependencia entre sí (rpt-07 → rpt-08) | Media | Alto | Grafo documentado en §8 del análisis — CERRADO |
| R-03 | Dashboard puede referirse a múltiples módulos distintos (supervision vs reports) | Alta | Medio | Delimitado: DashboardIVR (uc-rpt-01) ≠ supervisión (uc-sup-*) — CERRADO |
| R-04 | Dashboard.jsx usa mocks de revenue/users sin ningún campo del spec IVR | Alta | Alto | Gap confirmado en §9 — candidato a WP dashboard-ivr-rewrite |
| R-05 | ExportJob (UC-RPT-04) es async complejo — flujo de estados no trivial en Redux | Media | Alto | Requiere diseño dedicado — candidato a WP export-job-flow |
| R-06 | UC-INC-RPT-01 (resolver segmento) no analizado en detalle — aplica a todos los reportes | Alta | Alto | Q-04 abierta — analizar en WP siguiente antes de implementar filtros |
