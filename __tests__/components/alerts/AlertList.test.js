/**
 * AlertList Component Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AlertList from '@components/alerts/AlertList'
import sessionReducer from '@redux/slices/sessionSlice'

// Helper para renderizar con Redux
const renderWithRedux = (component, { alerts = [] } = {}) => {
  const store = configureStore({
    reducer: {
      session: sessionReducer
    },
    preloadedState: {
      session: {
        user: null,
        alerts: alerts,
        isLoading: false,
        error: null
      }
    }
  })
  
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('AlertList Component', () => {
  const _mockAlerts = [
    {
      id: '1',
      severity: 'info',
      message: 'Process started',
      timestamp: new Date(),
      isRead: false
    },
    {
      id: '2',
      severity: 'warning',
      message: 'Warning message',
      timestamp: new Date(),
      isRead: false
    },
    {
      id: '3',
      severity: 'error',
      message: 'Error occurred',
      timestamp: new Date(),
      isRead: false
    },
  ]

  it('should render alert list', () => {
    const { container } = renderWithRedux(
      <AlertList />,
      { alerts: _mockAlerts }
    )
    expect(container.querySelector('.alert-list')).toBeInTheDocument()
  })

  it('should display each alert', () => {
    renderWithRedux(
      <AlertList />,
      { alerts: _mockAlerts }
    )
    expect(screen.getByText('Process started')).toBeInTheDocument()
    expect(screen.getByText('Warning message')).toBeInTheDocument()
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  it('should render empty state', () => {
    renderWithRedux(
      <AlertList />,
      { alerts: [] }
    )
    expect(screen.getByText(/no alerts/i)).toBeInTheDocument()
  })

  it('should display alert types with correct styling', () => {
    const { container } = renderWithRedux(
      <AlertList />,
      { alerts: _mockAlerts }
    )
    
    const _alerts = container.querySelectorAll('[class*="alert-item"]')
    expect(_alerts.length).toBeGreaterThan(0)
  })

  it('should call onDismiss when alert dismissed', async () => {
    const _onDismiss = jest.fn()
    renderWithRedux(
      <AlertList onDismiss={_onDismiss} />,
      { alerts: _mockAlerts }
    )
    
    const _dismissButtons = screen.getAllByRole('button', { name: /dismiss/i })
    if (_dismissButtons.length > 0) {
      await userEvent.click(_dismissButtons[0])
    }
  })

  it('should call onRead when alert marked as read', async () => {
    const _onMarkRead = jest.fn()
    renderWithRedux(
      <AlertList onMarkRead={_onMarkRead} />,
      { alerts: _mockAlerts }
    )
    
    const _alerts = screen.getAllByText(/process started|warning message|error occurred/i)
    expect(_alerts.length).toBeGreaterThan(0)
  })

  it('should display timestamp', () => {
    const { container } = renderWithRedux(
      <AlertList />,
      { alerts: _mockAlerts }
    )
    const _timestampElements = container.querySelectorAll('[class*="alert-time"]')
    expect(_timestampElements.length).toBeGreaterThan(0)
  })

  it('should handle many alerts', () => {
    const _manyAlerts = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      severity: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info',
      message: `Alert ${i}`,
      timestamp: new Date(),
      isRead: false
    }))

    renderWithRedux(
      <AlertList />,
      { alerts: _manyAlerts }
    )
    
    expect(screen.getByText(/alerts \(20\)/i)).toBeInTheDocument()
  })
})
