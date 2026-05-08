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

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' })
}

function targetLabel(share) {
  if (share.target_type === 'segment_public') return 'Todo el segmento'
  if (share.target_type === 'agr') return `Grupo ${share.target_id}`
  return `Usuario ${share.target_id}`
}

function SentTable({ shares, onRevoke }) {
  if (shares.length === 0) return <div className="empty-state">No has compartido ninguna vista.</div>
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Vista</th>
          <th>Destinatario</th>
          <th>Permiso</th>
          <th>Expira</th>
          <th>Compartida</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {shares.map((s) => (
          <tr key={s.id}>
            <td>{s.view_id}</td>
            <td>{targetLabel(s)}</td>
            <td>{s.permission}</td>
            <td>{formatDate(s.expires_at)}</td>
            <td>{formatDate(s.created_at)}</td>
            <td>
              {s.revoked_at
                ? <span className="badge badge-secondary">Revocada</span>
                : <span className="badge badge-success">Activa</span>
              }
            </td>
            <td>
              {!s.revoked_at && (
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => onRevoke(s)}>
                  Revocar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ReceivedTable({ shares }) {
  if (shares.length === 0) return <div className="empty-state">No tienes vistas compartidas contigo.</div>
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Vista</th>
          <th>Remitente</th>
          <th>Permiso</th>
          <th>Expira</th>
          <th>Recibida</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {shares.map((s) => (
          <tr key={s.id}>
            <td>{s.view_id}</td>
            <td>{`Usuario ${s.owner_id}`}</td>
            <td>{s.permission}</td>
            <td>{formatDate(s.expires_at)}</td>
            <td>{formatDate(s.created_at)}</td>
            <td>
              {s.revoked_at
                ? <span className="badge badge-secondary">Revocada</span>
                : <span className="badge badge-success">Activa</span>
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function SharedViews() {
  const dispatch = useDispatch()
  const sent = useSelector(selectSharesSent)
  const received = useSelector(selectSharesReceived)
  const loading = useSelector(selectSharesLoading)
  const error = useSelector(selectSharesError)
  const [activeTab, setActiveTab] = useState('sent')

  useEffect(() => {
    dispatch(fetchSharesSent())
    dispatch(fetchSharesReceived())
  }, [dispatch])

  function handleRevoke(share) {
    if (!window.confirm(`¿Revocar el acceso a la vista compartida con ${targetLabel(share)}?`)) return
    dispatch(revokeShare(share.id))
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
    </div>
  )
}
