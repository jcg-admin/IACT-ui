import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecoverPassword from '../RecoverPassword'

const mockDispatch = jest.fn()
const mockRecoverPassword = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@store/slices/auth', () => ({
  recoverPassword: (...args) => mockRecoverPassword(...args),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <RecoverPassword />
    </MemoryRouter>
  )
}

describe('RecoverPassword', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockRecoverPassword.mockClear()
    mockRecoverPassword.mockReturnValue({ type: 'auth/recoverPassword' })
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({}),
    }))
  })

  it('renders without crash', () => {
    renderPage()
    expect(screen.getByText('Recuperar contraseña')).toBeInTheDocument()
  })

  it('shows username field', () => {
    renderPage()
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument()
  })

  it('dispatches recoverPassword thunk from authSlice on submit', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'testuser' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }))

    await waitFor(() => {
      expect(mockRecoverPassword).toHaveBeenCalledWith('testuser')
    })
  })

  it('shows confirmation message after successful submit', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'testuser' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }))

    await waitFor(() => {
      expect(screen.getByText(/si el usuario existe/i)).toBeInTheDocument()
    })
  })

  it('shows error message when dispatch rejects', async () => {
    mockDispatch.mockImplementation(() => ({
      type: 'auth/recoverPassword',
      unwrap: () => Promise.reject(new Error('Error al enviar la solicitud. Intenta de nuevo.')),
    }))

    renderPage()

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'unknown' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows link to /login', () => {
    renderPage()
    const loginLink = screen.getByRole('link', { name: /volver al login/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.getAttribute('href')).toBe('/login')
  })
})
