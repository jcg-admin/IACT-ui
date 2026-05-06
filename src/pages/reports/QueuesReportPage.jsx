import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsService'

const COLUMNS = [
  { key: 'queue', label: 'Cola' },
  { key: 'incoming_calls', label: 'Llamadas entrantes' },
  { key: 'avg_wait_time', label: 'Tiempo espera promedio' },
  { key: 'abandon_pct', label: '% Abandono' },
]

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '' }

export default function QueuesReportPage() {
  const dispatch = useDispatch()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shareModal, setShareModal] = useState({ isOpen: false, url: '' })

  async function loadData(f = filters) {
    setLoading(true)
    setError(null)
    try {
      const res = await reportsService.getQueuesReport({ date_from: f.dateFrom, date_to: f.dateTo })
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
    } catch (_) { /* saveFilter is optional */ }
  }

  function handleShare() {
    const url = reportsService.generateShareUrl('queues', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reporte de colas</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>
      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />
      <ReportFilters filters={filters} onChange={handleChange} onApply={handleApply} onReset={handleReset} />
      {error && <div className="error-banner">{error}</div>}
      <ReportTable columns={COLUMNS} data={data} loading={loading} />
      <ShareReportModal
        isOpen={shareModal.isOpen}
        url={shareModal.url}
        onClose={() => setShareModal({ isOpen: false, url: '' })}
      />
    </div>
  )
}
