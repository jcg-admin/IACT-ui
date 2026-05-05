/**
 * ExportTypeSelector Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ExportTypeSelector from '../ExportTypeSelector'

describe('ExportTypeSelector Component', () => {
  it('should render all export types', () => {
    render(
      <ExportTypeSelector selectedType={null} onSelect={jest.fn()} />
    )

    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Jobs')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('should call onSelect when type clicked', () => {
    const mockOnSelect = jest.fn()
    render(
      <ExportTypeSelector selectedType={null} onSelect={mockOnSelect} />
    )

    fireEvent.click(screen.getByText('Users'))
    expect(mockOnSelect).toHaveBeenCalledWith('users')
  })

  it('should highlight selected type', () => {
    render(
      <ExportTypeSelector selectedType="jobs" onSelect={jest.fn()} />
    )

    const jobsCard = screen.getByText('Jobs').closest('.type-card')
    expect(jobsCard).toHaveClass('selected')
  })
})
