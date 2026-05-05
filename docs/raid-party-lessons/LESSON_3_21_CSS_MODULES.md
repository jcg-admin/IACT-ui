# Lesson 3.21: CSS Modules (Raid Party)

Professional CSS module implementation from Raid Party production app.

## What Are CSS Modules?

CSS Modules provide scoped styling, preventing naming conflicts.

## Implementation

### File Pattern
```
Component/
├── Component.jsx
├── Component.module.scss  ← Scoped to this component
├── Component.test.js
└── index.jsx
```

### Usage
```javascript
// Component.jsx
import styles from './Component.module.scss'

export default function Component() {
  return <div className={styles.container}>Content</div>
}
```

## Benefits

✅ No naming conflicts  
✅ Better performance  
✅ Easier maintenance  
✅ Clear CSS ownership  

## All 13 Components Using CSS Modules

- Header.module.scss
- LogoBrand.module.scss
- MenuButton.module.scss
- BreadcrumbNav.module.scss
- NotificationBell.module.scss
- UserMenu.module.scss
- Sidebar.module.scss
- SidebarNav.module.scss
- NavLink.module.scss
- DashboardLayout.module.scss
- Dashboard.module.scss

---

See [Architecture](../ARCHITECTURE.md) for complete overview.
