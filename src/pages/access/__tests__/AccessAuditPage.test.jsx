import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AccessAudit from '../AccessAudit'

const AUDIT_LOG = [
  { action: 'ASSIGN_FUNCTION', user_id: 1, function_id: 10, grouper_id: null, segment_id: null, changed_by_user_id: 99, reason: 'Setup', timestamp: '2026-01-10T10:00:00Z' },
  { action: 'REVOKE_FUNCTION', user_id: 2, function_id: 11, grouper_id: null, segment_id: null, changed_by_user_id: 99, reason: 'Cleanup', timestamp: '2026-01-15T12:00:00Z' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: { loading: false, error: null, auditLog: AUDIT_LOG },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  __esModule: true,
  fetchAccessAudit: jest.fn((id) => ({ type: 'access/fetchAccessAudit', payload: id })),
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
}))

function renderPage() {
  return render(<MemoryRouter><AccessAudit /></MemoryRouter>)
}

describe('AccessAudit — UC_ACC_09', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('shows record count', () => {
    renderPage()
    expect(screen.getByText(/2 registros encontrados/i)).toBeInTheDocument()
  })

  it('shows Asignar Función and Revocar Función labels from audit log', () => {
    renderPage()
    expect(screen.getAllByText('Asignar Función').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Revocar Función').length).toBeGreaterThanOrEqual(1)
  })

  it('dispatches fetchAccessAudit when user is selected', () => {
    renderPage()
    const userSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(userSelect, { target: { value: '1' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('filters by action — shows only matching entries', () => {
    renderPage()
    const actionSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(actionSelect, { target: { value: 'ASSIGN_FUNCTION' } })
    expect(screen.getByText('1 registros encontrados')).toBeInTheDocument()
    // After filtering, only ASSIGN_FUNCTION badge appears (not REVOKE_FUNCTION badge)
    const revokeBadges = screen.queryAllByText('Revocar Función')
    // The option still exists in the select, so we check the badge count is 0
    const revokeBadgesInSpans = revokeBadges.filter(el => el.tagName === 'SPAN')
    expect(revokeBadgesInSpans).toHaveLength(0)
  })

  it('shows export CSV button', () => {
    renderPage()
    expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
  })
})
