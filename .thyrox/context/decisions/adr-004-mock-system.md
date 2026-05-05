```yaml
id: ADR-004
title: Mock system con fallback resiliente
status: Aceptado
date: 2026-05-05
project: IACT-UI
```

# ADR-004 — Mock system con fallback resiliente

## Contexto

Durante desarrollo y testing, el backend puede no estar disponible. El
frontend debe poder operar con datos locales sin cambios de código.

## Decisión

Implementar un patrón de **servicio resiliente** que intenta la API real y
cae automáticamente a datos mock JSON si falla.

## Implementación

```
src/services/createResilientService.js  — factory principal
src/services/utils/fetchWithFallback.js — fetch con lógica de fallback
src/services/flags/backendIntegrity.js  — flags por dominio
src/mocks/registry.js                   — carga y valida mocks
src/mocks/schemas.js                    — validadores de estructura
src/mocks/*.json                        — datos mock por dominio
```

## Uso

```js
const service = createResilientService({
  id: 'calls',
  endpoint: '/api/calls/',
  mockDataLoader: () => Promise.resolve(callsMock),
  shouldUseMock: () => shouldUseMockForDomain('calls'),
  isPayloadValid: (payload) => Array.isArray(payload?.llamadas),
});
```

## Dominios de mock disponibles

`health`, `config`, `permissions`, `llamadas`, `usuarios`, `dashboard`,
`configuracion`, `presupuestos`, `politicas`, `excepciones`, `reportes`,
`notifications`, `etl`, `dora`

## Consecuencias

- Cada mock JSON debe cumplir el schema definido en `schemas.js`
- Los schemas validan estructura obligatoria al cargar la app
- `MockDataNotice` muestra un banner cuando se usan datos mock
- `BackendStatusPanel` muestra el estado real del backend
- La variable `REACT_APP_MOCK_MODE=true` fuerza el modo mock global
