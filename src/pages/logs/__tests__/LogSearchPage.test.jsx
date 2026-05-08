import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LogSearch from '../LogSearch'

const RESULTS = [
  { id: 1, level: 'ERROR', message: 'NullPointerException in AuthService', service: 'auth', timestamp: '2026-05-05T09:00:00Z' },
]

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { loading: false, error: null, logs: [], searchResults: RESULTS, systemStatus: null } }),
}))

jest.mock('../../../redux/slices/logs', () => ({
  searchLogs: jest.fn((query) => ({ type: 'logs/searchLogs', payload: query })),
  selectSearchResults: (s) => s.logs.searchResults,
  selectLogsLoading: (s) => s.logs.loading,
}))

function wrapper(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('LogSearch', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders search input', () => {
    wrapper(<LogSearch />)
    expect(screen.getByRole('textbox') || screen.getByPlaceholderText(/buscar/i)).toBeTruthy()
  })

  it('renders search results', () => {
    wrapper(<LogSearch />)
    expect(screen.getByText('NullPointerException in AuthService')).toBeInTheDocument()
  })

  it('renders page heading', () => {
    wrapper(<LogSearch />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
