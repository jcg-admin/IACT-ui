import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Profile from '../Profile'

const PROFILE_FIXTURE = {
  id: 1,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  notification_preferences: { email_notifications: true, push_notifications: false },
}

const mockGetMyProfile = jest.fn()
const mockUpdateMyProfile = jest.fn()

jest.mock('../../services/userGateway', () => ({
  __esModule: true,
  default: {
    getMyProfile: (...args) => mockGetMyProfile(...args),
    updateMyProfile: (...args) => mockUpdateMyProfile(...args),
  },
}))

describe('Profile (UC_USR_07)', () => {
  beforeEach(() => {
    mockGetMyProfile.mockResolvedValue(PROFILE_FIXTURE)
    mockUpdateMyProfile.mockResolvedValue({ ...PROFILE_FIXTURE })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders profile form with user data', async () => {
    render(<Profile />)
    await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument())
    expect(screen.getByDisplayValue('User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
  })

  it('shows first_name, last_name, email fields', async () => {
    render(<Profile />)
    await waitFor(() => expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument())
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
  })

  it('does not render password field', async () => {
    render(<Profile />)
    await waitFor(() => screen.getByDisplayValue('Test'))
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })

  it('username is displayed but disabled (read-only)', async () => {
    render(<Profile />)
    await waitFor(() => screen.getByDisplayValue('testuser'))
    expect(screen.getByDisplayValue('testuser')).toBeDisabled()
  })

  it('submit calls updateMyProfile with current form values', async () => {
    render(<Profile />)
    await waitFor(() => screen.getByDisplayValue('Test'))

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Updated' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockUpdateMyProfile).toHaveBeenCalledWith(
        expect.objectContaining({ first_name: 'Updated' })
      )
    })
  })

  it('shows success message on save', async () => {
    render(<Profile />)
    await waitFor(() => screen.getByDisplayValue('Test'))

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/actualizado/i)
    )
  })

  it('shows error message when updateMyProfile rejects', async () => {
    mockUpdateMyProfile.mockRejectedValue(new Error('Server error'))
    render(<Profile />)
    await waitFor(() => screen.getByDisplayValue('Test'))

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    )
  })

  it('email notification checkbox is checked per profile prefs', async () => {
    render(<Profile />)
    await waitFor(() => screen.getByDisplayValue('Test'))
    const emailNotif = screen.getByRole('checkbox', { name: /email/i })
    expect(emailNotif).toBeChecked()
    const pushNotif = screen.getByRole('checkbox', { name: /push/i })
    expect(pushNotif).not.toBeChecked()
  })
})
