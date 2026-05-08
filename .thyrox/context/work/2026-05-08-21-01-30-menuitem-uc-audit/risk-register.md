```yml
created_at: 2026-05-08 21:04:29
updated_at: 2026-05-08 21:04:29
project: THYROX
work_package: 2026-05-08-21-01-30-menuitem-uc-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Risk Register — menuitem-uc-audit

| ID | Riesgo | Prob | Impacto | Mitigación |
|----|--------|------|---------|------------|
| R-01 | GAP-01 requiere cambiar la firma del thunk `transitionMenuItemStatus` → breaking change en tests existentes | Alta | Alto | Migrar tests en el mismo PR; no dejar tests rotos |
| R-02 | 4 nuevos mocks de endpoints pueden colisionar con el dispatcher actual de mockInterceptor (orden de URL matching) | Media | Medio | Registrar los mocks dedicados ANTES del handler genérico |
| R-03 | Reducers nuevos para 4 transiciones → duplicación de lógica de update en state | Baja | Bajo | Usar función helper `updateMenuItemInState(state, payload)` |
| R-04 | GAP-04 (filtros) puede arrastrarse al scope si la UI requiere selects → out of scope explícito | Media | Bajo | Limitar fix a gateway+mock, sin UI de filtros |
