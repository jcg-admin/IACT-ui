import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import IVRMenusReportPage from '../IVRMenusReportPage'

const MOCK_ROW = {
  trimestre: 'Q01_25',
  segmento: 'Nacional',
  cMenu: 'CLIENTE_COLGO',
  promedio_llamadas: 1.82,
  min_llamadas_x_cliente: 1,
  max_llamadas_x_cliente: 7320,
  total_llamadas: 2507905,
}

jest.mock('../../../services/reportsService', () => ({
  __esModule: true,
  default: {
    getIvrMenus: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=ivr-menus'),
  },
}))

jest.mock('../../../services/apiService', () => ({
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

describe('IVRMenusReportPage — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportFilters', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByText('Aplicar filtros')).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})

describe('IVRMenusReportPage — columnas del schema real', () => {
  it('pasa columna cMenu al ReportTable', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('col-cMenu')).toBeInTheDocument()
  })

  it('pasa columna total_llamadas al ReportTable', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('col-total_llamadas')).toBeInTheDocument()
  })

  it('pasa columna promedio_llamadas al ReportTable', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('col-promedio_llamadas')).toBeInTheDocument()
  })

  it('pasa columna min_llamadas_x_cliente al ReportTable', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('col-min_llamadas_x_cliente')).toBeInTheDocument()
  })

  it('pasa columna max_llamadas_x_cliente al ReportTable', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('col-max_llamadas_x_cliente')).toBeInTheDocument()
  })

  it('NO pasa columnas del schema obsoleto', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.queryByTestId('col-menu')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-option')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-selections')).not.toBeInTheDocument()
  })
})

describe('IVRMenusReportPage — filtros reales (trimestre / segmento)', () => {
  it('renderiza selector de trimestre', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByLabelText(/trimestre/i)).toBeInTheDocument()
  })

  it('renderiza selector de segmento', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByLabelText(/segmento/i)).toBeInTheDocument()
  })

  it('el selector trimestre tiene opción Q01_25', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByRole('option', { name: 'Q01_25' })).toBeInTheDocument()
  })

  it('el selector segmento tiene opción Nacional', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByRole('option', { name: /nacional/i })).toBeInTheDocument()
  })
})

describe('IVRMenusReportPage — renderiza filas del servicio', () => {
  it('muestra filas cuando el servicio retorna datos', async () => {
    const svc = jest.requireMock('../../../services/reportsService').default
    svc.getIvrMenus.mockResolvedValueOnce([MOCK_ROW, MOCK_ROW, MOCK_ROW])
    wrapper(<IVRMenusReportPage />)
    expect(await screen.findByText('Rows: 3')).toBeInTheDocument()
  })
})

describe('IVRMenusReportPage — SavedFiltersPanel (uc-rpt-10)', () => {
  it('renders SavedFiltersPanel', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByTestId('saved-filters-panel')).toBeInTheDocument()
  })

  it('renders Guardar vista button', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByRole('button', { name: /guardar vista/i })).toBeInTheDocument()
  })
})

describe('IVRMenusReportPage — Compartir (uc-rpt-11)', () => {
  it('renders Compartir button', () => {
    wrapper(<IVRMenusReportPage />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
