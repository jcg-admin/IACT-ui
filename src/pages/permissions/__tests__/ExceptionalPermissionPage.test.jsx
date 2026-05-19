import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExceptionalPermission from '../ExceptionalPermission'

const mockDispatch = jest.fn()

const MOCK_FUNCTIONS = [
  { id: 1, codename: 'access:assign_function_groups', name: 'Asignar grupos de funciones' },
  { id: 2, codename: 'audit:export', name: 'Exportar auditoría' },
]

const MOCK_CURRENT_USER = { id: 99, username: 'admin.test' }

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        functions: MOCK_FUNCTIONS,
        loading: false,
        error: null,
        success: false,
      },
      auth: { user: MOCK_CURRENT_USER },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  __esModule: true,
  fetchAllFunctions: jest.fn(() => ({ type: 'access/fetchAllFunctions' })),
  grantExceptionalPermission: Object.assign(
    jest.fn((args) => ({ type: 'access/grantExceptionalPermission', payload: args })),
    { fulfilled: { match: jest.fn(() => false) } }
  ),
  selectFunctions: (s) => s.access.functions,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  clearError: jest.fn(() => ({ type: 'access/clearError' })),
  resetState: jest.fn(() => ({ type: 'access/resetState' })),
}))

jest.mock('../../../redux/selectors', () => ({
  selectUser: (s) => s.auth.user,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ExceptionalPermission />
    </MemoryRouter>
  )
}

describe('ExceptionalPermission (UC_PERM_03)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockResolvedValue({ type: 'access/grantExceptionalPermission' })
  })

  it('renders the form with all required fields', () => {
    renderPage()
    expect(screen.getByText('Conceder Permiso Excepcional')).toBeInTheDocument()
    expect(screen.getByLabelText(/ID de usuario destino/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Permiso a conceder/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Justificación/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fecha de vencimiento/i)).toBeInTheDocument()
  })

  it('submit button is disabled when form is incomplete', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Conceder permiso excepcional/i })
    expect(btn).toBeDisabled()
  })

  it('shows anti-self error when targetUserId matches currentUser id', () => {
    renderPage()
    const userInput = screen.getByLabelText(/ID de usuario destino/i)
    fireEvent.change(userInput, { target: { value: '99' } })
    expect(screen.getByRole('alert')).toHaveTextContent(/no puede concederse.*sí mismo/i)
  })

  it('submit button is disabled when anti-self detected', () => {
    renderPage()
    const userInput = screen.getByLabelText(/ID de usuario destino/i)
    fireEvent.change(userInput, { target: { value: '99' } })
    const btn = screen.getByRole('button', { name: /Conceder permiso excepcional/i })
    expect(btn).toBeDisabled()
  })

  it('shows justification length error when < 20 chars', () => {
    renderPage()
    const textarea = screen.getByLabelText(/Justificación/i)
    fireEvent.change(textarea, { target: { value: 'corto texto' } })
    expect(screen.getByText(/al menos 20 caracteres/i)).toBeInTheDocument()
  })

  it('dispatches grantExceptionalPermission on valid submit', async () => {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const future = futureDate.toISOString().split('T')[0]

    renderPage()
    fireEvent.change(screen.getByLabelText(/ID de usuario destino/i), { target: { value: '42' } })
    fireEvent.change(screen.getByLabelText(/Permiso a conceder/i), {
      target: { value: 'access:assign_function_groups' },
    })
    fireEvent.change(screen.getByLabelText(/Justificación/i), {
      target: { value: 'Cobertura temporal por ausencia del responsable.' },
    })
    fireEvent.change(screen.getByLabelText(/Fecha de vencimiento/i), {
      target: { value: future },
    })

    const btn = screen.getByRole('button', { name: /Conceder permiso excepcional/i })
    expect(btn).not.toBeDisabled()
    fireEvent.click(btn)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })
})
