/**
 * PATRONES IMPLEMENTABLES EN IACT
 * 
 * Este documento identifica patrones adicionales que PUEDEN ser implementados
 * para mejorar la calidad del código, con ejemplos prácticos y beneficios.
 * 
 * Status: Análisis de oportunidades
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. FACTORY PATTERN - Implementar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Oportunidad: Para crear diferentes tipos de servicios/exportadores
 * 
 * Dónde: src/factories/exporterFactory.js
 * Beneficio: Fácil agregar nuevos formatos (JSON, XML, etc.)
 * Prioridad: MEDIA
 */

// Implementación propuesta:
export const exporterFactoryExample = `
// src/factories/exporterFactory.js

class BaseExporter {
  constructor(config = {}) {
    this.fileName = config.fileName || 'export'
    this.title = config.title || ''
    this.timestamp = config.timestamp !== false
  }

  getFileName(extension) {
    if (this.timestamp) {
      const date = new Date().toISOString().slice(0, 10)
      return \`\${this.fileName}_\${date}\${extension}\`
    }
    return \`\${this.fileName}\${extension}\`
  }
}

class ExcelExporter extends BaseExporter {
  async export(data, options) {
    // Excel-specific logic
    return await exportToExcel(data, {
      fileName: this.getFileName('.xlsx'),
      ...options
    })
  }
}

class PDFExporter extends BaseExporter {
  async export(htmlElement, options) {
    // PDF-specific logic
    return await exportTableToPDF(htmlElement, {
      fileName: this.getFileName('.pdf'),
      ...options
    })
  }
}

class CSVExporter extends BaseExporter {
  export(data, options) {
    // CSV-specific logic
    return exportToCSV(data, {
      fileName: this.getFileName('.csv'),
      ...options
    })
  }
}

// Factory function
export const createExporter = (format, config = {}) => {
  const exporters = {
    excel: () => new ExcelExporter(config),
    pdf: () => new PDFExporter(config),
    csv: () => new CSVExporter(config),
    // Future formats easily added:
    // json: () => new JSONExporter(config),
    // xml: () => new XMLExporter(config),
  }
  
  const exporter = exporters[format]?.()
  if (!exporter) {
    throw new Error(\`Unknown exporter format: \${format}\`)
  }
  return exporter
}

// Usage:
const exporter = createExporter('excel', {
  fileName: 'users',
  title: 'User Report'
})

const result = await exporter.export(userData, { headers, columns })
`

/**
 * Cuándo implementar FACTORY:
 * ✅ Cuando: Tengas 5+ exportadores con setup común
 * ✅ Cuando: Necesites centralizar creación de objetos
 * ❌ NO cuando: Solo tengas 3 formatos (Strategy es más simple)
 * 
 * Esfuerzo: BAJO (2 horas)
 * Beneficio: MEDIO (mejor cuando hay más formatos)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 2. DECORATOR PATTERN - Implementar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Oportunidad: Agregar comportamiento a servicios/funciones
 * 
 * Casos de uso:
 * - Caching de resultados
 * - Logging de operaciones
 * - Rate limiting
 * - Timing de ejecución
 * - Validación de entrada
 * 
 * Dónde: src/decorators/
 * Beneficio: Separar "cross-cutting concerns" de lógica core
 * Prioridad: ALTA
 */

export const decoratorPatternExample = `
// src/decorators/withCaching.js

/**
 * Decorator: Agrega caching a funciones
 */
export const withCaching = (fn, cacheKey = null) => {
  const cache = new Map()
  
  return async function(...args) {
    const key = cacheKey ? cacheKey(...args) : JSON.stringify(args)
    
    // Check cache
    if (cache.has(key)) {
      console.log('Cache hit:', key)
      return cache.get(key)
    }
    
    // Execute function
    console.log('Cache miss, executing:', key)
    const result = await fn.apply(this, args)
    
    // Store in cache
    cache.set(key, result)
    return result
  }
}

// src/decorators/withLogging.js

/**
 * Decorator: Agrega logging a funciones
 */
export const withLogging = (fn, fnName = fn.name) => {
  return async function(...args) {
    console.log(\`[LOG] \${fnName} called with:\`, args)
    
    try {
      const startTime = performance.now()
      const result = await fn.apply(this, args)
      const endTime = performance.now()
      
      console.log(
        \`[LOG] \${fnName} completed in \${(endTime - startTime).toFixed(2)}ms\`
      )
      return result
    } catch (error) {
      console.error(\`[ERROR] \${fnName} failed:\`, error)
      throw error
    }
  }
}

// src/decorators/withValidation.js

/**
 * Decorator: Agrega validación a funciones
 */
export const withValidation = (fn, validator) => {
  return async function(...args) {
    // Validate arguments
    const validation = validator(...args)
    if (!validation.valid) {
      throw new Error(validation.message)
    }
    
    // Execute function
    return await fn.apply(this, args)
  }
}

// Uso práctico:

// Original service
const getUserById = async (userId) => {
  return await apiService.get(\`/api/users/\${userId}/\`)
}

// Con decorators
const getUserByIdWithCache = withCaching(
  withLogging(getUserById, 'getUserById'),
  (userId) => \`user:\${userId}\`  // Cache key
)

// Con validación
const getUserByIdSafe = withValidation(
  getUserByIdWithCache,
  (userId) => {
    if (!userId || typeof userId !== 'number') {
      return { valid: false, message: 'Invalid user ID' }
    }
    return { valid: true }
  }
)

// Uso:
const user = await getUserByIdSafe(123)  // Con logging, caching, validación
`

