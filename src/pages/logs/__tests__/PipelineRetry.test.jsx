import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLLogs from '../ETLLogs'

const ETL_LOGS_WITH_FAILED = [
  { id: 1, process: 'import_users', status: 'success', duration: '2m', records_processed: 100, timestamp: '2026-05-05T08:00:00Z' },
  { id: 2, process: 'export_reports', status: 'failed', duration: '0s', records_processed: 0, timestamp: '2026-05-05T09:00:00Z' },
]

const VALID_MOTIVO = 'Reintento manual autorizado por admin'

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    logs: { etlLogs: ETL_LOGS_WITH_FAILED, searchResults: [], systemStatus: null, etlAvailability: [] },
    loading: { contexts: {} },
  }),
}))

jest.mock('../../../redux/slices/logs', () => ({
  fetchETLLogs: () => ({ type: 'logs/fetchETLLogs' }),
  retryPipeline: jest.fn(({ logId, motivo }) => ({ type: 'logs/retryPipeline', payload: { logId, motivo } })),
  fetchPipelineStatus: jest.fn(() => ({ type: 'logs/fetchPipelineStatus' })),
  selectETLLogs: (s) => s.logs.etlLogs,
  selectPipelineStatus: (s) => s.logs.pipelineStatus ?? null,
  selectLogsLoading: (s) => s.logs.loading ?? false,
  selectLogsError: (s) => s.logs.error ?? null,
}))

jest.mock('../../../redux/slices/loading', () => ({
  selectIsLoading: (context) => (s) => (s.loading?.contexts[context] ?? 0) > 0,
}))

import { retryPipeline } from '../../../redux/slices/logs'

describe('ETLLogs — PipelineRetryModal (uc-pip-04)', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
    retryPipeline.mockClear()
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'logs/retryPipeline') {
        return { ...action, unwrap: () => Promise.resolve({ message: 'Pipeline iniciado' }) }
      }
      return action
    })
  })

  it('renders Reintentar button for failed logs', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
    })
  })

  it('does NOT dispatch retryPipeline immediately when Reintentar is clicked', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(retryPipeline).not.toHaveBeenCalled()
  })

  it('opens confirmation modal with motivo field when Reintentar is clicked', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(screen.getByRole('heading', { name: /reintentar pipeline/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /motivo/i })).toBeInTheDocument()
  })

  it('disables Confirmar button when motivo is too short', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    const textarea = screen.getByRole('textbox', { name: /motivo/i })
    fireEvent.change(textarea, { target: { value: 'corto' } })
    expect(screen.getByRole('button', { name: /^confirmar$/i })).toBeDisabled()
  })

  it('enables Confirmar button when motivo has >= 20 chars', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    const textarea = screen.getByRole('textbox', { name: /motivo/i })
    fireEvent.change(textarea, { target: { value: VALID_MOTIVO } })
    expect(screen.getByRole('button', { name: /^confirmar$/i })).not.toBeDisabled()
  })

  it('dispatches retryPipeline with { logId, motivo } when confirmed', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    const textarea = screen.getByRole('textbox', { name: /motivo/i })
    fireEvent.change(textarea, { target: { value: VALID_MOTIVO } })
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(retryPipeline).toHaveBeenCalledWith({ logId: 2, motivo: VALID_MOTIVO })
    })
  })

  it('does not dispatch retryPipeline when cancel is clicked', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(retryPipeline).not.toHaveBeenCalled()
  })

  it('shows 409 conflict error message in modal when pipeline is already running', async () => {
    mockDispatch.mockImplementation((action) => {
      if (action?.type === 'logs/retryPipeline') {
        return {
          ...action,
          unwrap: () => Promise.reject({ statusCode: 409, message: 'Ya hay una ejecución activa' }),
        }
      }
      return action
    })
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.change(screen.getByRole('textbox', { name: /motivo/i }), { target: { value: VALID_MOTIVO } })
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/ya hay una ejecución activa/i)
    })
  })
})
