/**
 * UniqueClientsReport — UC_RPT_17 (clientes unicos).
 * Marker canonico alineado con apps/reports/analytics_views.py.
 */
import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsGateway'

const COLUMNS = [
  { key: 'trimestre',       label: 'Trimestre' },
  { key: 'segmento',        label: 'Segmento' },
  { key: 'clientes_unicos', label: 'Clientes únicos' },
]

const TRIMESTRES = ['', 'Q01_25', 'Q02_25', 'Q03_25']

const DEFAULT_FILTERS = { trimestre: '' }

// Genera URL compartible para el reporte — utilidad client-side (sin API)
function buildShareUrl(reportType, filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
  )
  const query = params.toString()
  return `${window.location.origin}/reports/${reportType}${query ? '?' + query : ''}`
}

export default function UniqueClientsReport() {
  const dispatch = useDispatch()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shareModal, setShareModal] = useState({ isOpen: false, url: '' })

  const loadData = useCallback(async (f = filters) => {
    setLoading(true)
    setError(null)
    try {
      const res = await reportsService.getUniqueClientsReport(f.trimestre ? { trimestre: f.trimestre } : {})
      setData(Array.isArray(res) ? res : (res?.results ?? res?.data ?? []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { loadData() }, [loadData])

  function handleReset() { setFilters(DEFAULT_FILTERS); loadData(DEFAULT_FILTERS) }

  async function handleSaveView() {
    const name = window.prompt('Nombre para esta vista:')
    if (!name) return
    try {
      const { saveFilter } = await import('../../redux/slices/savedFilters')
      dispatch(saveFilter({ name, filters }))
    } catch (_) { /* saveFilter is optional */ }
  }

  function handleShare() {
    const url = buildShareUrl('unique-clients', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reporte de clientes únicos</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>

      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />

      <div className="filter-bar" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', margin: '12px 0' }}>
        <div>
          <label htmlFor="uc-filter-trimestre" style={{ display: 'block', marginBottom: 4 }}>Trimestre</label>
          <select
            id="uc-filter-trimestre"
            value={filters.trimestre}
            onChange={(e) => { const trimesterValue = e.target.value; setFilters({ trimestre: trimesterValue }); loadData({ trimestre: trimesterValue }) }}
          >
            {TRIMESTRES.map((t) => <option key={t} value={t}>{t || 'Todos'}</option>)}
          </select>
        </div>
      </div>

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
