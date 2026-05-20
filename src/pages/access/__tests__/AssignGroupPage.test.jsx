/**
 * AssignGroupPage.test.jsx — v2
 *
 * CORRECCIÓN T4.1: validateGroupAssignment eliminado.
 * Flujo ahora: completar formulario + checkbox de confirmación → asignar.
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AssignGroup from '../AssignGroup'

const MOCK_GROUPS = [
  { id: 1, name: 'Supervisors' },
  { id: 2, name: 'Agents' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        groups:   MOCK_GROUPS,
        loading:  false,
        error:    null,
        success:  false,
      },
    }),
}))

jest.mock('@store/slices/access', () => ({
  __esModule: true,
  assignGroupToUser: jest.fn((payload) => ({ type: 'access/assignGroupToUser', payload })),
  selectGroups:  (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectError:   (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  clearError:    jest.fn(() => ({ type: 'access/clearError' })),
  resetState:    jest.fn(() => ({ type: 'access/resetState' })),
}))

const { assignGroupToUser } = require('@store/slices/access')

function wrap() {
  return render(<MemoryRouter><AssignGroup /></MemoryRouter>)
}

describe('AssignGroup — UC_ACC_04 (flujo directo sin validateGroupAssignment)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    assignGroupToUser.mockClear()
    mockDispatch.mockResolvedValue({ type: 'access/assignGroupToUser/fulfilled' })
  })

  it('renderiza el encabezado de página', () => {
    wrap()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renderiza input de userId', () => {
    wrap()
    expect(screen.getByLabelText(/ID de usuario/i)).toBeInTheDocument()
  })

  it('renderiza selector de grupos con opciones disponibles', () => {
    wrap()
    expect(screen.getByRole('combobox', { name: /Grupo/i })).toBeInTheDocument()
    expect(screen.getByText('Supervisors')).toBeInTheDocument()
    expect(screen.getByText('Agents')).toBeInTheDocument()
  })

  it('NO tiene botón "Verificar separación" (validateGroupAssignment eliminado)', () => {
    wrap()
    expect(screen.queryByRole('button', { name: /Verificar separación/i })).not.toBeInTheDocument()
  })

  it('botón "Asignar grupo" deshabilitado sin formulario completo', () => {
    wrap()
    expect(screen.getByRole('button', { name: /Asignar grupo/i })).toBeDisabled()
  })

  it('checkbox de confirmación aparece solo cuando userId y groupId están completos', () => {
    wrap()
    // Sin datos: no hay checkbox
    expect(screen.queryByLabelText(/Confirmo/i)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/ID de usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByRole('combobox', { name: /Grupo/i }), { target: { value: '1' } })
    expect(screen.getByLabelText(/Confirmo/i)).toBeInTheDocument()
  })

  it('botón "Asignar grupo" habilitado solo al marcar el checkbox', () => {
    wrap()
    fireEvent.change(screen.getByLabelText(/ID de usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByRole('combobox', { name: /Grupo/i }), { target: { value: '1' } })
    const btn = screen.getByRole('button', { name: /Asignar grupo/i })
    expect(btn).toBeDisabled()
    fireEvent.click(screen.getByLabelText(/Confirmo/i))
    expect(btn).not.toBeDisabled()
  })

  it('despacha assignGroupToUser al confirmar', async () => {
    wrap()
    fireEvent.change(screen.getByLabelText(/ID de usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByRole('combobox', { name: /Grupo/i }), { target: { value: '1' } })
    fireEvent.click(screen.getByLabelText(/Confirmo/i))
    fireEvent.click(screen.getByRole('button', { name: /Asignar grupo/i }))
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
    expect(assignGroupToUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-42', groupId: '1' })
    )
  })

  it('muestra error cuando el estado de error está activo', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ access: { groups: MOCK_GROUPS, loading: false, error: 'Error de asignación', success: false } })
    )
    wrap()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    jest.restoreAllMocks()
  })

  it('muestra mensaje de éxito cuando success está activo', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ access: { groups: MOCK_GROUPS, loading: false, error: null, success: true } })
    )
    wrap()
    expect(screen.getByRole('status')).toBeInTheDocument()
    jest.restoreAllMocks()
  })
})
