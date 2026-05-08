import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchETLAvailability,
  selectETLAvailability,
  selectLogsLoading,
  selectLogsError,
} from '@store/slices/logs'
import ReportTable from '@ui/reports/ReportTable'

const FRESCURA_BADGE = {
  fresco: 'badge-success',
  degradado: 'badge-warning',
  vencido: 'badge-danger',
}

function toRows(payload) {
  if (!payload) return []
  return Array.isArray(payload) ? payload : [payload]
}

const COLUMNS = [
  { key: 'dataset', label: 'Dataset' },
  {
    key: 'estado_frescura',
    label: 'Estado Frescura',
    render: (estado) => (
      <span className={`badge ${FRESCURA_BADGE[estado] ?? 'badge-secondary'}`}>
        {estado ?? '—'}
      </span>
    ),
  },
  { key: 'minutos_desde_etl', label: 'Minutos desde ETL' },
  {
    key: 'ultima_actualizacion',
    label: 'Última actualización',
    render: (v) => (v ? new Date(v).toLocaleString() : '—'),
  },
]

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

      <ReportTable
        columns={COLUMNS}
        data={rows}
        loading={loading && rows.length === 0}
        emptyMessage="No hay datos de disponibilidad ETL."
      />
    </div>
  )
}
