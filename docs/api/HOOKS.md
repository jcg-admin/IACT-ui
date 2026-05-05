# Custom Hooks API

## useTheme

**Location**: `src/context/ThemeContext.jsx`

### Description
Hook para acceder y controlar el tema global (dark/light).

### API

```typescript
interface UseThemeReturn {
  theme: 'dark' | 'light' | 'auto'
  toggleTheme: () => void
  setThemeMode: (mode: 'dark' | 'light' | 'auto') => void
}

function useTheme(): UseThemeReturn
```

### Example

```jsx
function SettingsPage() {
  const { theme, setThemeMode } = useTheme()
  
  return (
    <>
      <p>Tema actual: {theme}</p>
      <button onClick={() => setThemeMode('light')}>Claro</button>
      <button onClick={() => setThemeMode('dark')}>Oscuro</button>
    </>
  )
}
```

### Storage
- Persiste en `localStorage['theme']`
- Auto-recupera en siguiente sesión

---

## useToast

**Location**: `src/context/ToastContext.jsx`

### Description
Hook para mostrar notificaciones toast en la aplicación.

### API

```typescript
interface UseToastReturn {
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => number
  removeToast: (id: number) => void
  toasts: Toast[]
}

function useToast(): UseToastReturn
```

### Example

```jsx
function UserList() {
  const { addToast } = useToast()
  
  const handleDelete = (user) => {
    // Delete user...
    addToast(`${user.name} eliminado`, 'success')
  }
}
```

### Parameters

- `message` (string, required): Texto del toast
- `type` (string, optional): 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `duration` (number, optional): Duración en ms (default: 3000, 0 = no auto-dismiss)

### Return Value

Retorna ID del toast para referencia futura.

---

## useForm (existente)

**Location**: `src/hooks/useForm.js`

### Description
Hook para manejo de formularios con validación.

### API

```typescript
interface UseFormReturn {
  values: Object
  errors: Object
  touched: Object
  isSubmitting: boolean
  handleChange: (e: ChangeEvent) => void
  handleBlur: (e: BlurEvent) => void
  handleSubmit: (onSubmit: Function) => Function
  setValues: (values: Object) => void
  setErrors: (errors: Object) => void
  reset: () => void
}

function useForm(initialValues: Object): UseFormReturn
```

### Example

```jsx
function LoginForm() {
  const form = useForm({
    email: '',
    password: ''
  })
  
  return (
    <form onSubmit={form.handleSubmit(handleLogin)}>
      <input
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        name="email"
      />
    </form>
  )
}
```
