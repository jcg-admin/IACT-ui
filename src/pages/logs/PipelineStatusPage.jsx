import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPipelineStatus,
  selectPipelineStatus,
  selectLogsLoading,
  selectLogsError,
} from '@redux/slices/logsSlice'

function JobCard({ label, count, color }) {
  return (
    <div className="card" style={{ padding: '20px', textAlign: 'center', flex: 1 }}>
      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '36px', fontWeight: 700, color }}>{count ?? '—'}</div>
    </div>
  )
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`
  return `${bytes} B`
}

export default function PipelineStatusPage() {
  const dispatch = useDispatch()
  const status = useSelector(selectPipelineStatus)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  useEffect(() => {
    dispatch(fetchPipelineStatus())
  }, [dispatch])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Estado del Pipeline ETL</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-PIP-01 — Salud y throughput del ETL de Analytics
        </p>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading && !status ? (
        <div role="status" aria-busy="true" style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>
          Cargando estado del pipeline…
        </div>
      ) : !status ? (
        <div className="empty-state">Sin datos de pipeline disponibles.</div>
      ) : (
        <>
          {/* Jobs dashboard */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <JobCard label="En ejecución" count={status.jobs?.running} color="#f59e0b" />
            <JobCard label="Completados" count={status.jobs?.completed} color="#34d399" />
            <JobCard label="Fallidos" count={status.jobs?.failed} color="#ef4444" />
          </div>

          {/* Sources table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #374151' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Fuentes de datos</h2>
            </div>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Fuente</th>
                  <th>Lag</th>
                  <th>Throughput (filas/min)</th>
                  <th>Bytes procesados</th>
                  <th>Latencia promedio</th>
                </tr>
              </thead>
              <tbody>
                {(status.sources ?? []).map((src) => (
                  <tr key={src.name}>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{src.name}</td>
                    <td style={{ color: src.throughputRowsPerMin === 0 ? '#ef4444' : '#9ca3af' }}>
                      {src.lag}
                    </td>
                    <td>{src.throughputRowsPerMin}</td>
                    <td>{formatBytes(src.bytesProcessed)}</td>
                    <td>{src.avgLatencyMs != null ? `${src.avgLatencyMs} ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
