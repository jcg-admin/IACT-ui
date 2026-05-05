# DashboardLayout Component

Main layout component for the IACT Dashboard.

## Structure

```
DashboardLayout/
├── index.jsx                    (barrel export - REQUIRED)
├── DashboardLayout.jsx          (main layout component)
└── DashboardLayout.module.scss  (scoped styles)
```

## Features

- Sticky header with navigation
- Collapsible/fixed sidebar
- Mobile drawer
- BMD (Boostrap Material Design) layout system
- Responsive design
- Keyboard navigation

## Usage

```javascript
import { DashboardLayout } from '@layouts/DashboardLayout'

<DashboardLayout>
  <Outlet />  {/* Route content goes here */}
</DashboardLayout>
```

## Child Components

- Header (from @components/common/Header)
- Sidebar (from @components/common/Sidebar)

## Z-Index Stack

```
Modal:     1300
Dropdown:  1100
Sidebar:   1000
Overlay:   999
Header:    10
Content:   1
```

## Notes

- Uses CSS Modules for scoped styling
- Follows Webpack5 barrel export pattern (index.jsx)
- Integrates with useMenuToggle hook

