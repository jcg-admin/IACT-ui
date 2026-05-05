import React from 'react'
import { render, screen } from '@testing-library/react'
import SidebarNav from '../../../../src/components/common/Sidebar/SidebarNav'
import { mockNavLinks } from '../../../helpers/mockData'

describe('SidebarNav Component', () => {
  it('should render navigation', () => {
    render(<SidebarNav navLinks={mockNavLinks} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should display all links', () => {
    render(<SidebarNav navLinks={mockNavLinks} />)
    mockNavLinks.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument()
    })
  })

  it('should call onNavigate when link is clicked', () => {
    const onNavigate = jest.fn()
    render(
      <SidebarNav
        navLinks={mockNavLinks}
        onNavigate={onNavigate}
      />
    )

    screen.getByText('Dashboard').click()
    expect(onNavigate).toHaveBeenCalled()
  })

  it('should have buttons for navigation', () => {
    render(<SidebarNav navLinks={mockNavLinks} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(mockNavLinks.length)
  })
})
