import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import IVRMenusReportPage from '../IVRMenusReportPage'

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

describe('IVRMenusReportPage', () => {
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
