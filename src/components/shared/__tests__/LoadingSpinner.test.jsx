import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.spinner')).toBeInTheDocument()
  })

  it('renders message when provided', () => {
    render(<LoadingSpinner message="Cargando datos..." />)
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })

  it('renders without message by default', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('applies sm size class', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    expect(container.querySelector('.spinner-sm')).toBeInTheDocument()
  })

  it('applies lg size class', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    expect(container.querySelector('.spinner-lg')).toBeInTheDocument()
  })

  it('applies md size class by default', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner.classList.contains('spinner-sm')).toBe(false)
    expect(spinner.classList.contains('spinner-lg')).toBe(false)
  })
})
