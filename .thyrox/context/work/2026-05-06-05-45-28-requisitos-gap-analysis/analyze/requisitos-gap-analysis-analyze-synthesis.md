```yml
created_at: 2026-05-06 06:00:02
project: IACT-UI
work_package: 2026-05-06-05-45-28-requisitos-gap-analysis
phase: Phase 3 — ANALYZE
author: NestorMonroy
status: Borrador
```

# Síntesis Phase 3 ANALYZE — requisitos-gap-analysis

## Scope actualizado (decisión de usuario)

uc-opr-*, uc-sup-*, uc-cli-* **excluidos del scope** del WP.
El análisis se concentra en los gaps implementables sin dependencia de
CTI/WebSocket backend externo.

**UCs en scope activo:** 4 UCs del GRUPO A + 2 UCs acc-04/perm-01
(total: 6 UCs a implementar en este WP)

---

## Hallazgos por dominio

### Dominio 1: UCs parciales de reportes (uc-rpt-07, rpt-08, rpt-02)

**uc-rpt-07 y uc-rpt-08:**

- Causa raíz: componente `ScheduledReports.jsx` creado en
  `components/pages/Analytics/` sin completar el ciclo completo
  (componente → página → ruta → servicio → RBAC).
- El comentario en AppRouter línea 232 menciona "UC-RPT-07, 08" pero
  no existe ninguna route para ellos.
- Esfuerzo real: ambos UCs pueden compartir una página con dos tabs
  (Crear/Gestionar) + 5 tareas atómicas total.

**uc-rpt-02:**

- Re-clasificado de "parcial" a "no implementado".
- `PerformanceMetricsPage.jsx` cubre métricas de infraestructura, NO
  métricas operacionales de call center (llamadas en cola, agentes, SL).
- Requiere polling sub-minuto (30s) con mock-first hasta que el backend
  exponga el endpoint de métricas en tiempo real.
- Esfuerzo: ~4 tareas atómicas.

### Dominio 2: UC de pipeline (uc-pip-01)

- Re-clasificado de "parcial" a "no implementado".
- Los 3 UCs companion (pip-02, pip-03, pip-04) están implementados y
  routed. pip-01 (overview/health) es el punto de entrada natural de
  la sección ETL — su ausencia es un gap de navegación.
- Backend: mock-first usando la misma estructura de `logsSlice.js`.
- Esfuerzo: ~3 tareas atómicas.

### Dominio 3: Solapamiento acc-04 / perm-01

- R-005 parcialmente cerrado: acc-03 vs perm-10 son funcionalidades
  distintas — no hay conflicto real.
- acc-04 vs perm-01: solapamiento INTENCIONAL documentado en ADR-GOB-008
  del corpus. Son la misma operación backend con 2 entry points de UI.
- Estrategia: componente compartido `AssignGroupPage.jsx` con route
  canónica. Evita duplicación de lógica.
- Esfuerzo: ~3 tareas atómicas.

---

## Mapa de gaps revisado (scope activo)

| UC | Estado en Phase 1 | Estado real (Phase 3) | Tareas est. |
|----|-------------------|-----------------------|-------------|
| uc-rpt-07 | Parcial | Parcial — falta página + route + form + service | ~3 |
| uc-rpt-08 | Parcial | Parcial — falta detail + actions + route | ~2 |
| uc-rpt-02 | Parcial | No implementado | ~4 |
| uc-pip-01 | Parcial | No implementado | ~3 |
| uc-acc-04 | — | No implementado (sin página taggeada) | ~2 |
| uc-perm-01 | — | No implementado (sin route /permissions/*) | ~1* |

*uc-perm-01 se implementa como entry point adicional al mismo componente
de acc-04, por lo que el esfuerzo es mínimo si acc-04 se resuelve primero.

**Total: ~15 tareas atómicas**

---

## Riesgos actualizados

| ID | Estado | Cambio |
|----|--------|--------|
| R-001 | CERRADO — uc-opr-* excluido | Decisión de usuario |
| R-002 | CERRADO — uc-sup-* excluido | Decisión de usuario |
| R-003 | REDUCIDO | rpt-02 usa polling 30s — no requiere arquitectura nueva |
| R-004 | REDUCIDO | ~6 UCs vs 10 pages — menor riesgo de regression |
| R-005 | REVISADO | acc-03 vs perm-10: no hay conflicto; acc-04 vs perm-01: componente compartido |

---

## Decisiones pendientes (Phase 5)

1. **rpt-07/rpt-08:** ¿Una página con tabs o dos rutas separadas?
   Recomendación: una página `ScheduledReportsPage.jsx` con tabs
   Create/Manage en `/reports/scheduled`.

2. **acc-04/perm-01:** ¿Route canónica única o duplicar en ambos módulos?
   Recomendación: route canónica `/access/assign-group` + redirección
   desde el módulo Permissions si se agrega nav link ahí.

3. **rpt-02:** ¿Polling en Redux thunk o estado local con useEffect?
   Recomendación: estado local con `setInterval` en custom hook
   `useRealTimeMetrics()` — evita polución del store global con datos
   efímeros que se invalidan cada 30s.

---

## Exit criteria Phase 3 — completados

- [x] Dominios analizados: parciales-reportes, pipeline, acc-perm-overlap
- [x] Causas raíz identificadas (no solo síntomas)
- [x] Scope ajustado (uc-opr/sup/cli excluidos)
- [x] Riesgos actualizados (R-001/R-002 cerrados, R-003/R-004/R-005 revisados)
- [x] Síntesis cross-domain creada
