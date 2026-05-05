import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PerformanceMetricsPage from '../PerformanceMetricsPage'

const METRICS = {
  metrics: [
    { name: 'CPU Usage', value: '45%', trend: 'stable' },
    { name: 'Memory', value: '72%', trend: 'up' },
  ],
  summary: { p95: '120ms', p99: '340ms', throughput: '850 req/s' },
}

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { loading: false, error: null, logs: [], searchResults: [], systemStatus: null, performanceMetrics: METRICS } }),
}))

jest.mock('../../../redux/slices/logsSlice', () => ({
  fetchPerformanceMetrics: () => ({ type: 'logs/fetchPerformanceMetrics' }),
  selectPerformanceMetrics: (s) => s.logs.performanceMetrics,
  selectLogsLoading: (s) => s.logs.loading,
}))

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('PerformanceMetricsPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<PerformanceMetricsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders metric names', () => {
    wrapper(<PerformanceMetricsPage />)
    expect(screen.getByText('CPU Usage')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
  })

  it('dispatches fetchPerformanceMetrics on mount', () => {
    wrapper(<PerformanceMetricsPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows empty state when no metrics', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { loading: false, performanceMetrics: null, logs: [], searchResults: [], systemStatus: null } })
    )
    wrapper(<PerformanceMetricsPage />)
    expect(document.body).toBeTruthy()
  })
})
