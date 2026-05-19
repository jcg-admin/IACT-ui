/**
 * T2.4 — logsGateway.js: métodos faltantes.
 *   getPipelineIVRHealth()    → GET  /api/pipeline/ivr-health/
 *   getLogExportJobs()        → GET  /api/logs/export/
 *   enqueueLogExport(params)  → POST /api/logs/export/
 *   getPipelineLogEvents()    → GET  /api/logs/pipeline-events/
 */

jest.mock('../../src/services/apiClient', () => ({
  get:  jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({ job_id: 'lg-1' }),
}))

const api = require('../../src/services/apiClient')
const u = (m) => api[m].mock.calls[0]?.[0] ?? null

describe('logsGateway — métodos extendidos (T2.4)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/logsGateway').default })

  test('getPipelineIVRHealth() GET /api/pipeline/ivr-health/', async () => {
    await gw.getPipelineIVRHealth()
    expect(u('get')).toBe('/api/pipeline/ivr-health/')
  })

  test('getLogExportJobs() GET /api/logs/export/', async () => {
    await gw.getLogExportJobs()
    expect(u('get')).toBe('/api/logs/export/')
  })

  test('enqueueLogExport(params) POST /api/logs/export/', async () => {
    const result = await gw.enqueueLogExport({ format: 'csv', level: 'ERROR' })
    expect(u('post')).toBe('/api/logs/export/')
    expect(result.job_id).toBe('lg-1')
  })

  test('getPipelineLogEvents() GET /api/logs/pipeline-events/', async () => {
    await gw.getPipelineLogEvents()
    expect(u('get')).toBe('/api/logs/pipeline-events/')
  })

  // Verificar que los métodos existentes siguen funcionando
  test('getPipelineStatus() GET /api/pipeline/status/ — sin cambios', async () => {
    await gw.getPipelineStatus()
    expect(u('get')).toBe('/api/pipeline/status/')
  })

  test('getPipelineErrors() GET /api/pipeline/errors/ — sin cambios', async () => {
    await gw.getPipelineErrors()
    expect(u('get')).toBe('/api/pipeline/errors/')
  })
})
