import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLLogs from '../ETLLogs'

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

jest.mock('../../../redux/slices/logs', () => ({
  fetchETLLogs: () => ({ type: 'logs/fetchETLLogs' }),
  selectETLLogs: (s) => s.logs.etlLogs,
}))

jest.mock('../../../redux/slices/loading', () => ({
  selectIsLoading: (context) => (s) => (s.loading?.contexts[context] ?? 0) > 0,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ETLLogs', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<ETLLogs />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ETL log entries', () => {
    wrapper(<ETLLogs />)
    expect(screen.getByText('import_users')).toBeInTheDocument()
    expect(screen.getByText('export_reports')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    wrapper(<ETLLogs />)
    expect(screen.getByText('success')).toBeInTheDocument()
    expect(screen.getByText('failed')).toBeInTheDocument()
  })

  it('dispatches fetchETLLogs on mount', () => {
    wrapper(<ETLLogs />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows spinner when loading', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { error: null, etlLogs: [], searchResults: [], systemStatus: null }, loading: { contexts: { logs: 1 } } })
    )
    wrapper(<ETLLogs />)
    expect(document.querySelector('.spinner') || screen.queryByText(/cargando/i)).toBeTruthy()
  })
})

// uc-pip-02: Botón quick-filter "Solo errores"
describe('ETLLogs — Solo errores quick-filter (uc-pip-02)', () => {
  const { fireEvent } = require('@testing-library/react')

  beforeEach(() => mockDispatch.mockClear())

  it('renders Solo errores button', () => {
    wrapper(<ETLLogs />)
    expect(screen.getByRole('button', { name: /solo errores/i })).toBeInTheDocument()
  })

  it('dispatches fetchETLLogs with status=error when Solo errores is clicked', () => {
    const { fetchETLLogs } = require('../../../redux/slices/logs')
    wrapper(<ETLLogs />)
    fireEvent.click(screen.getByRole('button', { name: /solo errores/i }))
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'logs/fetchETLLogs' })
    )
  })
})
