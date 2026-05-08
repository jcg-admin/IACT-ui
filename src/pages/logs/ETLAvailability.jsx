import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchETLAvailability,
  selectETLAvailability,
  selectLogsLoading,
  selectLogsError,
} from '@store/slices/logs'

const FRESCURA_BADGE = {
  fresco: 'badge-success',
  degradado: 'badge-warning',
  vencido: 'badge-danger',
}

function FrescuraBadge({ estado }) {
  const cls = FRESCURA_BADGE[estado] ?? 'badge-secondary'
  return <span className={`badge ${cls}`}>{estado ?? '—'}</span>
}

function toRows(payload) {
  if (!payload) return []
  return Array.isArray(payload) ? payload : [payload]
}

export default function ETLAvailability() {
  const dispatch = useDispatch()
  const availability = useSelector(selectETLAvailability)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  useEffect(() => {
    dispatch(fetchETLAvailability())
  }, [dispatch])

  const rows = toRows(availability)
  const hasVencido = rows.some((r) => r.estado_frescura === 'vencido')

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Disponibilidad de Datos ETL</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-PIP-03 — Frescura de datasets IVR
        </p>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {typeof error === 'string' ? error : error.message ?? 'Error al cargar disponibilidad'}
        </div>
      )}

      {hasVencido && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          Uno o más datasets han vencido — los datos IVR pueden estar desactualizados
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div role="status" aria-busy="true" style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>
          Cargando disponibilidad…
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">No hay datos de disponibilidad ETL.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Estado Frescura</th>
              <th>Minutos desde ETL</th>
              <th>Última actualización</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.dataset}>
                <td>{item.dataset}</td>
                <td><FrescuraBadge estado={item.estado_frescura} /></td>
                <td>{item.minutos_desde_etl ?? '—'}</td>
                <td>{item.ultima_actualizacion ? new Date(item.ultima_actualizacion).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
