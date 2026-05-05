# Mock Interceptor Pattern

Patrón para mantener datos simulados en la capa de red, sin contaminar
los componentes ni los slices de Redux.

## Problema que resuelve

El enfoque común de inyectar datos mock directamente en los componentes
crea acoplamiento: cuando el backend esté listo, hay que modificar el
componente para quitar el mock.

```js
// ❌ Mock en el componente — hay que modificarlo cuando haya backend
function UserManagement() {
    const mockUsers = [{ id: 1, ... }, { id: 2, ... }]  // hardcodeado
    return <Table data={mockUsers} />
}
```

## Solución: MockInterceptor en la capa de red

Los mocks viven en `src/mocks/mockInterceptor.js`. Cuando `REACT_APP_USE_MOCKS=true`,
el interceptor retorna datos simulados antes de que el request llegue al backend.

```
Componente → dispatch(fetchUsers()) → userSlice thunk
    → userService.getUsers()
        → apiService.get('/api/users/')
            → [MockInterceptor intercepta aquí si REACT_APP_USE_MOCKS=true]
                → retorna { count: 1250, results: [...] }
```

El componente, el slice y el servicio son **idénticos** en dev y en prod.

## Cómo activar los mocks

```bash
# .env.development
REACT_APP_USE_MOCKS=true
REACT_APP_MOCK_DELAY=800   # ms de delay simulado de red (opcional)
```

Para pasar a producción: eliminar `REACT_APP_USE_MOCKS` del `.env`.
**Cero cambios en el código de la aplicación.**

## Estructura de MockInterceptor

```js
// src/mocks/mockInterceptor.js

class MockInterceptor {
    constructor() {
        this.enabled = process.env.REACT_APP_USE_MOCKS === 'true';
        this.mockDelay = 800;
    }

    async intercept(url, options) {
        if (!this.enabled) return null; // pass-through al backend real

        await this._delay(this.mockDelay); // simula latencia de red

        if (url.includes('/api/users')) return this._handleUsers(options.method, body);
        if (url.includes('/api/reports')) return this._handleReports(options.method, body);
        // ...
    }
}
```

## Agregar un nuevo endpoint mock

1. Agregar el handler en `mockInterceptor.js`:

```js
_handleReports(method, body) {
    if (method === 'GET') {
        return {
            status: 200,
            data: {
                results: this._generateMockMetrics(),
                count: 12,
            },
        };
    }
}

_generateMockMetrics() {
    return [
        { id: 1, label: 'Llamadas atendidas', value: 1234 },
        { id: 2, label: 'Tiempo promedio', value: 180 },
    ];
}
```

2. Registrar la ruta en `intercept()`:

```js
if (url.includes('/api/reports')) {
    return this._handleReports(method, body);
}
```

3. El servicio y el slice no necesitan ningún cambio.

## Convenciones para datos mock

Los datos simulados deben respetar el modelo de datos definido en IACT-docs:

| Campo | Tipo correcto | Tipo incorrecto |
|-------|--------------|-----------------|
| Estado de usuario | `state: 'ACTIVE'` (enum UC-USR-01) | `is_active: true` (boolean) |
| Respuesta paginada | `{ count, next, previous, results }` | array plano |
| Baja lógica | Response con `state: 'ELIMINATED'` | boolean `deleted: true` |

## Relación con tests

Los tests unitarios de servicios y slices **no usan MockInterceptor** — usan
`jest.mock()` directamente sobre el servicio:

```js
// src/services/__tests__/userService.test.js
jest.mock('../apiService', () => ({ get: jest.fn(), delete: jest.fn() }));

it('llama DELETE para deactivateUser', async () => {
    await userService.deactivateUser(5);
    expect(apiService.delete).toHaveBeenCalledWith('/api/users/5/');
});
```

MockInterceptor es para **desarrollo interactivo** (browser), no para tests automatizados.

## Tests de componentes con Redux

Para tests de componentes que leen del store, mockear el slice directamente:

```js
jest.mock('../../../redux/slices/userSlice', () => ({
    fetchUsers: jest.fn(() => ({ type: 'user/fetchUsers' })),
    selectUsers: (s) => s.user.users,
    selectUsersLoading: (s) => s.user.loading,
    selectUsersError: (s) => s.user.error,
    selectUsersTotal: (s) => s.user.total,
}));
```

## Archivos relevantes

| Archivo | Rol |
|---------|-----|
| `src/mocks/mockInterceptor.js` | Interceptor central — registrar handlers aquí |
| `src/mocks/usuarios.json` | Datos mock estáticos de referencia |
| `src/services/userService.js` | Servicio que llama `apiService` (no conoce mocks) |
| `src/redux/slices/userSlice.js` | Slice que llama el servicio (no conoce mocks) |
| `src/components/containers/UserManagement.jsx` | Componente conectado al store (no conoce mocks) |
