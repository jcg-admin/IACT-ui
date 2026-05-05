/**
 * ExportOptions Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ExportOptions from '../ExportOptions'

describe('ExportOptions Component', () => {
  it('should render format options', () => {
    render(
      <ExportOptions selectedFormat="xlsx" onFormatChange={jest.fn()} />
    )

    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument()
    expect(screen.getByText('CSV (.csv)')).toBeInTheDocument()
    expect(screen.getByText('PDF (.pdf)')).toBeInTheDocument()
  })

  it('should call onFormatChange when format clicked', () => {
    const mockOnFormatChange = jest.fn()
    render(
      <ExportOptions selectedFormat="xlsx" onFormatChange={mockOnFormatChange} />
    )

    fireEvent.click(screen.getByText('CSV (.csv)'))
    expect(mockOnFormatChange).toHaveBeenCalledWith('csv')
  })

  it('should highlight selected format', () => {
    render(
      <ExportOptions selectedFormat="csv" onFormatChange={jest.fn()} />
    )

    const csvButton = screen.getByText('CSV (.csv)')
    expect(csvButton).toHaveClass('active')
  })

  it('should render export options checkboxes', () => {
    render(
      <ExportOptions selectedFormat="xlsx" onFormatChange={jest.fn()} />
    )

    expect(screen.getByLabelText(/Include Headers/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Format Dates/)).toBeInTheDocument()
  })
})
