/**
 * Notification Service
 * 
 * Centralized notification management
 * Abstracts Toast Context for use in services and other parts of the app
 * 
 * Usage in components:
 *   import { useNotification } from '@services/notificationGateway'
 *   const notify = useNotification()
 *   notify.success('Success message')
 *   notify.error('Error message')
 *   notify.warning('Warning message')
 *   notify.info('Info message')
 * 
 * Usage in services:
 *   import notificationService from '@services/notificationGateway'
 *   notificationService.success('Job started')
 *   notificationService.error('Job failed')
 */

/**
 * Notification types with default durations
 */
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

const DEFAULT_DURATIONS = {
  [NOTIFICATION_TYPES.SUCCESS]: 3000,
  [NOTIFICATION_TYPES.ERROR]: 5000,
  [NOTIFICATION_TYPES.WARNING]: 4000,
  [NOTIFICATION_TYPES.INFO]: 3000,
}

/**
 * Global notification instance for service usage
 * Initialized via registerNotificationService in App.jsx
 */
let globalNotificationService = null

/**
 * Internal Notification Service Class
 * Used both as hook and as global service
 */
class NotificationService {
  constructor(toastContext = null) {
    this.toastContext = toastContext
  }

  /**
   * Set toast context (called from App.jsx)
   * @param {Object} toastContext - The toast context from ToastProvider
   */
  setContext(toastContext) {
    this.toastContext = toastContext
  }

  /**
   * Show success notification
   * @param {string} message - Success message
   * @param {number} duration - Duration in milliseconds (default: 3000)
   * @returns {number} Toast ID
   */
  success(message, duration = DEFAULT_DURATIONS[NOTIFICATION_TYPES.SUCCESS]) {
    return this._showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration)
  }

  /**
   * Show error notification
   * @param {string} message - Error message
   * @param {number} duration - Duration in milliseconds (default: 5000)
   * @returns {number} Toast ID
   */
  error(message, duration = DEFAULT_DURATIONS[NOTIFICATION_TYPES.ERROR]) {
    return this._showNotification(message, NOTIFICATION_TYPES.ERROR, duration)
  }

  /**
   * Show warning notification
   * @param {string} message - Warning message
   * @param {number} duration - Duration in milliseconds (default: 4000)
   * @returns {number} Toast ID
   */
  warning(message, duration = DEFAULT_DURATIONS[NOTIFICATION_TYPES.WARNING]) {
    return this._showNotification(message, NOTIFICATION_TYPES.WARNING, duration)
  }

  /**
   * Show info notification
   * @param {string} message - Info message
   * @param {number} duration - Duration in milliseconds (default: 3000)
   * @returns {number} Toast ID
   */
  info(message, duration = DEFAULT_DURATIONS[NOTIFICATION_TYPES.INFO]) {
    return this._showNotification(message, NOTIFICATION_TYPES.INFO, duration)
  }

  /**
   * Show notification with custom type
   * @param {string} message - Message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   * @returns {number} Toast ID
   */
  show(message, type = NOTIFICATION_TYPES.INFO, duration = DEFAULT_DURATIONS[type]) {
    return this._showNotification(message, type, duration)
  }

  /**
   * Remove notification by ID
   * @param {number} id - Toast ID to remove
   */
  remove(id) {
    if (!this.toastContext) {
      console.warn('NotificationService: Toast context not initialized')
      return
    }
    this.toastContext.removeToast(id)
  }

  /**
   * Internal method to show notification
   * @private
   * @param {string} message - Message
   * @param {string} type - Type
   * @param {number} duration - Duration
   * @returns {number} Toast ID
   */
  _showNotification(message, type, duration) {
    if (!this.toastContext) {
      console.warn('NotificationService: Toast context not initialized')
      console.log(`[${type}] ${message}`)
      return null
    }

    return this.toastContext.addToast(message, type, duration)
  }
}

/**
 * Create global notification service instance
 */
const notificationService = new NotificationService()

/**
 * Register notification service with toast context
 * Call this from App.jsx during initialization
 * 
 * @param {Object} toastContext - Toast context from useToast()
 */
export function registerNotificationService(toastContext) {
  globalNotificationService = new NotificationService(toastContext)
  notificationService.setContext(toastContext)
}

/**
 * Hook for using notifications in components
 * 
 * @returns {NotificationService} Notification service instance
 * 
 * Example:
 *   const notify = useNotification()
 *   notify.success('Success!')
 *   notify.error('Error!')
 */
export function useNotification() {
  // Import here (inside hook) to avoid circular dependencies and React hook issues
  const { useToast } = require('@/context/ToastContext')
  const toastContext = useToast()
  return new NotificationService(toastContext)
}

/**
 * Get the global notification service
 * Used in services that can't use hooks
 * 
 * @returns {NotificationService} Global notification service instance
 * 
 * Example in service:
 *   import { getNotificationService } from '@services/notificationGateway'
 *   const notify = getNotificationService()
 *   notify.success('Job completed')
 */
export function getNotificationService() {
  if (!globalNotificationService) {
    // If not registered yet, return dummy service that logs to console
    return notificationService
  }
  return globalNotificationService
}

/**
 * Export service and types
 */
export default notificationService

export { NOTIFICATION_TYPES, DEFAULT_DURATIONS }
