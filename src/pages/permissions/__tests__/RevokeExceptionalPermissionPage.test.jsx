import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RevokeExceptionalPermission from '../RevokeExceptionalPermission'

const mockDispatch = jest.fn()

const MOCK_PERMISSIONS = [
  {
    id: 1001,
    permission_code: 'access:assign_function_groups',
    justification: 'Cobertura temporal por ausencia del responsable.',
    granted_by: 'admin.sistema',
    expires_at: '2026-06-01T23:59:00.000Z',
  },
  {
    id: 1002,
    permission_code: 'audit:export',
    justification: 'Acceso temporal para auditoría Q1.',
    granted_by: 'admin.sistema',
    expires_at: '2026-05-20T18:00:00.000Z',
  },
]

let mockPermissions = []

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        exceptionalPermissions: mockPermissions,
        loading: false,
        error: null,
      },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  __esModule: true,
  fetchExceptionalPermissions: jest.fn((id) => ({
    type: 'access/fetchExceptionalPermissions',
    payload: id,
  })),
  revokeExceptionalPermission: jest.fn((args) => ({
    type: 'access/revokeExceptionalPermission',
    payload: args,
  })),
  selectExceptionalPermissions: (s) => s.access.exceptionalPermissions,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  clearError: jest.fn(() => ({ type: 'access/clearError' })),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <RevokeExceptionalPermission />
    </MemoryRouter>
  )
}

describe('RevokeExceptionalPermission (UC-015)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockResolvedValue({ type: 'ok' })
    mockPermissions = []
  })

  it('renders search form', () => {
    renderPage()
    expect(screen.getByText('Revocar Permiso Excepcional')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buscar/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/ID de usuario/i)).toBeInTheDocument()
  })

  it('search button disabled when userId is empty', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Buscar/i })).toBeDisabled()
  })

  it('dispatches fetchExceptionalPermissions on search submit', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText(/ID de usuario/i), { target: { value: '42' } })
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }))
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('shows empty state when no permissions found', async () => {
    mockPermissions = []
    renderPage()
    fireEvent.change(screen.getByLabelText(/ID de usuario/i), { target: { value: '42' } })
    fireEvent.click(screen.getByRole('button', { name: /Buscar/i }))
    expect(screen.getByText(/No hay permisos excepcionales activos/i)).toBeInTheDocument()
  })

  it('renders permission list and shows confirm on revoke click', () => {
    mockPermissions = MOCK_PERMISSIONS
    renderPage()
    expect(screen.getByText('access:assign_function_groups')).toBeInTheDocument()
    expect(screen.getByText('audit:export')).toBeInTheDocument()

    const revokeButtons = screen.getAllByRole('button', { name: /Revocar/i })
    fireEvent.click(revokeButtons[0])
    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
  })

  it('dispatches revokeExceptionalPermission on confirm with revoke_reason', async () => {
    mockPermissions = MOCK_PERMISSIONS
    renderPage()
    const revokeButtons = screen.getAllByRole('button', { name: /Revocar/i })
    fireEvent.click(revokeButtons[0])
    const textarea = screen.getByLabelText(/Motivo de revocación/i)
    fireEvent.change(textarea, { target: { value: 'Acceso ya no necesario por cambio de rol' } })
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }))
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('confirm button disabled when revoke_reason < 10 chars', () => {
    mockPermissions = MOCK_PERMISSIONS
    renderPage()
    const revokeButtons = screen.getAllByRole('button', { name: /Revocar/i })
    fireEvent.click(revokeButtons[0])
    const textarea = screen.getByLabelText(/Motivo de revocación/i)
    fireEvent.change(textarea, { target: { value: 'corto' } })
    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeDisabled()
  })
})
