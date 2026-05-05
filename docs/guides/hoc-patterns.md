# Guía de HOCs (Higher-Order Components)

## Qué es un HOC

Un Higher-Order Component es una función que recibe un componente y devuelve
un componente nuevo con comportamiento adicional.

```jsx
function withX(WrappedComponent) {
  function Enhanced(props) {
    return <WrappedComponent {...props} />
  }
  Enhanced.displayName = `withX(${WrappedComponent.displayName ?? WrappedComponent.name})`
  return Enhanced
}
```

Los HOC **no modifican** el componente original — lo envuelven. Siempre se
nombra el componente interno y se le asigna `displayName` para que aparezca
correctamente en React DevTools.

---

## HOCs disponibles en `src/hocs/`

### `withAuth` — Protección de autenticación

Redirige a `/login` si el usuario no está autenticado. Muestra un spinner
mientras el estado de auth se resuelve.

```jsx
import { withAuth } from '@hocs'

function AdminPage() {
  return <div>Solo para usuarios autenticados</div>
}

export default withAuth(AdminPage)
```

**Con ruta de redirección personalizada:**

```jsx
export default withAuth(AdminPage, { redirectTo: '/acceso-denegado' })
```

**Lee de Redux:** `state.auth.isAuthenticated`, `state.auth.loading`

---

### `withPermission` — Control de roles

Muestra un banner de error si el rol del usuario no está en la lista
de roles permitidos.

```jsx
import { withPermission } from '@hocs'

function AdminPanel() {
  return <div>Panel de administración</div>
}

// Un solo rol
export default withPermission(AdminPanel, 'admin')

// Varios roles
export default withPermission(AdminPanel, ['admin', 'superadmin'])
```

**Con fallback personalizado:**

```jsx
const AccessDenied = () => <p>Sin acceso.</p>

export default withPermission(AdminPanel, 'admin', AccessDenied)
```

**Lee de Redux:** `state.auth.user.role`

---

### `withLoading` — Estado de carga

Muestra un `LoadingSpinner` mientras `isLoading` sea `true`. El prop
`isLoading` es consumido por el HOC y **no** se pasa al componente envuelto.

```jsx
import { withLoading } from '@hocs'

function UserList({ users }) {
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

const UserListWithLoading = withLoading(UserList)

// Uso:
<UserListWithLoading isLoading={isLoading} users={users} />
```

**Con mensaje y tamaño de spinner:**

```jsx
const UserListWithLoading = withLoading(UserList, {
  spinnerSize: 'lg',
  message: 'Cargando usuarios…',
})
```

**Props:**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isLoading` | `boolean` | — | Si es `true`, muestra el spinner |
| `spinnerSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del spinner (opción de HOC) |
| `message` | `string \| null` | `null` | Texto bajo el spinner (opción de HOC) |

---

## Composición de HOCs

Los HOCs se pueden componer. El orden importa: el más externo se aplica primero.

```jsx
import { withAuth, withPermission, withLoading } from '@hocs'

// Autenticado + rol admin + estado de carga
const AdminDashboardWithLoading = withLoading(AdminDashboard)
const AdminDashboardProtected = withPermission(AdminDashboardWithLoading, 'admin')
export default withAuth(AdminDashboardProtected)
```

---

## HOCs vs Hooks — cuándo usar cada uno

| Situación | Preferir |
|-----------|----------|
| Lógica de render condicional (redirect, fallback, spinner) | HOC |
| Lógica de estado reutilizable sin cambiar el render | Hook |
| Wrapping de múltiples componentes con el mismo guard | HOC |
| Lógica específica de un solo componente | Hook |

Los HOCs de este proyecto son **guards de render**: deciden si el componente
se muestra o no. Para lógica de datos reutilizable, usar hooks (`useAuth`,
`useJobs`, etc. en `src/hooks/`).

---

## Diferencia con `src/decorators/`

| | `src/decorators/` | `src/hocs/` |
|---|---|---|
| Qué envuelven | Funciones de servicio | Componentes React |
| Cuándo aplican | En llamadas a funciones | En render |
| Ejemplos | `withCaching`, `withLogging`, `withValidation` | `withAuth`, `withPermission`, `withLoading` |

Los decorators son el **patrón Decorator** aplicado a funciones JS.
Los HOCs son el **patrón HOC** de React — son componentes que devuelven componentes.

---

## Archivos de referencia

- HOCs: `src/hocs/`
- Decorators: `src/decorators/`
- Selectors de auth: `src/redux/selectors/authSelectors.js`
- LoadingSpinner: `src/components/shared/LoadingSpinner.jsx`
- ProtectedRoute (componente alternativo): `src/components/shared/ProtectedRoute.jsx`
