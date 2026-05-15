/**
 * TDD — reportsGateway URLs canónicas IACT-api v2.
 */

jest.mock('../../src/services/apiClient', () => ({
  get:  jest.fn().mockResolvedValue({}),
  post: jest.fn().mockResolvedValue({}),
}))

const apiService = require('../../src/services/apiClient')

describe('reportsGateway — URLs canónicas IACT-api v2', () => {
  let svc
  beforeEach(() => { jest.clearAllMocks(); svc = require('../../src/services/reportsGateway').default })

  test('getDashboardMetrics() GET /api/reports/dashboard/ (no /api/reports/metrics/dashboard/)', async () => {
    await svc.getDashboardMetrics()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/dashboard/')
  })

  test('getReportHistory() GET /api/reports/historical/ (no /api/reports/history/)', async () => {
    await svc.getReportHistory()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/historical/', expect.anything())
  })

  test('getTransfersReport() GET /api/reports/ivr/transfer-centers/ (no /api/reports/transfers/)', async () => {
    await svc.getTransfersReport()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/ivr/transfer-centers/', expect.anything())
  })

  test('getUniqueClientsReport() GET /api/reports/ivr/clients/ (no /api/reports/unique-clients/)', async () => {
    await svc.getUniqueClientsReport()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/ivr/clients/', expect.anything())
  })

  test('getIVRMenusReport() GET /api/reports/ivr/menus/ (no /api/reports/ivr-menus/)', async () => {
    await svc.getIVRMenusReport()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/ivr/menus/', expect.anything())
  })

  test('getSavedViews() GET /api/reports/me/views/ (no /api/reports/saved-views/)', async () => {
    await svc.getSavedViews()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/me/views/', expect.anything())
  })

  test('getScheduledReports() GET /api/reports/schedules/ (no /api/reports/scheduled/)', async () => {
    await svc.getScheduledReports()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/schedules/', expect.anything())
  })

  test('getSLADistribucion() GET /api/reports/ivr/sla/ (nuevo)', async () => {
    await svc.getSLADistribucion()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/ivr/sla/', expect.anything())
  })
})
