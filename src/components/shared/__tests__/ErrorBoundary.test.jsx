import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

function BrokenComponent() {
  throw new Error('test crash')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error from the error boundary
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    console.error.mockRestore()
  })

  it('renders children when no error', () => {
    render(<ErrorBoundary><p>safe content</p></ErrorBoundary>)
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders error fallback when child throws', () => {
    render(<ErrorBoundary><BrokenComponent /></ErrorBoundary>)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows error message in fallback', () => {
    render(<ErrorBoundary><BrokenComponent /></ErrorBoundary>)
    expect(screen.getByText('test crash')).toBeInTheDocument()
  })
})
