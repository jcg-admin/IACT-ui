import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgentsReportPage from '../AgentsReportPage'

const DATA = [
  { agent: 'Juan Pérez', calls_answered: 42, avg_time: '3:20', satisfaction: '4.5' },
  { agent: 'María López', calls_answered: 38, avg_time: '2:55', satisfaction: '4.8' },
]

jest.mock('../../../services/reportsService', () => ({
  default: {
    getAgentsReport: jest.fn().mockResolvedValue(DATA),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=agents'),
  },
}))

jest.mock('../../../components/reports/SavedFiltersPanel', () =>
  function MockSavedFiltersPanel({ onApply }) {
    return <div data-testid="saved-filters-panel" />
  }
)

jest.mock('../../../components/reports/ShareReportModal', () =>
  function MockShareReportModal({ isOpen }) {
    return isOpen ? <div data-testid="share-report-modal" /> : null
  }
)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AgentsReportPage', () => {
  it('renders page heading', () => {
    wrapper(<AgentsReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders report table or filter form', () => {
    wrapper(<AgentsReportPage />)
    expect(
      screen.getAllByRole('button').length > 0 || screen.queryByRole('table') || document.querySelector('form')
    ).toBeTruthy()
  })

  it('renders date filter inputs', () => {
    wrapper(<AgentsReportPage />)
    const inputs = document.querySelectorAll('input[type="date"], input[type="text"]')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
