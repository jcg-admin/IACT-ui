# RAID PARTY APP - FUNCTIONAL ANALYSIS FOR IACT

## What Real Functionality Can We Use?

After deep code analysis, here's what Raid Party implements that could help IACT:

---

## 1. CONTEXT-BASED STATE MANAGEMENT (Not Redux)

### Raid Party Pattern

```javascript
// src/App.jsx
export const AppContext = createContext();

export const App = () => {
  const [state, setState] = useState({openedPanel: null});
  const [uiMode, setUIMode] = useState('normal');
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedScene, setSelectedScene] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  
  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        uiMode,
        setUIMode,
        selectedApp,
        setSelectedApp,
        // ... many more state values
      }}
    >
      {/* App components */}
    </AppContext.Provider>
  );
};
```

### Usage in Components

```javascript
// In any component
const { selectedApp, setSelectedApp, uiMode } = useContext(AppContext);
```

### IACT Equivalent: Already Using Redux Toolkit

IACT uses Redux Toolkit which is **better than Context** for:
- Time-travel debugging
- State persistence
- Type safety
- Middleware support
- Performance optimization

**Verdict:** ✅ Keep Redux, don't switch to Context

---

## 2. REACT QUERY FOR DATA FETCHING

### Raid Party Pattern

```javascript
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App */}
    </QueryClientProvider>
  );
};
```

### Benefits

- ✅ Automatic caching
- ✅ Background refetching
- ✅ Request deduplication
- ✅ Pagination handling
- ✅ Built-in loading/error states

### IACT Could Use This For

```javascript
// Instead of manual fetch + useState
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/jobs')
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false); })
    .catch(e => { setError(e); setLoading(false); });
}, []);

// Use React Query instead:
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => fetch('/api/jobs').then(r => r.json()),
});
```

### Implementation for IACT

```javascript
// src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

```javascript
// src/main.jsx or index.jsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <App />
    </Provider>
  </QueryClientProvider>,
  document.getElementById('root')
);
```

```javascript
// src/hooks/useJobs.js
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@services/jobService';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getAll(),
  });
}

// Usage in component
export function JobList() {
  const { data: jobs, isLoading, error } = useJobs();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {jobs.map(job => <li key={job.id}>{job.name}</li>)}
    </ul>
  );
}
```

**Recommendation:** ✅ **IMPLEMENT THIS IN IACT**

Current IACT manually manages loading/error states. React Query would simplify this significantly.

---

## 3. FRAMER MOTION FOR ANIMATIONS

### Raid Party Pattern

```javascript
import { motion } from 'framer-motion';

