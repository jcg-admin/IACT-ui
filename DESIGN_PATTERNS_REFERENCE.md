/**
 * DESIGN PATTERNS REFERENCE - IACT v4.0
 * 
 * This document catalogs all design patterns used in the project
 * and recommendations for when to use each one.
 * 
 * References:
 * - Gang of Four (GoF) Design Patterns
 * - React Patterns (Component patterns)
 * - JavaScript patterns (Module, Singleton, etc.)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. SINGLETON PATTERN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Need a single instance of something (service, store, cache)
 * Solution: Ensure only one instance exists globally
 * 
 * Used in IACT:
 * - notificationService (getNotificationService)
 * - queryClient (single instance per app)
 * - Redux store
 * 
 * Example:
 */

// BAD - Creates multiple instances
export const getService = () => new Service()

// GOOD - Singleton pattern
let instance = null

export const getService = () => {
  if (!instance) {
    instance = new Service()
  }
  return instance
}

/**
 * When to use:
 * ✅ Services (notification, auth, storage)
 * ✅ Cache/Store (Redux, QueryClient)
 * ✅ Configuration
 * ❌ Components (Use Context instead)
 * ❌ Data objects (Use props/state)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 2. CONFIGURATION PATTERN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Need to pass complex configuration without repetition
 * Solution: Use configuration objects instead of multiple parameters
 * 
 * Used in IACT:
 * - exportService (exportToExcel, exportTableToPDF)
 * - Redux store initialization
 * - API configurations
 * 
 * Example:
 */

// BAD - Too many parameters, hard to remember order
const exportToExcel = (
  data,
  fileName,
  sheetName,
  headers,
  columns,
  title,
  timestamp
) => {}

// GOOD - Configuration object
const exportToExcel = (data, options = {}) => {
  const {
    fileName = 'export.xlsx',
    sheetName = 'Sheet1',
    headers = [],
    columns = [],
    title = '',
    timestamp = true,
  } = options
}

// Usage:
exportToExcel(data, {
  fileName: 'users.xlsx',
  headers: ['ID', 'Name'],
  columns: ['id', 'name'],
  title: 'Users Report',
})

/**
 * When to use:
 * ✅ Functions with 3+ parameters
 * ✅ API calls and data fetching
 * ✅ Component props with many options
 * ✅ Service initialization
 * ❌ Simple functions (keep simple params)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 3. COMPOSITION PATTERN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Code repetition across components
 * Solution: Compose functionality from smaller pieces
 * 
 * Used in IACT:
 * - useExport hook + ExportButtons component
 * - React component composition
 * - Service composition
 * 
 * Example:
 */

// BAD - Repeating logic in each component
function ComponentA() {
  const [exporting, setExporting] = useState(false)
  const handleExport = async () => {
    setExporting(true)
    // ... 30 lines of export code
    setExporting(false)
  }
  return <button onClick={handleExport}>Export</button>
}

function ComponentB() {
  const [exporting, setExporting] = useState(false)
  const handleExport = async () => {
    setExporting(true)
    // ... SAME 30 lines of code
    setExporting(false)
  }
  return <button onClick={handleExport}>Export</button>
}

// GOOD - Composition
const { handleExport, exporting } = useExport(data, config)
return <ExportButtons data={data} config={config} />

/**
 * When to use:
 * ✅ Hooks (useExport, useAuth, useQuery)
 * ✅ Reusable components (Button, Card, Modal)
 * ✅ Shared logic across features
 * ✅ Service composition
 * ❌ One-off functionality
 * ❌ Very simple utilities
 */

// ═══════════════════════════════════════════════════════════════════════════
// 4. STRATEGY PATTERN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Multiple algorithms/strategies for the same thing
 * Solution: Encapsulate each strategy, make them interchangeable
 * 
 * Used in IACT:
 * - Export formats (Excel, PDF, CSV)
 * - Authentication strategies
 * - Sorting/filtering strategies
 * 
 * Example:
 */

