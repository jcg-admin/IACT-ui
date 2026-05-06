```yml
created_at: 2026-05-06 07:21:07
project: THYROX
work_package: 2026-05-06-07-12-19-reports-dashboard-analysis
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
updated_at: 2026-05-06 07:21:07
```

# Exit Conditions — Phase 1 DISCOVER

## Criterios de salida cumplidos ✅

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| Inventario completo de UCs de reportes | ✅ | 16 UCs (15 rpt + 1 include) documentados con RBAC y estado |
| Inventario UCs de pipeline | ✅ | 4 UCs documentados (pip-01..04) |
| Inventario UCs de supervisión | ✅ | 3 UCs documentados (sup-01..03) |
| Modelos de datos por UC | ✅ | Todos los `datos-involucrados.rst` leídos |
| Dashboard spec vs implementación | ✅ | Gap crítico identificado: mocks incorrectos |
| Formatos de exportación | ✅ | `{csv, xlsx, json, pdf}` — PROVEN desde `flujo-principal.rst` |
| Dependencias entre UCs | ✅ | Grafo documentado en §8 del análisis |
| Gaps vs IACT-UI actual | ✅ | §9 del análisis — 7 gaps identificados con criticidad |
| Preguntas abiertas documentadas | ✅ | 5 preguntas (Q-01..Q-05) |

## Decisiones de scope tomadas en Phase 1

1. **UC-SUP-01/02/03** — fuera de scope de este WP (dominio distinto: llamadas en vivo / WebRTC)
2. **Dashboard gap** — es el gap de mayor criticidad, candidato a WP propio
3. **ExportJob async** — flujo complejo que requiere diseño de estados en Redux
4. **UC-INC-RPT-01** (resolver segmento) — pendiente de análisis en profundidad (Q-04)

## Próximos pasos sugeridos

Tres WPs posibles a partir de este análisis:

| WP candidato | Scope | Prioridad |
|-------------|-------|-----------|
| `dashboard-ivr-rewrite` | Reescribir `Dashboard.jsx` con `DashboardIVR` spec | 🔴 Alta |
| `export-job-flow` | Implementar `ExportJob` async (UC-RPT-04) + UI de progreso | 🔴 Alta |
| `pipeline-ops` | UC-PIP-02 (errores) + UC-PIP-03 (disponibilidad) + UC-PIP-04 (reintento) | 🟠 Media |
