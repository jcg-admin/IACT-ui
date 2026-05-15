/** T2.6 — navigationGateway.js */
jest.mock('../../src/services/apiClient', () => ({
  get: jest.fn().mockResolvedValue({}),
}))
const api = require('../../src/services/apiClient')
describe('navigationGateway (T2.6)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/navigationGateway').default })
  test('getNavigationMenu() GET /api/navigation/menu/', async () => {
    await gw.getNavigationMenu()
    expect(api.get).toHaveBeenCalledWith('/api/navigation/menu/', expect.anything())
  })
  test('getNavigationModules() GET /api/navigation/modules/', async () => {
    await gw.getNavigationModules()
    expect(api.get).toHaveBeenCalledWith('/api/navigation/modules/', expect.anything())
  })
})
