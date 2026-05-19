```yml
project: IACT-UI
work_package: 2026-05-06-02-07-30-uc-full-implementation
created_at: 2026-05-06 02:07:30
updated_at: 2026-05-06 05:31:18
current_phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
```

# Risk Register — uc-full-implementation

## Riesgos activos

_(ninguno — todos cerrados al completar Phase 10)_

---

## Riesgos cerrados

| ID | Riesgo | Resultado real |
|----|--------|---------------|
| R-01 | Backend sin endpoints para UCs nuevos (perm-01/02, pip-03/04, rpt-11) | **No se materializó** — mock-first pattern absorbió completamente. 10 UCs implementados con mocks. Los endpoints reales se activarán cuando el backend esté listo. Deuda registrada como TD-P-001. |
| R-02 | Scope creep: WP muy grande | **Mitigado** — el plan de 7 ITERs con 67 tareas y commits por ITER mantuvo el scope controlado. Se implementaron exactamente los 13 UCs + 2 INFRA planificados. |
| R-03 | Decisiones de alcance borderline (uc-opr-08) | **No aplicó** — uc-opr-08 quedó fuera de scope (out-of-scope documentado en task plan). Sin impacto en ejecución. |
| R-04 | Duplicación de lógica entre UCs similares (perm-01/02 vs acc-01/02) | **Mitigado por diseño** — `GroupAssignModal` con prop `mode='assign'/'revoke'` reutilizó exactamente el componente base para ambos UCs sin duplicación. |
| R-05 | Regresiones en 1460 tests existentes | **Ocurrió parcialmente** — 5 suites de tests rotos en e8d0ba6 (mock drift). Todos resueltos en el mismo commit. Resultado final: 0 regressions, 1551 tests passing. Impacto real: ~1 hora de corrección. |
| R-06 | UCs parciales requieren refactor de páginas existentes | **Mitigado** — cambios quirúrgicos en páginas existentes. Sin reescrituras completas. El patrón agregar-sin-romper se mantuvo. |
| R-07 | Permisos RBAC no mapeados para nuevas rutas | **Mitigado** — `INFRA-02` (T-003) agregó las 4 constantes necesarias en `FunctionCatalog` antes de cualquier ruta nueva. Las 2 rutas nuevas usan permisos correctos. |
| R-08 | Diseño UX inconsistente entre UCs | **No se materializó** — todos los UCs usaron patrones establecidos: `ConfirmModal` para acciones destructivas, `SavedFiltersPanel` para vistas guardadas, `ShareReportModal` para compartir. |
