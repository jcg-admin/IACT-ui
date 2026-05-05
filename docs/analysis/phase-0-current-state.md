# PHASE 0: CURRENT STATE ANALYSIS

## Executive Summary

IACT v4.0 has a **solid, production-ready architecture** for data fetching. This document analyzes current patterns before implementing React Query.

**Status:** 265+ tests passing, no changes to make yet. Phase 0 is ANALYSIS ONLY.

---

## 1. SERVICE LAYER

### Pattern: Direct API Calls with apiService

**File:** `src/services/jobService.js`

```javascript
// Simple, focused service methods
async function start(_jobType, _filters = {}) {
  const _response = await apiService.post('/api/job/start/', {
    type: _jobType,
    filters: _filters
  })
  return {
    jobId: _response.jobId,
    type: _response.type,
    status: _response.status,
    progress: _response.progress || 0,
    eta: _response.eta || null
  }
}
```

**Characteristics:**
- Single responsibility - each function does ONE thing
- Return objects - transform and normalize API responses
- No state management - just data transformation
- Reusable - can be used from hooks OR Redux thunks
- Well documented - JSDoc comments

**Current Services:**
- `jobService.js` - Job operations
- `alertsService.js` - Alert management
- `transactionService.js` - Transaction handling
- `apiService.js` - HTTP layer with retry/CSRF/timeouts

---

## 2. API SERVICE LAYER

### Pattern: Sophisticated HTTP Client with Built-in Features

**File:** `src/services/apiService.js` (450 lines, production-grade)

**Key Features Already Implemented:**

#### 2.1 Request/Response Interceptors
```javascript
addRequestInterceptor(callback)   // Modify requests
addResponseInterceptor(callback)  // Process responses
addErrorInterceptor(callback)     // Handle errors
```

#### 2.2 Error Handling
- Custom error types: `TimeoutError`, `ConnectionError`, `ValidationError`, `RateLimitError`
- Automatic retry with exponential backoff
- Status code handling (401, 429, 422, etc.)

#### 2.3 Security
- CSRF token management (from Django)
- Session ID headers
- Authorization tokens
- Credentials (httpOnly cookies)

#### 2.4 Retry Logic
```javascript
// Automatic retry for transient errors
while (attempt < this.retryAttempts) {
  try {
    const response = await this._makeRequest(fullURL, finalOptions);
    return response;
  } catch (error) {
    if (isRetryableError(error) && attempt < this.retryAttempts) {
      await this._sleep(delay);  // Exponential backoff
      continue;
    }
  }
}
```

#### 2.5 Timeout Management
```javascript
_createAbortSignal(customTimeout) {
  const controller = new AbortController();
  const timeout = customTimeout || this.timeout;
  
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  return controller.signal;
}
```

#### 2.6 Mock Support
```javascript
// Supports mocks for development/testing
const mockResponse = await mockInterceptor.intercept(url, finalOptions);
if (mockResponse) {
  return this._createMockResponse(mockResponse);
}
```

**Result:** `apiService` already handles 90% of what React Query provides at HTTP level.

---

## 3. STATE MANAGEMENT: TWO PATTERNS

### Pattern A: Redux Thunks

**File:** `src/redux/slices/alertsSlice.js`

```javascript
// Define async thunk
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await alertsService.getAlerts();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Handle async states in slice
export const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});
```

**Usage in Components:**
```javascript
function AlertsPage() {
  const dispatch = useDispatch();
  const alerts = useSelector(selectAlerts);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  if (loading) return <Spinner />;
  if (error) return <Error />;
  return <AlertsList alerts={alerts} />;
}
```

**Advantages:**
- Centralized state management
- Devtools integration (time-travel debugging)
- Redux persist integration (state hydration)
- Predictable data flow
- **Already implemented for major features**

**Disadvantages:**
- Boilerplate (thunks, slices, selectors)
- Manual loading/error state management
- No automatic caching
- No request deduplication

---

### Pattern B: useAsync Hook

**File:** `src/hooks/useAsync.js`

