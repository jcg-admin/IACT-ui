/**
 * Tests para userService
 *
 * Cubre: getUsers, getUserById, createUser, updateUser,
 * deactivateUser (baja lógica), getActiveUsers
 */

import userService from '../userGateway'
import apiService from '@services/apiClient'

jest.mock('@services/apiClient')

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── getUsers ────────────────────────────────────────────────────────────

  describe('getUsers(filters)', () => {
    it('llama GET /api/users/ sin parámetros cuando no hay filtros', async () => {
      apiService.get.mockResolvedValue([])
      await userService.getUsers()
      expect(apiService.get).toHaveBeenCalledWith('/api/users/', { params: {} })
    })

    it('pasa filtros como params en la petición', async () => {
      apiService.get.mockResolvedValue([])
      await userService.getUsers({ status: 'ACTIVE', role: 'agent' })
      expect(apiService.get).toHaveBeenCalledWith('/api/users/', {
        params: { status: 'ACTIVE', role: 'agent' },
      })
    })

    it('retorna la respuesta paginada de la API', async () => {
      const mockResponse = {
        count: 2,
        next: null,
        previous: null,
        results: [{ id: 1, username: 'alice' }, { id: 2, username: 'bob' }],
      }
      apiService.get.mockResolvedValue(mockResponse)
      const result = await userService.getUsers()
      expect(result.count).toBe(2)
      expect(result.results).toHaveLength(2)
    })

    it('propaga el error cuando apiService falla', async () => {
      apiService.get.mockRejectedValue(new Error('Network error'))
      await expect(userService.getUsers()).rejects.toThrow('Network error')
    })
  })

  // ── getUserById ──────────────────────────────────────────────────────────

  describe('getUserById(id)', () => {
    it('llama GET /api/users/{id}/', async () => {
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

  // ── createUser ──────────────────────────────────────────────────────────

  describe('createUser(data)', () => {
    it('llama POST /api/users/ con los datos del usuario', async () => {
      const newUser = { username: 'nuevo', email: 'nuevo@test.com', role: 'agent' }
      apiService.post.mockResolvedValue({ id: 99, ...newUser })
      await userService.createUser(newUser)
      expect(apiService.post).toHaveBeenCalledWith('/api/users/', newUser)
    })

    it('retorna el usuario creado con su id asignado', async () => {
      apiService.post.mockResolvedValue({ id: 99, username: 'nuevo' })
      const result = await userService.createUser({ username: 'nuevo' })
      expect(result.id).toBe(99)
    })
  })

  // ── updateUser ──────────────────────────────────────────────────────────

  describe('updateUser(id, data)', () => {
    it('llama PUT /api/users/{id}/ con los datos actualizados', async () => {
      const updates = { email: 'nuevo@test.com' }
      apiService.put.mockResolvedValue({ id: 7, ...updates })
      await userService.updateUser(7, updates)
      expect(apiService.put).toHaveBeenCalledWith('/api/users/7/', updates)
    })
  })

  // ── deactivateUser ───────────────────────────────────────────────────────
  // UC-USR-04 / BR-009: DELETE con semántica lógica — backend cambia
  // state → ELIMINATED y propaga side-effects (sesiones, AGRs, mailbox)

  describe('deactivateUser(id)', () => {
    it('llama DELETE /api/users/{id}/ (baja lógica por protocolo REST)', async () => {
      apiService.delete.mockResolvedValue({ target_user_id: 3, state: 'ELIMINATED' })
      await userService.deactivateUser(3)
      expect(apiService.delete).toHaveBeenCalledWith('/api/users/3/')
    })

    it('NO llama PATCH — la eliminación lógica usa DELETE per UC-USR-04', async () => {
      apiService.delete.mockResolvedValue({ target_user_id: 3, state: 'ELIMINATED' })
      await userService.deactivateUser(3)
      expect(apiService.patch).not.toHaveBeenCalled()
    })

    it('retorna respuesta con state ELIMINATED', async () => {
      apiService.delete.mockResolvedValue({ target_user_id: 3, state: 'ELIMINATED' })
      const result = await userService.deactivateUser(3)
      expect(result.state).toBe('ELIMINATED')
    })
  })

  // ── getActiveUsers ───────────────────────────────────────────────────────

  describe('getActiveUsers()', () => {
    it('llama getUsers con filtro state ACTIVE (campo correcto según UC-USR-02)', async () => {
      apiService.get.mockResolvedValue({ count: 0, results: [] })
      await userService.getActiveUsers()
      expect(apiService.get).toHaveBeenCalledWith('/api/users/', {
        params: { state: 'ACTIVE' },
      })
    })
  })
})
