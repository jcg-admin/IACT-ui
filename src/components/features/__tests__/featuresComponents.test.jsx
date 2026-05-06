import React from 'react'
import { render, screen } from '@testing-library/react'
import { ToastProvider } from '../../../context/ToastContext'

jest.mock('../../../facades/UserAuth', () => ({
  __esModule: true,
  default: {
    checkSession: jest.fn().mockResolvedValue(true),
    loadProfile: jest.fn().mockResolvedValue({ name: 'Test User' }),
    terminateSession: jest.fn().mockResolvedValue(true),
  },
}))

jest.mock('@services/notificationService', () => ({
  getNotificationService: () => ({
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}))

describe('SessionManager', () => {
  it('renders children while loading', () => {
    const SessionManager = require('../SessionManagement/SessionManager').default
    render(
      <SessionManager>
        <p>child content</p>
      </SessionManager>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})

describe('ActiveSessions', () => {
  it('renders without crashing', () => {
    const ActiveSessions = require('../SessionManagement/ActiveSessions').default
    const { container } = render(<ActiveSessions />)
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
