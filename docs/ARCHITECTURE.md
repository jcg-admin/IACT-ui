# Architecture Overview

Complete system architecture and design patterns.

## Application Structure

```
App (Entry Point)
├── Redux Provider (State Management)
│   ├── UI Slice
│   │   ├── isSidebarOpen
│   │   ├── isDarkMode
│   │   └── notifications
│   └── User Slice
│       ├── isAuthenticated
│       ├── user
│       ├── loading
│       └── error
└── React Router (Navigation)
    ├── DashboardLayout (Main Layout)
    │   ├── Header Component
    │   │   ├── LogoBrand
    │   │   ├── MenuButton
    │   │   ├── BreadcrumbNav
    │   │   ├── NotificationBell
    │   │   └── UserMenu
    │   ├── Sidebar Component
    │   │   ├── SidebarNav
    │   │   └── NavLink (Multiple)
    │   └── Main Content (Outlet)
    │       ├── Dashboard Page
    │       ├── Profile Page
    │       ├── Settings Page
    │       └── NotFound Page (404)
```

## Feature Folders

Each feature is a self-contained folder with:
- Component(s) (.jsx files)
- Styles (.module.scss files)
- Tests (.test.js files)
- Barrel export (index.jsx or index.js)

```
Header/
├── index.jsx              ← Barrel export
├── Header.jsx             ← Main component
├── Header.module.scss     ← Scoped styles
├── Header.test.js         ← Tests
├── LogoBrand.jsx
├── LogoBrand.module.scss
├── LogoBrand.test.js
└── ... (more sub-components)
```

## State Management

### Redux Store
```javascript
store.js
├── Reducers (slices)
│   ├── uiSlice (UI state)
│   │   ├── isSidebarOpen
│   │   ├── isDarkMode
│   │   └── notifications
│   └── userSlice (User state)
│       ├── isAuthenticated
│       ├── user
│       ├── loading
│       └── error
└── Middleware (Redux Thunk for async)
```

### Using Redux
```javascript
// Components subscribe to state
const sidebar = useSelector(state => state.ui.isSidebarOpen)

// Components dispatch actions
const dispatch = useDispatch()
dispatch(toggleSidebar())
```

## Routing

### Routes
- `/` → Redirects to `/dashboard`
- `/dashboard` → Dashboard page
- `/profile` → Profile page
- `/settings` → Settings page
- `*` → 404 Not Found

### Nested Routes
All routes render inside DashboardLayout, so Header and Sidebar are always visible.

## Component Patterns

### Feature Component
```javascript
// Feature/Feature.jsx
import styles from './Feature.module.scss'

export default function Feature({ prop1, prop2 }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Feature</h2>
    </div>
  )
}

// Feature/Feature.module.scss
.container {
  padding: 20px;
}

.title {
  color: #1f2937;
}

// Feature/Feature.test.js
describe('Feature Component', () => {
  it('should render', () => {
    // Test
  })
})

// Feature/index.jsx (Barrel Export)
export { default as Feature } from './Feature'
```

## Styling System

### CSS Modules
Each component has its own `.module.scss` file with scoped styles.

### Global Styles
Located in `src/styles/abstracts/`:
- `_variables.scss` - Design tokens
- `_layout.scss` - Layout variables
- `_animations.scss` - Animation keyframes

### Import Pattern
```scss
// In Component.module.scss
@import '../../styles/abstracts/variables';

.component {
  background-color: $color-white;
  padding: $spacing-md;
}
```

## Testing Strategy

### Test Types
1. **Unit Tests** - Test components in isolation
2. **Integration Tests** - Test components working together
3. **Redux Tests** - Test reducers and actions

### Test Structure
```javascript
describe('Component Name', () => {
  describe('Feature 1', () => {
    it('should do something', () => {
      // Test
    })
  })
})
```

## Performance Optimization

### Code Splitting
Pages are lazy-loaded to reduce initial bundle:
```javascript
const DashboardPage = React.lazy(() => import('@pages/Dashboard'))
```

### Memoization
Expensive components are memoized:
```javascript
export default React.memo(Component)
```

## Accessibility

### WCAG AAA Compliance
- Semantic HTML (header, nav, main)
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Color contrast

## Memory Management

### Event Cleanup
All event listeners are cleaned up to prevent memory leaks:
```javascript
useEffect(() => {
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])
```

## Design Tokens

### Colors
- Primary: #3b82f6 (Blue)
- Dark: #1f2937 (Slate-900)
- Light: #f9fafb (Slate-50)
- Border: #e5e7eb (Slate-200)

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Breakpoints
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

---

Next: [Component Development Guide](./guides/COMPONENT_GUIDE.md)
