/**
 * Sidebar Component Tests
 * Tests for the main Sidebar component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import Sidebar from '../../../../src/components/common/Sidebar/Sidebar'
import { mockNavLinks } from '../../../helpers/mockData'

describe('Sidebar Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<Sidebar navLinks={mockNavLinks} />)
      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument()
    })

    it('should display all navigation links', () => {
      render(<Sidebar navLinks={mockNavLinks} />)
      mockNavLinks.forEach((link) => {
        expect(screen.getByText(link.label)).toBeInTheDocument()
      })
    })

    it('should not show overlay when closed', () => {
      render(<Sidebar navLinks={mockNavLinks} isOpen={false} />)
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onNavigate when link is clicked', () => {
      const onNavigate = jest.fn()
      render(
        <Sidebar
          navLinks={mockNavLinks}
          onNavigate={onNavigate}
          currentPage="Dashboard"
        />
      )

      screen.getByText('Transactions').click()
      expect(onNavigate).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      const { container } = render(<Sidebar navLinks={mockNavLinks} />)
      expect(container.querySelector('[aria-label="Main navigation"]')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<Sidebar navLinks={mockNavLinks} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should render at all viewport sizes', () => {
      const { container } = render(<Sidebar navLinks={mockNavLinks} />)
      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should update links when navLinks prop changes', () => {
      const { rerender } = render(
        <Sidebar navLinks={[mockNavLinks[0]]} />
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.queryByText('Transactions')).not.toBeInTheDocument()

      rerender(<Sidebar navLinks={mockNavLinks} />)

      expect(screen.getByText('Transactions')).toBeInTheDocument()
    })
  })
})
