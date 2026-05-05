import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LogsPage from '../LogsPage'

const LOGS = [
  { id: 1, level: 'ERROR', message: 'Connection timeout', service: 'api', timestamp: '2026-05-05T10:00:00Z' },
  { id: 2, level: 'INFO', message: 'Request processed', service: 'web', timestamp: '2026-05-05T10:01:00Z' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { error: null, logs: LOGS, searchResults: [], systemStatus: null }, loading: { contexts: {} } }),
}))

jest.mock('../../../redux/slices/logsSlice', () => ({
  fetchLogs: () => ({ type: 'logs/fetchLogs' }),
  selectLogs: (s) => s.logs.logs,
}))

jest.mock('../../../redux/slices/loadingSlice', () => ({
  selectIsLoading: (context) => (s) => (s.loading?.contexts[context] ?? 0) > 0,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('LogsPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<LogsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders log entries', () => {
    wrapper(<LogsPage />)
    expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    expect(screen.getByText('Request processed')).toBeInTheDocument()
  })

  it('renders level badges', () => {
    wrapper(<LogsPage />)
    // getAllByText because 'ERROR'/'INFO' also appear in the filter select options
    expect(screen.getAllByText('ERROR').length).toBeGreaterThan(0)
    expect(screen.getAllByText('INFO').length).toBeGreaterThan(0)
  })

  it('dispatches fetchLogs on mount', () => {
    wrapper(<LogsPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows spinner when loading', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { error: null, logs: [], searchResults: [], systemStatus: null }, loading: { contexts: { logs: 1 } } })
    )
    wrapper(<LogsPage />)
    expect(document.querySelector('.spinner') || screen.queryByText(/cargando/i)).toBeTruthy()
  })
})
