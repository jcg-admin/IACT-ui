import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ToastProvider } from '../../../context/ToastContext'

jest.mock('../../../facades/UserAuth', () => ({
  __esModule: true,
  default: {
    checkSession: jest.fn().mockResolvedValue(true),
    loadProfile: jest.fn().mockResolvedValue({ name: 'Test User' }),
    terminateSession: jest.fn().mockResolvedValue(true),
  },
}))

jest.mock('@services/authService', () => ({
  __esModule: true,
  default: {
    getActiveSessions: jest.fn().mockResolvedValue([]),
    revokeSession: jest.fn().mockResolvedValue({}),
  },
}))

jest.mock('@services/notificationService', () => ({
  getNotificationService: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}))

describe('SessionProvider', () => {
  it('renders children while loading', () => {
    const SessionProvider = require('../SessionManagement/SessionProvider').default
    render(
      <SessionProvider>
        <p>child content</p>
      </SessionProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})

describe('ActiveSessions', () => {
  it('renders without crashing', () => {
    const authReducer = require('@redux/slices/authSlice').default
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: { user: null, isAuthenticated: false, isLoading: false, error: null, sessions: [], sessionsLoading: false, sessionsError: null },
      },
    })
    const ActiveSessions = require('../SessionManagement/ActiveSessions').default
    const { container } = render(<Provider store={store}><ActiveSessions /></Provider>)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('LoginHistory', () => {
  it('renders without crashing', () => {
    const LoginHistory = require('../SessionManagement/LoginHistory').default
    const { container } = render(<LoginHistory />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('SessionWarning', () => {
  it('renders nothing when not visible', () => {
    const SessionWarning = require('../SessionManagement/SessionWarning').default
    const { container } = render(<SessionWarning isVisible={false} onExtend={jest.fn()} onLogout={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('SettingsPage', () => {
  it('renders Configuración heading', () => {
    const SettingsPage = require('../Settings/SettingsPage').default
    render(
      <ToastProvider>
        <SettingsPage />
      </ToastProvider>
    )
    expect(screen.getByText('Configuración')).toBeInTheDocument()
  })
})
