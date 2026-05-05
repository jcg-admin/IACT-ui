/**
 * LoginForm Component
 * Formulario de login mejorado con:
 * - Inputs validados en tiempo real
 * - Indicador de fortaleza de contraseña
 * - "Forgot Password" link
 * - "Remember Me" checkbox
 * - Mejor UX y diseño
 */

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import LoginInput from '@components/auth/LoginInput'
import PasswordStrength from '@components/auth/PasswordStrength'
import '@styles/components/_login-page.scss'

function LoginForm({ onSubmit, loading, error }) {
  const [_credentials, setCredentials] = useState({
    email: 'admin@iact.com',
    password: 'password123'
  })

  const [_rememberMe, setRememberMe] = useState(false)
  const [_showPassword, setShowPassword] = useState(false)
  const [_localError, setLocalError] = useState(null)

  // Escape key handler para cerrar error banner
  useEffect(() => {
    const _handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setLocalError(null)
      }
    }

    window.addEventListener('keydown', _handleEscapeKey)
    return () => window.removeEventListener('keydown', _handleEscapeKey)
  }, [])

  // Validadores
  const _validateEmail = (_email) => {
    const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!_emailRegex.test(_email)) {
      return { valid: false, error: 'Email inválido' }
    }
    return { valid: true }
  }

  const _validatePassword = (_password) => {
    if (_password.length < 6) {
      return { valid: false, error: 'Mínimo 6 caracteres' }
    }
    return { valid: true }
  }

  const _handleChange = (_field, _value) => {
    setCredentials(prev => ({ ...prev, [_field]: _value }))
    setLocalError(null)
  }

  const _handleSubmit = (e) => {
    e.preventDefault()

    // Validar antes de enviar
    const _emailValidation = _validateEmail(_credentials.email)
    const _passwordValidation = _validatePassword(_credentials.password)

    if (!_emailValidation.valid) {
      setLocalError(_emailValidation.error)
      return
    }

    if (!_passwordValidation.valid) {
      setLocalError(_passwordValidation.error)
      return
    }

    // Llamar onSubmit
    onSubmit?.(
      {
        email: _credentials.email,
        password: _credentials.password
      },
      _rememberMe
    )
  }

  return (
    <div className="login-page">
      <div className="login-page__content">
        {/* Header */}
        <div className="login-page__header">
          <div className="login-page__logo">🔐</div>
          <h1 className="login-page__title">IACT Dashboard</h1>
          <p className="login-page__subtitle">Acceso Seguro</p>
        </div>

        {/* Card con formulario */}
        <div className="login-page__card">
          {/* Error Banner */}
          {(error || _localError) && (
            <div className="login-page__error-banner" role="alert">
              <span className="login-page__error-icon">⚠️</span>
              <span className="login-page__error-text">{error || _localError}</span>
              <button
                className="login-page__error-close"
                onClick={() => setLocalError(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form className="login-page__form" onSubmit={_handleSubmit}>
            {/* Fields */}
            <div className="login-page__fields">
              {/* Email Input */}
              <LoginInput
                type="email"
                name="email"
                value={_credentials.email}
                onChange={(value) => _handleChange('email', value)}
                label="Email"
                placeholder="tu@email.com"
                icon="✉️"
                disabled={loading}
                required
                validationFn={_validateEmail}
                autoComplete="email"
                dataValidate="Ingresa un email válido (ej: usuario@empresa.com)"
              />

              {/* Password Input */}
              <LoginInput
                type={_showPassword ? 'text' : 'password'}
                name="password"
                value={_credentials.password}
                onChange={(value) => _handleChange('password', value)}
                label="Contraseña"
                placeholder="••••••••"
                icon="🔒"
                disabled={loading}
                required
                validationFn={_validatePassword}
                autoComplete="current-password"
                dataValidate="Mínimo 6 caracteres (se recomienda 12+)"
              />

              {/* Password Strength Indicator */}
              {_credentials.password && (
                <PasswordStrength
                  password={_credentials.password}
                  showRequirements={_credentials.password.length > 3}
                />
              )}
            </div>

            {/* Options */}
            <div className="login-page__options">
              <div className="login-page__checkbox">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={_rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="rememberMe">Recuérdame</label>
              </div>
              <a href="#forgot" className="login-page__forgot-password">
                Olvidé mi contraseña
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-page__submit"
            >
              {loading ? '⏳ Iniciando sesión...' : '➤ Iniciar Sesión'}
            </button>
          </form>
        </div>

        {/* Footer con credenciales demo */}
        <div className="login-page__footer">
          <div className="login-page__footer-title">Credenciales Demo</div>
          <div className="login-page__demo-credentials">
            <div className="login-page__demo-item">admin@iact.com / password123</div>
            <div className="login-page__demo-item">user@iact.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
}

export default LoginForm

