import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders'
import ChangePassword from '../ChangePassword'

const mockDispatch = jest.fn()
const mockNavigate = jest.fn()
const mockChangePassword = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@store/slices/auth', () => ({
  changePassword: (...args) => mockChangePassword(...args),
}))

jest.mock('../../../components/auth/PasswordStrength', () => ({
  __esModule: true,
  default: ({ password }) =>
    password ? <div data-testid="password-strength">{password}</div> : null,
}))

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Contraseña actual'), { target: { value: 'currentPass1' } })
  fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'newPassword1' } })
  fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: 'newPassword1' } })
  fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))
}

describe('ChangePassword', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockNavigate.mockClear()
    mockChangePassword.mockClear()
    mockChangePassword.mockReturnValue({ type: 'auth/changePassword' })
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ message: 'Contraseña actualizada', next_step: null }),
    }))
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders without crash', () => {
    renderWithProviders(<ChangePassword />)
    expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<ChangePassword />)

    fireEvent.change(screen.getByLabelText('Contraseña actual'), { target: { value: 'currentPass1' } })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'newPassword1' } })
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), { target: { value: 'differentPassword' } })
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('dispatches changePassword thunk from authSlice with valid data', async () => {
    renderWithProviders(<ChangePassword />)
    fillAndSubmit()

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'currentPass1',
        newPassword: 'newPassword1',
      })
    })
  })

  it('navigates to /dashboard when next_step is null', async () => {
    renderWithProviders(<ChangePassword />)
    fillAndSubmit()

    await waitFor(() => expect(screen.getByText(/contraseña cambiada/i)).toBeInTheDocument())
    jest.runAllTimers()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('navigates to next_step route when provided in response', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ message: 'ok', next_step: '/profile/setup' }),
    }))

    renderWithProviders(<ChangePassword />)
    fillAndSubmit()

    await waitFor(() => expect(screen.getByText(/contraseña cambiada/i)).toBeInTheDocument())
    jest.runAllTimers()
    expect(mockNavigate).toHaveBeenCalledWith('/profile/setup')
  })
})
