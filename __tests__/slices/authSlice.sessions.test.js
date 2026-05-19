jest.mock('../../src/services/authGateway', () => ({
  __esModule: true,
  default: {
    login:             jest.fn().mockResolvedValue({ user_id: 1 }),
    logout:            jest.fn().mockResolvedValue({}),
    getCurrentUser:    jest.fn().mockResolvedValue({}),
    resetPassword:     jest.fn().mockResolvedValue({}),
    changePassword:    jest.fn().mockResolvedValue({}),
    getActiveSessions: jest.fn().mockResolvedValue([]),
    getOwnSessions:    jest.fn().mockResolvedValue([]),
    closeSession:      jest.fn().mockResolvedValue({}),
    closeAllSessions:  jest.fn().mockResolvedValue({}),
    getMyMenu:         jest.fn().mockResolvedValue([]),
    revokeSession:     jest.fn().mockResolvedValue({}),
  },
}))

const gw = require('../../src/services/authGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const authModule = require('../../src/redux/slices/auth')

function makeStore() {
  return configureStore({
    reducer: { auth: authModule.default },
    middleware: (g) => g({ serializableCheck: false }),
  })
}

describe('auth.slice — thunks de sesiones y menú (T3.5)', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchOwnSessions → authGateway.getOwnSessions()', async () => {
    await store.dispatch(authModule.fetchOwnSessions())
    expect(gw.getOwnSessions).toHaveBeenCalled()
  })
  test('closeSessionAction("abc") → authGateway.closeSession("abc")', async () => {
    await store.dispatch(authModule.closeSessionAction('abc'))
    expect(gw.closeSession).toHaveBeenCalledWith('abc')
  })
  test('closeAllSessionsAction() → authGateway.closeAllSessions()', async () => {
    await store.dispatch(authModule.closeAllSessionsAction())
    expect(gw.closeAllSessions).toHaveBeenCalled()
  })
  test('fetchMyMenu() → authGateway.getMyMenu()', async () => {
    await store.dispatch(authModule.fetchMyMenu())
    expect(gw.getMyMenu).toHaveBeenCalled()
  })
  test('initialState incluye ownSessions:[], myMenu:[]', () => {
    const s = store.getState().auth
    expect(Array.isArray(s.ownSessions)).toBe(true)
    expect(Array.isArray(s.myMenu)).toBe(true)
  })
})
