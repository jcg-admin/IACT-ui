import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSharesSent,
  fetchSharesReceived,
  revokeShare,
  selectSharesSent,
  selectSharesReceived,
  selectSharesLoading,
  selectSharesError,
} from '@store/slices/shares'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ConfirmModal from '../../components/shared/ConfirmModal'
import Table from '@ui/presentational/Table'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' })
}

function targetLabel(share) {
  if (share.target_type === 'segment_public') return 'Todo el segmento'
  if (share.target_type === 'agr') return `Grupo ${share.target_id}`
  return `Usuario ${share.target_id}`
}

const STATUS_COLUMN = {
  key: 'revoked_at',
  label: 'Estado',
  render: (v) => v
    ? <span className="badge badge-secondary">Revocada</span>
    : <span className="badge badge-success">Activa</span>,
}

function SentTable({ shares, onRevoke }) {
  return (
    <Table
      emptyMessage="No has compartido ninguna vista."
      columns={[
        { key: 'view_id', label: 'Vista' },
        { key: 'target_type', label: 'Destinatario', render: (_, row) => targetLabel(row) },
        { key: 'permission', label: 'Permiso' },
        { key: 'expires_at', label: 'Expira', render: (v) => formatDate(v) },
        { key: 'created_at', label: 'Compartida', render: (v) => formatDate(v) },
        STATUS_COLUMN,
      ]}
      data={shares}
      sortable={false}
      actions={[
        { label: 'Revocar', onClick: onRevoke, hidden: (row) => !!row.revoked_at },
      ]}
    />
  )
}

function ReceivedTable({ shares }) {
  return (
    <Table
      columns={[
        { key: 'view_id', label: 'Vista' },
        { key: 'owner_id', label: 'Remitente', render: (v) => `Usuario ${v}` },
        { key: 'permission', label: 'Permiso' },
        { key: 'expires_at', label: 'Expira', render: (v) => formatDate(v) },
        { key: 'created_at', label: 'Recibida', render: (v) => formatDate(v) },
        STATUS_COLUMN,
      ]}
      data={shares}
      sortable={false}
    />
  )
}

export default function SharedViews() {
  const dispatch = useDispatch()
  const sent = useSelector(selectSharesSent)
  const received = useSelector(selectSharesReceived)
  const loading = useSelector(selectSharesLoading)
  const error = useSelector(selectSharesError)
  const [activeTab, setActiveTab] = useState('sent')
  const [revokeModal, setRevokeModal] = useState({ isOpen: false, share: null })

  useEffect(() => {
    dispatch(fetchSharesSent())
    dispatch(fetchSharesReceived())
  }, [dispatch])

  function handleRevoke(share) {
    setRevokeModal({ isOpen: true, share })
  }

  function handleConfirmRevoke() {
    dispatch(revokeShare(revokeModal.share.id))
    setRevokeModal({ isOpen: false, share: null })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Vistas compartidas</h1>
      </div>

      {error && (
        <div className="error-banner">{error?.message ?? 'Error al cargar vistas compartidas'}</div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #374151' }}>
        <button
          className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('sent')}
        >
          Enviadas ({sent.length})
        </button>
        <button
          className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('received')}
        >
          Recibidas ({received.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando vistas compartidas..." />
      ) : activeTab === 'sent' ? (
        <SentTable shares={sent} onRevoke={handleRevoke} />
      ) : (
        <ReceivedTable shares={received} />
      )}


      <ConfirmModal
        isOpen={revokeModal.isOpen}
        onClose={() => setRevokeModal({ isOpen: false, share: null })}
        onConfirm={handleConfirmRevoke}
        title="Revocar acceso"
        message={`¿Revocar el acceso a la vista compartida con ${revokeModal.share ? targetLabel(revokeModal.share) : ''}?`}
        confirmLabel="Revocar"
        variant="danger"
      />
    </div>
  )
}

SentTable.propTypes = {
  shares:   PropTypes.array.isRequired,
  onRevoke: PropTypes.func.isRequired,
}

ReceivedTable.propTypes = {
  shares: PropTypes.array.isRequired,
}

