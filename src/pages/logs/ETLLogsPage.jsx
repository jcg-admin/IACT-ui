import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchETLLogs, selectETLLogs, selectLogsLoading, selectLogsError } from '../../redux/slices/logsSlice'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const STATUS_BADGE = { success: 'badge-success', failed: 'badge-danger', running: 'badge-warning' }

export default function ETLLogsPage() {
  const dispatch = useDispatch()
  const etlLogs = useSelector(selectETLLogs)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    dispatch(fetchETLLogs())
  }, [dispatch])

  function handleApply() {
    dispatch(fetchETLLogs({ date_from: dateFrom, date_to: dateTo, status: status || undefined }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Logs ETL</h1>
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
          <label>Estado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleApply}>Aplicar</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <LoadingSpinner message="Cargando logs ETL..." />
      ) : etlLogs.length === 0 ? (
        <div className="empty-state">No hay logs ETL para los filtros seleccionados.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Proceso</th>
              <th>Estado</th>
              <th>Duración</th>
              <th>Registros</th>
            </tr>
          </thead>
          <tbody>
            {etlLogs.map((log, i) => (
              <tr key={log.id ?? i}>
                <td>{log.timestamp}</td>
                <td>{log.process}</td>
                <td><span className={`badge ${STATUS_BADGE[log.status] ?? 'badge'}`}>{log.status}</span></td>
                <td>{log.duration}</td>
                <td>{log.records_processed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
