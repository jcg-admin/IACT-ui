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
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ id: 99 }),
    }))
    mockAdmin.createSeparationRule.mockClear()
    mockAdmin.updateSeparationRule.mockClear()
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
    expect(screen.getByLabelText('Formulario regla de separación')).toBeInTheDocument()
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

describe('SeparationRulesCatalog — validación disjunción (UC-ADM-01)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ id: 99 }),
    }))
    mockAdmin.createSeparationRule.mockClear()
    mockAdmin.updateSeparationRule.mockClear()
  })

  function openForm() {
    wrapper(<SeparationRulesCatalog />)
    fireEvent.click(screen.getByText('Nueva regla'))
  }

  it('shows role=alert when group_a and group_b share a function', async () => {
    openForm()
    fireEvent.change(screen.getByPlaceholderText('reports:view, audit:view'), { target: { value: 'audit:view, pipeline:view' } })
    fireEvent.change(screen.getByPlaceholderText('access:assign, users:create'), { target: { value: 'audit:view, users:manage' } })
    fireEvent.submit(screen.getByLabelText('Formulario regla de separación'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/no pueden tener funciones en común/i)
    })
    expect(mockAdmin.createSeparationRule).not.toHaveBeenCalled()
  })

  it('dispatches createSeparationRule when groups are disjoint', async () => {
    openForm()
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Test rule' } })
    fireEvent.change(screen.getByPlaceholderText('reports:view, audit:view'), { target: { value: 'reports:view' } })
    fireEvent.change(screen.getByPlaceholderText('access:assign, users:create'), { target: { value: 'users:create' } })
    fireEvent.submit(screen.getByLabelText('Formulario regla de separación'))
    await waitFor(() => {
      expect(mockAdmin.createSeparationRule).toHaveBeenCalledWith(
        expect.objectContaining({ group_a: ['reports:view'], group_b: ['users:create'] })
      )
    })
  })

  it('shows backend error message when unwrap rejects', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'Error remoto del servidor' }),
    }))
    openForm()
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText('reports:view, audit:view'), { target: { value: 'reports:view' } })
    fireEvent.change(screen.getByPlaceholderText('access:assign, users:create'), { target: { value: 'users:create' } })
    fireEvent.submit(screen.getByLabelText('Formulario regla de separación'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Error remoto del servidor/i)
    })
    expect(screen.getByLabelText('Formulario regla de separación')).toBeInTheDocument()
  })

  it('clears previous error when form is reopened', async () => {
    wrapper(<SeparationRulesCatalog />)
    fireEvent.click(screen.getByText('Nueva regla'))
    fireEvent.change(screen.getByPlaceholderText('reports:view, audit:view'), { target: { value: 'audit:view' } })
    fireEvent.change(screen.getByPlaceholderText('access:assign, users:create'), { target: { value: 'audit:view' } })
    fireEvent.submit(screen.getByLabelText('Formulario regla de separación'))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Cancelar'))
    fireEvent.click(screen.getByText('Nueva regla'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('SeparationRulesCatalog — toggle status error (UC_ADM_01 FA-04)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('shows role=alert when toggle returns 409 already inactive', async () => {
    mockDispatch.mockImplementation((action) => {
      if (action.type === 'admin/toggleSeparationRuleStatus') {
        return Promise.resolve({
          type: 'admin/toggleSeparationRuleStatus/rejected',
          error: { message: 'Rejected' },
          payload: { message: 'Regla ya inactiva', statusCode: 409 },
        })
      }
      return Promise.resolve({ type: action.type, unwrap: () => Promise.resolve({}) })
    })
    wrapper(<SeparationRulesCatalog />)
    const btn = screen.getByLabelText('Activar Usuarios vs Auditoría')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Regla ya inactiva/i)
    })
  })
})
