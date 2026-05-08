import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SeparationRulesCatalog from '../SeparationRulesCatalog'

const RULES = [
  { id: 1, code: 'SR-001', name: 'Pipeline vs Auditoría', description: 'Desc A', group_a: ['pipeline:view'], group_b: ['audit:view'], isActive: true, violations: 0 },
  { id: 2, code: 'SR-002', name: 'Usuarios vs Auditoría', description: 'Desc B', group_a: ['users:manage'], group_b: ['audit:view'], isActive: false, violations: 0 },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      admin: { loading: false, error: null, separationRules: RULES, functions: [], agrs: [], menuItems: [] },
    }),
}))

jest.mock('../../../redux/slices/admin', () => ({
  __esModule: true,
  fetchAdminSeparationRules: () => ({ type: 'admin/fetchAdminSeparationRules' }),
  createSeparationRule: jest.fn((data) => ({ type: 'admin/createSeparationRule', payload: data })),
  updateSeparationRule: jest.fn((args) => ({ type: 'admin/updateSeparationRule', payload: args })),
  toggleSeparationRuleStatus: jest.fn((id) => ({ type: 'admin/toggleSeparationRuleStatus', payload: id })),
  selectAdminSeparationRules: (s) => s.admin.separationRules,
  selectAdminLoading: (s) => s.admin.loading,
}))

const mockAdmin = jest.requireMock('../../../redux/slices/admin')

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('SeparationRulesCatalog', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockResolvedValue({ payload: {} })
    mockAdmin.createSeparationRule.mockClear()
    mockAdmin.toggleSeparationRuleStatus.mockClear()
  })

  it('renders page heading', () => {
    wrapper(<SeparationRulesCatalog />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders rules table with names', () => {
    wrapper(<SeparationRulesCatalog />)
    expect(screen.getByText('Pipeline vs Auditoría')).toBeInTheDocument()
    expect(screen.getByText('Usuarios vs Auditoría')).toBeInTheDocument()
  })

  it('renders SR codes in table', () => {
    wrapper(<SeparationRulesCatalog />)
    expect(screen.getByText('SR-001')).toBeInTheDocument()
    expect(screen.getByText('SR-002')).toBeInTheDocument()
  })

  it('dispatches fetchAdminSeparationRules on mount', () => {
    wrapper(<SeparationRulesCatalog />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows create form on Nueva regla click', () => {
    wrapper(<SeparationRulesCatalog />)
    fireEvent.click(screen.getByText('Nueva regla'))
    expect(screen.getByLabelText('Formulario regla SoD')).toBeInTheDocument()
  })

  it('dispatches toggleSeparationRuleStatus on Desactivar click', async () => {
    wrapper(<SeparationRulesCatalog />)
    const btn = screen.getByLabelText('Desactivar Pipeline vs Auditoría')
    fireEvent.click(btn)
    await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(2))
  })

  it('shows Activar for inactive rule', () => {
    wrapper(<SeparationRulesCatalog />)
    expect(screen.getByLabelText('Activar Usuarios vs Auditoría')).toBeInTheDocument()
  })
})