```javascript
function useAsync(_asyncFunction, _immediate = true) {
  const [_state, _dispatch] = useReducer(_reducer, {
    status: 'idle',
    data: null,
    error: null
  });

  const _execute = useCallback(async () => {
    _dispatch({ type: 'PENDING' });
    try {
      const _response = await _asyncFunction();
      _dispatch({ type: 'SUCCESS', payload: _response });
    } catch (_error) {
      _dispatch({ type: 'ERROR', payload: _error });
    }
  }, [_asyncFunction]);

  useEffect(() => {
    if (_immediate) {
      _execute();
    }
  }, [_execute, _immediate]);

  return { ..._state, execute: _execute };
}
```

**Usage in Components:**
```javascript
function MyComponent() {
  const { data, status, error, execute } = useAsync(
    () => jobService.status('job-123'),
    true  // immediate execution
  );

  if (status === 'pending') return <Spinner />;
  if (status === 'error') return <Error error={error} />;
  return <Data data={data} />;
}
```

**Advantages:**
- Lightweight, no external state
- Perfect for simple components
- Easy to understand

**Disadvantages:**
- No caching
- No request deduplication
- No built-in error recovery
- Manual error handling in each component

---

## 4. CURRENT TESTING APPROACH

### Service Tests

**File:** `src/services/__tests__/jobService.test.js`

```javascript
// Mock apiService
jest.mock('@services/apiService');

describe('jobService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should make POST to /api/job/start/', async () => {
    const mockData = {
      jobId: 'job-123',
      type: 'export_csv',
      status: 'queued'
    };

    apiService.post.mockResolvedValue(mockData);
    const result = await jobService.start('export_csv', {});

    expect(apiService.post).toHaveBeenCalledWith('/api/job/start/', {
      type: 'export_csv',
      filters: {}
    });
    expect(result.jobId).toBe('job-123');
  });
});
```

**Characteristics:**
- Service tests mock `apiService`
- Test API contract, not HTTP details
- 100% coverage per service
- 8-12 tests per service

---

## 5. APP WRAPPER & PROVIDERS

**File:** `src/main.jsx`

```javascript
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
```

**Current Providers:**
1. **Redux Provider** - Central state
2. **PersistGate** - Redux persist (state hydration from localStorage)
3. **BrowserRouter** - React Router

**Missing:**
- No data fetching layer provider (currently implicit via Redux/hooks)
- No centralized notification system provider
- No theme provider

---

## 6. METRICS: CURRENT STATE

| Metric | Value |
|--------|-------|
| **Total Tests** | 265+ passing |
| **Service Code** | ~2,000 LOC |
| **Redux Slices** | 8 slices |
| **Custom Hooks** | 9 hooks |
| **API Service** | 450 LOC (production-grade) |
| **Test Coverage** | >90% |
| **Boilerplate per Feature** | ~150 LOC (thunk + slice + selectors) |

---

## 7. PAIN POINTS TO ADDRESS WITH REACT QUERY

### Issue 1: Boilerplate

```javascript
// Current: Redux approach requires
1. Thunk definition
2. Slice definition
3. Action creators
4. Selectors
5. Component usage

// Example jobsSlice.js + jobsPage.jsx = ~100 LOC
```

### Issue 2: No Automatic Caching

```javascript
// Current: Multiple requests to same endpoint
const alerts1 = useSelector(selectAlerts);  // Calls fetchAlerts
// ... wait 5 minutes
const alerts2 = useSelector(selectAlerts);  // Calls fetchAlerts AGAIN

// React Query would reuse cached data by default
```

### Issue 3: No Request Deduplication

```javascript
// Current: If 3 components mount simultaneously and fetch same data
dispatch(fetchAlerts());  // Component A
dispatch(fetchAlerts());  // Component B
dispatch(fetchAlerts());  // Component C
// Result: 3 HTTP requests (same endpoint, same data)

// React Query: Deduplicates -> 1 HTTP request, 3 components share response
```

### Issue 4: Manual Invalidation

```javascript
// Current: After creating alert, must manually invalidate cache
dispatch(createAlert(config));
// Later...
dispatch(fetchAlerts());  // Manual refetch

// React Query: Automatic cache invalidation
useMutation({
  mutationFn: (config) => alertsService.createAlert(config),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  }
});
```

---

## 8. STRENGTHS TO PRESERVE

### What's Working Well

1. **apiService** - Excellent HTTP client with retry, CSRF, timeouts, error handling
2. **Service layer** - Clean, focused, testable
3. **Redux for app state** - Good for user, auth, app-wide settings
4. **useAsync hook** - Perfect for simple async operations
5. **Testing approach** - Service tests mock apiService correctly
6. **Error handling** - Custom error types, proper logging
7. **Mock support** - Built-in mock interceptor for development

