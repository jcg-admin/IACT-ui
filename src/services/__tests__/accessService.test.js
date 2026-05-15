/**
 * accessService.test.js — actualizado para accessGateway v2 (apiService, no fetch)
 *
 * v4.0 → v2: getAuthHeaders() eliminado (autenticación vía httpOnly cookies).
 * URLs actualizadas a las canónicas de IACT-api.
 */
import accessService from '../accessGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

beforeEach(() => { jest.clearAllMocks() })

describe('AccessService — getAuthHeaders eliminado (httpOnly cookies)', () => {
  it('NO tiene método getAuthHeaders — auth vía interceptor apiClient', () => {
    expect(typeof accessService.getAuthHeaders).toBe('undefined')
  })
})

describe('AccessService.getFunctionGroups', () => {
  it('calls GET /api/access/access-groups/ (no /access/groups/)', async () => {
    await accessService.getFunctionGroups()
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/access/access-groups/', expect.anything()
    )
  })
})

// T-025: UC-ACC-01 — asignar funciones (bulk)
describe('AccessService.assignFunctions', () => {
  it('calls POST /api/access/users/{id}/functions/assign/ con function_ids', async () => {
    await accessService.assignFunctions(42, [7, 8], null)
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/users/42/functions/assign/',
      expect.objectContaining({ function_ids: [7, 8] })
    )
  })

  it('incluye expires_at cuando se provee', async () => {
    await accessService.assignFunctions(1, [2], '2026-12-31')
    const body = apiService.post.mock.calls[0][1]
    expect(body.expires_at).toBe('2026-12-31')
  })

  it('envía expires_at null cuando no se provee', async () => {
    await accessService.assignFunctions(1, [3])
    const body = apiService.post.mock.calls[0][1]
    expect(body.expires_at).toBeNull()
  })
})

// T-026: UC-ACC-02 — revocar funciones (bulk)
describe('AccessService.revokeFunctions', () => {
  it('calls DELETE /api/access/users/{id}/functions/revoke/ con function_ids', async () => {
    await accessService.revokeFunctions(5, [10, 11], 'Baja de usuario')
    expect(apiService.delete).toHaveBeenCalledWith(
      '/api/access/users/5/functions/revoke/',
      expect.objectContaining({ data: expect.objectContaining({ function_ids: [10, 11] }) })
    )
  })

  it('incluye revoke_reason en data', async () => {
    await accessService.revokeFunctions(5, [10], 'Cambio de rol')
    const { data } = apiService.delete.mock.calls[0][1]
    expect(data.revoke_reason).toBe('Cambio de rol')
  })
})

// T-027: UC-AUD-03 — exportar auditoría (async → job_id)
describe('AccessService.exportAuditLog', () => {
  it('calls POST /api/audit/export/ (no /access/audit/export)', async () => {
    await accessService.exportAuditLog({}, 'monthly', 'csv', false)
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/export/',
      expect.objectContaining({ format: 'csv' })
    )
  })

  it('envía filters, period, format, include_archive', async () => {
    await accessService.exportAuditLog({ user_id: 42 }, 'weekly', 'json', true)
    const body = apiService.post.mock.calls[0][1]
    expect(body.filters).toEqual({ user_id: 42 })
    expect(body.period).toBe('weekly')
    expect(body.include_archive).toBe(true)
  })
})

// T-028: UC-ACC-04 — asignar AGR a usuario
describe('AccessService.assignAccessGroup', () => {
  it('calls POST /api/access/users/{id}/agr/ con agr_id', async () => {
    await accessService.assignAccessGroup(3, 99, null)
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/users/3/agr/',
      expect.objectContaining({ agr_id: 99 })
    )
  })

  it('incluye expires_at cuando se provee', async () => {
    await accessService.assignAccessGroup(3, 99, '2027-01-01')
    const body = apiService.post.mock.calls[0][1]
    expect(body.expires_at).toBe('2027-01-01')
  })

  it('envía expires_at null cuando no se provee', async () => {
    await accessService.assignAccessGroup(3, 99)
    const body = apiService.post.mock.calls[0][1]
    expect(body.expires_at).toBeNull()
  })
})
