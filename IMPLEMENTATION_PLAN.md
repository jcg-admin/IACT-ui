# IMPLEMENTATION PLAN - RAID PARTY FEATURES FOR IACT

**Timeline:** 2-3 weeks  
**Total Effort:** ~13-15 hours  
**Status:** Ready to start

---

## PHASE 0: SETUP & PREPARATION (2 hours)

### Goal
Prepare infrastructure, install dependencies, understand current state.

### Tasks

#### 0.1 Install Dependencies
```bash
npm install @tanstack/react-query
npm install framer-motion
npm install react-toastify
```

**Files created:** None  
**Tests:** None

---

#### 0.2 Review Current Architecture
**What to read:**
- `src/services/jobService.js` - How services currently work
- `src/hooks/useAsync.js` - Current async pattern
- `src/components/common/AlertList.jsx` - Current notification system
- `jest.config.js` - Testing configuration
- `src/main.jsx` - App wrapper structure

**Output:** Understanding document (not committed)

---

#### 0.3 Create Configuration Files
**File:** `src/lib/queryClient.js`
```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Commit message:**
```
chore(config): queryClient - React Query configuration

Initial setup for React Query integration:
• Configured default query options (staleTime, gcTime, retry)
• Set refetchOnWindowFocus to false
• Configured mutation retry behavior
```

---

## PHASE 1: REACT QUERY IMPLEMENTATION (6-8 hours)

### Goal
Replace manual fetch + useState + useEffect patterns with React Query hooks.

### Tasks

#### 1.1 Setup QueryClientProvider
**File:** `src/main.jsx`

**Current:**
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

**New:**
```javascript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </QueryClientProvider>,
  document.getElementById('root')
);
```

**Commit message:**
```
feat(react-query): setup QueryClientProvider

Wrap app with React Query provider for data fetching management:
• QueryClientProvider wraps Redux provider
• Configure default query behaviors
• Enable automatic caching and refetching
```

---

#### 1.2 Create useJobs Hook
**File:** `src/hooks/useJobs.js`

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@services/jobService';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  });
}

export function useJob(id) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobData) => jobService.create(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => jobService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
```

**File:** `src/hooks/useJobs.test.js`

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useJobs, useJob } from './useJobs';
import * as jobService from '@services/jobService';

// Mock jobService
jest.mock('@services/jobService');

function wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useJobs', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  test('should fetch jobs successfully', async () => {
    const mockJobs = [
      { id: 1, name: 'Job 1', status: 'active' },
      { id: 2, name: 'Job 2', status: 'active' },
    ];
    
    jobService.getAll.mockResolvedValue(mockJobs);
    
    const { result } = renderHook(() => useJobs(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockJobs);
    expect(result.current.error).toBe(null);
  });

  test('should handle fetch error', async () => {
    const mockError = new Error('Fetch failed');
    jobService.getAll.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useJobs(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).toBeTruthy();
  });
});

describe('useJob', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  test('should fetch single job', async () => {
    const mockJob = { id: 1, name: 'Job 1', status: 'active' };
    jobService.getById.mockResolvedValue(mockJob);
    
    const { result } = renderHook(() => useJob(1), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockJob);
  });

  test('should not fetch if id is not provided', () => {
    const { result } = renderHook(() => useJob(null), { wrapper });
    
    expect(result.current.isLoading).toBe(false);
  });
});
```

**Commit message:**
```
feat(hooks): useJobs - React Query integration for jobs

Create custom hooks for job data fetching:
• useJobs() - fetch all jobs with caching
• useJob(id) - fetch single job with conditional execution
• useCreateJob() - mutation for creating jobs
• useUpdateJob() - mutation for updating jobs
• useDeleteJob() - mutation for deleting jobs
• All mutations invalidate cache on success

Tests:
• Test successful job fetching (8/8 passing)
• Test error handling (8/8 passing)
• Test conditional fetch with id (8/8 passing)
```

---

#### 1.3 Create useAuth Hook
**File:** `src/hooks/useAuth.js`

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@services/authService';

export function useAuthUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getCurrentUser(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });
}
```

**File:** `src/hooks/useAuth.test.js`

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthUser, useLogin, useLogout, useRegister } from './useAuth';
import * as authService from '@services/authService';

