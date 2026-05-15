/**
 * AssignGroup.jsx — IACT v2
 *
 * UC-ACC-04 / UC-PERM-01 — Asignación de grupo de acceso a usuario.
 *
 * CORRECCIÓN T4.1: validateGroupAssignment eliminado en T1.5 y T3.2.
 * El endpoint /api/access/groups/{id}/validate-for-user no existe en IACT-api.
 * El flujo ahora es: completar formulario → confirmar → asignar directamente.
 */
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
} from '@store/slices/access'
import SeparationRulesValidator from '@ui/access/SeparationRulesValidator'

export default function AssignGroup() {
  const dispatch = useDispatch()
  const groups   = useSelector(selectGroups)
  const loading  = useSelector(selectLoading)
  const error    = useSelector(selectError)
  const success  = useSelector(selectSuccess)

  const [userId,    setUserId]    = useState('')
  const [groupId,   setGroupId]   = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(resetState())
    }
  }, [dispatch])

  function resetForm() {
    setConfirmed(false)
    dispatch(clearError())
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId.trim() || !groupId) return
    await dispatch(assignGroupToUser({
      userId:    userId.trim(),
      groupId,
      expiresAt: expiresAt || null,
    }))
  }

  const canSubmit = userId.trim() && groupId && confirmed

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Asignar grupo a usuario</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-ACC-04 / UC-PERM-01 — Asignación de grupo de acceso
        </p>
      </div>

      {error && (
        <div role="alert" className="error-banner">
          {typeof error === 'object' ? error.message : error}
        </div>
      )}

      {success && (
        <div role="status" style={{
          padding: '12px', backgroundColor: '#064e3b',
          border: '1px solid #34d399', borderRadius: '4px',
          color: '#6ee7b7', marginBottom: '16px',
        }}>
          Grupo asignado correctamente.
        </div>
      )}

      <div className="card" style={{ padding: '24px', maxWidth: '560px' }}>
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
              onChange={(e) => { setUserId(e.target.value); resetForm() }}
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
              onChange={(e) => { setGroupId(e.target.value); resetForm() }}
              style={{ width: '100%' }}
            >
              <option value="">— Seleccionar grupo —</option>
              {groups.map((g) => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
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

          {/* Confirmación explícita reemplaza la pre-validación del endpoint eliminado */}
          {userId.trim() && groupId && (
            <div style={{
              padding: '12px', marginBottom: '16px',
              backgroundColor: '#0f172a', border: '1px solid #374151',
              borderRadius: '4px',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#d1d5db', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  aria-label="Confirmar asignación de grupo"
                />
                Confirmo que la asignación del grupo <strong style={{ color: '#fff', margin: '0 4px' }}>
                  {groups.find(g => String(g.id) === String(groupId))?.name ?? groupId}
                </strong> al usuario <strong style={{ color: '#fff', margin: '0 4px' }}>{userId.trim()}</strong> es correcta.
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Asignando…' : 'Asignar grupo'}
          </button>
        </form>
      </div>
    </div>
  )
}
