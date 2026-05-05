/**
 * ReportBuilder Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReportBuilder from '../ReportBuilder'

jest.mock('@services/notificationService', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn()
  }))
}))

describe('ReportBuilder Component', () => {
  it('should render create report heading', () => {
    render(<ReportBuilder onGenerateReport={jest.fn()} />)
    expect(screen.getByText('Create Custom Report')).toBeInTheDocument()
  })

  it('should render form labels', () => {
    render(<ReportBuilder onGenerateReport={jest.fn()} />)
    expect(screen.getByText('Report Name')).toBeInTheDocument()
    expect(screen.getByText('Report Type')).toBeInTheDocument()
    expect(screen.getByText('Date Range')).toBeInTheDocument()
  })

  it('should have generate button', () => {
    render(<ReportBuilder onGenerateReport={jest.fn()} />)
    expect(screen.getByText('Generate Report')).toBeInTheDocument()
  })

  it('should include metric checkboxes', () => {
    render(<ReportBuilder onGenerateReport={jest.fn()} />)
    const userCheckbox = screen.getByLabelText(/Users/)
    expect(userCheckbox).toBeInTheDocument()
  })

  it('should call onGenerateReport when form submitted with name', async () => {
    const mockOnGenerateReport = jest.fn()
    render(<ReportBuilder onGenerateReport={mockOnGenerateReport} />)

    const nameInput = screen.getByPlaceholderText(/Monthly Performance/)
    fireEvent.change(nameInput, { target: { value: 'Q1 Report' } })

    const generateButton = screen.getByText('Generate Report')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockOnGenerateReport).toHaveBeenCalled()
    })
  })
})
