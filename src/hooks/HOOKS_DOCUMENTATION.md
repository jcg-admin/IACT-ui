# Custom Hooks Library - IACT Dashboard

Complete documentation for all custom hooks in the IACT Dashboard project.

## Table of Contents

1. [Storage Hooks](#storage-hooks)
2. [Debounce/Throttle Hooks](#debouncethrottle-hooks)
3. [Async Hooks](#async-hooks)
4. [State Hooks](#state-hooks)
5. [Form Hooks](#form-hooks)
6. [Responsive Hooks](#responsive-hooks)
7. [Timing Hooks](#timing-hooks)
8. [DOM Hooks](#dom-hooks)

---

## Storage Hooks

### useLocalStorage

Safe localStorage management with JSON serialization and cross-tab sync.

**Usage:**
```jsx
const [user, setUser] = useLocalStorage('user', { name: 'John' })

setUser({ name: 'Jane' }) // Auto-saves and syncs across tabs
```

**Features:**
- Automatic JSON serialization/deserialization
- Default value support
- Cross-tab synchronization
- Error handling

---

## Debounce/Throttle Hooks

### useDebounce

Debounce a value (useful for search, typing, etc)

**Usage:**
```jsx
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 500)

useEffect(() => {
  // This only runs after user stops typing for 500ms
  if (debouncedSearchTerm) {
    searchAPI(debouncedSearchTerm)
  }
}, [debouncedSearchTerm])
```

**Parameters:**
- `value`: Value to debounce
- `delay`: Delay in milliseconds (default: 500)

### useThrottle

Throttle function calls

**Usage:**
```jsx
const handleScroll = useThrottle(() => {
  console.log('Scrolling!')
}, 300)

useEffect(() => {
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [handleScroll])
```

**Parameters:**
- `callback`: Function to throttle
- `delay`: Delay in milliseconds (default: 300)

---

## Async Hooks

### useAsync

Handle async operations with status tracking

**Usage:**
```jsx
const { status, data, error, execute } = useAsync(
  async () => {
    const res = await fetch('/api/data')
    return res.json()
  },
  true // immediate execution
)

if (status === 'pending') return <Loading />
if (status === 'error') return <Error error={error} />
if (status === 'success') return <Data data={data} />
```

**Return Value:**
- `status`: 'idle' | 'pending' | 'success' | 'error'
- `data`: Result from async function
- `error`: Error if failed
- `execute()`: Manual execute function

---

## State Hooks

### usePrevious

Track previous value of a prop or state

**Usage:**
```jsx
const count = 5
const prevCount = usePrevious(count) // 4 (from previous render)
```

### useMountedState

Track if component is mounted (prevent memory leaks)

**Usage:**
```jsx
const isMounted = useMountedState()

useEffect(() => {
  setTimeout(() => {
    if (isMounted()) {
      setState(newValue) // Only update if mounted
    }
  }, 1000)
}, [isMounted])
```

---

## Form Hooks

### useForm

Form state management with validation support

**Usage:**
```jsx
const form = useForm(
  { email: '', password: '' },
  async (values) => {
    await loginAPI(values)
  }
)

<input
  name="email"
  value={form.values.email}
  onChange={form.handleChange}
  onBlur={form.handleBlur}
/>
{form.errors.email && <Error>{form.errors.email}</Error>}
```

**Return Value:**
- `values`: Form values object
- `errors`: Form errors object
- `touched`: Which fields have been touched
- `isSubmitting`: Submit in progress
- `handleChange()`: Input change handler
- `handleBlur()`: Input blur handler
- `handleSubmit()`: Form submit handler
- `setValues()`: Manual set values
- `setErrors()`: Manual set errors
- `reset()`: Reset form to initial state

---

## Responsive Hooks

### useMediaQuery

Responsive design using JS media queries

**Usage:**
```jsx
const isMobile = useMediaQuery('(max-width: 480px)')
const isDark = useMediaQuery('(prefers-color-scheme: dark)')

return isMobile ? <MobileLayout /> : <DesktopLayout />
```

**Parameters:**
- `query`: Media query string (e.g., '(max-width: 480px)')

---

## Timing Hooks

### useTimeout

Safe setTimeout with automatic cleanup

**Usage:**
```jsx
useTimeout(() => {
  setMessage('') // Clear message after 3 seconds
}, 3000)
```

**Parameters:**
- `callback`: Function to execute
- `delay`: Delay in milliseconds

### useInterval

Safe setInterval with automatic cleanup

**Usage:**
```jsx
useInterval(() => {
  fetchNewData()
}, 5000) // Fetch every 5 seconds
```

**Parameters:**
- `callback`: Function to execute
- `delay`: Delay in milliseconds

---

## DOM Hooks

### useClickAway

Detect click outside an element

**Usage:**
```jsx
const [isOpen, setIsOpen] = useState(true)
const ref = useClickAway(() => setIsOpen(false))

<div ref={ref}>
  Menu content (closes when clicked outside)
</div>
```

**Returns:**
- React ref to attach to element

### useKeyPress

Detect keyboard key press

**Usage:**
```jsx
useKeyPress('Enter', () => {
  submitForm()
})

useKeyPress('Escape', () => {
  closeModal()
})
```

**Parameters:**
- `key`: Key to detect (e.g., 'Enter', 'Escape')
- `callback`: Function to execute

---

## Best Practices

1. **useDebounce** for search inputs and text fields
2. **useThrottle** for scroll, resize, and expensive operations
3. **useAsync** for API calls and async operations
4. **useMediaQuery** for responsive JS logic
5. **useClickAway** for modals, dropdowns, popovers
6. **useKeyPress** for keyboard shortcuts
7. **useLocalStorage** for user preferences and state persistence
8. **useForm** for complex form management

---

## Testing

All hooks include unit tests. Run:

```bash
npm test -- --testPathPattern=hooks
```

---

## Performance Notes

- All hooks use proper cleanup in useEffect
- No memory leaks
- Optimized for performance
- Compatible with React 16.8+

---
