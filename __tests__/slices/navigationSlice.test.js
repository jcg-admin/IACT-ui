jest.mock('../../src/services/navigationGateway', () => ({
  __esModule: true,
  default: {
    getNavigationMenu:    jest.fn().mockResolvedValue([{ id: 1, label: 'Dashboard' }]),
    getNavigationModules: jest.fn().mockResolvedValue([{ id: 1, code: 'MOD_RPT' }]),
  },
}))

const gw = require('../../src/services/navigationGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const navModule = require('../../src/redux/slices/navigation')
const reducer = navModule.default

function makeStore() {
  return configureStore({ reducer: { navigation: reducer }, middleware: (g) => g({ serializableCheck: false }) })
}

describe('navigation.slice (T3.6)', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchNavigationMenu → navigationService.getNavigationMenu()', async () => {
    await store.dispatch(navModule.fetchNavigationMenu())
    expect(gw.getNavigationMenu).toHaveBeenCalled()
  })
  test('fetchNavigationModules → navigationService.getNavigationModules()', async () => {
    await store.dispatch(navModule.fetchNavigationModules())
    expect(gw.getNavigationModules).toHaveBeenCalled()
  })
  test('initialState tiene menu:[], modules:[]', () => {
    const s = store.getState().navigation
    expect(s.menu).toEqual([])
    expect(s.modules).toEqual([])
  })
})
