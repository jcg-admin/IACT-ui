/**
 * ActiveSessions Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ActiveSessions from '../ActiveSessions'

jest.mock('@facades/UserAuth', () => ({
  default: {
    checkSession: jest.fn().mockResolvedValue(true)
  }
}))

jest.mock('@services/notificationService', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn()
  }))
}))

describe('ActiveSessions Component', () => {
  it('should render page header', async () => {
    render(<ActiveSessions />)
    await waitFor(() => {
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    })
  })

  it('should load and display sessions', async () => {
    render(<ActiveSessions />)
    await waitFor(() => {
      expect(screen.getByText(/Chrome on MacOS/)).toBeInTheDocument()
    })
  })

  it('should show current session indicator', async () => {
    render(<ActiveSessions />)
    await waitFor(() => {
      expect(screen.getByText('Current')).toBeInTheDocument()
    })
  })
})
