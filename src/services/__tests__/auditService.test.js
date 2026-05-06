import auditService from '../auditService'

function mockFetch(data, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
  })
}

beforeEach(() => {
  localStorage.setItem('accessToken', 'test-token')
})

afterEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

describe('auditService.getAuditLogs', () => {
  it('calls /audit/logs endpoint', async () => {
    mockFetch([{ id: 1, action: 'LOGIN' }])
    const result = await auditService.getAuditLogs({})
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/audit/logs'),
      expect.any(Object)
    )
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('auditService.searchLogs', () => {
  it('calls /audit/search endpoint', async () => {
    mockFetch([])
    await auditService.searchLogs({ query: 'admin' })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/audit/search'),
      expect.any(Object)
    )
  })
})

describe('auditService.getComplianceReport', () => {
  it('calls /audit/compliance endpoint', async () => {
    mockFetch({ summary: {}, violations: [] })
    await auditService.getComplianceReport({})
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/audit/compliance'),
      expect.any(Object)
    )
  })
})
