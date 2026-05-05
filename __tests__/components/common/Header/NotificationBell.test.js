import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NotificationBell from '../../../../src/components/common/Header/NotificationBell'

describe('NotificationBell Component', () => {
  it('should render notification bell', () => {
    render(<NotificationBell />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should display unread count in badge', () => {
    render(<NotificationBell unreadCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should show 99+ when count exceeds 99', () => {
    render(<NotificationBell unreadCount={150} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('should toggle dropdown on click', () => {
    render(<NotificationBell />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    // Should show dropdown footer button
    expect(screen.getByText('View all notifications')).toBeInTheDocument()
  })

  it('should call onViewAll when View all is clicked', () => {
    const onViewAll = jest.fn()
    render(<NotificationBell unreadCount={5} onViewAll={onViewAll} />)
    
    // Open dropdown
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Click View all
    const viewAllButton = screen.getByText('View all notifications')
    expect(viewAllButton).toBeInTheDocument()
    fireEvent.click(viewAllButton)
    expect(onViewAll).toHaveBeenCalled()
  })
})
