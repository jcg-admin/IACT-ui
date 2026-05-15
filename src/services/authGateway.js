/**
 * Auth Service - WITH DECORATORS
 * 
 * Maneja operaciones de autenticación con:
 * - Automatic caching (getCurrentUser, verifyToken)
 * - Automatic logging (all operations)
 * - Automatic validation (username, email, password)
 * 
 * API Endpoints (IACT-api v2):
 * POST   /api/auth/login/             - Login (UC_AUTH_01)
 * POST   /api/auth/logout/            - Logout (UC_AUTH_02)
 * GET    /api/auth/me/                - Get current user (UC_AUTH_01)
 * GET    /api/auth/sessions/          - Listar sesiones (UC_AUTH_05)
 * DELETE /api/auth/sessions/{id}/close/ - Cerrar sesión (UC_AUTH_05)
 */

import apiService from './apiClient'
import { getNotificationService } from './notificationGateway'
import {
  withCaching,
  withLogging,
  withValidation,
  CommonValidators,
  CACHE_TTL,
} from '../decorators'

// ─────────────────────────────────────────────────────────────────────────
// Base functions (without decorators)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Login user
 */
async function loginBase(username, password) {
  try {
    const response = await apiService.post('/api/auth/login/', {
      username,
      password,
    })
    
    const user = response.user || {}
    const result = {
      user_id:   user.user_id,
      username:  user.username,
      full_name: user.full_name || '',
      tokens:    response.tokens || {},
      session:   response.session || {},
      next_step: response.next_step || null,
    }

    const notify = getNotificationService()
    notify.success(`Welcome, ${result.username}`)

    return result
  } catch (error) {
    const notify = getNotificationService()
    notify.error(`Login failed: ${error.message}`)
    throw error
  }
}

/**
 * Logout user
 */
async function logoutBase() {
  try {
    const response = await apiService.post('/api/auth/logout/', {})
    
    const result = {
      status: response.status || 'success',
    }

    const notify = getNotificationService()
    notify.success('Logged out successfully')

    return result
  } catch (error) {
    console.error('Logout error:', error)
    return { status: 'success' }
  }
}

/**
 * Get current authenticated user
 */
async function getCurrentUserBase() {
  const response = await apiService.get('/api/auth/me/')
  
  return {
    user_id: response.user_id,
    username: response.username,
    email: response.email,
    first_name: response.first_name || '',
    last_name: response.last_name || '',
  }
}

/**
 * Register new user
 */
async function registerBase(data) {
  try {
    const response = await apiService.post('/api/register/', {
      username: data.username,
      password: data.password,
      email: data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
    })
    
    const result = {
      user_id: response.user_id,
      username: response.username,
      email: response.email,
    }

    const notify = getNotificationService()
    notify.success(`Account created successfully. Please log in.`)

    return result
  } catch (error) {
    const notify = getNotificationService()
    notify.error(`Registration failed: ${error.message}`)
    throw error
  }
}

/**
 * Verify token (check if still valid)
 */
async function verifyTokenBase() {
  const response = await apiService.get('/api/auth/me/')
  return {
    is_valid: Boolean(response && response.user_id),
    user: response,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Decorated functions (with caching, logging, validation)
// ─────────────────────────────────────────────────────────────────────────

/**
 * LOGIN - Loguear + Validar
 * No cachear: credenciales son sensitivas, solo una por sesión
 */
const login = withLogging(
  withValidation(
    loginBase,
    (username, password) => {
      if (!username || typeof username !== 'string') {
        return { valid: false, message: 'Username required' }
      }
      if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password required' }
      }
      return { valid: true }
    },
    { fnName: 'authService.login' }
  ),
  'authService.login',
  { logArgs: false } // No loguear contraseña en argumentos
)

/**
 * LOGOUT - Solo loguear
 * No cachear ni validar: sin parámetros
 */
const logout = withLogging(
  logoutBase,
  'authService.logout'
)

/**
 * GET CURRENT USER - Cachear + Loguear
 * Cachear por 5 minutos: usuario no cambia frecuentemente
 */
const getCurrentUser = withCaching(
  withLogging(
    getCurrentUserBase,
    'authService.getCurrentUser'
  ),
  CACHE_TTL.MEDIUM, // 5 minutos
  () => 'auth:current-user' // Clave fija (un usuario por sesión)
)

/**
 * REGISTER - Loguear + Validar
 * No cachear: cada registro es único
 */
const register = withLogging(
  withValidation(
    registerBase,
    // Validar data
    (data) => {
      if (!data || typeof data !== 'object') {
        return { valid: false, message: 'Registration data required' }
      }
      if (!data.username) {
        return { valid: false, message: 'Username required' }
      }
      if (!data.password) {
        return { valid: false, message: 'Password required' }
      }
      // Validar email
      const emailValidation = CommonValidators.validateEmail(data.email)
      if (!emailValidation.valid) {
        return emailValidation
      }
      return { valid: true }
    },
    { fnName: 'authService.register' }
  ),
  'authService.register',
  { logArgs: false } // No loguear contraseña en argumentos
)

/**
 * VERIFY TOKEN - Cachear + Loguear
 * Cachear por 30 minutos: token no cambia durante sesión
 */
const verifyToken = withCaching(
  withLogging(
    verifyTokenBase,
    'authService.verifyToken'
  ),
  CACHE_TTL.LONG, // 30 minutos
  () => 'auth:token-valid' // Clave fija
)

/**
 * Reset / recuperar contraseña (envía email de recuperación).
 * POST /api/auth/reset_password/
 */
async function resetPasswordBase(username) {
  const response = await apiService.post('/api/auth/reset_password/', { username })
  return response
}

const resetPassword = withLogging(
  withValidation(
    resetPasswordBase,
    (username) => {
      if (!username || typeof username !== 'string') {
        return { valid: false, message: 'Username or email required' }
      }
      return { valid: true }
    },
    { fnName: 'authService.resetPassword' }
  ),
  'authService.resetPassword'
)

/**
 * Cambiar contraseña del usuario autenticado.
 * POST /api/auth/change-password/
 */
async function changePasswordBase(currentPassword, newPassword) {
  const response = await apiService.post('/api/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return response
}

const changePassword = withLogging(
  withValidation(
    changePasswordBase,
    (currentPassword, newPassword) => {
      if (!currentPassword) return { valid: false, message: 'Current password required' }
      if (!newPassword)     return { valid: false, message: 'New password required' }
      return { valid: true }
    },
    { fnName: 'authService.changePassword' }
  ),
  'authService.changePassword',
  { logArgs: false }
)

async function getActiveSessions() {
  const response = await apiService.get('/api/auth/sessions/')
  return response
}

const getSessions = getActiveSessions


async function revokeSession(sessionId) {
  const response = await apiService.delete(`/api/auth/sessions/${sessionId}/`)
  return response
}

const authService = {
  login,
  logout,
  getCurrentUser,
  register,
  verifyToken,
  resetPassword,
  changePassword,
  getActiveSessions,
  getSessions,
  revokeSession,
}

export default authService
export { login, logout, getCurrentUser, register, verifyToken, resetPassword, changePassword, getActiveSessions, getSessions, revokeSession }
