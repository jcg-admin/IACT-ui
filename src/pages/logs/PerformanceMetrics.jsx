import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPerformanceMetrics, selectPerformanceMetrics, selectLogsLoading } from '../../redux/slices/logs'
import ReportTable from '../../components/reports/ReportTable'

const COLUMNS = [
  { key: 'name', label: 'Métrica' },
  { key: 'value', label: 'Valor' },
  { key: 'unit', label: 'Unidad' },
  { key: 'threshold', label: 'Umbral' },
]

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

      <ReportTable
        columns={COLUMNS}
        data={metrics}
        loading={loading}
        emptyMessage="Sin métricas disponibles."
      />
    </div>
  )
}
