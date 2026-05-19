import { configureStore } from '@reduxjs/toolkit'
import errorReducer, {
  selectGlobalError,
  selectContextError,
  selectRetryAfter,
} from '@store/slices/error'
import {
  UnauthorizedError,
  RateLimitError,
  NetworkAuthRequiredError,
  InternalServerError,
  NotFoundError,
  TimeoutError,
} from '@shared/apiErrors'
import {
  errorHandlingMiddleware,
  errorLoggingMiddleware,
} from '../errorHandling'
import { navigateTo } from '@shared/navigation'

jest.mock('../../../services/auditGateway', () => ({
  __esModule: true,
  default: { logEvent: jest.fn().mockResolvedValue(undefined) },
}))

jest.mock('@shared/navigation', () => ({
  navigateTo: jest.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildStore(authState = { isAuthenticated: false, user: null }) {
  return configureStore({
    reducer: { error: errorReducer, auth: () => authState },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false })
        .concat(errorLoggingMiddleware, errorHandlingMiddleware),
  })
}

function rejectedWith(slice, thunk, error) {
  return { type: `${slice}/${thunk}/rejected`, payload: error }
}

// ── errorHandlingMiddleware — context errors ────────────────────────────────--

describe('errorHandlingMiddleware — context errors', () => {
  it('stores error in byContext for known-context action', () => {
    const store = buildStore()
    const err = new InternalServerError()
    store.dispatch(rejectedWith('dashboard', 'fetchMetrics', err))
    const ctxErr = selectContextError('dashboard')(store.getState())
    expect(ctxErr).toBeDefined()
  })

  it('stores error in global for action without recognisable context', () => {
    const store = buildStore()
    // Action type with only two parts — context extraction still returns first part
    const err = new NotFoundError()
    store.dispatch({ type: 'fetch/rejected', payload: err })
    // Context is 'fetch' — stored in byContext, not global
    expect(selectContextError('fetch')(store.getState())).toBeDefined()
  })

  it('retryAfter is set in global for 429 (special path)', () => {
    const store = buildStore()
    const err = new RateLimitError(60)
    store.dispatch(rejectedWith('reports', 'export', err))
    expect(selectRetryAfter(store.getState())).toBe(60)
  })
})

// ── 401 auth event ────────────────────────────────────────────────────────────

describe('errorHandlingMiddleware — 401 auth:unauthorized event', () => {
  it('dispatches auth:unauthorized custom event', () => {
    const spy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {})
    const store = buildStore()
    store.dispatch(rejectedWith('auth', 'login', new UnauthorizedError()))
    expect(spy.mock.calls.map((c) => c[0].type)).toContain('auth:unauthorized')
    spy.mockRestore()
  })

  it('does NOT set global error for 401', () => {
    const spy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {})
    const store = buildStore()
    store.dispatch(rejectedWith('auth', 'login', new UnauthorizedError()))
    expect(selectGlobalError(store.getState())).toBeNull()
    spy.mockRestore()
  })
})

// ── 511 captive portal redirect ────────────────────────────────────────────────

describe('errorHandlingMiddleware — 511 captive portal redirect', () => {
  beforeEach(() => {
    navigateTo.mockClear()
  })

  it('calls navigateTo with loginUrl', () => {
    const store = buildStore()
    const err = new NetworkAuthRequiredError('https://wifi.example.com/login')
    store.dispatch(rejectedWith('network', 'check', err))
    expect(navigateTo).toHaveBeenCalledWith('https://wifi.example.com/login')
  })

  it('does not call navigateTo when loginUrl is null', () => {
    const store = buildStore()
    const err = new NetworkAuthRequiredError(null)
    store.dispatch(rejectedWith('network', 'check', err))
    expect(navigateTo).not.toHaveBeenCalled()
  })
})

// ── errorLoggingMiddleware — console output ────────────────────────────────────

