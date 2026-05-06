import { APIService } from '../apiService'

function buildService() {
  return new APIService('http://test.example.com', { timeout: 5000, retryAttempts: 1, retryDelay: 0 })
}

function mockFetch(data, status = 200) {
  const headersMap = new Map([['content-type', 'application/json']])
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    headers: {
      get: (name) => headersMap.get(name.toLowerCase()) || null,
      entries: () => headersMap.entries(),
    },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('APIService.setAuthToken / clearAuthToken', () => {
  it('sets Authorization header', () => {
    const api = buildService()
    api.setAuthToken('my-token')
    expect(api.headers['Authorization']).toBe('Bearer my-token')
  })

  it('setAuthToken with falsy value removes Authorization header', () => {
    const api = buildService()
    api.setAuthToken('my-token')
    api.setAuthToken(null)
    expect(api.headers['Authorization']).toBeUndefined()
  })
})

describe('APIService.get', () => {
  it('calls fetch with GET method', async () => {
    const api = buildService()
    mockFetch({ users: [] })
    await api.get('/users')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({ method: 'GET' })
    )
  })
})

describe('APIService.post', () => {
  it('calls fetch with POST method and body', async () => {
    const api = buildService()
    mockFetch({ id: 1 })
    await api.post('/users', { name: 'Alice' })
    const [, options] = global.fetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ name: 'Alice' })
  })
})

describe('APIService.patch', () => {
  it('calls fetch with PATCH method', async () => {
    const api = buildService()
    mockFetch({ id: 1 })
    await api.patch('/users/1', { name: 'Bob' })
    const [, options] = global.fetch.mock.calls[0]
    expect(options.method).toBe('PATCH')
  })
})

describe('APIService.delete', () => {
  it('calls fetch with DELETE method', async () => {
    const api = buildService()
    mockFetch(undefined, 204)
    await api.delete('/users/1')
    const [, options] = global.fetch.mock.calls[0]
    expect(options.method).toBe('DELETE')
  })
})
