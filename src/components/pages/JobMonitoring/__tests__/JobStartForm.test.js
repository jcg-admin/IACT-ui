/**
 * JobStartForm Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JobStartForm from '../JobStartForm'

describe('JobStartForm Component', () => {
  it('should render job type selector', () => {
    render(
      <JobStartForm onSubmit={jest.fn()} onCancel={jest.fn()} />
    )

    expect(screen.getByLabelText('Job Type')).toBeInTheDocument()
  })

  it('should render start and cancel buttons', () => {
    render(
      <JobStartForm onSubmit={jest.fn()} onCancel={jest.fn()} />
    )

    expect(screen.getByText('Start Job')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onSubmit when form submitted', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined)

    render(
      <JobStartForm onSubmit={mockOnSubmit} onCancel={jest.fn()} />
    )

    const startButton = screen.getByText('Start Job')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('should call onCancel when cancel button clicked', () => {
    const mockOnCancel = jest.fn()

    render(
      <JobStartForm onSubmit={jest.fn()} onCancel={mockOnCancel} />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should change job type on select change', () => {
    render(
      <JobStartForm onSubmit={jest.fn()} onCancel={jest.fn()} />
    )

    const select = screen.getByDisplayValue('Data Export')
    fireEvent.change(select, { target: { value: 'transform' } })

    expect(screen.getByDisplayValue('Data Transformation')).toBeInTheDocument()
  })
})
