/**
 * T1.6 — RED: auditGateway.js usa fetch() directo con localStorage.
 *
 * Problemas actuales:
 *   1. fetch() + localStorage — bypasea interceptor httpOnly cookies
 *   2. URLs incorrectas sin prefijo /api/:
 *      /audit/logs       → /api/audit/logs/
 *      /audit/search     → /api/audit/search/    (POST)
 *      /audit/export     → /api/audit/export/    (POST, retorna job_id no blob)
 *      /audit/compliance → /api/audit/compliance-report/ (POST)
 *      /audit/summary    → NO EXISTE en IACT-api
 *      /audit/logs/user/{id} → filtrar por ?user_id en /api/audit/logs/
 *      /audit/logs/resource  → filtrar por ?resource_type en /api/audit/logs/
 *      /audit/logs/critical  → filtrar por ?severity=CRITICAL en /api/audit/logs/
 *      /audit/validate-integrity → /api/audit/integrity/ (GET, no POST)
 *      /audit/compliance/generate → /api/audit/compliance-report/ (POST)
 *      /audit/events     → /api/audit/audit-events/ (POST)
 *
 * URLs canónicas (schema OpenAPI IACT-api):
 *   GET  /api/audit/logs/
 *   GET  /api/audit/logs/{id}/
 *   POST /api/audit/search/
 *   POST /api/audit/export/           retorna { job_id }
 *   POST /api/audit/compliance-report/
 *   POST /api/audit/compliance-verify/
 *   GET  /api/audit/audit-events/
 *   GET  /api/audit/audit-events/aggregate/
 *   POST /api/audit/audit-events/export/
 *   GET  /api/audit/audit-events/{id}/
 *   GET  /api/audit/general/
 *   GET  /api/audit/integrity/
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({ job_id: 'j-1' }),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')
const u = (m) => api[m].mock.calls[0]?.[0] ?? null
const b = (m) => api[m].mock.calls[0]?.[1] ?? null

describe('auditGateway — NO usa fetch() directo (T1.6)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/auditGateway').default })

  test('apiService.get existe y fetch NO es llamado', async () => {
    const origFetch = global.fetch
    global.fetch = jest.fn().mockRejectedValue(new Error('fetch NO debe usarse'))
    await gw.getAuditLogs()
    expect(global.fetch).not.toHaveBeenCalled()
    global.fetch = origFetch
  })
})

describe('auditGateway — URLs canónicas (T1.6)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/auditGateway').default })

  test('getAuditLogs() GET /api/audit/logs/', async () => {
    await gw.getAuditLogs()
    expect(u('get')).toBe('/api/audit/logs/')
  })

  test('getAuditLogDetail(42) GET /api/audit/logs/42/', async () => {
    await gw.getAuditLogDetail(42)
    expect(u('get')).toBe('/api/audit/logs/42/')
  })

  test('searchLogs() POST /api/audit/search/', async () => {
    await gw.searchLogs({ query: 'login' })
    expect(u('post')).toBe('/api/audit/search/')
    expect(b('post')).toEqual(expect.objectContaining({ query: 'login' }))
  })

  test('exportLogs() POST /api/audit/export/ — retorna job_id (no blob)', async () => {
    const result = await gw.exportLogs('csv', {})
    expect(u('post')).toBe('/api/audit/export/')
    expect(result.job_id).toBe('j-1')
  })

  test('getComplianceReport() POST /api/audit/compliance-report/', async () => {
    await gw.getComplianceReport({ period: 'Q01_25' })
    expect(u('post')).toBe('/api/audit/compliance-report/')
  })

  test('verifyCompliance() POST /api/audit/compliance-verify/', async () => {
    await gw.verifyCompliance('report-abc')
    expect(u('post')).toBe('/api/audit/compliance-verify/')
  })

  test('getAuditEvents() GET /api/audit/audit-events/', async () => {
    await gw.getAuditEvents()
    expect(u('get')).toBe('/api/audit/audit-events/')
  })

  test('getAuditEventDetail(5) GET /api/audit/audit-events/5/', async () => {
    await gw.getAuditEventDetail(5)
    expect(u('get')).toBe('/api/audit/audit-events/5/')
  })

  test('getAuditEventAggregations() GET /api/audit/audit-events/aggregate/', async () => {
    await gw.getAuditEventAggregations()
    expect(u('get')).toBe('/api/audit/audit-events/aggregate/')
  })

  test('exportAuditEvents() POST /api/audit/audit-events/export/', async () => {
    await gw.exportAuditEvents({ period: 'Q01_25' })
    expect(u('post')).toBe('/api/audit/audit-events/export/')
  })

  test('getGeneralTimeline() GET /api/audit/general/', async () => {
    await gw.getGeneralTimeline()
    expect(u('get')).toBe('/api/audit/general/')
  })

  test('verifyIntegrity() GET /api/audit/integrity/ (no POST)', async () => {
    await gw.verifyIntegrity()
    expect(u('get')).toBe('/api/audit/integrity/')
    expect(api.post).not.toHaveBeenCalled()
  })

  test('getAuditLogs con filtros → params objeto', async () => {
    await gw.getAuditLogs({ user_id: 5, action: 'LOGIN' })
    expect(b('get')).toEqual(expect.objectContaining({ params: { user_id: 5, action: 'LOGIN' } }))
  })
})
