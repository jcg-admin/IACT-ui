import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InfraLogs from '../InfraLogs'

const LOGS = [
  { id: 1, component: 'server', level: 'ERROR', message: 'Disk full', timestamp: '2026-05-05T10:00:00Z' },
  { id: 2, component: 'network', level: 'WARNING', message: 'High latency', timestamp: '2026-05-05T11:00:00Z' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { loading: false, error: null, infraLogs: LOGS, logs: [], searchResults: [], systemStatus: null } }),
}))

jest.mock('../../../redux/slices/logs', () => ({
  fetchInfraLogs: () => ({ type: 'logs/fetchInfraLogs' }),
  selectInfraLogs: (s) => s.logs.infraLogs,
  selectLogsLoading: (s) => s.logs.loading,
}))

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('InfraLogs', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<InfraLogs />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders infra log entries', () => {
    wrapper(<InfraLogs />)
    expect(screen.getByText('Disk full')).toBeInTheDocument()
    expect(screen.getByText('High latency')).toBeInTheDocument()
  })

  it('renders component column values', () => {
    wrapper(<InfraLogs />)
    expect(screen.getByText('server')).toBeInTheDocument()
    expect(screen.getByText('network')).toBeInTheDocument()
  })

  it('dispatches fetchInfraLogs on mount', () => {
    wrapper(<InfraLogs />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows empty state when no logs', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { loading: false, error: null, infraLogs: [], logs: [], searchResults: [], systemStatus: null } })
    )
    wrapper(<InfraLogs />)
    expect(screen.getByText(/no hay logs de infraestructura/i)).toBeInTheDocument()
  })
})
