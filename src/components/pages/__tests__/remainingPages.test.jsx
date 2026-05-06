import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

jest.mock('@services/notificationService', () => ({
  getNotificationService: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn() }),
}))

jest.mock('../../../facades/UserAuth', () => ({
  __esModule: true,
  default: {
    loadUsers: jest.fn().mockResolvedValue([]),
    createUser: jest.fn().mockResolvedValue({ id: 1 }),
    updateUser: jest.fn().mockResolvedValue({ id: 1 }),
    deleteUser: jest.fn().mockResolvedValue(true),
  },
}))

jest.mock('../../../facades/ReportExporter', () => ({
  __esModule: true,
  default: { exportUsers: jest.fn().mockResolvedValue({ url: '/file' }) },
}))

jest.mock('../UserManagement/UserList', () => ({
  __esModule: true,
  default: ({ onEdit, onDelete }) => <div data-testid="user-list" />,
}))

jest.mock('../UserManagement/UserForm', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel }) => (
    <div data-testid="user-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

jest.mock('../../access/PermissionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="permissions-table" />,
}))

jest.mock('../../access/FunctionSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="function-selector" />,
}))

jest.mock('@redux/slices/alertsSlice', () => ({
  fetchAlerts: jest.fn(() => (dispatch) => Promise.resolve([])),
  updateAlert: jest.fn(() => ({ type: 'alerts/updateAlert' })),
  selectAlerts: (s) => s.alerts?.alerts ?? [],
  selectSubscriptions: (s) => s.alerts?.subscriptions ?? [],
}))

jest.mock('@redux/slices/accessSlice', () => ({
  fetchUserPermissions: jest.fn(() => (dispatch) => Promise.resolve([])),
  fetchAllFunctions: jest.fn(() => (dispatch) => Promise.resolve([])),
  revokeFunction: jest.fn(() => (dispatch) => Promise.resolve(true)),
  selectUserPermissions: (s) => s.access?.userPermissions ?? [],
  selectFunctions: (s) => s.access?.functions ?? [],
  selectLoading: (s) => s.access?.loading ?? false,
  selectError: (s) => s.access?.error ?? null,
}))

jest.mock('@redux/selectors', () => ({
  selectUser: (s) => s.auth?.user ?? null,
  selectIsAuthenticated: (s) => s.auth?.isAuthenticated ?? false,
}))

function buildStore(extra = {}) {
  return configureStore({
    reducer: {
      auth: (state = { user: { id: 1, first_name: 'Ana' }, isAuthenticated: true }) => state,
      alerts: (state = { alerts: [], subscriptions: [], loading: false, error: null }) => state,
      access: (state = { userPermissions: [], functions: [], loading: false, error: null }) => state,
    },
  })
}

function wrap(ui) {
  return render(<Provider store={buildStore()}>{ui}</Provider>)
}

describe('UserManagement page', () => {
  it('renders user management heading', () => {
    const UserManagement = require('../UserManagement/UserManagement').default
    wrap(<UserManagement />)
    expect(screen.getByTestId('user-list')).toBeInTheDocument()
  })
})

describe('AlertsPage', () => {
  it('renders without crashing', () => {
    const AlertsPage = require('../Alerts/AlertsPage').default
    const { container } = wrap(<AlertsPage />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('AccessPage', () => {
  it('renders permissions table', () => {
    const AccessPage = require('../Access/AccessPage').default
    wrap(<AccessPage />)
    expect(screen.getByTestId('permissions-table')).toBeInTheDocument()
  })
})
