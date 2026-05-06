import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QueuesReportPage from '../QueuesReportPage'

const MOCK_ROW = {
  trimestre: 'Q01_25',
  segmento: 'Nacional',
  centro_transferencia: '19020086',
  total_llamadas: 901808,
  misma_linea: 78589,
  linea_diferente: 177548,
  no_digito_telefono: 645671,
}

jest.mock('../../../services/reportsService', () => ({
  __esModule: true,
  default: {
    getQueuesReport: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=queues'),
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

describe('QueuesReportPage — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})

describe('QueuesReportPage — columnas del schema real', () => {
  it('pasa columna centro_transferencia al ReportTable', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('col-centro_transferencia')).toBeInTheDocument()
  })

  it('pasa columna total_llamadas al ReportTable', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('col-total_llamadas')).toBeInTheDocument()
  })

  it('pasa columna misma_linea al ReportTable', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('col-misma_linea')).toBeInTheDocument()
  })

  it('pasa columna linea_diferente al ReportTable', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('col-linea_diferente')).toBeInTheDocument()
  })

  it('pasa columna no_digito_telefono al ReportTable', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('col-no_digito_telefono')).toBeInTheDocument()
  })

  it('NO pasa columnas del schema obsoleto', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.queryByTestId('col-queue')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-incoming_calls')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-avg_wait_time')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-abandon_pct')).not.toBeInTheDocument()
  })
})

describe('QueuesReportPage — filtros reales (trimestre / segmento)', () => {
  it('renderiza selector de trimestre', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByLabelText(/trimestre/i)).toBeInTheDocument()
  })

  it('renderiza selector de segmento', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByLabelText(/segmento/i)).toBeInTheDocument()
  })

  it('el selector trimestre tiene opción Q01_25', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByRole('option', { name: 'Q01_25' })).toBeInTheDocument()
  })

  it('el selector segmento tiene opción Nacional', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByRole('option', { name: /nacional/i })).toBeInTheDocument()
  })
})

describe('QueuesReportPage — renderiza filas del servicio', () => {
  it('muestra filas cuando el servicio retorna datos', async () => {
    const svc = jest.requireMock('../../../services/reportsService').default
    svc.getQueuesReport.mockResolvedValueOnce([MOCK_ROW, MOCK_ROW])
    wrapper(<QueuesReportPage />)
    expect(await screen.findByText('Rows: 2')).toBeInTheDocument()
  })
})

describe('QueuesReportPage — SavedFiltersPanel (uc-rpt-10)', () => {
  it('renders SavedFiltersPanel', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByTestId('saved-filters-panel')).toBeInTheDocument()
  })

  it('renders Guardar vista button', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByRole('button', { name: /guardar vista/i })).toBeInTheDocument()
  })
})

describe('QueuesReportPage — Compartir (uc-rpt-11)', () => {
  it('renders Compartir button', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
