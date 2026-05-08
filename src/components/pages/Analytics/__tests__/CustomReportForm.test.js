/**
 * CustomReportForm Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CustomReportForm from '../CustomReportForm'

jest.mock('@services/notificationGateway', () => ({
  getNotificationService: jest.fn(() => ({
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn()
  }))
}))

describe('CustomReportForm Component', () => {
  it('should render create report heading', () => {
    render(<CustomReportForm onGenerateReport={jest.fn()} />)
    expect(screen.getByText('Create Custom Report')).toBeInTheDocument()
  })

  it('should render form labels', () => {
    render(<CustomReportForm onGenerateReport={jest.fn()} />)
    expect(screen.getByText('Report Name')).toBeInTheDocument()
    expect(screen.getByText('Report Type')).toBeInTheDocument()
    expect(screen.getByText('Date Range')).toBeInTheDocument()
  })

  it('should have generate button', () => {
    render(<CustomReportForm onGenerateReport={jest.fn()} />)
    expect(screen.getByText('Generate Report')).toBeInTheDocument()
  })

  it('should include metric checkboxes', () => {
    render(<CustomReportForm onGenerateReport={jest.fn()} />)
    const userCheckbox = screen.getByLabelText(/Users/)
    expect(userCheckbox).toBeInTheDocument()
  })

  it('should call onGenerateReport when form submitted with name', async () => {
    const mockOnGenerateReport = jest.fn()
    render(<CustomReportForm onGenerateReport={mockOnGenerateReport} />)

    const nameInput = screen.getByPlaceholderText(/Monthly Performance/)
    fireEvent.change(nameInput, { target: { value: 'Q1 Report' } })

    const generateButton = screen.getByText('Generate Report')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockOnGenerateReport).toHaveBeenCalled()
    })
  })
})
