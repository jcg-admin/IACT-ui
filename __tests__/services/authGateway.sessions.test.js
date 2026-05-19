/**
 * T2.3 — authGateway.js: métodos de sesiones faltantes.
 *
 * Faltaban:
 *   getOwnSessions()    → GET  /api/auth/sessions/own/
 *   closeSession(id)    → POST /api/auth/sessions/{id}/close/
 *   closeAllSessions()  → POST /api/auth/sessions/close-all/
 *   getMyMenu()         → GET  /api/me/menu/
 *
 * Ya existían:
 *   getActiveSessions() → GET  /api/auth/sessions/  (lista admin)
 *   revokeSession(id)   → DELETE /api/auth/sessions/{id}/
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue([]),
  post:   jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')
const u = (m) => api[m].mock.calls[0]?.[0] ?? null

describe('authGateway — sesiones propias y menú (T2.3)', () => {
  let authGateway
  beforeEach(() => {
    jest.clearAllMocks()
    authGateway = require('../../src/services/authGateway').default
  })

  test('getOwnSessions() GET /api/auth/sessions/own/ — sesiones del usuario autenticado', async () => {
    await authGateway.getOwnSessions()
    expect(u('get')).toBe('/api/auth/sessions/own/')
  })

  test('closeSession(id) POST /api/auth/sessions/{id}/close/', async () => {
    await authGateway.closeSession('session-abc')
    expect(u('post')).toBe('/api/auth/sessions/session-abc/close/')
  })

  test('closeAllSessions() POST /api/auth/sessions/close-all/', async () => {
    await authGateway.closeAllSessions()
    expect(u('post')).toBe('/api/auth/sessions/close-all/')
  })

  test('getMyMenu() GET /api/me/menu/ — menú dinámico del usuario', async () => {
    await authGateway.getMyMenu()
    expect(u('get')).toBe('/api/me/menu/')
  })

  test('getActiveSessions() GET /api/auth/sessions/ — lista de sesiones (admin)', async () => {
    await authGateway.getActiveSessions()
    expect(u('get')).toBe('/api/auth/sessions/')
  })

  test('revokeSession(id) DELETE /api/auth/sessions/{id}/', async () => {
    await authGateway.revokeSession('session-xyz')
    expect(u('delete')).toBe('/api/auth/sessions/session-xyz/')
  })
})
