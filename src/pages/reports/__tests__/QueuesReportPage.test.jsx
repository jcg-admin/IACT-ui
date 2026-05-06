import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QueuesReportPage from '../QueuesReportPage'

jest.mock('../../../services/reportsService', () => ({
  default: {
    getQueuesReport: jest.fn().mockResolvedValue([]),
    generateShareUrl: jest.fn(() => 'https://example.com/reports/shared?type=queues'),
  },
}))

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

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('QueuesReportPage', () => {
  it('renders page heading', () => {
    wrapper(<QueuesReportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders report controls', () => {
    wrapper(<QueuesReportPage />)
    expect(
      screen.getAllByRole('button').length > 0 || document.querySelector('form')
    ).toBeTruthy()
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
