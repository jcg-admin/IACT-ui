import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LogExport from '../LogExport'

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

describe('LogExport', () => {
  beforeEach(() => mockDispatch.mockClear())

  it('renders page heading', () => {
    wrapper(<LogExport />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders date inputs', () => {
    wrapper(<LogExport />)
    const inputs = document.querySelectorAll('input[type="date"]')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('renders format selector', () => {
    wrapper(<LogExport />)
    const selects = document.querySelectorAll('select')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('renders export button', () => {
    wrapper(<LogExport />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
