/**
 * AlertHistory.jsx
 * IACT v4.0 — Alerts Module
 * UC_ALR_04: Ver historial de alertas disparadas
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAlertHistory, selectHistory, selectLoading, selectError } from '../../redux/slices/alerts'

const MAX_RANGE_DAYS = 365

function fmtMinutes(mins) {
  if (mins == null) return '—'
  if (mins < 60) return `${mins} min`
  return `${Math.round(mins / 60)} h`
}

const STATE_COLOR = { firing: '#dc2626', acknowledged: '#6b7280', resolved: '#10b981', closed: '#374151' }

export default function AlertHistory() {
  const dispatch = useDispatch()
  const history = useSelector(selectHistory)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [rangeError, setRangeError] = useState(null)

  useEffect(() => {
    dispatch(fetchAlertHistory({ limit: 50 }))
  }, [dispatch])

  function handleFilter() {
    setRangeError(null)
    if (dateStart && dateEnd) {
      const diffDays = (new Date(dateEnd) - new Date(dateStart)) / (1000 * 60 * 60 * 24)
      if (diffDays > MAX_RANGE_DAYS) {
        setRangeError('El rango máximo es de 1 año. Ajusta las fechas.')
        return
      }
    }
    dispatch(fetchAlertHistory({ dateStart, dateEnd, severity: severityFilter || undefined, limit: 50 }))
  }

  const filtered = (history ?? []).filter(h =>
    !severityFilter || h.severity === severityFilter
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Historial de alertas</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          UC_ALR_04 — Histórico de alertas disparadas
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label>Desde</label>
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
        </div>
        <div>
          <label>Hasta</label>
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
        </div>
        <div>
          <label>Severidad</label>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="">Todas</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleFilter} disabled={loading}>Filtrar</button>
      </div>

      {rangeError && (
        <div role="alert" className="error-banner">
          {rangeError}
        </div>
      )}

      {error && (
        <div role="alert" className="error-banner">
          {typeof error === 'string' ? error : error?.message}
        </div>
      )}

      <div style={{ backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 110px 100px 100px', gap: '10px', padding: '12px 16px', backgroundColor: '#0f172a', fontWeight: 600, color: '#fff', fontSize: '12px' }}>
          <div>Disparada</div>
          <div>Regla / Nombre</div>
          <div>Severidad</div>
          <div>Estado</div>
          <div>T. reconocer</div>
          <div>T. resolver</div>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Cargando…</div>
        ) : filtered.length > 0 ? (
          filtered.map((record, idx) => (
            <div
              key={record.id ?? idx}
              style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 110px 100px 100px', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #374151', alignItems: 'center', fontSize: '12px', backgroundColor: '#1f2937' }}
            >
              <div style={{ color: '#9ca3af' }}>
                {record.fired_at ? new Date(record.fired_at).toLocaleString() : '—'}
              </div>
              <div style={{ color: '#fff' }}>{record.name ?? record.alert_name ?? '—'}</div>
              <span style={{ backgroundColor: STATE_COLOR[record.severity] ?? '#6b7280', color: '#fff', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                {record.severity ?? '—'}
              </span>
              <span style={{ backgroundColor: STATE_COLOR[record.state] ?? '#6b7280', color: '#fff', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                {record.state ?? '—'}
              </span>
              <div style={{ color: '#9ca3af' }}>{fmtMinutes(record.time_to_ack)}</div>
              <div style={{ color: '#9ca3af' }}>{fmtMinutes(record.time_to_resolve)}</div>
            </div>
          ))
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No hay registros en el historial.</div>
        )}
      </div>
    </div>
  )
}
