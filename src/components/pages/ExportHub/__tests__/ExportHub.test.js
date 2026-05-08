/**
 * ExportHub Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExportHub from '../ExportHub'

jest.mock('@facades/ReportExporter', () => ({
  default: {
    exportAsExcel: jest.fn().mockResolvedValue({ success: true }),
    exportAsCSV: jest.fn().mockResolvedValue({ success: true }),
    exportAsPDF: jest.fn().mockResolvedValue({ success: true }),
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

describe('ExportHub Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page header', () => {
    render(<ExportHub />)
    expect(screen.getByText('Data Export Hub')).toBeInTheDocument()
  })

  it('should render export type options', () => {
    render(<ExportHub />)
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Jobs')).toBeInTheDocument()
  })

  it('should select data type on click', async () => {
    render(<ExportHub />)
    
    const usersButton = screen.getByText('Users')
    fireEvent.click(usersButton)
    
    await waitFor(() => {
      expect(screen.getByText('Format & Options')).toBeInTheDocument()
    })
  })

  it('should show format buttons when type selected', async () => {
    render(<ExportHub />)
    
    fireEvent.click(screen.getByText('Users'))
    
    await waitFor(() => {
      expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument()
    })
  })

  it('should display action buttons when type selected', async () => {
    render(<ExportHub />)
    
    fireEvent.click(screen.getByText('Jobs'))
    
    await waitFor(() => {
      expect(screen.getByText('Preview Data')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()
    })
  })
})
