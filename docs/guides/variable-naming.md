# Variable Naming Improvement Guide

**Avoid generic names. Use specific, domain-aware names.**

---

## The Problem

Generic names like `data`, `result`, `response` are unclear and make code harder to understand.

**Rule:** Name = Type + Content

```javascript
// BAD: What kind of data?
const data = await apiService.get('/api/users')

// GOOD: Specific type and content
const userData = await apiService.get('/api/users')
const users = userData.map(u => ({ ...u }))
```

---

## Common Generic Names to Avoid

### 1. `data` → Specify What Data

```javascript
// ❌ BAD
const data = await fetchUsers()
const data = {
  name: 'John',
  email: 'john@example.com'
}

// ✅ GOOD
const users = await fetchUsers()
const userData = {
  name: 'John',
  email: 'john@example.com'
}

// ✅ EVEN BETTER (specific to domain)
const userList = await fetchUsers()
const userProfile = {
  name: 'John',
  email: 'john@example.com'
}
```

### 2. `result` → Specify What Result

```javascript
// ❌ BAD
const result = jobService.status(jobId)
const result = calculate(numbers)

// ✅ GOOD
const jobStatus = jobService.status(jobId)
const totalSum = calculate(numbers)
const calculateMetrics = calculate(data)
```

### 3. `response` → Specify Response Type

```javascript
// ❌ BAD
const response = await apiService.get('/api/jobs/123')
const response = await authService.login(credentials)

// ✅ GOOD
const jobResponse = await apiService.get('/api/jobs/123')
const authResponse = await authService.login(credentials)

// ✅ EVEN BETTER (use action/domain)
const jobData = await apiService.get('/api/jobs/123')
const authToken = await authService.login(credentials)
```

### 4. `error` → Specify Error Context

```javascript
// ❌ BAD
const error = validateInput(data)
const error = await apiService.post(url)

// ✅ GOOD
const validationError = validateInput(data)
const apiError = await apiService.post(url)
```

### 5. `item/value/obj` → Specify What It Is

```javascript
// ❌ BAD
items.forEach(item => {
  console.log(item.name)
})

// ✅ GOOD
users.forEach(user => {
  console.log(user.name)
})

// ❌ BAD
const obj = { id: 1, name: 'John' }

// ✅ GOOD
const userRecord = { id: 1, name: 'John' }
const jobConfig = { id: 1, name: 'John' }
```

### 6. `handler` → Specify What It Handles

```javascript
// ❌ BAD
const handler = (e) => {
  // What does this handle?
}
const handleChange = (value) => {
  // What changed?
}

// ✅ GOOD
const handleUserClick = (e) => {
  // Clear that this handles clicks on users
}
const handleInputChange = (value) => {
  // Clear that input changed
}
const handleFormSubmit = (e) => {
  // Clear that form is being submitted
}
```

### 7. `config` → Specify Config For What

```javascript
// ❌ BAD
const config = {
  timeout: 5000,
  retries: 3
}

// ✅ GOOD
const apiConfig = {
  timeout: 5000,
  retries: 3
}
const exportConfig = {
  format: 'xlsx',
  sheet: 'Users'
}
```

---

## Pattern: Noun + Optional Adjective

```javascript
// Pattern: [adjective] + [type]

const newUser = createUser()           // new + user
const filteredUsers = filterUsers()    // filtered + users
const selectedJob = getJobById(id)     // selected + job
const cachedData = getCachedResults()  // cached + data
const sortedItems = sortByDate()       // sorted + items
const completedTasks = getCompleted()  // completed + tasks
```

---

## For Callbacks and Event Handlers

```javascript
// Pattern: handle + [action] + [subject]

// Handle + Click + User
const handleUserClick = (user) => {}

// Handle + Change + Password
const handlePasswordChange = (newPassword) => {}

// Handle + Submit + Form
const handleFormSubmit = (e) => {}

// Handle + Delete + Item
const handleItemDelete = (itemId) => {}
```

---

## For Boolean Variables

```javascript
// Pattern: is/has/should + [adjective]

// ❌ BAD
const loading = true
const error = false
const modal = true

// ✅ GOOD
const isLoading = true
const hasError = false
const isModalOpen = true
const shouldValidate = true
```

---

## For Collections

```javascript
// Pattern: [plural noun] or [noun] + List/Array

// ❌ BAD
const data = [user1, user2, user3]
const items = [job1, job2]

// ✅ GOOD
const users = [user1, user2, user3]
const jobs = [job1, job2]
const userList = [...]
const jobQueue = [...]
```

---

## Before and After Examples

### Example 1: API Response

```javascript
// BEFORE
const response = await apiService.get('/api/jobs')
const data = response.map(item => ({
  id: item.id,
  name: item.name,
  status: item.status
}))
console.log(data)

// AFTER
const jobResponse = await apiService.get('/api/jobs')
const jobs = jobResponse.map(jobData => ({
  id: jobData.id,
  name: jobData.name,
  status: jobData.status
}))
console.log(jobs)
```

### Example 2: Form Handling

```javascript
// BEFORE
const [data, setData] = useState({})
const handleChange = (e) => {
  setData({
    ...data,
    [e.target.name]: e.target.value
  })
}

// AFTER
const [formData, setFormData] = useState({})
const handleFormInputChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  })
}
```

### Example 3: Service Layer

```javascript
// BEFORE
function processData(data) {
  const result = validate(data)
  if (!result) {
    const error = new Error('Invalid')
    throw error
  }
  const result2 = transform(data)
  return result2
}

// AFTER
function processUserData(userData) {
  const validationResult = validate(userData)
  if (!validationResult) {
    const validationError = new Error('Invalid user data')
    throw validationError
  }
  const transformedUserData = transform(userData)
  return transformedUserData
}
```

---

## Checklist: Is This Variable Name Clear?

1. **Can I know what this variable contains without reading its value?**
   - If NO → Rename it

2. **Is the type/content clear from the name?**
   - If NO → Rename it

3. **Would a new developer understand without extra comments?**
   - If NO → Rename it

4. **Is it specific to the domain, not generic?**
   - If NO → Rename it

---

## Application Strategy

**Phase 1 (Current):** Create this guide
**Phase 2:** Apply to new code
**Phase 3:** Refactor high-impact existing code (service files, hooks)
**Phase 4:** Refactor remaining code

**Priority order:**
1. Service layers (highest impact)
2. Hooks (frequently used)
3. Components (medium impact)
4. Utils (lower priority)

---

## Tools

ESLint plugins that can help:
- `eslint-plugin-unicorn` - suggests better variable names
- `eslint-plugin-naming-convention` - enforces naming patterns

Configure in `.eslintrc.json`:
```json
{
  "rules": {
    "naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase"],
        "leadingUnderscore": "forbid"
      }
    ]
  }
}
```

---

## Summary

**AVOID:** `data`, `result`, `response`, `error`, `item`, `obj`, `handler`, `config`
**USE:** `userData`, `jobStatus`, `apiResponse`, `validationError`, `user`, `userConfig`, `handleFormSubmit`

**Result:** Self-documenting, clearer code that's easier to maintain.
