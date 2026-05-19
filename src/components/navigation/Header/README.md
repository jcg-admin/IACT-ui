# Header Component

Part of the IACT Dashboard header/navigation system.

## Structure

```
Header/
├── index.jsx                    (barrel export - REQUIRED)
├── Header.jsx                   (main component)
├── Header.module.scss           (scoped styles)
├── LogoBrand.jsx                (logo sub-component)
├── LogoBrand.module.scss
├── MenuButton.jsx               (menu toggle button)
├── MenuButton.module.scss
├── BreadcrumbNav.jsx            (breadcrumb navigation)
├── BreadcrumbNav.module.scss
├── NotificationBell.jsx         (notifications)
├── NotificationBell.module.scss
├── UserMenu.jsx                 (user dropdown)
├── UserMenu.module.scss
└── _header-utils.scss           (shared utilities)
```

## Components

- **Header**: Main container component
- **LogoBrand**: Logo and brand display
- **MenuButton**: Sidebar toggle button
- **BreadcrumbNav**: Current page navigation
- **NotificationBell**: Notification indicator
- **UserMenu**: User profile dropdown

## Imports (with barrel exports)

```javascript
import { Header, LogoBrand, MenuButton, BreadcrumbNav, NotificationBell, UserMenu } from '@ui/common/Header'
```

## Notes

- Uses CSS Modules for scoped styling
- Follows Webpack5 barrel export pattern (index.jsx)
- All styles isolated in .module.scss files

