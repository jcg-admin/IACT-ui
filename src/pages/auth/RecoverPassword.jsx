/**
 * RecoverPasswordPage — UC-AUTH-03
 * Solicitar recuperación de contraseña por username.
 */
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

const recoverPassword = (username) => async () => {
  const apiService = (await import('@services/apiService')).default
  await apiService.post('/api/auth/recover-password/', { username })
}

export default function RecoverPassword() {
  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError(null)

    try {
      await dispatch(recoverPassword(username.trim()))
      setSubmitted(true)
    } catch (err) {
      setError(err?.message || 'Error al enviar la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div className="page-header">
          <h1>Recuperar contraseña</h1>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {submitted ? (
          <div>
            <p>
              Si el usuario existe, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                disabled={loading}
                required
                autoComplete="username"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !username.trim()}
              style={{ width: '100%' }}
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/login">← Volver al login</Link>
        </div>
      </div>
    </div>
  )
}
