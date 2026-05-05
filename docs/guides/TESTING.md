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
