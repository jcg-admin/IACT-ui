import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UserMenu from '../UserMenu'

const defaultProps = {
  userInfo: { name: 'Ana García', email: 'ana@example.com' },
  onLogout: jest.fn(),
  onSettings: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

function openDropdown() {
  fireEvent.click(screen.getByRole('button', { name: /user menu/i }))
}

describe('UserMenu — logout confirmation', () => {
  it('does NOT call onLogout immediately when logout button is clicked', () => {
    render(<UserMenu {...defaultProps} />)
    openDropdown()
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    expect(defaultProps.onLogout).not.toHaveBeenCalled()
  })

  it('opens ConfirmModal when logout button is clicked', () => {
    render(<UserMenu {...defaultProps} />)
    openDropdown()
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    expect(screen.getByRole('heading', { name: /cerrar sesión/i })).toBeInTheDocument()
  })

  it('calls onLogout when confirm button is clicked in modal', () => {
    render(<UserMenu {...defaultProps} />)
    openDropdown()
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onLogout when cancel button is clicked in modal', () => {
    render(<UserMenu {...defaultProps} />)
    openDropdown()
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(defaultProps.onLogout).not.toHaveBeenCalled()
  })

  it('closes modal when cancel is clicked', () => {
    render(<UserMenu {...defaultProps} />)
    openDropdown()
    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument()
  })
})

describe('UserMenu — dropdown basics', () => {
  it('renders user name in trigger button', () => {
    render(<UserMenu {...defaultProps} />)
    expect(screen.getByText(/ana garcía/i)).toBeInTheDocument()
  })

  it('shows dropdown when trigger is clicked', () => {
    render(<UserMenu {...defaultProps} />)
    openDropdown()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
  })
})
