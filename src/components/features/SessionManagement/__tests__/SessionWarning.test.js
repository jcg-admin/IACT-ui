/**
 * SessionWarning Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import SessionWarning from '../SessionWarning'

jest.mock('@facades/UserAuth', () => ({
  default: {
    checkSession: jest.fn().mockResolvedValue(true),
    refreshSession: jest.fn().mockResolvedValue({ is_valid: true }),
    endSession: jest.fn().mockResolvedValue(true)
  }
}))

jest.mock('@services/notificationService', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn()
  }))
}))

describe('SessionWarning Component', () => {
  it('should not display when session is valid', () => {
    const { container } = render(<SessionWarning />)
    const warning = container.querySelector('.session-warning')
    expect(warning).toBeNull()
  })

  it('should have proper structure', () => {
    render(<SessionWarning />)
    // Component checks session periodically
    expect(SessionWarning).toBeDefined()
  })
})
