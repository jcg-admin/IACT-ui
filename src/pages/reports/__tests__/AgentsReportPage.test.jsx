import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgentsReport from '../AgentsReport'

const MOCK_ROW = {
  trimestre: 'Q01_25',
  segmento: 'Nacional',
  cMenu: 'CLIENTE_COLGO',
  promedio_llamadas: 1.82,
  min_llamadas_x_cliente: 1,
  max_llamadas_x_cliente: 7320,
  total_llamadas: 2507905,
}

jest.mock('../../../services/reportsGateway', () => ({
  __esModule: true,
  default: {
    getAgentsReport: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=agents'),
  },
}))

jest.mock('../../../services/apiClient', () => ({
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

describe('AgentsReport — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})

describe('AgentsReport — columnas del schema real', () => {
  it('pasa columna cMenu al ReportTable', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('col-cMenu')).toBeInTheDocument()
  })

  it('pasa columna total_llamadas al ReportTable', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('col-total_llamadas')).toBeInTheDocument()
  })

  it('pasa columna promedio_llamadas al ReportTable', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('col-promedio_llamadas')).toBeInTheDocument()
  })

  it('pasa columna min_llamadas_x_cliente al ReportTable', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('col-min_llamadas_x_cliente')).toBeInTheDocument()
  })

  it('pasa columna max_llamadas_x_cliente al ReportTable', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('col-max_llamadas_x_cliente')).toBeInTheDocument()
  })

  it('NO pasa columnas del schema obsoleto', () => {
    wrapper(<AgentsReport />)
    expect(screen.queryByTestId('col-agent')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-calls_answered')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-avg_time')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-satisfaction')).not.toBeInTheDocument()
  })
})

describe('AgentsReport — filtros reales (trimestre / segmento)', () => {
  it('renderiza selector de trimestre', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByLabelText(/trimestre/i)).toBeInTheDocument()
  })

  it('renderiza selector de segmento', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByLabelText(/segmento/i)).toBeInTheDocument()
  })

  it('el selector trimestre tiene opción Q01_25', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByRole('option', { name: 'Q01_25' })).toBeInTheDocument()
  })

  it('el selector segmento tiene opción Nacional', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByRole('option', { name: /nacional/i })).toBeInTheDocument()
  })
})

describe('AgentsReport — renderiza filas del servicio', () => {
  it('muestra filas cuando el servicio retorna datos', async () => {
    const svc = jest.requireMock('../../../services/reportsGateway').default
    svc.getAgentsReport.mockResolvedValueOnce([MOCK_ROW, MOCK_ROW, MOCK_ROW])
    wrapper(<AgentsReport />)
    expect(await screen.findByText('Rows: 3')).toBeInTheDocument()
  })
})

describe('AgentsReport — SavedFiltersPanel (uc-rpt-10)', () => {
  it('renders SavedFiltersPanel', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByTestId('saved-filters-panel')).toBeInTheDocument()
  })

  it('renders Guardar vista button', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByRole('button', { name: /guardar vista/i })).toBeInTheDocument()
  })
})

describe('AgentsReport — Compartir (uc-rpt-11)', () => {
  it('renders Compartir button', () => {
    wrapper(<AgentsReport />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
