import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AGRCatalog from '../AGRCatalog'

const AGRS = [
  { id: 1, codename: 'basic_operator_group', name: 'Operador Básico', description: 'Operador de call center', active: true, functions_count: 2 },
  { id: 2, codename: 'report_viewer_group',  name: 'Visualizador Reportes', description: '', active: true, functions_count: 3 },
]

const COMPOSITION = {
  1: { functions: ['pipeline:view_status', 'pipeline:execute'], impact: { affected_users: 4 } },
  2: { functions: [], impact: null },
}

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      admin: {
        loading: false,
        error: null,
        agrs: AGRS,
        functions: [],
        separationRules: [],
        menuItems: [],
        systemGroupCompositions: COMPOSITION,
      },
    }),
}))

jest.mock('../../../redux/slices/admin', () => ({
  __esModule: true,
  fetchAGRCatalog: () => ({ type: 'admin/fetchAGRCatalog' }),
  createAGR: jest.fn((data) => ({ type: 'admin/createAGR', payload: data })),
  updateAGR: jest.fn((args) => ({ type: 'admin/updateAGR', payload: args })),
  deactivateAGR: jest.fn((id) => ({ type: 'admin/deactivateAGR', payload: id })),
  fetchAGRComposition: jest.fn((id) => ({ type: 'admin/fetchAGRComposition', payload: id })),
  addFunctionToAGR: jest.fn((args) => ({ type: 'admin/addFunctionToAGR', payload: args })),
  removeFunctionFromAGR: jest.fn((args) => ({ type: 'admin/removeFunctionFromAGR', payload: args })),
  fetchAGRImpact: jest.fn((id) => ({ type: 'admin/fetchAGRImpact', payload: id })),
  selectAGRs: (s) => s.admin.agrs,
  selectAdminLoading: (s) => s.admin.loading,
  selectAGRComposition: (agrId) => (s) => s.admin.systemGroupCompositions[agrId] ?? { functions: [], impact: null },
}))

const mockAdmin = jest.requireMock('../../../redux/slices/admin')

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AGRCatalog — Composición (UC-ADM-03)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.resolve({ agrId: 1, functionCodename: 'reports:view' }),
    }))
    mockAdmin.fetchAGRComposition.mockClear()
    mockAdmin.fetchAGRImpact.mockClear()
    mockAdmin.addFunctionToAGR.mockClear()
    mockAdmin.removeFunctionFromAGR.mockClear()
  })

  it('renders tab Composición', () => {
    wrapper(<AGRCatalog />)
    expect(screen.getByRole('tab', { name: 'Composición' })).toBeInTheDocument()
  })

  it('shows AGR list in composition tab', () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    expect(screen.getByLabelText('Gestionar composición de Operador Básico')).toBeInTheDocument()
    expect(screen.getByLabelText('Gestionar composición de Visualizador Reportes')).toBeInTheDocument()
  })

  it('dispatches fetchAGRComposition and fetchAGRImpact when Gestionar is clicked', () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    expect(mockAdmin.fetchAGRComposition).toHaveBeenCalledWith(1)
    expect(mockAdmin.fetchAGRImpact).toHaveBeenCalledWith(1)
  })

  it('shows composition panel with current functions', () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    expect(screen.getByText('pipeline:view_status')).toBeInTheDocument()
    expect(screen.getByText('pipeline:execute')).toBeInTheDocument()
  })

  it('shows impact count in composition panel', () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('dispatches removeFunctionFromAGR when Remover is clicked', async () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    fireEvent.click(screen.getByLabelText('Remover pipeline:view_status del AGR'))
    await waitFor(() => {
      expect(mockAdmin.removeFunctionFromAGR).toHaveBeenCalledWith({
        agrId: 1,
        functionCodename: 'pipeline:view_status',
      })
    })
  })

  it('dispatches addFunctionToAGR with codename when Agregar is clicked', async () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Codename de función a agregar' }),
      { target: { value: 'reports:view' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Agregar función al AGR' }))
    await waitFor(() => {
      expect(mockAdmin.addFunctionToAGR).toHaveBeenCalledWith({
        agrId: 1,
        functionCodename: 'reports:view',
      })
    })
  })

  it('shows role=alert when addFunctionToAGR rejects with 409', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'Función ya asignada al AGR' }),
    }))
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Codename de función a agregar' }),
      { target: { value: 'pipeline:execute' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Agregar función al AGR' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/ya asignada/i)
    })
  })

  it('closes panel when Cerrar panel is clicked', () => {
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    expect(screen.getByLabelText('Panel composición Operador Básico')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Cerrar panel de composición'))
    expect(screen.queryByLabelText('Panel composición Operador Básico')).not.toBeInTheDocument()
  })

  it('shows role=alert when addFunctionToAGR rejects with 403 (non-system AGR)', async () => {
    mockDispatch.mockImplementation((action) => ({
      ...action,
      unwrap: () => Promise.reject({ message: 'AGR no es de sistema', statusCode: 403 }),
    }))
    wrapper(<AGRCatalog />)
    fireEvent.click(screen.getByRole('tab', { name: 'Composición' }))
    fireEvent.click(screen.getByLabelText('Gestionar composición de Operador Básico'))
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Codename de función a agregar' }),
      { target: { value: 'reports:view' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Agregar función al AGR' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/no es de sistema/i)
    })
  })
})
