/**
 * auditService.test.js — actualizado para auditGateway v2 (apiService, no fetch)
 */
import auditService from '../auditGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  get:  jest.fn().mockResolvedValue([]),
  post: jest.fn().mockResolvedValue({ job_id: 'j-1' }),
}))

beforeEach(() => { jest.clearAllMocks() })

describe('auditService.getAuditLogs', () => {
  it('calls GET /api/audit/logs/ (no /audit/logs)', async () => {
    await auditService.getAuditLogs({})
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/audit/logs/', expect.anything()
    )
  })
})

describe('auditService.searchLogs', () => {
  it('calls POST /api/audit/search/ (no /audit/search)', async () => {
    await auditService.searchLogs({ query: 'admin' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/search/', expect.any(Object)
    )
  })
})

describe('auditService.getComplianceReport', () => {
  it('calls POST /api/audit/compliance-report/ (no GET /audit/compliance)', async () => {
    await auditService.getComplianceReport({})
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/compliance-report/', expect.anything()
    )
    expect(apiService.get).not.toHaveBeenCalled()
  })
})

describe('auditService.exportLogs', () => {
  it('calls POST /api/audit/export/ y retorna job_id (no blob)', async () => {
    const result = await auditService.exportLogs('csv', {})
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/audit/export/', expect.objectContaining({ format: 'csv' })
    )
    expect(result.job_id).toBe('j-1')
  })
})

describe('auditService.verifyIntegrity', () => {
  it('calls GET /api/audit/integrity/ (no POST /audit/validate-integrity)', async () => {
    await auditService.verifyIntegrity()
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/audit/integrity/', expect.anything()
    )
    expect(apiService.post).not.toHaveBeenCalled()
  })
})
