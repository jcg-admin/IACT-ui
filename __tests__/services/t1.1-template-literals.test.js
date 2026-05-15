/**
 * T1.1 — RED: template literals malformados en adminGateway y alertsGateway.
 *
 * Bug: `\`/api/foo/${query ? \`?${query}\` : ''}\`` produce:
 *   - Con query="a=1": "/api/foo/?a=1"  (correcto pero con / extra)
 *   - Sin query:       "/api/foo/"      (correcto)
 *
 * El extractor de URLs del análisis capturó "/api/access/menu-items/${query "
 * porque el regex no maneja backticks anidados.
 *
 * El fix correcto: separar los query params del path.
 *   ANTES: apiService.get(`/api/access/menu-items/${query ? `?${query}` : ''}`)
 *   DESPUÉS: apiService.get('/api/access/menu-items/', { params })
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const apiService = require('../../src/services/apiClient')

describe('T1.1 — adminGateway.getMenuItems usa params objeto, no query string en path', () => {
  let adminGateway
  beforeEach(() => {
    jest.clearAllMocks()
    adminGateway = require('../../src/services/adminGateway').default
  })

  test('sin filtros → GET /api/access/menu-items/ sin query en el path', async () => {
    await adminGateway.getMenuItems()
    const [url] = apiService.get.mock.calls[0]
    // El path NO debe contener ? ni parámetros inline
    expect(url).toBe('/api/access/menu-items/')
    expect(url).not.toContain('?')
    expect(url).not.toContain('${')
  })

  test('con filtros → segundo arg es { params } no query en el path', async () => {
    await adminGateway.getMenuItems({ status: 'ACTIVE' })
    const [url, opts] = apiService.get.mock.calls[0]
    expect(url).toBe('/api/access/menu-items/')
    expect(opts).toEqual({ params: expect.objectContaining({ status: 'ACTIVE' }) })
  })
})

describe('T1.1 — alertsGateway.getAlertHistory usa params objeto, no query string en path', () => {
  let alertsGateway
  beforeEach(() => {
    jest.clearAllMocks()
    alertsGateway = require('../../src/services/alertsGateway').default
  })

  test('sin filtros → GET /api/alerts/history/ sin query en el path', async () => {
    await alertsGateway.getAlertHistory()
    const [url] = apiService.get.mock.calls[0]
    expect(url).toBe('/api/alerts/history/')
    expect(url).not.toContain('?')
    expect(url).not.toContain('${')
  })

  test('con filtros → segundo arg es { params }', async () => {
    await alertsGateway.getAlertHistory({ severity: 'CRITICA', page: 1 })
    const [url, opts] = apiService.get.mock.calls[0]
    expect(url).toBe('/api/alerts/history/')
    expect(opts).toEqual({ params: expect.objectContaining({ severity: 'CRITICA' }) })
  })
})
