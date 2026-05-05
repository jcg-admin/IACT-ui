```yml
project: IACT-UI
work_package: 2026-05-05-22-50-40-spinner-components-audit
created_at: 2026-05-05 22:50:40
updated_at: 2026-05-05 22:50:40
current_phase: Phase 1 — DISCOVER
open_risks: 2
mitigated_risks: 0
closed_risks: 0
author: NestorMonroy
```

# Risk Register — spinner-components-audit

## Matriz de riesgos

| ID | Descripción | Probabilidad | Impacto | Severidad | Estado | Dueño |
|----|-------------|:------------:|:-------:|:---------:|--------|-------|
| R-001 | Cambio de spinner en `FormStepper` rompe tests visuales o de comportamiento | media | bajo | media | abierto | NestorMonroy |
| R-002 | Eliminar props dead code de `LoadingSpinner` rompe usos no detectados con grep | baja | medio | baja | abierto | NestorMonroy |

## Detalle de riesgos

### R-001: Cambio en FormStepper rompe tests

**Descripción**
`FormStepper` tiene tests que pueden verificar el mensaje "Processing..." o la
presencia de `AnimatedLoadingSpinner`. Si se cambia al `LoadingSpinner`, los
tests que buscan el componente por nombre o clase CSS fallarán.

**Probabilidad**: media
**Impacto**: bajo (fix mecánico de tests)
**Severidad**: media
**Estado**: abierto

**Mitigación**
- Verificar tests de `FormStepper` antes de cambiar el componente
- Actualizar tests en el mismo commit que el cambio de componente

**Plan de contingencia**
- `git revert` si el cambio rompe más de lo esperado

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 2026-05-05 | Phase 1 | Identificado | NestorMonroy |

---

### R-002: Dead code en LoadingSpinner oculta usos dinámicos

**Descripción**
`grep` busca usos estáticos. Si algún componente pasa `fullScreen` o `overlay`
dinámicamente como prop spread (`<LoadingSpinner {...props} />`), un grep estático
no lo detectaría.

**Probabilidad**: baja
**Impacto**: medio (regresión silenciosa si fullScreen se activa dinámicamente)
**Severidad**: baja
**Estado**: abierto

**Mitigación**
- Buscar también prop spread patterns: `grep -rn "...props\|...rest\|...spinnerProps"`
- Verificar build y tests antes de eliminar props

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 2026-05-05 | Phase 1 | Identificado | NestorMonroy |

---

## Riesgos cerrados

*(Ninguno aún)*

## Checklist de gestión

- [x] Riesgos identificados en Phase 1
- [x] Cada riesgo tiene plan de contingencia
- [ ] Registro actualizado al final de cada fase
- [ ] Riesgos materializados referenciados en `context/errors/`