/**
 * Cuándo implementar DECORATOR:
 * ✅ ALTO VALOR: Caching de queries frecuentes
 * ✅ ALTO VALOR: Logging de operaciones críticas
 * ✅ ALTO VALOR: Rate limiting en APIs
 * ✅ MEDIO VALOR: Validación de entrada
 * ✅ MEDIO VALOR: Timing de ejecución
 * 
 * Esfuerzo: BAJO (4 horas para 3-4 decorators)
 * Beneficio: ALTO (reutilizable en toda la app)
 * ROI: EXCELENTE
 */

// ═══════════════════════════════════════════════════════════════════════════
// 3. ADAPTER PATTERN - Implementar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Oportunidad: Integrar APIs/librerías externas consistentemente
 * 
 * Casos de uso:
 * - Diferentes APIs externas (Google Drive, Slack, etc.)
 * - Diferentes formatos de respuesta
 * - Diferentes sistemas de autenticación
 * 
 * Dónde: src/adapters/
 * Beneficio: Cambiar providers sin afectar resto del código
 * Prioridad: MEDIA (si hay integraciones externas)
 */

export const adapterPatternExample = `
// src/adapters/storageAdapter.js

/**
 * Adapter: Diferentes storage backends con interfaz consistente
 */

// Interface comum
class StorageAdapter {
  async get(key) { throw 'Not implemented' }
  async set(key, value) { throw 'Not implemented' }
  async delete(key) { throw 'Not implemented' }
}

// LocalStorage adapter
class LocalStorageAdapter extends StorageAdapter {
  async get(key) {
    return JSON.parse(localStorage.getItem(key))
  }
  
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }
  
  async delete(key) {
    localStorage.removeItem(key)
  }
}

// IndexedDB adapter
class IndexedDBAdapter extends StorageAdapter {
  constructor(dbName = 'IACT') {
    super()
    this.db = null
    this.dbName = dbName
    this.init()
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }
  
  async get(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readonly')
      const store = transaction.objectStore('data')
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  
  async set(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readwrite')
      const store = transaction.objectStore('data')
      const request = store.put({ key, value })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async delete(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readwrite')
      const store = transaction.objectStore('data')
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Redis adapter (for server-side)
class RedisAdapter extends StorageAdapter {
  constructor(client) {
    super()
    this.client = client
  }
  
  async get(key) {
    return JSON.parse(await this.client.get(key))
  }
  
  async set(key, value) {
    await this.client.set(key, JSON.stringify(value))
  }
  
  async delete(key) {
    await this.client.del(key)
  }
}

// Factory para crear adapter
export const createStorageAdapter = (type = 'localStorage') => {
  const adapters = {
    localStorage: () => new LocalStorageAdapter(),
    indexeddb: () => new IndexedDBAdapter(),
    redis: (client) => new RedisAdapter(client),
  }
  
  return adapters[type]?.()
}

// Uso:
const storage = createStorageAdapter('localStorage')
// O cambiar a:
const storage = createStorageAdapter('indexeddb')
// Sin cambiar código que lo usa

await storage.set('user', { id: 1, name: 'John' })
const user = await storage.get('user')
await storage.delete('user')
`

/**
 * Cuándo implementar ADAPTER:
 * ✅ CUANDO: Integres APIs externas (Google, Slack, etc.)
 * ✅ CUANDO: Tengas múltiples storage backends
 * ✅ CUANDO: Diferentes proveedores de autenticación
 * ❌ NO: Para lógica interna simple
 * 
 * Esfuerzo: MEDIO (8 horas)
 * Beneficio: ALTO (flexibilidad, cambios sin fricción)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 4. FACADE PATTERN - Implementar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Oportunidad: Simplificar interfaces complejas
 * 
 * Casos de uso:
 * - Simplificar múltiples servicios en una interfaz simple
 * - Abstraer complejidad de Redux + React Query
 * - API unificada para features complejas
 * 
 * Dónde: src/facades/
 * Beneficio: Código más simple en componentes
 * Prioridad: MEDIA
 */

