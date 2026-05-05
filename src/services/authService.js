/**
 * Auth Service - WITH DECORATORS
 * 
 * Maneja operaciones de autenticación con:
 * - Automatic caching (getCurrentUser, verifyToken)
 * - Automatic logging (all operations)
 * - Automatic validation (username, email, password)
 * 
 * API Endpoints:
 * POST   /api/token/                  - Login
 * POST   /api/logout/                 - Logout
 * GET    /api/user/                   - Get current user
 * POST   /api/register/               - Register
 */

import apiService from './apiService'
import { getNotificationService } from './notificationService'
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
    const response = await apiService.post('/api/token/', {
      username,
      password,
    })
    
    const result = {
      user_id: response.user_id,
      username: response.username,
      email: response.email,
      role: response.role || 'user',
      first_name: response.first_name || '',
      last_name: response.last_name || '',
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
    const response = await apiService.post('/api/logout/', {})
    
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
  const response = await apiService.get('/api/user/')
  
  return {
    user_id: response.user_id,
    username: response.username,
    email: response.email,
    role: response.role || 'user',
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
  const response = await apiService.post('/api/token/verify/', {})
  
  return {
    is_valid: response.is_valid || true,
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

const authService = {
  login,
  logout,
  getCurrentUser,
  register,
  verifyToken,
}

export default authService
export { login, logout, getCurrentUser, register, verifyToken }
