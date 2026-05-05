# Facade Pattern - Implementation Guide

**Simplify complex operations with a single, clear interface.**

---

## What is a Facade?

A **Facade** is a high-level interface that simplifies interaction with complex subsystems.

Instead of:
```javascript
// Many steps, many calls
const user = await authService.login(username, password)
const profile = await authService.getCurrentUser()
const verified = await authService.verifyToken()
```

You have:
```javascript
// One simple call
const session = await userAuth.startSession(username, password)
```

---

## Why Use Facades?

✅ **Simpler Code in Components**
- Components use 1-2 method calls instead of 5-10
- Less cognitive load
- Easier to read and understand

✅ **Error Handling Centralized**
- Facade handles all error cases
- Components don't need to know all edge cases
- Consistent error messages

✅ **Behavior Consistency**
- All callers get same behavior
- Changes in one place
- No code duplication

✅ **Easier Testing**
- Facades are testable in isolation
- Components are easier to test (fewer dependencies)
- Mock a single facade instead of multiple services

✅ **Reusability**
- Any component can use the facade
- Shared logic in one place
- DRY principle

---

## Our Facades

### 1. UserAuth
**Purpose:** Simplify authentication + user profile operations

**Methods:**
- `startSession(username, password)` - Login + load profile
- `loadProfile()` - Get user + verify token
- `endSession()` - Logout + clear data
- `createAccount(data)` - Register + auto-login
- `refreshSession()` - Renew token + update state
- `checkSession()` - Verify token valid (lightweight)
- `getCurrentUser()` - Get user without verification

**Usage:**
```javascript
// In component
const session = await userAuth.startSession('john', 'password')
const isValid = await userAuth.checkSession()
await userAuth.endSession()
```

### 2. JobOrchestrator
**Purpose:** Simplify job lifecycle management

**Methods:**
- `startAndMonitor(jobType, filters, options)` - Start + poll automatically
- `executeAndDownload(jobType, filters, options)` - Start + monitor + download
- `listActiveJobs()` - Get all active jobs with summaries
- `cancelAndCleanup(jobId)` - Cancel + clean data
- `retryJob(jobId, jobType, filters, maxRetries)` - Retry with backoff
- `getJobSummary(jobId)` - Get formatted status

**Usage:**
```javascript
// Instead of manual polling
const job = await jobService.start(type, config)
while (job.status !== 'completed') {
  job = await jobService.status(job.jobId)
  // Wait...
}
const result = await jobService.download(job.jobId)

// Use facade
const result = await jobOrchestrator.executeAndDownload(type, config)
```

### 3. ReportExporter
**Purpose:** Simplify data export operations

**Methods:**
- `exportAsExcel(data, options)` - Export to Excel with formatting
- `exportAsPDF(element, options)` - Export element to PDF
- `exportAsCSV(data, options)` - Export to CSV
- `batchExport(dataArray, options)` - Export multiple files + ZIP
- `exportWithValidation(data, schema, format, options)` - Export with schema validation

**Usage:**
```javascript
// Simple export
const result = await reportExporter.exportAsExcel(userData, {
  filename: 'users.xlsx',
  headers: ['ID', 'Name', 'Email']
})

// With validation
const result = await reportExporter.exportWithValidation(
  data,
  { id: 'required', email: 'required' },
  'xlsx'
)
```

---

## Design Principles

### 1. Single Responsibility
Each facade handles ONE complex operation area:
- UserAuth: Authentication
- JobOrchestrator: Job management
- ReportExporter: Data export

### 2. Clean Naming
Names describe WHAT they do, not HOW:
- ✅ `startSession()` - WHAT it does (starts a session)
- ✅ `executeAndDownload()` - WHAT it does (execute and download)
- ❌ `loginAndFetchAndVerifyAndLoad()` - HOW it does it (too many steps)

No "Facade" suffix:
- ✅ `UserAuth` - Clear and specific
- ❌ `UserAuthFacade` - Redundant suffix

### 3. Error Handling
Facades handle errors consistently:
- Validate inputs
- Call underlying services
- Catch and format errors
- Notify user
- Throw meaningful errors

### 4. Notifications
Facades notify users of progress:
- `.success()` on completion
- `.error()` on failure
- `.info()` on steps (retries, etc.)

---

## When to Create a Facade

Create a facade when:

✅ **Multiple related service calls** (3+)
```javascript
// Many calls = Create facade
authService.login()
authService.getCurrentUser()
authService.verifyToken()
```

✅ **Complex workflow** with many steps
```javascript
// Complex workflow = Create facade
jobService.start()
// Poll in loop
jobService.status()
// More polling
jobService.download()
```

✅ **Repeated pattern** across components
```javascript
// If 3+ components do similar flow = Create facade
// Component A: login + load profile
// Component B: login + load profile
// Component C: login + load profile
// → Create UserAuth facade
```

❌ **Don't create** for simple operations:
```javascript
// Simple = No facade needed
const user = await userService.getById(id)

// Only facade if this pattern repeats:
// Load user + load teams + load permissions → Create UserProfile facade
```

---

## Testing Facades

Facades are easy to test (mock the underlying services):

```javascript
describe('UserAuth', () => {
  beforeEach(() => {
    // Mock all dependencies
    jest.mock('@services/authService')
    getNotificationService.mockReturnValue(mockNotify)
  })

  it('should login and load profile', async () => {
    // Setup mocks
    authService.login.mockResolvedValue(mockUser)
    authService.getCurrentUser.mockResolvedValue(mockProfile)

    // Call facade
    const result = await userAuth.startSession('john', 'pass')

    // Assert
    expect(result.username).toBe('john')
    expect(mockNotify.success).toHaveBeenCalled()
  })
})
```

---

## Usage in Components

### Before (Complex)
```javascript
function LoginComponent() {
  const handleLogin = async (username, password) => {
    try {
      const user = await authService.login(username, password)
      const profile = await authService.getCurrentUser()
      const verified = await authService.verifyToken()
      
      if (!verified.is_valid) {
        showError('Session invalid')
        return
      }
      
      dispatch(setUser({ ...user, ...profile }))
      navigate('/dashboard')
    } catch (error) {
      showError(error.message)
    }
  }
  
  return <LoginForm onSubmit={handleLogin} />
}
```

### After (Using Facade)
```javascript
function LoginComponent() {
  const handleLogin = async (username, password) => {
    try {
      const session = await userAuth.startSession(username, password)
      dispatch(setUser(session))
      navigate('/dashboard')
    } catch (error) {
      // Already notified by facade
    }
  }
  
  return <LoginForm onSubmit={handleLogin} />
}
```

Much cleaner! ✨

---

## Limitations

**Facades are NOT:**
- Data persistence layer (use services for that)
- Redux replacements (still use Redux for state)
- Business logic layer (logic stays in services)
- MVC/MVVM pattern (this is just API simplification)

**Facades are just:**
- Simplified interfaces to complex operations
- Orchestrators of multiple service calls
- High-level APIs for components

---

## Future Facades to Consider

Based on complexity:

- `NotificationManager` - Simplify notification patterns
- `DataValidator` - Simplify validation workflows
- `AnalyticsTracker` - Simplify analytics operations
- `FormHandler` - Simplify form submission workflows

Only create when the pattern is complex and repeated.

---

## Key Takeaway

**Facades make component code simpler and more readable by hiding complex multi-step operations behind clear, single-method interfaces.**

- ✅ Use facades for complex workflows
- ✅ Name them clearly (no Facade suffix)
- ✅ Keep them testable
- ✅ Keep them focused (single responsibility)
- ❌ Don't over-use for simple operations
