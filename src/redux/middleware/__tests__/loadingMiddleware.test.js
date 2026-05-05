import { configureStore } from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit'
import loadingReducer, { selectIsLoading } from '../../slices/loadingSlice'
import { loadingMiddleware } from '../loadingMiddleware'

function buildStore() {
  return configureStore({
    reducer: { loading: loadingReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(loadingMiddleware),
  })
}

// ── Pending / Fulfilled cycle ─────────────────────────────────────────────────

describe('loadingMiddleware — pending/fulfilled', () => {
  it('increments context on pending', async () => {
    const store = buildStore()
    const thunk = createAsyncThunk('logs/fetchLogs', () => Promise.resolve([]))

    const promise = store.dispatch(thunk())
    expect(selectIsLoading('logs')(store.getState())).toBe(true)

    await promise
    expect(selectIsLoading('logs')(store.getState())).toBe(false)
  })

  it('decrements context on fulfilled', async () => {
    const store = buildStore()
    const thunk = createAsyncThunk('logs/fetchLogs2', () => Promise.resolve([]))

    await store.dispatch(thunk())
    expect(selectIsLoading('logs')(store.getState())).toBe(false)
  })
})

// ── Pending / Rejected cycle ──────────────────────────────────────────────────

describe('loadingMiddleware — pending/rejected', () => {
  it('decrements context on rejected', async () => {
    const store = buildStore()
    const thunk = createAsyncThunk('logs/failingThunk', async () => {
      throw new Error('fail')
    })

    await store.dispatch(thunk())
    expect(selectIsLoading('logs')(store.getState())).toBe(false)
  })
})

// ── SILENT_CONTEXTS ───────────────────────────────────────────────────────────

describe('loadingMiddleware — SILENT_CONTEXTS', () => {
  it('does NOT track auth context', async () => {
    const store = buildStore()
    const thunk = createAsyncThunk('auth/login', () => Promise.resolve({}))

    const promise = store.dispatch(thunk())
    expect(selectIsLoading('auth')(store.getState())).toBe(false)

    await promise
    expect(selectIsLoading('auth')(store.getState())).toBe(false)
  })

  it('does NOT track session context', async () => {
    const store = buildStore()
    const thunk = createAsyncThunk('session/refresh', () => Promise.resolve({}))

    const promise = store.dispatch(thunk())
    expect(selectIsLoading('session')(store.getState())).toBe(false)

    await promise
  })
})

// ── Non-async actions ─────────────────────────────────────────────────────────

describe('loadingMiddleware — plain actions', () => {
  it('passes through non-thunk actions without touching loading state', () => {
    const store = buildStore()
    store.dispatch({ type: 'some/plainAction', payload: 42 })
    expect(store.getState().loading.contexts).toEqual({})
  })
})