export const facadePatternExample = `
// src/facades/userManagementFacade.js

/**
 * Facade: Simplifica gestión de usuarios
 * Combina: Auth service + User service + API calls + Redux
 */
export class UserManagementFacade {
  constructor() {
    this.authService = authService
    this.userService = userService
    this.notify = getNotificationService()
  }
  
  // Operación simple: login + cargar user + guardar en Redux
  async loginUser(username, password) {
    try {
      // Complex flow simplificado:
      const user = await this.authService.login(username, password)
      const userData = await this.userService.getProfile(user.id)
      
      store.dispatch(setUser(userData))
      this.notify.success('Login successful')
      
      return userData
    } catch (error) {
      this.notify.error('Login failed')
      throw error
    }
  }
  
  // Operación: register + auto-login
  async registerAndLogin(formData) {
    try {
      const user = await this.userService.register(formData)
      const userData = await this.authService.login(
        formData.username,
        formData.password
      )
      
      store.dispatch(setUser(userData))
      this.notify.success('Registration successful')
      
      return userData
    } catch (error) {
      this.notify.error('Registration failed')
      throw error
    }
  }
  
  // Operación: update profile + cache invalidation
  async updateProfile(userId, formData) {
    try {
      const updated = await this.userService.update(userId, formData)
      
      store.dispatch(setUser(updated))
      queryClient.invalidateQueries(['user', userId])
      this.notify.success('Profile updated')
      
      return updated
    } catch (error) {
      this.notify.error('Update failed')
      throw error
    }
  }
  
  // Operación: delete user + cleanup
  async deleteUser(userId) {
    try {
      await this.userService.delete(userId)
      
      store.dispatch(logout())
      queryClient.removeQueries(['user'])
      this.notify.success('User deleted')
    } catch (error) {
      this.notify.error('Deletion failed')
      throw error
    }
  }
}

export const userManagementFacade = new UserManagementFacade()

// Uso en componentes (MUY SIMPLE):
const { mutate: login } = useMutation({
  mutationFn: (credentials) => 
    userManagementFacade.loginUser(credentials.username, credentials.password)
})

// Sin Facade, necesitarías:
const { mutate: loginAuth } = useLogin()
const { mutate: loadUser } = useLoadUserProfile()
const dispatch = useDispatch()
const notify = useNotification()

const handleLogin = async (credentials) => {
  try {
    const user = await loginAuth(credentials)
    const profile = await loadUser(user.id)
    dispatch(setUser(profile))
    notify.success('Login successful')
  } catch (error) {
    notify.error('Login failed')
  }
}

// Facade es mucho más limpio!
`

/**
 * Cuándo implementar FACADE:
 * ✅ CUANDO: Tengas operaciones que requieren 3+ servicios
 * ✅ CUANDO: Muchos componentes hagan la misma secuencia
 * ✅ CUANDO: Quieras simplificar la API pública
 * ❌ NO: Para operaciones simples (una sola llamada)
 * 
 * Esfuerzo: BAJO (4 horas)
 * Beneficio: ALTO (componentes más limpios)
 * Complejidad reducida: 30-50%
 */

// ═══════════════════════════════════════════════════════════════════════════
// 5. EXPLICIT OBSERVER PATTERN - Mejorar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Oportunidad: Hacer explicit el Observer pattern del WebSocket
 * 
 * Actualmente: Implícito en Redux/Query
 * Mejora: Crear EventEmitter explícito para eventos en tiempo real
 * 
 * Dónde: src/services/eventBus.js
 * Beneficio: Mejor control de eventos, más testeable
 * Prioridad: BAJA (Redux/Query ya lo hacen bien)
 */