// BAD - Giant switch statement
const export = (format, data, config) => {
  if (format === 'excel') {
    // 20 lines
  } else if (format === 'pdf') {
    // 20 lines
  } else if (format === 'csv') {
    // 20 lines
  }
}

// GOOD - Strategy pattern
const exportStrategies = {
  excel: (data, config) => exportToExcel(data, config),
  pdf: (data, config) => exportTableToPDF(data, config),
  csv: (data, config) => exportToCSV(data, config),
}

const export = (format, data, config) => {
  return exportStrategies[format](data, config)
}

/**
 * When to use:
 * ✅ Multiple algorithms for same problem
 * ✅ Different export formats
 * ✅ Different authentication methods
 * ✅ Different sorting/filtering strategies
 * ❌ Simple if/else with 1-2 options
 * ❌ Complex interdependent logic
 */

// ═══════════════════════════════════════════════════════════════════════════
// 5. FACTORY PATTERN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Creating objects with complex initialization
 * Solution: Use factory function to handle object creation
 * 
 * Used in IACT:
 * - Creating exporters
 * - Creating services
 * - Creating React components dynamically
 * 
 * Example:
 */

// BAD - Complex initialization scattered
const excelExporter = new ExcelExporter({
  styles: {...},
  validation: {...},
  formatting: {...}
})

// GOOD - Factory function
const createExporter = (format) => {
  const exporters = {
    excel: () => new ExcelExporter(excelConfig),
    pdf: () => new PDFExporter(pdfConfig),
    csv: () => new CSVExporter(csvConfig),
  }
  return exporters[format]()
}

const exporter = createExporter('excel')

/**
 * When to use:
 * ✅ Complex object initialization
 * ✅ Conditional object creation
 * ✅ Creating different types with same interface
 * ❌ Simple object creation
 * ❌ One-time use objects
 */

// ═══════════════════════════════════════════════════════════════════════════
// 6. MODULE PATTERN (Closure-based)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Need private and public methods
 * Solution: Use module pattern with closures
 * 
 * Used in IACT:
 * - Services (exportService, authService)
 * - Store modules
 * - Redux slices
 * 
 * Example:
 */

// BAD - Everything public
class ExportService {
  validate() {}
  notify() {}
  export() {}
}

// GOOD - Module pattern with private methods
const createExportService = () => {
  const validate = (data) => {} // Private
  const notify = (message) => {} // Private

  return {
    export: (data, config) => {
      if (!validate(data)) return
      notify('Exporting...')
      // ...
    },
  }
}

/**
 * When to use:
 * ✅ Services with private/public methods
 * ✅ Encapsulating state and behavior
 * ✅ Avoiding global scope pollution
 * ❌ Simple utilities
 * ❌ When you need inheritance (use classes)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 7. PROVIDER PATTERN (React Context)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Passing data through many component levels
 * Solution: Use React Context (Provider pattern)
 * 
 * Used in IACT:
 * - Redux Provider
 * - NotificationContext (ToastProvider)
 * - ThemeContext
 * 
 * Example:
 */

// BAD - Prop drilling
<GrandParent notifications={notifications}>
  <Parent notifications={notifications}>
    <Child notifications={notifications} />
  </Parent>
</GrandParent>

// GOOD - Provider pattern
const NotificationContext = createContext()

<NotificationProvider>
  <GrandParent>
    <Parent>
      <Child /> {/* useContext(NotificationContext) */}
    </Parent>
  </GrandParent>
</NotificationProvider>

/**
 * When to use:
 * ✅ Global state (theme, auth, notifications)
 * ✅ Avoiding prop drilling
 * ✅ React Context use cases
 * ❌ Local component state
 * ❌ Frequently changing data
 */

// ═══════════════════════════════════════════════════════════════════════════
// 8. RENDER PROPS PATTERN (Alternative to hooks)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Share stateful logic between components
 * Solution: Use render props or hooks
 * 
 * Note: Hooks are preferred over render props in modern React
 * 
 * Example (less common now):
 */

