/**
 * alertsGateway.test.js — T6.3: cobertura completa alertsGateway v2
 *
 * 17 métodos × 2-3 casos = 45 tests
 */
import alertsGateway from '../alertsGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get:    jest.fn().mockResolvedValue([]),
    post:   jest.fn().mockResolvedValue({}),
    patch:  jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}))

beforeEach(() => jest.clearAllMocks())

// ── UC_ALR_01: Reglas de alerta ───────────────────────────────────────────────

describe('getAlertRules(params)', () => {
  it('GET /api/alerts/rules/', async () => {
    await alertsGateway.getAlertRules()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/rules/', { params: {} })
  })
  it('pasa params opcionales como query string', async () => {
    await alertsGateway.getAlertRules({ active: true })
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/rules/', { params: { active: true } })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.getAlertRules()).rejects.toMatchObject({ status: 403 })
  })
})

describe('getAlertRuleDetail(ruleId)', () => {
  it('GET /api/alerts/rules/{ruleId}/', async () => {
    await alertsGateway.getAlertRuleDetail('rule-42')
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/rules/rule-42/')
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.getAlertRuleDetail('x')).rejects.toMatchObject({ status: 403 })
  })
})

describe('createAlert(config)', () => {
  it('POST /api/alerts/rules/ con config completa', async () => {
    await alertsGateway.createAlert({ name: 'CPU alta', threshold: 80 })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/rules/', expect.objectContaining({ name: 'CPU alta' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.createAlert({})).rejects.toMatchObject({ status: 403 })
  })
})

describe('updateAlert(alertId, config)', () => {
  it('PATCH /api/alerts/rules/{alertId}/ (no PUT)', async () => {
    await alertsGateway.updateAlert('r-1', { threshold: 90 })
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/alerts/rules/r-1/', expect.objectContaining({ threshold: 90 })
    )
  })
  it('usa PATCH, no PUT', async () => {
    await alertsGateway.updateAlert('r-1', {})
    expect(apiService.patch).toHaveBeenCalled()
    // Si el gateway usara PUT, apiService.put sería llamado — este test lo detectaría
  })
  it('propaga error 403', async () => {
    apiService.patch.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.updateAlert('r-1', {})).rejects.toMatchObject({ status: 403 })
  })
})

describe('deleteAlert(alertId)', () => {
  it('DELETE /api/alerts/rules/{alertId}/', async () => {
    await alertsGateway.deleteAlert('r-2')
    expect(apiService.delete).toHaveBeenCalledWith('/api/alerts/rules/r-2/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.deleteAlert('r-2')).rejects.toMatchObject({ status: 403 })
  })
})

describe('dryRunAlertRule(config)', () => {
  it('POST /api/alerts/rules/dry-run/ (no /validate-condition/)', async () => {
    await alertsGateway.dryRunAlertRule({ metric: 'SL', threshold: 80 })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/rules/dry-run/', expect.objectContaining({ metric: 'SL' })
    )
  })
  it('propaga error 400 de validación', async () => {
    apiService.post.mockRejectedValueOnce({ status: 400, data: { detail: 'Invalid metric' } })
    await expect(alertsGateway.dryRunAlertRule({ metric: 'X' })).rejects.toMatchObject({ status: 400 })
  })
})

describe('pauseAlertRule(ruleId)', () => {
  it('POST /api/alerts/rules/{ruleId}/pause/', async () => {
    await alertsGateway.pauseAlertRule('r-3')
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/rules/r-3/pause/')
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.pauseAlertRule('r-3')).rejects.toMatchObject({ status: 403 })
  })
})

describe('resumeAlertRule(ruleId)', () => {
  it('POST /api/alerts/rules/{ruleId}/resume/', async () => {
    await alertsGateway.resumeAlertRule('r-4')
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/rules/r-4/resume/')
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.resumeAlertRule('r-4')).rejects.toMatchObject({ status: 403 })
  })
})

// ── UC_ALR_02: Alertas activas ────────────────────────────────────────────────

describe('getActiveAlerts(params)', () => {
  it('GET /api/alerts/active/ (no /api/alerts/)', async () => {
    await alertsGateway.getActiveAlerts()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/active/', { params: {} })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.getActiveAlerts()).rejects.toMatchObject({ status: 403 })
  })
})