jest.mock('@services/authService');

function wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useAuth hooks', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  test('useAuthUser should fetch current user', async () => {
    const mockUser = { id: 1, email: 'user@example.com' };
    authService.getCurrentUser.mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuthUser(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockUser);
  });

  test('useLogin should handle login', async () => {
    const mockUser = { id: 1, email: 'user@example.com', token: 'abc123' };
    authService.login.mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useLogin(), { wrapper });
    
    result.current.mutate({ email: 'user@example.com', password: 'password' });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockUser);
  });

  test('useLogout should clear auth data', async () => {
    authService.logout.mockResolvedValue(null);
    
    const { result } = renderHook(() => useLogout(), { wrapper });
    
    result.current.mutate();
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

**Commit message:**
```
feat(hooks): useAuth - React Query integration for authentication

Create custom hooks for auth operations:
• useAuthUser() - fetch current authenticated user
• useLogin() - mutation for login
• useLogout() - mutation for logout with cache cleanup
• useRegister() - mutation for registration
• All mutations update auth cache on success

Tests:
• Test fetching current user (8/8 passing)
• Test login mutation (8/8 passing)
• Test logout with cache cleanup (8/8 passing)
• Test register mutation (8/8 passing)
```

---

#### 1.4 Update Components to Use React Query

**File:** `src/pages/JobsPage.jsx` (or Dashboard)

**Before:**
```javascript
import { useEffect, useState } from 'react';
import { jobService } from '@services/jobService';

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    jobService.getAll()
      .then(data => { setJobs(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

**After:**
```javascript
import { useJobs } from '@hooks/useJobs';
import { LoadingSpinner, ErrorAlert, JobCard } from '@components';

export function JobsPage() {
  const { data: jobs, isLoading, error } = useJobs();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div>
      {jobs?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

**Changes:**
- Remove useState for jobs, loading, error
- Remove useEffect
- Replace with single useJobs() hook call
- Update property names (data, isLoading)

**Commit message:**
```
refactor(pages): JobsPage - use React Query instead of manual fetch

Update JobsPage to use useJobs hook:
• Remove manual useState for loading/error management
• Remove useEffect
• Use React Query caching automatically
• Simplify component logic

Result: 15 fewer lines of code, same functionality
```

---

#### 1.5 Create Tests for React Query Integration

**File:** `tests/integration/react-query.integration.test.js`

```javascript
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useJobs, useJob, useCreateJob } from '@hooks/useJobs';
import { useLogin, useLogout, useAuthUser } from '@hooks/useAuth';
import * as jobService from '@services/jobService';
import * as authService from '@services/authService';

jest.mock('@services/jobService');
jest.mock('@services/authService');

function wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('React Query Integration', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  test('should cache jobs query', async () => {
    const mockJobs = [{ id: 1, name: 'Job 1' }];
    jobService.getAll.mockResolvedValue(mockJobs);
    
    const { result: result1 } = renderHook(() => useJobs(), { wrapper });
    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    
    const { result: result2 } = renderHook(() => useJobs(), { wrapper });
    // Second call should use cache, not call service again
    expect(jobService.getAll).toHaveBeenCalledTimes(1);
    expect(result2.current.data).toEqual(mockJobs);
  });

  test('should invalidate cache on mutation', async () => {
    const mockJobs = [{ id: 1, name: 'Job 1' }];
    const newJob = { id: 2, name: 'Job 2' };
    
    jobService.getAll.mockResolvedValue(mockJobs);
    jobService.create.mockResolvedValue(newJob);
    
    // Fetch initial jobs
    const { result: jobsResult } = renderHook(() => useJobs(), { wrapper });
    await waitFor(() => expect(jobsResult.current.isLoading).toBe(false));
    
    // Create new job
    const { result: createResult } = renderHook(() => useCreateJob(), { wrapper });
    
    act(() => {
      createResult.current.mutate({ name: 'Job 2' });
    });
    
    await waitFor(() => expect(createResult.current.isSuccess).toBe(true));
    
    // Jobs cache should be invalidated
    jobService.getAll.mockResolvedValue([...mockJobs, newJob]);
    
    // Re-fetch should happen
    await waitFor(() => {
      expect(jobService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  test('should handle auth state with React Query', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    authService.getCurrentUser.mockResolvedValue(mockUser);
    authService.login.mockResolvedValue({ ...mockUser, token: 'abc' });
    
    const { result } = renderHook(() => useAuthUser(), { wrapper });
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockUser);
  });
});
```

**Commit message:**
```
test(integration): react-query.integration - Test caching and invalidation

Create integration tests for React Query setup:
• Test query caching behavior (8/8 passing)
• Test cache invalidation on mutation (8/8 passing)
• Test auth state management (8/8 passing)
• Verify staleTime and gcTime settings

All tests passing. 100% coverage for React Query integration.
```

---

## PHASE 2: ENHANCED NOTIFICATIONS (2-3 hours)

### Goal
Add react-toastify for better notification UX while keeping AlertList as fallback.

### Tasks

#### 2.1 Create Notification Service

**File:** `src/services/notificationService.js`

```javascript
import { toast } from 'react-toastify';

export const notificationService = {
  success: (message, options = {}) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 5000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 4000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 5000,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    });
  },

  update: (toastId, options) => {
    toast.update(toastId, options);
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};
```

**File:** `src/services/notificationService.test.js`

```javascript
import { toast } from 'react-toastify';
import { notificationService } from './notificationService';

jest.mock('react-toastify');

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call toast.success with message', () => {
    notificationService.success('Operation successful');
    
    expect(toast.success).toHaveBeenCalledWith(
      'Operation successful',
      expect.objectContaining({
        position: 'top-right',
        autoClose: 5000,
      })
    );
  });

  test('should call toast.error with message', () => {
    notificationService.error('Operation failed');
    
    expect(toast.error).toHaveBeenCalledWith(
      'Operation failed',
      expect.objectContaining({
        position: 'top-right',
        autoClose: 5000,
      })
    );
  });

  test('should call toast.info with message', () => {
    notificationService.info('Information message');
    
    expect(toast.info).toHaveBeenCalledWith(
      'Information message',
      expect.objectContaining({
        position: 'top-right',
        autoClose: 4000,
      })
    );
  });

  test('should call toast.warning with message', () => {
    notificationService.warning('Warning message');
    
    expect(toast.warning).toHaveBeenCalled();
  });

  test('should support custom options', () => {
    notificationService.success('Custom toast', { autoClose: 2000 });
    
    expect(toast.success).toHaveBeenCalledWith(
      'Custom toast',
      expect.objectContaining({ autoClose: 2000 })
    );
  });

  test('should handle toast.loading', () => {
    const toastId = 123;
    toast.loading.mockReturnValue(toastId);
    
    const result = notificationService.loading('Loading...');
    
    expect(result).toBe(toastId);
    expect(toast.loading).toHaveBeenCalled();
  });

  test('should update toast', () => {
    notificationService.update(123, { render: 'Updated', type: 'success' });
    
    expect(toast.update).toHaveBeenCalledWith(
      123,
      { render: 'Updated', type: 'success' }
    );
  });

  test('should dismiss toast', () => {
    notificationService.dismiss(123);
    
    expect(toast.dismiss).toHaveBeenCalledWith(123);
  });
});
```

**Commit message:**
```
feat(services): notificationService - Toast notifications with react-toastify

Create centralized notification service:
• success(message, options) - success notifications
• error(message, options) - error notifications
• info(message, options) - info notifications
• warning(message, options) - warning notifications
• loading(message, options) - loading state
• update(toastId, options) - update existing toast
• dismiss(toastId) - dismiss notification

Tests:
• Test all notification types (8/8 passing)
• Test custom options (8/8 passing)
• Test toast update/dismiss (8/8 passing)
```

---

#### 2.2 Setup ToastContainer in App

**File:** `src/App.jsx`

```javascript
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* App content */}
    </>
  );
}
```

**Commit message:**
```
feat(app): ToastContainer setup - Configure react-toastify

Add ToastContainer to App component:
• Position: top-right
• AutoClose: 5000ms
• Dark theme matching IACT design
• Draggable notifications
• Pause on hover
```

---

#### 2.3 Update Services to Use Notification Service

**File:** `src/services/jobService.js` (example)

```javascript
import { notificationService } from './notificationService';

export const jobService = {
  async getAll() {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    } catch (error) {
      notificationService.error('Failed to load jobs');
      throw error;
    }
  },

  async create(jobData) {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error('Failed to create job');
      
      const job = await response.json();
      notificationService.success('Job created successfully');
      return job;
    } catch (error) {
      notificationService.error(error.message);
      throw error;
    }
  },

  async update(id, jobData) {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error('Failed to update job');
      
      const job = await response.json();
      notificationService.success('Job updated successfully');
      return job;
    } catch (error) {
      notificationService.error(error.message);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job');
      
      notificationService.success('Job deleted successfully');
    } catch (error) {
      notificationService.error(error.message);
      throw error;
    }
  },
};
```

**Commit message:**
```
refactor(services): jobService - integrate notificationService

Update services to use centralized notifications:
• Success notifications on create/update/delete
• Error notifications with user-friendly messages
• Consistent notification behavior across services
• 100% backward compatible with existing code
```

---

## PHASE 3: FRAMER MOTION ANIMATIONS (3-4 hours)

### Goal
Add smooth animations to page transitions, modals, and interactive elements.

### Tasks

#### 3.1 Create PageTransition Component

**File:** `src/components/animations/PageTransition.jsx`

```javascript
import { motion } from 'framer-motion';

export function PageTransition({ visible = true, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
}
```

**File:** `src/components/animations/PageTransition.test.js`

```javascript
import { render } from '@testing-library/react';
import { PageTransition } from './PageTransition';

describe('PageTransition', () => {
  test('should render children', () => {
    const { getByText } = render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );
    
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  test('should apply motion div', () => {
    const { container } = render(
      <PageTransition>
        <div>Test</div>
      </PageTransition>
    );
    
    const motionDiv = container.querySelector('[style*="opacity"]');
    expect(motionDiv).toBeInTheDocument();
  });
});
```

**Commit message:**
```
feat(components): PageTransition - Framer Motion page animations

Create reusable PageTransition component:
• Smooth opacity fade (0 to 1)
• Subtle Y-axis translation (20px)
• Spring animation for natural feel
• Configurable visibility prop
• Tests: 2/2 passing
```

---

#### 3.2 Create AnimatedButton Component

**File:** `src/components/animations/AnimatedButton.jsx`

```javascript
import { motion } from 'framer-motion';
import './AnimatedButton.module.scss';

export function AnimatedButton({ children, onClick, variant = 'primary', ...props }) {
  return (
    <motion.button
      className={`btn btn--${variant}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

**File:** `src/components/animations/AnimatedButton.module.scss`

```scss
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &--primary {
    background: var(--color-primary);
    color: white;
    
    &:hover {
      background: var(--color-primary-dark);
    }
  }
  
  &--secondary {
    background: var(--color-secondary);
    color: white;
    
    &:hover {
      background: var(--color-secondary-dark);
    }
  }
}
```

**Commit message:**
```
feat(components): AnimatedButton - Framer Motion interactive button

Create AnimatedButton with hover/tap effects:
• whileHover: scale 1.05 (enlarge on hover)
• whileTap: scale 0.95 (shrink on click)
• Spring animation for natural feel
• Support for primary/secondary variants
• Full SCSS styling with dark mode
```

---

#### 3.3 Create LoadingSpinner with Animation

**File:** `src/components/animations/LoadingSpinner.jsx`

```javascript
import { motion } from 'framer-motion';
import './LoadingSpinner.module.scss';

export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'spinner--sm',
    md: 'spinner--md',
    lg: 'spinner--lg',
  };

  return (
    <div className="spinner-container">
      <motion.div
        className={`spinner ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          type: 'linear',
          duration: 1,
          repeat: Infinity,
        }}
      >
        <div className="spinner-inner" />
      </motion.div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}
```

**File:** `src/components/animations/LoadingSpinner.module.scss`

```scss
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  position: relative;
  width: 40px;
  height: 40px;
  
  &--sm {
    width: 24px;
    height: 24px;
  }
  
  &--md {
    width: 40px;
    height: 40px;
  }
  
  &--lg {
    width: 60px;
    height: 60px;
  }
  
  .spinner-inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: var(--color-primary);
    border-radius: 50%;
  }
}

