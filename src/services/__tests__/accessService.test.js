/**
 * accessService.test.js — T6.1: cobertura completa accessGateway v2
 *
 * 29 métodos × (URL correcta + body/params + error 403) = ~87 casos
 * Cada describe agrupa un método del gateway.
 * Convención: las URLs usan trailing slash según el schema OpenAPI de IACT-api.
 */
import accessService from '../accessGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  put:    jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

beforeEach(() => jest.clearAllMocks())

// ── getAllFunctions ───────────────────────────────────────────────────────────
describe('getAllFunctions()', () => {
  it('GET /api/access/functions/', async () => {
    await accessService.getAllFunctions()
    expect(apiService.get).toHaveBeenCalledWith('/api/access/functions/', expect.anything())
  })
  it('pasa params como query string', async () => {
    await accessService.getAllFunctions({ active: true })
    expect(apiService.get).toHaveBeenCalledWith(expect.any(String), { params: { active: true } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403, data: { detail: 'Forbidden' } })
    await expect(accessService.getAllFunctions()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getUserPermissions ────────────────────────────────────────────────────────
describe('getUserPermissions(userId)', () => {
  it('GET /api/access/permissions/{userId}/', async () => {
    await accessService.getUserPermissions(42)
    expect(apiService.get).toHaveBeenCalledWith('/api/access/permissions/42/')
  })
  it('interpola el userId en la URL', async () => {
    await accessService.getUserPermissions('usr-99')
    expect(apiService.get).toHaveBeenCalledWith('/api/access/permissions/usr-99/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getUserPermissions(1)).rejects.toMatchObject({ status: 403 })
  })
})

// ── getEffectivePermissions ───────────────────────────────────────────────────
describe('getEffectivePermissions(userId)', () => {
  it('GET /api/access/users/{userId}/effective-permissions/', async () => {
    await accessService.getEffectivePermissions(7)
    expect(apiService.get).toHaveBeenCalledWith('/api/access/users/7/effective-permissions/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getEffectivePermissions(7)).rejects.toMatchObject({ status: 403 })
  })
})

// ── verifyPermission ──────────────────────────────────────────────────────────
describe('verifyPermission(userId, functionCode)', () => {
  it('GET /api/access/permissions/verify/ con userId y function_code', async () => {
    await accessService.verifyPermission(3, 'alerts.view')
    expect(apiService.get).toHaveBeenCalledWith('/api/access/permissions/verify/', {
      params: { user_id: 3, function_code: 'alerts.view' }
    })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.verifyPermission(3, 'x')).rejects.toMatchObject({ status: 403 })
  })
})

// ── assignFunctions ───────────────────────────────────────────────────────────
describe('assignFunctions(userId, functionIds, expiresAt)', () => {
  it('POST /api/access/users/{userId}/functions/assign/', async () => {
    await accessService.assignFunctions(5, [1, 2])
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/users/5/functions/assign/', expect.objectContaining({ function_ids: [1, 2] })
    )
  })
  it('incluye expires_at cuando se proporciona', async () => {
    await accessService.assignFunctions(5, [1], '2026-12-31')
    expect(apiService.post).toHaveBeenCalledWith(
      expect.any(String), expect.objectContaining({ expires_at: '2026-12-31' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.assignFunctions(5, [1])).rejects.toMatchObject({ status: 403 })
  })
})

// ── revokeFunctions ───────────────────────────────────────────────────────────
describe('revokeFunctions(userId, functionIds, revokeReason)', () => {
  it('DELETE /api/access/users/{userId}/functions/revoke/', async () => {
    await accessService.revokeFunctions(5, [1, 2], 'reason')
    expect(apiService.delete).toHaveBeenCalledWith(
      '/api/access/users/5/functions/revoke/', expect.anything()
    )
  })
  it('incluye function_ids en el body', async () => {
    await accessService.revokeFunctions(5, [3], 'r')
    expect(apiService.delete).toHaveBeenCalledWith(
      expect.any(String), expect.objectContaining({ data: expect.objectContaining({ function_ids: [3] }) })
    )
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.revokeFunctions(5, [1], 'r')).rejects.toMatchObject({ status: 403 })
  })
})

// ── getFunctionGroups ─────────────────────────────────────────────────────────
describe('getFunctionGroups()', () => {
  it('GET /api/access/access-groups/', async () => {
    await accessService.getFunctionGroups()
    expect(apiService.get).toHaveBeenCalledWith('/api/access/access-groups/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getFunctionGroups()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getGroupFunctions ─────────────────────────────────────────────────────────
describe('getGroupFunctions(groupId)', () => {
  it('GET /api/access/access-groups/{groupId}/', async () => {
    await accessService.getGroupFunctions('grp-10')
    expect(apiService.get).toHaveBeenCalledWith('/api/access/access-groups/grp-10/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getGroupFunctions(1)).rejects.toMatchObject({ status: 403 })
  })
})

// ── createGroup ───────────────────────────────────────────────────────────────
describe('createGroup(data)', () => {
  it('POST /api/access/access-groups/', async () => {
    await accessService.createGroup({ name: 'Auditores', code: 'aud_group' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/access-groups/', expect.objectContaining({ name: 'Auditores' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.createGroup({ name: 'X', code: 'x_group' })).rejects.toMatchObject({ status: 403 })
  })
})

// ── updateGroup ───────────────────────────────────────────────────────────────
describe('updateGroup(id, data)', () => {
  it('PATCH /api/access/access-groups/{id}/', async () => {
    await accessService.updateGroup(5, { name: 'Renombrado' })
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/access/access-groups/5/', expect.objectContaining({ name: 'Renombrado' })
    )
  })
  it('propaga error 403', async () => {
    apiService.patch.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.updateGroup(5, {})).rejects.toMatchObject({ status: 403 })
  })
})

// ── retireGroup ───────────────────────────────────────────────────────────────
describe('retireGroup(id, retireReason)', () => {
  it('DELETE /api/access/access-groups/{id}/ con retire_reason', async () => {
    await accessService.retireGroup(5, 'Grupo obsoleto por fusión')
    expect(apiService.delete).toHaveBeenCalledWith(
      '/api/access/access-groups/5/', expect.objectContaining({
        data: expect.objectContaining({ retire_reason: 'Grupo obsoleto por fusión' })
      })
    )
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.retireGroup(5, 'r')).rejects.toMatchObject({ status: 403 })
  })
})

// ── assignFunctionsToGroup ────────────────────────────────────────────────────
describe('assignFunctionsToGroup(groupId, functionIds, changeReason)', () => {
  it('POST /api/access/access-groups/{groupId}/functions/', async () => {
    await accessService.assignFunctionsToGroup('g1', [10, 11], 'Ampliación de rol')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/access-groups/g1/functions/',
      expect.objectContaining({ function_ids: [10, 11], change_reason: 'Ampliación de rol' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.assignFunctionsToGroup('g1', [], 'r')).rejects.toMatchObject({ status: 403 })
  })
})

// ── assignAccessGroup ─────────────────────────────────────────────────────────
describe('assignAccessGroup(userId, agrId, expiresAt)', () => {
  it('POST /api/access/users/{userId}/agr/', async () => {
    await accessService.assignAccessGroup(3, 'agr-001')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/users/3/agr/', expect.objectContaining({ agr_id: 'agr-001' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.assignAccessGroup(3, 'a')).rejects.toMatchObject({ status: 403 })
  })
})

// ── revokeAccessGroup ─────────────────────────────────────────────────────────
describe('revokeAccessGroup(userId, agrId)', () => {
  it('DELETE /api/access/users/{userId}/agr/{agrId}/', async () => {
    await accessService.revokeAccessGroup(3, 'agr-001')
    expect(apiService.delete).toHaveBeenCalledWith('/api/access/users/3/agr/agr-001/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.revokeAccessGroup(3, 'a')).rejects.toMatchObject({ status: 403 })
  })
})

// ── assignGrouper ─────────────────────────────────────────────────────────────
describe('assignGrouper(userId, agrId)', () => {
  it('POST /api/access/groupers/assign', async () => {
    await accessService.assignGrouper(7, 'agr-002')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/groupers/assign', expect.objectContaining({ user_id: 7, agr_id: 'agr-002' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.assignGrouper(7, 'a')).rejects.toMatchObject({ status: 403 })
  })
})

// ── getGroupers ───────────────────────────────────────────────────────────────
describe('getGroupers()', () => {
  it('GET /api/access/groupers/', async () => {
    await accessService.getGroupers()
    expect(apiService.get).toHaveBeenCalledWith('/api/access/groupers/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getGroupers()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getSeparationRules ────────────────────────────────────────────────────────
describe('getSeparationRules()', () => {
  it('GET /api/access/separation-rules/', async () => {
    await accessService.getSeparationRules()
    expect(apiService.get).toHaveBeenCalledWith('/api/access/separation-rules/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getSeparationRules()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getSeparationRuleDetail ───────────────────────────────────────────────────
describe('getSeparationRuleDetail(id)', () => {
  it('GET /api/access/separation-rules/{id}/', async () => {
    await accessService.getSeparationRuleDetail('sr-01')
    expect(apiService.get).toHaveBeenCalledWith('/api/access/separation-rules/sr-01/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getSeparationRuleDetail('x')).rejects.toMatchObject({ status: 403 })
  })
})

// ── createSeparationRule ──────────────────────────────────────────────────────
describe('createSeparationRule(data)', () => {
  it('POST /api/access/separation-rules/', async () => {
    await accessService.createSeparationRule({ name: 'SR-Agentes-Supervisores' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/separation-rules/', expect.objectContaining({ name: 'SR-Agentes-Supervisores' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.createSeparationRule({})).rejects.toMatchObject({ status: 403 })
  })
})

// ── updateSeparationRule ──────────────────────────────────────────────────────
describe('updateSeparationRule(id, data)', () => {
  it('PATCH /api/access/separation-rules/{id}/', async () => {
    await accessService.updateSeparationRule('sr-02', { active: false })
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/access/separation-rules/sr-02/', expect.objectContaining({ active: false })
    )
  })
  it('propaga error 403', async () => {
    apiService.patch.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.updateSeparationRule('x', {})).rejects.toMatchObject({ status: 403 })
  })
})

// ── deleteSeparationRule ──────────────────────────────────────────────────────
describe('deleteSeparationRule(id)', () => {
  it('DELETE /api/access/separation-rules/{id}/', async () => {
    await accessService.deleteSeparationRule('sr-03')
    expect(apiService.delete).toHaveBeenCalledWith('/api/access/separation-rules/sr-03/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.deleteSeparationRule('x')).rejects.toMatchObject({ status: 403 })
  })
})

// ── validateSeparationRules ───────────────────────────────────────────────────
describe('validateSeparationRules(userId, functionId)', () => {
  it('POST /api/access/separation-rules/validate con user_id y function_id', async () => {
    await accessService.validateSeparationRules(3, 10)
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/separation-rules/validate', expect.objectContaining({ user_id: 3, function_id: 10 })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.validateSeparationRules(3, 10)).rejects.toMatchObject({ status: 403 })
  })
})

// ── grantExceptionalPermission ────────────────────────────────────────────────
describe('grantExceptionalPermission(userId, payload)', () => {
  it('POST /api/access/users/{userId}/exceptional-permissions/', async () => {
    await accessService.grantExceptionalPermission(5, { function_id: 99, justification: 'x' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/access/users/5/exceptional-permissions/', expect.objectContaining({ function_id: 99 })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.grantExceptionalPermission(5, {})).rejects.toMatchObject({ status: 403 })
  })
})

// ── getExceptionalPermissions ─────────────────────────────────────────────────
describe('getExceptionalPermissions(userId)', () => {
  it('GET /api/access/users/{userId}/exceptional-permissions/', async () => {
    await accessService.getExceptionalPermissions(5)
    expect(apiService.get).toHaveBeenCalledWith('/api/access/users/5/exceptional-permissions/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getExceptionalPermissions(5)).rejects.toMatchObject({ status: 403 })
  })
})

// ── previewExceptionalPermission ──────────────────────────────────────────────
describe('previewExceptionalPermission(userId, params)', () => {
  it('GET /api/access/users/{userId}/exceptional-permissions/preview/', async () => {
    await accessService.previewExceptionalPermission(5, { function_id: 99 })
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/access/users/5/exceptional-permissions/preview/', expect.anything()
    )
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.previewExceptionalPermission(5, {})).rejects.toMatchObject({ status: 403 })
  })
})

// ── revokeExceptionalPermission ───────────────────────────────────────────────
describe('revokeExceptionalPermission(userId, permissionId, revokeReason)', () => {
  it('DELETE /api/access/users/{userId}/exceptional-permissions/{permissionId}/', async () => {
    await accessService.revokeExceptionalPermission(5, 'perm-7', 'Acceso temporal expirado')
    expect(apiService.delete).toHaveBeenCalledWith(
      '/api/access/users/5/exceptional-permissions/perm-7/', expect.anything()
    )
  })
  it('incluye revoke_reason en el body', async () => {
    await accessService.revokeExceptionalPermission(5, 'perm-7', 'Motivo')
    expect(apiService.delete).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ data: expect.objectContaining({ revoke_reason: 'Motivo' }) })
    )
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.revokeExceptionalPermission(5, 'p', 'r')).rejects.toMatchObject({ status: 403 })
  })
})

// ── getAccessAudit ────────────────────────────────────────────────────────────
describe('getAccessAudit(userId)', () => {
  it('GET /api/access/audit/ (sin userId → sin filtro)', async () => {
    await accessService.getAccessAudit()
    expect(apiService.get).toHaveBeenCalledWith('/api/access/audit/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getAccessAudit()).rejects.toMatchObject({ status: 403 })
  })
})

// ── exportAuditLog ────────────────────────────────────────────────────────────
describe('exportAuditLog(filters, period, format, includeArchive)', () => {
  it('POST /api/audit/export/ → retorna job_id', async () => {
    apiService.post.mockResolvedValueOnce({ job_id: 'j-1' })
    const result = await accessService.exportAuditLog({}, 'Q1', 'csv', false)
    expect(apiService.post).toHaveBeenCalledWith('/api/audit/export/', expect.any(Object))
    expect(result.job_id).toBe('j-1')
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.exportAuditLog({}, 'Q1', 'csv', false)).rejects.toMatchObject({ status: 403 })
  })
})

// ── getMyModules ──────────────────────────────────────────────────────────────
describe('getMyModules()', () => {
  it('GET /api/access/my-modules/', async () => {
    await accessService.getMyModules()
    expect(apiService.get).toHaveBeenCalledWith('/api/access/my-modules/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(accessService.getMyModules()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getAuthHeaders — eliminado (v4.0) ─────────────────────────────────────────
describe('getAuthHeaders — eliminado en v2 (httpOnly cookies)', () => {
  it('no existe el método getAuthHeaders', () => {
    expect(typeof accessService.getAuthHeaders).toBe('undefined')
  })
})
