import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PermissionsAudit from '../PermissionsAudit'

const mockDispatch = jest.fn()
const AUDIT_LOG = [
  { id: 1, action: 'ASSIGN_PERMISSION', user: 'user1', target: 'AUD-001', timestamp: '2026-01-01T10:00:00Z' },
  { id: 2, action: 'REVOKE_PERMISSION', user: 'user2', target: 'PIP-002', timestamp: '2026-01-02T11:00:00Z' },
  { id: 3, action: 'LOGIN', user: 'user3', target: null, timestamp: '2026-01-03T12:00:00Z' },
]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    access: { auditLog: AUDIT_LOG, loading: false, error: null },
  }),
}))

jest.mock('../../../redux/slices/access', () => ({
  fetchAccessAudit: jest.fn(() => ({ type: 'access/fetchAccessAudit' })),
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
}))

function renderPage() {
  return render(<MemoryRouter><PermissionsAudit /></MemoryRouter>)
}

describe('PermissionsAudit — uc-perm-10', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /auditoría de permisos/i, level: 1 })).toBeInTheDocument()
  })

  it('shows ASSIGN_PERMISSION entries', () => {
    renderPage()
    expect(screen.getByText(/ASSIGN_PERMISSION/i)).toBeInTheDocument()
  })

  it('shows REVOKE_PERMISSION entries', () => {
    renderPage()
    expect(screen.getByText(/REVOKE_PERMISSION/i)).toBeInTheDocument()
  })

  it('does NOT show non-permission actions like LOGIN', () => {
    renderPage()
    expect(screen.queryByText(/LOGIN/i)).not.toBeInTheDocument()
  })

  it('shows user and target columns', () => {
    renderPage()
    expect(screen.getByText('user1')).toBeInTheDocument()
    expect(screen.getByText('AUD-001')).toBeInTheDocument()
  })
})
