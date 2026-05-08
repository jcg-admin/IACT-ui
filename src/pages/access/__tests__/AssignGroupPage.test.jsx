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
        validatingGroup: false,
        error: null,
        success: false,
      },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  __esModule: true,
  assignGroupToUser: Object.assign(
    jest.fn((payload) => ({ type: 'access/assignGroupToUser', payload })),
    { fulfilled: { match: jest.fn() } }
  ),
  validateGroupAssignment: Object.assign(
    jest.fn((args) => ({ type: 'access/validateGroupAssignment', payload: args })),
    {
      fulfilled: {
        match: jest.fn((action) => action?.type === 'access/validateGroupAssignment/fulfilled'),
      },
    }
  ),
  selectGroups: (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectValidatingGroup: (s) => s.access.validatingGroup ?? false,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  clearError: jest.fn(() => ({ type: 'access/clearError' })),
  resetState: jest.fn(() => ({ type: 'access/resetState' })),
}))

import { assignGroupToUser, validateGroupAssignment } from '../../../redux/slices/access'

function wrap() {
  return render(<MemoryRouter><AssignGroup /></MemoryRouter>)
}

describe('AssignGroup — uc-acc-04 / uc-perm-01 (2-step validation)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    assignGroupToUser.mockClear()
    validateGroupAssignment.mockClear()
    mockDispatch.mockResolvedValue({ type: 'access/validateGroupAssignment/fulfilled', payload: { valid: true, conflicts: [] } })
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
    expect(screen.getByRole('combobox', { name: /grupo/i })).toBeInTheDocument()
    expect(screen.getByText('Supervisors')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
  })

  it('shows "Verificar separación" button initially', () => {
    wrap()
    expect(screen.getByRole('button', { name: /Verificar separación/i })).toBeInTheDocument()
  })

  it('Verificar button disabled when userId empty', () => {
    wrap()
    const btn = screen.getByRole('button', { name: /Verificar separación/i })
    expect(btn).toBeDisabled()
  })

  it('dispatches validateGroupAssignment when Verificar is clicked', async () => {
    validateGroupAssignment.fulfilled.match.mockReturnValue(true)
    wrap()
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByRole('combobox', { name: /grupo/i }), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar separación/i }))
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('shows no-conflicts panel and Asignar button after successful validation', async () => {
    validateGroupAssignment.fulfilled.match.mockReturnValue(true)
    wrap()
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByRole('combobox', { name: /grupo/i }), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar separación/i }))
    await waitFor(() => {
      expect(screen.getByText(/Sin conflictos de separación/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Asignar grupo/i })).not.toBeDisabled()
  })

  it('shows HARD conflict and blocks submit', async () => {
    mockDispatch.mockResolvedValue({
      type: 'access/validateGroupAssignment/fulfilled',
      payload: {
        valid: false,
        conflicts: [{ rule: 'SR-001', severity: 'HARD', message: 'Hard conflict', setA: [], setB: [] }],
      },
    })
    validateGroupAssignment.fulfilled.match.mockReturnValue(true)
    wrap()
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-99' } })
    fireEvent.change(screen.getByRole('combobox', { name: /grupo/i }), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Verificar separación/i }))
    await waitFor(() => {
      expect(screen.getByText('HARD')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Asignar grupo/i })).toBeDisabled()
  })

  it('shows error when error state is set', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({
        access: { groups: MOCK_GROUPS, loading: false, validatingGroup: false, error: 'Error de asignación', success: false },
      })
    )
    wrap()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    jest.restoreAllMocks()
  })

  it('shows success message when success state is set', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({
        access: { groups: MOCK_GROUPS, loading: false, validatingGroup: false, error: null, success: true },
      })
    )
    wrap()
    expect(screen.getByRole('status')).toBeInTheDocument()
    jest.restoreAllMocks()
  })
})
