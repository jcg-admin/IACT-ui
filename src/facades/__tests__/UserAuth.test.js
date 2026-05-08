/**
 * UserAuth Facade Tests
 * 
 * Tests for authentication and user profile operations
 */

import userAuth from '../UserAuth'
import authService from '@services/authGateway'
import { getNotificationService } from '@services/notificationGateway'

// Mock dependencies
jest.mock('@services/authGateway')
jest.mock('@services/notificationGateway')

describe('UserAuth Facade', () => {
  let mockNotify

  beforeEach(() => {
    jest.clearAllMocks()
    mockNotify = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    }
    getNotificationService.mockReturnValue(mockNotify)
  })

  describe('startSession', () => {
    it('should login and load full profile', async () => {
      const mockUser = { user_id: '1', username: 'john', email: 'john@example.com' }
      const mockProfile = { first_name: 'John', last_name: 'Doe' }
      const mockVerification = { is_valid: true }

      authService.login.mockResolvedValue(mockUser)
      authService.getCurrentUser.mockResolvedValue(mockProfile)
      authService.verifyToken.mockResolvedValue(mockVerification)

      const result = await userAuth.startSession('john', 'password')

      expect(authService.login).toHaveBeenCalledWith('john', 'password')
      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(authService.verifyToken).toHaveBeenCalled()
      expect(result.user_id).toBe('1')
      expect(result.sessionStarted).toBeDefined()
      expect(mockNotify.success).toHaveBeenCalled()
    })

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials')
      authService.login.mockRejectedValue(error)

      await expect(userAuth.startSession('john', 'wrong')).rejects.toThrow('Invalid credentials')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('loadProfile', () => {
    it('should load user profile and verify token', async () => {
      const mockUser = { user_id: '1', username: 'john', email: 'john@example.com' }
      const mockVerification = { is_valid: true }

      authService.getCurrentUser.mockResolvedValue(mockUser)
      authService.verifyToken.mockResolvedValue(mockVerification)

      const result = await userAuth.loadProfile()

      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(authService.verifyToken).toHaveBeenCalled()
      expect(result.user_id).toBe('1')
    })

    it('should throw error if session expired', async () => {
      authService.getCurrentUser.mockResolvedValue({ user_id: '1' })
      authService.verifyToken.mockResolvedValue({ is_valid: false })

      await expect(userAuth.loadProfile()).rejects.toThrow('Session expired')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('endSession', () => {
    it('should logout and clear data', async () => {
      authService.logout.mockResolvedValue({})

      const result = await userAuth.endSession()

      expect(authService.logout).toHaveBeenCalled()
      expect(result.status).toBe('success')
      expect(mockNotify.success).toHaveBeenCalled()
    })

    it('should handle logout errors gracefully', async () => {
      const error = new Error('Logout failed')
      authService.logout.mockRejectedValue(error)

      const result = await userAuth.endSession()

      // Should still return success
      expect(result.status).toBe('success')
    })
  })

  describe('createAccount', () => {
    it('should register and auto-login new user', async () => {
      const userData = {
        username: 'newuser',
        password: 'password',
        email: 'new@example.com'
      }

      const mockNewUser = { user_id: '2', username: 'newuser', email: 'new@example.com' }
      const mockVerification = { is_valid: true }

      authService.register.mockResolvedValue(mockNewUser)
      authService.login.mockResolvedValue(mockNewUser)
      authService.getCurrentUser.mockResolvedValue({ username: 'newuser' })
      authService.verifyToken.mockResolvedValue(mockVerification)

      const result = await userAuth.createAccount(userData)

      expect(authService.register).toHaveBeenCalledWith(userData)
      expect(authService.login).toHaveBeenCalledWith(userData.username, userData.password)
      expect(result.accountCreated).toBe(true)
      expect(result.user_id).toBe('2')
    })

    it('should handle registration errors', async () => {
      const userData = { username: 'user', password: 'pass', email: 'user@example.com' }
      const error = new Error('Username already exists')

      authService.register.mockRejectedValue(error)

      await expect(userAuth.createAccount(userData)).rejects.toThrow('Username already exists')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('refreshSession', () => {
    it('should refresh session and reload profile', async () => {
      const mockUser = { user_id: '1', username: 'john' }
      const mockVerification = { is_valid: true }

      authService.verifyToken.mockResolvedValue(mockVerification)
      authService.getCurrentUser.mockResolvedValue(mockUser)

      const result = await userAuth.refreshSession()

      expect(result.is_valid).toBe(true)
      expect(result.user.user_id).toBe('1')
      expect(result.refreshedAt).toBeDefined()
    })

    it('should throw error if session invalid', async () => {
      authService.verifyToken.mockResolvedValue({ is_valid: false })

      await expect(userAuth.refreshSession()).rejects.toThrow('Session expired')
    })
  })

  describe('checkSession', () => {
    it('should return true for valid session', async () => {
      authService.verifyToken.mockResolvedValue({ is_valid: true })

      const isValid = await userAuth.checkSession()

      expect(isValid).toBe(true)
    })

    it('should return false for invalid session', async () => {
      authService.verifyToken.mockResolvedValue({ is_valid: false })

      const isValid = await userAuth.checkSession()

      expect(isValid).toBe(false)
    })

    it('should return false on error (lightweight check)', async () => {
      authService.verifyToken.mockRejectedValue(new Error('Error'))

      const isValid = await userAuth.checkSession()

      expect(isValid).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const mockUser = { user_id: '1', username: 'john' }
      authService.getCurrentUser.mockResolvedValue(mockUser)

      const result = await userAuth.getCurrentUser()

      expect(result.user_id).toBe('1')
    })

    it('should handle errors', async () => {
      authService.getCurrentUser.mockRejectedValue(new Error('Failed'))

      await expect(userAuth.getCurrentUser()).rejects.toThrow('Failed')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })
})
