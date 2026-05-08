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

## CI/CD Integration

Tests run automatically on:
- Pre-commit hook
- Pull requests
- Deployment pipeline

Failing tests block deployment.
