import alertsGateway from '../alertsGateway'

function mockFetch(data, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  localStorage.setItem('accessToken', 'test-token')
})

afterEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

describe('alertsGateway.getAlerts', () => {
  it('calls /alerts endpoint', async () => {
    mockFetch([{ id: 1, name: 'CPU Alert' }])
    await alertsGateway.getAlerts()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts'),
      expect.objectContaining({ method: 'GET' })
    )
  })
})

describe('alertsGateway.getTemplates', () => {
  it('calls /alerts/templates endpoint', async () => {
    mockFetch([])
    await alertsGateway.getTemplates()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts/templates'),
      expect.any(Object)
    )
  })
})

describe('alertsGateway.getMySubscriptions', () => {
  it('calls /alerts/subscriptions endpoint', async () => {
    mockFetch([])
    await alertsGateway.getMySubscriptions()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts/subscriptions/me'),
      expect.any(Object)
    )
  })
})
