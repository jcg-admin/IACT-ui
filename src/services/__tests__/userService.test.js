/**
 * userService.test.js — URLs canónicas IACT-api v2
 *
 * Cambios respecto a v1:
 *   createUser()     → POST /api/users/create/ (era /api/users/)
 *   deactivateUser() → POST /api/users/{id}/deactivate/ (UC_USR_04)
 *   Nuevos: patchUser, activateUser, resetUserPassword, deleteUser, getUserDetail
 *   Eliminado: updateMyProfile (endpoint inexistente en API)
 */
import userService from '../userGateway'
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

// ── getUsers ─────────────────────────────────────────────────────────────────

describe('getUsers(filters)', () => {
  it('GET /api/users/ con filtros como params', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await userService.getUsers({ state: 'ACTIVE' })
    expect(apiService.get).toHaveBeenCalledWith('/api/users/', { params: { state: 'ACTIVE' } })
  })

  it('propaga error cuando apiService falla', async () => {
    apiService.get.mockRejectedValue(new Error('Network error'))
    await expect(userService.getUsers()).rejects.toThrow('Network error')
  })
})

// ── getUserById ───────────────────────────────────────────────────────────────

describe('getUserById(id)', () => {
  it('GET /api/users/{id}/', async () => {
    apiService.get.mockResolvedValue({ id: 42, username: 'alice' })
    await userService.getUserById(42)
    expect(apiService.get).toHaveBeenCalledWith('/api/users/42/')
  })

  it('retorna el usuario de la respuesta', async () => {
    const mockUser = { id: 5, username: 'carlos' }
    apiService.get.mockResolvedValue(mockUser)
    const result = await userService.getUserById(5)
    expect(result).toEqual(mockUser)
  })
})

// ── createUser ────────────────────────────────────────────────────────────────

describe('createUser(data)', () => {
  it('POST /api/users/create/ — UC_USR_01 (no /api/users/)', async () => {
    const newUser = { username: 'nuevo', email: 'nuevo@test.com' }
    apiService.post.mockResolvedValue({ id: 99, ...newUser })
    await userService.createUser(newUser)
    expect(apiService.post).toHaveBeenCalledWith('/api/users/create/', newUser)
  })

  it('retorna el usuario creado con su id asignado', async () => {
    apiService.post.mockResolvedValue({ id: 99, username: 'nuevo' })
    const result = await userService.createUser({ username: 'nuevo' })
    expect(result.id).toBe(99)
  })
})

// ── updateUser ────────────────────────────────────────────────────────────────

describe('updateUser(id, data)', () => {
  it('PUT /api/users/{id}/ — reemplazo completo', async () => {
    const updates = { email: 'nuevo@test.com' }
    apiService.put.mockResolvedValue({ id: 7, ...updates })
    await userService.updateUser(7, updates)
    expect(apiService.put).toHaveBeenCalledWith('/api/users/7/', updates)
  })
})

// ── deactivateUser ────────────────────────────────────────────────────────────

describe('deactivateUser(id)', () => {
  it('POST /api/users/{id}/deactivate/ — baja lógica UC_USR_04', async () => {
    apiService.post.mockResolvedValue({ target_user_id: 3, state: 'ELIMINATED' })
    await userService.deactivateUser(3)
    expect(apiService.post).toHaveBeenCalledWith('/api/users/3/deactivate/')
  })

  it('NO llama DELETE — la baja lógica usa POST /deactivate/', async () => {
    apiService.post.mockResolvedValue({ state: 'ELIMINATED' })
    await userService.deactivateUser(3)
    expect(apiService.delete).not.toHaveBeenCalled()
  })

  it('retorna la respuesta del backend', async () => {
    apiService.post.mockResolvedValue({ state: 'ELIMINATED' })
    const result = await userService.deactivateUser(3)
    expect(result.state).toBe('ELIMINATED')
  })
})

// ── getActiveUsers ────────────────────────────────────────────────────────────

describe('getActiveUsers()', () => {
  it('llama getUsers con state=ACTIVE', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await userService.getActiveUsers()
    expect(apiService.get).toHaveBeenCalledWith('/api/users/', { params: { state: 'ACTIVE' } })
  })
})

// ── blockUser / unblockUser ───────────────────────────────────────────────────

describe('blockUser(id)', () => {
  it('POST /api/users/{id}/block/', async () => {
    await userService.blockUser(5)
    expect(apiService.post).toHaveBeenCalledWith('/api/users/5/block/')
  })
})

describe('unblockUser(id)', () => {
  it('POST /api/users/{id}/unblock/', async () => {
    await userService.unblockUser(5)
    expect(apiService.post).toHaveBeenCalledWith('/api/users/5/unblock/')
  })
})

// ── activateUser / resetUserPassword ─────────────────────────────────────────

describe('activateUser(id)', () => {
  it('POST /api/users/{id}/activate/', async () => {
    await userService.activateUser(5)
    expect(apiService.post).toHaveBeenCalledWith('/api/users/5/activate/')
  })
})

describe('resetUserPassword(id)', () => {
  it('POST /api/users/{id}/reset-password/ (UC_AUTH_03)', async () => {
    await userService.resetUserPassword(5)
    expect(apiService.post).toHaveBeenCalledWith('/api/users/5/reset-password/')
  })
})

// ── UC_USR_07 — perfil propio ─────────────────────────────────────────────────

describe('getMyProfile()', () => {
  it('GET /api/users/me/profile/ (UC_USR_07)', async () => {
    await userService.getMyProfile()
    expect(apiService.get).toHaveBeenCalledWith('/api/users/me/profile/')
  })
})

describe('updateMyProfile(data)', () => {
  it('PATCH /api/users/me/profile/ con datos parciales (UC_USR_07)', async () => {
    await userService.updateMyProfile({ first_name: 'Nuevo' })
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/users/me/profile/',
      expect.objectContaining({ first_name: 'Nuevo' })
    )
  })
})

// ── patchUser — T6.4 ──────────────────────────────────────────────────────────
describe('patchUser(id, data)', () => {
  it('PATCH /api/users/{id}/ con datos parciales', async () => {
    await userService.patchUser(5, { email: 'new@test.com' })
    expect(apiService.patch).toHaveBeenCalledWith(
      '/api/users/5/', expect.objectContaining({ email: 'new@test.com' })
    )
  })
  it('usa PATCH, no PUT (actualización parcial)', async () => {
    await userService.patchUser(5, {})
    expect(apiService.patch).toHaveBeenCalledTimes(1)
  })
  it('propaga error 403', async () => {
    apiService.patch.mockRejectedValueOnce({ status: 403 })
    await expect(userService.patchUser(5, {})).rejects.toMatchObject({ status: 403 })
  })
})

// ── deleteUser — T6.4 ─────────────────────────────────────────────────────────
describe('deleteUser(id)', () => {
  it('DELETE /api/users/{id}/', async () => {
    await userService.deleteUser(9)
    expect(apiService.delete).toHaveBeenCalledWith('/api/users/9/')
  })
  it('interpola el id en la URL', async () => {
    await userService.deleteUser('usr-88')
    expect(apiService.delete).toHaveBeenCalledWith('/api/users/usr-88/')
  })
  it('propaga error 403', async () => {
    apiService.delete.mockRejectedValueOnce({ status: 403 })
    await expect(userService.deleteUser(9)).rejects.toMatchObject({ status: 403 })
  })
})
