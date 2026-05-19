/**
 * T1.4 — RED:
 *   savedFilters.js slice usa /api/me/filters/ (no existe en IACT-api).
 *   URL canónica: /api/reports/me/filters/
 *
 * Además el slice llama apiService directamente — debe delegar a savedFiltersGateway.
 *
 * savedFiltersGateway.js métodos:
 *   getFilters()            → GET    /api/reports/me/filters/
 *   createFilter(data)      → POST   /api/reports/me/filters/
 *   updateFilter(id, data)  → PATCH  /api/reports/me/filters/{id}/
 *   deleteFilter(id)        → DELETE /api/reports/me/filters/{id}/
 *   getFilterDetail(id)     → GET    /api/reports/me/filters/{id}/
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({ id: 1 }),
  patch:  jest.fn().mockResolvedValue({ id: 1 }),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')

describe('savedFiltersGateway — URLs canónicas (T1.4)', () => {
  let gw
  beforeEach(() => {
    jest.clearAllMocks()
    gw = require('../../src/services/savedFiltersGateway').default
  })

  test('getFilters() GET /api/reports/me/filters/ (no /api/me/filters/)', async () => {
    await gw.getFilters()
    expect(api.get).toHaveBeenCalledWith('/api/reports/me/filters/', expect.anything())
  })

  test('createFilter() POST /api/reports/me/filters/', async () => {
    await gw.createFilter({ name: 'Filtro Q1', filters: { trimestre: 'Q01_25' } })
    expect(api.post).toHaveBeenCalledWith(
      '/api/reports/me/filters/',
      expect.objectContaining({ name: 'Filtro Q1' })
    )
  })

  test('updateFilter(id) PATCH /api/reports/me/filters/{id}/', async () => {
    await gw.updateFilter(5, { name: 'Nuevo nombre' })
    expect(api.patch).toHaveBeenCalledWith(
      '/api/reports/me/filters/5/',
      expect.objectContaining({ name: 'Nuevo nombre' })
    )
  })

  test('deleteFilter(id) DELETE /api/reports/me/filters/{id}/', async () => {
    await gw.deleteFilter(5)
    expect(api.delete).toHaveBeenCalledWith('/api/reports/me/filters/5/')
  })

  test('getFilterDetail(id) GET /api/reports/me/filters/{id}/', async () => {
    await gw.getFilterDetail(5)
    expect(api.get).toHaveBeenCalledWith('/api/reports/me/filters/5/')
  })
})

describe('savedFilters.slice — delega a savedFiltersGateway (T1.4)', () => {
  let store, fetchSavedFilters, saveFilter, deleteFilter, updateFilter

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('slice NO contiene llamadas directas a /api/me/filters/', () => {
    const sliceSource = require('fs')
      .readFileSync('src/redux/slices/savedFilters.js', 'utf8')
    expect(sliceSource).not.toContain('/api/me/filters/')
    expect(sliceSource).not.toContain("apiService.get('/api")
    expect(sliceSource).not.toContain("apiService.post('/api")
    expect(sliceSource).not.toContain("apiService.patch('/api")
    expect(sliceSource).not.toContain("apiService.delete('/api")
  })
})
