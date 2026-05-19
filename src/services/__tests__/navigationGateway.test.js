/**
 * navigationGateway.test.js — T6.6: cobertura completa navigationGateway v2
 *
 * 2 métodos × 3 casos = 6 tests
 */
import navigationService from '../navigationGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get: jest.fn().mockResolvedValue([]),
}))

beforeEach(() => jest.clearAllMocks())

describe('getNavigationMenu(params)', () => {
  it('GET /api/navigation/menu/', async () => {
    await navigationService.getNavigationMenu()
    expect(apiService.get).toHaveBeenCalledWith('/api/navigation/menu/', { params: {} })
  })
  it('pasa params opcionales', async () => {
    await navigationService.getNavigationMenu({ locale: 'es' })
    expect(apiService.get).toHaveBeenCalledWith('/api/navigation/menu/', { params: { locale: 'es' } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(navigationService.getNavigationMenu()).rejects.toMatchObject({ status: 403 })
  })
})

describe('getNavigationModules(params)', () => {
  it('GET /api/navigation/modules/', async () => {
    await navigationService.getNavigationModules()
    expect(apiService.get).toHaveBeenCalledWith('/api/navigation/modules/', { params: {} })
  })
  it('pasa params opcionales', async () => {
    await navigationService.getNavigationModules({ active: true })
    expect(apiService.get).toHaveBeenCalledWith('/api/navigation/modules/', { params: { active: true } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(navigationService.getNavigationModules()).rejects.toMatchObject({ status: 403 })
  })
})
