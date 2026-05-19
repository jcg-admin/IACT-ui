/**
 * notificationService Tests
 * 
 * Test notification service methods
 * Tests cover:
 * - Success notifications
 * - Error notifications
 * - Warning notifications
 * - Info notifications
 * - Custom notifications
 * - Durations and types
 * - Remove notifications
 */

import {
  default as notificationService,
  getNotificationService,
  registerNotificationService,
  NOTIFICATION_TYPES,
  DEFAULT_DURATIONS,
} from '@api/notificationGateway'

describe('notificationService', () => {
  let mockToastContext

  beforeEach(() => {
    // Create mock toast context
    mockToastContext = {
      addToast: jest.fn((message, type, duration) => {
        return Date.now() // Return a mock ID
      }),
      removeToast: jest.fn(),
      toasts: [],
    }

    // Register the service
    registerNotificationService(mockToastContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('NOTIFICATION_TYPES', () => {
    it('should have all notification types', () => {
      expect(NOTIFICATION_TYPES.SUCCESS).toBe('success')
      expect(NOTIFICATION_TYPES.ERROR).toBe('error')
      expect(NOTIFICATION_TYPES.WARNING).toBe('warning')
      expect(NOTIFICATION_TYPES.INFO).toBe('info')
    })
  })

  describe('DEFAULT_DURATIONS', () => {
    it('should have durations for all types', () => {
      expect(DEFAULT_DURATIONS[NOTIFICATION_TYPES.SUCCESS]).toBe(3000)
      expect(DEFAULT_DURATIONS[NOTIFICATION_TYPES.ERROR]).toBe(5000)
      expect(DEFAULT_DURATIONS[NOTIFICATION_TYPES.WARNING]).toBe(4000)
      expect(DEFAULT_DURATIONS[NOTIFICATION_TYPES.INFO]).toBe(3000)
    })

    it('should have error duration longer than success', () => {
      expect(DEFAULT_DURATIONS[NOTIFICATION_TYPES.ERROR]).toBeGreaterThan(
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.SUCCESS]
      )
    })
  })

  describe('success(message, duration)', () => {
    it('should call addToast with success type', () => {
      const message = 'Operation successful'
      notificationService.success(message)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.SUCCESS,
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.SUCCESS]
      )
    })

    it('should allow custom duration', () => {
      const message = 'Success'
      const customDuration = 5000
      notificationService.success(message, customDuration)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.SUCCESS,
        customDuration
      )
    })

    it('should return toast ID', () => {
      const id = notificationService.success('Success')
      expect(id).toBeDefined()
    })
  })

  describe('error(message, duration)', () => {
    it('should call addToast with error type', () => {
      const message = 'Operation failed'
      notificationService.error(message)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.ERROR,
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.ERROR]
      )
    })

    it('should use longer default duration for errors', () => {
      notificationService.error('Error')

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        'Error',
        NOTIFICATION_TYPES.ERROR,
        5000 // Error has 5 second default
      )
    })

    it('should allow custom duration', () => {
      const message = 'Error'
      const customDuration = 10000
      notificationService.error(message, customDuration)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.ERROR,
        customDuration
      )
    })
  })

  describe('warning(message, duration)', () => {
    it('should call addToast with warning type', () => {
      const message = 'Warning message'
      notificationService.warning(message)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.WARNING,
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.WARNING]
      )
    })

    it('should allow custom duration', () => {
      const message = 'Warning'
      const customDuration = 6000
      notificationService.warning(message, customDuration)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.WARNING,
        customDuration
      )
    })
  })

  describe('info(message, duration)', () => {
    it('should call addToast with info type', () => {
      const message = 'Information message'
      notificationService.info(message)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.INFO,
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.INFO]
      )
    })

    it('should allow custom duration', () => {
      const message = 'Info'
      const customDuration = 4000
      notificationService.info(message, customDuration)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.INFO,
        customDuration
      )
    })
  })

  describe('show(message, type, duration)', () => {
    it('should show custom notification type', () => {
      const message = 'Custom message'
      notificationService.show(message, NOTIFICATION_TYPES.WARNING, 5000)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        message,
        NOTIFICATION_TYPES.WARNING,
        5000
      )
    })

    it('should use default duration if not specified', () => {
      notificationService.show('Message', NOTIFICATION_TYPES.ERROR)

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        'Message',
        NOTIFICATION_TYPES.ERROR,
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.ERROR]
      )
    })

    it('should default to info type if not specified', () => {
      notificationService.show('Message')

      expect(mockToastContext.addToast).toHaveBeenCalledWith(
        'Message',
        NOTIFICATION_TYPES.INFO,
        DEFAULT_DURATIONS[NOTIFICATION_TYPES.INFO]
      )
    })
  })

  describe('remove(id)', () => {
    it('should call removeToast with id', () => {
      const id = 12345
      notificationService.remove(id)

      expect(mockToastContext.removeToast).toHaveBeenCalledWith(id)
    })

    it('should handle removal of non-existent toast', () => {
      const id = 99999
      notificationService.remove(id)

      expect(mockToastContext.removeToast).toHaveBeenCalledWith(id)
    })
  })

  describe('registerNotificationService(context)', () => {
    it('should register notification service with context', () => {
      const newContext = {
        addToast: jest.fn(),
        removeToast: jest.fn(),
        toasts: [],
      }

      registerNotificationService(newContext)

      // Service should now use new context
      notificationService.success('Test')
      expect(newContext.addToast).toHaveBeenCalled()
    })
  })

  describe('getNotificationService()', () => {
    it('should return notification service instance', () => {
      const service = getNotificationService()
      expect(service).toBeDefined()
      expect(typeof service.success).toBe('function')
      expect(typeof service.error).toBe('function')
      expect(typeof service.warning).toBe('function')
      expect(typeof service.info).toBe('function')
    })

    it('should return instance with same methods after registration', () => {
      const mockContext = {
        addToast: jest.fn(),
        removeToast: jest.fn(),
        toasts: [],
      }

      registerNotificationService(mockContext)
      const service = getNotificationService()

      service.success('Test')
      expect(mockContext.addToast).toHaveBeenCalled()
    })
  })

  describe('Graceful degradation', () => {
    it('should handle missing context gracefully in show', () => {
      // Create service without context
      const serviceWithoutContext = notificationService
      serviceWithoutContext.toastContext = null

      // Should not throw error
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      serviceWithoutContext.success('Message')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle missing context gracefully in remove', () => {
      const serviceWithoutContext = notificationService
      serviceWithoutContext.toastContext = null

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      serviceWithoutContext.remove(123)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Multiple notifications', () => {
    it('should handle multiple notifications sequentially', () => {
      notificationService.success('Success 1')
      notificationService.error('Error 1')
      notificationService.warning('Warning 1')
      notificationService.info('Info 1')

      expect(mockToastContext.addToast).toHaveBeenCalledTimes(4)
    })

    it('should return valid IDs for multiple notifications', () => {
      const id1 = notificationService.success('First')
      const id2 = notificationService.error('Second')

      // Both IDs should be defined and truthy
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      // They may or may not be different (same timestamp possible)
      // but both should exist
    })
  })
})
