import React from 'react'
import { render, screen } from '@testing-library/react'
import BreadcrumbNav from '../../../../src/components/common/Header/BreadcrumbNav'

describe('BreadcrumbNav Component', () => {
  it('should render breadcrumb navigation', () => {
    render(<BreadcrumbNav currentPage="Dashboard" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should display base path', () => {
    render(<BreadcrumbNav basePath="Dashboard" currentPage="Transactions" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should display current page', () => {
    render(<BreadcrumbNav currentPage="Transactions" />)
    expect(screen.getByText('Transactions')).toBeInTheDocument()
  })

  it('should not show separator when on base path', () => {
    const { container } = render(<BreadcrumbNav currentPage="Dashboard" basePath="Dashboard" />)
    const separator = container.querySelector('[class*="separator"]')
    expect(separator).not.toBeInTheDocument()
  })
})
