```yaml
id: ADR-006
title: Cobertura mínima de tests del 80%
status: Aceptado
date: 2026-05-05
project: IACT-UI
```

# ADR-006 — Cobertura mínima de tests del 80%

## Contexto

El proyecto necesita un umbral de calidad que prevenga regresiones y garantice
que el código nuevo es verificable.

## Decisión

Mantener un **umbral mínimo de 80%** en las cuatro métricas de cobertura,
configurado en `jest.config.cjs` para que el pipeline de tests falle si no se
cumple.

## Configuración

```js
// jest.config.cjs
coverageThreshold: {
  global: {
    branches:   80,
    functions:  80,
    lines:      80,
    statements: 80,
  },
},
collectCoverageFrom: [
  'src/**/*.{js,jsx}',
  '!src/index.jsx',
  '!src/**/*.test.{js,jsx}',
  '!src/**/*.spec.{js,jsx}',
  '!src/reportWebVitals.js',
],
```

## Estado actual (2026-05-05)

| Métrica | Valor |
|---------|-------|
| Statements | 89.33% ✅ |
| Branches | 80.25% ✅ |
| Functions | 88.00% ✅ |
| Lines | 89.15% ✅ |

## Convención de tests

- Los tests se colocan junto al código que prueban (`*.test.js` / `*.test.jsx`)
- Los tests de integración van en `tests/integration/`
- Los tests de componentes aislados van en `__tests__/`
- Usar `@testing-library/react` para componentes React
- Usar `renderHook` + `act` para hooks con estado Redux

## Consecuencias

- Nuevas features deben incluir tests o el pipeline falla
- La cobertura de archivos `.ts`/`.tsx` no se mide aún (ver ADR-005)
- Los 37 test suites heredados de `develop` que fallan (TD-001) no afectan
  el umbral actual porque no corren — pero deben corregirse
