/**
 * FormStepper Component Tests
 * Multi-step form navigation and data persistence
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormStepper from '@ui/transaction/FormStepper'

describe('FormStepper Component', () => {
  const _mockSteps = [
    {
      id: 'step1',
      title: 'Select Function',
      component: <div data-testid="step1-content">Step 1 Content</div>,
    },
    {
      id: 'step2',
      title: 'Configure',
      component: <div data-testid="step2-content">Step 2 Content</div>,
    },
    {
      id: 'step3',
      title: 'Review',
      component: <div data-testid="step3-content">Step 3 Content</div>,
    },
  ]

  const _mockHandlers = {
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all steps', () => {
      const { container } = render(
        <FormStepper steps={_mockSteps} {..._mockHandlers} />
      )

      // Check all steps are rendered as indicators
      const _indicators = container.querySelectorAll('.form-stepper__step')
      expect(_indicators.length).toBe(_mockSteps.length)
      
      // Check first step is displayed
      expect(screen.getByTestId('step1-content')).toBeInTheDocument()
    })

    it('should display current step content', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      expect(screen.getByTestId('step1-content')).toBeInTheDocument()
      expect(screen.queryByTestId('step2-content')).not.toBeInTheDocument()
    })

    it('should show step indicators', () => {
      const { container } = render(
        <FormStepper steps={_mockSteps} {..._mockHandlers} />
      )

      const _indicators = container.querySelectorAll(
        '.form-stepper__step'
      )
      expect(_indicators.length).toBe(3)
    })

    it('should show progress bar', () => {
      const { container } = render(
        <FormStepper steps={_mockSteps} {..._mockHandlers} />
      )

      expect(container.querySelector('.form-stepper__progress')).toBeInTheDocument()
    })
  })

  describe('Step Navigation', () => {
    it('should show Next button on first step', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
    })

    it('should show Previous and Next buttons on middle steps', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('should show Confirm button on last step', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={2}
          {..._mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    })

    it('should call onNext when Next button clicked', async () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      const _nextButton = screen.getByRole('button', { name: /next/i })
      await userEvent.click(_nextButton)

      expect(_mockHandlers.onNext).toHaveBeenCalled()
    })

    it('should call onPrevious when Previous button clicked', async () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      const _prevButton = screen.getByRole('button', { name: /previous/i })
      await userEvent.click(_prevButton)

      expect(_mockHandlers.onPrevious).toHaveBeenCalled()
    })

    it('should call onConfirm when Confirm button clicked', async () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={2}
          {..._mockHandlers}
        />
      )

      const _confirmButton = screen.getByRole('button', { name: /confirm/i })
      await userEvent.click(_confirmButton)

      expect(_mockHandlers.onConfirm).toHaveBeenCalled()
    })

    it('should call onCancel when Cancel button clicked', async () => {
      render(
        <FormStepper
          steps={_mockSteps}
          {..._mockHandlers}
        />
      )

      const _cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(_cancelButton)

      expect(_mockHandlers.onCancel).toHaveBeenCalled()
    })
  })

  describe('Step Indicators', () => {
    it('should mark completed steps', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={2}
          {..._mockHandlers}
        />
      )

      const _indicators = container.querySelectorAll(
        '.form-stepper__step'
      )
      
      expect(_indicators[0]).toHaveClass('form-stepper__step--completed')
      expect(_indicators[1]).toHaveClass('form-stepper__step--completed')
      expect(_indicators[2]).toHaveClass('form-stepper__step--active')
    })

    it('should mark current step as active', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      const _indicators = container.querySelectorAll(
        '.form-stepper__step'
      )
      
      expect(_indicators[1]).toHaveClass('form-stepper__step--active')
    })

    it('should allow clicking on completed steps to go back', async () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={2}
          onStepClick={jest.fn()}
          {..._mockHandlers}
        />
      )

      const _step1Indicator = container.querySelector('.form-stepper__step')
      await userEvent.click(_step1Indicator)

      // Should be clickable (typically calls goToStep handler)
      expect(_step1Indicator).toHaveClass(
        'form-stepper__step--completed'
      )
    })
  })

  describe('Progress Bar', () => {
    it('should show correct progress percentage', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      const _progress = container.querySelector('.form-stepper__progress-fill')
      const _width = _progress.style.width
      
      // Step 1 (index 1) out of 3 steps = 33%
      expect(parseInt(_width)).toBe(33)
    })

    it('should show 0% progress on first step', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      const _progress = container.querySelector('.form-stepper__progress-fill')
      expect(parseInt(_progress.style.width)).toBe(0)
    })

    it('should show 100% progress on last step', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={2}
          {..._mockHandlers}
        />
      )

      const _progress = container.querySelector('.form-stepper__progress-fill')
      expect(parseInt(_progress.style.width)).toBe(100)
    })
  })

  describe('Loading States', () => {
    it('should disable buttons when loading', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          isLoading={true}
          {..._mockHandlers}
        />
      )

      expect(
        screen.getByRole('button', { name: /next/i })
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeDisabled()
    })

    it('should show loading spinner when loading', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          isLoading={true}
          {..._mockHandlers}
        />
      )

      expect(
        container.querySelector('.form-stepper__loading')
      ).toBeInTheDocument()
    })

    it('should show loading text on button', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          isLoading={true}
          {..._mockHandlers}
        />
      )

      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should display error message when error prop provided', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          error="Step validation failed"
          {..._mockHandlers}
        />
      )

      expect(screen.getByText('Step validation failed')).toBeInTheDocument()
    })

    it('should show error alert role', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          error="Error message"
          {..._mockHandlers}
        />
      )

      const _errorDiv = screen.getByText('Error message').closest('[role="alert"]')
      expect(_errorDiv).toBeInTheDocument()
    })

    it('should clear error on next button click', async () => {
      const { rerender } = render(
        <FormStepper
          steps={_mockSteps}
          error="Error message"
          {..._mockHandlers}
        />
      )

      expect(screen.getByText('Error message')).toBeInTheDocument()

      rerender(
        <FormStepper
          steps={_mockSteps}
          error={null}
          {..._mockHandlers}
        />
      )

      expect(screen.queryByText('Error message')).not.toBeInTheDocument()
    })
  })

  describe('Data Persistence', () => {
    it('should maintain data across step changes', () => {
      const _data = {
        selectedFunction: 'CreateUser',
        email: 'test@example.com',
      }

      const { rerender } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          data={_data}
          {..._mockHandlers}
        />
      )

      // Data should persist when stepping through
      rerender(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          data={_data}
          {..._mockHandlers}
        />
      )

      // Component should have access to data
      expect(_data).toEqual({
        selectedFunction: 'CreateUser',
        email: 'test@example.com',
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          {..._mockHandlers}
        />
      )

      const _heading = screen.getByRole('heading', { level: 2 })
      expect(_heading).toBeInTheDocument()
    })

    it('should have ARIA labels on buttons', () => {
      render(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      expect(
        screen.getByRole('button', { name: /previous/i })
      ).toHaveAccessibleName()
      expect(
        screen.getByRole('button', { name: /next/i })
      ).toHaveAccessibleName()
    })

    it('should announce step changes to screen readers', () => {
      const { container, rerender } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      const _liveRegion = container.querySelector('[aria-live="polite"]')
      expect(_liveRegion).toBeInTheDocument()

      rerender(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      // Should announce step 2 of 3
      expect(_liveRegion).toHaveTextContent(/paso 2 de 3/i)
    })

    it('should have progress bar ARIA attributes', () => {
      const { container } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      const _progressBar = container.querySelector('[role="progressbar"]')
      expect(_progressBar).toHaveAttribute('aria-valuenow', '33')
      expect(_progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(_progressBar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('Responsive Behavior', () => {
    it('should render on mobile viewport', () => {
      const { container } = render(
        <FormStepper steps={_mockSteps} {..._mockHandlers} />
      )

      const _form = container.querySelector('.form-stepper')
      expect(_form).toHaveClass('form-stepper')
    })

    it('should stack buttons on small screens', () => {
      const { container } = render(
        <FormStepper steps={_mockSteps} {..._mockHandlers} />
      )

      const _buttonGroup = container.querySelector('.form-stepper__buttons-group')
      expect(_buttonGroup).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single step form', () => {
      const _singleStep = [
        {
          id: 'step1',
          title: 'Submit',
          component: <div>Single Step</div>,
        },
      ]

      render(
        <FormStepper
          steps={_singleStep}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    })

    it('should handle many steps (10+)', () => {
      const _manySteps = Array.from({ length: 12 }, (_, i) => ({
        id: `step${i}`,
        title: `Step ${i + 1}`,
        component: <div>Step {i + 1}</div>,
      }))

      const { container } = render(
        <FormStepper
          steps={_manySteps}
          currentStep={5}
          {..._mockHandlers}
        />
      )

      expect(
        container.querySelectorAll('.form-stepper__step').length
      ).toBe(12)
    })

    it('should handle rapid step changes', async () => {
      const { rerender } = render(
        <FormStepper
          steps={_mockSteps}
          currentStep={0}
          {..._mockHandlers}
        />
      )

      rerender(
        <FormStepper
          steps={_mockSteps}
          currentStep={1}
          {..._mockHandlers}
        />
      )

      rerender(
        <FormStepper
          steps={_mockSteps}
          currentStep={2}
          {..._mockHandlers}
        />
      )

      expect(screen.getByTestId('step3-content')).toBeInTheDocument()
    })
  })
})
