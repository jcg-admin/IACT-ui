import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchExceptionalPermissions,
  revokeExceptionalPermission,
  selectExceptionalPermissions,
  selectLoading,
  selectError,
  clearError,
} from '@store/slices/access'

export default function RevokeExceptionalPermission() {
  const dispatch = useDispatch()
  const permissions = useSelector(selectExceptionalPermissions)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  const [userId, setUserId] = useState('')
  const [searched, setSearched] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [revokeReason, setRevokeReason] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (!userId.trim()) return
    dispatch(clearError())
    dispatch(fetchExceptionalPermissions(userId.trim()))
    setSearched(true)
    setConfirmId(null)
    setRevokeReason('')
  }

  function handleRevoke(permId) {
    if (revokeReason.trim().length < 10) return
    dispatch(revokeExceptionalPermission({ userId: userId.trim(), permissionId: permId, revoke_reason: revokeReason.trim() }))
    setConfirmId(null)
    setRevokeReason('')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Revocar Permiso Excepcional</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-015 — Revocar permisos excepcionales activos de un usuario
        </p>
      </div>

      {error && (
        <div role="alert" className="error-banner">
          {typeof error === 'object' ? error.message : error}
        </div>
      )}

      <div className="card" style={{ padding: '24px', maxWidth: '560px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID de usuario..."
            style={{ flex: 1 }}
            aria-label="ID de usuario"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!userId.trim() || loading}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
      </div>

      {searched && !loading && permissions.length === 0 && (
        <div className="empty-state">
          No hay permisos excepcionales activos para este usuario.
        </div>
      )}

      {permissions.length > 0 && (
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #374151',
          }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
              Permisos excepcionales activos
              <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '8px' }}>
                ({permissions.length})
              </span>
            </h2>
          </div>

          {permissions.map((perm) => (
            <div key={perm.id} style={{
              padding: '16px',
              borderBottom: '1px solid #374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                  {perm.permission_code}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.6 }}>
                  <div><strong style={{ color: '#d1d5db' }}>Justificación:</strong> {perm.justification}</div>
                  <div><strong style={{ color: '#d1d5db' }}>Concedido por:</strong> {perm.granted_by}</div>
                  <div><strong style={{ color: '#d1d5db' }}>Vence:</strong> {new Date(perm.expires_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                {confirmId === perm.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                    <textarea
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      placeholder="Motivo de revocación (mínimo 10 caracteres)..."
                      rows={2}
                      aria-label="Motivo de revocación"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#fff',
                        fontSize: '13px',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                    {revokeReason.length > 0 && revokeReason.trim().length < 10 && (
                      <div style={{ color: '#f87171', fontSize: '12px' }}>
                        Mínimo 10 caracteres ({revokeReason.trim().length}/10)
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 10px', color: '#f87171', borderColor: '#f87171' }}
                        onClick={() => handleRevoke(perm.id)}
                        disabled={loading || revokeReason.trim().length < 10}
                      >
                        Confirmar
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => { setConfirmId(null); setRevokeReason('') }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px', color: '#f87171', borderColor: '#f87171' }}
                    onClick={() => setConfirmId(perm.id)}
                    disabled={loading}
                  >
                    Revocar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
