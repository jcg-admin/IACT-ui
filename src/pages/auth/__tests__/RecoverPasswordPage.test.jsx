import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecoverPassword from '../RecoverPassword'

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
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
  })

  it('renders without crash', () => {
    renderPage()
    expect(screen.getByText('Recuperar contraseña')).toBeInTheDocument()
  })

  it('shows username field', () => {
    renderPage()
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument()
  })

  it('shows confirmation message after successful submit', async () => {
    mockDispatch.mockResolvedValueOnce(undefined)

    renderPage()

    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'testuser' },
    })
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/si el usuario existe/i)
      ).toBeInTheDocument()
    })
  })

  it('shows link to /login', () => {
    renderPage()
    const loginLink = screen.getByRole('link', { name: /volver al login/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.getAttribute('href')).toBe('/login')
  })
})
