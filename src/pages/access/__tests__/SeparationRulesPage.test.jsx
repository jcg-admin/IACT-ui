import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SeparationRulesPage from '../SeparationRulesPage'

const mockDispatch = jest.fn()

const SOD_RULES = [
  { id: 1, code: 'SOD-001', name: 'Pipeline vs Auditoria', description: 'Test rule 1', isActive: true, violations: 2 },
  { id: 2, code: 'SOD-002', name: 'Usuario vs Auditoria', description: 'Test rule 2', isActive: false, violations: 0 },
]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    access: { separationRules: SOD_RULES, loading: false, error: null, success: false },
  }),
}))

jest.mock('../../../redux/slices/accessSlice', () => ({
  fetchSodRules: jest.fn(() => ({ type: 'access/fetchSodRules' })),
  createSodRule: jest.fn((data) => ({ type: 'access/createSodRule', payload: data })),
  updateSodRule: jest.fn((data) => ({ type: 'access/updateSodRule', payload: data })),
  deleteSodRule: jest.fn((id) => ({ type: 'access/deleteSodRule', payload: id })),
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  selectSeparationRules: (s) => s.access.separationRules,
}))

import { fetchSodRules, createSodRule, updateSodRule, deleteSodRule } from '../../../redux/slices/accessSlice'

function renderPage() {
  return render(<MemoryRouter><SeparationRulesPage /></MemoryRouter>)
}

describe('SeparationRulesPage — uc-adm-01', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    fetchSodRules.mockClear()
    createSodRule.mockClear()
    updateSodRule.mockClear()
    deleteSodRule.mockClear()
  })

  it('renders page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /reglas de separación/i, level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchSodRules on mount', () => {
    renderPage()
    expect(fetchSodRules).toHaveBeenCalled()
  })

  it('renders SoD rules from redux store', () => {
    renderPage()
    expect(screen.getByText(/Pipeline vs Auditoria/i)).toBeInTheDocument()
    expect(screen.getByText(/Usuario vs Auditoria/i)).toBeInTheDocument()
  })

  it('shows active/inactive status for rules', () => {
    renderPage()
    expect(screen.getAllByText(/activa/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/inactiva/i).length).toBeGreaterThan(0)
  })

  it('dispatches updateSodRule with toggled isActive when toggle is clicked', async () => {
    renderPage()
    const toggleBtn = screen.getAllByRole('button', { name: /activar|desactivar/i })[0]
    fireEvent.click(toggleBtn)
    await waitFor(() => {
      expect(updateSodRule).toHaveBeenCalledWith(
        expect.objectContaining({ id: expect.any(Number), isActive: expect.any(Boolean) })
      )
    })
  })

  it('dispatches deleteSodRule with rule id when delete is clicked', async () => {
    renderPage()
    const deleteBtn = screen.getAllByRole('button', { name: /eliminar/i })[0]
    fireEvent.click(deleteBtn)
    await waitFor(() => {
      expect(deleteSodRule).toHaveBeenCalledWith(SOD_RULES[0].id)
    })
  })
})
