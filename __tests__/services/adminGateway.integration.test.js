/**
 * TDD — adminGateway URLs canónicas IACT-api v2.
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({}),
  put:    jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
}))

const apiService = require('../../src/services/apiClient')

describe('adminGateway — URLs canónicas IACT-api v2', () => {
  let svc
  beforeEach(() => { jest.clearAllMocks(); svc = require('../../src/services/adminGateway').default })

  test('getAGRList() GET /api/access/access-groups/ (no /api/admin/agr/)', async () => {
    await svc.getAGRList()
    expect(apiService.get.mock.calls[0][0]).toBe('/api/access/access-groups/')
  })

  test('getFunctions() GET /api/access/functions/ (no /api/admin/functions/)', async () => {
    await svc.getFunctions()
    expect(apiService.get.mock.calls[0][0]).toBe('/api/access/functions/')
  })

  test('getMenuItems() GET /api/access/menu-items/ (no /api/admin/menu-items/)', async () => {
    await svc.getMenuItems()
    expect(apiService.get.mock.calls[0][0]).toBe('/api/access/menu-items/')
  })

  test('getSeparationRules() GET /api/access/separation-rules/ (no /api/admin/separation-rules/)', async () => {
    await svc.getSeparationRules()
    expect(apiService.get.mock.calls[0][0]).toBe('/api/access/separation-rules/')
  })
})
