/**
 * T3.2 — access.slice sincronizado con accessGateway v2.
 *
 * ELIMINAR: validateGroupAssignment → accessGateway.validateGroupAssignment eliminado
 * AÑADIR: fetchEffectivePermissions, verifyPermission, previewExceptionalPermission,
 *         assignGrouper, fetchMyModules, fetchGroupers, fetchSeparationRuleDetail
 */
jest.mock('../../src/services/accessGateway', () => ({
  __esModule: true,
  default: {
    getAllFunctions:               jest.fn().mockResolvedValue([]),
    getUserPermissions:           jest.fn().mockResolvedValue({}),
    getEffectivePermissions:      jest.fn().mockResolvedValue({}),
    verifyPermission:             jest.fn().mockResolvedValue({}),
    assignFunctions:              jest.fn().mockResolvedValue({}),
    revokeFunctions:              jest.fn().mockResolvedValue({}),
    assignAccessGroup:            jest.fn().mockResolvedValue({}),
    revokeAccessGroup:            jest.fn().mockResolvedValue({}),
    assignGrouper:                jest.fn().mockResolvedValue({}),
    getFunctionGroups:            jest.fn().mockResolvedValue([]),
    getGroupers:                  jest.fn().mockResolvedValue([]),
    getGroupFunctions:            jest.fn().mockResolvedValue({}),
    createGroup:                  jest.fn().mockResolvedValue({ id: 1 }),
    updateGroup:                  jest.fn().mockResolvedValue({}),
    retireGroup:                  jest.fn().mockResolvedValue({}),
    assignFunctionsToGroup:       jest.fn().mockResolvedValue({}),
    getSeparationRules:           jest.fn().mockResolvedValue([]),
    getSeparationRuleDetail:      jest.fn().mockResolvedValue({}),
    createSeparationRule:         jest.fn().mockResolvedValue({ id: 1 }),
    updateSeparationRule:         jest.fn().mockResolvedValue({}),
    deleteSeparationRule:         jest.fn().mockResolvedValue({}),
    validateSeparationRules:      jest.fn().mockResolvedValue({ conflicts: [] }),
    getAccessAudit:               jest.fn().mockResolvedValue([]),
    grantExceptionalPermission:   jest.fn().mockResolvedValue({}),
    getExceptionalPermissions:    jest.fn().mockResolvedValue([]),
    previewExceptionalPermission: jest.fn().mockResolvedValue({}),
    revokeExceptionalPermission:  jest.fn().mockResolvedValue({}),
    getMyModules:                 jest.fn().mockResolvedValue([]),
  },
}))

const gw = require('../../src/services/accessGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const accessModule = require('../../src/redux/slices/access')
const reducer = accessModule.default

function makeStore() {
  return configureStore({ reducer: { access: reducer }, middleware: (g) => g({ serializableCheck: false }) })
}

describe('access.slice — sincronización T3.2', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('validateGroupAssignment no existe — método eliminado en T1.5', () => {
    expect(accessModule.validateGroupAssignment).toBeUndefined()
  })
  test('fetchEffectivePermissions(5) → accessService.getEffectivePermissions(5)', async () => {
    await store.dispatch(accessModule.fetchEffectivePermissions(5))
    expect(gw.getEffectivePermissions).toHaveBeenCalledWith(5)
  })
  test('verifyPermission({userId,code}) → accessService.verifyPermission', async () => {
    await store.dispatch(accessModule.verifyPermission({ userId: 5, code: 'ACC-001' }))
    expect(gw.verifyPermission).toHaveBeenCalledWith(5, 'ACC-001')
  })
  test('previewExceptionalPermission({userId,params}) → accessService.previewExceptionalPermission', async () => {
    await store.dispatch(accessModule.previewExceptionalPermission({ userId: 5, params: {} }))
    expect(gw.previewExceptionalPermission).toHaveBeenCalledWith(5, {})
  })
  test('assignGrouperToUser({userId,agrId}) → accessService.assignGrouper', async () => {
    await store.dispatch(accessModule.assignGrouperToUser({ userId: 5, agrId: 3 }))
    expect(gw.assignGrouper).toHaveBeenCalledWith(5, 3)
  })
  test('fetchMyModules() → accessService.getMyModules()', async () => {
    await store.dispatch(accessModule.fetchMyModules())
    expect(gw.getMyModules).toHaveBeenCalled()
  })
  test('fetchGroupers() → accessService.getGroupers()', async () => {
    await store.dispatch(accessModule.fetchGroupers())
    expect(gw.getGroupers).toHaveBeenCalled()
  })
  test('fetchSeparationRuleDetail(3) → accessService.getSeparationRuleDetail(3)', async () => {
    await store.dispatch(accessModule.fetchSeparationRuleDetail(3))
    expect(gw.getSeparationRuleDetail).toHaveBeenCalledWith(3)
  })
  test('initialState incluye effectivePermissions, myModules, groupers, separationRuleDetail', () => {
    const s = store.getState().access
    expect(Array.isArray(s.effectivePermissions)).toBe(true)
    expect(Array.isArray(s.myModules)).toBe(true)
    expect(Array.isArray(s.groupers)).toBe(true)
    expect(s.separationRuleDetail).toBe(null)
  })
})
