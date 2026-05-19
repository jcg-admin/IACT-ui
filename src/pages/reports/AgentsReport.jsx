import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsGateway'
import { buildShareUrl } from '../../utils/reportShareUrl'

const COLUMNS = [
  { key: 'cMenu',                  label: 'Menú IVR' },
  { key: 'trimestre',              label: 'Trimestre' },
  { key: 'segmento',               label: 'Segmento' },
  { key: 'total_llamadas',         label: 'Total llamadas' },
  { key: 'promedio_llamadas',      label: 'Prom. llamadas/cliente' },
  { key: 'min_llamadas_x_cliente', label: 'Mín. llamadas' },
  { key: 'max_llamadas_x_cliente', label: 'Máx. llamadas' },
]

const TRIMESTRES = ['Q01_25', 'Q02_25', 'Q03_25']
const SEGMENTOS  = ['Nacional', 'Puebla']
const DEFAULT_FILTERS = { trimestre: 'Q01_25', segmento: 'Nacional' }

export default function AgentsReport() {
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
      const res = await reportsService.getAgentsReport({ trimestre: f.trimestre, segmento: f.segmento })
      setData(res ?? [])
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
    } catch (_) { /* guardar vista es opcional — fallo no interrumpe al usuario */ }
  }

  function handleShare() {
    const url = buildShareUrl('/reports/agents', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reporte de agentes IVR</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>
      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />
      <div className="filters-bar" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor="agents-filter-trimestre">Trimestre</label>
          <select
            id="agents-filter-trimestre"
            value={filters.trimestre}
            onChange={(e) => setFilters((p) => ({ ...p, trimestre: e.target.value }))}
          >
            {TRIMESTRES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="agents-filter-segmento">Segmento</label>
          <select
            id="agents-filter-segmento"
            value={filters.segmento}
            onChange={(e) => setFilters((p) => ({ ...p, segmento: e.target.value }))}
          >
            {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => loadData(filters)}>Aplicar</button>
        <button className="btn btn-secondary" onClick={handleReset}>Restablecer</button>
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
