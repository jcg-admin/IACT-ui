/**
 * ChangePasswordPage — UC-AUTH-04
 * Cambiar contraseña con validación de fortaleza.
 */
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PasswordStrength from '../../components/auth/PasswordStrength'

const changePassword = ({ currentPassword, newPassword }) => async () => {
  const apiService = (await import('@services/apiService')).default
  await apiService.post('/api/auth/change-password/', { currentPassword, newPassword })
}

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}

    if (!form.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida'
    }

    if (!form.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida'
    } else if (form.newPassword.length < 8) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres'
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la nueva contraseña'
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return newErrors
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await dispatch(changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }))
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setErrors({ form: err?.message || 'Error al cambiar la contraseña. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div className="page-header">
          <h1>Cambiar contraseña</h1>
        </div>

        {errors.form && (
          <div className="error-banner" role="alert">
            {errors.form}
          </div>
        )}

        {success ? (
          <div className="loading-state" role="status">
            Contraseña cambiada. Redirigiendo...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Contraseña actual */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                disabled={loading}
                required
                autoComplete="current-password"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
              {errors.currentPassword && (
                <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>
                  {errors.currentPassword}
                </span>
              )}
            </div>

            {/* Nueva contraseña */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                disabled={loading}
                required
                autoComplete="new-password"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
              {errors.newPassword && (
                <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>
                  {errors.newPassword}
                </span>
              )}
              <PasswordStrength password={form.newPassword} />
            </div>

            {/* Confirmar nueva contraseña */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading}
                required
                autoComplete="new-password"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
              {errors.confirmPassword && (
                <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || success}
              style={{ width: '100%' }}
            >
              {loading ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