export const explicitObserverExample = `
// src/services/eventBus.js

/**
 * Event Bus: Observer pattern explícito
 * Para eventos que no encajan en Redux o React Query
 */
export class EventBus {
  constructor() {
    this.subscribers = new Map()
  }
  
  /**
   * Suscribirse a un evento
   * @param {string} event - Nombre del evento
   * @param {function} callback - Función a llamar
   * @returns {function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }
    
    this.subscribers.get(event).push(callback)
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback)
  }
  
  /**
   * Desuscribirse de un evento
   */
  unsubscribe(event, callback) {
    if (!this.subscribers.has(event)) return
    
    const callbacks = this.subscribers.get(event)
    const index = callbacks.indexOf(callback)
    
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }
  
  /**
   * Publicar un evento
   */
  emit(event, data) {
    if (!this.subscribers.has(event)) return
    
    this.subscribers.get(event).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(\`Error in \${event} listener:\`, error)
      }
    })
  }
  
  /**
   * Limpiar todos los subscribers de un evento
   */
  clear(event) {
    this.subscribers.delete(event)
  }
}

export const eventBus = new EventBus()

// Eventos predefinidos
export const EVENTS = {
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  JOB_STARTED: 'job:started',
  JOB_COMPLETED: 'job:completed',
  JOB_FAILED: 'job:failed',
  NOTIFICATION_RECEIVED: 'notification:received',
  USER_UPDATED: 'user:updated',
}

// Uso en servicios:
import { eventBus, EVENTS } from '@services/eventBus'

export const jobService = {
  async startJob(jobId) {
    const result = await apiService.post(\`/api/jobs/\${jobId}/start/\`)
    
    // Notificar a toda la app
    eventBus.emit(EVENTS.JOB_STARTED, { jobId, startedAt: new Date() })
    
    return result
  },
  
  async completeJob(jobId, result) {
    const updated = await apiService.post(
      \`/api/jobs/\${jobId}/complete/\`,
      { result }
    )
    
    // Notificar a toda la app
    eventBus.emit(EVENTS.JOB_COMPLETED, { jobId, result })
    
    return updated
  }
}

// Uso en componentes:
function JobMonitor({ jobId }) {
  useEffect(() => {
    // Suscribirse a eventos
    const unsubscribe = eventBus.subscribe(EVENTS.JOB_COMPLETED, (data) => {
      if (data.jobId === jobId) {
        notify.success('Job completed!')
      }
    })
    
    return () => unsubscribe()
  }, [jobId])
  
  return <div>Monitoring job {jobId}...</div>
}

// O en un hook:
export const useJobEvents = (jobId) => {
  const [status, setStatus] = useState('pending')
  
  useEffect(() => {
    const unsubStarted = eventBus.subscribe(EVENTS.JOB_STARTED, (data) => {
      if (data.jobId === jobId) setStatus('running')
    })
    
    const unsubCompleted = eventBus.subscribe(EVENTS.JOB_COMPLETED, (data) => {
      if (data.jobId === jobId) setStatus('completed')
    })
    
    const unsubFailed = eventBus.subscribe(EVENTS.JOB_FAILED, (data) => {
      if (data.jobId === jobId) setStatus('failed')
    })
    
    return () => {
      unsubStarted()
      unsubCompleted()
      unsubFailed()
    }
  }, [jobId])
  
  return { status }
}

// Uso:
const { status } = useJobEvents(123)
`

/**
 * Cuándo implementar EXPLICIT OBSERVER:
 * ✅ CUANDO: Tengas eventos en tiempo real (WebSocket, etc.)
 * ✅ CUANDO: Múltiples componentes reaccionen a mismo evento
 * ❌ NO: Redux/React Query ya lo hacen
 * 
 * Esfuerzo: MUY BAJO (2 horas)
 * Beneficio: MEDIO (código más explícito)
 */

// ═══════════════════════════════════════════════════════════════════════════
// RESUMEN: PATRONES IMPLEMENTABLES
// ═══════════════════════════════════════════════════════════════════════════

export const implementationRoadmap = {
  PHASE_1_DECORATOR: {
    priority: 'ALTO',
    effort: '4 horas',
    benefit: 'ALTO',
    recommendation: 'Implementar PRIMERO',
    items: [
      'withCaching - para queries frecuentes',
      'withLogging - para operaciones críticas',
      'withRateLimit - para APIs',
    ],
  },

  PHASE_2_FACADE: {
    priority: 'MEDIO',
    effort: '4 horas',
    benefit: 'ALTO',
    recommendation: 'Implementar SEGUNDO',
    items: [
      'userManagementFacade',
      'jobManagementFacade',
      'reportingFacade',
    ],
  },

  PHASE_3_FACTORY: {
    priority: 'MEDIO',
    effort: '2 horas',
    benefit: 'MEDIO',
    recommendation: 'Implementar TERCERO (si agregamos exporters)',
    items: [
      'exporterFactory para nuevos formatos',
      'serviceFactory para microservicios',
    ],
  },

  PHASE_4_ADAPTER: {
    priority: 'BAJA',
    effort: '8 horas',
    benefit: 'ALTO',
    recommendation: 'Implementar cuando integres APIs externas',
    items: [
      'storageAdapter para diferentes backends',
      'authAdapter para diferentes proveedores',
      'paymentAdapter para diferentes procesadores',
    ],
  },

  PHASE_5_OBSERVER: {
    priority: 'BAJA',
    effort: '2 horas',
    benefit: 'MEDIO',
    recommendation: 'Implementar si hay muchos eventos en tiempo real',
    items: [
      'eventBus explícito',
      'EVENTS enums',
      'Event hooks',
    ],
  },
}

export default {
  implementationRoadmap,
  facadePatternExample,
  decoratorPatternExample,
  adapterPatternExample,
  explicitObserverExample,
  exporterFactoryExample,
}