export function PageTransition({ visible, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

### Usage

```javascript
<motion.div
  animate={{ scale: 1 }}
  initial={{ scale: 0 }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  Click me!
</motion.div>
```

### IACT Could Use This For

- ✅ Page transitions
- ✅ Modal animations
- ✅ Loading spinners
- ✅ Hover effects
- ✅ Scroll animations

**Recommendation:** ⏳ **CONSIDER FOR V2** (lower priority than React Query)

---

## 4. TOAST NOTIFICATIONS

### Raid Party Pattern

```javascript
import { ToastContainer } from 'react-toastify';

export const App = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="dark"
    />
  );
};
```

### Usage

```javascript
import { toast } from 'react-toastify';

// In any component or service
toast.success('Login successful!');
toast.error('Login failed');
toast.info('Loading...');
toast.warning('Are you sure?');
```

### IACT Current State

IACT has `AlertList` and `AlertItem` components. Could enhance with:
- Auto-dismiss toasts
- Position management
- Built-in icons
- Stacking behavior

**Recommendation:** ✅ **OPTIONAL ENHANCEMENT** to existing AlertList

---

## 5. PROVIDER PATTERN FOR MULTIPLE CONTEXTS

### Raid Party Pattern

```javascript
// src/hooks/web3AccountProvider.jsx
export const AccountContext = createContext();

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  
  useEffect(() => {
    // Connect to wallet
    // Listen for changes
  }, []);
  
  return (
    <AccountContext.Provider value={{ account, chainId }}>
      {children}
    </AccountContext.Provider>
  );
}

// src/hooks/chainProvider.jsx
export const ChainContext = createContext();

export function ChainProvider({ children }) {
  const [selectedChain, setSelectedChain] = useState('ethereum');
  // ...
}

// src/App.jsx
export const App = () => {
  return (
    <AccountProvider>
      <ChainProvider>
        <ThemeProvider>
          {/* App content */}
        </ThemeProvider>
      </ChainProvider>
    </AccountProvider>
  );
};
```

### IACT Could Implement Similar Pattern

Currently IACT wraps with:
```javascript
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </PersistGate>
</Provider>
```

Could add provider wrappers for:
- ✅ User context (current user, permissions)
- ✅ Notifications context (toast/alert management)
- ✅ Theme context (dark/light mode)
- ✅ Language/i18n context

**Recommendation:** ⏳ **CONSIDER FOR FUTURE**

---

## 6. CUSTOM HOOKS FOR COMPLEX LOGIC

### Raid Party Pattern

```javascript
// src/hooks/useChain.js
export function useChain(network = DEFAULT_CHAIN) {
  const [selectedChain, setSelectedChain] = useState(network);
  const [supportedChain, setSupportedChain] = useState(false);
  
  useEffect(() => {
    if (isChainSupported(selectedChain)) {
      setSupportedChain(true);
    }
  }, [selectedChain]);
  
  useEffect(() => {
    const handleChainChanged = async (chainId) => {
      const newChain = CHAINS[CHAIN_ID_MAP[chainId]];
      setSelectedChain(newChain);
    };
    
    window.ethereum?.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);
  
  const selectChain = useCallback(
    async (chain) => {
      if (isChainSupported(chain)) {
        try {
          await switchChain(chain.chainId);
          setSelectedChain(chain);
        } catch (err) {
          console.warn(err);
        }
      }
    },
    [selectedChain],
  );
  
  return {
    selectedChain,
    selectChain,
    supportedChain,
    chains: CHAINS,
  };
}

// Usage
const { selectedChain, selectChain } = useChain();
```

### Key Pattern Elements

1. **Encapsulation:** Hide implementation details
2. **Event listeners:** Proper cleanup
3. **Callbacks:** useCallback for stability
4. **Return object:** Export only what's needed

### IACT Already Has Good Hooks

- ✅ useForm (form management)
- ✅ useAsync (async operations)
- ✅ useDebounce, useThrottle (optimization)
- ✅ useMediaQuery (responsive)
- ✅ useClickAway (click outside)

**Verdict:** ✅ IACT hooks are good, follow similar pattern for new ones

---

## 7. CONDITIONAL RENDERING WITH CONTEXT

### Raid Party Pattern

```javascript
// Multiple UI modes based on context
const { uiMode, setUIMode, openAdventures } = useContext(AppContext);

return (
  <>
    {uiMode === 'normal' && <NormalUI />}
    {uiMode === 'adventure' && <AdventureUI />}
    {uiMode === 'map' && <MapUI />}
    
    <PageTransition visible={openAdventures}>
      <Adventures />
    </PageTransition>
  </>
);
```

### IACT Equivalent (Using Redux)

Already implemented:
```javascript
const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
const loading = useSelector(state => state.auth.isLoading);

return (
  <>
    {loading && <LoadingSpinner />}
    {isAuthenticated ? <Dashboard /> : <LoginPage />}
  </>
);
```

**Verdict:** ✅ IACT handles this well with Redux

---

## SUMMARY: WHAT TO IMPLEMENT IN IACT

### HIGH PRIORITY ⭐⭐⭐

1. **React Query** (replace manual fetch + useState)
   - Effort: 4-6 hours
   - Impact: Better data management, less boilerplate
   - Files affected: All service/API calls
   
### MEDIUM PRIORITY ⭐⭐

2. **Enhanced Toast System** (upgrade AlertList)
   - Effort: 2-3 hours
   - Impact: Better UX for notifications
   - Files affected: AlertList component

3. **Framer Motion Animations** (add page transitions)
   - Effort: 3-4 hours
   - Impact: More polished UI
   - Files affected: Page components

### LOW PRIORITY ⭐

4. **Additional Contexts** (user, notifications, theme)
   - Effort: 2-3 hours
   - Impact: Better code organization
   - Files affected: App wrapper

5. **More Custom Hooks** (specific domain logic)
   - Effort: 1-2 hours per hook
   - Impact: Better encapsulation
   - Files affected: Specific modules

---

## WHAT NOT TO CHANGE

❌ **Don't switch from Redux to Context**
- Redux is better for IACT's complexity
- Redux DevTools are invaluable
- Redux Toolkit is modern and efficient

❌ **Don't switch from Webpack to Vite**
- Current build works fine
- Webpack 5 is mature and reliable
- Switching would require major refactoring

❌ **Don't adopt styled-components**
- SCSS + CSS Modules already works well
- Less JavaScript in CSS
- Better CSS separation

---

## IMPLEMENTATION ROADMAP

### Phase 1: React Query (THIS WEEK)
```javascript
// Install
npm install @tanstack/react-query

// Add to main.jsx
import { QueryClientProvider } from '@tanstack/react-query'

// Create hooks
export function useJobs() {
  return useQuery({ queryKey: ['jobs'], ... })
}
```

### Phase 2: Enhanced Notifications (NEXT WEEK)
```javascript
// Add react-toastify alongside AlertList
// Create unified notification service
export const notificationService = {
  success: (msg) => { AlertList.add(msg, 'success') },
  error: (msg) => { AlertList.add(msg, 'error') },
}
```

### Phase 3: Animations (2-3 WEEKS)
```javascript
// Add framer-motion to page transitions
// Create PageTransition component
```

---

## CONCLUSION

**Raid Party is great for 3D/Web3, but most useful for IACT is:**

1. ✅ **React Query pattern** - Data fetching management
2. ✅ **Context/Provider pattern** - App-level state
3. ⏳ **Animation patterns** - Polish and UX
4. ❌ **Styled-components** - Don't adopt
5. ❌ **Vite** - Don't migrate

**IACT is already well-architected. React Query would be the biggest improvement.**

