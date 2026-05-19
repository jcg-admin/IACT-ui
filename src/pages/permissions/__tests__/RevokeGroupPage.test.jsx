import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RevokeGroup from '../RevokeGroup'

const mockDispatch = jest.fn()
const MOCK_GROUPS = [
  { id: 1, codename: 'AGR-001', name: 'Supervisor' },
  { id: 2, codename: 'AGR-002', name: 'Agente' },
]
const mockApiGet = jest.fn()

jest.mock('../../../services/apiClient', () => ({
  __esModule: true,
  default: { get: (...args) => mockApiGet(...args) },
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      access: {
        groups: MOCK_GROUPS,
        loading: false,
        error: null,
        success: false,
      },
    }),
}))

jest.mock('../../../redux/slices/access', () => ({
  __esModule: true,
  revokeGroupFromUser: jest.fn((args) => ({ type: 'access/revokeGroupFromUser', payload: args })),
  selectGroups: (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  clearError: () => ({ type: 'access/clearError' }),
  resetState: () => ({ type: 'access/resetState' }),
}))

import { revokeGroupFromUser } from '../../../redux/slices/access'

const PREVIEW_SAFE = {
  functions_to_revoke: ['view_reports'],
  functions_remaining: 5,
  warnings: { critical_revoked: [], no_functions: false },
}

const PREVIEW_CRITICAL = {
  functions_to_revoke: ['create_users', 'delete_users'],
  functions_remaining: 0,
  warnings: { critical_revoked: ['create_users', 'delete_users'], no_functions: true },
}

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

function fillForm({ userId = 'user-42', groupId = '1', reason = 'Salida del empleado en baja' } = {}) {
  fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: userId } })
  fireEvent.change(screen.getByLabelText(/grupo/i), { target: { value: groupId } })
  fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: reason } })
}

beforeEach(() => {
  mockDispatch.mockClear()
  revokeGroupFromUser.mockClear()
  mockApiGet.mockClear()
})

describe('RevokeGroup — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders campo userId', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
  })

  it('renders selector de grupo', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByLabelText(/grupo/i)).toBeInTheDocument()
  })

  it('renders textarea revoke_reason', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByLabelText(/motivo.*revocación|razón.*revoc/i)).toBeInTheDocument()
  })

  it('renders botón Verificar impacto', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByRole('button', { name: /verificar impacto/i })).toBeInTheDocument()
  })
})

describe('RevokeGroup — grupos disponibles', () => {
  it('muestra los grupos del store en el selector', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByRole('option', { name: /Supervisor/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Agente/i })).toBeInTheDocument()
  })
})

describe('RevokeGroup — validación (UC_PERM_02)', () => {
  it('Verificar impacto button disabled when reason < 10 chars', () => {
    wrapper(<RevokeGroup />)
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByLabelText(/grupo/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'corto' } })
    expect(screen.getByRole('button', { name: /verificar impacto/i })).toBeDisabled()
  })

  it('Verificar impacto button disabled when userId empty', () => {
    wrapper(<RevokeGroup />)
    fireEvent.change(screen.getByLabelText(/grupo/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'Salida del empleado en baja' } })
    expect(screen.getByRole('button', { name: /verificar impacto/i })).toBeDisabled()
  })

  it('Verificar impacto button enabled when form is valid', () => {
    wrapper(<RevokeGroup />)
    fillForm()
    expect(screen.getByRole('button', { name: /verificar impacto/i })).not.toBeDisabled()
  })
})

describe('RevokeGroup — preview modal (UC_PERM_02 PASO 4)', () => {
  it('clicking Verificar impacto calls preview endpoint', async () => {
    mockApiGet.mockResolvedValueOnce(PREVIEW_SAFE)
    wrapper(<RevokeGroup />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /verificar impacto/i }))
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining('/preview-revoke/')
      )
    })
  })

  it('modal renders after preview call', async () => {
    mockApiGet.mockResolvedValueOnce(PREVIEW_SAFE)
    wrapper(<RevokeGroup />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /verificar impacto/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  it('modal renders functions_to_revoke list', async () => {
    mockApiGet.mockResolvedValueOnce(PREVIEW_SAFE)
    wrapper(<RevokeGroup />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /verificar impacto/i }))
    await waitFor(() => expect(screen.getByText('view_reports')).toBeInTheDocument())
  })

  it('modal confirm button disabled until typing REVOCAR for critical warnings', async () => {
    mockApiGet.mockResolvedValueOnce(PREVIEW_CRITICAL)
    wrapper(<RevokeGroup />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /verificar impacto/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /confirmar revocación/i })).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/confirmación literal/i), { target: { value: 'REVOCAR' } })
    expect(screen.getByRole('button', { name: /confirmar revocación/i })).not.toBeDisabled()
  })

  it('dispatches revokeGroupFromUser when confirming without critical warnings', async () => {
    mockApiGet.mockResolvedValueOnce(PREVIEW_SAFE)
    wrapper(<RevokeGroup />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /verificar impacto/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /confirmar revocación/i }))
    expect(revokeGroupFromUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-42',
        groupId: '1',
        revoke_reason: 'Salida del empleado en baja',
      })
    )
  })

  it('Cancelar closes modal without dispatching', async () => {
    mockApiGet.mockResolvedValueOnce(PREVIEW_SAFE)
    wrapper(<RevokeGroup />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /verificar impacto/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(revokeGroupFromUser).not.toHaveBeenCalled()
  })
})
