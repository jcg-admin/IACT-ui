import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RevokeGroup from '../RevokeGroup'

const mockDispatch = jest.fn()
const MOCK_GROUPS = [
  { id: 1, codename: 'AGR-001', name: 'Supervisor' },
  { id: 2, codename: 'AGR-002', name: 'Agente' },
]

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

jest.mock('../../../redux/slices/accessSlice', () => ({
  __esModule: true,
  revokeGroupFromUser: jest.fn((args) => ({ type: 'access/revokeGroupFromUser', payload: args })),
  selectGroups: (s) => s.access.groups,
  selectLoading: (s) => s.access.loading,
  selectError: (s) => s.access.error,
  selectSuccess: (s) => s.access.success,
  clearError: () => ({ type: 'access/clearError' }),
  resetState: () => ({ type: 'access/resetState' }),
}))

import { revokeGroupFromUser } from '../../../redux/slices/accessSlice'

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

beforeEach(() => {
  mockDispatch.mockClear()
  revokeGroupFromUser.mockClear()
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

  it('renders botón Revocar', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByRole('button', { name: /revocar/i })).toBeInTheDocument()
  })
})

describe('RevokeGroup — grupos disponibles', () => {
  it('muestra los grupos del store en el selector', () => {
    wrapper(<RevokeGroup />)
    expect(screen.getByRole('option', { name: /Supervisor/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Agente/i })).toBeInTheDocument()
  })
})

describe('RevokeGroup — validación revoke_reason (uc-perm-02)', () => {
  it('no despacha si revoke_reason está vacío', () => {
    wrapper(<RevokeGroup />)
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByLabelText(/grupo/i), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /revocar/i }))
    expect(revokeGroupFromUser).not.toHaveBeenCalled()
  })

  it('despacha revokeGroupFromUser con userId, groupId y revoke_reason', async () => {
    wrapper(<RevokeGroup />)
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'user-42' } })
    fireEvent.change(screen.getByLabelText(/grupo/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/motivo.*revocación|razón.*revoc/i), {
      target: { value: 'Salida del empleado' },
    })
    fireEvent.click(screen.getByRole('button', { name: /revocar/i }))
    await waitFor(() => {
      expect(revokeGroupFromUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-42',
          groupId: '1',
          revoke_reason: 'Salida del empleado',
        })
      )
    })
  })
})
