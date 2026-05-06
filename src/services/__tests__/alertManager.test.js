import alertManager from '../alertManager'

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

describe('alertManager.getAlerts', () => {
  it('calls /alerts endpoint', async () => {
    mockFetch([{ id: 1, name: 'CPU Alert' }])
    await alertManager.getAlerts()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts'),
      expect.objectContaining({ method: 'GET' })
    )
  })
})

describe('alertManager.getTemplates', () => {
  it('calls /alerts/templates endpoint', async () => {
    mockFetch([])
    await alertManager.getTemplates()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts/templates'),
      expect.any(Object)
    )
  })
})

describe('alertManager.getMySubscriptions', () => {
  it('calls /alerts/subscriptions endpoint', async () => {
    mockFetch([])
    await alertManager.getMySubscriptions()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts/subscriptions/me'),
      expect.any(Object)
    )
  })
})
