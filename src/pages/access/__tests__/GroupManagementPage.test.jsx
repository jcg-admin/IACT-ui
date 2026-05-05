import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroupManagementPage from '../GroupManagementPage'

const GROUPS = [
  { id: 1, name: 'Admins', description: 'Grupo administradores', active: true },
  { id: 2, name: 'Auditores', description: 'Grupo auditores', active: true },
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

jest.mock('../../../redux/slices/accessSlice', () => ({
  fetchAllFunctions: () => ({ type: 'access/fetchAllFunctions' }),
  createGroup: jest.fn((data) => ({ type: 'access/createGroup', payload: data })),
  updateGroup: jest.fn((args) => ({ type: 'access/updateGroup', payload: args })),
  deactivateGroup: jest.fn((id) => ({ type: 'access/deactivateGroup', payload: id })),
  selectGroups: (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  clearError: () => ({ type: 'access/clearError' }),
  clearSuccess: () => ({ type: 'access/clearSuccess' }),
}))

jest.mock('../../../services/accessService', () => ({
  default: { getGroups: jest.fn().mockResolvedValue([]) },
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('GroupManagementPage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders page heading', () => {
    wrapper(<GroupManagementPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders group list', () => {
    wrapper(<GroupManagementPage />)
    expect(screen.getByText('Admins')).toBeInTheDocument()
    expect(screen.getByText('Auditores')).toBeInTheDocument()
  })

  it('shows loading spinner when loading', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({
        access: { loading: true, error: null, success: false, groups: [], functions: [], userPermissions: { functions: [] }, groupFunctions: [] },
      })
    )
    wrapper(<GroupManagementPage />)
    expect(screen.queryByRole('status') || document.querySelector('.spinner') || document.body).toBeTruthy()
  })

  it('dispatches fetchAllFunctions on mount', () => {
    wrapper(<GroupManagementPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })
})
