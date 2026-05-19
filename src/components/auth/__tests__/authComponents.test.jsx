import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginInput from '../LoginInput'
import PasswordStrength from '../PasswordStrength'

jest.mock('@hooks/usePasswordStrength', () => ({
  __esModule: true,
  default: (password) => {
    const score = password ? Math.min(password.length * 10, 100) : 0
    const strength = score >= 80 ? 'strong' : score >= 50 ? 'medium' : 'weak'
    return {
      strength,
      score,
      requirements: [
        { id: 'min', label: 'Mínimo 8 caracteres', met: password?.length >= 8 },
        { id: 'upper', label: 'Mayúscula', met: /[A-Z]/.test(password || '') },
      ],
    }
  },
}))

describe('LoginInput', () => {
  const defaults = {
    name: 'email',
    value: '',
    onChange: jest.fn(),
    label: 'Email',
  }

  it('renders label', () => {
    render(<LoginInput {...defaults} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<LoginInput {...defaults} error="Campo requerido" />)
    expect(screen.getByText('Campo requerido')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const onChange = jest.fn()
    render(<LoginInput {...defaults} onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test@test.com' } })
    expect(onChange).toHaveBeenCalled()
  })
})

describe('PasswordStrength', () => {
  it('returns null when no password', () => {
    const { container } = render(<PasswordStrength password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows strength label for weak password', () => {
    render(<PasswordStrength password="abc" />)
    expect(screen.getByText('Débil')).toBeInTheDocument()
  })

  it('shows requirements list', () => {
    render(<PasswordStrength password="abc" showRequirements={true} />)
    expect(screen.getByText('Requisitos:')).toBeInTheDocument()
  })
})
