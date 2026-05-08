import { configureStore } from '@reduxjs/toolkit'
import errorReducer, {
  setGlobalError,
  clearGlobalError,
  setContextError,
  clearContextError,
  clearAllErrors,
  handleAPIError,
  setErrorHandling,
  clearErrorHistory,
  selectGlobalError,
  selectContextError,
  selectErrorHistory,
  selectIsErrorHandling,
  selectHasErrors,
  selectGlobalErrorIsRetryable,
  selectRetryAfter,
  selectIsPersistentError,
} from '../error'

function buildStore(preloaded) {
  return configureStore({
    reducer: { error: errorReducer },
    ...(preloaded ? { preloadedState: { error: preloaded } } : {}),
  })
}

// ── Initial state ─────────────────────────────────────────────────────────────

describe('errorSlice — initial state', () => {
  it('has null global error', () => {
    const store = buildStore()
    expect(selectGlobalError(store.getState())).toBeNull()
  })

  it('has empty byContext', () => {
    const store = buildStore()
    expect(selectHasErrors(store.getState())).toBe(false)
  })

  it('has empty history', () => {
    const store = buildStore()
    expect(selectErrorHistory(store.getState())).toHaveLength(0)
  })

  it('isHandling starts false', () => {
    const store = buildStore()
    expect(selectIsErrorHandling(store.getState())).toBe(false)
  })
})

// ── setGlobalError / clearGlobalError ─────────────────────────────────────────

describe('setGlobalError', () => {
  it('sets global error and appends to history', () => {
    const store = buildStore()
    store.dispatch(setGlobalError({ code: 'NOT_FOUND', message: 'Not found', statusCode: 404 }))
    const err = selectGlobalError(store.getState())
    expect(err.code).toBe('NOT_FOUND')
    expect(err.statusCode).toBe(404)
    expect(selectErrorHistory(store.getState())).toHaveLength(1)
  })
})

describe('clearGlobalError', () => {
  it('sets global to null', () => {
    const store = buildStore({ global: { code: 'X', message: 'x', statusCode: 500 }, byContext: {}, requestErrors: [], isHandling: false })
    store.dispatch(clearGlobalError())
    expect(selectGlobalError(store.getState())).toBeNull()
  })
})

// ── setContextError / clearContextError ───────────────────────────────────────

describe('setContextError', () => {
  it('stores error under the given context key', () => {
    const store = buildStore()
    store.dispatch(setContextError({ context: 'logs', error: { code: 'TIMEOUT', message: 'timeout' } }))
    const err = selectContextError('logs')(store.getState())
    expect(err.code).toBe('TIMEOUT')
  })

  it('does not affect global error', () => {
    const store = buildStore()
    store.dispatch(setContextError({ context: 'dashboard', error: { code: 'ERR', message: 'x' } }))
    expect(selectGlobalError(store.getState())).toBeNull()
  })
})

describe('clearContextError', () => {
  it('removes the error for the given context', () => {
    const store = buildStore({ global: null, byContext: { logs: { code: 'X' } }, requestErrors: [], isHandling: false })
    store.dispatch(clearContextError('logs'))
    expect(selectContextError('logs')(store.getState())).toBeUndefined()
  })
})

// ── clearAllErrors ────────────────────────────────────────────────────────────

describe('clearAllErrors', () => {
  it('clears both global and byContext', () => {
    const store = buildStore({
      global: { code: 'A', message: 'a', statusCode: 500 },
      byContext: { logs: { code: 'B' } },
      requestErrors: [],
      isHandling: false,
    })
    store.dispatch(clearAllErrors())
    expect(selectGlobalError(store.getState())).toBeNull()
    expect(selectHasErrors(store.getState())).toBe(false)
  })
})

// ── handleAPIError ────────────────────────────────────────────────────────────

