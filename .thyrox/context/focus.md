```yaml
type: Focus Actual
version: 1.0
project: IACT-UI
updated_at: 2026-05-05 07:32:33
branch: feature/project-structure-analysis
wp_activo: 2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup
```

# Focus — IACT-UI

## Iniciativa Actual

**ÉPICA 1 — Adaptación del framework THYROX a IACT-UI**

**WP activo:** `2026-05-05-07-32-33-iact-ui-context-cleanup-and-setup`
**Fase actual:** Phase 1 DISCOVER completada → avanzando a Phase 5 STRATEGY
**Branch:** `feature/project-structure-analysis`

Limpieza de contexto foráneo heredado de IACT-docs/THYROX y setup del
framework para el proyecto IACT-UI real.

## Lo que se hizo en esta sesión (2026-05-05)

- Instalación de dependencias y análisis completo del proyecto
- Corrección de bug crítico en `permissions.json` (campo `icono` faltante)
- Creación de `.eslintrc.cjs` con soporte React + TypeScript
- Adición de `@babel/preset-typescript` en Babel y Jest
- `npm audit fix`: vulnerabilidades reducidas de 23 → 4
- Fix de `useEffect` condicional en `PermissionGate.tsx` y `ProtectedRoute.tsx`
- Cobertura de tests llevada de 65% → 80%+ en todos los métricas
- Merge con `develop`: React 19, recharts, framer-motion, react-router-dom, etc.
- Resolución de configs duplicadas (jest.config.js, babel.config.js)
- Análisis profundo de `.thyrox/context/` — todo el contenido era foráneo a IACT-UI

## Próximo objetivo

Ejecutar limpieza de `.thyrox/context/` y reescritura de archivos raíz
adaptados a IACT-UI (Phase 5-8 del WP activo).

## Backlog inmediato

1. Limpiar contenido foráneo de `.thyrox/context/`
2. Reescribir project-state, technical-debt, knowledge-base para IACT-UI
3. Crear ADRs iniciales de IACT-UI (Webpack, Redux, RBAC, mock system)
4. Resolver 37 test suites fallando por paths incorrectos en develop
