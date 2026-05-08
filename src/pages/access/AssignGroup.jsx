import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  assignGroupToUser,
  selectGroups,
  selectLoading,
  selectError,
  selectSuccess,
  clearError,
  resetState,
} from '@redux/slices/access'

export default function AssignGroup() {
  const dispatch = useDispatch()
  const groups = useSelector(selectGroups)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)

  const [userId, setUserId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(resetState())
    }
  }, [dispatch])

  function handleSubmit(e) {
    e.preventDefault()
    if (!userId.trim() || !groupId) return
    dispatch(assignGroupToUser({ userId: userId.trim(), groupId, expiresAt: expiresAt || null }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Asignar grupo a usuario</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-ACC-04 / UC-PERM-01 — Asignación de grupo de acceso
        </p>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div role="status" style={{ padding: '12px', backgroundColor: '#064e3b', border: '1px solid #34d399', borderRadius: '4px', color: '#6ee7b7', marginBottom: '16px' }}>
          Grupo asignado correctamente.
        </div>
      )}

      <div className="card" style={{ padding: '24px', maxWidth: '480px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="userId" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              ID de usuario
            </label>
            <input
              id="userId"
              type="text"
              className="input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ej: user-42"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="groupId" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              Grupo
            </label>
            <select
              id="groupId"
              className="input"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— Seleccionar grupo —</option>
              {groups.map((g) => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="expiresAt" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              Vence el <span style={{ color: '#6b7280', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              id="expiresAt"
              type="date"
              className="input"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Asignando…' : 'Asignar grupo'}
          </button>
        </form>
      </div>
    </div>
  )
}
