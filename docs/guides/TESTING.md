# Testing Guide

## Overview
Guía para testing de componentes React con Jest y React Testing Library.

## Test Structure

```
src/
├─ components/
│  ├─ features/
│  │  ├─ UserManagement/
│  │  │  ├─ UserList.jsx
│  │  │  └─ __tests__/
│  │  │     └─ UserList.test.jsx
│  │  └─ Transactions/
│  │     ├─ TransactionList.jsx
│  │     └─ __tests__/
│  │        └─ TransactionList.test.jsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test UserList.test.jsx

# Watch mode
npm test -- --watch
```

## Writing Tests

### Basic Test

```jsx
import { render, screen } from '@testing-library/react'
import UserList from '../UserList'

describe('UserList', () => {
  test('renders title', () => {
    render(<UserList />)
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument()
  })
})
```

### Testing with Async

```jsx
import { render, screen, waitFor } from '@testing-library/react'

test('loads users', async () => {
  render(<UserList />)
  
  await waitFor(() => {
    expect(screen.getByText('Juan')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```jsx
import { render, screen, fireEvent } from '@testing-library/react'

test('search works', () => {
  render(<UserList />)
  
  const input = screen.getByPlaceholderText('Buscar...')
  fireEvent.change(input, { target: { value: 'Juan' } })
  
  expect(screen.getByText('Juan')).toBeInTheDocument()
})
```

## Mocking

### Mock Context

```jsx
jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    addToast: jest.fn()
  })
}))
```

### Mock Functions

```jsx
const mockFn = jest.fn()
const { container } = render(<Component onAction={mockFn} />)

fireEvent.click(screen.getByText('Click'))
expect(mockFn).toHaveBeenCalled()
```

### Mocking modules with `export default` — `__esModule: true` obligatorio

Cualquier `jest.mock` de un módulo que use `export default` **debe** incluir
`__esModule: true` en el objeto devuelto por la factory. Sin esta flag, Babel
no puede hacer el unwrap del default export: el componente recibe `undefined`
en lugar del mock function, cae silenciosamente al catch block si lo hay, y
los spy assertions muestran 0 calls aunque el test pase por texto.

```jsx
// CORRECTO
jest.mock('../../../services/accessGateway', () => ({
  __esModule: true,          // ← obligatorio para export default
  default: {
    getGroupFunctions: jest.fn().mockResolvedValue([]),
    getGroupCascadeImpact: jest.fn(),
  },
}))

// INCORRECTO — accessService.getGroupCascadeImpact === undefined en el componente
jest.mock('../../../services/accessGateway', () => ({
  default: {
    getGroupFunctions: jest.fn().mockResolvedValue([]),
    getGroupCascadeImpact: jest.fn(),
  },
}))
```

Para obtener la referencia al mock function en los tests, usar `jest.requireMock`:

```jsx
const mockGateway = jest.requireMock('../../../services/accessGateway').default
// En beforeEach:
mockGateway.getGroupCascadeImpact.mockClear()
mockGateway.getGroupCascadeImpact.mockResolvedValue({ count: 0 })
```

**Señal de que falta `__esModule: true`:** spy assertion falla con "Number of calls: 0"
mientras que un text assertion sobre el mismo flujo pasa — el texto apareció
via el catch block, no via el flujo correcto.

## Test Coverage

Current coverage:
- UserList: ~85%
- TransactionList: ~80%
- JobList: ~75%

Goal: Reach 90%+ coverage for all main components

## Best Practices

1. **Test behavior, not implementation**
   ```jsx
   // Good
   expect(screen.getByText('Guardado')).toBeInTheDocument()
   
   // Bad
   expect(component.state.saved).toBe(true)
   ```

2. **Use semantic queries**
   ```jsx
   // Good
   screen.getByRole('button', { name: /guardar/i })
   
   // Bad
   container.querySelector('.btn-save')
   ```

3. **Wait for async operations**
   ```jsx
   await waitFor(() => {
     expect(screen.getByText('Datos cargados')).toBeInTheDocument()
   })
   ```

4. **Clean up properly**
   - React Testing Library handles cleanup automatically
   - But manually cleanup if using other libraries

## Patrones RTK — dispatch y thunks

### `.unwrap()` obligatorio para leer el payload fulfilled

Cuando un componente necesita el valor que devuelve un thunk Redux Toolkit,
`.unwrap()` es obligatorio. Sin él, `dispatch(thunk())` retorna siempre el
action object (nunca rechaza), y el payload queda oculto.

```jsx
// CORRECTO — lee el payload, propaga el rechazo como excepción
const result = await dispatch(loginUser(credentials)).unwrap()
if (result?.next_step === 'change_password') {
  navigate('/change-password')
} else {
  navigate('/dashboard')
}

