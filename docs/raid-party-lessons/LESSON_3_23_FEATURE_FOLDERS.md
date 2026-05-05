# Lesson 3.23: Feature Folders & Barrel Exports (Raid Party) - REQUIRED

Professional code organization from Raid Party - REQUIRED pattern.

## Feature Folder Structure

```
Header/                           ← Feature folder
├── index.jsx                     ← Barrel export (REQUIRED)
├── Header.jsx                    ← Main component
├── Header.module.scss            ← Scoped styles
├── Header.test.js                ← Tests
├── LogoBrand.jsx
├── LogoBrand.module.scss
└── LogoBrand.test.js
```

## Clean Imports

### Before (Without Barrel Exports)
```javascript
import Header from '@components/common/Header/Header'
import LogoBrand from '@components/common/Header/LogoBrand'
```

### After (With Barrel Exports)
```javascript
import { Header, LogoBrand } from '@components/common/Header'
```

## Why REQUIRED

1. **Webpack5 Official** - Recommended by Webpack itself
2. **Raid Party** - Used in all 40+ components
3. **Portability** - Move features between projects
4. **Team Scalability** - Each developer owns a feature

## All Feature Folders

✅ Header (6 exports)  
✅ Sidebar (3 exports)  
✅ DashboardLayout (1 export)  
✅ Router (1 export)  
✅ Redux (5 exports)  

---

See [Architecture](../ARCHITECTURE.md) for complete structure.
