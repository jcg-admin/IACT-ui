/**
 * T3.1 — alerts.slice sincronizado con alertsGateway v2.
 */
jest.mock('../../src/services/alertsGateway', () => ({
  __esModule: true,
  default: {
    getAlerts:             jest.fn().mockResolvedValue([]),
    getActiveAlerts:       jest.fn().mockResolvedValue([]),
    getAlertRules:         jest.fn().mockResolvedValue([]),
    getAlertRuleDetail:    jest.fn().mockResolvedValue({}),
    createAlert:           jest.fn().mockResolvedValue({ id: 1 }),
    updateAlert:           jest.fn().mockResolvedValue({}),
    deleteAlert:           jest.fn().mockResolvedValue({}),
    dryRunAlertRule:       jest.fn().mockResolvedValue({}),
    pauseAlertRule:        jest.fn().mockResolvedValue({}),
    resumeAlertRule:       jest.fn().mockResolvedValue({}),
    getAlertHistory:       jest.fn().mockResolvedValue([]),
    getMySubscriptions:    jest.fn().mockResolvedValue([]),
    subscribeToAlert:      jest.fn().mockResolvedValue({ id: 1 }),
    createSubscription:    jest.fn().mockResolvedValue({ id: 1 }),
    unsubscribeFromAlert:  jest.fn().mockResolvedValue({}),
    cancelSubscription:    jest.fn().mockResolvedValue({}),
    acknowledgeAlert:      jest.fn().mockResolvedValue({}),
    bulkAcknowledgeAlerts: jest.fn().mockResolvedValue({}),
  },
}))

const gw = require('../../src/services/alertsGateway').default
const { configureStore } = require('@reduxjs/toolkit')
const alertsModule = require('../../src/redux/slices/alerts')
const reducer = alertsModule.default

function makeStore() {
  return configureStore({
    reducer: { alerts: reducer },
    middleware: (g) => g({ serializableCheck: false }),
  })
}

describe('alerts.slice — sincronización T3.1', () => {
  let store
  beforeEach(() => { jest.clearAllMocks(); store = makeStore() })

  test('fetchTemplates no existe — getTemplates eliminado en T2.1', () => {
    expect(alertsModule.fetchTemplates).toBeUndefined()
  })
  test('fetchActiveAlerts → alertsGateway.getActiveAlerts()', async () => {
    await store.dispatch(alertsModule.fetchActiveAlerts())
    expect(gw.getActiveAlerts).toHaveBeenCalled()
  })
  test('fetchAlertRules → alertsGateway.getAlertRules()', async () => {
    await store.dispatch(alertsModule.fetchAlertRules())
    expect(gw.getAlertRules).toHaveBeenCalled()
  })
  test('fetchAlertRuleDetail(9) → alertsGateway.getAlertRuleDetail(9)', async () => {
    await store.dispatch(alertsModule.fetchAlertRuleDetail(9))
    expect(gw.getAlertRuleDetail).toHaveBeenCalledWith(9)
  })
  test('dryRunAlertRule(cfg) → alertsGateway.dryRunAlertRule(cfg)', async () => {
    const cfg = { condition: 'cpu > 80' }
    await store.dispatch(alertsModule.dryRunAlertRule(cfg))
    expect(gw.dryRunAlertRule).toHaveBeenCalledWith(cfg)
  })
  test('pauseAlertRule(9) → alertsGateway.pauseAlertRule(9)', async () => {
    await store.dispatch(alertsModule.pauseAlertRule(9))
    expect(gw.pauseAlertRule).toHaveBeenCalledWith(9)
  })
  test('resumeAlertRule(9) → alertsGateway.resumeAlertRule(9)', async () => {
    await store.dispatch(alertsModule.resumeAlertRule(9))
    expect(gw.resumeAlertRule).toHaveBeenCalledWith(9)
  })
  test('bulkAcknowledgeAlerts([1,2]) → alertsGateway.bulkAcknowledgeAlerts', async () => {
    await store.dispatch(alertsModule.bulkAcknowledgeAlerts([1, 2]))
    expect(gw.bulkAcknowledgeAlerts).toHaveBeenCalledWith([1, 2])
  })
  test('createSubscription(data) → alertsGateway.createSubscription', async () => {
    await store.dispatch(alertsModule.createSubscription({ rule_id: 1 }))
    expect(gw.createSubscription).toHaveBeenCalledWith({ rule_id: 1 })
  })
  test('cancelSubscription(3) → alertsGateway.cancelSubscription(3)', async () => {
    await store.dispatch(alertsModule.cancelSubscription(3))
    expect(gw.cancelSubscription).toHaveBeenCalledWith(3)
  })
  test('estado inicial incluye activeAlerts[], alertRules[], alertRuleDetail:null', () => {
    const s = store.getState().alerts
    expect(Array.isArray(s.activeAlerts)).toBe(true)
    expect(Array.isArray(s.alertRules)).toBe(true)
    expect(s.alertRuleDetail).toBe(null)
  })
})
