/**
 * LoginHistory Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import LoginHistory from '../LoginHistory'

jest.mock('@services/notificationGateway', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn()
  }))
}))

describe('LoginHistory Component', () => {
  it('should render page header', async () => {
    render(<LoginHistory />)
    await waitFor(() => {
      expect(screen.getByText('Login History')).toBeInTheDocument()
    })
  })

  it('should display login history table', async () => {
    render(<LoginHistory />)
    await waitFor(() => {
      expect(screen.getByText(/Chrome on MacOS/)).toBeInTheDocument()
    })
  })

  it('should display table headers', async () => {
    render(<LoginHistory />)
    await waitFor(() => {
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('Device')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
    })
  })

  it('should have status badges', async () => {
    render(<LoginHistory />)
    await waitFor(() => {
      // At least one status badge should be present
      const badges = screen.queryAllByText(/SUCCESS|FAILED/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })
})
