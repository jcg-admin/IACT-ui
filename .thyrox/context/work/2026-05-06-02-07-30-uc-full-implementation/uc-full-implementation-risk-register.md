```yml
project: IACT-UI
work_package: 2026-05-06-02-07-30-uc-full-implementation
created_at: 2026-05-06 02:07:30
updated_at: 2026-05-06 02:07:30
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
```

# Risk Register — uc-full-implementation

## Riesgos activos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|-----------|
| R-01 | Backend sin endpoints para UCs nuevos (perm-01/02, pip-03/04, rpt-11) | Alta | Alto | Implementar con mocks primero; marcar como "pendiente de backend" en spec |
| R-02 | Scope creep: 68 UCs en scope = WP muy grande, puede fragmentarse | Alta | Medio | Descomponer en grupos temáticos (G1..G6); ejecutar por grupo, no en bloque |
| R-03 | Decisiones de alcance borderline (uc-opr-08 agente dashboard) | Media | Bajo | Gate de scope en Phase 3 — documentar decisión como ADR |
| R-04 | Duplicación de lógica entre UCs similares (perm-01/02 vs acc-01/02) | Media | Medio | Analizar componentes reutilizables en Phase 7 antes de implementar |
| R-05 | Regresiones en 1460 tests existentes al agregar nuevos flujos | Baja | Alto | CI: correr full suite en cada commit; TDD para UCs con lógica compleja |
| R-06 | UCs parciales (13) requieren refactor de páginas existentes | Media | Medio | Cambios quirúrgicos; no reescribir páginas completas salvo que sea necesario |
| R-07 | Permisos RBAC no mapeados para nuevas rutas | Media | Medio | Revisar FunctionCatalog en Phase 7; agregar permisos antes de routear |
| R-08 | Diseño UX inconsistente entre UCs de distintos módulos | Media | Bajo | Usar patrones establecidos (modal de confirmación, tabla+acciones inline) |

## Riesgos cerrados

_(ninguno aún)_
