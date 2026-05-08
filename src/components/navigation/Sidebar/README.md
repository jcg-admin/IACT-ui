# Sidebar Component

Part of the IACT Dashboard sidebar/navigation system.

## Structure

```
Sidebar/
├── index.jsx                    (barrel export - REQUIRED)
├── Sidebar.jsx                  (main component)
├── Sidebar.module.scss          (scoped styles)
├── SidebarNav.jsx               (navigation container)
├── SidebarNav.module.scss
├── NavLink.jsx                  (individual nav link)
├── NavLink.module.scss
└── _sidebar-utils.scss          (shared utilities)
```

## Components

- **Sidebar**: Main container component
- **SidebarNav**: Navigation list container
- **NavLink**: Individual navigation link

## Imports (with barrel exports)

```javascript
import { Sidebar, SidebarNav, NavLink } from '@ui/common/Sidebar'
```

## Features

- Collapsible on mobile
- Smooth animations
- Keyboard navigation support
- Responsive design (drawer on mobile)

## Notes

- Uses CSS Modules for scoped styling
- Follows Webpack5 barrel export pattern (index.jsx)
- All styles isolated in .module.scss files