// OLD - Render props (still valid, but less common)
<Export>
  {({ exporting, handleExport }) => (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Export'}
    </button>
  )}
</Export>

// NEW - Hooks (preferred)
const { exporting, handleExport } = useExport(data, config)

/**
 * When to use:
 * ✅ Sharing state before hooks existed
 * ✅ Some edge cases where hooks don't fit
 * ❌ Prefer hooks for modern React
 */

// ═══════════════════════════════════════════════════════════════════════════
// 9. OBSERVER PATTERN (Event emitters)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Problem: Need to notify multiple objects of state changes
 * Solution: Use observer pattern (event emitters)
 * 
 * Used in IACT:
 * - WebSocket events (from análisis)
 * - Event emitters
 * - Redux subscribers
 * 
 * Example:
 */

class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data))
    }
  }
}

// Usage
const emitter = new EventEmitter()
emitter.on('export-complete', (fileName) => {
  notify.success(`${fileName} exported`)
})

/**
 * When to use:
 * ✅ Event-driven architecture
 * ✅ Multiple observers of same event
 * ✅ Decoupling components
 * ❌ Simple callbacks
 * ❌ When hooks/context fit better
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON TABLE - When to use each pattern
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern              | Complexity | DRY | Recommended | When
 * ─────────────────────┼────────────┼─────┼─────────────┼──────────────────
 * Singleton            | Low        | ✅  | ✅✅✅     | Services, stores
 * Configuration        | Low        | ✅  | ✅✅✅     | Functions, APIs
 * Composition          | Low        | ✅  | ✅✅       | Hooks, components
 * Strategy             | Medium     | ✅  | ✅✅       | Multiple algorithms
 * Factory              | Medium     | ✅  | ✅         | Complex creation
 * Module               | Low        | ✅  | ✅✅       | Services, encapsulation
 * Provider             | Medium     | ✅  | ✅✅       | Global state
 * Render Props         | Medium     | ✅  | ❌         | Use hooks instead
 * Observer             | High       | ✅  | ✅         | Event-driven
 * Template Method      | High       | ✅  | ❌         | Rarely needed
 * Decorator            | High       | ✅  | ⚠️        | Advanced use
 */

// ═══════════════════════════════════════════════════════════════════════════
// FOR OUR EXPORT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * What we used:
 * 1. CONFIGURATION PATTERN - exportToExcel(data, options)
 * 2. COMPOSITION PATTERN - useExport hook + ExportButtons component
 * 3. STRATEGY PATTERN - exportStrategies['excel'|'pdf'|'csv']
 * 
 * Why this approach:
 * ✅ DRY - No repetition
 * ✅ SIMPLE - Not over-engineered
 * ✅ REUSABLE - Works with any data
 * ✅ EXTENSIBLE - Easy to add new formats
 * ✅ TESTABLE - Each piece independently
 * ✅ MAINTAINABLE - Clear responsibilities
 * 
 * Alternatives considered:
 * ❌ Factory Pattern - Overkill for export (too simple)
 * ❌ Template Method - Too complex (Python/Java style)
 * ❌ No patterns - Would have 100+ repeated lines
 * 
 * Recommendation:
 * Current approach (Config + Composition + Strategy) is PERFECT for this use case
 */

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCES & FURTHER READING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gang of Four (GoF) - Classic Design Patterns
 * - Creational: Singleton, Factory, Builder
 * - Structural: Adapter, Decorator, Facade
 * - Behavioral: Observer, Strategy, Template Method
 * 
 * React Patterns
 * - Component Composition
 * - Render Props
 * - Hooks
 * - Context (Provider Pattern)
 * 
 * JavaScript Patterns
 * - Module Pattern
 * - Singleton Pattern
 * - Observer Pattern
 * - Facade Pattern
 * 
 * Our Project Context:
 * - We prefer COMPOSITION + HOOKS over class-based patterns
 * - We avoid TEMPLATE METHOD (too verbose for JavaScript)
 * - We use CONFIGURATION heavily (cleaner than Builder)
 * - We use STRATEGY for algorithm variations
 */
