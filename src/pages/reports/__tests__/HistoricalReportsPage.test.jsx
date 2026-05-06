import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoricalReportsPage from '../HistoricalReportsPage'

const MOCK_ROW = {
  periodo: 'last_7d',
  segmento: 'Nacional',
  dimension: 'menu',
  total_llamadas: 88500,
  fecha_inicio: '2026-04-29',
  fecha_fin: '2026-05-06',
}

jest.mock('../../../services/reportsService', () => ({
  __esModule: true,
  default: {
    getReportHistory: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=history'),
  },
}))

jest.mock('../../../services/apiService', () => ({
  default: { get: jest.fn().mockResolvedValue([]) },
}))

jest.mock('../../../components/reports/SavedFiltersPanel', () =>
  function MockSavedFiltersPanel({ onApply }) {
    return (
      <div data-testid="saved-filters-panel">
        <button onClick={() => onApply({})}>apply-saved</button>
      </div>
    )
  }
)

jest.mock('../../../components/reports/ShareReportModal', () =>
  function MockShareReportModal({ isOpen }) {
    return isOpen ? <div data-testid="share-report-modal" /> : null
  }
)

jest.mock('../../../components/reports/ReportTable', () =>
  function MockTable({ columns, data }) {
    return (
      <div data-testid="report-table">
        <span data-testid="row-count">Rows: {data.length}</span>
        {columns.map((c) => (
          <span key={c.key} data-testid={`col-${c.key}`}>{c.label}</span>
        ))}
      </div>
    )
  }
)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('HistoricalReportsPage — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})

describe('HistoricalReportsPage — selector de periodo (uc-rpt-03)', () => {
  it('renderiza selector de periodo', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByLabelText(/periodo/i)).toBeInTheDocument()
  })

  it('tiene opción last_24h', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('option', { name: /24h/i })).toBeInTheDocument()
  })

  it('tiene opción last_7d', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('option', { name: /7.?d/i })).toBeInTheDocument()
  })

  it('tiene opción last_30d', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('option', { name: /30.?d/i })).toBeInTheDocument()
  })

  it('tiene opción year-to-date', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('option', { name: /year.to.date|año.en.curso/i })).toBeInTheDocument()
  })
})

describe('HistoricalReportsPage — filtro de segmento', () => {
  it('renderiza selector de segmento', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByLabelText(/segmento/i)).toBeInTheDocument()
  })

  it('tiene opción Nacional', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('option', { name: /nacional/i })).toBeInTheDocument()
  })
})

describe('HistoricalReportsPage — columnas del schema', () => {
  it('pasa columna periodo al ReportTable', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByTestId('col-periodo')).toBeInTheDocument()
  })

  it('pasa columna total_llamadas al ReportTable', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByTestId('col-total_llamadas')).toBeInTheDocument()
  })
})

describe('HistoricalReportsPage — renderiza filas del servicio', () => {
  it('muestra filas cuando el servicio retorna datos', async () => {
    const svc = jest.requireMock('../../../services/reportsService').default
    svc.getReportHistory.mockResolvedValueOnce([MOCK_ROW, MOCK_ROW])
    wrapper(<HistoricalReportsPage />)
    expect(await screen.findByText('Rows: 2')).toBeInTheDocument()
  })
})

describe('HistoricalReportsPage — SavedFiltersPanel (uc-rpt-10)', () => {
  it('renders SavedFiltersPanel', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByTestId('saved-filters-panel')).toBeInTheDocument()
  })

  it('renders Guardar vista button', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('button', { name: /guardar vista/i })).toBeInTheDocument()
  })
})

describe('HistoricalReportsPage — Compartir (uc-rpt-11)', () => {
  it('renders Compartir button', () => {
    wrapper(<HistoricalReportsPage />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
