import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLogs, selectLogs, selectLogsLoading, selectLogsError } from '../../redux/slices/logsSlice'

const BADGE_CLASS = { ERROR: 'badge-danger', WARNING: 'badge-warning', INFO: 'badge-info' }

export default function LogsPage() {
  const dispatch = useDispatch()
  const logs = useSelector(selectLogs)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    dispatch(fetchLogs())
  }, [dispatch])

  function handleApply() {
    dispatch(fetchLogs({ date_from: dateFrom, date_to: dateTo, level: level || undefined }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Logs del sistema</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div>
          <label>Desde</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label>Hasta</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div>
          <label>Nivel</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Todos</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleApply}>Aplicar</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Cargando...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">No hay logs para los filtros seleccionados.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Nivel</th>
              <th>Mensaje</th>
              <th>Fuente</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id ?? i}>
                <td>{log.timestamp}</td>
                <td><span className={`badge ${BADGE_CLASS[log.level] ?? 'badge'}`}>{log.level}</span></td>
                <td>{log.message}</td>
                <td>{log.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
