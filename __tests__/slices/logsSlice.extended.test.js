jest.mock('../../src/services/logsGateway', () => ({
  __esModule: true,
  default: {
    getLogs: jest.fn().mockResolvedValue([]),
    getETLLogs: jest.fn().mockResolvedValue([]),
    searchLogs: jest.fn().mockResolvedValue([]),
    exportLogs: jest.fn().mockResolvedValue({}),
    getInfraLogs: jest.fn().mockResolvedValue([]),
    getSystemStatus: jest.fn().mockResolvedValue({}),
    getPerformanceMetrics: jest.fn().mockResolvedValue({}),
    getPipelineStatus: jest.fn().mockResolvedValue({}),
    getPipelineErrors: jest.fn().mockResolvedValue([]),
    getETLAvailability: jest.fn().mockResolvedValue([]),
    retryPipeline: jest.fn().mockResolvedValue({}),
    getPipelinePerformance: jest.fn().mockResolvedValue({}),
    getPipelineEvents: jest.fn().mockResolvedValue([]),
    getJobConfig: jest.fn().mockResolvedValue({}),
    updateJobConfig: jest.fn().mockResolvedValue({}),
    getMonitorWeekdays: jest.fn().mockResolvedValue([]),
    getPipelineIVRHealth: jest.fn().mockResolvedValue({}),
    getLogExportJobs: jest.fn().mockResolvedValue([]),
    enqueueLogExport: jest.fn().mockResolvedValue({ job_id: 'lg-1' }),
    getPipelineLogEvents: jest.fn().mockResolvedValue([]),
  },
}))

const gw = require('../../src/services/logsGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const logsModule = require('../../src/redux/slices/logs')

function makeStore() {
  return configureStore({ reducer: { logs: logsModule.default }, middleware: (g) => g({ serializableCheck: false }) })
}

describe('logs.slice — thunks T2.4 (T3.6)', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchPipelineIVRHealth → logsService.getPipelineIVRHealth()', async () => {
    await store.dispatch(logsModule.fetchPipelineIVRHealth())
    expect(gw.getPipelineIVRHealth).toHaveBeenCalled()
  })
  test('fetchLogExportJobs(params) → logsService.getLogExportJobs()', async () => {
    await store.dispatch(logsModule.fetchLogExportJobs({ limit: 10 }))
    expect(gw.getLogExportJobs).toHaveBeenCalled()
  })
  test('enqueueLogExport(params) → logsService.enqueueLogExport()', async () => {
    await store.dispatch(logsModule.enqueueLogExport({ format: 'csv' }))
    expect(gw.enqueueLogExport).toHaveBeenCalled()
  })
  test('fetchPipelineLogEvents(params) → logsService.getPipelineLogEvents()', async () => {
    await store.dispatch(logsModule.fetchPipelineLogEvents({ limit: 50 }))
    expect(gw.getPipelineLogEvents).toHaveBeenCalled()
  })
})
