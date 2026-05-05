import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FunctionCatalogPage from '../FunctionCatalogPage'

const FUNCTIONS = [
  { id: 1, codename: 'sistema.auditoria.logs.ver', name: 'Ver logs', description: 'Ver logs del sistema', domain: 'auditoria', active: true },
  { id: 2, codename: 'sistema.administracion.usuarios.ver', name: 'Ver usuarios', description: '', domain: 'administracion', active: true },
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

jest.mock('../../../redux/slices/adminSlice', () => ({
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

describe('FunctionCatalogPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<FunctionCatalogPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders function list', () => {
    wrapper(<FunctionCatalogPage />)
    expect(screen.getByText('Ver logs')).toBeInTheDocument()
    expect(screen.getByText('Ver usuarios')).toBeInTheDocument()
  })

  it('renders codename values in table', () => {
    wrapper(<FunctionCatalogPage />)
    expect(screen.getByText('sistema.auditoria.logs.ver')).toBeInTheDocument()
  })

  it('dispatches fetchFunctions on mount', () => {
    wrapper(<FunctionCatalogPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })
})
