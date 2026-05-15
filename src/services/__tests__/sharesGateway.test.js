/**
 * sharesGateway.test.js — T6.5: cobertura completa sharesGateway v2
 *
 * 5 métodos × 2-3 casos = 14 tests
 */
import sharesService from '../sharesGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({ id: 'share-1' }),
  delete: jest.fn().mockResolvedValue({}),
}))

beforeEach(() => jest.clearAllMocks())

// ── createShare ───────────────────────────────────────────────────────────────
describe('createShare(payload)', () => {
  it('POST /api/reports/shares/ con todos los campos', async () => {
    await sharesService.createShare({
      view_id: 'v-1', target_type: 'user', target_id: 5,
      permission: 'read', expires_at: null, message: 'Para revisión',
    })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/reports/shares/',
      expect.objectContaining({ view_id: 'v-1', target_type: 'user', permission: 'read' })
    )
  })
  it('retorna el share creado con id', async () => {
    apiService.post.mockResolvedValueOnce({ id: 'share-42' })
    const result = await sharesService.createShare({ view_id: 'v-2', target_type: 'group', target_id: 3 })
    expect(result.id).toBe('share-42')
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(sharesService.createShare({ view_id: 'v-3', target_type: 'user', target_id: 1 }))
      .rejects.toMatchObject({ status: 403 })
  })
})

// ── revokeShare ───────────────────────────────────────────────────────────────
describe('revokeShare(shareId)', () => {
  it('DELETE /api/reports/shares/{shareId}/', async () => {
    await sharesService.revokeShare('share-99')
    expect(apiService.delete).toHaveBeenCalledWith('/api/reports/shares/share-99/')
  })
  it('interpola el shareId en la URL', async () => {
    await sharesService.revokeShare(7)
    expect(apiService.delete).toHaveBeenCalledWith('/api/reports/shares/7/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(sharesService.revokeShare('x')).rejects.toMatchObject({ status: 403 })
  })
})

// ── getShares ─────────────────────────────────────────────────────────────────
describe('getShares(params)', () => {
  it('GET /api/reports/shares/ sin filtro de dirección', async () => {
    await sharesService.getShares()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/shares/', { params: {} })
  })
  it('pasa params opcionales', async () => {
    await sharesService.getShares({ page: 2 })
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/shares/', { params: { page: 2 } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(sharesService.getShares()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getSharesSent ─────────────────────────────────────────────────────────────
describe('getSharesSent(params)', () => {
  it('GET /api/reports/shares/ con direction=sent', async () => {
    await sharesService.getSharesSent()
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/reports/shares/', { params: { direction: 'sent' } }
    )
  })
  it('combina direction=sent con params adicionales', async () => {
    await sharesService.getSharesSent({ page: 1 })
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/reports/shares/', { params: { direction: 'sent', page: 1 } }
    )
  })
})

// ── getSharesReceived ─────────────────────────────────────────────────────────
describe('getSharesReceived(params)', () => {
  it('GET /api/reports/shares/ con direction=received', async () => {
    await sharesService.getSharesReceived()
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/reports/shares/', { params: { direction: 'received' } }
    )
  })
  it('combina direction=received con params adicionales', async () => {
    await sharesService.getSharesReceived({ page: 2 })
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/reports/shares/', { params: { direction: 'received', page: 2 } }
    )
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(sharesService.getSharesReceived()).rejects.toMatchObject({ status: 403 })
  })
})
