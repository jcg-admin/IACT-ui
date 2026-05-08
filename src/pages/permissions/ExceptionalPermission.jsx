import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllFunctions,
  grantExceptionalPermission,
  selectFunctions,
  selectLoading,
  selectError,
  selectSuccess,
  clearError,
  resetState,
} from '@store/slices/access'
import { selectUser } from '@store/selectors'

const MAX_EXCEPTIONAL_DAYS = 90

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function ExceptionalPermission() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectUser)
  const allFunctions = useSelector(selectFunctions)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)

  const [targetUserId, setTargetUserId] = useState('')
  const [permissionCode, setPermissionCode] = useState('')
  const [justification, setJustification] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [grantResult, setGrantResult] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const maxDate = addDays(today, MAX_EXCEPTIONAL_DAYS)

  useEffect(() => {
    dispatch(fetchAllFunctions())
    return () => {
      dispatch(clearError())
      dispatch(resetState())
    }
  }, [dispatch])

  const currentUserId = String(currentUser?.id ?? currentUser?.user_id ?? '')
  const isAntiSelf = targetUserId.trim() !== '' && targetUserId.trim() === currentUserId

  const justificationValid = justification.trim().length >= 10
  const expiresAtValid = expiresAt >= today && expiresAt <= maxDate
  const canSubmit = targetUserId.trim() && permissionCode && justificationValid && expiresAtValid && !isAntiSelf && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    const result = await dispatch(grantExceptionalPermission({
      userId: targetUserId.trim(),
      payload: {
        permission_code: permissionCode,
        justification: justification.trim(),
        expires_at: expiresAt,
        invoker_id: currentUserId || undefined,
      },
    }))

    if (grantExceptionalPermission.fulfilled.match(result)) {
      setGrantResult(result.payload)
    }
  }

  if (success && grantResult) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Conceder Permiso Excepcional</h1>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>UC_PERM_03</p>
        </div>
        <div style={{
          padding: '24px',
          backgroundColor: '#064e3b',
          border: '1px solid #10b981',
          borderRadius: '8px',
          maxWidth: '560px',
        }}>
          <div style={{ color: '#10b981', fontWeight: 700, fontSize: '18px', marginBottom: '12px' }}>
            Permiso excepcional concedido
          </div>
          <div style={{ color: '#86efac', fontSize: '14px', lineHeight: 1.6 }}>
            <div><strong>Usuario:</strong> {grantResult.user_id}</div>
            <div><strong>Permiso:</strong> {grantResult.permission_code}</div>
            <div><strong>Vence:</strong> {grantResult.expires_at}</div>
            <div><strong>Concedido:</strong> {new Date(grantResult.granted_at).toLocaleString()}</div>
            {grantResult.supervisor_notified && (
              <div style={{ marginTop: '8px', color: '#34d399' }}>
                Supervisor notificado correctamente.
              </div>
            )}
            <div style={{ marginTop: '4px', color: '#6ee7b7', fontSize: '12px' }}>
              Evento de auditoría: {grantResult.audit_event}
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '16px' }}
            onClick={() => {
              setGrantResult(null)
              setTargetUserId('')
              setPermissionCode('')
              setJustification('')
              setExpiresAt('')
              dispatch(resetState())
            }}
          >
            Conceder otro permiso
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Conceder Permiso Excepcional</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC_PERM_03 — Permiso excepcional con justificación obligatoria
        </p>
      </div>

      {isAntiSelf && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            backgroundColor: '#7f1d1d',
            border: '1px solid #dc2626',
            borderRadius: '4px',
            color: '#fca5a5',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          No puede concederse un permiso excepcional a sí mismo (P-11 anti-self).
        </div>
      )}

      {error && (
        <div role="alert" style={{
          padding: '12px 16px',
          backgroundColor: '#7f1d1d',
          border: '1px solid #dc2626',
          borderRadius: '4px',
          color: '#fca5a5',
          marginBottom: '16px',
          fontSize: '14px',
        }}>
          {typeof error === 'object' ? error.message : error}
        </div>
      )}

      <div className="card" style={{ padding: '24px', maxWidth: '560px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="targetUserId" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              ID de usuario destino <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="targetUserId"
              type="text"
              className="input"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Ej: user-42"
              style={{ width: '100%' }}
            />
            {isAntiSelf && (
              <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                Este ID coincide con su propio usuario.
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="permissionCode" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              Permiso a conceder <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="permissionCode"
              className="input"
              value={permissionCode}
              onChange={(e) => setPermissionCode(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— Seleccionar permiso —</option>
              {allFunctions.map((f) => (
                <option key={f.id} value={f.codename ?? f.code}>
                  {f.codename ?? f.code} — {f.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="justification" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              Justificación <span style={{ color: '#dc2626' }}>*</span>
              <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: '4px' }}>(mínimo 10 caracteres)</span>
            </label>
            <textarea
              id="justification"
              className="input"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Describa la razón del permiso excepcional..."
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
            {justification.length > 0 && !justificationValid && (
              <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                La justificación debe tener al menos 10 caracteres ({justification.length}/10).
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="expiresAt" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              Fecha de vencimiento <span style={{ color: '#dc2626' }}>*</span>
              <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: '4px' }}>
                (máximo {MAX_EXCEPTIONAL_DAYS} días)
              </span>
            </label>
            <input
              id="expiresAt"
              type="date"
              className="input"
              value={expiresAt}
              min={today}
              max={maxDate}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={{ width: '100%' }}
            />
            {expiresAt && !expiresAtValid && (
              <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                La fecha debe estar entre hoy y {maxDate}.
              </div>
            )}
          </div>

          <div style={{
            padding: '10px 12px',
            backgroundColor: '#1f2937',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '20px',
          }}>
            El supervisor del usuario será notificado automáticamente. La operación queda registrada en auditoría (EXCEPTIONAL_PERMISSION_GRANTED).
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
            style={{ width: '100%' }}
          >
            {loading ? 'Concediendo…' : 'Conceder permiso excepcional'}
          </button>
        </form>
      </div>
    </div>
  )
}
