/**
 * T2.1 — alertsGateway.js:
 *   - 7 URLs incorrectas corregidas
 *   - 6 métodos sin endpoint eliminados
 *   - 8 métodos nuevos añadidos
 *
 * URLs canónicas verificadas en schema OpenAPI IACT-api (Errors: 0).
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  put:    jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')
const u = (m) => api[m].mock.calls[0]?.[0] ?? null

describe('alertsGateway — URLs corregidas (T2.1)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/alertsGateway').default })

  // ── Métodos corregidos ──────────────────────────────────────────────────
  test('getAlerts() → GET /api/alerts/active/ (no /api/alerts/)', async () => {
    await gw.getAlerts()
    expect(u('get')).toBe('/api/alerts/active/')
  })

  test('updateAlert() → PATCH /api/alerts/rules/{id}/ (no PUT)', async () => {
    await gw.updateAlert(5, { threshold: 10 })
    expect(u('patch')).toBe('/api/alerts/rules/5/')
    expect(api.put).not.toHaveBeenCalled()
  })

  test('acknowledgeAlert() → POST /api/alerts/{id}/acknowledge/ (no /ack/)', async () => {
    await gw.acknowledgeAlert(7, 'nota')
    expect(u('post')).toBe('/api/alerts/7/acknowledge/')
    expect(u('post')).not.toContain('/ack/')
  })

  test('bulkAcknowledgeAlerts() → POST /api/alerts/bulk-acknowledge/ (no /bulk-ack/)', async () => {
    await gw.bulkAcknowledgeAlerts([1, 2])
    expect(u('post')).toBe('/api/alerts/bulk-acknowledge/')
    // bulk-acknowledge contiene 'bulk-ack' como substring — verificar URL completa
    expect(u('post')).toBe('/api/alerts/bulk-acknowledge/')
  })

  test('subscribeToAlert() → POST /api/alerts/me/subscriptions/ (no /subscriptions/)', async () => {
    await gw.subscribeToAlert({ rule_id: 1 })
    expect(u('post')).toBe('/api/alerts/me/subscriptions/')
  })

  test('unsubscribeFromAlert() → DELETE /api/alerts/me/subscriptions/{id}/', async () => {
    await gw.unsubscribeFromAlert(3)
    expect(u('delete')).toBe('/api/alerts/me/subscriptions/3/')
  })

  test('getMySubscriptions() → GET /api/alerts/me/subscriptions/ (no /subscriptions/me/)', async () => {
    await gw.getMySubscriptions()
    expect(u('get')).toBe('/api/alerts/me/subscriptions/')
    expect(u('get')).not.toContain('/subscriptions/me/')
  })

  // ── Métodos eliminados (no deben existir) ───────────────────────────────
  test('getTemplates() no existe — endpoint ausente en API', () => {
    expect(typeof gw.getTemplates).toBe('undefined')
  })
  test('getTemplateById() no existe — endpoint ausente en API', () => {
    expect(typeof gw.getTemplateById).toBe('undefined')
  })
  test('updateSubscriptionPreferences() no existe — endpoint ausente en API', () => {
    expect(typeof gw.updateSubscriptionPreferences).toBe('undefined')
  })
  test('exportAlertHistory() no existe — endpoint ausente en API', () => {
    expect(typeof gw.exportAlertHistory).toBe('undefined')
  })
  test('validateCondition() no existe — endpoint ausente en API', () => {
    expect(typeof gw.validateCondition).toBe('undefined')
  })
  test('getAvailableMetrics() no existe — endpoint ausente en API', () => {
    expect(typeof gw.getAvailableMetrics).toBe('undefined')
  })

  // ── Métodos nuevos ──────────────────────────────────────────────────────
  test('getActiveAlerts() GET /api/alerts/active/', async () => {
    await gw.getActiveAlerts()
    expect(u('get')).toBe('/api/alerts/active/')
  })

  test('getAlertRules() GET /api/alerts/rules/', async () => {
    await gw.getAlertRules()
    expect(u('get')).toBe('/api/alerts/rules/')
  })

  test('getAlertRuleDetail(9) GET /api/alerts/rules/9/', async () => {
    await gw.getAlertRuleDetail(9)
    expect(u('get')).toBe('/api/alerts/rules/9/')
  })

  test('dryRunAlertRule(cfg) POST /api/alerts/rules/dry-run/', async () => {
    await gw.dryRunAlertRule({ condition: 'cpu > 80' })
    expect(u('post')).toBe('/api/alerts/rules/dry-run/')
  })

  test('pauseAlertRule(9) POST /api/alerts/rules/9/pause/', async () => {
    await gw.pauseAlertRule(9)
    expect(u('post')).toBe('/api/alerts/rules/9/pause/')
  })

  test('resumeAlertRule(9) POST /api/alerts/rules/9/resume/', async () => {
    await gw.resumeAlertRule(9)
    expect(u('post')).toBe('/api/alerts/rules/9/resume/')
  })

  test('createSubscription(data) POST /api/alerts/me/subscriptions/', async () => {
    await gw.createSubscription({ rule_id: 1, severity: 'HIGH' })
    expect(u('post')).toBe('/api/alerts/me/subscriptions/')
  })

  test('cancelSubscription(3) DELETE /api/alerts/me/subscriptions/3/', async () => {
    await gw.cancelSubscription(3)
    expect(u('delete')).toBe('/api/alerts/me/subscriptions/3/')
  })
})
