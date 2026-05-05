```yaml
id: ADR-003
title: Sistema de permisos RBAC client-side
status: Aceptado
date: 2026-05-05
project: IACT-UI
```

# ADR-003 — Sistema de permisos RBAC client-side

## Contexto

El sistema requiere que distintos roles de usuario vean distintas secciones
del dashboard. Los permisos se definen en el backend y se consultan al inicio
de sesión.

## Decisión

Implementar RBAC client-side con tres capas:

1. **`usePermisos` hook** (`src/hooks/usePermisos.ts`) — obtiene y cachea
   permisos del usuario. Expone `hasPermission(capability: string): boolean`
2. **`PermissionGate`** (`src/components/PermissionGate.tsx`) — renderiza
   hijos solo si el usuario tiene el permiso. Soporta variantes `Any` y `All`
3. **`ProtectedRoute`** (`src/components/ProtectedRoute.tsx`) — redirige a
   `/access-denied` si no hay permiso. Soporta variantes `Any` y `All`

## Notación de capacidades

```
sistema.{dominio}.{recurso}.{accion}
Ejemplo: sistema.vistas.dashboards.ver
         sistema.operaciones.llamadas.realizar
         sistema.administracion.usuarios.editar
```

## Uso

```tsx
// Contenido condicional
<PermissionGate permission="sistema.vistas.dashboards.ver">
  <Dashboard />
</PermissionGate>

// Ruta protegida (requiere react-router-dom)
<ProtectedRoute permission="sistema.administracion.usuarios.ver">
  <UserAdmin />
</ProtectedRoute>
```

## ⚠️ Advertencia crítica

**Esta verificación es SOLO para UX.** El backend SIEMPRE debe verificar
permisos en cada endpoint. El client-side no es seguridad real.

## Consecuencias

- Los permisos se cachean con TTL de 5 minutos
- El mock de permisos (`src/mocks/permissions.json`) debe incluir el campo
  `icono` en cada entrada de `funciones_accesibles` (bug corregido 2026-05-05)
- `useEffect` no puede llamarse tras `return` condicional (bug corregido
  2026-05-05 — violación de Rules of Hooks)
