/**
 * RecoverPasswordPage — UC_AUTH_03
 *
 * Recuperar password mediante preguntas de seguridad (CNST-001: SIN email).
 *
 * Flujo de 3 pasos:
 *   1. Username — el usuario ingresa su username.
 *   2. Preguntas — la UI muestra las preguntas de seguridad (el API
 *      las expone publicamente; el usuario debe conocer las suyas).
 *   3. Reset — el usuario ingresa nueva contrasena + confirmacion.
 *      Si las respuestas son correctas, el API la cambia y fuerza
 *      cambio en proximo login (FR-003-05).
 */
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchSecurityQuestions,
  verifyAnswers,
  recoverPassword,
} from '@store/slices/auth'

const STEP_USERNAME = 'username'
const STEP_ANSWERS = 'answers'
const STEP_RESET = 'reset'
const STEP_DONE = 'done'

export default function RecoverPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP_USERNAME)
  const [username, setUsername] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({}) // {question_id: 'respuesta'}
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmitUsername = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await dispatch(fetchSecurityQuestions()).unwrap()
      const list = Array.isArray(data) ? data : (data?.data || [])
      if (!list.length) {
        setError('No hay preguntas de seguridad configuradas en el sistema.')
        return
      }
      setQuestions(list)
      setAnswers(Object.fromEntries(list.map(q => [q.id, ''])))
      setStep(STEP_ANSWERS)
    } catch (err) {
      setError(err?.message || 'Error al cargar las preguntas.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswers = async (e) => {
    e.preventDefault()
    const filled = Object.entries(answers).filter(([, v]) => v.trim() !== '')
    if (filled.length !== questions.length) {
      setError('Debes responder todas las preguntas.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = filled.map(([qid, answer]) => ({
        question_id: Number(qid),
        answer,
      }))
      await dispatch(verifyAnswers({ username: username.trim(), answers: payload })).unwrap()
      setStep(STEP_RESET)
    } catch (err) {
      setError(err?.message || 'Las respuestas no son correctas.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReset = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setError('La nueva contrasena debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = Object.entries(answers).map(([qid, answer]) => ({
        question_id: Number(qid),
        answer,
      }))
      await dispatch(recoverPassword({
        username: username.trim(),
        answers: payload,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })).unwrap()
      setStep(STEP_DONE)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar la contrasena.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (qid) => (e) => {
    setAnswers((prev) => ({ ...prev, [qid]: e.target.value }))
  }

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
        <div className="page-header">
          <h1>Recuperar contrasena</h1>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Paso {step === STEP_USERNAME ? 1 : step === STEP_ANSWERS ? 2 : 3} de 3
          </p>
        </div>

        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {step === STEP_USERNAME && (
          <form onSubmit={handleSubmitUsername}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="recover-username" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Usuario
              </label>
              <input
                id="recover-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Cargando...' : 'Continuar'}
            </button>
          </form>
        )}

        {step === STEP_ANSWERS && (
          <form onSubmit={handleSubmitAnswers}>
            <p style={{ marginBottom: '1rem' }}>
              Responde tus preguntas de seguridad:
            </p>
            {questions.map((q) => (
              <div key={q.id} style={{ marginBottom: '1rem' }}>
                <label htmlFor={`answer-${q.id}`} style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {q.question || q.text}
                </label>
                <input
                  id={`answer-${q.id}`}
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={handleAnswerChange(q.id)}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Verificando...' : 'Verificar respuestas'}
            </button>
          </form>
        )}

        {step === STEP_RESET && (
          <form onSubmit={handleSubmitReset}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="recover-new-password" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Nueva contrasena
              </label>
              <input
                id="recover-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="recover-confirm-password" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Confirmar nueva contrasena
              </label>
              <input
                id="recover-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Cambiando...' : 'Cambiar contrasena'}
            </button>
          </form>
        )}

        {step === STEP_DONE && (
          <div className="loading-state" role="status">
            Contrasena cambiada. Redirigiendo al login...
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login">Volver al inicio de sesion</Link>
        </div>
      </div>
    </div>
  )
}
