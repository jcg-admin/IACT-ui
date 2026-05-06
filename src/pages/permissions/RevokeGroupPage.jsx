import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  revokeGroupFromUser,
  selectGroups,
  selectLoading,
  selectError,
  selectSuccess,
  clearError,
  resetState,
} from '../../redux/slices/accessSlice'

export default function RevokeGroupPage() {
  const dispatch = useDispatch()
  const groups = useSelector(selectGroups)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)

  const [userId, setUserId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [revokeReason, setRevokeReason] = useState('')

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(resetState())
    }
  }, [dispatch])

  function isValid() {
    return userId.trim() !== '' && groupId !== '' && revokeReason.trim().length >= 1
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid()) return
    dispatch(revokeGroupFromUser({
      userId: userId.trim(),
      groupId,
      revoke_reason: revokeReason.trim(),
    }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Revocar grupo de usuario</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-PERM-02 — Revocación de agrupador de acceso con motivo obligatorio
        </p>
      </div>

      {success && (
        <div style={{ padding: '12px', backgroundColor: '#064e3b', border: '1px solid #065f46', borderRadius: '4px', color: '#a7f3d0', marginBottom: '16px' }}>
          Grupo revocado correctamente. El evento AGR_REVOKED quedó registrado en auditoría.
        </div>
      )}

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <div>
          <label htmlFor="revoke-group-userid" style={{ display: 'block', marginBottom: 4 }}>
            Usuario (ID)
          </label>
          <input
            id="revoke-group-userid"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="user-42"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="revoke-group-groupid" style={{ display: 'block', marginBottom: 4 }}>
            Grupo
          </label>
          <select
            id="revoke-group-groupid"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">Selecciona grupo...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.codename} — {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="revoke-group-reason" style={{ display: 'block', marginBottom: 4 }}>
            Motivo de revocación
          </label>
          <textarea
            id="revoke-group-reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="Describe el motivo de la revocación..."
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-danger"
          disabled={!isValid() || loading}
        >
          {loading ? 'Revocando...' : 'Revocar'}
        </button>
      </form>
    </div>
  )
}
