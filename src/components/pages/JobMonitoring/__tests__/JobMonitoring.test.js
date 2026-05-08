/**
 * JobMonitoring Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JobMonitoring from '../JobMonitoring'

jest.mock('@facades/JobOrchestrator', () => ({
  default: {
    startAndMonitor: jest.fn().mockResolvedValue({
      id: 'job-1',
      status: 'completed'
    }),
    executeAndDownload: jest.fn().mockResolvedValue({
      filename: 'result.xlsx'
    }),
    cancelAndCleanup: jest.fn().mockResolvedValue({ success: true }),
    retryJob: jest.fn().mockResolvedValue({
      succeeded: true,
      retries: 2
    }),
    getJobSummary: jest.fn().mockResolvedValue({ status: 'completed' }),
    listActiveJobs: jest.fn().mockResolvedValue([])
  }
}))

jest.mock('@facades/ReportExporter', () => ({
  default: {
    exportAsExcel: jest.fn().mockResolvedValue({ success: true }),
    batchExport: jest.fn().mockResolvedValue({ success: true })
  }
}))

jest.mock('@services/notificationGateway', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  }))
}))

describe('JobMonitoring Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', () => {
    render(<JobMonitoring />)
    expect(screen.getByText('Job Monitoring')).toBeInTheDocument()
  })

  it('should render start new job button', () => {
    render(<JobMonitoring />)
    expect(screen.getByText('Start New Job')).toBeInTheDocument()
  })

  it('should load jobs on mount', async () => {
    render(<JobMonitoring />)
    
    await waitFor(() => {
      expect(screen.getByText(/Showing.*jobs/)).toBeInTheDocument()
    })
  })

  it('should display active jobs section', async () => {
    render(<JobMonitoring />)
    
    await waitFor(() => {
      expect(screen.getByText(/Active Jobs/)).toBeInTheDocument()
    })
  })

  it('should display results counter', async () => {
    render(<JobMonitoring />)
    
    await waitFor(() => {
      expect(screen.getByText(/Showing.*jobs/)).toBeInTheDocument()
    })
  })
})
