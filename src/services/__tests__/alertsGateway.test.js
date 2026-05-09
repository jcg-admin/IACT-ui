import alertsGateway from '../alertsGateway'

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue([]),
    post: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({}),
    patch: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}))

const apiService = require('../apiClient').default

beforeEach(() => {
  jest.clearAllMocks()
})

describe('alertsGateway.getAlerts', () => {
  it('calls GET /api/alerts/', async () => {
    await alertsGateway.getAlerts()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/')
  })
})

describe('alertsGateway.getTemplates', () => {
  it('calls GET /api/alerts/templates/', async () => {
    await alertsGateway.getTemplates()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/templates/')
  })
})

describe('alertsGateway.getMySubscriptions', () => {
  it('calls GET /api/alerts/subscriptions/me/', async () => {
    await alertsGateway.getMySubscriptions()
    expect(apiService.get).toHaveBeenCalledWith('/api/alerts/subscriptions/me/')
  })
})

describe('alertsGateway.acknowledgeAlert', () => {
  it('calls POST /api/alerts/{id}/ack/ with note', async () => {
    await alertsGateway.acknowledgeAlert('alert-1', 'Under review')
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/alert-1/ack/', { note: 'Under review' })
  })

  it('passes null note when omitted', async () => {
    await alertsGateway.acknowledgeAlert('alert-2')
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/alert-2/ack/', { note: null })
  })
})

describe('alertsGateway.bulkAcknowledgeAlerts', () => {
  it('calls POST /api/alerts/bulk-ack/ with alert_ids array', async () => {
    await alertsGateway.bulkAcknowledgeAlerts(['a1', 'a2'])
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/bulk-ack/', { alert_ids: ['a1', 'a2'] })
  })
})

describe('alertsGateway.subscribeToAlert', () => {
  it('calls POST /api/alerts/subscriptions/ with subscription data', async () => {
    const sub = { subscription_type: 'severity_filter', severity_filter: 'critical' }
    await alertsGateway.subscribeToAlert(sub)
    expect(apiService.post).toHaveBeenCalledWith('/api/alerts/subscriptions/', sub)
  })
})

describe('alertsGateway.toggleAlertStatus', () => {
  it('calls PATCH /api/alerts/rules/{id}/ with status', async () => {
    await alertsGateway.toggleAlertStatus('rule-1', 'paused')
    expect(apiService.patch).toHaveBeenCalledWith('/api/alerts/rules/rule-1/', { status: 'paused' })
  })
})
