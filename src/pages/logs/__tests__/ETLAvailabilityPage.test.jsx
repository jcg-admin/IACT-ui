import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLAvailabilityPage from '../ETLAvailabilityPage'

const mockDispatch = jest.fn()
const AVAILABILITY_DATA = [
  { id: 1, process: 'import_users', available: true, last_run: '2026-05-05T08:00:00Z', next_run: '2026-05-06T08:00:00Z' },
  { id: 2, process: 'export_reports', available: false, last_run: '2026-05-05T09:00:00Z', next_run: null },
]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    logs: { etlAvailability: AVAILABILITY_DATA, loading: false, error: null },
  }),
}))

jest.mock('../../../redux/slices/logsSlice', () => ({
  fetchETLAvailability: jest.fn(() => ({ type: 'logs/fetchETLAvailability' })),
  selectETLAvailability: (s) => s.logs.etlAvailability,
}))

import { fetchETLAvailability } from '../../../redux/slices/logsSlice'

function wrap() {
  return render(<MemoryRouter><ETLAvailabilityPage /></MemoryRouter>)
}

describe('ETLAvailabilityPage — uc-pip-03', () => {
  beforeEach(() => { mockDispatch.mockClear(); fetchETLAvailability.mockClear() })

  it('renders page title', () => {
    wrap()
    expect(screen.getByRole('heading', { name: /disponibilidad.*etl/i, level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchETLAvailability on mount', () => {
    wrap()
    expect(fetchETLAvailability).toHaveBeenCalled()
  })

  it('renders availability entries', () => {
    wrap()
    expect(screen.getByText('import_users')).toBeInTheDocument()
    expect(screen.getByText('export_reports')).toBeInTheDocument()
  })

  it('shows available/unavailable status', () => {
    wrap()
    expect(screen.getAllByText(/disponible/i).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('No disponible')).toBeInTheDocument()
  })
})
