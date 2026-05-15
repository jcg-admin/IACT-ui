import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsGateway'

const COLUMNS = [
  { key: 'cMenu',                    label: 'Menú IVR' },
  { key: 'total_llamadas',           label: 'Total llamadas' },
  { key: 'promedio_llamadas',        label: 'Prom. llamadas/cliente' },
  { key: 'min_llamadas_x_cliente',   label: 'Mín. llamadas' },
  { key: 'max_llamadas_x_cliente',   label: 'Máx. llamadas' },
]

const TRIMESTRES = ['Q01_25', 'Q02_25', 'Q03_25']
const SEGMENTOS  = ['Nacional', 'Puebla']

const DEFAULT_FILTERS = { trimestre: 'Q01_25', segmento: 'Nacional' }

// Genera URL compartible para el reporte — utilidad client-side (sin API)
function buildShareUrl(reportType, filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
  )
  const query = params.toString()
  return `${window.location.origin}/reports/${reportType}${query ? '?' + query : ''}`
}

export default function IVRMenusReport() {
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
      const res = await reportsService.getIVRMenusReport({ trimestre: f.trimestre, segmento: f.segmento })
      setData(Array.isArray(res) ? res : (res?.results ?? res?.data ?? []))
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
      const { saveFilter } = await import('../../redux/slices/savedFilters')
      dispatch(saveFilter({ name, filters }))
    } catch (_) { /* saveFilter is optional */ }
  }

  function handleShare() {
    const url = buildShareUrl('ivr-menus', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Distribución de menús IVR</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>

      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />

      <div className="filter-bar" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', margin: '12px 0' }}>
        <div>
          <label htmlFor="ivr-filter-trimestre" style={{ display: 'block', marginBottom: 4 }}>Trimestre</label>
          <select
            id="ivr-filter-trimestre"
            value={filters.trimestre}
            onChange={(e) => handleChange('trimestre', e.target.value)}
          >
            {TRIMESTRES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="ivr-filter-segmento" style={{ display: 'block', marginBottom: 4 }}>Segmento</label>
          <select
            id="ivr-filter-segmento"
            value={filters.segmento}
            onChange={(e) => handleChange('segmento', e.target.value)}
          >
            {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

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
