import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchETLLogs, retryPipeline, selectETLLogs } from '../../redux/slices/logs'
import { selectIsLoading } from '../../redux/slices/loading'
import ConfirmModal from '../../components/shared/ConfirmModal'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const STATUS_BADGE = { success: 'badge-success', failed: 'badge-danger', running: 'badge-warning' }

export default function ETLLogs() {
  const dispatch = useDispatch()
  const etlLogs = useSelector(selectETLLogs)
  const loading = useSelector(selectIsLoading('logs'))

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')
  const [retryModal, setRetryModal] = useState({ isOpen: false, logId: null })

  useEffect(() => {
    dispatch(fetchETLLogs())
  }, [dispatch])

  function handleApply() {
    dispatch(fetchETLLogs({ date_from: dateFrom, date_to: dateTo, status: status || undefined }))
  }

  function handleConfirmRetry() {
    dispatch(retryPipeline(retryModal.logId))
    setRetryModal({ isOpen: false, logId: null })
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
        <button
          className="btn btn-secondary"
          onClick={() => dispatch(fetchETLLogs({ status: 'error' }))}
        >
          Solo errores
        </button>
      </div>

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
                <td>
                  {log.status === 'failed' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setRetryModal({ isOpen: true, logId: log.id })}
                      style={{ fontSize: '12px', padding: '2px 8px' }}
                    >
                      Reintentar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmModal
        isOpen={retryModal.isOpen}
        onClose={() => setRetryModal({ isOpen: false, logId: null })}
        onConfirm={handleConfirmRetry}
        title="Reintentar pipeline"
        message="¿Confirmar reintento del proceso ETL fallido?"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  )
}
