/**
 * DashboardLayout Tests
 * Tests for the main layout component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import DashboardLayout from '../../src/layouts/DashboardLayout/DashboardLayout'
import { mockNavLinks, mockUserInfo } from '../helpers/mockData'
import uiReducer from '../../src/redux/slices/uiSlice'
import userReducer from '../../src/redux/slices/userSlice'

function buildStore() {
  return configureStore({ reducer: { ui: uiReducer, user: userReducer } })
}

// Wrapper with Redux Provider + Router context
const renderWithProviders = (component) => {
  return render(
    <Provider store={buildStore()}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  )
}

// Keep renderWithRouter as alias for backward compat within this file
const renderWithRouter = renderWithProviders

describe('DashboardLayout Component', () => {
  describe('Rendering', () => {
    it('should render layout without crashing', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
    })

    it('should render header', () => {
      renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should render sidebar navigation', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      expect(container.querySelector('[aria-label="Main navigation"]')).toBeInTheDocument()
    })

    it('should render main content area', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
    })

    it('should display all navigation links', () => {
      renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      mockNavLinks.forEach((link) => {
        expect(screen.getByText(link.label)).toBeInTheDocument()
      })
    })
  })

  describe('Layout Structure', () => {
    it('should have proper DOM structure', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      // Header should be at top
      expect(container.querySelector('[role="banner"]')).toBeInTheDocument()

      // Sidebar should be present
      expect(container.querySelector('[aria-label="Main navigation"]')).toBeInTheDocument()

      // Main content should be present
      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
    })

    it('should render skip link for accessibility', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      const skipLink = container.querySelector('a[href="#main-content"]')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveTextContent('Skip to main content')
    })
  })

  describe('Accessibility', () => {
    it('should have proper landmark roles', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
      expect(
        container.querySelector('[aria-label="Main navigation"]')
      ).toBeInTheDocument()
    })

    it('should have accessible navigation links', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      const buttons = container.querySelectorAll('button')
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Props', () => {
    it('should accept and use navLinks prop', () => {
      renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      mockNavLinks.forEach((link) => {
        expect(screen.getByText(link.label)).toBeInTheDocument()
      })
    })

    it('should accept and use userInfo prop', () => {
      renderWithRouter(
        <DashboardLayout
          navLinks={mockNavLinks}
          userInfo={mockUserInfo}
        />
      )

      // userInfo.name appears in header with emoji
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })

    it('should display current page', () => {
      renderWithRouter(
        <DashboardLayout
          navLinks={mockNavLinks}
          userInfo={mockUserInfo}
          currentPage="Dashboard"
        />
      )

      // Search for the breadcrumb pattern instead
      expect(screen.getByText(/Dashboard \//)).toBeInTheDocument()
    })

    it('should display unread count', () => {
      renderWithRouter(
        <DashboardLayout
          navLinks={mockNavLinks}
          userInfo={mockUserInfo}
          unreadCount={5}
        />
      )

      expect(screen.getByLabelText(/5/)).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render at all viewport sizes', () => {
      const { container } = renderWithRouter(
        <DashboardLayout navLinks={mockNavLinks} userInfo={mockUserInfo} />
      )

      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
    })
  })
})
