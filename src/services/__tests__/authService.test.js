/**
 * authService Tests
 * 
 * Test authentication service methods
 * Tests cover:
 * - Login
 * - Logout
 * - getCurrentUser
 * - Register
 * - verifyToken
 */

import authService from '@api/authGateway'
import apiService from '@api/apiClient'

jest.mock('@api/apiClient')

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login(username, password)', () => {
    it('should make POST to /api/token/ with credentials', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      apiService.post.mockResolvedValue({ user: mockUser, tokens: { access: 'tok' } })

      const result = await authService.login('testuser', 'password123')

      expect(apiService.post).toHaveBeenCalledWith('/api/auth/login/', {
        username: 'testuser',
        password: 'password123',
      })
      expect(result.user_id).toBe(1)
    })

    it('should handle default values for missing fields', async () => {
      const mockResponse = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        // first_name not provided
        // last_name not provided
      }

      apiService.post.mockResolvedValue({ user: mockResponse, tokens: { access: 'tok' } })

      const result = await authService.login('testuser', 'password123')

      // API v2: full_name en lugar de first_name/last_name
      expect(result.user_id).toBe(1)
    })
  })

  describe('logout()', () => {
    it('should make POST to /api/logout/', async () => {
      const mockResponse = { status: 'success' }

      apiService.post.mockResolvedValue(mockResponse)

      const result = await authService.logout()

      expect(apiService.post).toHaveBeenCalledWith('/api/auth/logout/', {})
      expect(result.status).toBe('success')
    })
  })

  describe('getCurrentUser()', () => {
    it('should make GET to /api/user/', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      apiService.get.mockResolvedValue(mockUser)

      const result = await authService.getCurrentUser()

      expect(apiService.get).toHaveBeenCalledWith('/api/auth/me/')
      expect(result).toEqual(mockUser)
    })
  })

  describe('register(data)', () => {
    it('should make POST to /api/register/ with user data', async () => {
      const registerData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
      }

      const mockResponse = {
        user_id: 2,
        username: 'newuser',
        email: 'new@example.com',
      }

      apiService.post.mockResolvedValue(mockResponse)

      const result = await authService.register(registerData)

      expect(apiService.post).toHaveBeenCalledWith('/api/register/', {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
      })
      expect(result.user_id).toBe(2)
    })

    it('should handle optional fields in registration', async () => {
      const registerData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        // first_name not provided
        // last_name not provided
      }

      const mockResponse = {
        user_id: 2,
        username: 'newuser',
        email: 'new@example.com',
      }

      apiService.post.mockResolvedValue(mockResponse)

      const result = await authService.register(registerData)

      expect(apiService.post).toHaveBeenCalledWith('/api/register/', {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        first_name: '',
        last_name: '',
      })
      expect(result).toBeDefined()
    })
  })

  describe('verifyToken()', () => {
    it('should make POST to /api/token/verify/', async () => {
      const mockResponse = { is_valid: true }

      apiService.post.mockResolvedValue(mockResponse)

      const result = await authService.verifyToken()

      expect(apiService.get).toHaveBeenCalledWith('/api/auth/me/')
      expect(result.is_valid).toBe(true)
    })

    it('should default is_valid to true if not provided', async () => {
      const mockResponse = {}

      apiService.post.mockResolvedValue(mockResponse)

      const result = await authService.verifyToken()

      expect(result.is_valid).toBe(true)
    })
  })
})
