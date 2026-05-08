import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TransfersReport from '../TransfersReport'

const MOCK_ROW = {
  trimestre: 'Q01_25',
  fecha: '202503',
  '800_transfer': 'Nacional',
  centro_transferencia: '19020086',
  menu: 'cliente_colgo',
  opcion: 'SIN_OPCION',
  total_llamadas: 901808,
  porcentaje: 7.7450435,
  misma_linea: 78589,
  linea_diferente: 177548,
  no_digito_telefono: 645671,
}

jest.mock('../../../services/reportsGateway', () => ({
  __esModule: true,
  default: {
    getTransfersByCentro: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=transfers'),
  },
}))

jest.mock('../../../services/apiClient', () => ({
  default: { get: jest.fn().mockResolvedValue([]) },
}))

jest.mock('../../../components/reports/ReportFilters', () =>
  function MockFilters({ onApply }) {
    return <button onClick={onApply}>Aplicar filtros</button>
  }
)

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

describe('TransfersReport — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportFilters', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByText('Aplicar filtros')).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})

describe('TransfersReport — columnas del schema real', () => {
  it('pasa columna centro_transferencia al ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('col-centro_transferencia')).toBeInTheDocument()
  })

  it('pasa columna total_llamadas al ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('col-total_llamadas')).toBeInTheDocument()
  })

  it('pasa columna misma_linea al ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('col-misma_linea')).toBeInTheDocument()
  })

  it('pasa columna linea_diferente al ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('col-linea_diferente')).toBeInTheDocument()
  })

  it('pasa columna no_digito_telefono al ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('col-no_digito_telefono')).toBeInTheDocument()
  })

  it('pasa columna porcentaje al ReportTable', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('col-porcentaje')).toBeInTheDocument()
  })

  it('NO pasa columnas del schema obsoleto (origin, destination, count)', () => {
    wrapper(<TransfersReport />)
    expect(screen.queryByTestId('col-origin')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-destination')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-count')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-success_rate_pct')).not.toBeInTheDocument()
  })
})

describe('TransfersReport — filtros reales (trimestre / segmento)', () => {
  it('renderiza selector de trimestre', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByLabelText(/trimestre/i)).toBeInTheDocument()
  })

  it('renderiza selector de segmento (800_transfer)', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByLabelText(/segmento/i)).toBeInTheDocument()
  })

  it('el selector trimestre tiene opción Q01_25', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByRole('option', { name: /Q01_25/i })).toBeInTheDocument()
  })

  it('el selector segmento tiene opción Nacional', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByRole('option', { name: /nacional/i })).toBeInTheDocument()
  })
})

describe('TransfersReport — llamada al servicio', () => {
  it('llama a reportsService.getTransfersByCentro en mount', async () => {
    const svc = jest.requireMock('../../../services/reportsGateway').default
    svc.getTransfersByCentro.mockClear()
    wrapper(<TransfersReport />)
    await screen.findByRole('heading', { level: 1 })
    expect(svc.getTransfersByCentro).toHaveBeenCalledTimes(1)
  })

  it('llama con filtros que incluyen trimestre y segmento', async () => {
    const svc = jest.requireMock('../../../services/reportsGateway').default
    svc.getTransfersByCentro.mockClear()
    wrapper(<TransfersReport />)
    await screen.findByRole('heading', { level: 1 })
    const [callArg] = svc.getTransfersByCentro.mock.calls[0]
    expect(callArg).toHaveProperty('trimestre')
    expect(callArg).toHaveProperty('segmento')
  })

  it('renderiza filas cuando el servicio retorna datos', async () => {
    const svc = jest.requireMock('../../../services/reportsGateway').default
    svc.getTransfersByCentro.mockResolvedValueOnce([MOCK_ROW, MOCK_ROW])
    wrapper(<TransfersReport />)
    expect(await screen.findByText('Rows: 2')).toBeInTheDocument()
  })
})

describe('TransfersReport — SavedFiltersPanel (uc-rpt-10)', () => {
  it('renders SavedFiltersPanel', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByTestId('saved-filters-panel')).toBeInTheDocument()
  })

  it('renders Guardar vista button', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByRole('button', { name: /guardar vista/i })).toBeInTheDocument()
  })
})

describe('TransfersReport — Compartir (uc-rpt-11)', () => {
  it('renders Compartir button', () => {
    wrapper(<TransfersReport />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