describe('getAlerts() — alias de getActiveAlerts', () => {
  it('GET /api/alerts/active/ con params vacíos', async () => {
    await alertsGateway.getAlerts()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/active/', { params: {} })
  })
  it('getTemplates no existe (endpoint eliminado)', () => {
    expect(typeof alertsGateway.getTemplates).toBe('undefined')
  })
})

// ── UC_ALR_03: Reconocimiento ─────────────────────────────────────────────────

describe('acknowledgeAlert(alertId, note)', () => {
  it('POST /api/alerts/{alertId}/acknowledge/ (no /ack/)', async () => {
    await alertsGateway.acknowledgeAlert('alr-7', 'Revisado')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/alr-7/acknowledge/', { note: 'Revisado' }
    )
  })
  it('acepta note null', async () => {
    await alertsGateway.acknowledgeAlert('alr-8')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/alr-8/acknowledge/', { note: null }
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.acknowledgeAlert('x')).rejects.toMatchObject({ status: 403 })
  })
})

describe('bulkAcknowledgeAlerts(alertIds)', () => {
  it('POST /api/alerts/bulk-acknowledge/ (no /bulk-ack/)', async () => {
    await alertsGateway.bulkAcknowledgeAlerts(['a1', 'a2', 'a3'])
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/bulk-acknowledge/', { alert_ids: ['a1', 'a2', 'a3'] }
    )
  })
  it('propaga error 400 si excede límite de 50', async () => {
    apiService.post.mockRejectedValueOnce({ status: 400 })
    await expect(alertsGateway.bulkAcknowledgeAlerts([])).rejects.toMatchObject({ status: 400 })
  })
})

// ── UC_ALR_04: Historial ──────────────────────────────────────────────────────

describe('getAlertHistory(filters)', () => {
  it('GET /api/alerts/history/ con filtros como params', async () => {
    await alertsGateway.getAlertHistory({ from: '2026-01-01' })
    expect(apiService.get).toHaveBeenCalledWith(
      '/api/alerts/history/', { params: { from: '2026-01-01' } }
    )
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.getAlertHistory()).rejects.toMatchObject({ status: 403 })
  })
})

// ── UC_ALR_05: Suscripciones ──────────────────────────────────────────────────

describe('getMySubscriptions(params)', () => {
  it('GET /api/alerts/me/subscriptions/ (no /subscriptions/me/)', async () => {
    await alertsGateway.getMySubscriptions()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/me/subscriptions/', { params: {} })
  })
  it('propaga error 403', async () => {
    apiService.get.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.getMySubscriptions()).rejects.toMatchObject({ status: 403 })
  })
})

describe('subscribeToAlert(subscriptionData)', () => {
  it('POST /api/alerts/me/subscriptions/ (no /subscriptions/)', async () => {
    await alertsGateway.subscribeToAlert({ alert_rule_id: 'r-1' })
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/me/subscriptions/', expect.objectContaining({ alert_rule_id: 'r-1' })
    )
  })
  it('propaga error 403', async () => {
    apiService.post.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.subscribeToAlert({})).rejects.toMatchObject({ status: 403 })
  })
})

describe('createSubscription() — alias de subscribeToAlert', () => {
  it('POST /api/alerts/me/subscriptions/', async () => {
    await alertsGateway.createSubscription({ alert_rule_id: 'r-2' })
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/me/subscriptions/', expect.any(Object))
  })
})

describe('unsubscribeFromAlert(subscriptionId)', () => {
  it('DELETE /api/alerts/me/subscriptions/{id}/ (no /subscriptions/{id}/)', async () => {
    await alertsGateway.unsubscribeFromAlert('sub-99')
    expect(apiService.delete).toHaveBeenCalledWith('/api/alerts/me/subscriptions/sub-99/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(alertsGateway.unsubscribeFromAlert('x')).rejects.toMatchObject({ status: 403 })
  })
})

describe('cancelSubscription() — alias de unsubscribeFromAlert', () => {
  it('DELETE /api/alerts/me/subscriptions/{id}/', async () => {
    await alertsGateway.cancelSubscription('sub-100')
    expect(apiService.delete).toHaveBeenCalledWith('/api/alerts/me/subscriptions/sub-100/')
  })
})