### Don't Change
- apiService - Keep as is, React Query will use it
- Service layer - Keep as is, React Query will use it
- Redux for non-data state - Keep Redux for auth, settings, UI state
- Testing patterns - Keep same approach

---

## 9. WHAT REACT QUERY ADDS (NEXT PHASES)

### 1. Automatic Caching
- Requests cache by default
- Configurable staleTime
- Automatic cleanup with gcTime

### 2. Request Deduplication
- Simultaneous requests to same endpoint = 1 HTTP call
- All subscribers get same response

### 3. Automatic Invalidation
- After mutations, invalidate related queries
- Automatic refetch or cache reset

### 4. Built-in Loading/Error States
- Loading, error, and success states included
- No need to manually manage with useState

### 5. Background Refetch
- Stale data can refetch in background
- Window focus triggers refetch (optional)

### 6. Optimistic Updates
- Update UI before server confirms
- Rollback on failure

---

## 10. IMPLEMENTATION IMPACT

### Files to Create (Phase 1)
```
src/lib/queryClient.js                 (NEW)
src/hooks/useJobs.js                   (NEW)
src/hooks/useAuth.js                   (NEW)
src/hooks/useAlerts.js                 (NEW)
src/hooks/useSomething.js              (NEW for each service)
```

### Files to Modify (Phase 1)
```
src/main.jsx                           (Add QueryClientProvider)
src/pages/AlertsPage.jsx               (Use useAlerts hook)
src/pages/JobsPage.jsx                 (Use useJobs hook)
// ... other pages using services
```

### Files NOT Changed
```
src/services/apiService.js             (KEEP - React Query will use)
src/services/jobService.js             (KEEP - React Query will call)
src/services/alertsService.js          (KEEP - React Query will call)
src/redux/                             (KEEP - Still manage app state)
src/hooks/useAsync.js                  (KEEP - Still useful for simple cases)
```

---

## 11. MIGRATION STRATEGY (High-Level)

### Phase 1: Setup
- Install React Query
- Create queryClient
- Add QueryClientProvider to main.jsx

### Phase 2: One Feature at a Time
- Pick one service (e.g., jobService)
- Create useJobs hook with useQuery/useMutation
- Update components using that service
- Keep Redux slice temporarily (until all components migrated)
- Test thoroughly

### Phase 3: Iterate
- One service per commit
- Keep tests passing
- Document changes

### Phase 4: Clean Up
- Remove old Redux slices (only after all components migrated)
- Keep Redux for auth, settings, UI state

---

## 12. ZERO BREAKING CHANGES

**Key Point:** React Query implementation is **additive, not replacive**.

```javascript
// Current Redux approach - STILL WORKS after React Query
const alerts = useSelector(selectAlerts);
const loading = useSelector(selectLoading);

// New React Query approach - PARALLEL implementation
const { data: alerts, isLoading: loading } = useAlerts();

// Can use BOTH in same app during migration
// Gradual, risk-free migration path
```

---

## PHASE 0 CONCLUSION

### Current State Summary

IACT has:
- ✅ Production-grade API service
- ✅ Clean service layer
- ✅ Solid Redux integration
- ✅ Comprehensive testing
- ✅ Good error handling
- ✅ 265+ passing tests

### What's Ready

**All infrastructure for React Query is already in place:**
1. apiService (HTTP client) - Ready
2. Services (data access) - Ready
3. Testing patterns - Ready
4. App structure - Ready for QueryClientProvider

### Next Steps

**No code changes yet.** Phase 0 is analysis complete.

Ready for Phase 1 when you give the word:
1. Install @tanstack/react-query
2. Create queryClient.js
3. Add QueryClientProvider to main.jsx
4. Create first useJobs hook

---

## Appendix: Architecture Diagram

```
Components
    ↓
useJobs() hook (new)  OR  Redux Thunk (current)
    ↓                           ↓
React Query                Redux Store
    ↓                           ↓
queryClient                  Selectors
    ↓                           ↓
─────────────────────────────────────
           ↓
       Services Layer (NO CHANGE)
           ↓
       apiService (NO CHANGE)
           ↓
       HTTP Layer / API
```

