import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPerformanceMetrics, selectPerformanceMetrics, selectLogsLoading } from '../../redux/slices/logs'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function PerformanceMetrics() {
  const dispatch = useDispatch()
  const performanceMetrics = useSelector(selectPerformanceMetrics)
  const loading = useSelector(selectLogsLoading)

  useEffect(() => {
    dispatch(fetchPerformanceMetrics())
  }, [dispatch])

  const metrics = performanceMetrics?.metrics ?? []

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Métricas de performance</h1>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando métricas..." />
      ) : metrics.length === 0 ? (
        <div className="empty-state">Sin métricas disponibles.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
              <th>Unidad</th>
              <th>Umbral</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={m.name ?? i}>
                <td>{m.name}</td>
                <td>{m.value}</td>
                <td>{m.unit}</td>
                <td>{m.threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
