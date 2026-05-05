/**
 * PasswordStrength Component
 * Muestra:
 * - Barra de fortaleza (visual)
 * - Nivel de fortaleza (weak/medium/strong/very strong)
 * - Requisitos cumplidos/faltantes
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import usePasswordStrength from '@hooks/usePasswordStrength'
import '@styles/components/_password-strength.scss'

function PasswordStrength({ password, showRequirements = true }) {
  const { strength, score, requirements } = usePasswordStrength(password)

  const _strengthLabel = useMemo(() => {
    switch (strength) {
      case 'weak':
        return 'Débil'
      case 'medium':
        return 'Media'
      case 'strong':
        return 'Fuerte'
      case 'veryStrong':
        return 'Muy Fuerte'
      default:
        return 'Ingresa una contraseña'
    }
  }, [strength])

  if (!password) {
    return null
  }

  return (
    <div className="password-strength" aria-live="polite" aria-atomic="true">
      {/* Strength Bar */}
      <div className="password-strength__bar-container">
        <div
          className={`password-strength__bar password-strength__bar--${strength}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Fortaleza: ${_strengthLabel}`}
        />
      </div>

      {/* Strength Label */}
      <div className="password-strength__label">
        <span className={`password-strength__text password-strength__text--${strength}`}>
          {_strengthLabel}
        </span>
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="password-strength__requirements" aria-label="Requisitos de contraseña">
          <p className="password-strength__requirements-title">Requisitos:</p>
          <ul className="password-strength__requirements-list">
            {requirements.map((_req) => (
              <li
                key={_req.id}
                className={`password-strength__requirement ${_req.met ? 'password-strength__requirement--met' : ''}`}
              >
                <span className="password-strength__requirement-icon" aria-hidden="true">
                  {_req.met ? '✓' : '○'}
                </span>
                <span className="password-strength__requirement-text">
                  {_req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

PasswordStrength.propTypes = {
  password: PropTypes.string.isRequired,
  showRequirements: PropTypes.bool
}

export default PasswordStrength
