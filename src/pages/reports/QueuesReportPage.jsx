import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsService'

const COLUMNS = [
  { key: 'centro_transferencia', label: 'Centro de transferencia' },
  { key: 'trimestre',            label: 'Trimestre' },
  { key: 'segmento',             label: 'Segmento' },
  { key: 'total_llamadas',       label: 'Total llamadas' },
  { key: 'misma_linea',          label: 'Misma línea' },
  { key: 'linea_diferente',      label: 'Línea diferente' },
  { key: 'no_digito_telefono',   label: 'Sin dígito tel.' },
]

const TRIMESTRES = ['Q01_25', 'Q02_25', 'Q03_25']
const SEGMENTOS  = ['Nacional', 'Puebla']
const DEFAULT_FILTERS = { trimestre: 'Q01_25', segmento: 'Nacional' }

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
      const res = await reportsService.getQueuesReport({ trimestre: f.trimestre, segmento: f.segmento })
      setData(res ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleReset() { setFilters(DEFAULT_FILTERS); loadData(DEFAULT_FILTERS) }

  async function handleSaveView() {
    const name = window.prompt('Nombre para esta vista:')
    if (!name) return
    try {
      const { saveFilter } = await import('../../redux/slices/savedFiltersSlice')
      dispatch(saveFilter({ name, filters }))
    } catch (_) {}
  }

  function handleShare() {
    const url = reportsService.generateShareUrl('queues', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reporte de colas de transferencia</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>
      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />
      <div className="filters-bar" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label htmlFor="queues-filter-trimestre">Trimestre</label>
          <select
            id="queues-filter-trimestre"
            value={filters.trimestre}
            onChange={(e) => setFilters((p) => ({ ...p, trimestre: e.target.value }))}
          >
            {TRIMESTRES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="queues-filter-segmento">Segmento</label>
          <select
            id="queues-filter-segmento"
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
