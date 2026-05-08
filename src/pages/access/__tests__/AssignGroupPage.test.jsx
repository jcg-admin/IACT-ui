import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AssignGroup from '../AssignGroup'

const MOCK_GROUPS = [
  { id: 1, name: 'Supervisors' },
  { id: 2, name: 'Agents' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        groups: MOCK_GROUPS,
        loading: false,
        error: null,
        success: false,
      },
    }),
}))

jest.mock('../../../redux/slices/accessSlice', () => ({
  fetchAllFunctions: jest.fn(() => ({ type: 'access/fetchAllFunctions' })),
  assignGroupToUser: jest.fn((payload) => ({ type: 'access/assignGroupToUser', payload })),
  selectGroups: (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  clearError: jest.fn(() => ({ type: 'access/clearError' })),
  resetState: jest.fn(() => ({ type: 'access/resetState' })),
}))

import { assignGroupToUser } from '../../../redux/slices/accessSlice'

function wrap() {
  return render(<MemoryRouter><AssignGroup /></MemoryRouter>)
}

describe('AssignGroup — uc-acc-04 / uc-perm-01', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    assignGroupToUser.mockClear()
  })

  it('renders page heading', () => {
    wrap()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders userId input', () => {
    wrap()
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
  })

  it('renders group selector with available groups', () => {
    wrap()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Supervisors')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
  })

  it('dispatches assignGroupToUser with userId and groupId when form submitted', async () => {
    wrap()
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /asignar/i }))
    await waitFor(() => {
      expect(assignGroupToUser).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-42', groupId: '1' })
      )
    })
  })

  it('does not dispatch if userId is empty', async () => {
    wrap()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /asignar/i }))
    expect(assignGroupToUser).not.toHaveBeenCalled()
  })

  it('does not dispatch if no group is selected', async () => {
    wrap()
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.click(screen.getByRole('button', { name: /asignar/i }))
    expect(assignGroupToUser).not.toHaveBeenCalled()
  })

  it('shows error when error state is set', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({
        access: {
          groups: MOCK_GROUPS,
          loading: false,
          error: 'Error de asignación',
          success: false,
        },
      })
    )
    wrap()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    jest.restoreAllMocks()
  })

  it('shows success message when success state is set', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({
        access: {
          groups: MOCK_GROUPS,
          loading: false,
          error: null,
          success: true,
        },
      })
    )
    wrap()
    expect(screen.getByRole('status')).toBeInTheDocument()
    jest.restoreAllMocks()
  })
})
