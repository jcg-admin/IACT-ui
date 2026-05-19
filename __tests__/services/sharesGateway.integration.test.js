/**
 * T1.2 — sharesGateway.js URLs canónicas.
 *
 * La API expone:
 *   POST   /api/reports/shares/           crear share (no /api/me/shares/)
 *   DELETE /api/reports/shares/{id}/      revocar share
 *   GET    /api/reports/shares/           listar shares (sent y received son filtros)
 *
 * Nota: la API no tiene rutas /sent/ ni /received/ separadas.
 * Se usa ?direction=sent o ?direction=received como query param.
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({ share_id: 'abc' }),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')

describe('sharesGateway — URLs canónicas IACT-api', () => {
  let sharesGateway
  beforeEach(() => {
    jest.clearAllMocks()
    sharesGateway = require('../../src/services/sharesGateway').default
  })

  test('createShare() POST /api/reports/shares/ (no /api/me/shares/)', async () => {
    await sharesGateway.createShare({
      view_id: 'v1', target_type: 'user', target_id: 1,
      permission: 'read', expires_at: null, message: ''
    })
    expect(api.post).toHaveBeenCalledWith(
      '/api/reports/shares/', expect.objectContaining({ view_id: 'v1' })
    )
  })

  test('revokeShare() DELETE /api/reports/shares/{id}/ (no /api/me/shares/{id}/)', async () => {
    await sharesGateway.revokeShare('abc-123')
    expect(api.delete).toHaveBeenCalledWith('/api/reports/shares/abc-123/')
  })

  test('getShares() GET /api/reports/shares/ sin subpath /sent/ ni /received/', async () => {
    await sharesGateway.getShares()
    const [url] = api.get.mock.calls[0]
    expect(url).toBe('/api/reports/shares/')
    expect(url).not.toContain('/sent')
    expect(url).not.toContain('/received')
  })

  test('getSharesSent() GET /api/reports/shares/ con params.direction=sent', async () => {
    await sharesGateway.getSharesSent()
    const [url, opts] = api.get.mock.calls[0]
    expect(url).toBe('/api/reports/shares/')
    expect(opts?.params?.direction).toBe('sent')
  })

  test('getSharesReceived() GET /api/reports/shares/ con params.direction=received', async () => {
    await sharesGateway.getSharesReceived()
    const [url, opts] = api.get.mock.calls[0]
    expect(url).toBe('/api/reports/shares/')
    expect(opts?.params?.direction).toBe('received')
  })
})
