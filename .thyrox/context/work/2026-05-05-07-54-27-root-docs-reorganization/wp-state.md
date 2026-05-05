```yaml
project: IACT-UI
work_package: 2026-05-05-07-54-27-root-docs-reorganization
created_at: 2026-05-05 07:54:27
current_phase: Phase 1 — DISCOVER
flow: thyrox
methodology_step: workflow-discover
author: NestorMonroy
status: in_progress
epic: ÉPICA 2 — Reorganización de documentación raíz
blockers: []
agents: []
```

# WP — Reorganización de archivos sueltos en raíz → docs/

## Propósito

75 archivos sueltos (51 `.md`, 20 `.txt`, 2 `.sh`, 2 `.jsx`) ocupan la raíz
del repositorio contaminando el espacio de configuración. Clasificarlos y
moverlos a `docs/` (que ya existe con estructura parcial) o eliminar los
que son puramente históricos/obsoletos.

## Alcance

- Clasificar los 75 archivos por categoría (documentación activa, análisis
  técnico, histórico de sesión, scripts, ejemplos)
- Identificar duplicados respecto a `docs/` existente
- Definir estructura target para `docs/`
- Mover/eliminar/mantener según análisis
- Actualizar `docs/DOCUMENTATION_STRUCTURE.md`

## Referencias

- WP anterior: `2026-05-05-07-45-30-registry-audit-iact-ui` (CERRADO)
- Branch: `feature/project-structure-analysis`
