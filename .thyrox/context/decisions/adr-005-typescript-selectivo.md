```yaml
id: ADR-005
title: TypeScript selectivo vía Babel
status: Aceptado
date: 2026-05-05
project: IACT-UI
```

# ADR-005 — TypeScript selectivo vía Babel

## Contexto

El proyecto es principalmente JavaScript pero algunos módulos de alto riesgo
(permisos, tipos de API) se benefician del tipado estático.

## Decisión

Usar TypeScript de forma **selectiva**: archivos `.ts`/`.tsx` transpilados
por `@babel/preset-typescript`, sin `tsconfig.json` estricto por ahora.

## Archivos TypeScript actuales

```
src/components/PermissionGate.tsx   — componente RBAC
src/components/ProtectedRoute.tsx   — guard de rutas
src/hooks/usePermisos.ts            — hook de permisos
src/lib/permisos-client.ts          — cliente de permisos
src/config/api.config.ts            — configuración de API
src/types/permisos.types.ts         — tipos de permisos
```

## Configuración aplicada (2026-05-05)

```js
// babel.config.cjs
'@babel/preset-typescript'  // en presets globales y env.test

// jest.config.cjs
moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json']
transform: { '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest' }
```

## Limitaciones

- **Sin type-checking real:** Babel elimina tipos sin verificarlos
- **Sin `tsconfig.json`:** No hay configuración de compilador TypeScript
- Ver **TD-002** para el plan de añadir `tsc --noEmit` en CI

## Consecuencias

- ESLint usa `@typescript-eslint/parser` para archivos `.ts`/`.tsx`
- La regla `no-undef` está deshabilitada en TS (el parser la maneja)
- La cobertura de Jest solo mide archivos `.js`/`.jsx` actualmente
- Los tipos DOM (`HeadersInit`, `RequestInit`) no requieren imports explícitos
