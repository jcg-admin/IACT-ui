# Lesson: HOCs — Evaluados y Descartados

> **Estado:** Este patrón fue implementado, analizado y removido.
> El proyecto tiene soluciones superiores para cada caso de uso
> donde un HOC sería válido.

---

## Qué se implementó

Tres HOCs en `src/hocs/`:

- `withAuth(Component)` — redirigir si no autenticado
- `withPermission(Component, roles)` — bloquear por rol
- `withLoading(Component)` — mostrar spinner mientras `isLoading`

## Por qué se removió

### 1. El proyecto ya tiene dueño para cada caso

| HOC implementado | Solución existente | Por qué la existente gana |
|------------------|--------------------|---------------------------|
| `withAuth` | `ProtectedRoute` (router) | Opera en la capa correcta: el router. Centralizado, no por-componente. |
| `withPermission` | `PermissionGate` / `PermissionGateAny` / `PermissionGateAll` | Declarativo en JSX, granularidad de permisos reales (no solo roles), callbacks de analytics, render prop para casos avanzados. |
| `withLoading` | Condicional inline | Cero indirección, legible en contexto, no necesita wrapping. |

Agregar HOCs crea una segunda forma de resolver el mismo problema sin
beneficio. Eso es deuda de coherencia: el siguiente desarrollador tiene
que elegir entre dos caminos sin criterio claro.

### 2. HOCs agregan indirección que las alternativas no necesitan

Un HOC introduce tres capas invisibles: la función HOC, el componente
envuelto, y el componente resultante. En DevTools aparece como
`withAuth(MyPage)` en lugar de `MyPage`. La depuración requiere saltar
mentalmente esa capa extra.

`ProtectedRoute` y `PermissionGate` son componentes React normales —
aparecen como tales en DevTools, en el árbol JSX, y en los tests.

### 3. `PermissionGate` opera sobre permisos granulares, no roles

El HOC `withPermission` que implementamos comparaba `user.role` (un string)
contra una lista. `PermissionGate` usa `usePermisos()` que evalúa
capacidades reales del sistema (e.g. `"sistema.administracion.usuarios.editar"`).
Eso es más preciso y alinea con el modelo de seguridad del backend.

Reemplazar `PermissionGate` con un HOC de roles habría sido un retroceso
en granularidad.

### 4. El argumento React 19 — precisión

Se citó "React 19 orienta hacia esto". Es parcialmente verdad, pero el
timing correcto es React 16.8 (2019): los hooks eliminaron el caso de uso
principal de los HOCs (compartir lógica con estado sin repetición). Desde
entonces, los HOCs válidos son solo los de guard-on-render — exactamente
los que este proyecto ya cubre con componentes declarativos.

React 19 agrega presión adicional únicamente en arquitecturas con Server
Components: un HOC siempre produce un Client Component, lo cual puede
romper la composición RSC. Para este proyecto (SPA puro), ese argumento
no aplica hoy — pero tampoco cambia la conclusión.

---

## El patrón correcto para cada caso

### Auth guard → `ProtectedRoute` en el router

```jsx
// src/router/AppRouter.jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

Centralizado: un lugar define qué rutas requieren auth. No se repite
en cada componente.

### Permisos granulares → `PermissionGate` en JSX

```tsx
// Dentro del componente, solo alrededor de lo que debe protegerse
<PermissionGate
  permission="sistema.administracion.usuarios.editar"
  fallback={<span className="text-muted">Sin acceso</span>}
>
  <button className="btn btn-primary">Editar usuario</button>
</PermissionGate>
```

Para múltiples permisos (ANY / ALL):

```tsx
<PermissionGateAny permissions={['sistema.vistas.dashboards.ver', 'sistema.vistas.metricas.ver']}>
  <DashboardNav />
</PermissionGateAny>
```

### Estado de carga → condicional inline

```jsx
function UserList({ users, isLoading }) {
  if (isLoading) return <LoadingSpinner />
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

Si el spinner se repite en muchos componentes con la misma configuración,
extraer a un componente — no a un HOC:

```jsx
function SectionLoader({ isLoading, children }) {
  return isLoading ? <LoadingSpinner size="sm" /> : children
}
```

---

## Cuándo un HOC sería válido en este proyecto

Un HOC tiene sentido cuando:

1. Se necesita interceptar el ciclo de vida del componente envuelto
   (e.g. medir tiempo de render, error boundaries por tipo de feature)
2. La lógica no puede expresarse como un componente en JSX porque
   necesita operar sobre la definición del componente, no sobre su output
3. No existe ya una solución declarativa para ese caso

En el estado actual del proyecto, ningún caso activo cumple esas condiciones.

---

Ver:
- `src/components/shared/ProtectedRoute.jsx`
- `src/components/PermissionGate.tsx`
- `src/hooks/usePermisos.ts`
- `docs/guides/scss-page-patterns.md` (otro patrón evaluado y descartado: CSS Modules)
