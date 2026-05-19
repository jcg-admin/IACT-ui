import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLogs, selectLogs } from '../../redux/slices/logs'
import { selectIsLoading } from '../../redux/slices/loading'
import ReportTable from '../../components/reports/ReportTable'

const BADGE_CLASS = { ERROR: 'badge-danger', WARNING: 'badge-warning', INFO: 'badge-info' }

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'level', label: 'Nivel', render: (level) => <span className={`badge ${BADGE_CLASS[level] ?? 'badge'}`}>{level}</span> },
  { key: 'message', label: 'Mensaje' },
  { key: 'source', label: 'Fuente' },
]

export default function Logs() {
  const dispatch = useDispatch()
  const logs = useSelector(selectLogs)
  const loading = useSelector(selectIsLoading('logs'))

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

      <ReportTable
        columns={COLUMNS}
        data={logs}
        loading={loading}
        emptyMessage="No hay logs para los filtros seleccionados."
      />
    </div>
  )
}
