import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Alerts from '../Alerts'

const FIRING_ALERT  = { id: 'alert-1', title: 'Security Alert', message: 'Intrusion detected', severity: 'warning', state: 'firing' }
const ACKED_ALERT   = { id: 'alert-2', title: 'Login Alert',    message: 'New device login',    severity: 'info',    state: 'acknowledged' }

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    alerts: {
      alerts: [FIRING_ALERT, ACKED_ALERT],
      loading: false,
      error: null,
    },
  }),
}))

jest.mock('../../../redux/slices/alerts', () => ({
  fetchAlerts: () => ({ type: 'alerts/fetchAlerts' }),
  acknowledgeAlert: jest.fn(({ alertId, note }) => ({
    type: 'alerts/acknowledgeAlert',
    payload: { alertId, note },
  })),
  selectAlerts:  (s) => s.alerts.alerts,
  selectLoading: (s) => s.alerts.loading,
  selectError:   (s) => s.alerts.error,
}))

import { acknowledgeAlert } from '../../../redux/slices/alerts'

describe('Alerts — Acknowledge (uc-alr-03)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    acknowledgeAlert.mockClear()
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'alerts/acknowledgeAlert') {
        return {
          ...action,
          unwrap: () => Promise.resolve({ id: FIRING_ALERT.id, state: 'acknowledged' }),
        }
      }
      return action
    })
  })

  it('shows Reconocer button for firing alert', async () => {
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reconocer/i })).toBeInTheDocument()
    })
  })

  it('does NOT show Reconocer button for acknowledged alert', async () => {
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => {
      const btns = screen.queryAllByRole('button', { name: /reconocer/i })
      expect(btns).toHaveLength(1)
    })
  })

  it('opens modal with note textarea when Reconocer is clicked', async () => {
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /reconocer/i }))
    expect(screen.getByRole('heading', { name: /reconocer alerta/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /nota de reconocimiento/i })).toBeInTheDocument()
  })

  it('dispatches acknowledgeAlert with empty note when confirmed without note', async () => {
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(acknowledgeAlert).toHaveBeenCalledWith({ alertId: FIRING_ALERT.id, note: '' })
    })
  })

  it('dispatches acknowledgeAlert with note when note is provided', async () => {
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.change(
      screen.getByRole('textbox', { name: /nota de reconocimiento/i }),
      { target: { value: 'Revisado por equipo de seguridad' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(acknowledgeAlert).toHaveBeenCalledWith({
        alertId: FIRING_ALERT.id,
        note: 'Revisado por equipo de seguridad',
      })
    })
  })

  it('shows 409 error message in modal when alert is already acknowledged', async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'alerts/acknowledgeAlert') {
        return {
          ...action,
          unwrap: () => Promise.reject({ statusCode: 409, message: 'Ya reconocida' }),
        }
      }
      return action
    })
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/ya fue reconocida/i)
    })
    expect(screen.getByRole('heading', { name: /reconocer alerta/i })).toBeInTheDocument()
  })

  it('closes modal when Cancelar is clicked', async () => {
    render(<MemoryRouter><Alerts /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reconocer/i }))
    fireEvent.click(screen.getByRole('button', { name: /reconocer/i }))
    expect(screen.getByRole('heading', { name: /reconocer alerta/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('heading', { name: /reconocer alerta/i })).not.toBeInTheDocument()
  })
})
