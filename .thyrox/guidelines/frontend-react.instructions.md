# Frontend React — Guidelines

Reglas siempre activas para el proyecto thyrox. Aplicar en toda implementación React.

---

## Regla 1: Naming de componentes — PascalCase obligatorio

Los componentes React usan PascalCase. Los archivos llevan el mismo nombre.

```jsx
// CORRECTO
export function UserProfile({ userId }) { ... }
// archivo: UserProfile.jsx

// INCORRECTO
export function userProfile({ userId }) { ... }
export function user_profile({ userId }) { ... }
// archivo: userprofile.jsx
```

## Regla 2: Organización por feature, no por tipo

Los archivos se agrupan por feature/dominio, no por tipo técnico.

```
// CORRECTO
src/features/auth/
  LoginForm.jsx
  LoginForm.test.jsx
  useAuth.js
  authSlice.js

// INCORRECTO
src/components/LoginForm.jsx
src/hooks/useAuth.js
src/store/authSlice.js
src/tests/LoginForm.test.jsx
```

## Regla 3: useState local antes de estado global

Usar el estado más local posible. Escalar solo cuando sea necesario.

```jsx
// CORRECTO — estado local para UI efímera
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  ...
}

// INCORRECTO — no poner estado de UI en store global
dispatch(setDropdownOpen(true)); // evitar para estado local
```

## Regla 4: Testing con React Testing Library — comportamiento, no implementación

Los tests verifican lo que el usuario ve y hace, no los detalles internos.

```jsx
// CORRECTO — testea comportamiento
test('muestra error cuando el email es inválido', () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'no-es-email' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  expect(screen.getByText('Email inválido')).toBeInTheDocument();
});

// INCORRECTO — testea implementación interna
test('llama setError con mensaje correcto', () => {
  const { result } = renderHook(() => useLoginForm());
  act(() => result.current.setEmail('no-es-email'));
  expect(result.current.error).toBe('Email inválido');
});
```

## Regla 5: Sin estilos inline — usar clases CSS o CSS-in-JS consistente

```jsx
// CORRECTO
<button className="btn btn-primary">Guardar</button>

// CORRECTO (si el proyecto usa styled-components o Tailwind)
<Button variant="primary">Guardar</Button>
<button className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>

// INCORRECTO
<button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white' }}>
  Guardar
</button>
```

## Regla 6: Custom hooks para lógica reutilizable

Extraer lógica de componentes a hooks cuando se repite en 2+ lugares o supera 20 líneas.

```jsx
// CORRECTO — lógica extraída a hook
function useUserData(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUser(userId).then(setUser).finally(() => setLoading(false)); }, [userId]);
  return { user, loading };
}

// INCORRECTO — lógica duplicada en componentes
function UserCard({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);
  ...
}
```

## Regla 7: CJS mock factory para componentes React en Jest

Al mockear un componente importado con `import X from '...'`, usar la forma CJS directa.
Sin `__esModule: true`, la forma `{ default: fn }` causa double-wrap de Babel →
"Element type is invalid" en runtime de tests.

```js
// CORRECTO — CJS factory directa
jest.mock('@components/reports/SavedFiltersPanel', () =>
  function SavedFiltersPanel({ onSave }) {
    return <div data-testid="saved-filters-panel" />
  }
)

// CORRECTO — alternativa con __esModule explícito
jest.mock('@components/reports/SavedFiltersPanel', () => ({
  __esModule: true,
  default: ({ onSave }) => <div data-testid="saved-filters-panel" />,
}))

// INCORRECTO — double-wrap silencioso
jest.mock('@components/reports/SavedFiltersPanel', () => ({
  default: ({ onSave }) => <div data-testid="saved-filters-panel" />,
}))
```

## Regla 8: Mock-first service para endpoints de backend ausentes

Cuando el backend no tiene el endpoint listo, implementar el service method con
datos simulados. El componente queda 100% funcional. Activar el endpoint real
es un cambio de 1 línea.

```js
// CORRECTO — mock-first con TODO claro
async getETLAvailability() {
  // TODO: replace mock — GET /api/etl/availability
  return [
    { source: 'CRM', lastUpdate: new Date().toISOString(), status: 'ok', freshnessMinutes: 12 },
  ]
}

// Cuando el backend esté listo: reemplazar el return por la llamada real
async getETLAvailability() {
  const response = await this.client.get('/api/etl/availability')
  return response.data
}
```

## Regla 9: Grep consumers antes de agregar exports a un slice

Al agregar un nuevo selector o thunk a un slice existente, identificar todos los
archivos de test que importan ese slice y actualizar sus mocks en el mismo commit.
De lo contrario, los tests fallan con "You must pass a selector to useSelector".

```bash
# Antes de agregar selectX a accessSlice.js:
grep -r "from '@redux/slices/accessSlice'" src --include="*.test.*" -l
# → lista de test files que necesitan actualización de mock
```

```js
// En cada test file encontrado — agregar el selector nuevo al mock:
jest.mock('@redux/slices/accessSlice', () => ({
  // ... mocks existentes ...
  selectX: (s) => s.access?.x ?? defaultValue,  // ← agregar esto
}))
```