// INCORRECTO — result es el action object, result?.next_step siempre undefined
const result = await dispatch(loginUser(credentials))
```

**Aplica a:** cualquier componente que lea el valor retornado por un thunk
(Login, RecoverPassword, ChangePassword, cualquier form que lea next_step o
datos del response).

### Mock de useNavigate — referencia a nivel de módulo

El mock de `useNavigate` debe declararse a nivel de módulo y retornar una
referencia estable. Si se crea un nuevo `jest.fn()` por llamada, cada
`useNavigate()` en el componente obtiene una función distinta y las
aserciones `expect(mockNavigate).toHaveBeenCalledWith(...)` fallan con
"0 calls" aunque la navegación ocurra.

```jsx
// CORRECTO — referencia única compartida con el componente
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// En cada test: limpiar antes de la aserción
beforeEach(() => { mockNavigate.mockClear() })

// INCORRECTO — cada useNavigate() crea una fn diferente
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),  // ← nueva fn en cada llamada
}))
```

### getState() en thunks — evitar threading de parámetros

Cuando un thunk necesita el id del usuario actual, usar `getState()` dentro
del thunk en lugar de pasar el id como parámetro desde el componente.

```js
// CORRECTO — componente sin conocer el userId
dispatch(logoutAllSessions())  // sin parámetros

// En el thunk:
async (_, { getState }) => {
  const userId = getState().auth?.user?.id
  await apiService.post(`/api/users/${userId}/close-all-sessions/`)
}
```

### Test stores — incluir todos los slices que usan los componentes conectados

Cuando un componente se actualiza para usar `useSelector` de un slice nuevo,
**todas** las suites de test que renderizan ese componente (directamente o
como ancestro) deben incluir ese reducer en su store de test. El error que
aparece sin el reducer es `TypeError: Cannot read properties of undefined`.

```jsx
// Después de que MainLayout agrega useSelector(selectUser):
const createTestStore = () => configureStore({
  reducer: {
    appConfig: appConfigReducer,
    home: homeReducer,
    observability: healthReducer,
    auth: (state = { user: null, isAuthenticated: false }) => state, // ← agregar
  },
})
```

**Patrón de auditoría:** antes de commitear un componente que agrega un nuevo
`useSelector`, grep por todos los archivos de test que lo renderizan:
```bash
grep -r "ComponentName\|MainLayout\|ParentComponent" --include="*.test.*" .
```

### PAT-GIT-001 — git mv requiere re-add explícito después de editar

Después de `git mv src/A.jsx src/B.jsx`, cualquier edición posterior a
`src/B.jsx` aparece como "modified" unstaged — no se auto-stagea con el
rename. Ejecutar `git add src/B.jsx` explícito antes del commit.

```bash
git mv src/components/containers/Login.jsx src/pages/auth/Login.jsx
# editar Login.jsx con los cambios necesarios...
git status            # → "Changes not staged: modified: src/pages/auth/Login.jsx"
git add src/pages/auth/Login.jsx   # ← obligatorio
git commit ...
```

### Auditoría de consumidores antes de mover archivos

Antes de `git mv`, buscar todos los imports del path original — no solo en
source sino en test files e integration tests:

```bash
grep -r "containers/Login" --include="*.js" --include="*.jsx" \
  --include="*.ts" --include="*.tsx" .
```

Un consumidor no encontrado antes del move queda con import roto que solo
falla en runtime o en suites no ejecutadas en el mismo bloque.

## CI/CD Integration

Tests run automatically on:
- Pre-commit hook
- Pull requests
- Deployment pipeline

Failing tests block deployment.
