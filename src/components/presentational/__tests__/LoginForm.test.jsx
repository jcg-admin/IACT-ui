import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from '../LoginForm'

jest.mock('@ui/auth/LoginInput', () => ({
  __esModule: true,
  default: ({ label, name, value, onChange, error }) => (
    <div>
      <label>{label}</label>
      <input
        aria-label={label}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span>{error}</span>}
    </div>
  ),
}))

jest.mock('@ui/auth/PasswordStrength', () => ({
  __esModule: true,
  default: ({ password }) => password ? <div data-testid="password-strength" /> : null,
}))

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    render(<MemoryRouter><LoginForm onSubmit={jest.fn()} loading={false} error={null} /></MemoryRouter>)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('renders Iniciar Sesión submit button', () => {
    render(<MemoryRouter><LoginForm onSubmit={jest.fn()} loading={false} error={null} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<MemoryRouter><LoginForm onSubmit={jest.fn()} loading={true} error={null} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /iniciando/i })).toBeInTheDocument()
  })

  it('shows error banner when error prop provided', () => {
    render(<MemoryRouter><LoginForm onSubmit={jest.fn()} loading={false} error="Invalid credentials" /></MemoryRouter>)
    expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
  })

  it('calls onSubmit when form submitted', () => {
    const onSubmit = jest.fn()
    render(<MemoryRouter><LoginForm onSubmit={onSubmit} loading={false} error={null} /></MemoryRouter>)
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form'))
    expect(onSubmit).toHaveBeenCalled()
  })
})