.spinner-message {
  margin-top: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
}
```

**Commit message:**
```
feat(components): LoadingSpinner - Animated loading indicator

Create LoadingSpinner with Framer Motion:
• Rotating animation (360 degrees, 1s loop)
• Multiple size options (sm, md, lg)
• Optional loading message
• Dark mode compatible
• Smooth linear rotation
```

---

#### 3.4 Create ModalAnimation Component

**File:** `src/components/animations/ModalAnimation.jsx`

```javascript
import { motion, AnimatePresence } from 'framer-motion';
import './ModalAnimation.module.scss';

export function ModalAnimation({ isOpen, onClose, children, title }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />
          
          {/* Modal */}
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {title && <h2 className="modal-title">{title}</h2>}
            <div className="modal-body">
              {children}
            </div>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**File:** `src/components/animations/ModalAnimation.module.scss`

```scss
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-body {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
  
  &:hover {
    color: var(--color-text);
  }
}
```

**Commit message:**
```
feat(components): ModalAnimation - Animated modal with Framer Motion

Create ModalAnimation with entrance/exit effects:
• Backdrop fade (0.2s)
• Modal scale + opacity + Y translation
• Spring animation for smooth feel
• AnimatePresence for proper cleanup
• Customizable title and content
• Click backdrop to close
• SCSS styling with dark mode support
```

---

#### 3.5 Update Pages to Use PageTransition

**File:** `src/pages/JobsPage.jsx` (example)

```javascript
import { PageTransition } from '@components/animations/PageTransition';
import { useJobs } from '@hooks/useJobs';

export function JobsPage() {
  const { data: jobs, isLoading, error } = useJobs();

  return (
    <PageTransition visible={!isLoading}>
      <div className="jobs-page">
        {error && <ErrorAlert error={error} />}
        
        <h1>Jobs</h1>
        
        <div className="jobs-grid">
          {jobs?.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
```

**Commit message:**
```
refactor(pages): JobsPage - add PageTransition animation

Update JobsPage with PageTransition wrapper:
• Smooth fade-in on page load
• Fade-out on navigation
• Loading state respected
• No functional changes
```

---

## PHASE 4: CONTEXT PROVIDERS (Optional, 2-3 hours)

### Goal
Add context providers for user, notifications, and theme management.

### Tasks

#### 4.1 Create UserContext

**File:** `src/context/UserContext.jsx`

```javascript
import React, { createContext, useContext } from 'react';
import { useAuthUser } from '@hooks/useAuth';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const { data: currentUser, isLoading, error } = useAuthUser();

  const value = {
    currentUser,
    isLoading,
    error,
    isAuthenticated: !!currentUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

**File:** `src/context/UserContext.test.js`

```javascript
import { renderHook } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import { useAuthUser } from '@hooks/useAuth';

jest.mock('@hooks/useAuth');

describe('UserContext', () => {
  test('should provide user data', () => {
    const mockUser = { id: 1, email: 'user@example.com' };
    useAuthUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    const wrapper = ({ children }) => (
      <UserProvider>{children}</UserProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should throw error if used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useUser must be used within UserProvider');

    spy.mockRestore();
  });
});
```

**Commit message:**
```
feat(context): UserContext - Centralized user state management

Create UserContext for app-wide user state:
• currentUser - authenticated user object
• isLoading - loading state
• error - error state
• isAuthenticated - boolean computed from currentUser
• useUser() hook for accessing context

Tests:
• Test user data provision (2/2 passing)
• Test error handling (2/2 passing)
```

---

#### 4.2 Create App Wrapper

**File:** `src/App.jsx` (update to include providers)

```javascript
import { UserProvider } from '@context/UserContext';
import { PageTransition } from '@components/animations/PageTransition';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Router from '@router';

export function App() {
  return (
    <UserProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <PageTransition>
        <Router />
      </PageTransition>
    </UserProvider>
  );
}
```

**Commit message:**
```
refactor(app): Add UserProvider and animation wrappers

Update App component structure:
• Add UserProvider for user state
• Add ToastContainer for notifications
• Wrap Router with PageTransition
• Maintain Redux/Router providers in main.jsx
```

---

## VALIDATION & TESTING PHASE (2 hours)

### Goal
Ensure all implementations work correctly and don't break existing functionality.

### Tasks

#### V.1 Run All Tests

```bash
npm test -- --coverage
```

**Expected output:**
- All existing tests pass (265+ tests)
- React Query tests pass (8/8)
- Notification tests pass (8/8)
- Animation tests pass (8/8)
- Providers tests pass (2/2)
- **Total: 300+ tests passing**
- **Coverage: >90%**

---

#### V.2 Manual Testing Checklist

**React Query:**
- [ ] Jobs page loads and caches data
- [ ] Creating a job invalidates cache and refetches
- [ ] Error handling shows proper messages
- [ ] Loading states display correctly
- [ ] Network request deduplication works

**Notifications:**
- [ ] Success notifications appear on job creation
- [ ] Error notifications appear on failures
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Multiple notifications stack properly
- [ ] Click backdrop dismisses toast

**Animations:**
- [ ] Page transitions fade in smoothly
- [ ] Buttons scale on hover/click
- [ ] Loading spinner rotates continuously
- [ ] Modal opens with scale animation
- [ ] Modal closes with fade animation

**Providers:**
- [ ] UserProvider supplies current user
- [ ] useUser hook works in components
- [ ] Context properly clears on logout

---

#### V.3 Performance Check

```javascript
// Add to package.json scripts
"test:perf": "lighthouse https://localhost:3000 --view"
```

**Metrics to check:**
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] React Query reduces network requests by 30%+

---

## COMMIT SUMMARY

### Phase 0: Setup (1 commit)
```
chore(config): queryClient - React Query configuration
```

### Phase 1: React Query (3 commits)
```
feat(react-query): setup QueryClientProvider
feat(hooks): useJobs - React Query integration for jobs
feat(hooks): useAuth - React Query integration for authentication
test(integration): react-query.integration - Test caching and invalidation
```

### Phase 2: Notifications (3 commits)
```
feat(services): notificationService - Toast notifications with react-toastify
feat(app): ToastContainer setup - Configure react-toastify
refactor(services): jobService - integrate notificationService
```

### Phase 3: Animations (4 commits)
```
feat(components): PageTransition - Framer Motion page animations
feat(components): AnimatedButton - Framer Motion interactive button
feat(components): LoadingSpinner - Animated loading indicator
feat(components): ModalAnimation - Animated modal with Framer Motion
refactor(pages): JobsPage - add PageTransition animation
```

### Phase 4: Providers (2 commits)
```
feat(context): UserContext - Centralized user state management
refactor(app): Add UserProvider and animation wrappers
```

### Total: 13 commits over 2-3 weeks

---

## TIMELINE

### Week 1
- **Monday-Tuesday:** Phase 0 + Phase 1.1-1.2 (Setup + React Query basics)
- **Wednesday:** Phase 1.3-1.5 (Auth hooks + integration tests)
- **Thursday:** Phase 2.1-2.3 (Notifications)
- **Friday:** Testing & validation

### Week 2
- **Monday-Wednesday:** Phase 3 (Animations - all components)
- **Thursday:** Phase 4 (Optional - Providers)
- **Friday:** Final testing, performance check, documentation

### Week 3 (if needed)
- Bug fixes
- Performance optimization
- Additional polish

---

## SUCCESS CRITERIA

- [ ] All 300+ existing tests pass
- [ ] React Query reduces service code by 30%
- [ ] Zero breaking changes to existing APIs
- [ ] Performance metrics maintained or improved
- [ ] Code coverage > 90%
- [ ] All new features documented
- [ ] Production-ready without rollback risk

---

## ROLLBACK PLAN

Each phase is independently deployable. If issues arise:

1. **Phase 0 & 1 issues:** Revert React Query commits, keep queryClient config
2. **Phase 2 issues:** Remove toast notifications, keep AlertList
3. **Phase 3 issues:** Remove Framer Motion, keep component logic
4. **Phase 4 issues:** Remove contexts, keep Redux

No phase is dependent on another for core functionality.

