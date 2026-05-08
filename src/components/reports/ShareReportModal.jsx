import React, { useState } from 'react'
import Modal from '@ui/shared/Modal'

export default function ShareReportModal({ isOpen, url = '', onClose }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir reporte"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
      }
    >
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
    </Modal>
  )
}
