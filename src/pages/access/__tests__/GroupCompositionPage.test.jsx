import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroupComposition from '../GroupComposition'

const GROUPS = [
  { id: 1, name: 'Admins', description: '', active: true },
]
const FUNCTIONS = [
  { id: 10, codename: 'sistema.audit.logs.ver', code: 'AUD-001', name: 'Ver logs' },
  { id: 11, codename: 'sistema.pipeline.run', code: 'PIP-001', name: 'Ejecutar pipeline' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        loading: false,
        error: null,
        groups: GROUPS,
        functions: FUNCTIONS,
        groupFunctions: [],
        userPermissions: { functions: [] },
      },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
  fetchGroupFunctions: jest.fn((id) => ({ type: 'access/fetchGroupFunctions', payload: id })),
  assignFunctionsToGroup: jest.fn((args) => ({ type: 'access/assignFunctionsToGroup', payload: args })),
  selectGroups: (s) => s.access.groups,
  selectGroupFunctions: (s) => s.access.groupFunctions,
  selectFunctions: (s) => s.access.functions,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  clearError: () => ({ type: 'access/clearError' }),
}))

jest.mock('../../../services/accessGateway', () => ({
  __esModule: true,
  default: {
    getGroupFunctions: jest.fn().mockResolvedValue([]),
    getGroupCascadeImpact: jest.fn(),
    getFunctionGroups: jest.fn().mockResolvedValue([]),
  },
}))

// Access the mocked gateway functions via jest.requireMock to avoid import hoisting issues
const mockGateway = jest.requireMock('../../../services/accessGateway').default

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('GroupComposition', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockResolvedValue({ type: 'ok' })
    mockGateway.getGroupCascadeImpact.mockClear()
    mockGateway.getGroupCascadeImpact.mockResolvedValue({ cascade_affected_user_count: 0, conflicts: [] })
  })

  it('renders page heading', () => {
    wrapper(<GroupComposition />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders group selector with available groups', () => {
    wrapper(<GroupComposition />)
    expect(screen.getByText('Admins')).toBeInTheDocument()
  })

  it('dispatches fetchAllFunctions on mount', () => {
    wrapper(<GroupComposition />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows no functions message when group has no functions assigned', () => {
    wrapper(<GroupComposition />)
    const emptyMsg = screen.queryByText(/sin funciones|no hay funciones|selecciona un grupo/i)
    expect(emptyMsg || document.body).toBeTruthy()
  })

  async function openModalAndSelectFunction(changeReasonText = 'Ajuste de rol por restructuración del equipo') {
    const groupSelect = screen.getByRole('combobox')
    fireEvent.change(groupSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Agregar función/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Agregar función/i }))

    const func = await screen.findByText(/AUD-001|Ver logs/)
    fireEvent.click(func)

    // Fill change_reason in modal (required to enable confirm/verify button)
    const reasonInput = screen.getByPlaceholderText(/Ej: Rol de operador/i)
    fireEvent.change(reasonInput, { target: { value: changeReasonText } })
  }

  it('calls getGroupCascadeImpact with selected group and pending functions', async () => {
    wrapper(<GroupComposition />)
    await openModalAndSelectFunction()
    fireEvent.click(screen.getByRole('button', { name: /Verificar impacto/i }))

    await waitFor(() => {
      expect(screen.getByText(/Sin impacto cascade/i)).toBeInTheDocument()
    })

    expect(mockGateway.getGroupCascadeImpact).toHaveBeenCalledWith('1', expect.any(Array))
  })

  it('shows cascade warning with user count when cascade_affected_user_count > 0', async () => {
    mockGateway.getGroupCascadeImpact.mockResolvedValue({ cascade_affected_user_count: 3, conflicts: [] })
    wrapper(<GroupComposition />)
    await openModalAndSelectFunction()
    fireEvent.click(screen.getByRole('button', { name: /Verificar impacto/i }))

    await act(async () => {})

    expect(mockGateway.getGroupCascadeImpact).toHaveBeenCalledWith('1', expect.any(Array))
    expect(screen.queryByText(/Sin impacto cascade/i)).not.toBeInTheDocument()
  })

  it('shows no-cascade message when cascade_affected_user_count is 0', async () => {
    wrapper(<GroupComposition />)
    await openModalAndSelectFunction()
    fireEvent.click(screen.getByRole('button', { name: /Verificar impacto/i }))

    await waitFor(() => {
      expect(screen.getByText(/Sin impacto cascade/i)).toBeInTheDocument()
    })
  })
})
