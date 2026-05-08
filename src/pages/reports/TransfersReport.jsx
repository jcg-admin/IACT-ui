import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportTable from '../../components/reports/ReportTable'
import SavedFiltersPanel from '../../components/reports/SavedFiltersPanel'
import ShareReportModal from '../../components/reports/ShareReportModal'
import reportsService from '../../services/reportsService'

const COLUMNS = [
  { key: 'centro_transferencia', label: 'Centro de transferencia' },
  { key: 'menu',                 label: 'Menú IVR' },
  { key: 'opcion',               label: 'Opción' },
  { key: 'total_llamadas',       label: 'Total llamadas' },
  { key: 'porcentaje',           label: '% del total' },
  { key: 'misma_linea',          label: 'Misma línea' },
  { key: 'linea_diferente',      label: 'Línea diferente' },
  { key: 'no_digito_telefono',   label: 'Sin dígito tel.' },
]

const TRIMESTRES = ['Q01_25', 'Q02_25', 'Q03_25']
const SEGMENTOS  = ['Nacional', 'Puebla']

const DEFAULT_FILTERS = { trimestre: 'Q01_25', segmento: 'Nacional', fecha: '' }

export default function TransfersReport() {
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
      const res = await reportsService.getTransfersByCentro({ trimestre: f.trimestre, segmento: f.segmento, ...(f.fecha ? { fecha: f.fecha } : {}) })
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
    const url = reportsService.generateShareUrl('transfers', filters)
    setShareModal({ isOpen: true, url })
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reporte de transferencias por centro</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleShare}>Compartir</button>
          <button className="btn btn-secondary" onClick={handleSaveView}>Guardar vista</button>
        </div>
      </div>

      <SavedFiltersPanel onApply={(f) => { setFilters(f); loadData(f) }} />

      <div className="filter-bar" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', margin: '12px 0' }}>
        <div>
          <label htmlFor="filter-trimestre" style={{ display: 'block', marginBottom: 4 }}>Trimestre</label>
          <select
            id="filter-trimestre"
            value={filters.trimestre}
            onChange={(e) => handleChange('trimestre', e.target.value)}
          >
            {TRIMESTRES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="filter-segmento" style={{ display: 'block', marginBottom: 4 }}>Segmento</label>
          <select
            id="filter-segmento"
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
