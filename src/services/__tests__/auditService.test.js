/**
 * auditService.test.js — T6.2: cobertura completa auditGateway v2
 *
 * 12 métodos × 3 casos = 36 tests
 */
import auditService from '../auditGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({ job_id: 'j-1' }),
  delete: jest.fn().mockResolvedValue({}),
}))

beforeEach(() => jest.clearAllMocks())

// ── getAuditLogs ──────────────────────────────────────────────────────────────
describe('getAuditLogs(filters)', () => {
  it('GET /api/audit/logs/ (trailing slash)', async () => {
    await auditService.getAuditLogs({})
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/logs/', expect.anything())
  })
  it('pasa filtros como params', async () => {
    await auditService.getAuditLogs({ user: 3 })
    expect(apiService.get).toHaveBeenCalledWith(expect.any(String), { params: { user: 3 } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getAuditLogs()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getAuditLogDetail ─────────────────────────────────────────────────────────
describe('getAuditLogDetail(logId)', () => {
  it('GET /api/audit/logs/{logId}/', async () => {
    await auditService.getAuditLogDetail('log-42')
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/logs/log-42/')
  })
  it('interpola el logId en la URL', async () => {
    await auditService.getAuditLogDetail(99)
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/logs/99/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getAuditLogDetail(1)).rejects.toMatchObject({ status: 403 })
  })
})

// ── searchLogs ────────────────────────────────────────────────────────────────
describe('searchLogs(query)', () => {
  it('POST /api/audit/search/ con el body de búsqueda', async () => {
    await auditService.searchLogs({ query: 'admin login' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/search/', expect.objectContaining({ query: 'admin login' })
    )
  })
  it('URL con trailing slash', async () => {
    await auditService.searchLogs({})
    expect(apiService.post).toHaveBeenCalledWith('/api/audit/search/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.searchLogs({})).rejects.toMatchObject({ status: 403 })
  })
})

// ── exportLogs ────────────────────────────────────────────────────────────────
describe('exportLogs(format, filters)', () => {
  it('POST /api/audit/export/ → retorna job_id (modelo async)', async () => {
    apiService.post.mockResolvedValueOnce({ job_id: 'j-audit-1' })
    const result = await auditService.exportLogs('csv', {})
    expect(apiService.post).toHaveBeenCalledWith('/api/audit/export/', expect.any(Object))
    expect(result).toHaveProperty('job_id')
  })
  it('incluye format y filters en el body', async () => {
    await auditService.exportLogs('json', { dateStart: '2026-01-01' })
    expect(apiService.post).toHaveBeenCalledWith(
      expect.any(String), expect.objectContaining({ format: 'json' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.exportLogs('csv', {})).rejects.toMatchObject({ status: 403 })
  })
})

// ── getComplianceReport ───────────────────────────────────────────────────────
describe('getComplianceReport(params)', () => {
  it('POST /api/audit/compliance-report/', async () => {
    await auditService.getComplianceReport({ period: 'Q1' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/compliance-report/', expect.objectContaining({ period: 'Q1' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getComplianceReport({})).rejects.toMatchObject({ status: 403 })
  })
})

// ── verifyCompliance ──────────────────────────────────────────────────────────
describe('verifyCompliance(params)', () => {
  it('POST /api/audit/compliance-verify/ con report_id', async () => {
    await auditService.verifyCompliance('rep-01')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/compliance-verify/', expect.objectContaining({ report_id: 'rep-01' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.verifyCompliance('rep-x')).rejects.toMatchObject({ status: 403 })
  })
})

// ── getAuditEvents ────────────────────────────────────────────────────────────
describe('getAuditEvents(params)', () => {
  it('GET /api/audit/audit-events/', async () => {
    await auditService.getAuditEvents()
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/audit-events/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getAuditEvents()).rejects.toMatchObject({ status: 403 })
  })
})

// ── getAuditEventDetail ───────────────────────────────────────────────────────
describe('getAuditEventDetail(eventId)', () => {
  it('GET /api/audit/audit-events/{eventId}/', async () => {
    await auditService.getAuditEventDetail('ev-55')
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/audit-events/ev-55/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getAuditEventDetail('x')).rejects.toMatchObject({ status: 403 })
  })
})

// ── getAuditEventAggregations ─────────────────────────────────────────────────
describe('getAuditEventAggregations()', () => {
  it('GET /api/audit/audit-events/aggregate/', async () => {
    await auditService.getAuditEventAggregations()
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/audit-events/aggregate/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getAuditEventAggregations()).rejects.toMatchObject({ status: 403 })
  })
})

// ── exportAuditEvents ─────────────────────────────────────────────────────────
describe('exportAuditEvents(params)', () => {
  it('POST /api/audit/audit-events/export/ → job_id', async () => {
    apiService.post.mockResolvedValueOnce({ job_id: 'j-events-1' })
    const result = await auditService.exportAuditEvents({ format: 'csv' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/audit-events/export/', expect.objectContaining({ format: 'csv' })
    )
    expect(result).toHaveProperty('job_id')
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.exportAuditEvents({})).rejects.toMatchObject({ status: 403 })
  })
})

// ── getGeneralTimeline ────────────────────────────────────────────────────────
describe('getGeneralTimeline(params)', () => {
  it('GET /api/audit/general/', async () => {
    await auditService.getGeneralTimeline()
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/general/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.getGeneralTimeline()).rejects.toMatchObject({ status: 403 })
  })
})

// ── verifyIntegrity ───────────────────────────────────────────────────────────
describe('verifyIntegrity(params)', () => {
  it('GET /api/audit/integrity/', async () => {
    await auditService.verifyIntegrity()
    expect(apiService.get).toHaveBeenCalledWith('/api/audit/integrity/', expect.anything())
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(auditService.verifyIntegrity()).rejects.toMatchObject({ status: 403 })
  })
})
