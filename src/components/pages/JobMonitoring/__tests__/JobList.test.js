/**
 * JobList Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import JobList from '../JobList'

const mockJobs = [
  {
    id: 'job-001',
    type: 'export',
    name: 'User Export',
    status: 'completed',
    progress: 100,
    rowsProcessed: 2500,
    duration: 600,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job-002',
    type: 'backup',
    name: 'Database Backup',
    status: 'failed',
    progress: 45,
    createdAt: new Date().toISOString()
  }
]

describe('JobList Component', () => {
  it('should render jobs in table', () => {
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onDownload={jest.fn()}
        onRetry={jest.fn()}
        onViewDetails={jest.fn()}
      />
    )

    expect(screen.getByText('User Export')).toBeInTheDocument()
    expect(screen.getByText('Database Backup')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <JobList
        jobs={[]}
        loading={true}
        onDownload={jest.fn()}
        onRetry={jest.fn()}
        onViewDetails={jest.fn()}
      />
    )

    expect(screen.getByText('Loading jobs...')).toBeInTheDocument()
  })

  it('should show empty state', () => {
    render(
      <JobList
        jobs={[]}
        loading={false}
        onDownload={jest.fn()}
        onRetry={jest.fn()}
        onViewDetails={jest.fn()}
      />
    )

    expect(screen.getByText(/No completed jobs/)).toBeInTheDocument()
  })

  it('should call onDownload when download button clicked', () => {
    const mockOnDownload = jest.fn()
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onDownload={mockOnDownload}
        onRetry={jest.fn()}
        onViewDetails={jest.fn()}
      />
    )

    const downloadButtons = screen.getAllByText('Download')
    if (downloadButtons.length > 0) {
      fireEvent.click(downloadButtons[0])
      expect(mockOnDownload).toHaveBeenCalled()
    }
  })

  it('should call onRetry when retry button clicked', () => {
    const mockOnRetry = jest.fn()
    render(
      <JobList
        jobs={mockJobs}
        loading={false}
        onDownload={jest.fn()}
        onRetry={mockOnRetry}
        onViewDetails={jest.fn()}
      />
    )

    const retryButtons = screen.getAllByText('Retry')
    if (retryButtons.length > 0) {
      fireEvent.click(retryButtons[0])
      expect(mockOnRetry).toHaveBeenCalled()
    }
  })
})
