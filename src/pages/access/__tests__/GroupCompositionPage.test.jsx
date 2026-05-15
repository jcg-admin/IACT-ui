/**
 * GroupCompositionPage.test.jsx — v2
 *
 * CORRECCIÓN T4.1: getGroupCascadeImpact eliminado (endpoint no existe en IACT-api).
 * getFunctionGroups() ya no se llama directamente al gateway — usa Redux state.
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroupComposition from '../GroupComposition'

const GROUPS = [
  { id: 1, name: 'Admins', description: '', active: true },
]
const FUNCTIONS = [
  { id: 10, codename: 'sistema.audit.logs.ver', code: 'AUD-001', name: 'Ver logs' },
  { id: 11, codename: 'sistema.pipeline.run',   code: 'PIP-001', name: 'Ejecutar pipeline' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        loading:       false,
        error:         null,
        groups:        GROUPS,
        groupers:      GROUPS,
        functions:     FUNCTIONS,
        groupFunctions: [],
      },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  fetchAllFunctions:    jest.fn(() => ({ type: 'access/fetchAllFunctions' })),
  fetchGroupFunctions:  jest.fn((id) => ({ type: 'access/fetchGroupFunctions', payload: id })),
  fetchGroupers:        jest.fn(() => ({ type: 'access/fetchGroupers' })),
  assignFunctionsToGroup: jest.fn((a) => ({ type: 'access/assignFunctionsToGroup', payload: a })),
  selectGroups:         (s) => s.access.groups,
  selectGroupers:       (s) => s.access.groupers,
  selectGroupFunctions: (s) => s.access.groupFunctions,
  selectFunctions:      (s) => s.access.functions,
  selectLoading:        (s) => s.access.loading,
  selectError:          (s) => s.access.error,
  clearError:           jest.fn(() => ({ type: 'access/clearError' })),
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('GroupComposition — sin getGroupCascadeImpact (T4.1)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    mockDispatch.mockResolvedValue({ type: 'ok' })
  })

  it('renderiza el encabezado de página', () => {
    wrapper(<GroupComposition />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza selector de grupos con los grupos del estado Redux', () => {
    wrapper(<GroupComposition />)
    expect(screen.getByText('Admins')).toBeInTheDocument()
  })

  it('despacha fetchAllFunctions y fetchGroupers al montar', () => {
    wrapper(<GroupComposition />)
    const { fetchAllFunctions, fetchGroupers } = require('../../../redux/slices/access')
    expect(fetchAllFunctions).toHaveBeenCalled()
    expect(fetchGroupers).toHaveBeenCalled()
  })

  it('NO llama getGroupCascadeImpact (endpoint eliminado de la API)', () => {
    // El gateway ya no tiene getGroupCascadeImpact — verificar que no se importa
    const accessGateway = require('../../../services/accessGateway').default
    expect(typeof accessGateway.getGroupCascadeImpact).toBe('undefined')
  })

  it('muestra botón "Agregar función" al seleccionar un grupo', async () => {
    wrapper(<GroupComposition />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '1' } })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Agregar función/i })).toBeInTheDocument()
    })
  })

  it('abre modal de selección de funciones al hacer click en Agregar función', async () => {
    wrapper(<GroupComposition />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Agregar función/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Agregar función/i }))
    // El modal muestra un input de búsqueda que no existe antes de abrirlo
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar función/i)).toBeInTheDocument()
    })
  })
})
