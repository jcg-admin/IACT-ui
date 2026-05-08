import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logout, clearError, loginUser, logoutUser } from '../auth'

jest.mock('@api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('../session', () => ({
  clearSession: () => ({ type: 'session/clearSession' }),
}))

const apiService = require('@api/apiClient').default

function buildStore(preloaded) {
  const cfg = { reducer: { auth: authReducer } }
  if (preloaded) cfg.preloadedState = preloaded
  return configureStore(cfg)
}

describe('authSlice — initial state', () => {
  it('starts unauthenticated', () => {
    const store = buildStore()
    const { auth } = store.getState()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.error).toBeNull()
  })
})

describe('authSlice — logout action', () => {
  it('clears user and isAuthenticated', () => {
    const store = buildStore({ auth: { user: { id: 1 }, isAuthenticated: true, isLoading: false, error: null } })
    store.dispatch(logout())
    expect(store.getState().auth.user).toBeNull()
    expect(store.getState().auth.isAuthenticated).toBe(false)
  })
})

describe('authSlice — clearError action', () => {
  it('resets error to null', () => {
    const store = buildStore({ auth: { user: null, isAuthenticated: false, isLoading: false, error: 'bad creds' } })
    store.dispatch(clearError())
    expect(store.getState().auth.error).toBeNull()
  })
})

describe('authSlice — loginUser thunk', () => {
  it('sets isLoading true while pending', () => {
    apiService.post.mockReturnValueOnce(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(loginUser({ username: 'u', password: 'p' }))
    expect(store.getState().auth.isLoading).toBe(true)
  })
})
