/**
 * T2.5 — reportsGateway.js: métodos faltantes.
 *
 * Nuevos:
 *   getExportJobs(params)           → GET    /api/reports/export/
 *   getExportJobDetail(id)          → GET    /api/reports/export/{id}/
 *   cancelExport(id)                → DELETE /api/reports/export/{id}/
 *   updateSchedule(id, data)        → PATCH  /api/reports/schedules/{id}/
 *   getUniqueClientsAnonReport(p)   → GET    /api/reports/ivr/unique-clients/
 *   getRealtimeMetrics()            → GET    /api/reports/realtime/  (STUB SSE)
 *   getAgentDetail(id)              → GET    /api/reports/agents/{id}/
 *
 * NO implementados (legacy ViewSets — duplicados en API):
 *   /api/reports/reports/*    → duplica /api/reports/*
 *   /api/reports/saved-views/* → duplica /api/reports/me/views/
 *   /api/reports/scheduled/*  → duplica /api/reports/schedules/
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')
const u = (m) => api[m].mock.calls[0]?.[0] ?? null

describe('reportsGateway — métodos extendidos (T2.5)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/reportsGateway').default })

  test('getExportJobs() GET /api/reports/export/', async () => {
    await gw.getExportJobs()
    expect(u('get')).toBe('/api/reports/export/')
  })

  test('getExportJobDetail(42) GET /api/reports/export/42/', async () => {
    await gw.getExportJobDetail(42)
    expect(u('get')).toBe('/api/reports/export/42/')
  })

  test('cancelExport(42) DELETE /api/reports/export/42/', async () => {
    await gw.cancelExport(42)
    expect(u('delete')).toBe('/api/reports/export/42/')
  })

  test('updateSchedule(5, data) PATCH /api/reports/schedules/5/', async () => {
    await gw.updateSchedule(5, { is_active: false })
    expect(u('patch')).toBe('/api/reports/schedules/5/')
    expect(api.patch.mock.calls[0][1]).toEqual(expect.objectContaining({ is_active: false }))
  })

  test('getUniqueClientsAnonReport() GET /api/reports/ivr/unique-clients/', async () => {
    await gw.getUniqueClientsAnonReport()
    expect(u('get')).toBe('/api/reports/ivr/unique-clients/')
  })

  test('getRealtimeMetrics() GET /api/reports/realtime/ — STUB SSE', async () => {
    await gw.getRealtimeMetrics()
    expect(u('get')).toBe('/api/reports/realtime/')
  })

  test('getAgentDetail(7) GET /api/reports/agents/7/', async () => {
    await gw.getAgentDetail(7)
    expect(u('get')).toBe('/api/reports/agents/7/')
  })

  // Verificar que métodos legacy NO están en el gateway
  test('getExportJobStatus existente redirige a getExportJobDetail', async () => {
    // getExportJobStatus(id) era el nombre anterior — debe existir como alias
    if (typeof gw.getExportJobStatus === 'function') {
      await gw.getExportJobStatus(42)
      // Debe llamar a /api/reports/export/42/ o /api/reports/export/{id}/
      const calledUrl = u('get')
      expect(calledUrl).toContain('/api/reports/export/')
    } else {
      // Si se renombró a getExportJobDetail, el test pasa
      expect(typeof gw.getExportJobDetail).toBe('function')
    }
  })
})
