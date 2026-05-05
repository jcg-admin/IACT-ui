# Comment Cleanup Guide

**Remove obvious comments, keep WHY comments.**

---

## Rule: Comments Should Explain WHY, Not WHAT

The code already tells WHAT it does. Comments should explain:
- **WHY** this approach was chosen
- **WHY NOT** other approaches
- **HOW** this relates to business logic
- **EDGE CASES** and assumptions

---

## ❌ Examples of OBVIOUS Comments (Remove These)

```javascript
// BAD: Obvious from the code
function getUser(id) {
  // Get user from API
  const response = await apiService.get(`/api/users/${id}`)
  // Return user data
  return response.data
}

// GOOD: Code is self-documenting
async function fetchUser(userId) {
  const response = await apiService.get(`/api/users/${userId}`)
  return response.data
}

// BAD: Obvious from variable names
// If there are new conflicts, add them
if (response.newConflicts) {
  conflicts.push(...response.newConflicts)
}

// GOOD: Already clear
if (response.newConflicts) {
  conflicts.push(...response.newConflicts)
}

// BAD: Obvious from the loop
// Loop through users
users.forEach(user => {
  console.log(user.name)
})

// GOOD: No comment needed
users.forEach(user => {
  console.log(user.name)
})
```

---

## ✅ Examples of GOOD Comments (Keep These)

```javascript
// GOOD: Explains WHY
// Cache for 1 minute to reduce API calls
// If you need real-time data, use apiService directly
const cachedUser = withCaching(getUser, CACHE_TTL.SHORT)

// GOOD: Explains business logic decision
// We retry 3 times because the API has occasional timeouts
// Retrying more than 3 times usually indicates a deeper issue
const response = await apiService.get(url, { maxRetries: 3 })

// GOOD: Explains edge case
// Status might not have eta if job just started
// In that case, show "Calculating..."
return {
  status: response.status,
  eta: response.eta || null // null means not yet calculated
}

// GOOD: Explains order dependency
// Must be inside ToastProvider to access useToast hook
function NotificationServiceInitializer({ children }) {
  const toastContext = useToast()
  // ...
}

// GOOD: Explains non-obvious solution
// We use WeakMap instead of regular Map to avoid memory leaks
// WeakMap keys are garbage-collected when no longer referenced
const cache = new WeakMap()

// GOOD: Explains trade-off
// Using setTimeout(0) to defer execution
// This allows React to batch state updates and improves performance
setTimeout(() => {
  dispatch(updateData())
}, 0)
```

---

## Pattern: Comment Hierarchy

### Level 1: File/Function Documentation
```javascript
/**
 * UserAuth Hook
 * Manages authentication state with automatic token refresh
 * 
 * Features:
 * - Automatic token refresh 5 min before expiry
 * - Persists auth state to localStorage
 * - Clears sensitive data on logout
 */
export function useAuth() {
  // ...
}
```

### Level 2: Complex Logic Comments
```javascript
function complexCalculation(data) {
  // This algorithm uses dynamic programming to optimize time complexity
  // from O(n²) to O(n log n). See: https://example.com/algorithm
  return optimizedResult
}
```

### Level 3: Minimal Inline Comments
```javascript
// Only add if the code is non-obvious
function foo(items) {
  // Must check !== null because 0 and false are valid
  if (items.count !== null && items.count !== undefined) {
    process(items)
  }
}
```

---

## Checklist: Should This Comment Exist?

Ask yourself:

1. **Is this obvious from the code?**
   - If YES → Delete the comment
   - If NO → Keep it

2. **Does it explain WHY?**
   - If YES → Keep it
   - If NO → Rewrite to explain WHY, not WHAT

3. **Could the code be clearer instead?**
   - If YES → Improve the code, remove the comment
   - If NO → Keep the comment

4. **Is this about a non-obvious business rule?**
   - If YES → Keep it
   - If NO → Consider removing

---

## Examples in Our Codebase

### Before (Obvio us Comments)

```javascript
// jobService.js
/**
 * Obtener status de job
 */
async function statusBase(jobId) {
  // Obtener status desde API
  const response = await apiService.get(`/api/job/${jobId}/status/`)
  // Retornar objeto formateado
  return {
    jobId: response.jobId,
    status: response.status,
    progress: response.progress || 0,
    eta: response.eta || null
  }
}
```

### After (Clean Comments)

```javascript
// jobService.js
/**
 * Obtener status de job
 * 
 * Note: Status is cached for 1 minute by withCaching decorator.
 * If you need real-time data, use apiService directly.
 */
async function statusBase(jobId) {
  const response = await apiService.get(`/api/job/${jobId}/status/`)
  return {
    jobId: response.jobId,
    status: response.status,
    progress: response.progress || 0,
    eta: response.eta || null // null means not yet calculated
  }
}
```

---

## Application Strategy

**Phase 1 (Current):** Review and remove obvious comments
**Phase 2:** Add helpful WHY comments where needed
**Phase 3:** Consider code improvements to reduce comment needs

---

## Tools

ESLint plugins that can help:
- `eslint-plugin-no-comments` - warns about comments (use sparingly)
- `eslint-plugin-spellcheck` - spell-checks comments

But these are optional. The best practice is **manual review**.

---

## Summary

**REMOVE:** Comments that describe WHAT the code does (obvious)
**KEEP:** Comments that explain WHY (non-obvious business logic)
**IMPROVE:** Code that requires explaining (better naming, better structure)

**Result:** Cleaner, more maintainable code with purposeful comments.
