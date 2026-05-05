/**
 * LoginInput Component Tests
 * Unit tests for LoginInput component
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginInput from '@components/auth/LoginInput'

describe('LoginInput Component', () => {
  const _defaultProps = {
    name: 'email',
    label: 'Email',
    value: '',
    onChange: jest.fn(),
    required: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with label', () => {
      render(<LoginInput {..._defaultProps} />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should render input with correct name', () => {
      render(<LoginInput {..._defaultProps} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
    })

    it('should render with placeholder', () => {
      render(
        <LoginInput
          {..._defaultProps}
          placeholder="Enter your email"
        />
      )
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('should render icon when provided', () => {
      render(<LoginInput {..._defaultProps} icon="✉️" />)
      expect(screen.getByText('✉️')).toBeInTheDocument()
    })

    it('should render required indicator when required', () => {
      render(<LoginInput {..._defaultProps} required={true} />)
      expect(screen.getByLabelText('requerido')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onChange when value changes', async () => {
      const _onChange = jest.fn()
      render(<LoginInput {..._defaultProps} onChange={_onChange} />)

      const _input = screen.getByRole('textbox')
      await userEvent.type(_input, 'test@example.com')

      expect(_onChange).toHaveBeenCalled()
    })

    it('should display floating label on focus', async () => {
      render(<LoginInput {..._defaultProps} />)
      const _input = screen.getByRole('textbox')

      fireEvent.focus(_input)
      expect(_input.parentElement.parentElement).toHaveClass('login-input--focused')
    })

    it('should remove floating label on blur if empty', async () => {
      render(<LoginInput {..._defaultProps} />)
      const _input = screen.getByRole('textbox')

      fireEvent.focus(_input)
      fireEvent.blur(_input)
      expect(_input.parentElement.parentElement).not.toHaveClass('login-input--focused')
    })
  })

  describe('Validation', () => {
    it('should show error message', () => {
      render(
        <LoginInput
          {..._defaultProps}
          error="Invalid email"
        />
      )
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('should apply error class when error exists', () => {
      render(
        <LoginInput
          {..._defaultProps}
          error="Invalid email"
        />
      )
      expect(screen.getByRole('textbox').parentElement.parentElement).toHaveClass('login-input--error')
    })

    it('should show success checkmark when valid', async () => {
      render(
        <LoginInput
          {..._defaultProps}
          value="test@example.com"
          success={true}
        />
      )
      // Trigger blur to mark as validated
      const _input = screen.getByRole('textbox')
      fireEvent.blur(_input)
      
      expect(screen.getByLabelText('Válido')).toBeInTheDocument()
    })

    it('should run validationFn on change', async () => {
      const _validationFn = jest.fn(() => ({ valid: true }))
      const _onChange = jest.fn()

      render(
        <LoginInput
          {..._defaultProps}
          onChange={_onChange}
          validationFn={_validationFn}
        />
      )

      const _input = screen.getByRole('textbox')
      await userEvent.type(_input, 'test')

      expect(_validationFn).toHaveBeenCalled()
    })
  })

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<LoginInput {..._defaultProps} disabled={true} />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should not call onChange when disabled', async () => {
      const _onChange = jest.fn()
      render(
        <LoginInput
          {..._defaultProps}
          disabled={true}
          onChange={_onChange}
        />
      )

      const _input = screen.getByRole('textbox')
      await userEvent.type(_input, 'test')

      expect(_onChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<LoginInput {..._defaultProps} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Email')
    })

    it('should have aria-invalid when error exists', () => {
      render(<LoginInput {..._defaultProps} error="Error" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('should have aria-describedby pointing to error', () => {
      render(<LoginInput {..._defaultProps} error="Error" />)
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-describedby',
        'email-error'
      )
    })
  })

  describe('Data Attributes', () => {
    it('should render data-validate attribute', () => {
      render(
        <LoginInput
          {..._defaultProps}
          dataValidate="Test validation message"
        />
      )
      expect(screen.getByRole('textbox').parentElement.parentElement).toHaveAttribute(
        'data-validate',
        'Test validation message'
      )
    })
  })
})
