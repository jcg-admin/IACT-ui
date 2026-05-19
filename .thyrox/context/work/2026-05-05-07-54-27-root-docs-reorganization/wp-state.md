```yaml
project: IACT-UI
work_package: 2026-05-05-07-54-27-root-docs-reorganization
created_at: 2026-05-05 07:54:27
current_phase: Phase 11 — TRACK
flow: thyrox
methodology_step: workflow-track
author: NestorMonroy
status: completed
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

## Resultado

- Raíz: solo `README.md` + 11 archivos de configuración
- 47 archivos movidos íntegros a `docs/` con kebab-case
- 27 archivos históricos consolidados en 5 nuevos documentos antes de eliminar
- 1 `webpack.config.js` duplicado documentado y eliminado
- `docs/DOCUMENTATION_STRUCTURE.md` actualizado con nueva estructura completa
- Nuevos directorios: `docs/analysis/`, `docs/examples/`

## Referencias

- WP anterior: `2026-05-05-07-45-30-registry-audit-iact-ui` (CERRADO)
- Branch: `feature/project-structure-analysis`
