import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLLogs from '../ETLLogs'

const ETL_LOGS_WITH_FAILED = [
  { id: 1, process: 'import_users', status: 'success', duration: '2m', records_processed: 100, timestamp: '2026-05-05T08:00:00Z' },
  { id: 2, process: 'export_reports', status: 'failed', duration: '0s', records_processed: 0, timestamp: '2026-05-05T09:00:00Z' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    logs: { etlLogs: ETL_LOGS_WITH_FAILED, searchResults: [], systemStatus: null, etlAvailability: [] },
    loading: { contexts: {} },
  }),
}))

jest.mock('../../../redux/slices/logsSlice', () => ({
  fetchETLLogs: () => ({ type: 'logs/fetchETLLogs' }),
  retryPipeline: jest.fn((id) => ({ type: 'logs/retryPipeline', payload: id })),
  fetchPipelineStatus: jest.fn(() => ({ type: 'logs/fetchPipelineStatus' })),
  selectETLLogs: (s) => s.logs.etlLogs,
  selectPipelineStatus: (s) => s.logs.pipelineStatus ?? null,
  selectLogsLoading: (s) => s.logs.loading ?? false,
  selectLogsError: (s) => s.logs.error ?? null,
}))

jest.mock('../../../redux/slices/loadingSlice', () => ({
  selectIsLoading: (context) => (s) => (s.loading?.contexts[context] ?? 0) > 0,
}))

import { retryPipeline } from '../../../redux/slices/logsSlice'

describe('ETLLogs — PipelineRetryModal (uc-pip-04)', () => {
  beforeEach(() => { mockDispatch.mockClear(); retryPipeline.mockClear() })

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

  it('opens confirmation modal when Reintentar is clicked', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(screen.getByRole('heading', { name: /reintentar pipeline/i })).toBeInTheDocument()
  })

  it('dispatches retryPipeline with process id when confirmed', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /^confirmar$/i }))
    await waitFor(() => {
      expect(retryPipeline).toHaveBeenCalledWith(2)
    })
  })

  it('does not dispatch retryPipeline when cancel is clicked', async () => {
    render(<MemoryRouter><ETLLogs /></MemoryRouter>)
    await waitFor(() => screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(retryPipeline).not.toHaveBeenCalled()
  })
})
