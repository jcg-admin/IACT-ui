import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UniqueClientsReportPage from '../UniqueClientsReportPage'

const MOCK_ROWS = [
  { trimestre: 'Q01_25', segmento: 'Nacional_B', clientes_unicos: 3056531 },
  { trimestre: 'Q01_25', segmento: 'Puebla',     clientes_unicos: 155507  },
]

jest.mock('../../../services/reportsService', () => ({
  __esModule: true,
  default: {
    getUniqueClients: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=unique-clients'),
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

describe('UniqueClientsReportPage — estructura base', () => {
  it('renders page heading', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})

describe('UniqueClientsReportPage — columnas del schema real', () => {
  it('pasa columna trimestre al ReportTable', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByTestId('col-trimestre')).toBeInTheDocument()
  })

  it('pasa columna segmento al ReportTable', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByTestId('col-segmento')).toBeInTheDocument()
  })

  it('pasa columna clientes_unicos al ReportTable', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByTestId('col-clientes_unicos')).toBeInTheDocument()
  })

  it('NO pasa columnas del schema obsoleto', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.queryByTestId('col-client_id')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-calls')).not.toBeInTheDocument()
    expect(screen.queryByTestId('col-first_call')).not.toBeInTheDocument()
  })
})

describe('UniqueClientsReportPage — filtro de trimestre', () => {
  it('renderiza selector de trimestre', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByLabelText(/trimestre/i)).toBeInTheDocument()
  })

  it('el selector tiene opción Q01_25', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByRole('option', { name: 'Q01_25' })).toBeInTheDocument()
  })

  it('el selector tiene opción para "todos" (valor vacío)', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByRole('option', { name: /todos/i })).toBeInTheDocument()
  })
})

describe('UniqueClientsReportPage — renderiza filas del servicio', () => {
  it('muestra filas cuando el servicio retorna datos', async () => {
    const svc = jest.requireMock('../../../services/reportsService').default
    svc.getUniqueClients.mockResolvedValueOnce(MOCK_ROWS)
    wrapper(<UniqueClientsReportPage />)
    expect(await screen.findByText('Rows: 2')).toBeInTheDocument()
  })
})

describe('UniqueClientsReportPage — SavedFiltersPanel (uc-rpt-10)', () => {
  it('renders SavedFiltersPanel', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByTestId('saved-filters-panel')).toBeInTheDocument()
  })

  it('renders Guardar vista button', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByRole('button', { name: /guardar vista/i })).toBeInTheDocument()
  })
})

describe('UniqueClientsReportPage — Compartir (uc-rpt-11)', () => {
  it('renders Compartir button', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument()
  })
})
