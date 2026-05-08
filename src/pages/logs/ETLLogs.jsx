import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchETLLogs, retryPipeline, selectETLLogs } from '@store/slices/logs'
import { selectIsLoading } from '@store/slices/loading'
import ReportTable from '@ui/reports/ReportTable'

const STATUS_BADGE = { success: 'badge-success', failed: 'badge-danger', running: 'badge-warning' }
const MOTIVO_MIN = 20
const MOTIVO_MAX = 500

export default function ETLLogs() {
  const dispatch = useDispatch()
  const etlLogs = useSelector(selectETLLogs)
  const loading = useSelector(selectIsLoading('logs'))

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')
  const [retryModal, setRetryModal] = useState({ isOpen: false, logId: null, motivo: '', error: null })

  useEffect(() => {
    dispatch(fetchETLLogs())
  }, [dispatch])

  function handleApply() {
    dispatch(fetchETLLogs({ date_from: dateFrom, date_to: dateTo, status: status || undefined }))
  }

  function openRetryModal(logId) {
    setRetryModal({ isOpen: true, logId, motivo: '', error: null })
  }

  function closeRetryModal() {
    setRetryModal({ isOpen: false, logId: null, motivo: '', error: null })
  }

  async function handleConfirmRetry() {
    const { logId, motivo } = retryModal
    if (motivo.length < MOTIVO_MIN) {
      setRetryModal(m => ({ ...m, error: `El motivo debe tener al menos ${MOTIVO_MIN} caracteres.` }))
      return
    }
    try {
      await dispatch(retryPipeline({ logId, motivo })).unwrap()
      closeRetryModal()
    } catch (err) {
      const msg = err?.statusCode === 409
        ? 'Ya hay una ejecución activa. Intenta más tarde.'
        : err?.message ?? 'Error al reintentar el pipeline.'
      setRetryModal(m => ({ ...m, error: msg }))
    }
  }

  const columns = [
    { key: 'timestamp',          label: 'Timestamp' },
    { key: 'process',            label: 'Proceso' },
    {
      key: 'status',
      label: 'Estado',
      render: (s) => <span className={`badge ${STATUS_BADGE[s] ?? 'badge'}`}>{s}</span>,
    },
    { key: 'duration',           label: 'Duración' },
    { key: 'records_processed',  label: 'Registros' },
    {
      key: 'id',
      label: '',
      render: (id, row) => row.status === 'failed'
        ? (
          <button
            className="btn btn-secondary"
            onClick={() => openRetryModal(id)}
            style={{ fontSize: '12px', padding: '2px 8px' }}
          >
            Reintentar
          </button>
        )
        : null,
    },
  ]

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

      <ReportTable
        columns={columns}
        data={etlLogs}
        loading={loading}
        emptyMessage="No hay logs ETL para los filtros seleccionados."
      />

      {retryModal.isOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="retry-modal-title" className="modal-overlay">
          <div className="modal-content">
            <h2 id="retry-modal-title">Reintentar pipeline</h2>
            <p>Ingresa el motivo del reintento manual.</p>
            <textarea
              aria-label="Motivo del reintento"
              placeholder={`Razón del reintento (mínimo ${MOTIVO_MIN} caracteres)`}
              value={retryModal.motivo}
              onChange={e => setRetryModal(m => ({ ...m, motivo: e.target.value, error: null }))}
              maxLength={MOTIVO_MAX}
              rows={3}
              style={{ width: '100%', marginBottom: '4px' }}
            />
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
              {retryModal.motivo.length}/{MOTIVO_MAX} caracteres
            </div>
            {retryModal.error && (
              <div role="alert" style={{ color: '#ef4444', marginBottom: '8px', fontSize: '13px' }}>
                {retryModal.error}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={closeRetryModal}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmRetry}
                disabled={retryModal.motivo.length < MOTIVO_MIN}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
