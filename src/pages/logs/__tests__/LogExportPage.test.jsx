import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LogExportPage from '../LogExportPage'

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({ logs: { loading: false, error: null, logs: [], searchResults: [], systemStatus: null } }),
}))

// exportLogs uses .fulfilled.match() so needs a real createAsyncThunk
jest.mock('../../../redux/slices/logsSlice', () => {
  const { createAsyncThunk } = require('@reduxjs/toolkit')
  const exportLogs = createAsyncThunk('logs/exportLogs', jest.fn().mockResolvedValue({}))
  return {
    exportLogs,
    selectLogsLoading: (s) => s.logs.loading,
  }
})

function wrapper(ui) { return render(<MemoryRouter>{ui}</MemoryRouter>) }

describe('LogExportPage', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<LogExportPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders date inputs', () => {
    wrapper(<LogExportPage />)
    const inputs = document.querySelectorAll('input[type="date"]')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('renders format selector', () => {
    wrapper(<LogExportPage />)
    const selects = document.querySelectorAll('select')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('renders export button', () => {
    wrapper(<LogExportPage />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
