```yaml
project: IACT-UI
work_package: 2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup
created_at: 2026-05-05 07:32:33
current_phase: Phase 5 — STRATEGY
flow: thyrox
methodology_step: workflow-strategy
author: NestorMonroy
status: in_progress
epic: ÉPICA 1 — Adaptación del framework THYROX a IACT-UI
blockers: []
agents:
  - id: deep-dive
    type: adversarial
    status: completed
    output_file: discover/iact-ui-context-cleanup-and-setup-analysis.md
  - id: task-planner
    type: planning
    status: completed
    output_file: strategy/iact-ui-context-cleanup-solution-strategy.md
```

# WP — Limpieza de contexto foráneo y setup del framework THYROX para IACT-UI

## Propósito

El repositorio IACT-UI heredó al hacer merge con `develop` un directorio
`.thyrox/context/` que contiene contexto completo de dos proyectos ajenos:
**IACT-docs** (documentación Sphinx) y **THYROX** (framework base de
gestión de proyectos). Este contenido foráneo ocupa espacio, genera
confusión y no aporta nada al proyecto React actual.

Este WP tiene dos objetivos:

1. **Limpiar** todo el contenido de `.thyrox/context/` que pertenece a
   proyectos anteriores (decisions, work, lessons, patterns, errors, research,
   archivos raíz de IACT-docs).

2. **Inicializar** el contexto THYROX desde cero para IACT-UI, con
   documentación, decisions y project-state adaptados a un dashboard React 19
   + Redux Toolkit + Webpack.

## Alcance

### Incluido

- Auditoría completa de `.thyrox/context/` — categorizar cada archivo/directorio
- Eliminación de contenido foráneo (decisions, work, lessons, patterns, errors, research)
- Reescritura de archivos raíz del contexto (`project-state.md`, `focus.md`,
  `now.md`, `technical-debt.md`, `knowledge-base.md`) adaptados a IACT-UI
- Creación de las primeras ADRs propias de IACT-UI en `decisions/`
- Registro de los problemas encontrados y corregidos en esta sesión

### Excluido

- Modificación de `.thyrox/bin/`, `.thyrox/registry/`, `.thyrox/guidelines/`
  (infraestructura del framework — se mantiene intacta)
- Modificación de `.claude/` (configuración de Claude Code)
- Cambios al código fuente React en `src/`

## Entrada (Input)

- Análisis previo de `.thyrox/context/` realizado en sesión actual
- Conocimiento del proyecto IACT-UI: React 19 + Redux Toolkit + Webpack 5,
  dashboard de analytics para IVR/call center
- Problemas ya identificados y corregidos en la sesión:
  - Bug crítico: `permissions.json` sin campo `icono`
  - ESLint sin configuración
  - TypeScript sin soporte en Babel/Jest
  - 23 vulnerabilidades de seguridad (reducidas a 4)
  - Cobertura de tests por debajo del 80%
  - Merge con `develop` integrado

## Salida esperada (Output)

- `.thyrox/context/` limpio: solo contenido de IACT-UI
- `project-state.md` actualizado con el stack y estado real de IACT-UI
- `focus.md` apuntando a los próximos objetivos de IACT-UI
- `technical-debt.md` con la deuda técnica real encontrada
- `decisions/` con ADRs iniciales de IACT-UI
- `CLOSURE-NOTICE.md` al cerrar el WP

## Referencias

- Análisis de `.thyrox/context/` — sesión 2026-05-05
- Branch activo: `feature/project-structure-analysis`
