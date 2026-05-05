/**
 * LoginInput Component
 * Input mejorado con:
 * - Iconos
 * - Validación real-time
 * - Estados visuales (focus, error, success)
 * - Feedback visual
 * - Floating labels (Material Design)
 * - Border drawing animation
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import '@styles/components/_login-input.scss'

function LoginInput({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  icon,
  error,
  success,
  disabled,
  required,
  validationFn,
  autoComplete,
  dataValidate
}) {
  const [_isFocused, setIsFocused] = useState(false)
  const [_isValidated, setIsValidated] = useState(false)
  const [_validationError, setValidationError] = useState(null)

  const _handleChange = (e) => {
    const { value: newValue } = e.target
    onChange?.(newValue)

    // Real-time validation
    if (validationFn && newValue) {
      const _result = validationFn(newValue)
      if (_result.valid) {
        setValidationError(null)
      } else {
        setValidationError(_result.error)
      }
    }
  }

  const _handleBlur = (e) => {
    setIsFocused(false)
    setIsValidated(true)
    onBlur?.(e)
  }

  const _handleFocus = () => {
    setIsFocused(true)
  }

  const _showError = error || _validationError
  const _hasSuccess = success && !_showError && _isValidated && value
  const _hasValue = value && value.length > 0

  return (
    <div 
      className={`login-input ${_isFocused ? 'login-input--focused' : ''} ${_showError ? 'login-input--error' : ''} ${_hasSuccess ? 'login-input--success' : ''}`}
      data-validate={dataValidate}
    >
      <div className="login-input__wrapper">
        {icon && <span className="login-input__icon">{icon}</span>}

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={_handleChange}
          onFocus={_handleFocus}
          onBlur={_handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className="login-input__field"
          aria-label={label}
          aria-invalid={_showError ? 'true' : 'false'}
          aria-describedby={_showError ? `${name}-error` : undefined}
        />

        {/* Floating Label */}
        <label 
          className={`login-input__label ${_isFocused || _hasValue ? 'login-input__label--floating' : ''}`}
          htmlFor={name}
        >
          {label}
          {required && (
            <span 
              className="login-input__required"
              aria-label="requerido"
            >
              {' '}*
            </span>
          )}
        </label>

        {/* Border Drawing Animation */}
        <span className="login-input__border login-input__border-top" />
        <span className="login-input__border login-input__border-right" />
        <span className="login-input__border login-input__border-bottom" />
        <span className="login-input__border login-input__border-left" />

        {_hasSuccess && (
          <span 
            className="login-input__success-icon" 
            aria-label="Válido"
          >
            ✓
          </span>
        )}
      </div>

      {/* Error Message (Tooltip style) */}
      {_showError && (
        <span
          id={`${name}-error`}
          className="login-input__error"
          role="alert"
        >
          {_showError}
        </span>
      )}
    </div>
  )
}

LoginInput.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
  error: PropTypes.string,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  validationFn: PropTypes.func,
  autoComplete: PropTypes.string,
  dataValidate: PropTypes.string
}

export default LoginInput
