/**
 * FormStepper Component
 * Componente base genérico y reutilizable para todas las transacciones multi-paso
 * 
 * Props:
 *   steps: [{ title: string, content: JSX }]
 *   currentStep: number (índice actual)
 *   onNext: func
 *   onPrevious: func
 *   onConfirm: func
 *   onCancel: func
 *   isLoading: bool
 *   error: string | null
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import LoadingSpinner from '@ui/shared/LoadingSpinner'
import '@styles/components/_form-stepper.scss'

function FormStepper({
  steps = [],
  currentStep = 0,
  onNext = () => {},
  onPrevious = () => {},
  onConfirm = () => {},
  onCancel = () => {},
  isLoading = false,
  error = null
}) {
  // ====== COMPUTED ======

  const _totalSteps = steps.length
  const _isFirstStep = currentStep === 0
  const _isLastStep = currentStep === _totalSteps - 1
  const _currentStepData = useMemo(
    () => steps[currentStep] || { title: '', content: null },
    [steps, currentStep]
  )

  const _progressPercent = useMemo(
    () => {
      if (_totalSteps === 0) return 0
      if (_isLastStep) return 100
      return (currentStep / _totalSteps) * 100
    },
    [currentStep, _totalSteps, _isLastStep]
  )

  // ====== HANDLERS ======

  const _handleNext = () => {
    if (!_isLastStep && !isLoading) {
      onNext()
    }
  }

  const _handlePrevious = () => {
    if (!_isFirstStep && !isLoading) {
      onPrevious()
    }
  }

  const _handleConfirm = () => {
    if (_isLastStep && !isLoading) {
      onConfirm()
    }
  }

  const _handleCancel = () => {
    if (!isLoading) {
      onCancel()
    }
  }

  // ====== RENDER ======

  return (
    <div className={`form-stepper ${isLoading ? 'form-stepper--loading' : ''} ${error ? 'form-stepper--error' : ''}`}>
      {/* Progress Indicator */}
      <div className="form-stepper__header">
        <h2 className="form-stepper__title">{_currentStepData.title}</h2>
        
        <div className="form-stepper__progress">
          <div className="form-stepper__progress-bar">
            <div
              className="form-stepper__progress-fill"
              style={{ width: `${_progressPercent}%` }}
              role="progressbar"
              aria-valuenow={Math.round(_progressPercent)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Progress: ${currentStep + 1} of ${_totalSteps}`}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="form-stepper__steps">
          {steps.map((_step, _idx) => (
            <div
              key={`step-${_idx}`}
              className={`form-stepper__step ${_idx === currentStep ? 'form-stepper__step--active' : ''} ${_idx < currentStep ? 'form-stepper__step--completed' : ''}`}
              aria-label={`Step ${_idx + 1}: ${_step.title}`}
            >
              <div className="form-stepper__step-number">{_idx + 1}</div>
              <div className="form-stepper__step-title">{_step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Paso {currentStep + 1} de {_totalSteps}: {_currentStepData.title}
      </div>

      {/* Content Area */}
      <div className="form-stepper__body">
        {isLoading && (
          <div className="form-stepper__loading">
            <LoadingSpinner size="md" message="Processing..." />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Step Content */}
            <div className="form-stepper__content" data-testid={`step${currentStep + 1}-content`}>
              {_currentStepData.content || <p>No content for this step</p>}
            </div>

            {/* Error Display */}
            {error && (
              <div className="form-stepper__error-banner" role="alert">
                <div className="form-stepper__error-icon">!</div>
                <div className="form-stepper__error-message">{error}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="form-stepper__footer">
        <button
          className="form-stepper__button form-stepper__button--cancel"
          onClick={_handleCancel}
          disabled={isLoading}
          type="button"
          aria-label="Cancel transaction"
        >
          Cancel
        </button>

        <div className="form-stepper__buttons-group">
          {!_isFirstStep && (
            <button
              className="form-stepper__button form-stepper__button--previous"
              onClick={_handlePrevious}
              disabled={isLoading}
              type="button"
              aria-label="Go to previous step"
            >
              Previous
            </button>
          )}

          {!_isLastStep && (
            <button
              className="form-stepper__button form-stepper__button--next"
              onClick={_handleNext}
              disabled={isLoading}
              type="button"
              aria-label="Go to next step"
            >
              Next
            </button>
          )}

          {_isLastStep && (
            <button
              className="form-stepper__button form-stepper__button--confirm"
              onClick={_handleConfirm}
              disabled={isLoading}
              type="button"
              aria-label="Confirm and complete transaction"
            >
              Confirm
            </button>
          )}
        </div>
      </div>

      {/* Step Counter (bottom info) */}
      <div className="form-stepper__info">
        <span>
          Step {currentStep + 1} of {_totalSteps}
        </span>
      </div>
    </div>
  )
}

FormStepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      content: PropTypes.node
    })
  ).isRequired,
  currentStep: PropTypes.number,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string
}

export default FormStepper
