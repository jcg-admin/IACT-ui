import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSystemStatus, selectSystemStatus, selectLogsLoading } from '../../redux/slices/logsSlice'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const STATUS_BADGE = { UP: 'badge-success', DOWN: 'badge-danger', DEGRADED: 'badge-warning' }

export default function SystemStatusPage() {
  const dispatch = useDispatch()
  const systemStatus = useSelector(selectSystemStatus)
  const loading = useSelector(selectLogsLoading)

  useEffect(() => {
    dispatch(fetchSystemStatus())
  }, [dispatch])

  const services = systemStatus?.services ?? []

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Estado del sistema</h1>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando estado del sistema..." />
      ) : services.length === 0 ? (
        <div className="empty-state">Sin datos de estado disponibles.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {services.map((svc) => (
            <div key={svc.name} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{svc.name}</div>
              <span className={`badge ${STATUS_BADGE[svc.status] ?? 'badge'}`}>{svc.status}</span>
              {svc.latency_ms != null && (
                <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
                  {svc.latency_ms} ms
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
