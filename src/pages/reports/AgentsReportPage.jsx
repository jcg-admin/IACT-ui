import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportTable from '../../components/reports/ReportTable'
import reportsService from '../../services/reportsService'

const COLUMNS = [
  { key: 'agent', label: 'Agente' },
  { key: 'calls_answered', label: 'Llamadas atendidas' },
  { key: 'avg_time', label: 'Tiempo promedio' },
  { key: 'satisfaction', label: 'Satisfacción' },
]

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '' }

export default function AgentsReportPage() {
  const dispatch = useDispatch()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadData(f = filters) {
    setLoading(true)
    setError(null)
    try {
      const res = await reportsService.getAgentsReport({ date_from: f.dateFrom, date_to: f.dateTo })
      setData(res?.results ?? res ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleChange(key, value) { setFilters((prev) => ({ ...prev, [key]: value })) }
  function handleApply() { loadData(filters) }
  function handleReset() { setFilters(DEFAULT_FILTERS); loadData(DEFAULT_FILTERS) }

  async function handleSaveView() {
    const name = window.prompt('Nombre para esta vista:')
    if (!name) return
    try {
      const { saveFilter } = await import('../../redux/slices/savedFiltersSlice')
      dispatch(saveFilter({ name, filters }))
    } catch (_) { /* saveFilter is optional — ignore if slice missing */ }
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reporte de agentes</h1>
        <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
      </div>
      <ReportFilters filters={filters} onChange={handleChange} onApply={handleApply} onReset={handleReset} />
      {error && <div className="error-banner">{error}</div>}
      <ReportTable columns={COLUMNS} data={data} loading={loading} />
    </div>
  )
}
