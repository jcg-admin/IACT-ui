/**
 * Tests para userService
 *
 * Cubre: getUsers, getUserById, createUser, updateUser,
 * deactivateUser (baja lógica), getActiveUsers
 */

import userService from '../userService'
import apiService from '@services/apiService'

jest.mock('@services/apiService')

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

    it('retorna la respuesta de la API', async () => {
      const mockUsers = [{ id: 1, username: 'alice' }, { id: 2, username: 'bob' }]
      apiService.get.mockResolvedValue(mockUsers)
      const result = await userService.getUsers()
      expect(result).toEqual(mockUsers)
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

  // ── deactivateUser ────────────────────────────────────────────────────
  // Baja lógica: PATCH status → INACTIVE, nunca DELETE (UC-USR-04)

  describe('deactivateUser(id)', () => {
    it('llama PATCH /api/users/{id}/ con status INACTIVE', async () => {
      apiService.patch.mockResolvedValue({ id: 3, status: 'INACTIVE' })
      await userService.deactivateUser(3)
      expect(apiService.patch).toHaveBeenCalledWith('/api/users/3/', { status: 'INACTIVE' })
    })

    it('NO llama DELETE — baja lógica, no física', async () => {
      apiService.patch.mockResolvedValue({ id: 3, status: 'INACTIVE' })
      await userService.deactivateUser(3)
      expect(apiService.delete).not.toHaveBeenCalled()
    })
  })

  // ── getActiveUsers ───────────────────────────────────────────────────

  describe('getActiveUsers()', () => {
    it('llama getUsers con filtro status ACTIVE', async () => {
      apiService.get.mockResolvedValue([])
      await userService.getActiveUsers()
      expect(apiService.get).toHaveBeenCalledWith('/api/users/', {
        params: { status: 'ACTIVE' },
      })
    })
  })
})
