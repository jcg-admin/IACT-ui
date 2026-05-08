/**
 * ActiveSessions Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import authReducer from '@redux/slices/authSlice'
import ActiveSessions from '../ActiveSessions'

jest.mock('@services/authService', () => ({
  __esModule: true,
  default: {
    getActiveSessions: jest.fn(),
    revokeSession: jest.fn().mockResolvedValue({}),
  },
}))

const { default: authService } = require('@services/authService')

const mockSessions = [
  {
    id: 'session-1',
    device: 'Chrome on MacOS',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    lastActive: new Date(Date.now() - 300_000).toISOString(),
    isCurrent: true,
  },
  {
    id: 'session-2',
    device: 'Safari on iPhone',
    ip: '192.168.1.101',
    location: 'San Francisco, CA',
    lastActive: new Date(Date.now() - 3_600_000).toISOString(),
    isCurrent: false,
  },
]

function makeStore(overrides = {}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessions: mockSessions,
        sessionsLoading: false,
        sessionsError: null,
        ...overrides,
      },
    },
  })
}

describe('ActiveSessions Component', () => {
  beforeEach(() => {
    authService.getActiveSessions.mockResolvedValue(mockSessions)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', async () => {
    render(<Provider store={makeStore()}><ActiveSessions /></Provider>)
    await waitFor(() => {
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    })
  })

  it('should display sessions from store', async () => {
    render(<Provider store={makeStore()}><ActiveSessions /></Provider>)
    await waitFor(() => {
      expect(screen.getByText('Chrome on MacOS')).toBeInTheDocument()
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument()
    })
  })

  it('should show current session indicator', async () => {
    render(<Provider store={makeStore()}><ActiveSessions /></Provider>)
    await waitFor(() => {
      expect(screen.getByText('Current')).toBeInTheDocument()
    })
  })

  it('should show revoke button only for non-current sessions', async () => {
    render(<Provider store={makeStore()}><ActiveSessions /></Provider>)
    await waitFor(() => {
      const revokeButtons = screen.getAllByText('Revoke Session')
      expect(revokeButtons).toHaveLength(1)
    })
  })

  it('should show loading state', async () => {
    authService.getActiveSessions.mockImplementation(() => new Promise(() => {}))
    render(
      <Provider store={makeStore({ sessions: [], sessionsLoading: true })}>
        <ActiveSessions />
      </Provider>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should show error message when sessionsError is set', async () => {
    // Reject so the thunk restores sessionsError after the pending state clears it
    authService.getActiveSessions.mockRejectedValue(new Error('Error al cargar sesiones'))
    render(
      <Provider store={makeStore({ sessions: [], sessionsError: 'Error al cargar sesiones' })}>
        <ActiveSessions />
      </Provider>
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al cargar sesiones')
    })
  })
})
