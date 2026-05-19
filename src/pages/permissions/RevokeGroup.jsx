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
} from '../../redux/slices/access'
import apiClient from '../../services/apiClient'
import Modal from '../../components/shared/Modal'

export default function RevokeGroup() {
  const dispatch = useDispatch()
  const groups = useSelector(selectGroups)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const success = useSelector(selectSuccess)

  const [userId, setUserId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [revokeReason, setRevokeReason] = useState('')

  // UC_PERM_02 PASO 4: preview modal state
  const [previewData, setPreviewData] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmLiteral, setConfirmLiteral] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(null)

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(resetState())
    }
  }, [dispatch])

  function isFormValid() {
    return userId.trim() !== '' && groupId !== '' && revokeReason.trim().length >= 10
  }

  async function handleVerifyImpact() {
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const data = await apiClient.get(
        `/api/users/${userId.trim()}/access-groups/${groupId}/preview-revoke/`
      )
      setPreviewData(data)
      setShowModal(true)
    } catch (err) {
      setPreviewError(err.message ?? 'Error al obtener el impacto de revocación.')
    } finally {
      setPreviewLoading(false)
    }
  }

  function hasCriticalWarnings() {
    return previewData?.warnings?.critical_revoked?.length > 0
  }

  function isConfirmEnabled() {
    if (!previewData) return false
    if (hasCriticalWarnings()) return confirmLiteral === 'REVOCAR'
    return true
  }

  function handleConfirm() {
    dispatch(revokeGroupFromUser({
      userId: userId.trim(),
      groupId,
      revoke_reason: revokeReason.trim(),
    }))
    setShowModal(false)
    setPreviewData(null)
    setConfirmLiteral('')
  }

  function handleCloseModal() {
    setShowModal(false)
    setPreviewData(null)
    setConfirmLiteral('')
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
        <div role="alert" className="error-banner">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); handleVerifyImpact() }}
        style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}
      >
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
          {revokeReason.length > 0 && revokeReason.trim().length < 10 && (
            <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
              El motivo debe tener al menos 10 caracteres ({revokeReason.trim().length}/10).
            </div>
          )}
        </div>

        {previewError && (
          <div role="alert" style={{ color: '#f87171', fontSize: '13px' }}>{previewError}</div>
        )}

        <button
          type="submit"
          className="btn btn-danger"
          disabled={!isFormValid() || previewLoading || loading}
          aria-label="Verificar impacto"
        >
          {previewLoading ? 'Verificando...' : 'Verificar impacto'}
        </button>
      </form>

      {/* UC_PERM_02 PASO 4 — Modal de composición y warnings */}
      <Modal
        isOpen={showModal && !!previewData}
        onClose={handleCloseModal}
        title="Impacto de revocación"
        size="md"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-danger"
              disabled={!isConfirmEnabled() || loading}
            >
              {loading ? 'Revocando...' : 'Confirmar revocación'}
            </button>
          </>
        }
      >
        {previewData && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '13px' }}>
                Funciones que se revocarán:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {previewData.functions_to_revoke.map((fn) => (
                  <span
                    key={fn}
                    style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 12px 0' }}>
              Funciones restantes tras revocación: <strong style={{ color: '#fff' }}>{previewData.functions_remaining}</strong>
            </p>

            {previewData.warnings.no_functions && (
              <div role="alert" className="error-banner">
                ⚠ El usuario perderá TODAS sus funciones efectivas.
              </div>
            )}

            {hasCriticalWarnings() && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  backgroundColor: '#78350f', border: '1px solid #d97706', borderRadius: '4px',
                  padding: '10px', color: '#fcd34d', fontSize: '13px', marginBottom: '8px',
                }}>
                  Funciones críticas afectadas: {previewData.warnings.critical_revoked.join(', ')}
                </div>
                <label htmlFor="confirm-literal" style={{ display: 'block', color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>
                  Escribe <strong style={{ color: '#fff' }}>REVOCAR</strong> para confirmar
                </label>
                <input
                  id="confirm-literal"
                  type="text"
                  value={confirmLiteral}
                  onChange={(e) => setConfirmLiteral(e.target.value)}
                  placeholder="REVOCAR"
                  aria-label="Confirmación literal"
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
