import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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
