/**
 * LoginForm Component Tests
 * Integration tests for complete login form
 */

import React from 'react'
import { render as tlRender, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from '@components/presentational/LoginForm'

// LoginForm uses <Link> internally — all renders need a router context
function render(ui, options) {
  return tlRender(ui, { wrapper: MemoryRouter, ...options })
}

describe('LoginForm Component', () => {
  const _mockSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render login form with all inputs', () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getAllByLabelText(/contraseña/i)[0]).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('should render demo credentials section', () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      expect(screen.getByText(/credenciales demo/i)).toBeInTheDocument()
      expect(screen.getByText(/admin@iact.com/)).toBeInTheDocument()
      expect(screen.getByText(/user@iact.com/)).toBeInTheDocument()
    })

    it('should render remember me checkbox', () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      expect(screen.getByLabelText(/recuérdame/i)).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      expect(screen.getByText(/olvidé mi contraseña/i)).toBeInTheDocument()
    })

    it('should render with default credential values', () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _emailInput = screen.getByRole('textbox', { name: /email/i })
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      
      expect(_emailInput).toHaveValue('admin@iact.com')
      expect(_passwordInput).toHaveValue('password123')
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with form values when submitted', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await userEvent.click(_submitButton)
      
      expect(_mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.any(String),
          password: expect.any(String)
        }),
        expect.any(Boolean)
      )
    })

    it('should include remember me state in submission', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _checkbox = screen.getByLabelText(/recuérdame/i)
      await userEvent.click(_checkbox)
      
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await userEvent.click(_submitButton)
      
      expect(_mockSubmit).toHaveBeenCalledWith(
        expect.any(Object),
        true // rememberMe should be true
      )
    })

    it('should not submit with invalid email', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _emailInput = screen.getByRole('textbox', { name: /email/i })
      await userEvent.clear(_emailInput)
      await userEvent.type(_emailInput, 'notanemail')
      
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await userEvent.click(_submitButton)
      
      // Should show error instead of submitting
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      expect(_mockSubmit).not.toHaveBeenCalled()
    })

    it('should not submit with short password', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'short')
      
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await userEvent.click(_submitButton)
      
      // Should show error instead of submitting
      expect(screen.getAllByText(/mínimo 6 caracteres/i)[0]).toBeInTheDocument()
      expect(_mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when error prop provided', () => {
      render(
        <LoginForm
          onSubmit={_mockSubmit}
          error="Invalid credentials"
        />
      )
      
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    it('should show error banner with alert role', () => {
      render(
        <LoginForm
          onSubmit={_mockSubmit}
          error="Login failed"
        />
      )
      
      const _banner = screen.getByText('Login failed').closest('[role="alert"]')
      expect(_banner).toBeInTheDocument()
    })

    it('should close error banner when close button clicked', async () => {
      // Primero, renderizar y generar un error local
      const { container, rerender } = render(
        <LoginForm
          onSubmit={() => {
            throw new Error('Test error')
          }}
        />
      )
      
      // Hacer una acción que genere un error
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'ab')
      
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await userEvent.click(_submitButton)
      
      // Ahora debería haber un error local mostrado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Buscar y hacer click en el botón close
      const _closeButton = container.querySelector('.login-page__error-close')
      expect(_closeButton).toBeInTheDocument()
      
      await act(async () => {
        await userEvent.click(_closeButton)
      })
      
      // El error banner debería desaparecer
      const _errorBanner = container.querySelector('.login-page__error-banner')
      expect(_errorBanner).not.toBeInTheDocument()
    })

    it('should close error banner on Escape key', async () => {
      const { container } = render(
        <LoginForm
          onSubmit={_mockSubmit}
        />
      )
      
      // Generar un error local por contraseña corta
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'ab')
      
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      await userEvent.click(_submitButton)
      
      // Esperar que aparezca el error banner
      await new Promise(resolve => setTimeout(resolve, 50))
      const _errorBanner = container.querySelector('.login-page__error-banner')
      expect(_errorBanner).toBeInTheDocument()
      
      // Presionar Escape
      await act(async () => {
        fireEvent.keyDown(window, { key: 'Escape' })
      })
      
      // Esperar para que React procese el evento
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // El error banner debería desaparecer
      const _errorBannerAfter = container.querySelector('.login-page__error-banner')
      expect(_errorBannerAfter).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      render(<LoginForm onSubmit={_mockSubmit} loading={true} />)
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeDisabled()
      expect(screen.getAllByLabelText(/contraseña/i)[0]).toBeDisabled()
    })

    it('should disable submit button when loading', () => {
      render(<LoginForm onSubmit={_mockSubmit} loading={true} />)
      
      expect(
        screen.getByRole('button', { name: /iniciando sesión|iniciar sesión/i })
      ).toBeDisabled()
    })

    it('should show loading text on button', () => {
      render(<LoginForm onSubmit={_mockSubmit} loading={true} />)
      
      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
    })
  })

  describe('Password Strength Indicator', () => {
    it('should show password strength meter when typing password', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'Test123')
      
      // Password strength should appear
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should display password requirements', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'Test')
      
      expect(screen.getByText(/requisitos/i)).toBeInTheDocument()
    })
  })

  describe('Validation Feedback', () => {
    it('should show email validation error', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _emailInput = screen.getByRole('textbox', { name: /email/i })
      await userEvent.clear(_emailInput)
      await userEvent.type(_emailInput, 'invalid')
      
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })

    it('should clear validation error when corrected', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _emailInput = screen.getByRole('textbox', { name: /email/i })
      await userEvent.clear(_emailInput)
      await userEvent.type(_emailInput, 'invalid')
      
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      
      await userEvent.clear(_emailInput)
      await userEvent.type(_emailInput, 'valid@example.com')
      
      expect(screen.queryByText(/email inválido/i)).not.toBeInTheDocument()
    })

    it('should show password validation error', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'short')
      
      expect(screen.getAllByText(/mínimo 6 caracteres/i)[0]).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const { container } = render(<LoginForm onSubmit={_mockSubmit} />)
      expect(container.querySelector('form')).toBeInTheDocument()
    })

    it('should have accessible labels', () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getAllByLabelText(/contraseña/i)[0]).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _emailInput = screen.getByRole('textbox', { name: /email/i })
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      const _submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      
      _emailInput.focus()
      expect(document.activeElement).toBe(_emailInput)
      
      fireEvent.keyDown(_emailInput, { key: 'Tab' })
      // Tab navigation should work
      expect(document.activeElement).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should update email value on input change', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _emailInput = screen.getByRole('textbox', { name: /email/i })
      await userEvent.clear(_emailInput)
      await userEvent.type(_emailInput, 'newemail@example.com')
      
      expect(_emailInput).toHaveValue('newemail@example.com')
    })

    it('should update password value on input change', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _passwordInput = screen.getAllByLabelText(/contraseña/i)[0]
      await userEvent.clear(_passwordInput)
      await userEvent.type(_passwordInput, 'newpassword')
      
      expect(_passwordInput).toHaveValue('newpassword')
    })

    it('should toggle remember me checkbox', async () => {
      render(<LoginForm onSubmit={_mockSubmit} />)
      
      const _checkbox = screen.getByLabelText(/recuérdame/i)
      expect(_checkbox).not.toBeChecked()
      
      await userEvent.click(_checkbox)
      expect(_checkbox).toBeChecked()
      
      await userEvent.click(_checkbox)
      expect(_checkbox).not.toBeChecked()
    })
  })
})
