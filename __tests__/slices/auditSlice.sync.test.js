/**
 * T3.3 — audit.slice sincronizado con auditGateway v2.
 */
jest.mock('../../src/services/auditGateway', () => ({
  __esModule: true,
  default: {
    getAuditLogs:              jest.fn().mockResolvedValue([]),
    getAuditLogDetail:         jest.fn().mockResolvedValue({}),
    searchLogs:                jest.fn().mockResolvedValue([]),
    exportLogs:                jest.fn().mockResolvedValue({ job_id: 'lg-1' }),
    getComplianceReport:       jest.fn().mockResolvedValue({}),
    verifyCompliance:          jest.fn().mockResolvedValue({}),
    getAuditEvents:            jest.fn().mockResolvedValue([]),
    getAuditEventDetail:       jest.fn().mockResolvedValue({}),
    getAuditEventAggregations: jest.fn().mockResolvedValue({}),
    exportAuditEvents:         jest.fn().mockResolvedValue({ job_id: 'ev-1' }),
    getGeneralTimeline:        jest.fn().mockResolvedValue([]),
    verifyIntegrity:           jest.fn().mockResolvedValue({}),
  },
}))

const gw = require('../../src/services/auditGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const auditModule = require('../../src/redux/slices/audit')
const reducer = auditModule.default

function makeStore() {
  return configureStore({ reducer: { audit: reducer }, middleware: (g) => g({ serializableCheck: false }) })
}

describe('audit.slice — sincronización T3.3', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchAuditSummary no existe — getAuditSummary eliminado en T1.6', () => {
    expect(auditModule.fetchAuditSummary).toBeUndefined()
  })
  test('fetchLoginHistory no existe — getLogsByUser eliminado en T1.6', () => {
    expect(auditModule.fetchLoginHistory).toBeUndefined()
  })
  test('fetchAuditLogDetail(42) → auditService.getAuditLogDetail(42)', async () => {
    await store.dispatch(auditModule.fetchAuditLogDetail(42))
    expect(gw.getAuditLogDetail).toHaveBeenCalledWith(42)
  })
  test('exportAuditLogs({format,filters}) → auditService.exportLogs()', async () => {
    await store.dispatch(auditModule.exportAuditLogs({ format: 'csv', filters: {} }))
    expect(gw.exportLogs).toHaveBeenCalled()
  })
  test('verifyCompliance(id) → auditService.verifyCompliance()', async () => {
    await store.dispatch(auditModule.verifyCompliance('report-1'))
    expect(gw.verifyCompliance).toHaveBeenCalledWith('report-1')
  })
  test('fetchAuditEvents(params) → auditService.getAuditEvents()', async () => {
    await store.dispatch(auditModule.fetchAuditEvents({ limit: 10 }))
    expect(gw.getAuditEvents).toHaveBeenCalled()
  })
  test('fetchAuditEventDetail(5) → auditService.getAuditEventDetail(5)', async () => {
    await store.dispatch(auditModule.fetchAuditEventDetail(5))
    expect(gw.getAuditEventDetail).toHaveBeenCalledWith(5)
  })
  test('fetchAuditEventAggregations(p) → auditService.getAuditEventAggregations()', async () => {
    await store.dispatch(auditModule.fetchAuditEventAggregations({}))
    expect(gw.getAuditEventAggregations).toHaveBeenCalled()
  })
  test('exportAuditEvents(f) → auditService.exportAuditEvents()', async () => {
    await store.dispatch(auditModule.exportAuditEvents({ period: 'Q01_25' }))
    expect(gw.exportAuditEvents).toHaveBeenCalled()
  })
  test('fetchGeneralTimeline(p) → auditService.getGeneralTimeline()', async () => {
    await store.dispatch(auditModule.fetchGeneralTimeline({}))
    expect(gw.getGeneralTimeline).toHaveBeenCalled()
  })
  test('fetchAuditIntegrity() → auditService.verifyIntegrity()', async () => {
    await store.dispatch(auditModule.fetchAuditIntegrity())
    expect(gw.verifyIntegrity).toHaveBeenCalled()
  })
  test('initialState incluye logDetail, auditEvents, generalTimeline, integrityResult', () => {
    const s = store.getState().audit
    expect(s.logDetail).toBe(null)
    expect(Array.isArray(s.auditEvents)).toBe(true)
    expect(Array.isArray(s.generalTimeline)).toBe(true)
    expect(s.integrityResult).toBe(null)
  })
})
