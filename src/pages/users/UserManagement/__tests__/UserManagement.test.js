/**
 * UserManagement Tests
 * 
 * Simple tests for user management functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UserManagement from '../UserManagement'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: (selector) => selector({
    user:   { users: [
      { id: '1', username: 'john_doe', email: 'john@test.com', first_name: 'John', last_name: 'Doe', access_groups: [], status: 'Active', created_at: '2024-01-15T10:30:00Z' },
      { id: '2', username: 'jane_smith', email: 'jane@test.com', first_name: 'Jane', last_name: 'Smith', access_groups: [], status: 'Active', created_at: '2024-02-20T14:45:00Z' },
    ], loading: false, error: null, total: 2, userDetail: null, actionLoading: false },
    access: { groups: [], functions: [], loading: false, error: null },
  }),
}))

jest.mock('../../../../redux/slices/user', () => ({
  fetchUsers:     jest.fn(() => ({ type: 'users/fetchUsers' })),
  createUser:     jest.fn(() => ({ type: 'users/createUser' })),
  deactivateUser: jest.fn(() => ({ type: 'users/deactivateUser' })),
  blockUser:      jest.fn(() => ({ type: 'users/blockUser' })),
  unblockUser:    jest.fn(() => ({ type: 'users/unblockUser' })),
  patchUser:      jest.fn(() => ({ type: 'users/patchUser' })),
  selectUsers:        (s) => s.user?.users ?? [],
  selectUsersLoading: (s) => s.user?.loading ?? false,
}))

jest.mock('../../../../redux/slices/access', () => ({
  selectGroups: (s) => s.access?.groups ?? [],
  assignGroupToUser: jest.fn((p) => ({ type: 'access/assignGroupToUser', payload: p })),
  revokeGroupFromUser: jest.fn((p) => ({ type: 'access/revokeGroupFromUser', payload: p })),
}))

jest.mock('../../../../components/access/GroupAssignModal', () => ({
  __esModule: true,
  default: ({ isOpen }) => isOpen ? <div data-testid="group-assign-modal" /> : null,
}))

// Mock façades before importing component
jest.mock('@facades/UserIdentity', () => ({
  default: {
    startSession: jest.fn().mockResolvedValue({ user_id: 'test' }),
    createAccount: jest.fn().mockResolvedValue({ user_id: 'new', username: 'newuser' }),
    loadProfile: jest.fn().mockResolvedValue({ user_id: 'test', username: 'testuser' }),
    endSession: jest.fn().mockResolvedValue(true),
    refreshSession: jest.fn().mockResolvedValue({ is_valid: true })
  }
}))

jest.mock('@facades/ReportExporter', () => ({
  default: {
    exportAsExcel: jest.fn().mockResolvedValue({ success: true }),
    exportAsPDF: jest.fn().mockResolvedValue({ success: true }),
    exportAsCSV: jest.fn().mockResolvedValue({ success: true }),
    batchExport: jest.fn().mockResolvedValue({ success: true })
  }
}))

jest.mock('@api/notificationGateway', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }))
}))

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', () => {
    render(<UserManagement />)
    expect(screen.getByText('User Management')).toBeInTheDocument()
  })

  it('should render create button', () => {
    render(<UserManagement />)
    expect(screen.getByText('Create User')).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<UserManagement />)
    expect(screen.getByPlaceholderText(/Search by username/)).toBeInTheDocument()
  })

  it('should load users on mount', async () => {
    render(<UserManagement />)
    
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })
  })

  it('should filter users on search', async () => {
    render(<UserManagement />)
    
    const searchInput = screen.getByPlaceholderText(/Search by username/)
    fireEvent.change(searchInput, { target: { value: 'john' } })
    
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })
  })

  it('should show form when Create User clicked', () => {
    render(<UserManagement />)
    
    const createButton = screen.getByText('Create User')
    fireEvent.click(createButton)
    
    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument()
  })

  it('should display results counter', async () => {
    render(<UserManagement />)
    
    await waitFor(() => {
      expect(screen.getByText(/Showing.*users/)).toBeInTheDocument()
    })
  })
})
