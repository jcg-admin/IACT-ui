/**
 * PasswordStrength Component Tests
 * Unit tests for password strength indicator
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import PasswordStrength from '@ui/auth/PasswordStrength'

describe('PasswordStrength Component', () => {
  describe('Rendering', () => {
    it('should not render when password is empty', () => {
      const { container } = render(
        <PasswordStrength password="" />
      )
      expect(container.querySelector('.password-strength')).not.toBeInTheDocument()
    })

    it('should render when password has value', () => {
      render(<PasswordStrength password="Test123" />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should display strength bar', () => {
      render(<PasswordStrength password="Test123" />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should display strength label', () => {
      render(<PasswordStrength password="Test123" />)
      const _label = screen.getByText(/débil|media|fuerte/i)
      expect(_label).toBeInTheDocument()
    })
  })

  describe('Strength Levels', () => {
    it('should show weak password strength', () => {
      render(<PasswordStrength password="weak" />)
      expect(screen.getByText(/Débil/)).toBeInTheDocument()
    })

    it('should show medium password strength', () => {
      render(<PasswordStrength password="Test123" />)
      expect(screen.getByText(/Media|Fuerte/)).toBeInTheDocument()
    })

    it('should show strong password strength', () => {
      render(<PasswordStrength password="VeryStrong123!" />)
      const _label = screen.getByText(/Fuerte|Muy Fuerte/)
      expect(_label).toBeInTheDocument()
    })

    it('should apply correct strength class to bar', () => {
      const { container } = render(<PasswordStrength password="Test123" />)
      const _bar = container.querySelector('.password-strength__bar')
      expect(_bar).toHaveClass(/password-strength__bar--(weak|medium|strong|veryStrong)/)
    })
  })

  describe('Requirements List', () => {
    it('should display requirements list when showRequirements is true', () => {
      render(
        <PasswordStrength
          password="Test123"
          showRequirements={true}
        />
      )
      expect(screen.getByText('Requisitos:')).toBeInTheDocument()
    })

    it('should not display requirements when showRequirements is false', () => {
      render(
        <PasswordStrength
          password="Test123"
          showRequirements={false}
        />
      )
      expect(screen.queryByText('Requisitos:')).not.toBeInTheDocument()
    })

    it('should mark requirements as met', () => {
      const { container } = render(
        <PasswordStrength
          password="ValidPassword123!"
          showRequirements={true}
        />
      )
      const _metItems = container.querySelectorAll('.password-strength__requirement--met')
      expect(_metItems.length).toBeGreaterThan(0)
    })

    it('should show requirement status with correct icons', () => {
      render(
        <PasswordStrength
          password="Test"
          showRequirements={true}
        />
      )
      const _icons = screen.getAllByText(/✓|○/)
      expect(_icons.length).toBeGreaterThan(0)
    })
  })

  describe('Progress Bar', () => {
    it('should have correct aria attributes on progress bar', () => {
      render(<PasswordStrength password="Test123" />)
      const _bar = screen.getByRole('progressbar')
      
      expect(_bar).toHaveAttribute('aria-valuenow')
      expect(_bar).toHaveAttribute('aria-valuemin', '0')
      expect(_bar).toHaveAttribute('aria-valuemax', '100')
      expect(_bar).toHaveAttribute('aria-label')
    })

    it('should update bar width based on password strength', () => {
      const { container, rerender } = render(
        <PasswordStrength password="weak" />
      )
      
      let _bar = container.querySelector('.password-strength__bar')
      const _weakWidth = window.getComputedStyle(_bar).width
      
      rerender(<PasswordStrength password="VeryStrong123!" />)
      _bar = container.querySelector('.password-strength__bar')
      const _strongWidth = window.getComputedStyle(_bar).width
      
      // Strong password should have wider bar
      expect(parseInt(_strongWidth)).toBeGreaterThan(parseInt(_weakWidth))
    })
  })

  describe('Accessibility', () => {
    it('should have aria-live on container for announcements', () => {
      const { container } = render(<PasswordStrength password="Test123" />)
      expect(container.querySelector('.password-strength')).toHaveAttribute(
        'aria-live',
        'polite'
      )
    })

    it('should have aria-atomic for proper announcements', () => {
      const { container } = render(<PasswordStrength password="Test123" />)
      expect(container.querySelector('.password-strength')).toHaveAttribute(
        'aria-atomic',
        'true'
      )
    })

    it('should have aria-label on requirements list', () => {
      const { container } = render(
        <PasswordStrength
          password="Test123"
          showRequirements={true}
        />
      )
      const _list = container.querySelector('.password-strength__requirements')
      expect(_list).toHaveAttribute('aria-label')
    })

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(
        <PasswordStrength
          password="Test123"
          showRequirements={true}
        />
      )
      const _icons = container.querySelectorAll('[aria-hidden="true"]')
      expect(_icons.length).toBeGreaterThan(0)
    })
  })

  describe('Color Classes', () => {
    it('should apply weak color class', () => {
      const { container } = render(<PasswordStrength password="weak" />)
      expect(container.querySelector('.password-strength__text')).toHaveClass(
        'password-strength__text--weak'
      )
    })

    it('should apply medium color class', () => {
      const { container } = render(<PasswordStrength password="Test" />)
      const _text = container.querySelector('.password-strength__text')
      expect(_text.className).toMatch(/password-strength__text--(weak|medium)/)
    })

    it('should apply strong color class', () => {
      const { container } = render(
        <PasswordStrength password="StrongPass123!" />
      )
      const _text = container.querySelector('.password-strength__text')
      expect(_text.className).toMatch(/password-strength__text--(strong|veryStrong)/)
    })
  })

  describe('Dynamic Updates', () => {
    it('should update strength label when password changes', () => {
      const { rerender } = render(<PasswordStrength password="weak" />)
      expect(screen.getByText(/Débil/)).toBeInTheDocument()
      
      rerender(<PasswordStrength password="StrongPassword123!" />)
      expect(screen.queryByText(/Débil/)).not.toBeInTheDocument()
    })

    it('should update progress bar when password changes', () => {
      const { container, rerender } = render(
        <PasswordStrength password="a" />
      )
      
      let _bar = container.querySelector('.password-strength__bar')
      const _initialWidth = _bar.style.width
      
      rerender(<PasswordStrength password="VeryLongAndStrongPassword123!" />)
      _bar = container.querySelector('.password-strength__bar')
      const _newWidth = _bar.style.width
      
      expect(_newWidth).not.toBe(_initialWidth)
    })

    it('should update requirements checklist when password changes', () => {
      const { rerender, container } = render(
        <PasswordStrength
          password="test"
          showRequirements={true}
        />
      )
      
      let _metCount = container.querySelectorAll(
        '.password-strength__requirement--met'
      ).length
      
      rerender(
        <PasswordStrength
          password="ValidPassword123!"
          showRequirements={true}
        />
      )
      
      const _newMetCount = container.querySelectorAll(
        '.password-strength__requirement--met'
      ).length
      
      expect(_newMetCount).toBeGreaterThan(_metCount)
    })
  })
})
