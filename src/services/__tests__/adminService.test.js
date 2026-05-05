import adminService from '../adminService'

jest.mock('../apiService', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue([]),
    post: jest.fn().mockResolvedValue({ id: 99 }),
    patch: jest.fn().mockResolvedValue({ id: 99 }),
  },
}))

const api = require('../apiService').default

describe('adminService.getFunctions', () => {
  it('calls GET /api/admin/functions/', async () => {
    await adminService.getFunctions()
    expect(api.get).toHaveBeenCalledWith('/api/admin/functions/')
  })
})

describe('adminService.createFunction', () => {
  it('calls POST /api/admin/functions/', async () => {
    const data = { name: 'sistema.access.user.read', description: 'Ver usuarios' }
    await adminService.createFunction(data)
    expect(api.post).toHaveBeenCalledWith('/api/admin/functions/', data)
  })
})

describe('adminService.updateFunction', () => {
  it('calls PATCH /api/admin/functions/{id}/', async () => {
    await adminService.updateFunction(5, { description: 'Updated' })
    expect(api.patch).toHaveBeenCalledWith('/api/admin/functions/5/', { description: 'Updated' })
  })
})

describe('adminService.deactivateFunction', () => {
  it('calls PATCH /api/admin/functions/{id}/ with active:false', async () => {
    await adminService.deactivateFunction(5)
    expect(api.patch).toHaveBeenCalledWith('/api/admin/functions/5/', { active: false })
  })
})

describe('adminService.getAGRCatalog', () => {
  it('calls GET /api/admin/agr/', async () => {
    await adminService.getAGRCatalog()
    expect(api.get).toHaveBeenCalledWith('/api/admin/agr/')
  })
})

describe('adminService.createAGR', () => {
  it('calls POST /api/admin/agr/', async () => {
    const data = { name: 'Grupo Ops', description: 'Operaciones' }
    await adminService.createAGR(data)
    expect(api.post).toHaveBeenCalledWith('/api/admin/agr/', data)
  })
})

describe('adminService.getSoDRules', () => {
  it('calls GET /api/admin/sod-rules/', async () => {
    await adminService.getSoDRules()
    expect(api.get).toHaveBeenCalledWith('/api/admin/sod-rules/')
  })
})
