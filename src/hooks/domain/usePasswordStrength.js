/**
 * usePasswordStrength Hook
 * Calcula fortaleza de contraseña basada en:
 * - Longitud
 * - Caracteres variados (mayús, minús, números, especiales)
 * - Patrones comunes (evitar)
 */

import { useMemo } from 'react'

export function usePasswordStrength(_password) {
  const _result = useMemo(() => {
    if (!_password) {
      return {
        strength: 'weak',
        score: 0,
        requirements: _getRequirements(_password)
      }
    }

    let _score = 0
    const _reqs = _getRequirements(_password)

    // Longitud
    if (_password.length >= 8) _score += 20
    if (_password.length >= 12) _score += 10
    if (_password.length >= 16) _score += 10

    // Mayúsculas
    if (/[A-Z]/.test(_password)) _score += 15

    // Minúsculas
    if (/[a-z]/.test(_password)) _score += 15

    // Números
    if (/\d/.test(_password)) _score += 15

    // Caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(_password)) _score += 15

    // Penalty por patrones comunes
    const _hasCommonPattern = _isCommonPattern(_password)
    if (_hasCommonPattern) {
      _score -= 10
    }

    // Clamp score
    _score = Math.max(0, Math.min(100, _score))

    // Determine strength
    let _strength = 'weak'
    if (_score >= 20 && _score < 50) _strength = 'medium'
    if (_score >= 50 && _score < 75) _strength = 'strong'
    if (_score >= 75) _strength = 'veryStrong'

    return {
      strength: _strength,
      score: _score,
      requirements: _reqs
    }
  }, [_password])

  return _result
}

/**
 * Obtener requisitos
 */
function _getRequirements(_password) {
  return [
    {
      id: 'length8',
      label: 'Mínimo 8 caracteres',
      met: _password?.length >= 8
    },
    {
      id: 'length12',
      label: 'Mínimo 12 caracteres (recomendado)',
      met: _password?.length >= 12
    },
    {
      id: 'uppercase',
      label: 'Al menos una mayúscula',
      met: /[A-Z]/.test(_password)
    },
    {
      id: 'lowercase',
      label: 'Al menos una minúscula',
      met: /[a-z]/.test(_password)
    },
    {
      id: 'number',
      label: 'Al menos un número',
      met: /\d/.test(_password)
    },
    {
      id: 'special',
      label: 'Al menos un carácter especial',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(_password)
    }
  ]
}

/**
 * Detectar patrones comunes (débiles)
 */
function _isCommonPattern(_password) {
  const _commonPatterns = [
    'password',
    '123456',
    'qwerty',
    'abc123',
    'admin',
    'letmein',
    'welcome',
    '111111',
    '000000'
  ]

  return _commonPatterns.some(_pattern =>
    _password.toLowerCase().includes(_pattern)
  )
}

export default usePasswordStrength
