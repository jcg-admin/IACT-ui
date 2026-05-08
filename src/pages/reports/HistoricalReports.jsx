import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsService'

const COLUMNS = [
  { key: 'periodo',         label: 'Periodo' },
  { key: 'fecha_inicio',    label: 'Fecha inicio' },
  { key: 'fecha_fin',       label: 'Fecha fin' },
  { key: 'segmento',        label: 'Segmento' },
  { key: 'dimension',       label: 'Dimensión' },
  { key: 'total_llamadas',  label: 'Total llamadas' },
]

const PERIODOS = [
  { value: 'last_24h',    label: 'Últimas 24h' },
  { value: 'last_7d',     label: 'Últimos 7 días' },
  { value: 'last_30d',    label: 'Últimos 30 días' },
  { value: 'last_90d',    label: 'Últimos 90 días' },
  { value: 'year-to-date', label: 'Year-to-date' },
  { value: 'custom',      label: 'Personalizado' },
]

const SEGMENTOS = ['Nacional', 'Puebla']

const DEFAULT_FILTERS = { periodo: 'last_7d', segmento: '' }

export default function HistoricalReports() {
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
      const res = await reportsService.getReportHistory(f)
      setData(Array.isArray(res) ? res : (res?.results ?? res?.data ?? []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleChange(key, value) { setFilters((prev) => ({ ...prev, [key]: value })) }

  async function handleSaveView() {
    const name = window.prompt('Nombre para esta vista:')
    if (!name) return
    try {
      const { saveFilter } = await import('../../redux/slices/savedFiltersSlice')
      dispatch(saveFilter({ name, filters }))
    } catch (_) { /* saveFilter is optional */ }
  }

  function handleShare() {
    const url = reportsService.generateShareUrl('history', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reportes históricos</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>

      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />

      <div className="filter-bar" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', margin: '12px 0' }}>
        <div>
          <label htmlFor="hist-filter-periodo" style={{ display: 'block', marginBottom: 4 }}>Periodo</label>
          <select
            id="hist-filter-periodo"
            value={filters.periodo}
            onChange={(e) => handleChange('periodo', e.target.value)}
          >
            {PERIODOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="hist-filter-segmento" style={{ display: 'block', marginBottom: 4 }}>Segmento</label>
          <select
            id="hist-filter-segmento"
            value={filters.segmento}
            onChange={(e) => handleChange('segmento', e.target.value)}
          >
            <option value="">Todos</option>
            {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => loadData(filters)}>Aplicar</button>
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
