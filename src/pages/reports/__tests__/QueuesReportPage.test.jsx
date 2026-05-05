import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QueuesReportPage from '../QueuesReportPage'

jest.mock('../../../services/reportsService', () => ({
  default: { getQueuesReport: jest.fn().mockResolvedValue([]) },
}))

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
      screen.getByRole('button') || document.querySelector('form')
    ).toBeTruthy()
  })
})
