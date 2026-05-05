/**
 * Decorators Tests
 * 
 * Tests para withCaching, withLogging, withValidation
 * Total: 15+ tests
 */

import {
  withCaching,
  withCachingAdvanced,
  CACHE_TTL,
  withLogging,
  withLoggingLevels,
  LOG_LEVELS,
  withValidation,
  withValidationMultiple,
  ValidationError,
  CommonValidators,
} from '../index'

// ═══════════════════════════════════════════════════════════════════════════
// withCaching Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('withCaching Decorator', () => {
  let callCount = 0

  beforeEach(() => {
    callCount = 0
  })

  // Test 1: Caching funciona correctamente
  it('should cache function results and reduce calls', async () => {
    const fn = jest.fn(async (id) => {
      callCount++
      return { id, data: 'test' }
    })

    const cached = withCaching(fn, CACHE_TTL.SHORT)

    const result1 = await cached(1)
    const result2 = await cached(1)

    expect(result1).toEqual(result2)
    expect(fn).toHaveBeenCalledTimes(1) // Solo una llamada
  })

  // Test 2: Diferentes argumentos no comparten caché
  it('should not share cache between different arguments', async () => {
    const fn = jest.fn(async (id) => ({ id, data: 'test' }))
    const cached = withCaching(fn, CACHE_TTL.MEDIUM)

    await cached(1)
    await cached(2)
    await cached(1)

    expect(fn).toHaveBeenCalledTimes(2) // 1 para id=1, 1 para id=2
  })

  // Test 3: TTL expira correctamente
  it('should expire cache after TTL', async () => {
    const fn = jest.fn(async (id) => ({ id, timestamp: Date.now() }))
    const shortTTL = 100 // 100ms
    const cached = withCaching(fn, shortTTL)

    const result1 = await cached(1)
    await new Promise((resolve) => setTimeout(resolve, 150))
    const result2 = await cached(1)

    expect(fn).toHaveBeenCalledTimes(2) // Cache expiró
    expect(result1.timestamp).not.toEqual(result2.timestamp)
  })

  // Test 4: Custom key function
  it('should use custom key function', async () => {
    const fn = jest.fn(async (id) => ({ id }))
    const keyFn = (id) => `user:${id}`
    const cached = withCaching(fn, CACHE_TTL.MEDIUM, keyFn)

    await cached(1)
    await cached(1)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  // Test 5: Errors no se cachean
  it('should not cache errors', async () => {
    const fn = jest.fn(async (id) => {
      if (id === 1) {
        throw new Error('Invalid ID')
      }
      return { id }
    })

    const cached = withCaching(fn, CACHE_TTL.MEDIUM)

    await expect(cached(1)).rejects.toThrow('Invalid ID')
    await expect(cached(1)).rejects.toThrow('Invalid ID')

    expect(fn).toHaveBeenCalledTimes(2) // Ambas llamadas se ejecutan
  })

  // Test 6: Advanced version con invalidation
  it('should invalidate cache manually', async () => {
    const fn = jest.fn(async (id) => ({ id }))
    const cached = withCachingAdvanced(fn, CACHE_TTL.LONG)

    await cached(1)
    await cached(1)
    expect(fn).toHaveBeenCalledTimes(1)

    cached.invalidateCache()

    await cached(1)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  // Test 7: Cache size tracking
  it('should track cache size', async () => {
    const fn = jest.fn(async (id) => ({ id }))
    const cached = withCachingAdvanced(fn, CACHE_TTL.LONG)

    await cached(1)
    await cached(2)
    await cached(3)

    expect(cached.getCacheSize()).toBe(3)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// withLogging Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('withLogging Decorator', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    console.log.mockRestore()
    console.error.mockRestore()
  })

  // Test 8: Logging básico
  it('should log function calls', async () => {
    const fn = jest.fn(async () => 'result')
    const logged = withLogging(fn, 'testFunction')

    await logged()

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[LOG]'))
  })

  // Test 9: Logging con argumentos
  it('should log arguments', async () => {
    const fn = jest.fn(async (a, b) => a + b)
    const logged = withLogging(fn, 'add', { logArgs: true })

    await logged(1, 2)

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('called with'),
      expect.any(Array)
    )
  })

  // Test 10: Loggear errores
  it('should log errors', async () => {
    const fn = jest.fn(async () => {
      throw new Error('Test error')
    })
    const logged = withLogging(fn, 'failingFunction')

    await expect(logged()).rejects.toThrow()

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.any(Object)
    )
  })

  // Test 11: Ocultar campos sensibles
  it('should hide sensitive fields in logging', async () => {
    const fn = jest.fn(async (data) => data)
    const logged = withLogging(fn, 'sensitiveFunction')

    await logged({ username: 'john', password: 'secret123', email: 'john@example.com' })

    const callArgs = console.log.mock.calls.find((call) =>
      call[0]?.includes('called with')
    )
    const loggedData = callArgs?.[1]?.[0]

    expect(loggedData?.password).toBe('***')
  })

  // Test 12: Timing
  it('should measure function execution time', async () => {
    const fn = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return 'result'
    })
    const logged = withLogging(fn, 'slowFunction', { logTime: true })

    await logged()

    // Verificar que se loguea "completed in" sin verificar el tiempo exacto
    const completedLogCall = console.log.mock.calls.find((call) =>
      call[0]?.includes('completed in')
    )
    expect(completedLogCall).toBeDefined()
  })

  // Test 13: Log levels
  it('should respect log levels', async () => {
    const fn = jest.fn(async () => 'result')
    const logged = withLoggingLevels(fn, 'function', LOG_LEVELS.ERROR)

    await logged()

    // Con ERROR level, no debería loguear llamada normal
    const hasLogCall = console.log.mock.calls.some((call) =>
      call[0]?.includes('called')
    )
    expect(hasLogCall).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// withValidation Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('withValidation Decorator', () => {
  // Test 14: Validación básica
  it('should validate arguments and execute function', async () => {
    const fn = jest.fn(async (id) => ({ id }))
    const validator = (id) => {
      return typeof id === 'number' ? { valid: true } : { valid: false, message: 'Invalid ID' }
    }

    const validated = withValidation(fn, validator)

    const result = await validated(1)
    expect(result).toEqual({ id: 1 })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // Test 15: Validación falla
  it('should throw ValidationError on invalid input', async () => {
    const fn = jest.fn(async (id) => ({ id }))
    const validator = (id) => {
      return typeof id === 'number' ? { valid: true } : { valid: false, message: 'Invalid ID' }
    }

    const validated = withValidation(fn, validator)

    await expect(validated('invalid')).rejects.toThrow(ValidationError)
    expect(fn).not.toHaveBeenCalled()
  })

  // Test 16: Múltiples validadores
  it('should support multiple validators', async () => {
    const fn = jest.fn(async (id, name) => ({ id, name }))

    const validators = [
      (id, name) =>
        typeof id === 'number' ? { valid: true } : { valid: false, message: 'Invalid ID' },
      (id, name) =>
        name && name.length > 0
          ? { valid: true }
          : { valid: false, message: 'Invalid name' },
    ]

    const validated = withValidationMultiple(fn, validators)

    const result = await validated(1, 'John')
    expect(result).toEqual({ id: 1, name: 'John' })
  })

  // Test 17: CommonValidators - validateId
  it('should use CommonValidators.validateId', async () => {
    const fn = jest.fn(async (id) => ({ id }))
    const validator = CommonValidators.validateId('User ID')

    const validated = withValidation(fn, validator)

    await expect(validated(null)).rejects.toThrow()
    await expect(validated(1)).resolves.toEqual({ id: 1 })
  })

  // Test 18: CommonValidators - validateEmail
  it('should use CommonValidators.validateEmail', () => {
    const validator = CommonValidators.validateEmail

    expect(validator('valid@example.com').valid).toBe(true)
    expect(validator('invalid.email').valid).toBe(false)
    expect(validator(null).valid).toBe(false)
  })

  // Test 19: CommonValidators - validateArray
  it('should use CommonValidators.validateArray', () => {
    const validator = CommonValidators.validateArray('Items')

    expect(validator([1, 2, 3]).valid).toBe(true)
    expect(validator([]).valid).toBe(false)
    expect(validator(null).valid).toBe(false)
  })

  // Test 20: CommonValidators - validateRange
  it('should use CommonValidators.validateRange', () => {
    const validator = CommonValidators.validateRange(1, 100, 'Score')

    expect(validator(50).valid).toBe(true)
    expect(validator(101).valid).toBe(false)
    expect(validator(0).valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Integration Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Decorators Integration', () => {
  // Test 21: Combinar decorators
  it('should work with combined decorators', async () => {
    const fn = jest.fn(async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return { id, data: 'test' }
    })

    const validator = (id) =>
      typeof id === 'number' ? { valid: true } : { valid: false }
    const validated = withValidation(fn, validator)
    const logged = withLogging(validated, 'getUser')
    const cached = withCaching(logged, CACHE_TTL.SHORT)

    // Primera llamada: validada, loggeada, no cacheada
    const result1 = await cached(1)

    // Segunda llamada: cacheada
    const result2 = await cached(1)

    expect(result1).toEqual(result2)
    expect(fn).toHaveBeenCalledTimes(1) // Solo una ejecución
  })

  // Test 22: Error en validación detiene ejecución
  it('should not execute function if validation fails', async () => {
    const fn = jest.fn(async () => 'result')
    const validator = () => ({ valid: false, message: 'Validation failed' })
    const validated = withValidation(fn, validator)

    await expect(validated()).rejects.toThrow()
    expect(fn).not.toHaveBeenCalled()
  })
})
