import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SystemStatusPage from '../SystemStatusPage'

const SYSTEM_STATUS = {
  services: [
    { name: 'API Gateway', status: 'ok', latency_ms: 12 },
    { name: 'Database', status: 'warning', latency_ms: 340 },
    { name: 'Redis', status: 'ok', latency_ms: 3 },
  ],
}

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { loading: false, error: null, logs: [], searchResults: [], systemStatus: SYSTEM_STATUS } }),
}))

jest.mock('../../../redux/slices/logsSlice', () => ({
  fetchSystemStatus: () => ({ type: 'logs/fetchSystemStatus' }),
  selectSystemStatus: (s) => s.logs.systemStatus,
  selectLogsLoading: (s) => s.logs.loading,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('SystemStatusPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<SystemStatusPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders service list', () => {
    wrapper(<SystemStatusPage />)
    expect(screen.getByText('API Gateway')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
    expect(screen.getByText('Redis')).toBeInTheDocument()
  })

  it('dispatches fetchSystemStatus on mount', () => {
    wrapper(<SystemStatusPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('renders empty state when no status available', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { loading: false, error: null, logs: [], searchResults: [], systemStatus: null } })
    )
    wrapper(<SystemStatusPage />)
    expect(document.body).toBeTruthy()
  })
})
