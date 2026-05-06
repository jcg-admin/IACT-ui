import { configureStore } from '@reduxjs/toolkit'
import adminReducer, {
  fetchFunctions,
  fetchAGRCatalog,
  deactivateAGR,
  selectFunctions,
  selectAGRs,
  selectAdminLoading,
} from '../adminSlice'

jest.mock('../../../services/adminService', () => ({
  __esModule: true,
  default: {
    getFunctions: jest.fn(),
    getAGRCatalog: jest.fn(),
    deactivateAGR: jest.fn(),
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

describe('adminSlice — deactivateAGR (G-F1)', () => {
  const adminService = require('../../../services/adminService').default

  beforeEach(() => {
    if (adminService.deactivateAGR) adminService.deactivateAGR.mockClear()
  })

  it('is exported as a named thunk', () => {
    expect(typeof deactivateAGR).toBe('function')
  })

  it('sets agr.active = false on fulfilled', async () => {
    const initial = [
      { id: 1, codename: 'basic_operator_group', name: 'Operador Básico', active: true },
      { id: 2, codename: 'report_viewer_group',  name: 'Analista',         active: true },
    ]
    adminService.getAGRCatalog.mockResolvedValueOnce({ results: initial })
    adminService.deactivateAGR.mockResolvedValueOnce({ ...initial[0], active: false })

    const store = buildStore()
    await store.dispatch(fetchAGRCatalog())
    await store.dispatch(deactivateAGR(1))

    const agrs = selectAGRs(store.getState())
    expect(agrs.find((a) => a.id === 1).active).toBe(false)
    expect(agrs.find((a) => a.id === 2).active).toBe(true)
  })

  it('calls adminService.deactivateAGR with the correct id', async () => {
    adminService.deactivateAGR.mockResolvedValueOnce({ id: 5, active: false })
    const store = buildStore()
    await store.dispatch(deactivateAGR(5))
    expect(adminService.deactivateAGR).toHaveBeenCalledWith(5)
  })
})
