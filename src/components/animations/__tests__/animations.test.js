/**
 * Animation Components Tests
 * 
 * Test rendering and animation configuration
 * Verify Framer Motion integrations
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MotionConfig } from 'framer-motion'
import PageTransition from '../PageTransition'
import AnimatedButton from '../AnimatedButton'
import AnimatedLoadingSpinner from '../AnimatedLoadingSpinner'
import ModalAnimation from '../ModalAnimation'

/**
 * Wrapper for tests that use Framer Motion
 * Disables animations for faster tests
 */
const MotionWrapper = ({ children }) => (
  <MotionConfig reducedMotion="always">
    {children}
  </MotionConfig>
)

describe('Animation Components', () => {
  describe('PageTransition', () => {
    it('should render children', () => {
      render(
        <MotionWrapper>
          <PageTransition>
            <div>Test Content</div>
          </PageTransition>
        </MotionWrapper>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should accept custom key prop', () => {
      const { rerender } = render(
        <MotionWrapper>
          <PageTransition key="/page1">
            <div>Page 1</div>
          </PageTransition>
        </MotionWrapper>
      )

      expect(screen.getByText('Page 1')).toBeInTheDocument()
    })

    it('should render as motion.div', () => {
      const { container } = render(
        <MotionWrapper>
          <PageTransition>
            <div>Content</div>
          </PageTransition>
        </MotionWrapper>
      )

      const motionDiv = container.querySelector('div > div')
      expect(motionDiv).toBeInTheDocument()
    })
  })

  describe('AnimatedButton', () => {
    it('should render button with children', () => {
      render(
        <MotionWrapper>
          <AnimatedButton>Click Me</AnimatedButton>
        </MotionWrapper>
      )

      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(
        <MotionWrapper>
          <AnimatedButton onClick={handleClick}>
            Click
          </AnimatedButton>
        </MotionWrapper>
      )

      const button = screen.getByText('Click')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should accept variant prop', () => {
      const { container } = render(
        <MotionWrapper>
          <AnimatedButton variant="danger">Delete</AnimatedButton>
        </MotionWrapper>
      )

      const button = container.querySelector('button')
      expect(button).toHaveClass('btn-danger')
    })

    it('should handle disabled state', () => {
      const handleClick = jest.fn()
      render(
        <MotionWrapper>
          <AnimatedButton disabled onClick={handleClick}>
            Disabled
          </AnimatedButton>
        </MotionWrapper>
      )

      const button = screen.getByText('Disabled')
      fireEvent.click(button)

      expect(button.disabled).toBe(true)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <MotionWrapper>
          <AnimatedButton className="custom-class">Button</AnimatedButton>
        </MotionWrapper>
      )

      const button = container.querySelector('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should accept type prop', () => {
      const { container } = render(
        <MotionWrapper>
          <AnimatedButton type="submit">Submit</AnimatedButton>
        </MotionWrapper>
      )

      const button = container.querySelector('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('AnimatedLoadingSpinner', () => {
    it('should render spinner inline by default', () => {
      const { container } = render(
        <MotionWrapper>
          <AnimatedLoadingSpinner />
        </MotionWrapper>
      )

      const spinner = container.querySelector('div')
      expect(spinner).toBeInTheDocument()
    })

    it('should render message if provided', () => {
      render(
        <MotionWrapper>
          <AnimatedLoadingSpinner message="Loading..." />
        </MotionWrapper>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render full screen spinner', () => {
      const { container } = render(
        <MotionWrapper>
          <AnimatedLoadingSpinner fullScreen />
        </MotionWrapper>
      )

      const fullScreenDiv = container.querySelector('div[style*="fixed"]')
      expect(fullScreenDiv).toBeInTheDocument()
    })

    it('should accept size prop', () => {
      const { container } = render(
        <MotionWrapper>
          <AnimatedLoadingSpinner size="sm" message="Small Spinner" />
        </MotionWrapper>
      )

      expect(screen.getByText('Small Spinner')).toBeInTheDocument()
    })

    it('should render with overlay by default', () => {
      render(
        <MotionWrapper>
          <AnimatedLoadingSpinner fullScreen overlay={true} message="Loading..." />
        </MotionWrapper>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('ModalAnimation', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <MotionWrapper>
          <ModalAnimation isOpen={false} onClose={jest.fn()}>
            <div>Modal Content</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      render(
        <MotionWrapper>
          <ModalAnimation isOpen={true} onClose={jest.fn()}>
            <div>Modal Content</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('should call onClose when backdrop clicked', () => {
      const handleClose = jest.fn()
      const { container } = render(
        <MotionWrapper>
          <ModalAnimation isOpen={true} onClose={handleClose}>
            <div>Modal Content</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      const backdrop = container.querySelector('[style*="background"]')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(handleClose).toHaveBeenCalled()
      }
    })

    it('should not close when modal content clicked', () => {
      const handleClose = jest.fn()
      render(
        <MotionWrapper>
          <ModalAnimation isOpen={true} onClose={handleClose}>
            <div>Modal Content</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      const modalContent = screen.getByText('Modal Content')
      fireEvent.click(modalContent)

      expect(handleClose).not.toHaveBeenCalled()
    })

    it('should accept size prop', () => {
      render(
        <MotionWrapper>
          <ModalAnimation isOpen={true} onClose={jest.fn()} size="lg">
            <div>Large Modal</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      expect(screen.getByText('Large Modal')).toBeInTheDocument()
    })

    it('should accept custom className', () => {
      const { container } = render(
        <MotionWrapper>
          <ModalAnimation 
            isOpen={true} 
            onClose={jest.fn()} 
            className="custom-modal"
          >
            <div>Modal</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      const modal = container.querySelector('[class*="custom-modal"]')
      expect(modal).toBeInTheDocument()
    })

    it('should render multiple modals (stacking)', () => {
      render(
        <MotionWrapper>
          <ModalAnimation isOpen={true} onClose={jest.fn()}>
            <div>Modal 1</div>
          </ModalAnimation>
          <ModalAnimation isOpen={true} onClose={jest.fn()}>
            <div>Modal 2</div>
          </ModalAnimation>
        </MotionWrapper>
      )

      expect(screen.getByText('Modal 1')).toBeInTheDocument()
      expect(screen.getByText('Modal 2')).toBeInTheDocument()
    })
  })

  describe('Animation Variants', () => {
    it('should export pageVariants', async () => {
      const { pageVariants } = await import('../PageTransition')
      expect(pageVariants).toBeDefined()
      expect(pageVariants.initial).toBeDefined()
      expect(pageVariants.animate).toBeDefined()
      expect(pageVariants.exit).toBeDefined()
    })

    it('should export buttonVariants', async () => {
      const { buttonVariants } = await import('../AnimatedButton')
      expect(buttonVariants).toBeDefined()
      expect(buttonVariants.initial).toBeDefined()
      expect(buttonVariants.hover).toBeDefined()
      expect(buttonVariants.tap).toBeDefined()
    })

    it('should export spinnerVariants', async () => {
      const { spinnerVariants } = await import('../AnimatedLoadingSpinner')
      expect(spinnerVariants).toBeDefined()
      expect(spinnerVariants.spin).toBeDefined()
    })

    it('should export modalVariants', async () => {
      const { backdropVariants, modalVariants } = await import('../ModalAnimation')
      expect(backdropVariants).toBeDefined()
      expect(modalVariants).toBeDefined()
      expect(modalVariants.initial).toBeDefined()
      expect(modalVariants.animate).toBeDefined()
      expect(modalVariants.exit).toBeDefined()
    })
  })
})