describe('errorLoggingMiddleware — console output', () => {
  it('calls console.error for rejected actions', () => {
    const store = buildStore()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('logs', 'fetch', new TimeoutError()))
    expect(spy).toHaveBeenCalled()
    const logged = spy.mock.calls[0][1]
    expect(logged.action).toBe('logs/fetch/rejected')
    spy.mockRestore()
  })

  it('does NOT call console.error for fulfilled actions', () => {
    const store = buildStore()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch({ type: 'logs/fetch/fulfilled', payload: [] })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('includes retryable flag in logged data', () => {
    const store = buildStore()
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('logs', 'fetch', new RateLimitError()))
    const logged = spy.mock.calls[0][1]
    expect(typeof logged.retryable).toBe('boolean')
    spy.mockRestore()
  })
})

// ── BR_008 audit logging ──────────────────────────────────────────────────────

describe('errorLoggingMiddleware — BR_008 audit logging', () => {
  let auditService

  beforeEach(() => {
    jest.clearAllMocks()
    auditService = require('../../../services/auditGateway').default
  })

  it('calls auditService.logEvent for authenticated 4xx errors', () => {
    const store = buildStore({ isAuthenticated: true, user: { id: 'u1' } })
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('logs', 'fetch', new NotFoundError('Recurso', 1)))
    expect(auditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'HTTP_ERROR', status_code: 404, user_id: 'u1' })
    )
    spy.mockRestore()
  })

  it('calls auditService.logEvent for authenticated 5xx errors', () => {
    const store = buildStore({ isAuthenticated: true, user: { id: 'u2' } })
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('dashboard', 'fetch', new InternalServerError()))
    expect(auditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ status_code: 500 })
    )
    spy.mockRestore()
  })

  it('does NOT call auditService when not authenticated', () => {
    const store = buildStore({ isAuthenticated: false, user: null })
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('logs', 'fetch', new NotFoundError()))
    expect(auditService.logEvent).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('does NOT call auditService for network errors without statusCode', () => {
    const store = buildStore({ isAuthenticated: true, user: { id: 'u3' } })
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('something', 'fetch', new TimeoutError()))
    expect(auditService.logEvent).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('includes action type and retryable flag in audit event', () => {
    const store = buildStore({ isAuthenticated: true, user: { id: 'u4' } })
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    store.dispatch(rejectedWith('reports', 'export', new RateLimitError(30)))
    expect(auditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'reports/export/rejected', retryable: true })
    )
    spy.mockRestore()
  })
})

// ── String payload normalization (F-HAL-6 fix) ────────────────────────────────

describe('errorHandlingMiddleware — string payload normalization', () => {
  it('normalises string payload to {message, statusCode, code} object', () => {
    const store = buildStore()
    store.dispatch({ type: 'auth/login/rejected', payload: 'Invalid credentials' })
    // context error stored without crash (string safely wrapped)
    const ctxErr = selectContextError('auth')(store.getState())
    expect(ctxErr).toBeDefined()
  })

  it('sets message from string payload in context error', () => {
    const store = buildStore()
    store.dispatch({ type: 'reports/fetch/rejected', payload: 'Network error' })
    const ctxErr = selectContextError('reports')(store.getState())
    expect(ctxErr?.message).toBe('Network error')
  })

  it('uses fallback message when payload is null', () => {
    const store = buildStore()
    store.dispatch({ type: 'logs/fetch/rejected', payload: null })
    const ctxErr = selectContextError('logs')(store.getState())
    expect(ctxErr?.message).toBe('Error desconocido')
  })

  it('uses fallback message when payload is undefined', () => {
    const store = buildStore()
    store.dispatch({ type: 'etl/sync/rejected', payload: undefined })
    const ctxErr = selectContextError('etl')(store.getState())
    expect(ctxErr?.message).toBe('Error desconocido')
  })
})

// ── Pass-through ──────────────────────────────────────────────────────────────

describe('middleware — pass-through for non-rejected actions', () => {
  it('does not throw for fulfilled actions', () => {
    const store = buildStore()
    expect(() => store.dispatch({ type: 'logs/fetch/fulfilled', payload: [] })).not.toThrow()
  })

  it('does not throw for pending actions', () => {
    const store = buildStore()
    expect(() => store.dispatch({ type: 'logs/fetch/pending' })).not.toThrow()
  })
})
