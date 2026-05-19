/**
 * logsGateway.integration.test.js
 * TDD — URLs canónicas IACT-api v2 para el dominio logs/pipeline.
 *
 * Cambios:
 *   getLogs()           → GET /api/logs/django/tail/     (era /api/logs/)
 *   getETLLogs()        → GET /api/logs/etl/tail/        (era /api/logs/etl/)
 *   getSystemStatus()   → GET /api/logs/health/          (era /api/system/status/)
 *   getPerformanceMetrics() → GET /api/logs/metrics/     (era /api/system/metrics/)
 *   getPipelineStatus() → GET /api/pipeline/status/      (era /api/v1/etl/supervision/)
 *   getPipelineErrors() → GET /api/pipeline/errors/      (era /api/v1/etl/errores/)
 *   getETLAvailability()→ GET /api/pipeline/data-availability/ (era /api/v1/datos/disponibilidad/)
 *   retryPipeline()     → POST /api/pipeline/retry/      (era /api/etl/logs/{id}/retry/)
 */

jest.mock('../../src/services/apiClient', () => ({
  get:  jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({}),
}))

const apiService = require('../../src/services/apiClient')

describe('logsGateway — URLs canónicas IACT-api v2', () => {
  let logsGateway
  beforeEach(() => {
    jest.clearAllMocks()
    logsGateway = require('../../src/services/logsGateway').default
  })

  test('getLogs() GET /api/logs/django/tail/ (no /api/logs/)', async () => {
    await logsGateway.getLogs()
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/django/tail/', expect.anything())
  })

  test('getETLLogs() GET /api/logs/etl/tail/ (no /api/logs/etl/)', async () => {
    await logsGateway.getETLLogs()
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/etl/tail/', expect.anything())
  })

  test('getSystemStatus() GET /api/logs/health/ (no /api/system/status/)', async () => {
    await logsGateway.getSystemStatus()
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/health/')
  })

  test('getPerformanceMetrics() GET /api/logs/metrics/ (no /api/system/metrics/)', async () => {
    await logsGateway.getPerformanceMetrics()
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/metrics/', expect.anything())
  })

  test('getPipelineStatus() GET /api/pipeline/status/ (no /api/v1/etl/supervision/)', async () => {
    await logsGateway.getPipelineStatus()
    expect(apiService.get).toHaveBeenCalledWith('/api/pipeline/status/')
  })

  test('getPipelineErrors() GET /api/pipeline/errors/ (no /api/v1/etl/errores/)', async () => {
    await logsGateway.getPipelineErrors()
    expect(apiService.get).toHaveBeenCalledWith('/api/pipeline/errors/', expect.anything())
  })

  test('getETLAvailability() GET /api/pipeline/data-availability/ (no /api/v1/datos/disponibilidad/)', async () => {
    await logsGateway.getETLAvailability()
    expect(apiService.get).toHaveBeenCalledWith('/api/pipeline/data-availability/', expect.anything())
  })

  test('retryPipeline() POST /api/pipeline/retry/ (no /api/etl/logs/{id}/retry/)', async () => {
    await logsGateway.retryPipeline({ logId: '123', motivo: 'test' })
    const [url] = apiService.post.mock.calls[0]
    expect(url).toBe('/api/pipeline/retry/')
  })
})
