import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SeparationRules from '../SeparationRules'

const mockDispatch = jest.fn()

const SEPARATION_RULES = [
  { id: 1, code: 'SR-001', name: 'Pipeline vs Auditoria', description: 'Test rule 1', isActive: true, violations: 2 },
  { id: 2, code: 'SR-002', name: 'Usuario vs Auditoria', description: 'Test rule 2', isActive: false, violations: 0 },
]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    access: { separationRules: SEPARATION_RULES, loading: false, error: null, success: false },
  }),
}))

jest.mock('../../../redux/slices/access', () => ({
  fetchSeparationRules: jest.fn(() => ({ type: 'access/fetchSeparationRules' })),
  createSeparationRule: jest.fn((data) => ({ type: 'access/createSeparationRule', payload: data })),
  updateSeparationRule: jest.fn((data) => ({ type: 'access/updateSeparationRule', payload: data })),
  deleteSeparationRule: jest.fn((id) => ({ type: 'access/deleteSeparationRule', payload: id })),
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  selectSeparationRules: (s) => s.access.separationRules,
}))

import { fetchSeparationRules, createSeparationRule, updateSeparationRule, deleteSeparationRule } from '../../../redux/slices/access'

function renderPage() {
  return render(<MemoryRouter><SeparationRules /></MemoryRouter>)
}

describe('SeparationRules — uc-adm-01', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    fetchSeparationRules.mockClear()
    createSeparationRule.mockClear()
    updateSeparationRule.mockClear()
    deleteSeparationRule.mockClear()
  })

  it('renders page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /reglas de separación/i, level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchSeparationRules on mount', () => {
    renderPage()
    expect(fetchSeparationRules).toHaveBeenCalled()
  })

  it('renders separation rules from redux store', () => {
    renderPage()
    expect(screen.getByText(/Pipeline vs Auditoria/i)).toBeInTheDocument()
    expect(screen.getByText(/Usuario vs Auditoria/i)).toBeInTheDocument()
  })

  it('shows active/inactive status for rules', () => {
    renderPage()
    expect(screen.getAllByText(/activa/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/inactiva/i).length).toBeGreaterThan(0)
  })

  it('dispatches updateSeparationRule with toggled isActive when toggle is clicked', async () => {
    renderPage()
    const toggleBtn = screen.getAllByRole('button', { name: /activar|desactivar/i })[0]
    fireEvent.click(toggleBtn)
    await waitFor(() => {
      expect(updateSeparationRule).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(Number), isActive: expect.any(Boolean) })
      )
    })
  })

  it('dispatches deleteSeparationRule with rule id when delete is clicked', async () => {
    renderPage()
    const deleteBtn = screen.getAllByRole('button', { name: /eliminar/i })[0]
    fireEvent.click(deleteBtn)
    await waitFor(() => {
      expect(deleteSeparationRule).toHaveBeenCalledWith(SEPARATION_RULES[0].id)
    })
  })
})
