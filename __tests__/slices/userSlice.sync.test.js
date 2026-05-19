jest.mock('../../src/services/userGateway', () => ({
  __esModule: true,
  default: {
    getUsers:         jest.fn().mockResolvedValue([]),
    getUserDetail:    jest.fn().mockResolvedValue({}),
    createUser:       jest.fn().mockResolvedValue({ id: 1 }),
    updateUser:       jest.fn().mockResolvedValue({}),
    patchUser:        jest.fn().mockResolvedValue({}),
    activateUser:     jest.fn().mockResolvedValue({}),
    deactivateUser:   jest.fn().mockResolvedValue({ state: 'ELIMINATED' }),
    deleteUser:       jest.fn().mockResolvedValue({}),
    resetUserPassword:jest.fn().mockResolvedValue({}),
    blockUser:        jest.fn().mockResolvedValue({}),
    unblockUser:      jest.fn().mockResolvedValue({}),
  },
}))

const gw = require('../../src/services/userGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const userModule = require('../../src/redux/slices/user')
const reducer = userModule.default

function makeStore() {
  return configureStore({ reducer: { user: reducer }, middleware: (g) => g({ serializableCheck: false }) })
}

describe('user.slice — sincronización T3.4', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchUserDetail(5) → userService.getUserDetail(5)', async () => {
    await store.dispatch(userModule.fetchUserDetail(5))
    expect(gw.getUserDetail).toHaveBeenCalledWith(5)
  })
  test('createUser(data) → userService.createUser(data) — POST /api/users/create/', async () => {
    await store.dispatch(userModule.createUser({ username: 'ana' }))
    expect(gw.createUser).toHaveBeenCalledWith({ username: 'ana' })
  })
  test('patchUser({id,data}) → userService.patchUser(id, data)', async () => {
    await store.dispatch(userModule.patchUser({ id: 5, data: { email: 'x@y.com' } }))
    expect(gw.patchUser).toHaveBeenCalledWith(5, { email: 'x@y.com' })
  })
  test('activateUser(5) → userService.activateUser(5)', async () => {
    await store.dispatch(userModule.activateUser(5))
    expect(gw.activateUser).toHaveBeenCalledWith(5)
  })
  test('deactivateUser(5) → userService.deactivateUser(5) — POST /deactivate/ (no DELETE)', async () => {
    await store.dispatch(userModule.deactivateUser(5))
    expect(gw.deactivateUser).toHaveBeenCalledWith(5)
  })
  test('deleteUser(5) → userService.deleteUser(5) — DELETE /api/users/5/', async () => {
    await store.dispatch(userModule.deleteUser(5))
    expect(gw.deleteUser).toHaveBeenCalledWith(5)
  })
  test('resetPassword(5) → userService.resetUserPassword(5)', async () => {
    await store.dispatch(userModule.resetPassword(5))
    expect(gw.resetUserPassword).toHaveBeenCalledWith(5)
  })
  test('blockUser(5) → userService.blockUser(5)', async () => {
    await store.dispatch(userModule.blockUser(5))
    expect(gw.blockUser).toHaveBeenCalledWith(5)
  })
  test('unblockUser(5) → userService.unblockUser(5)', async () => {
    await store.dispatch(userModule.unblockUser(5))
    expect(gw.unblockUser).toHaveBeenCalledWith(5)
  })
  test('initialState incluye userDetail:null, actionLoading:false', () => {
    const s = store.getState().user
    expect(s.userDetail).toBe(null)
    expect(s.actionLoading).toBe(false)
  })
})
