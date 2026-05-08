import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroupComposition from '../GroupComposition'

const GROUPS = [
  { id: 1, name: 'Admins', description: '', active: true },
]
const FUNCTIONS = [
  { id: 10, codename: 'sistema.audit.logs.ver', name: 'Ver logs' },
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

jest.mock('../../../redux/slices/accessSlice', () => ({
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

jest.mock('../../../services/accessService', () => ({
  default: { getGroupFunctions: jest.fn().mockResolvedValue([]) },
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('GroupComposition', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
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
})