describe('handleAPIError', () => {
  it('sets global from a plain error object', () => {
    const store = buildStore()
    store.dispatch(handleAPIError({ code: 'INTERNAL_SERVER_ERROR', message: 'Server error', statusCode: 500 }))
    const err = selectGlobalError(store.getState())
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL_SERVER_ERROR')
  })

  it('stores retryAfter in global when present', () => {
    const store = buildStore()
    store.dispatch(handleAPIError({ code: 'RATE_LIMIT', message: 'Too many', statusCode: 429, retryAfter: 30 }))
    const err = selectGlobalError(store.getState())
    expect(err.retryAfter).toBe(30)
  })

  it('retryAfter defaults to null when absent', () => {
    const store = buildStore()
    store.dispatch(handleAPIError({ code: 'NOT_FOUND', message: 'nf', statusCode: 404 }))
    expect(selectGlobalError(store.getState()).retryAfter).toBeNull()
  })

  it('does NOT set global for UNAUTHORIZED errors', () => {
    const store = buildStore()
    store.dispatch(handleAPIError({ code: 'UNAUTHORIZED', message: 'Unauthorized', statusCode: 401 }))
    expect(selectGlobalError(store.getState())).toBeNull()
  })
})

// ── history cap ───────────────────────────────────────────────────────────────

describe('error history — max 10 entries', () => {
  it('caps at 10 and keeps most recent first', () => {
    const store = buildStore()
    for (let i = 0; i < 12; i++) {
      store.dispatch(setGlobalError({ code: `ERR_${i}`, message: `msg ${i}`, statusCode: 500 }))
    }
    const history = selectErrorHistory(store.getState())
    expect(history).toHaveLength(10)
    expect(history[0].code).toBe('ERR_11')
  })
})

// ── setErrorHandling ──────────────────────────────────────────────────────────

describe('setErrorHandling', () => {
  it('sets isHandling flag', () => {
    const store = buildStore()
    store.dispatch(setErrorHandling(true))
    expect(selectIsErrorHandling(store.getState())).toBe(true)
    store.dispatch(setErrorHandling(false))
    expect(selectIsErrorHandling(store.getState())).toBe(false)
  })
})

// ── clearErrorHistory ─────────────────────────────────────────────────────────

describe('clearErrorHistory', () => {
  it('empties the requestErrors array', () => {
    const store = buildStore({ global: null, byContext: {}, requestErrors: [{ code: 'X' }], isHandling: false })
    store.dispatch(clearErrorHistory())
    expect(selectErrorHistory(store.getState())).toHaveLength(0)
  })
})

// ── derived selectors ─────────────────────────────────────────────────────────

describe('selectGlobalErrorIsRetryable', () => {
  it('returns true when retryAfter is a number', () => {
    const store = buildStore({ global: { retryAfter: 60 }, byContext: {}, requestErrors: [], isHandling: false })
    expect(selectGlobalErrorIsRetryable(store.getState())).toBe(true)
  })

  it('returns false when retryAfter is null', () => {
    const store = buildStore({ global: { retryAfter: null }, byContext: {}, requestErrors: [], isHandling: false })
    expect(selectGlobalErrorIsRetryable(store.getState())).toBe(false)
  })

  it('returns false when no global error', () => {
    const store = buildStore()
    expect(selectGlobalErrorIsRetryable(store.getState())).toBe(false)
  })
})

describe('selectRetryAfter', () => {
  it('returns retryAfter value', () => {
    const store = buildStore({ global: { retryAfter: 45 }, byContext: {}, requestErrors: [], isHandling: false })
    expect(selectRetryAfter(store.getState())).toBe(45)
  })

  it('returns null when no global error', () => {
    const store = buildStore()
    expect(selectRetryAfter(store.getState())).toBeNull()
  })
})

describe('selectIsPersistentError', () => {
  it('returns true for 502', () => {
    const store = buildStore({ global: { statusCode: 502 }, byContext: {}, requestErrors: [], isHandling: false })
    expect(selectIsPersistentError(store.getState())).toBe(true)
  })

  it('returns true for 503', () => {
    const store = buildStore({ global: { statusCode: 503 }, byContext: {}, requestErrors: [], isHandling: false })
    expect(selectIsPersistentError(store.getState())).toBe(true)
  })

  it('returns false for 500', () => {
    const store = buildStore({ global: { statusCode: 500 }, byContext: {}, requestErrors: [], isHandling: false })
    expect(selectIsPersistentError(store.getState())).toBe(false)
  })

  it('returns false when no global error', () => {
    const store = buildStore()
    expect(selectIsPersistentError(store.getState())).toBe(false)
  })
})
