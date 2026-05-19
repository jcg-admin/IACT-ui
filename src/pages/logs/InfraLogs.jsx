import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInfraLogs, selectInfraLogs, selectLogsLoading } from '../../redux/slices/logs'
import ReportTable from '../../components/reports/ReportTable'

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'component', label: 'Componente' },
  { key: 'level', label: 'Nivel' },
  { key: 'message', label: 'Mensaje' },
]

export default function InfraLogs() {
  const dispatch = useDispatch()
  const infraLogs = useSelector(selectInfraLogs)
  const loading = useSelector(selectLogsLoading)

  const [component, setComponent] = useState('')

  useEffect(() => {
    dispatch(fetchInfraLogs())
  }, [dispatch])

  function handleApply() {
    dispatch(fetchInfraLogs({ component: component || undefined }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Logs de infraestructura</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div>
          <label>Componente</label>
          <select value={component} onChange={(e) => setComponent(e.target.value)}>
            <option value="">Todos</option>
            <option value="server">Server</option>
            <option value="network">Network</option>
            <option value="db">Base de datos</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleApply}>Aplicar</button>
      </div>

      <ReportTable
        columns={COLUMNS}
        data={infraLogs}
        loading={loading}
        emptyMessage="No hay logs de infraestructura."
      />
    </div>
  )
}
