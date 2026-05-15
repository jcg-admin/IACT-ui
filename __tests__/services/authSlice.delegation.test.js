/**
 * T1.3 — auth.js slice: delega TODAS las llamadas a authGateway.
 * Ningún thunk llama apiService directamente.
 */

jest.mock('../../src/services/authGateway', () => ({
  __esModule: true,
  default: {
    login:             jest.fn().mockResolvedValue({ user_id: 1, username: 'u' }),
    logout:            jest.fn().mockResolvedValue({}),
    getCurrentUser:    jest.fn().mockResolvedValue({ user_id: 1, username: 'u' }),
    resetPassword:     jest.fn().mockResolvedValue({ message: 'ok' }),
    changePassword:    jest.fn().mockResolvedValue({}),
    getActiveSessions: jest.fn().mockResolvedValue([]),
    revokeSession:     jest.fn().mockResolvedValue({}),
    getSessions:       jest.fn().mockResolvedValue([]),
  },
}))

// Si algún thunk llama apiService directamente, la prueba fallará con este error.
jest.mock('../../src/services/apiClient', () => ({
  __esModule: true,
  default: {
    get:    jest.fn().mockRejectedValue(new Error('[T1.3 VIOLATION] auth.slice no debe llamar apiService directamente')),
    post:   jest.fn().mockRejectedValue(new Error('[T1.3 VIOLATION] auth.slice no debe llamar apiService directamente')),
    delete: jest.fn().mockResolvedValue({}),
  },
}))

const authGateway = require('../../src/services/authGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const {
  default: authReducer,
  loginUser, logoutUser, getCurrentUser,
  recoverPassword, changePassword, fetchActiveSessions, revokeSession,
} = require('../../src/redux/slices/auth')

describe('auth.slice — delega todo a authGateway (T1.3)', () => {
  let store
  beforeEach(() => {
    jest.clearAllMocks()
    store = configureStore({
      reducer: { auth: authReducer },
      middleware: (g) => g({ serializableCheck: false }),
    })
  })

  test('loginUser → authGateway.login(username, password)', async () => {
    await store.dispatch(loginUser({ username: 'nestor', password: 'Secure1!' }))
    expect(authGateway.login).toHaveBeenCalledWith('nestor', 'Secure1!')
  })

  test('logoutUser → authGateway.logout()', async () => {
    await store.dispatch(logoutUser())
    expect(authGateway.logout).toHaveBeenCalled()
  })

  test('getCurrentUser → authGateway.getCurrentUser()', async () => {
    await store.dispatch(getCurrentUser())
    expect(authGateway.getCurrentUser).toHaveBeenCalled()
  })

  test('recoverPassword → authGateway.resetPassword(username)', async () => {
    await store.dispatch(recoverPassword('nestor@iact.mx'))
    expect(authGateway.resetPassword).toHaveBeenCalledWith('nestor@iact.mx')
  })

  test('changePassword → authGateway.changePassword(current, new)', async () => {
    await store.dispatch(changePassword({ currentPassword: 'old', newPassword: 'new' }))
    expect(authGateway.changePassword).toHaveBeenCalledWith('old', 'new')
  })

  test('fetchActiveSessions → authGateway.getActiveSessions()', async () => {
    await store.dispatch(fetchActiveSessions())
    expect(authGateway.getActiveSessions).toHaveBeenCalled()
  })

  test('revokeSession → authGateway.revokeSession(id)', async () => {
    await store.dispatch(revokeSession('session-xyz'))
    expect(authGateway.revokeSession).toHaveBeenCalledWith('session-xyz')
  })
})
