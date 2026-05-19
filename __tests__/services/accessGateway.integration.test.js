/**
 * T1.5 — RED: accessGateway.js debe usar apiService, no fetch() directo.
 *
 * Problemas actuales:
 *   1. Usa fetch() + localStorage.getItem('accessToken') — bypasea el interceptor
 *      de autenticación de apiClient.js (httpOnly cookies + CSRF).
 *   2. URLs incorrectas (sin trailing slash, prefijos obsoletos /access/groups/ en
 *      lugar de /api/access/access-groups/, etc.)
 *   3. getSegments()/assignSegment() apuntan a /access/segments que no existe en API.
 *   4. getGroupCascadeImpact() apunta a /access/groups/{id}/cascade-impact que no existe.
 *   5. validateGroupAssignment() apunta a /access/groups/{id}/validate-for-user que no existe.
 *
 * Mapeo correcto de URLs (basado en schema OpenAPI de IACT-api):
 *   getAllFunctions()              → GET  /api/access/functions/
 *   getUserPermissions(userId)     → GET  /api/access/permissions/{userId}/
 *   assignFunctions(userId, ...)   → POST /api/access/users/{userId}/functions/assign/
 *   revokeFunctions(userId, ...)   → DELETE /api/access/users/{userId}/functions/revoke/
 *   validateSeparationRules(...)   → POST /api/access/separation-rules/validate
 *   getAccessAudit(userId)         → GET  /api/access/audit/ (con ?target_user_id=userId)
 *   exportAuditLog(...)            → POST /api/audit/export/
 *   assignAccessGroup(userId,...)  → POST /api/access/users/{userId}/agr/
 *   revokeAccessGroup(userId,agrId)→ DELETE /api/access/users/{userId}/agr/{agrId}/
 *   createGroup(data)              → POST /api/access/access-groups/
 *   updateGroup(id, data)          → PATCH /api/access/access-groups/{id}/
 *   retireGroup(id, reason)        → DELETE /api/access/access-groups/{id}/
 *   assignFunctionsToGroup(gId,...)→ POST /api/access/access-groups/{gId}/functions/
 *   getGroupFunctions(gId)         → GET  /api/access/access-groups/{gId}/
 *   getFunctionGroups()            → GET  /api/access/access-groups/
 *   getSeparationRules()           → GET  /api/access/separation-rules/
 *   createSeparationRule(data)     → POST /api/access/separation-rules/
 *   updateSeparationRule(id, data) → PATCH /api/access/separation-rules/{id}/
 *   deleteSeparationRule(id)       → DELETE /api/access/separation-rules/{id}/
 *   grantExceptionalPermission(uId)→ POST /api/access/users/{uId}/exceptional-permissions/
 *   getExceptionalPermissions(uId) → GET  /api/access/users/{uId}/exceptional-permissions/
 *   revokeExceptionalPermission(uId, permId) → DELETE .../exceptional-permissions/{permId}/
 *   getEffectivePermissions(userId)→ GET  /api/access/users/{userId}/effective-permissions/
 *   previewExceptionalPermission(uId) → GET .../exceptional-permissions/preview/
 *   verifyPermission(userId, code) → GET  /api/access/permissions/verify/
 *   assignGrouper(userId, agrId)   → POST /api/access/groupers/assign
 *
 * ELIMINADOS (sin endpoint en IACT-api):
 *   getSegments()      → /access/segments no existe
 *   assignSegment()    → /access/segments/assign no existe
 *   validateGroupAssignment() → endpoint no existe
 *   getGroupCascadeImpact()   → endpoint no existe
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')

// Helper: captura la primera llamada al método HTTP
const url  = (method) => api[method].mock.calls[0]?.[0] ?? null
const body = (method) => api[method].mock.calls[0]?.[1] ?? null

describe('accessGateway — NO usa fetch() directo (T1.5)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/accessGateway').default })

  test('no tiene método getAuthHeaders (sin localStorage)', () => {
    expect(typeof gw.getAuthHeaders).toBe('undefined')
  })
})

describe('accessGateway — URLs canónicas (T1.5)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/accessGateway').default })

  test('getAllFunctions() GET /api/access/functions/', async () => {
    await gw.getAllFunctions()
    expect(url('get')).toBe('/api/access/functions/')
  })

  test('getUserPermissions(42) GET /api/access/permissions/42/', async () => {
    await gw.getUserPermissions(42)
    expect(url('get')).toBe('/api/access/permissions/42/')
  })

  test('assignFunctions(10, [1,2]) POST /api/access/users/10/functions/assign/', async () => {
    await gw.assignFunctions(10, [1, 2], null)
    expect(url('post')).toBe('/api/access/users/10/functions/assign/')
    expect(body('post')).toEqual(expect.objectContaining({ function_ids: [1, 2] }))
  })

  test('revokeFunctions(10, [1]) DELETE /api/access/users/10/functions/revoke/', async () => {
    await gw.revokeFunctions(10, [1], 'Baja')
    expect(url('delete')).toBe('/api/access/users/10/functions/revoke/')
  })

  test('validateSeparationRules() POST /api/access/separation-rules/validate', async () => {
    await gw.validateSeparationRules(1, 2)
    expect(url('post')).toBe('/api/access/separation-rules/validate')
  })

  test('getAccessAudit() GET /api/access/audit/', async () => {
    await gw.getAccessAudit()
    expect(url('get')).toBe('/api/access/audit/')
  })

  test('getAccessAudit(42) GET /api/access/audit/ con ?target_user_id=42', async () => {
    await gw.getAccessAudit(42)
    expect(url('get')).toBe('/api/access/audit/')
    expect(body('get')?.params?.target_user_id).toBe(42)
  })

  test('exportAuditLog() POST /api/audit/export/', async () => {
    await gw.exportAuditLog({}, 'monthly', 'csv', false)
    expect(url('post')).toBe('/api/audit/export/')
  })

  test('assignAccessGroup(3,99) POST /api/access/users/3/agr/', async () => {
    await gw.assignAccessGroup(3, 99, null)
    expect(url('post')).toBe('/api/access/users/3/agr/')
    expect(body('post')).toEqual(expect.objectContaining({ agr_id: 99 }))
  })

  test('revokeAccessGroup(3,99) DELETE /api/access/users/3/agr/99/', async () => {
    await gw.revokeAccessGroup(3, 99)
    expect(url('delete')).toBe('/api/access/users/3/agr/99/')
  })

  test('createGroup() POST /api/access/access-groups/', async () => {
    await gw.createGroup({ name: 'Ops' })
    expect(url('post')).toBe('/api/access/access-groups/')
  })

  test('updateGroup(5) PATCH /api/access/access-groups/5/', async () => {
    await gw.updateGroup(5, { name: 'Ops2' })
    expect(url('patch')).toBe('/api/access/access-groups/5/')
  })

  test('retireGroup(5) DELETE /api/access/access-groups/5/', async () => {
    await gw.retireGroup(5, 'No requerido')
    expect(url('delete')).toBe('/api/access/access-groups/5/')
  })

  test('assignFunctionsToGroup(7,[1,2]) POST /api/access/access-groups/7/functions/', async () => {
    await gw.assignFunctionsToGroup(7, [1, 2], 'Asignación inicial')
    expect(url('post')).toBe('/api/access/access-groups/7/functions/')
  })

  test('getGroupFunctions(7) GET /api/access/access-groups/7/', async () => {
    await gw.getGroupFunctions(7)
    expect(url('get')).toBe('/api/access/access-groups/7/')
  })

  test('getFunctionGroups() GET /api/access/access-groups/', async () => {
    await gw.getFunctionGroups()
    expect(url('get')).toBe('/api/access/access-groups/')
  })

  test('getSeparationRules() GET /api/access/separation-rules/', async () => {
    await gw.getSeparationRules()
    expect(url('get')).toBe('/api/access/separation-rules/')
  })

  test('createSeparationRule() POST /api/access/separation-rules/', async () => {
    await gw.createSeparationRule({ function_a: 1, function_b: 2 })
    expect(url('post')).toBe('/api/access/separation-rules/')
  })

  test('updateSeparationRule(3) PATCH /api/access/separation-rules/3/', async () => {
    await gw.updateSeparationRule(3, { active: false })
    expect(url('patch')).toBe('/api/access/separation-rules/3/')
  })

  test('deleteSeparationRule(3) DELETE /api/access/separation-rules/3/', async () => {
    await gw.deleteSeparationRule(3)
    expect(url('delete')).toBe('/api/access/separation-rules/3/')
  })

  test('grantExceptionalPermission(5) POST /api/access/users/5/exceptional-permissions/', async () => {
    await gw.grantExceptionalPermission(5, { function_id: 1, reason: 'Urgente' })
    expect(url('post')).toBe('/api/access/users/5/exceptional-permissions/')
  })

  test('getExceptionalPermissions(5) GET /api/access/users/5/exceptional-permissions/', async () => {
    await gw.getExceptionalPermissions(5)
    expect(url('get')).toBe('/api/access/users/5/exceptional-permissions/')
  })

  test('revokeExceptionalPermission(5,9) DELETE .../exceptional-permissions/9/', async () => {
    await gw.revokeExceptionalPermission(5, 9, 'Ya no aplica')
    expect(url('delete')).toBe('/api/access/users/5/exceptional-permissions/9/')
  })

  test('getEffectivePermissions(5) GET /api/access/users/5/effective-permissions/', async () => {
    await gw.getEffectivePermissions(5)
    expect(url('get')).toBe('/api/access/users/5/effective-permissions/')
  })

  test('previewExceptionalPermission(5) GET .../exceptional-permissions/preview/', async () => {
    await gw.previewExceptionalPermission(5, { function_id: 1 })
    expect(url('get')).toBe('/api/access/users/5/exceptional-permissions/preview/')
  })

  test('verifyPermission(5,"ACC-001") GET /api/access/permissions/verify/', async () => {
    await gw.verifyPermission(5, 'ACC-001')
    expect(url('get')).toBe('/api/access/permissions/verify/')
  })

  test('assignGrouper(5,99) POST /api/access/groupers/assign', async () => {
    await gw.assignGrouper(5, 99)
    expect(url('post')).toBe('/api/access/groupers/assign')
  })
})
