import { configureStore } from '@reduxjs/toolkit'
import loadingReducer, {
  incrementContext,
  decrementContext,
  selectIsLoading,
  selectAnyLoading,
} from '../loadingSlice'

function buildStore(loadingState) {
  const cfg = { reducer: { loading: loadingReducer } }
  if (loadingState) cfg.preloadedState = { loading: loadingState }
  return configureStore(cfg)
}

// ── incrementContext ──────────────────────────────────────────────────────────

describe('loadingSlice — incrementContext', () => {
  it('initializes context counter to 1 on first increment', () => {
    const store = buildStore()
    store.dispatch(incrementContext('logs'))
    expect(store.getState().loading.contexts.logs).toBe(1)
  })

  it('increments existing counter', () => {
    const store = buildStore({ contexts: { logs: 1 } })
    store.dispatch(incrementContext('logs'))
    expect(store.getState().loading.contexts.logs).toBe(2)
  })

  it('tracks multiple contexts independently', () => {
    const store = buildStore()
    store.dispatch(incrementContext('logs'))
    store.dispatch(incrementContext('access'))
    expect(store.getState().loading.contexts.logs).toBe(1)
    expect(store.getState().loading.contexts.access).toBe(1)
  })
})

// ── decrementContext ──────────────────────────────────────────────────────────

describe('loadingSlice — decrementContext', () => {
  it('removes context key when counter reaches 0', () => {
    const store = buildStore({ contexts: { logs: 1 } })
    store.dispatch(decrementContext('logs'))
    expect(store.getState().loading.contexts.logs).toBeUndefined()
  })

  it('decrements counter without removing key when above 1', () => {
    const store = buildStore({ contexts: { logs: 3 } })
    store.dispatch(decrementContext('logs'))
    expect(store.getState().loading.contexts.logs).toBe(2)
  })

  it('does not error when decrementing unknown context', () => {
    const store = buildStore()
    expect(() => store.dispatch(decrementContext('unknown'))).not.toThrow()
    expect(store.getState().loading.contexts.unknown).toBeUndefined()
  })
})

// ── selectIsLoading ───────────────────────────────────────────────────────────

describe('selectIsLoading', () => {
  it('returns false when context has no counter', () => {
    const store = buildStore()
    expect(selectIsLoading('logs')(store.getState())).toBe(false)
  })

  it('returns true when context counter is > 0', () => {
    const store = buildStore({ contexts: { logs: 1 } })
    expect(selectIsLoading('logs')(store.getState())).toBe(true)
  })

  it('returns false after counter is cleared', () => {
    const store = buildStore({ contexts: { logs: 1 } })
    store.dispatch(decrementContext('logs'))
    expect(selectIsLoading('logs')(store.getState())).toBe(false)
  })
})

// ── selectAnyLoading ──────────────────────────────────────────────────────────

describe('selectAnyLoading', () => {
  it('returns false with empty contexts', () => {
    const store = buildStore()
    expect(selectAnyLoading(store.getState())).toBe(false)
  })

  it('returns true when at least one context is loading', () => {
    const store = buildStore({ contexts: { logs: 2 } })
    expect(selectAnyLoading(store.getState())).toBe(true)
  })

  it('returns false when all counters are cleared', () => {
    const store = buildStore({ contexts: { logs: 1 } })
    store.dispatch(decrementContext('logs'))
    expect(selectAnyLoading(store.getState())).toBe(false)
  })
})
