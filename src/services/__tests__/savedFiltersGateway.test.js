/**
 * savedFiltersGateway.test.js — T6.7: cobertura completa savedFiltersGateway v2
 *
 * 5 métodos × 3 casos = 15 tests
 */
import savedFiltersService from '../savedFiltersGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({ id: 'f-1' }),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

beforeEach(() => jest.clearAllMocks())

describe('getFilters(params)', () => {
  it('GET /api/reports/me/filters/', async () => {
    await savedFiltersService.getFilters()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/me/filters/', { params: {} })
  })
  it('pasa params opcionales', async () => {
    await savedFiltersService.getFilters({ type: 'agents' })
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/me/filters/', { params: { type: 'agents' } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(savedFiltersService.getFilters()).rejects.toMatchObject({ status: 403 })
  })
})

describe('getFilterDetail(id)', () => {
  it('GET /api/reports/me/filters/{id}/', async () => {
    await savedFiltersService.getFilterDetail('f-42')
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/me/filters/f-42/')
  })
  it('interpola el id en la URL', async () => {
    await savedFiltersService.getFilterDetail(7)
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/me/filters/7/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(savedFiltersService.getFilterDetail('x')).rejects.toMatchObject({ status: 403 })
  })
})

describe('createFilter(data)', () => {
  it('POST /api/reports/me/filters/ con los datos del filtro', async () => {
    await savedFiltersService.createFilter({ name: 'Q1 Agents', filters: { trimestre: 'Q1' } })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/reports/me/filters/',
      expect.objectContaining({ name: 'Q1 Agents' })
    )
  })
  it('retorna el filtro creado con id', async () => {
    apiService.post.mockResolvedValueOnce({ id: 'f-new' })
    const result = await savedFiltersService.createFilter({ name: 'Test' })
    expect(result.id).toBe('f-new')
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(savedFiltersService.createFilter({})).rejects.toMatchObject({ status: 403 })
  })
})

describe('updateFilter(id, data)', () => {
  it('PATCH /api/reports/me/filters/{id}/ con datos parciales', async () => {
    await savedFiltersService.updateFilter('f-5', { name: 'Renombrado' })
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/reports/me/filters/f-5/', expect.objectContaining({ name: 'Renombrado' })
    )
  })
  it('usa PATCH (actualización parcial, no PUT)', async () => {
    await savedFiltersService.updateFilter('f-5', {})
    expect(apiService.patch).toHaveBeenCalledTimes(1)
  })
  it('propaga error 403', async () => {
    apiService.patch.mockRejectedValueOnce({ status: 403 })
    await expect(savedFiltersService.updateFilter('f-5', {})).rejects.toMatchObject({ status: 403 })
  })
})

describe('deleteFilter(id)', () => {
  it('DELETE /api/reports/me/filters/{id}/', async () => {
    await savedFiltersService.deleteFilter('f-8')
    expect(apiService.delete).toHaveBeenCalledWith('/api/reports/me/filters/f-8/')
  })
  it('interpola el id en la URL', async () => {
    await savedFiltersService.deleteFilter(10)
    expect(apiService.delete).toHaveBeenCalledWith('/api/reports/me/filters/10/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(savedFiltersService.deleteFilter('f-8')).rejects.toMatchObject({ status: 403 })
  })
})
