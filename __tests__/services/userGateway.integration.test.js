/**
 * T2.2 — userGateway.js:
 *   Corregir: createUser usa /api/users/ pero la URL canónica UC_USR_01 es /api/users/create/
 *   Corregir: updateUser usa PUT, añadir PATCH /api/users/{id}/
 *   Corregir: getMyProfile usa /api/users/me/ → ya cubierto por authGateway.getCurrentUser()
 *   Corregir: updateMyProfile usa /api/users/me/profile/ → no existe en IACT-api
 *   Añadir: activateUser()    → POST /api/users/{id}/activate/
 *   Añadir: deactivateUser()  → POST /api/users/{id}/deactivate/ (semántica diferente a delete)
 *   Añadir: resetUserPassword() → POST /api/users/{id}/reset-password/
 *   Añadir: patchUser()       → PATCH /api/users/{id}/ (actualización parcial)
 *   Añadir: getUserDetail()   → GET /api/users/{user_id}/ (endpoint explícito)
 */

jest.mock('../../src/services/apiClient', () => ({
  get:    jest.fn().mockResolvedValue({}),
  post:   jest.fn().mockResolvedValue({}),
  put:    jest.fn().mockResolvedValue({}),
  patch:  jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
}))

const api = require('../../src/services/apiClient')
const u = (m) => api[m].mock.calls[0]?.[0] ?? null

describe('userGateway — URLs canónicas (T2.2)', () => {
  let gw
  beforeEach(() => { jest.clearAllMocks(); gw = require('../../src/services/userGateway').default })

  test('createUser() POST /api/users/create/ (UC_USR_01 — no /api/users/)', async () => {
    await gw.createUser({ username: 'ana' })
    expect(u('post')).toBe('/api/users/create/')
  })

  test('updateUser() PUT /api/users/{id}/ — reemplazo completo', async () => {
    await gw.updateUser(5, { username: 'ana2' })
    expect(u('put')).toBe('/api/users/5/')
  })

  test('patchUser() PATCH /api/users/{id}/ — actualización parcial', async () => {
    await gw.patchUser(5, { email: 'x@y.com' })
    expect(u('patch')).toBe('/api/users/5/')
  })

  test('activateUser() POST /api/users/{id}/activate/', async () => {
    await gw.activateUser(5)
    expect(u('post')).toBe('/api/users/5/activate/')
  })

  test('deactivateUser() POST /api/users/{id}/deactivate/', async () => {
    await gw.deactivateUser(5)
    expect(u('post')).toBe('/api/users/5/deactivate/')
  })

  test('resetUserPassword() POST /api/users/{id}/reset-password/ (UC_AUTH_03)', async () => {
    await gw.resetUserPassword(5)
    expect(u('post')).toBe('/api/users/5/reset-password/')
  })

  test('getUserDetail() GET /api/users/{id}/', async () => {
    await gw.getUserDetail(5)
    expect(u('get')).toBe('/api/users/5/')
  })

  test('getUsers() GET /api/users/ — sin cambios', async () => {
    await gw.getUsers()
    expect(u('get')).toBe('/api/users/')
  })

  test('blockUser() POST /api/users/{id}/block/', async () => {
    await gw.blockUser(5)
    expect(u('post')).toBe('/api/users/5/block/')
  })

  test('unblockUser() POST /api/users/{id}/unblock/', async () => {
    await gw.unblockUser(5)
    expect(u('post')).toBe('/api/users/5/unblock/')
  })

  test('deleteUser() DELETE /api/users/{id}/ — baja lógica BR-009', async () => {
    await gw.deleteUser(5)
    expect(u('delete')).toBe('/api/users/5/')
  })

  test('updateMyProfile() no existe — /api/users/me/profile/ no existe en API', () => {
    expect(typeof gw.updateMyProfile).toBe('undefined')
  })
})
