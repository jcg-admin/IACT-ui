import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FunctionCatalog from '../FunctionCatalog'

const FUNCTIONS = [
  { id: 1, codename: 'audit:view', name: 'Ver logs', description: 'Ver logs del sistema', domain: 'audit', active: true },
  { id: 2, codename: 'users:view', name: 'Ver usuarios', description: '', domain: 'users', active: true },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      admin: { loading: false, error: null, functions: FUNCTIONS, agrCatalog: [] },
    }),
}))

jest.mock('../../../redux/slices/admin', () => ({
  fetchFunctions: () => ({ type: 'admin/fetchFunctions' }),
  createFunction: jest.fn((data) => ({ type: 'admin/createFunction', payload: data })),
  updateFunction: jest.fn((args) => ({ type: 'admin/updateFunction', payload: args })),
  deactivateFunction: jest.fn((id) => ({ type: 'admin/deactivateFunction', payload: id })),
  selectFunctions: (s) => s.admin.functions,
  selectAdminLoading: (s) => s.admin.loading,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('FunctionCatalog', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<FunctionCatalog />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders function list', () => {
    wrapper(<FunctionCatalog />)
    expect(screen.getByText('Ver logs')).toBeInTheDocument()
    expect(screen.getByText('Ver usuarios')).toBeInTheDocument()
  })

  it('renders codename values in table', () => {
    wrapper(<FunctionCatalog />)
    expect(screen.getByText('audit:view')).toBeInTheDocument()
  })

  it('dispatches fetchFunctions on mount', () => {
    wrapper(<FunctionCatalog />)
    expect(mockDispatch).toHaveBeenCalled()
  })
})

describe('FunctionCatalog — CODENAME_REGEX (G-B1)', () => {
  const { createFunction } = require('../../../redux/slices/admin')

  beforeEach(() => {
    mockDispatch.mockClear()
    createFunction.mockClear()
  })

  function openCreateForm() {
    wrapper(<FunctionCatalog />)
    fireEvent.click(screen.getByRole('button', { name: /nueva función/i }))
  }

  function fillAndSubmit(codename, name = 'Test function') {
    const codenameInput = document.querySelector('[name="codename"]')
    const nameInput = document.querySelector('[name="name"]')
    fireEvent.change(codenameInput, { target: { value: codename } })
    fireEvent.change(nameInput, { target: { value: name } })
    fireEvent.click(screen.getByRole('button', { name: /crear función/i }))
  }

  it('accepts valid v5.6.0 module:action codename', () => {
    openCreateForm()
    fillAndSubmit('reports:view')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(mockDispatch).toHaveBeenCalledTimes(2) // fetchFunctions + createFunction
  })

  it('rejects old 4-dot format sistema.dominio.recurso.accion', () => {
    openCreateForm()
    fillAndSubmit('sistema.dominio.recurso.accion')
    expect(screen.getByText(/formato.*modulo:accion/i)).toBeInTheDocument()
    expect(createFunction).not.toHaveBeenCalled()
  })

  it('rejects codename without colon separator', () => {
    openCreateForm()
    fillAndSubmit('reportsview')
    expect(screen.getByText(/formato.*modulo:accion/i)).toBeInTheDocument()
  })

  it('accepts codename with underscores in action part', () => {
    openCreateForm()
    fillAndSubmit('adm:create_sod')
    expect(screen.queryByText(/formato.*modulo:accion/i)).not.toBeInTheDocument()
    expect(mockDispatch).toHaveBeenCalledTimes(2)
  })
})

describe('FunctionCatalog — deactivate 202 warning (UC_ADM_02 FA-04)', () => {
  const { deactivateFunction } = require('../../../redux/slices/admin')

  beforeEach(() => {
    mockDispatch.mockClear()
    deactivateFunction.mockClear()
  })

  it('shows warning alert when deactivate returns 202 with warnings', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({
        id: 1, codename: 'audit:view', active: false,
        warnings: ['function_has_active_assignments'], affected_users: 3,
      }),
    }))
    wrapper(<FunctionCatalog />)
    const btn = screen.getAllByRole('button', { name: /desactivar/i })[0]
    fireEvent.click(btn)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /desactivar/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/asignaciones activas/i)
    })
  })

  it('shows error alert when deactivate throws', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'Error de red' }),
    }))
    wrapper(<FunctionCatalog />)
    const btn = screen.getAllByRole('button', { name: /desactivar/i })[0]
    fireEvent.click(btn)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /desactivar/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Error de red/i)
    })
  })

  it('shows no alert when deactivate returns 200 without warnings', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ id: 1, active: false }),
    }))
    wrapper(<FunctionCatalog />)
    const btn = screen.getAllByRole('button', { name: /desactivar/i })[0]
    fireEvent.click(btn)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /desactivar/i }))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
