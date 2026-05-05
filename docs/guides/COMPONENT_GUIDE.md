# Component Development Guide

How to build and structure components in IACT.

## Component Structure

Every component follows a standard pattern:

```
ComponentName/
├── index.jsx                  ← Barrel export
├── ComponentName.jsx          ← Main component
├── ComponentName.module.scss  ← Scoped styles
├── ComponentName.test.js      ← Tests
├── SubComponent.jsx           ← (Optional) Sub-component
├── SubComponent.module.scss
└── SubComponent.test.js
```

## Creating a Component

### Step 1: Create Component Folder
```bash
mkdir src/components/common/MyComponent
```

### Step 2: Create Component File
```javascript
// src/components/common/MyComponent/MyComponent.jsx
import React from 'react'
import PropTypes from 'prop-types'
import styles from './MyComponent.module.scss'

export default function MyComponent({ title, children, onClick }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>{children}</div>
    </div>
  )
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func,
}
```

### Step 3: Create Styles
```scss
// MyComponent.module.scss
@import '../../../styles/abstracts/variables';

.container {
  padding: $spacing-lg;
  background-color: #ffffff;
  border-radius: $radius-md;
}
```

### Step 4: Create Barrel Export
```javascript
// index.jsx
export { default as MyComponent } from './MyComponent'
```

### Step 5: Create Tests
```javascript
// MyComponent.test.js
describe('MyComponent', () => {
  it('should render', () => {
    // Test
  })
})
```

## Best Practices

1. **One component per file**
2. **CSS Modules for all styles**
3. **PropTypes for all props**
4. **Tests for all components**
5. **ARIA labels for accessibility**
6. **Feature folder organization**
7. **Barrel exports for clean imports**

---

See [Testing Guide](./TESTING_GUIDE.md) for testing patterns.
