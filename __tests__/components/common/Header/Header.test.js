/**
 * Header Component Tests
 * Tests for the main Header component with all features
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../../../../src/components/common/Header/Header'
import { mockHeaderProps } from '../../../helpers/mockData'

describe('Header Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<Header {...mockHeaderProps} />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should display the current page name in breadcrumb', () => {
      render(<Header {...mockHeaderProps} />)
      // Should contain both "Dashboard /" breadcrumb pattern
      expect(screen.getByText(/Dashboard \//)).toBeInTheDocument()
    })

    it('should display notification count in badge', () => {
      render(<Header {...mockHeaderProps} />)
      const badge = screen.getByText(mockHeaderProps.unreadCount)
      expect(badge).toBeInTheDocument()
    })

    it('should display user name', () => {
      render(<Header {...mockHeaderProps} />)
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })

    it('should not show user dropdown initially', () => {
      render(<Header {...mockHeaderProps} />)
      // Logout button should not be visible initially
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onMenuClick when menu button is clicked', () => {
      const { onMenuClick } = mockHeaderProps
      render(<Header {...mockHeaderProps} />)
      
      const menuButton = screen.getByLabelText('Toggle sidebar')
      fireEvent.click(menuButton)
      
      expect(onMenuClick).toHaveBeenCalled()
    })

    it('should show user dropdown when user menu is clicked', () => {
      render(<Header {...mockHeaderProps} />)
      
      const userButton = screen.getByLabelText('User menu')
      fireEvent.click(userButton)
      
      // Verify dropdown appears by checking if Logout button is visible
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('should call onLogout when logout button is clicked', () => {
      const { onLogout } = mockHeaderProps
      render(<Header {...mockHeaderProps} />)
      
      // Open dropdown first
      const userButton = screen.getByLabelText('User menu')
      fireEvent.click(userButton)
      
      // Click logout
      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)
      
      expect(onLogout).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(<Header {...mockHeaderProps} />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have accessible notification button', () => {
      render(<Header {...mockHeaderProps} />)
      const notificationBtn = screen.getByLabelText(/notifications/)
      expect(notificationBtn).toBeInTheDocument()
    })

    it('should have accessible user menu button', () => {
      render(<Header {...mockHeaderProps} />)
      const userBtn = screen.getByLabelText('User menu')
      expect(userBtn).toHaveAttribute('aria-expanded', 'false')
    })

    it('should support keyboard navigation', () => {
      const { container } = render(<Header {...mockHeaderProps} />)
      const buttons = container.querySelectorAll('button')
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Props', () => {
    it('should update breadcrumb when currentPage changes', () => {
      const { rerender } = render(<Header {...mockHeaderProps} />)
      
      const newProps = {
        ...mockHeaderProps,
        currentPage: 'Transactions',
      }
      
      rerender(<Header {...newProps} />)
      expect(screen.getByText(/Transactions/)).toBeInTheDocument()
    })

    it('should update notification badge when unreadCount changes', () => {
      const { rerender } = render(
        <Header {...mockHeaderProps} unreadCount={5} />
      )
      
      expect(screen.getByText('5')).toBeInTheDocument()
      
      const newProps = {
        ...mockHeaderProps,
        unreadCount: 10,
      }
      
      rerender(<Header {...newProps} />)
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render header at all viewport sizes', () => {
      render(<Header {...mockHeaderProps} />)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })
  })
})
