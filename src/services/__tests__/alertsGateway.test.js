/**
 * alertsGateway.test.js — URLs canónicas IACT-api v2
 */
import alertsGateway from '../alertsGateway'
import apiService from '../apiClient'

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get:    jest.fn().mockResolvedValue([]),
    post:   jest.fn().mockResolvedValue({}),
    put:    jest.fn().mockResolvedValue({}),
    patch:  jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}))

beforeEach(() => { jest.clearAllMocks() })

describe('alertsGateway.getAlerts', () => {
  it('GET /api/alerts/active/ con params (no /api/alerts/)', async () => {
    await alertsGateway.getAlerts()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/active/', { params: {} })
  })
})

describe('alertsGateway.getTemplates', () => {
  it('no existe — endpoint eliminado de la API', () => {
    expect(typeof alertsGateway.getTemplates).toBe('undefined')
  })
})

describe('alertsGateway.getMySubscriptions', () => {
  it('GET /api/alerts/me/subscriptions/ (no /subscriptions/me/)', async () => {
    await alertsGateway.getMySubscriptions()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/me/subscriptions/', { params: {} })
  })
})

describe('alertsGateway.acknowledgeAlert', () => {
  it('POST /api/alerts/{id}/acknowledge/ (no /ack/)', async () => {
    await alertsGateway.acknowledgeAlert('alert-1', 'Under review')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/alert-1/acknowledge/', { note: 'Under review' }
    )
  })

  it('pasa note: null cuando se omite', async () => {
    await alertsGateway.acknowledgeAlert('alert-2')
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/alert-2/acknowledge/', { note: null }
    )
  })
})

describe('alertsGateway.bulkAcknowledgeAlerts', () => {
  it('POST /api/alerts/bulk-acknowledge/ (no /bulk-ack/)', async () => {
    await alertsGateway.bulkAcknowledgeAlerts(['a1', 'a2'])
    expect(apiService.post).toHaveBeenCalledWith(
      '/api/alerts/bulk-acknowledge/', { alert_ids: ['a1', 'a2'] }
    )
  })
})

describe('alertsGateway.subscribeToAlert', () => {
  it('POST /api/alerts/me/subscriptions/ (no /subscriptions/)', async () => {
    const sub = { subscription_type: 'severity_filter', severity_filter: 'critical' }
    await alertsGateway.subscribeToAlert(sub)
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/me/subscriptions/', sub)
  })
})

describe('alertsGateway.updateAlert (era toggleAlertStatus)', () => {
  it('PATCH /api/alerts/rules/{id}/ con config parcial (no PUT)', async () => {
    await alertsGateway.updateAlert('rule-1', { status: 'paused' })
    expect(apiService.patch).toHaveBeenCalledWith('/api/alerts/rules/rule-1/', { status: 'paused' })
    expect(apiService.put).not.toHaveBeenCalled()
  })
})
