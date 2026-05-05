```yml
created_at: 2026-05-05 19:25:21
updated_at: 2026-05-05 19:25:21
project: THYROX
work_package: 2026-05-05-19-25-21-scss-variables-audit
current_phase: Phase 1 — DISCOVER
author: NestorMonroy
```

# Risk Register — scss-variables-audit

| ID | Riesgo | Prob | Impacto | Mitigación | Estado |
|----|--------|------|---------|-----------|--------|
| R-01 | Eliminar redefinición de `.btn` en páginas rompe apariencia si iact-kit tiene diferencias visuales | Media | Alto | Verificar visualmente cada página tras remover; mantener clases custom legítimas (`.btn-action`, `.btn-edit`) en SCSS de página con nombre específico | Abierto |
| R-02 | Doble definición de `.table` (_table.scss + _tables.scss) genera especificidad conflictiva en runtime | Baja | Medio | Consolidar en un solo archivo antes de aplicar variables | Abierto |
| R-03 | Variables de grises (`#6b7280`, `#f3f4f6`, etc.) sin equivalente en `_variables.scss` quedan hardcodeadas | Alta | Bajo | Decidir: extender variables o documentar excepción; no dejar ambigüedad | Abierto |
| R-04 | CSS custom properties `var(--color-xxx)` en _alert-item, _alert-list, _progress-bar pueden estar sin definir | Alta | Medio | Auditar con DevTools en dev; reemplazar por SCSS variables o definir los custom props | Abierto |
| R-05 | Los `.module.scss` de navegación (CSS Modules) no pueden usar clases globales de iact-kit directamente | Baja | Medio | Los CSS Modules son scope local por diseño; mantener valores; solo aplicar variables SCSS | Abierto |
