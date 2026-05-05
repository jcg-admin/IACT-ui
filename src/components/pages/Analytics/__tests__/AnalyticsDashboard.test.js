/**
 * AnalyticsDashboard Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import AnalyticsDashboard from '../AnalyticsDashboard'
import reportsReducer from '../../../../redux/slices/reportsSlice'

jest.mock('@facades/ReportExporter', () => ({
  default: {
    exportAsExcel: jest.fn().mockResolvedValue({ success: true }),
    exportAsPDF: jest.fn().mockResolvedValue({ success: true })
  }
}))

jest.mock('@services/notificationService', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }))
}))

jest.mock('@services/websocketService', () => ({
  getWebSocketService: jest.fn(() => ({
    on: jest.fn(() => jest.fn()),
    off: jest.fn(),
  }))
}))

jest.mock('../../../../services/reportsService', () => ({
  default: {
    getDashboardMetrics: jest.fn().mockResolvedValue({
      totalUsers: 2547,
      activeUsers: 1832,
      jobsCompleted: 12453,
      jobsRunning: 28,
      dataExported: '2.5TB',
    }),
  }
}))

// Mock Recharts to avoid canvas errors in tests
jest.mock('recharts', () => {
  const React = require('react')
  return {
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Line: () => null,
    Pie: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }) => <div>{children}</div>
  }
})

function renderWithStore(preloaded = {}) {
  const store = configureStore({
    reducer: { reports: reportsReducer },
    preloadedState: { reports: { metrics: null, scheduledReports: [], loading: false, error: null, ...preloaded } },
  })
  return render(
    <Provider store={store}>
      <AnalyticsDashboard />
    </Provider>
  )
}

describe('AnalyticsDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', () => {
    renderWithStore()
    expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument()
  })

  it('should render tabs', async () => {
    renderWithStore()
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })
  })

  it('should display metrics on overview tab', async () => {
    renderWithStore()
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
    })
  })

  it('should switch tabs on click', async () => {
    renderWithStore()

    const reportsTab = screen.getByText('Reports')
    fireEvent.click(reportsTab)

    await waitFor(() => {
      expect(screen.getByText('Create Custom Report')).toBeInTheDocument()
    })
  })

  it('should show export buttons', async () => {
    renderWithStore()
    await waitFor(() => {
      expect(screen.getByText('Export as Excel')).toBeInTheDocument()
    })
  })
})
