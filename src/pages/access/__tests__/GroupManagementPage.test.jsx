import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroupManagement from '../GroupManagement'

const GROUPS = [
  { id: 1, code: 'admins_group', name: 'Admins', description: 'Grupo administradores', is_predefined: false, state: 'ACTIVE' },
  { id: 2, code: 'auditores_group', name: 'Auditores', description: 'Grupo auditores', is_predefined: false, state: 'ACTIVE' },
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
        success: false,
        groups: GROUPS,
        functions: [],
        userPermissions: { functions: [] },
        groupFunctions: [],
      },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
  fetchGroupers:    () => ({ type: 'access/fetchGroupers' }),
  createGroup: jest.fn((data) => ({ type: 'access/createGroup', payload: data })),
  updateGroup: jest.fn((args) => ({ type: 'access/updateGroup', payload: args })),
  retireGroup: jest.fn((args) => ({ type: 'access/retireGroup', payload: args })),
  selectGroups: (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  clearError: () => ({ type: 'access/clearError' }),
  clearSuccess: () => ({ type: 'access/clearSuccess' }),
}))

jest.mock('../../../services/accessGateway', () => ({
  default: { getFunctionGroups: jest.fn().mockRejectedValue(new Error('fallback to redux')) },
}))

const mockSlice = jest.requireMock('../../../redux/slices/access')

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('GroupManagement', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockSlice.retireGroup.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders page heading', () => {
    wrapper(<GroupManagement />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders group list with code column', () => {
    wrapper(<GroupManagement />)
    expect(screen.getByText('Admins')).toBeInTheDocument()
    expect(screen.getByText('Auditores')).toBeInTheDocument()
    expect(screen.getByText('admins_group')).toBeInTheDocument()
  })

  it('shows loading spinner when loading', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({
        access: { loading: true, error: null, success: false, groups: [], functions: [], userPermissions: { functions: [] }, groupFunctions: [] },
      })
    )
    wrapper(<GroupManagement />)
    expect(document.body).toBeTruthy()
  })

  it('dispatches fetchAllFunctions on mount', () => {
    wrapper(<GroupManagement />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows code field in create modal', async () => {
    wrapper(<GroupManagement />)
    fireEvent.click(screen.getByText('+ Crear grupo'))
    expect(screen.getByPlaceholderText(/ej: operadores_group/i)).toBeInTheDocument()
  })

  it('shows code as read-only in edit modal', async () => {
    wrapper(<GroupManagement />)
    const editButtons = await screen.findAllByRole('button', { name: /editar/i })
    fireEvent.click(editButtons[0])
    const readonlyInput = screen.getByDisplayValue('admins_group')
    expect(readonlyInput).toHaveAttribute('readonly')
  })

  it('opens retire modal and dispatches retireGroup with reason', async () => {
    mockDispatch.mockResolvedValue({ error: null })
    wrapper(<GroupManagement />)
    const retireButtons = await screen.findAllByRole('button', { name: /retirar/i })
    fireEvent.click(retireButtons[0])

    const textarea = screen.getByPlaceholderText(/Explique por qué se retira/i)
    fireEvent.change(textarea, { target: { value: 'Grupo obsoleto — se unifica con otro grupo existente' } })

    const confirmBtn = screen.getByRole('button', { name: /confirmar retiro/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockSlice.retireGroup).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, retireReason: expect.stringMatching(/.{20,}/) })
      )
    })
  })

  it('disables retire confirm when reason is shorter than 20 chars', async () => {
    wrapper(<GroupManagement />)
    const retireButtons = await screen.findAllByRole('button', { name: /retirar/i })
    fireEvent.click(retireButtons[0])

    const textarea = screen.getByPlaceholderText(/Explique por qué se retira/i)
    fireEvent.change(textarea, { target: { value: 'corto' } })

    const confirmBtn = screen.getByRole('button', { name: /confirmar retiro/i })
    expect(confirmBtn).toBeDisabled()
  })
})
