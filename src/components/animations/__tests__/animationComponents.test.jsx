import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AnimatedButton from '../AnimatedButton'
import AnimatedLoadingSpinner from '../AnimatedLoadingSpinner'
import ModalAnimation from '../ModalAnimation'
import PageTransition from '../PageTransition'

jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      button: ({ children, onClick, disabled, type, ...rest }) => (
        <button onClick={onClick} disabled={disabled} type={type}>{children}</button>
      ),
      div: ({ children, ...rest }) => <div>{children}</div>,
      p: ({ children, ...rest }) => <p>{children}</p>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  }
})

describe('AnimatedButton', () => {
  it('renders children', () => {
    render(<AnimatedButton>Click me</AnimatedButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<AnimatedButton onClick={onClick}>Button</AnimatedButton>)
    fireEvent.click(screen.getByText('Button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects disabled prop', () => {
    render(<AnimatedButton disabled>Button</AnimatedButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('AnimatedLoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<AnimatedLoadingSpinner />)
    expect(container.firstChild).not.toBeNull()
  })

  it('renders optional message', () => {
    render(<AnimatedLoadingSpinner message="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders nothing extra when no message', () => {
    render(<AnimatedLoadingSpinner />)
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})

describe('ModalAnimation', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ModalAnimation isOpen={false} onClose={jest.fn()}>
        <p>content</p>
      </ModalAnimation>
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders children when isOpen is true', () => {
    render(
      <ModalAnimation isOpen={true} onClose={jest.fn()}>
        <p>modal content</p>
      </ModalAnimation>
    )
    expect(screen.getByText('modal content')).toBeInTheDocument()
  })
})

describe('PageTransition', () => {
  it('renders children', () => {
    render(<PageTransition><p>page</p></PageTransition>)
    expect(screen.getByText('page')).toBeInTheDocument()
  })
})
