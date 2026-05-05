import React, { useEffect, useState } from 'react'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportTable from '../../components/reports/ReportTable'
import reportsService from '../../services/reportsService'
import apiService from '../../services/apiService'

const COLUMNS = [
  { key: 'campaign', label: 'Campaña' },
  { key: 'calls_made', label: 'Llamadas realizadas' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'success_rate_pct', label: '% Éxito' },
]

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '' }

export default function CampaignsReportPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadData(f = filters) {
    setLoading(true)
    setError(null)
    try {
      const res = await reportsService.getCampaignsReport({ date_from: f.dateFrom, date_to: f.dateTo })
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

  return (
    <div className="page-container">
      <div className="page-header"><h1>Reporte de campañas</h1></div>
      <ReportFilters filters={filters} onChange={handleChange} onApply={handleApply} onReset={handleReset} />
      {error && <div className="error-banner">{error}</div>}
      <ReportTable columns={COLUMNS} data={data} loading={loading} />
    </div>
  )
}
