import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders'
import ChangePasswordPage from '../ChangePasswordPage'

const mockDispatch = jest.fn()
const mockNavigate = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../../components/auth/PasswordStrength', () => ({
  __esModule: true,
  default: ({ password }) =>
    password ? <div data-testid="password-strength">{password}</div> : null,
}))

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockNavigate.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders without crash', () => {
    renderWithProviders(<ChangePasswordPage />)
    expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<ChangePasswordPage />)

    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'currentPass1' },
    })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPassword1' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'differentPassword' },
    })

    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('dispatches changePassword thunk with valid data', async () => {
    mockDispatch.mockResolvedValueOnce(undefined)

    renderWithProviders(<ChangePasswordPage />)

    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'currentPass1' },
    })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPassword1' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newPassword1' },
    })

    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(1)
    })
  })

  it('shows success message and redirects after successful change', async () => {
    mockDispatch.mockResolvedValueOnce(undefined)

    renderWithProviders(<ChangePasswordPage />)

    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'currentPass1' },
    })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPassword1' },
    })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newPassword1' },
    })

    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    await waitFor(() => {
      expect(screen.getByText(/contraseña cambiada/i)).toBeInTheDocument()
    })

    jest.runAllTimers()

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
