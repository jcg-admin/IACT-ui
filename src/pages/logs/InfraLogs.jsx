import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInfraLogs, selectInfraLogs, selectLogsLoading } from '../../redux/slices/logsSlice'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

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

      {loading ? (
        <LoadingSpinner message="Cargando logs de infraestructura..." />
      ) : infraLogs.length === 0 ? (
        <div className="empty-state">No hay logs de infraestructura.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Componente</th>
              <th>Nivel</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {infraLogs.map((log, i) => (
              <tr key={log.id ?? i}>
                <td>{log.timestamp}</td>
                <td>{log.component}</td>
                <td>{log.level}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
