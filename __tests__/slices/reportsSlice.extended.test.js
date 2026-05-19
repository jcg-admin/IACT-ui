/**
 * T3.6 — reports.slice sincronizado con reportsGateway v2 (T2.5).
 *
 * Tests para los 12 thunks añadidos:
 *   fetchExportJobs, fetchExportJobDetail, cancelExport, updateSchedule,
 *   fetchUniqueClientsAnon, fetchRealtimeMetrics, fetchAgentDetail,
 *   createSavedView, updateSavedView, cloneSavedView,
 *   fetchSavedViewDetail, fetchDashboardData
 */
jest.mock('../../src/services/reportsGateway', () => ({
  __esModule: true,
  default: {
    getDashboardMetrics:          jest.fn().mockResolvedValue({}),
    getScheduledReports:          jest.fn().mockResolvedValue([]),
    getScheduledDetail:           jest.fn().mockResolvedValue({}),
    createShare:                  jest.fn().mockResolvedValue({}),
    getReportHistory:             jest.fn().mockResolvedValue([]),
    scheduleReport:               jest.fn().mockResolvedValue({}),
    pauseSchedule:                jest.fn().mockResolvedValue({}),
    resumeSchedule:               jest.fn().mockResolvedValue({}),
    deleteSchedule:               jest.fn().mockResolvedValue({}),
    runScheduleNow:               jest.fn().mockResolvedValue({}),
    getScheduleHistory:           jest.fn().mockResolvedValue([]),
    getSavedViews:                jest.fn().mockResolvedValue([]),
    deleteSavedView:              jest.fn().mockResolvedValue({}),
    // T2.5 nuevos
    getExportJobs:                jest.fn().mockResolvedValue([]),
    getExportJobDetail:           jest.fn().mockResolvedValue({ id: 42, status: 'DONE' }),
    cancelExport:                 jest.fn().mockResolvedValue({}),
    updateSchedule:               jest.fn().mockResolvedValue({ id: 5 }),
    getUniqueClientsAnonReport:   jest.fn().mockResolvedValue([]),
    getRealtimeMetrics:           jest.fn().mockResolvedValue({ active: 10 }),
    getAgentDetail:               jest.fn().mockResolvedValue({ id: 7, name: 'Ana' }),
    createSavedView:              jest.fn().mockResolvedValue({ id: 99 }),
    updateSavedView:              jest.fn().mockResolvedValue({ id: 99 }),
    cloneSavedView:               jest.fn().mockResolvedValue({ id: 100 }),
    getSavedViewDetail:           jest.fn().mockResolvedValue({ id: 99 }),
  },
}))

const gw = require('../../src/services/reportsGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const reportsModule = require('../../src/redux/slices/reports')
const reducer = reportsModule.default

function makeStore() {
  return configureStore({
    reducer: { reports: reducer },
    middleware: (g) => g({ serializableCheck: false }),
  })
}

describe('reports.slice — thunks T2.5 (T3.6)', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchExportJobs() → reportsService.getExportJobs()', async () => {
    await store.dispatch(reportsModule.fetchExportJobs())
    expect(gw.getExportJobs).toHaveBeenCalled()
  })

  test('fetchExportJobDetail(42) → reportsService.getExportJobDetail(42)', async () => {
    await store.dispatch(reportsModule.fetchExportJobDetail(42))
    expect(gw.getExportJobDetail).toHaveBeenCalledWith(42)
  })

  test('cancelExport(42) → reportsService.cancelExport(42)', async () => {
    await store.dispatch(reportsModule.cancelExport(42))
    expect(gw.cancelExport).toHaveBeenCalledWith(42)
  })

  test('updateSchedule({id:5, data}) → reportsService.updateSchedule(5, data)', async () => {
    await store.dispatch(reportsModule.updateSchedule({ id: 5, data: { is_active: false } }))
    expect(gw.updateSchedule).toHaveBeenCalledWith(5, { is_active: false })
  })

  test('fetchUniqueClientsAnon() → reportsService.getUniqueClientsAnonReport()', async () => {
    await store.dispatch(reportsModule.fetchUniqueClientsAnon())
    expect(gw.getUniqueClientsAnonReport).toHaveBeenCalled()
  })

  test('fetchRealtimeMetrics() → reportsService.getRealtimeMetrics()', async () => {
    await store.dispatch(reportsModule.fetchRealtimeMetrics())
    expect(gw.getRealtimeMetrics).toHaveBeenCalled()
  })

  test('fetchAgentDetail(7) → reportsService.getAgentDetail(7)', async () => {
    await store.dispatch(reportsModule.fetchAgentDetail(7))
    expect(gw.getAgentDetail).toHaveBeenCalledWith(7)
  })

  test('createSavedView(data) → reportsService.createSavedView(data)', async () => {
    await store.dispatch(reportsModule.createSavedView({ name: 'Vista Q1' }))
    expect(gw.createSavedView).toHaveBeenCalledWith({ name: 'Vista Q1' })
  })

  test('updateSavedView({id,data}) → reportsService.updateSavedView(id, data)', async () => {
    await store.dispatch(reportsModule.updateSavedView({ id: 99, data: { name: 'Nuevo' } }))
    expect(gw.updateSavedView).toHaveBeenCalledWith(99, { name: 'Nuevo' })
  })

  test('cloneSavedView(99) → reportsService.cloneSavedView(99)', async () => {
    await store.dispatch(reportsModule.cloneSavedView(99))
    expect(gw.cloneSavedView).toHaveBeenCalledWith(99)
  })

  test('fetchSavedViewDetail(99) → reportsService.getSavedViewDetail(99)', async () => {
    await store.dispatch(reportsModule.fetchSavedViewDetail(99))
    expect(gw.getSavedViewDetail).toHaveBeenCalledWith(99)
  })

  test('fetchDashboardData(params) → reportsService.getDashboardMetrics()', async () => {
    await store.dispatch(reportsModule.fetchDashboardData({ period: 'Q1_25' }))
    expect(gw.getDashboardMetrics).toHaveBeenCalled()
  })

  test('initialState incluye exportJobs[], exportJobDetail, realtimeMetrics, agentDetail', () => {
    const s = store.getState().reports
    expect(Array.isArray(s.exportJobs)).toBe(true)
    expect(s.exportJobDetail).toBe(null)
    expect(s.realtimeMetrics).toBe(null)
    expect(s.agentDetail).toBe(null)
    expect(s.savedViewDetail).toBe(null)
    expect(Array.isArray(s.uniqueClientsAnon)).toBe(true)
  })
})
