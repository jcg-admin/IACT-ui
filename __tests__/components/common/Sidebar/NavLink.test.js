import React from 'react'
import { render, screen } from '@testing-library/react'
import NavLink from '../../../../src/components/common/Sidebar/NavLink'

describe('NavLink Component', () => {
  it('should render nav link', () => {
    render(<NavLink label="Dashboard" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should display label', () => {
    render(<NavLink label="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should display icon when provided', () => {
    render(<NavLink label="Dashboard" icon="📊" />)
    expect(screen.getByText('📊')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<NavLink label="Dashboard" onClick={onClick} />)

    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalled()
  })

  it('should set aria-current when active', () => {
    render(<NavLink label="Dashboard" isActive={true} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-current', 'page')
  })

  it('should display title on hover', () => {
    render(<NavLink label="Dashboard" title="Go to Dashboard" />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Go to Dashboard')
  })
})
