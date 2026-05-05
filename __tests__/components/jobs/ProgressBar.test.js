/**
 * ProgressBar Component Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import ProgressBar from '@components/jobs/ProgressBar'

describe('ProgressBar Component', () => {
  it('should render progress bar', () => {
    const { container } = render(<ProgressBar progress={50} />)
    expect(container.querySelector('.progress-bar')).toBeInTheDocument()
  })

  it('should display percentage', () => {
    render(<ProgressBar progress={75} label="Processing" />)
    expect(screen.getByText(/75%/)).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<ProgressBar progress={50} label="Uploading files" />)
    expect(screen.getByText('Uploading files')).toBeInTheDocument()
  })

  it('should display ETA when provided', () => {
    // 120 segundos = 2 minutos
    render(<ProgressBar progress={50} etaSeconds={120} />)
    // Formato: 2m 0s
    expect(screen.getByText(/2m/)).toBeInTheDocument()
  })

  it('should display status badge', () => {
    const { container } = render(
      <ProgressBar progress={100} />
    )
    // Cuando progress es 100, debe mostrar "Completed" y tener clase --completed
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(container.querySelector('.progress-bar--completed')).toBeInTheDocument()
  })

  it('should have correct width based on progress', () => {
    const { container } = render(<ProgressBar progress={50} />)
    const _bar = container.querySelector('.progress-bar__fill')
    expect(_bar.style.width).toBe('50%')
  })

  it('should have ARIA progressbar role', () => {
    render(<ProgressBar progress={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should have correct ARIA attributes', () => {
    render(<ProgressBar progress={75} label="Upload" />)
    const _bar = screen.getByRole('progressbar')
    expect(_bar).toHaveAttribute('aria-valuenow', '75')
    expect(_bar).toHaveAttribute('aria-valuemin', '0')
    expect(_bar).toHaveAttribute('aria-valuemax', '100')
  })
})
