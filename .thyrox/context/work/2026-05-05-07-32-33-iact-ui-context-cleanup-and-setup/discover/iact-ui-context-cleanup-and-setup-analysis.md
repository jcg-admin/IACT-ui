```yaml
created_at: 2026-05-05 07:32:33
project: IACT-UI
author: NestorMonroy
status: Completado
phase: Phase 1 — DISCOVER
```

# Phase 1 DISCOVER — Auditoría de `.thyrox/context/` en IACT-UI

## Pregunta investigada

¿Qué hay en `.thyrox/context/` del repositorio IACT-UI y qué acción
corresponde a cada sección?

## Hallazgos

### Diagnóstico general

**Todo el contenido heredado pertenece a proyectos ajenos.** El directorio
`.thyrox/context/` fue incluido en el repo IACT-UI durante el merge con
`develop` y contiene contexto completo de:

- **IACT-docs**: proyecto de documentación técnica basada en Sphinx/RST
- **THYROX**: framework de gestión de proyectos (el framework base)

### Inventario por sección

| Sección | N° archivos | Proyecto real | Acción |
|---------|-------------|--------------|--------|
| `decisions/` | ~35 ADRs | IACT-docs (Sphinx) | ELIMINAR |
| `work/` | 135 WPs | IACT-docs + THYROX | ELIMINAR |
| `lessons/` | 4 archivos | THYROX framework | ELIMINAR |
| `patterns/` | 10 archivos | THYROX + ADK + LangChain | ELIMINAR |
| `errors/` | 21 archivos | THYROX | ELIMINAR |
| `research/` | múltiples | THYROX | ELIMINAR |
| `project-state.md` | 1 | THYROX | REESCRIBIR |
| `focus.md` | 1 | IACT-docs | REESCRIBIR |
| `now.md` | 1 | IACT-docs | REESCRIBIR |
| `technical-debt.md` | 1 | IACT-docs | REESCRIBIR |
| `knowledge-base.md` | 1 | IACT-docs | REESCRIBIR |
| `decisions.md` | 1 (índice) | IACT-docs | REESCRIBIR |

### Contenido foráneo confirmado — ejemplos concretos

**decisions/**
- `adr-sphinx-configuration.md` — extensiones Sphinx para IACT-docs
- `adr-hierarchical-toctree-structure.md` — estructura RST de documentación
- `adr-postgresql.md` — decisión de base de datos para IACT-docs backend
- *Cero relación con React, Redux, Webpack o UI*

**work/** (135 work packages)
- `2026-04-28-01-58-08-source-rebuild-strategy` — reconstrucción de `source/`
  Sphinx con 16 WPs hijos
- `2026-04-22-21-15-30-phase1-discover-iact-docs` — descubrimiento del
  proyecto IACT-docs
- `2026-04-29-14-56-40-std007-rename-cleanup` — renombrado de archivos RST
- *Ninguno relacionado con frontend React*

**lessons/** (4 lecciones)
- L-001: Bulk-sed en documentación RST
- L-002: Script sin registrar en settings.json
- L-003: Variables de entorno en subagentes
- L-004: Timeout de agentes sin scope bound

**patterns/** (10 patrones)
- P-004 a P-009: Patrones de Google ADK (Python), LangChain, HITL
- *Totalmente irrelevantes para desarrollo frontend*

### Problemas reales de IACT-UI encontrados y corregidos en esta sesión

Estos sí son hallazgos propios de IACT-UI (ya resueltos):

| # | Problema | Severidad | Estado |
|---|---------|-----------|--------|
| 1 | `permissions.json` sin campo `icono` — 2 test suites fallando | Crítico | RESUELTO |
| 2 | ESLint sin archivo de configuración | Alto | RESUELTO |
| 3 | TypeScript sin soporte en Babel ni Jest | Alto | RESUELTO |
| 4 | 23 vulnerabilidades de seguridad (9 altas) | Alto | PARCIAL (→4 mod.) |
| 5 | `useEffect` tras `return` condicional en PermissionGate/ProtectedRoute | Alto | RESUELTO |
| 6 | Cobertura de tests <80% en todos los métricas | Medio | RESUELTO |
| 7 | `coverage/` no estaba en `.gitignore` | Bajo | RESUELTO |
| 8 | Merge `develop`: configs duplicadas (jest.config.js, babel.config.js) | Medio | RESUELTO |
| 9 | Tests de develop con paths incorrectos (~37 suites) | Medio | PENDIENTE |

### Deuda técnica IACT-UI identificada (no resuelta)

1. **37 test suites fallando** por paths incorrectos en tests heredados de
   `develop`. Ej: import `common/Sidebar/SidebarNav` pero archivo en
   `navigation/Sidebar/SidebarNav.jsx`
2. **4 vulnerabilidades moderadas** restantes que requieren `--force`
3. **Sin TypeScript estricto**: se usa `.ts`/`.tsx` pero sin `tsconfig.json`
   ni type-checking en CI
4. **Sin routing configurado**: `react-router-dom` está en dependencies pero
   no hay rutas definidas en el código visible
5. **Redux duplicado**: `homeSlice.js` existe en `src/state/slices/` Y en
   `src/modules/home/state/` — posible inconsistencia

## Próximos pasos

Este WP pasa a Phase 5 (STRATEGY) para decidir el plan de limpieza:

1. Eliminar contenido foráneo de `.thyrox/context/`
2. Reescribir archivos raíz con contenido de IACT-UI
3. Crear ADRs iniciales para IACT-UI
4. Documentar deuda técnica en `technical-debt.md`
5. Cerrar WP con `CLOSURE-NOTICE.md`
