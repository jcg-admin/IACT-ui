# Import Organization Guide

**Organize imports by type for better code clarity and consistency.**

---

## Import Groups (In Order)

### 1. External Libraries
React, third-party packages, npm modules

```javascript
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
```

### 2. Internal - Redux
Redux slices, selectors, store

```javascript
import store from '@redux/store'
import { useAuth } from '@redux/slices/authSlice'
import { selectUsers } from '@redux/selectors/userSelectors'
```

### 3. Internal - React Query
Query client, cache settings

```javascript
import { queryClient } from '@lib/queryClient'
import { useApiQuery } from '@hooks/domain/useAPI'
```

### 4. Internal - Router
Router setup, navigation

```javascript
import { AppRouter } from '@router'
import { useNavigation } from '@hooks/domain/useRouter'
```

### 5. Internal - Services
API services, business logic services

```javascript
import apiService from '@services/apiService'
import jobService from '@services/jobService'
import { getNotificationService } from '@services/notificationService'
```

### 6. Internal - Decorators
Decorator patterns

```javascript
import { withCaching, withLogging } from '@decorators'
```

### 7. Internal - Context
React Context providers

```javascript
import { ToastProvider, useToast } from '@context/ToastContext'
import { ThemeContext } from '@context/ThemeContext'
```

### 8. Internal - Hooks
Custom hooks (domain and utilities)

```javascript
import { useAuth, useJobs } from '@hooks/domain'
import { useDebounce, useLocalStorage } from '@hooks/utils'
```

### 9. Internal - Components
Reusable components, shared components

```javascript
import { ErrorBoundary } from '@components/shared'
import { Header, Sidebar } from '@components/navigation'
import { Modal } from '@components/shared'
import UserForm from '@components/forms/UserForm'
```

### 10. Internal - Utils
Utility functions, helpers

```javascript
import { formatDate, parseJSON } from '@utils/helpers'
import { validateEmail } from '@utils/validators'
```

### 11. Styles
CSS, SCSS imports last

```javascript
import '@styles/main.scss'
import './UserList.scss'
```

---

## Example: Well-Organized File

```javascript
/**
 * UserManagement Component
 * Manages user CRUD operations
 */

// ─── External ───
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useQuery } from '@tanstack/react-query'

// ─── Internal - Redux ───
import { selectUsers } from '@redux/selectors/userSelectors'
import { setUsers } from '@redux/slices/userSlice'

// ─── Internal - Services ───
import userService from '@services/userService'
import { getNotificationService } from '@services/notificationService'

// ─── Internal - Hooks ───
import { useForm } from '@hooks/domain/useForm'
import { useDebounce } from '@hooks/utils/useDebounce'

// ─── Internal - Components ───
import { Modal } from '@components/shared'
import { Header } from '@components/navigation'
import UserForm from './UserForm'
import UserTable from './UserTable'

// ─── Styles ───
import './UserManagement.scss'

export function UserManagement() {
  // Component code...
}
```

---

## Before and After

### ❌ Before (Disorganized)

```javascript
import { useToast } from '../../context/ToastContext'
import React, { useState, useEffect } from 'react'
import Modal from '@components/shared/Modal'
import { getNotificationService } from '@services/notificationService'
import { useDebounce } from '@hooks/useDebounce'
import store from '@redux/store'
import Table from '@components/presentational/Table'
import '@styles/main.scss'
```

### ✅ After (Organized)

```javascript
// ─── External ───
import React, { useState, useEffect } from 'react'

// ─── Internal - Redux ───
import store from '@redux/store'

// ─── Internal - Services ───
import { getNotificationService } from '@services/notificationService'

// ─── Internal - Context ───
import { useToast } from '../../context/ToastContext'

// ─── Internal - Hooks ───
import { useDebounce } from '@hooks/utils/useDebounce'

// ─── Internal - Components ───
import Modal from '@components/shared/Modal'
import Table from '@components/presentational/Table'

// ─── Styles ───
import '@styles/main.scss'
```

---

## Tools to Help

### ESLint Plugin for Import Organization

Install:
```bash
npm install --save-dev eslint-plugin-import
```

Configure in `.eslintrc.json`:
```json
{
  "plugins": ["import"],
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "alphabeticalOrder": true,
        "newlines-between": "always"
      }
    ]
  }
}
```

Then imports can be auto-fixed:
```bash
eslint --fix src/
```

---

## Benefits

✅ **Consistency** - Everyone knows where to look
✅ **Readability** - Clear import structure
✅ **Maintainability** - Easier to add/remove imports
✅ **Reducing Conflicts** - Organized imports avoid merge conflicts
✅ **Better IDE Support** - Clear grouping helps autocomplete

---

## Enforcement

This is a **soft guideline** for new code. As we refactor:
- Apply this pattern to existing files
- Use linting to enforce in CI/CD
- Team review for consistency

**No rush to fix all files at once** - apply during refactoring cycles.
