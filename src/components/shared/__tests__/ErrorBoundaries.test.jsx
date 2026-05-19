import React from 'react'
import { render, screen } from '@testing-library/react'
import RootErrorBoundary, { APIErrorBoundary, ComponentErrorBoundary } from '../ErrorBoundaries'

function Crash() {
  throw new Error('boundary test')
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  console.error.mockRestore()
})

describe('RootErrorBoundary', () => {
  it('renders children normally', () => {
    render(<RootErrorBoundary><p>ok</p></RootErrorBoundary>)
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows error fallback when child crashes', () => {
    render(<RootErrorBoundary><Crash /></RootErrorBoundary>)
    expect(screen.getByText(/Application Error/i)).toBeInTheDocument()
  })
})

describe('APIErrorBoundary', () => {
  it('renders children normally', () => {
    render(<APIErrorBoundary><p>api content</p></APIErrorBoundary>)
    expect(screen.getByText('api content')).toBeInTheDocument()
  })

  it('renders fallback on error', () => {
    render(<APIErrorBoundary><Crash /></APIErrorBoundary>)
    expect(screen.queryByText('api content')).not.toBeInTheDocument()
  })
})

describe('ComponentErrorBoundary', () => {
  it('renders children normally', () => {
    render(<ComponentErrorBoundary><p>component content</p></ComponentErrorBoundary>)
    expect(screen.getByText('component content')).toBeInTheDocument()
  })

  it('renders fallback on error', () => {
    render(<ComponentErrorBoundary><Crash /></ComponentErrorBoundary>)
    expect(screen.queryByText('component content')).not.toBeInTheDocument()
  })
})
