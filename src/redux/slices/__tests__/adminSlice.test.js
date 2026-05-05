import { configureStore } from '@reduxjs/toolkit'
import adminReducer, {
  fetchFunctions,
  fetchAGRCatalog,
  selectFunctions,
  selectAGRs,
  selectAdminLoading,
} from '../adminSlice'

jest.mock('../../../services/adminService', () => ({
  __esModule: true,
  default: {
    getFunctions: jest.fn(),
    getAGRCatalog: jest.fn(),
  },
}))

const adminService = require('../../../services/adminService').default

function buildStore() {
  return configureStore({ reducer: { admin: adminReducer } })
}

describe('adminSlice — fetchFunctions', () => {
  it('sets functions on fulfilled', async () => {
    const fns = [{ id: 1, name: 'sistema.access.user.read' }]
    adminService.getFunctions.mockResolvedValueOnce(fns)
    const store = buildStore()
    await store.dispatch(fetchFunctions())
    expect(selectFunctions(store.getState())).toEqual(fns)
  })

  it('sets loading true while pending', () => {
    adminService.getFunctions.mockReturnValueOnce(new Promise(() => {}))
    const store = buildStore()
    store.dispatch(fetchFunctions())
    expect(selectAdminLoading(store.getState())).toBe(true)
  })
})

describe('adminSlice — fetchAGRCatalog', () => {
  it('sets AGRs on fulfilled', async () => {
    const agrs = [{ id: 1, name: 'Grupo Ops' }]
    adminService.getAGRCatalog.mockResolvedValueOnce(agrs)
    const store = buildStore()
    await store.dispatch(fetchAGRCatalog())
    expect(selectAGRs(store.getState())).toEqual(agrs)
  })
})
