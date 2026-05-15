/**
 * authGateway.integration.test.js
 *
 * TDD — Verifica que authGateway usa las URLs canónicas de IACT-api v2.
 *
 * Contratos:
 *   login()        → POST /api/auth/login/       (era /api/token/)
 *   logout()       → POST /api/auth/logout/       (era /api/logout/)
 *   verifyToken()  → GET  /api/auth/me/           (era /api/token/verify/)
 *   getSessions()  → GET  /api/auth/sessions/     (correcto)
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({ tokens: { access: 'tok' }, user: { user_id: 1 } }),
  delete: jest.fn().mockResolvedValue({}),
}))

const apiService = require('../../src/services/apiClient')

describe('authGateway — URLs canónicas IACT-api v2', () => {
  let authGateway

  beforeEach(() => {
    jest.clearAllMocks()
    authGateway = require('../../src/services/authGateway').default
  })

  test('login() POST /api/auth/login/ (no /api/token/)', async () => {
    await authGateway.login('u', 'p')
    const [url] = apiService.post.mock.calls[0]
    expect(url).toBe('/api/auth/login/')
  })

  test('logout() POST /api/auth/logout/ (no /api/logout/)', async () => {
    await authGateway.logout()
    const [url] = apiService.post.mock.calls[0]
    expect(url).toBe('/api/auth/logout/')
  })

  test('verifyToken() GET /api/auth/me/ (no /api/token/verify/)', async () => {
    apiService.get.mockResolvedValueOnce({ user_id: 1 })
    await authGateway.verifyToken()
    const [url] = apiService.get.mock.calls[0]
    expect(url).toBe('/api/auth/me/')
  })

  test('getSessions() GET /api/auth/sessions/', async () => {
    apiService.get.mockResolvedValueOnce([])
    await authGateway.getSessions()
    const [url] = apiService.get.mock.calls[0]
    expect(url).toBe('/api/auth/sessions/')
  })
})
