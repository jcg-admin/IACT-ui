import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Modal from '@ui/shared/Modal'
import {
  createShare,
  resetCreateStatus,
  selectShareCreateStatus,
  selectSharesError,
} from '@store/slices/shares'

const TARGET_TYPE_OPTIONS = [
  { value: 'user',           label: 'Usuario específico' },
  { value: 'agr',            label: 'Grupo (AGR)' },
  { value: 'segment_public', label: 'Todo mi segmento' },
]

function ShareForm({ viewId, viewName, onClose }) {
  const dispatch = useDispatch()
  const createStatus = useSelector(selectShareCreateStatus)
  const sharesError = useSelector(selectSharesError)

  const [targetType, setTargetType] = useState('user')
  const [targetId, setTargetId] = useState('')
  const [permission, setPermission] = useState('read')
  const [expiresAt, setExpiresAt] = useState('')
  const [message, setMessage] = useState('')

  const needsTargetId = targetType !== 'segment_public'

  function handleSubmit(e) {
    e.preventDefault()
    dispatch(createShare({
      view_id: viewId,
      target_type: targetType,
      target_id: needsTargetId ? targetId : null,
      permission,
      expires_at: expiresAt || null,
      message: message || null,
    }))
  }

  function handleClose() {
    dispatch(resetCreateStatus())
    onClose()
  }

  if (createStatus === 'success') {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
          <div style={{ color: '#34d399', fontWeight: 600, fontSize: '16px' }}>Vista compartida</div>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            El destinatario puede aplicar la vista &quot;{viewName}&quot;.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={handleClose}>Cerrar</button>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {sharesError && createStatus === 'error' && (
        <div role="alert" style={{ padding: '10px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', fontSize: '13px' }}>
          {sharesError?.message ?? 'Error al compartir la vista'}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '13px', color: '#9ca3af' }}>
          Tipo de destinatario
        </label>
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff' }}
        >
          {TARGET_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {needsTargetId && (
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '13px', color: '#9ca3af' }}>
            {targetType === 'agr' ? 'ID del grupo (AGR)' : 'ID del usuario'}
          </label>
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
            placeholder={targetType === 'agr' ? 'Ej. 5' : 'Ej. 42'}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff' }}
          />
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '13px', color: '#9ca3af' }}>Permiso</label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#d1d5db' }}>
            <input type="radio" value="read" checked={permission === 'read'} onChange={() => setPermission('read')} />
            Leer (aplicar vista)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#d1d5db' }}>
            <input type="radio" value="clone" checked={permission === 'clone'} onChange={() => setPermission('clone')} />
            Clonar (crear copia propia)
          </label>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '13px', color: '#9ca3af' }}>
          Expira el (opcional)
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '13px', color: '#9ca3af' }}>
          Mensaje (opcional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Contexto para el destinatario…"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff', resize: 'vertical' }}
        />
        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>{message.length}/200</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={createStatus === 'pending' || (needsTargetId && !targetId.trim())}
        >
          {createStatus === 'pending' ? 'Compartiendo…' : 'Compartir'}
        </button>
      </div>
    </form>
  )
}

function UrlCopyContent({ url, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Enlace de reporte</label>
      <input
        type="text"
        readOnly
        value={url}
        style={{ width: '100%', padding: '8px', fontFamily: 'monospace', fontSize: '0.8125rem' }}
        onClick={(e) => e.target.select()}
      />
      <button className="btn btn-primary" onClick={handleCopy} style={{ alignSelf: 'flex-start' }}>
        {copied ? '¡Copiado!' : 'Copiar enlace'}
      </button>
    </div>
  )
}

export default function ShareReportModal({ isOpen, onClose, url = '', viewId = null, viewName = '' }) {
  if (!isOpen) return null

  const isBackendMode = viewId !== null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir reporte"
      footer={!isBackendMode
        ? <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        : null
      }
    >
      {isBackendMode
        ? <ShareForm viewId={viewId} viewName={viewName} onClose={onClose} />
        : <UrlCopyContent url={url} onClose={onClose} />
      }
    </Modal>
  )
}
