```yml
created_at: 2026-05-05 14:04:38
project: IACT-UI
work_package: 2026-05-05-07-54-27-root-docs-reorganization
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Aprobado
```

# Lessons Learned — root-docs-reorganization

## Resumen del WP

Reorganización de 75 archivos de raíz del proyecto IACT-UI hacia subdirectorios
apropiados (`docs/`, `config/`, etc.) y unificación de `webpack.config.js` como
archivo único con export en formato función.

## Qué funcionó bien

- La unificación de webpack config en un solo archivo con `module.exports = (env, argv) => {}`
  fue directa — el formato función era ya el requerido por `scripts/lighthouse.js`.
- Los 8 aliases IACT-UI (`@components`, `@hooks`, `@store`, etc.) se preservaron sin rotura.
- La documentación en `docs/` permite encontrar rápidamente la configuración del proyecto.

## Qué se podría mejorar

- El merge de webpack.config.cjs en webpack.config.js requirió dos commits por un
  restore intermedio — una planificación más cuidadosa del order de operaciones
  hubiera evitado el commit de restauración.
- Los proxy files en `src/hooks/` y `src/components/common/` y `src/components/shared/`
  que se crearon en el WP siguiente (`test-failures-fix`) podrían haberse anticipado
  si se hubiera ejecutado `npm test` antes de cerrar este WP.

## Decisiones tomadas

- `webpack.config.cjs` eliminado — era redundante con `webpack.config.js` unificado.
- Formato función elegido sobre objeto estático para compatibilidad con `lighthouse.js`.
- Un único `webpack.config.js` en raíz — no se usa `webpack-merge` ni configuraciones
  separadas por entorno.

## Estado de cierre

- Todos los cambios commiteados y pusheados al remote.
- `npm test`: 97/97 suites pasando (771/771 tests) — verificado en WP siguiente.
- No quedan tareas pendientes de este WP.
