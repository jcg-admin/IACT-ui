import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import UserManagement from '../UserManagement'

// Silence facade/service calls
jest.mock('@facades/UserIdentity', () => ({
  default: {
    startSession: jest.fn().mockResolvedValue({ user_id: 'test' }),
    createAccount: jest.fn().mockResolvedValue({}),
    loadProfile: jest.fn().mockResolvedValue({}),
    endSession: jest.fn().mockResolvedValue(true),
    refreshSession: jest.fn().mockResolvedValue({ is_valid: true }),
  },
}))
jest.mock('@facades/ReportExporter', () => ({
  default: {
    exportAsExcel: jest.fn().mockResolvedValue({ success: true }),
    exportAsPDF: jest.fn().mockResolvedValue({ success: true }),
    exportAsCSV: jest.fn().mockResolvedValue({ success: true }),
    batchExport: jest.fn().mockResolvedValue({ success: true }),
  },
}))
jest.mock('@api/notificationGateway', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn(),
  })),
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    access: { groups: [{ id: 1, name: 'Auditores', code: 'AUD' }], loading: false, error: null },
    user:   { users: [
      { id: '1', username: 'john_doe', email: 'j@test.com', first_name: 'John', last_name: 'Doe', access_groups: [], status: 'Active' },
      { id: '2', username: 'jane_smith', email: 'jane@test.com', first_name: 'Jane', last_name: 'Smith', access_groups: [], status: 'Active' },
    ], loading: false, error: null, total: 2, userDetail: null, actionLoading: false },
  }),
}))

jest.mock('../../../../redux/slices/user', () => ({
  fetchUsers:     jest.fn(() => ({ type: 'users/fetchUsers' })),
  createUser:     jest.fn(() => ({ type: 'users/createUser' })),
  deactivateUser: jest.fn(() => ({ type: 'users/deactivateUser' })),
  blockUser:      jest.fn(() => ({ type: 'users/blockUser' })),
  unblockUser:    jest.fn(() => ({ type: 'users/unblockUser' })),
  patchUser:      jest.fn(() => ({ type: 'users/patchUser' })),
  selectUsers:        (s) => s.user.users ?? [],
  selectUsersLoading: (s) => s.user.loading ?? false,
}))

jest.mock('../../../../redux/slices/access', () => ({
  selectGroups: (s) => s.access.groups,
  fetchGroupFunctions: jest.fn(() => ({ type: 'access/fetchGroupFunctions' })),
  assignGroupToUser: jest.fn((data) => ({ type: 'access/assignGroupToUser', payload: data })),
  revokeGroupFromUser: jest.fn((data) => ({ type: 'access/revokeGroupFromUser', payload: data })),
}))

import { assignGroupToUser, revokeGroupFromUser } from '../../../../redux/slices/access'

describe('UserManagement — group assign/revoke (uc-perm-01/02)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    assignGroupToUser.mockClear()
    revokeGroupFromUser.mockClear()
  })

  it('renders Asignar Grupo button for each user', async () => {
    render(<MemoryRouter><UserManagement /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /asignar grupo/i }).length).toBeGreaterThan(0)
    })
  })

  it('opens GroupAssignModal in assign mode when Asignar Grupo is clicked', async () => {
    render(<MemoryRouter><UserManagement /></MemoryRouter>)
    await waitFor(() => screen.getAllByRole('button', { name: /asignar grupo/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /asignar grupo/i })[0])
    expect(screen.getByRole('heading', { name: /asignar grupo/i })).toBeInTheDocument()
  })

  it('dispatches assignGroupToUser when group is selected and confirmed', async () => {
    render(<MemoryRouter><UserManagement /></MemoryRouter>)
    await waitFor(() => screen.getAllByRole('button', { name: /asignar grupo/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /asignar grupo/i })[0])
    fireEvent.click(screen.getByLabelText(/Auditores/i))
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(assignGroupToUser).toHaveBeenCalledWith(
        expect.objectContaining({ groupId: 1 })
      )
    })
  })

  it('renders Revocar Grupo button for each user', async () => {
    render(<MemoryRouter><UserManagement /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /revocar grupo/i }).length).toBeGreaterThan(0)
    })
  })

  it('opens GroupAssignModal in revoke mode when Revocar Grupo is clicked', async () => {
    render(<MemoryRouter><UserManagement /></MemoryRouter>)
    await waitFor(() => screen.getAllByRole('button', { name: /revocar grupo/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /revocar grupo/i })[0])
    expect(screen.getByRole('heading', { name: /revocar grupo/i })).toBeInTheDocument()
  })
})
