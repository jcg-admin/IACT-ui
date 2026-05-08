import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ETLAvailability from '../ETLAvailability'

const mockDispatch = jest.fn()
const AVAILABILITY_DATA = [
  {
    dataset: 'ivr_llamadas_nacional',
    trimestre: 'Q2_26',
    minutos_desde_etl: 45,
    estado_frescura: 'fresco',
    ultima_actualizacion: '2026-05-08T10:00:00Z',
    registros_disponibles: 1_234_567,
  },
  {
    dataset: 'ivr_llamadas_puebla',
    trimestre: 'Q1_26',
    minutos_desde_etl: 1_560,
    estado_frescura: 'vencido',
    ultima_actualizacion: '2026-05-06T18:00:00Z',
    registros_disponibles: 404_483,
  },
]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    logs: { etlAvailability: AVAILABILITY_DATA, loading: false, error: null },
  }),
}))

jest.mock('@store/slices/logs', () => ({
  fetchETLAvailability: jest.fn(() => ({ type: 'logs/fetchETLAvailability' })),
  selectETLAvailability: (s) => s.logs.etlAvailability,
  selectLogsLoading: (s) => s.logs.loading ?? false,
  selectLogsError: (s) => s.logs.error ?? null,
}))

import { fetchETLAvailability } from '@store/slices/logs'

function wrap() {
  return render(<MemoryRouter><ETLAvailability /></MemoryRouter>)
}

describe('ETLAvailability — UC_PIP_03', () => {
  beforeEach(() => { mockDispatch.mockClear(); fetchETLAvailability.mockClear() })

  it('renders page title', () => {
    wrap()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('dispatches fetchETLAvailability on mount', () => {
    wrap()
    expect(fetchETLAvailability).toHaveBeenCalled()
  })

  it('renders dataset names', () => {
    wrap()
    expect(screen.getByText('ivr_llamadas_nacional')).toBeInTheDocument()
    expect(screen.getByText('ivr_llamadas_puebla')).toBeInTheDocument()
  })

  it('renders estado_frescura badges', () => {
    wrap()
    expect(screen.getByText('fresco')).toBeInTheDocument()
    expect(screen.getByText('vencido')).toBeInTheDocument()
  })

  it('shows FA-01 stale banner when any dataset is vencido', () => {
    wrap()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/vencido/i)
  })

  it('does not show stale banner when all datasets are fresco', () => {
    const frescoOnly = [AVAILABILITY_DATA[0]]
    jest.spyOn(require('react-redux'), 'useSelector').mockImplementation((selector) =>
      selector({ logs: { etlAvailability: frescoOnly, loading: false, error: null } })
    )
    wrap()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    jest.restoreAllMocks()
  })

  it('renders minutos_desde_etl column', () => {
    wrap()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('1560')).toBeInTheDocument()
  })
})
