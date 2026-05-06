import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UniqueClientsReportPage from '../UniqueClientsReportPage'

jest.mock('../../../services/reportsService', () => ({
  default: {
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=unique-clients'),
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
    return <div data-testid="saved-filters-panel"><button onClick={() => onApply({})}>apply-saved</button></div>
  }
)

jest.mock('../../../components/reports/ShareReportModal', () =>
  function MockShareReportModal({ isOpen }) {
    return isOpen ? <div data-testid="share-report-modal" /> : null
  }
)

jest.mock('../../../components/reports/ReportTable', () =>
  function MockTable({ data }) {
    return <div data-testid="report-table">Rows: {data.length}</div>
  }
)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('UniqueClientsReportPage', () => {
  it('renders page heading', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportFilters', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByText('Aplicar filtros')).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<UniqueClientsReportPage />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
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
