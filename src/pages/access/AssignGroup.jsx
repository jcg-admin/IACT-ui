import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  assignGroupToUser,
  validateGroupAssignment,
  selectGroups,
  selectLoading,
  selectValidatingGroup,
  selectError,
  selectSuccess,
  clearError,
  resetState,
} from '@store/slices/access'
import SeparationRulesValidator from '@ui/access/SeparationRulesValidator'

export default function AssignGroup() {
  const dispatch = useDispatch()
  const groups = useSelector(selectGroups)
  const loading = useSelector(selectLoading)
  const validating = useSelector(selectValidatingGroup)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)

  const [userId, setUserId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  // Validation step state
  const [step, setStep] = useState('form') // 'form' | 'review'
  const [validationResult, setValidationResult] = useState(null) // { valid, conflicts }
  const [softConfirmed, setSoftConfirmed] = useState(false)

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(resetState())
    }
  }, [dispatch])

  function resetToForm() {
    setStep('form')
    setValidationResult(null)
    setSoftConfirmed(false)
    dispatch(clearError())
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!userId.trim() || !groupId) return
    setSoftConfirmed(false)
    const result = await dispatch(validateGroupAssignment({ userId: userId.trim(), groupId }))
    if (validateGroupAssignment.fulfilled.match(result)) {
      setValidationResult(result.payload)
      setStep('review')
    } else {
      setStep('review')
      setValidationResult({ valid: false, conflicts: [] })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId.trim() || !groupId) return
    dispatch(assignGroupToUser({ userId: userId.trim(), groupId, expiresAt: expiresAt || null }))
  }

  const conflicts = validationResult?.conflicts ?? []
  const hasHard = conflicts.some((c) => (c.severity ?? 'HARD') === 'HARD')
  const allSoft = conflicts.length > 0 && !hasHard
  const canSubmit = step === 'review' && validationResult && (
    validationResult.valid ||
    (allSoft && softConfirmed)
  )

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
        <div role="status" style={{ padding: '12px', backgroundColor: '#064e3b', border: '1px solid #34d399', borderRadius: '4px', color: '#6ee7b7', marginBottom: '16px' }}>
          Grupo asignado correctamente.
        </div>
      )}

      <div className="card" style={{ padding: '24px', maxWidth: '560px' }}>
        <form onSubmit={step === 'form' ? handleVerify : handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="userId" style={{ display: 'block', marginBottom: '6px', color: '#d1d5db', fontSize: '14px' }}>
              ID de usuario
            </label>
            <input
              id="userId"
              type="text"
              className="input"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); resetToForm() }}
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
              onChange={(e) => { setGroupId(e.target.value); resetToForm() }}
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

          {/* Step 1: Verify button */}
          {step === 'form' && (
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={!userId.trim() || !groupId || validating}
              style={{ width: '100%' }}
            >
              {validating ? 'Verificando separación…' : 'Verificar separación'}
            </button>
          )}

          {/* Step 2: Validation result + assign */}
          {step === 'review' && validationResult && (
            <div>
              {/* No conflicts: green panel */}
              {conflicts.length === 0 && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#064e3b',
                  border: '1px solid #10b981',
                  borderRadius: '4px',
                  color: '#6ee7b7',
                  marginBottom: '16px',
                  fontSize: '14px',
                }}>
                  Sin conflictos de separación. Puede proceder.
                </div>
              )}

              {/* Conflicts: show validator */}
              {conflicts.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <SeparationRulesValidator
                    conflicts={conflicts}
                    onProceedAnyway={allSoft ? () => setSoftConfirmed(true) : undefined}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetToForm}
                  style={{ flex: 1 }}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!canSubmit || loading}
                  style={{ flex: 2 }}
                >
                  {loading ? 'Asignando…' : 'Asignar grupo'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
