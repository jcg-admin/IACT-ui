import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLLogsPage from '../ETLLogsPage'

const ETL_LOGS = [
  { id: 1, process: 'import_users', status: 'success', duration: '2m 10s', records_processed: 150, timestamp: '2026-05-05T08:00:00Z' },
  { id: 2, process: 'export_reports', status: 'failed', duration: '0m 45s', records_processed: 0, timestamp: '2026-05-05T09:00:00Z' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { error: null, etlLogs: ETL_LOGS, searchResults: [], systemStatus: null }, loading: { contexts: {} } }),
}))

jest.mock('../../../redux/slices/logsSlice', () => ({
  fetchETLLogs: () => ({ type: 'logs/fetchETLLogs' }),
  selectETLLogs: (s) => s.logs.etlLogs,
}))

jest.mock('../../../redux/slices/loadingSlice', () => ({
  selectIsLoading: (context) => (s) => (s.loading?.contexts[context] ?? 0) > 0,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ETLLogsPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<ETLLogsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ETL log entries', () => {
    wrapper(<ETLLogsPage />)
    expect(screen.getByText('import_users')).toBeInTheDocument()
    expect(screen.getByText('export_reports')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    wrapper(<ETLLogsPage />)
    expect(screen.getByText('success')).toBeInTheDocument()
    expect(screen.getByText('failed')).toBeInTheDocument()
  })

  it('dispatches fetchETLLogs on mount', () => {
    wrapper(<ETLLogsPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows spinner when loading', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { error: null, etlLogs: [], searchResults: [], systemStatus: null }, loading: { contexts: { logs: 1 } } })
    )
    wrapper(<ETLLogsPage />)
    expect(document.querySelector('.spinner') || screen.queryByText(/cargando/i)).toBeTruthy()
  })
})
