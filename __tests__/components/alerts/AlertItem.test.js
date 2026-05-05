/**
 * AlertItem Component Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AlertItem from '@components/alerts/AlertItem'

describe('AlertItem Component', () => {
  const _mockAlert = {
    id: '1',
    severity: 'info',
    title: 'Test Alert',
    message: 'Test alert message',
    timestamp: new Date('2024-04-24'),
    isRead: false,
  }

  it('should render alert item', () => {
    const { container } = render(<AlertItem alert={_mockAlert} />)
    expect(container.querySelector('.alert-item')).toBeInTheDocument()
  })

  it('should display alert message', () => {
    render(<AlertItem alert={_mockAlert} />)
    expect(screen.getByText('Test alert message')).toBeInTheDocument()
  })

  it('should show correct alert type styling', () => {
    const { container } = render(<AlertItem alert={_mockAlert} />)
    expect(container.querySelector('.alert-item--info')).toBeInTheDocument()
  })

  it('should display icon based on alert type', () => {
    const { container } = render(<AlertItem alert={_mockAlert} />)
    const _icon = container.querySelector('.alert-item__icon')
    expect(_icon).toHaveClass('alert-item__icon--info')
  })

  it('should call onDismiss when dismiss button clicked', async () => {
    const _onDismiss = jest.fn()
    render(<AlertItem alert={_mockAlert} onDismiss={_onDismiss} />)

    const _dismissButton = screen.getByRole('button', { name: /dismiss/i })
    await userEvent.click(_dismissButton)

    expect(_onDismiss).toHaveBeenCalledWith('1')
  })

  it('should call onRead when clicked', async () => {
    const _onMarkRead = jest.fn()
    render(<AlertItem alert={_mockAlert} onMarkRead={_onMarkRead} onDismiss={jest.fn()} />)

    // Click en el botón "Mark Read" para marcar como leído
    const _markReadButton = screen.getByRole('button', { name: /mark read/i })
    await userEvent.click(_markReadButton)

    expect(_onMarkRead).toHaveBeenCalledWith('1')
  })

  it('should display timestamp', () => {
    render(<AlertItem alert={_mockAlert} />)
    // El componente usa toLocaleTimeString() que devuelve la hora
    // Simplemente verificar que hay un elemento con la clase alert-time
    const { container } = render(<AlertItem alert={_mockAlert} />)
    expect(container.querySelector('.alert-time')).toBeInTheDocument()
  })

  it('should handle different alert types', () => {
    const _types = ['info', 'warning', 'error', 'success']

    _types.forEach(_type => {
      const { container } = render(
        <AlertItem alert={{ ..._mockAlert, severity: _type }} />
      )
      expect(container.querySelector(`.alert-item--${_type}`)).toBeInTheDocument()
    })
  })
})
