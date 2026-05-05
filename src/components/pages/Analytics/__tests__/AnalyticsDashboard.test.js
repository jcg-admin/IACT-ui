/**
 * AnalyticsDashboard Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AnalyticsDashboard from '../AnalyticsDashboard'

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

describe('AnalyticsDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', () => {
    render(<AnalyticsDashboard />)
    expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument()
  })

  it('should render tabs', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })
  })

  it('should display metrics on overview tab', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
    })
  })

  it('should switch tabs on click', async () => {
    render(<AnalyticsDashboard />)
    
    const reportsTab = screen.getByText('Reports')
    fireEvent.click(reportsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Create Custom Report')).toBeInTheDocument()
    })
  })

  it('should show export buttons', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Export as Excel')).toBeInTheDocument()
    })
  })
})
