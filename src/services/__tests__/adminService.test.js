import adminService from '../adminGateway'

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue([]),
    post: jest.fn().mockResolvedValue({ id: 99 }),
    patch: jest.fn().mockResolvedValue({ id: 99 }),
  },
}))

const api = require('../apiClient').default

describe('adminService.getFunctions', () => {
  it('calls GET /api/access/functions/', async () => {
    await adminService.getFunctions()
    expect(api.get).toHaveBeenCalledWith('/api/access/functions/')
  })
})

describe('adminService.createFunction', () => {
  it('calls POST /api/access/functions/', async () => {
    const data = { name: 'sistema.access.user.read', description: 'Ver usuarios' }
    await adminService.createFunction(data)
    expect(api.post).toHaveBeenCalledWith('/api/access/functions/', data)
  })
})

describe('adminService.updateFunction', () => {
  it('calls PATCH /api/access/functions/{id}/', async () => {
    await adminService.updateFunction(5, { description: 'Updated' })
    expect(api.patch).toHaveBeenCalledWith('/api/access/functions/5/', { description: 'Updated' })
  })
})

describe('adminService.deactivateFunction', () => {
  it('calls PATCH /api/access/functions/{id}/ with active:false', async () => {
    await adminService.deactivateFunction(5)
    expect(api.patch).toHaveBeenCalledWith('/api/access/functions/5/', { active: false })
  })
})

describe('adminService.getAGRCatalog', () => {
  it('calls GET /api/access/access-groups/', async () => {
    await adminService.getAGRCatalog()
    expect(api.get).toHaveBeenCalledWith('/api/access/access-groups/')
  })
})

describe('adminService.createAGR', () => {
  it('calls POST /api/access/access-groups/', async () => {
    const data = { name: 'Grupo Ops', description: 'Operaciones' }
    await adminService.createAGR(data)
    expect(api.post).toHaveBeenCalledWith('/api/access/access-groups/', data)
  })
})

describe('adminService.getSeparationRules', () => {
  it('calls GET /api/access/separation-rules/', async () => {
    await adminService.getSeparationRules()
    expect(api.get).toHaveBeenCalledWith('/api/access/separation-rules/')
  })
})
