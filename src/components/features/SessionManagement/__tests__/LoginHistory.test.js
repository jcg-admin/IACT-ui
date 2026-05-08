/**
 * LoginHistory Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginHistory from '../LoginHistory'

const mockFetchLoginHistory = jest.fn(() => ({ type: 'audit/fetchLoginHistory' }))

jest.mock('@store/slices/audit', () => ({
  fetchLoginHistory: (...args) => mockFetchLoginHistory(...args),
  selectLoginHistory: (s) => s.audit?.loginHistory ?? [],
  selectLoginHistoryLoading: (s) => s.audit?.loginHistoryLoading ?? false,
}))

const mockLoginHistory = [
  { id: '1', timestamp: new Date(Date.now() - 300_000).toISOString(), device: 'Chrome on MacOS',  ip: '192.168.1.100', location: 'San Francisco, CA', status: 'success' },
  { id: '2', timestamp: new Date(Date.now() - 86_400_000).toISOString(), device: 'Safari on iPhone', ip: '192.168.1.101', location: 'San Francisco, CA', status: 'success' },
  { id: '3', timestamp: new Date(Date.now() - 172_800_000).toISOString(), device: 'Unknown Browser',  ip: '203.0.113.50',  location: 'Unknown',           status: 'failed' },
]

function makeStore(loginHistory = mockLoginHistory, loginHistoryLoading = false) {
  return configureStore({
    reducer: {
      audit: (state = { loginHistory, loginHistoryLoading }) => state,
    },
  })
}

function renderHistory(store = makeStore()) {
  return render(<Provider store={store}><LoginHistory /></Provider>)
}

describe('LoginHistory Component', () => {
  beforeEach(() => {
    mockFetchLoginHistory.mockClear()
  })

  it('should dispatch fetchLoginHistory on mount', () => {
    renderHistory()
    expect(mockFetchLoginHistory).toHaveBeenCalledTimes(1)
  })

  it('should render page header', () => {
    renderHistory()
    expect(screen.getByText('Login History')).toBeInTheDocument()
  })

  it('should display login history from store', () => {
    renderHistory()
    expect(screen.getByText('Chrome on MacOS')).toBeInTheDocument()
    expect(screen.getByText('Safari on iPhone')).toBeInTheDocument()
  })

  it('should display table headers', () => {
    renderHistory()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Device')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('should have status badges', () => {
    renderHistory()
    const badges = screen.queryAllByText(/SUCCESS|FAILED/)
    expect(badges.length).toBeGreaterThan(0)
  })

  it('should show loading state', () => {
    renderHistory(makeStore([], true))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should show empty table when no history', () => {
    renderHistory(makeStore([]))
    expect(screen.getByText('Login History')).toBeInTheDocument()
    expect(screen.queryByText('Chrome on MacOS')).not.toBeInTheDocument()
  })
})
