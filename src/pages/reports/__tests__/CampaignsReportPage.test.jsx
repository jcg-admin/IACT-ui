import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CampaignsReportPage from '../CampaignsReportPage'

jest.mock('../../../services/reportsService', () => ({
  default: { getCampaignsReport: jest.fn().mockResolvedValue([]) },
}))

jest.mock('../../../services/apiService', () => ({
  default: { get: jest.fn().mockResolvedValue([]) },
}))

jest.mock('../../../components/reports/ReportFilters', () =>
  function MockFilters({ onApply }) {
    return <button onClick={onApply}>Aplicar filtros</button>
  }
)

jest.mock('../../../components/reports/ReportTable', () =>
  function MockTable({ data }) {
    return <div data-testid="report-table">Rows: {data.length}</div>
  }
)

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('CampaignsReportPage', () => {
  it('renders page heading', () => {
    wrapper(<CampaignsReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders ReportFilters', () => {
    wrapper(<CampaignsReportPage />)
    expect(screen.getByText('Aplicar filtros')).toBeInTheDocument()
  })

  it('renders ReportTable', () => {
    wrapper(<CampaignsReportPage />)
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
  })
})
