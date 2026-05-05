```yaml
id: ADR-001
title: Webpack 5 como bundler principal
status: Aceptado
date: 2026-05-05
project: IACT-UI
```

# ADR-001 — Webpack 5 como bundler principal

## Contexto

IACT-UI es una SPA React que necesita bundling, code splitting, alias de
módulos, proxy de API en desarrollo y optimización de producción.

## Decisión

Usar **Webpack 5** configurado en `webpack.config.cjs` como bundler principal.

## Configuración aplicada

- **Entry:** `src/index.jsx`
- **Output:** `dist/` con content hash para cache busting
- **Dev server:** Puerto 3000, hot reload, proxy `/api` → `http://localhost:8000`
- **Aliases de módulos:**
  ```
  @app        → src/app/
  @modules    → src/modules/
  @components → src/components/
  @hooks      → src/hooks/
  @state      → src/state/
  @services   → src/services/
  @mocks      → src/mocks/
  @styles     → src/styles/
  @/          → src/
  ```
- **Code splitting:** Vendor chunk separado + common chunks
- **Feature flags:** Variables de entorno via `DefinePlugin`

## Consecuencias

- Los alias `@components`, `@hooks`, etc. deben estar sincronizados entre
  `webpack.config.cjs` y `jest.config.cjs` (moduleNameMapper)
- Nuevos directorios de módulos requieren actualizar ambos archivos
- El build de producción genera hashes — requiere `html-webpack-plugin`
