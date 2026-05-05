/**
 * UserAuth Facade
 * 
 * Simplifies authentication and user profile management.
 * Orchestrates multiple services into high-level operations:
 * - Session management (login, logout, refresh)
 * - User profile operations (load, update)
 * - Token management (verify, refresh)
 * - Account creation (register, auto-login)
 * 
 * Single responsibility: Provide simple auth operations
 * Uses: authService, Redux, notification system
 */

import authService from '@services/authService'
import { getNotificationService } from '@services/notificationService'

class UserAuth {
  /**
   * Start a user session (login)
   * 
   * Orchestrates:
   * 1. Login via authService
   * 2. Load user profile
   * 3. Verify token
   * 4. Store session info
   * 
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{user_id, username, email, role, ...}>}
   */
  async startSession(username, password) {
    try {
      // Step 1: Login
      const user = await authService.login(username, password)
      
      // Step 2: Load full profile (in case login doesn't return all data)
      const profile = await this.loadProfile()
      
      // Step 3: Verify session is valid
      await authService.verifyToken()
      
      // Notify user
      const notify = getNotificationService()
      notify.success(`Welcome back, ${user.username}!`)
      
      return {
        ...user,
        ...profile,
        sessionStarted: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Login failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Load current user profile
   * 
   * Orchestrates:
   * 1. Get current user
   * 2. Verify token is valid
   * 3. Return user data
   * 
   * @returns {Promise<{user_id, username, email, role, ...}>}
   */
  async loadProfile() {
    try {
      const user = await authService.getCurrentUser()
      
      // Verify token is still valid
      const verification = await authService.verifyToken()
      if (!verification.is_valid) {
        throw new Error('Session expired')
      }
      
      return user
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Failed to load profile: ${error.message}`)
      throw error
    }
  }

  /**
   * End user session (logout)
   * 
   * Orchestrates:
   * 1. Logout via service
   * 2. Clear all user data
   * 3. Clear session storage
   * 4. Notify user
   * 
   * @returns {Promise<{status: 'success'}>}
   */
  async endSession() {
    try {
      // Call logout (may fail silently)
      await authService.logout()
      
      // Clear sensitive data
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear auth-related storage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      
      const notify = getNotificationService()
      notify.success('Logged out successfully')
      
      return { status: 'success' }
    } catch (error) {
      // Don't throw on logout errors - still clear data
      console.error('Logout error:', error)
      return { status: 'success' }
    }
  }

  /**
   * Create a new account with auto-login
   * 
   * Orchestrates:
   * 1. Register account
   * 2. Auto-login new user
   * 3. Load profile
   * 4. Return full session
   * 
   * @param {Object} data - {username, password, email, first_name, last_name}
   * @returns {Promise<{user_id, username, email, ...}>}
   */
  async createAccount(data) {
    try {
      // Step 1: Register
      const newUser = await authService.register(data)
      
      // Step 2: Auto-login
      const session = await this.startSession(data.username, data.password)
      
      return {
        ...newUser,
        ...session,
        accountCreated: true
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Registration failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Refresh the current session
   * 
   * Orchestrates:
   * 1. Verify token
   * 2. Reload profile if expired
   * 3. Update session info
   * 
   * @returns {Promise<{is_valid: boolean, user: Object}>}
   */
  async refreshSession() {
    try {
      // Check if token is still valid
      const verification = await authService.verifyToken()
      
      if (!verification.is_valid) {
        throw new Error('Session expired - please login again')
      }
      
      // Reload profile to get latest data
      const user = await authService.getCurrentUser()
      
      return {
        is_valid: true,
        user: user,
        refreshedAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Session refresh failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Check if user has valid session
   * 
   * Orchestrates:
   * 1. Verify token
   * 2. Check token validity
   * 3. Return boolean
   * 
   * Lightweight operation - doesn't throw on failure
   * 
   * @returns {Promise<boolean>}
   */
  async checkSession() {
    try {
      const verification = await authService.verifyToken()
      return verification.is_valid === true
    } catch (error) {
      // Session check failed - assume invalid
      console.debug('Session check failed:', error.message)
      return false
    }
  }

  /**
   * Get current user without verification
   * 
   * Lighter than loadProfile() - just gets data
   * Use when you don't need to verify token
   * 
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      return await authService.getCurrentUser()
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Failed to get user: ${error.message}`)
      throw error
    }
  }
}

// Export singleton instance
const userAuth = new UserAuth()
export default userAuth

// Export class for testing
export { UserAuth }
