import React, { useState } from 'react'
import reportsService from '../../services/reportsService'

const REPORT_TYPES = [
  { value: 'agents',        label: 'Agentes IVR' },
  { value: 'queues',        label: 'Colas de transferencia' },
  { value: 'campaigns',     label: 'Campañas' },
  { value: 'transfers',     label: 'Transferencias por centro' },
  { value: 'ivr-menus',     label: 'Menús IVR' },
  { value: 'unique-clients', label: 'Clientes únicos' },
  { value: 'dashboard',     label: 'Dashboard (métricas)' },
]

const FORMATS = [
  { value: 'csv',  label: 'CSV' },
  { value: 'xlsx', label: 'XLSX (Excel)' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf',  label: 'PDF' },
]

export default function ReportExport() {
  const [type, setType] = useState('agents')
  const [format, setFormat] = useState('csv')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobId, setJobId] = useState(null)

  async function handleExport() {
    setLoading(true)
    setError(null)
    setJobId(null)
    try {
      const res = await reportsService.exportReport(type, format, {})
      setJobId(res?.job_id ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Exportar reporte</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-RPT-04 — Solicitar exportación asíncrona (CSV / XLSX / JSON / PDF)
        </p>
      </div>

      <div style={{ maxWidth: '480px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="export-tipo-reporte" style={{ display: 'block', marginBottom: 4 }}>
            Tipo de reporte
          </label>
          <select
            id="export-tipo-reporte"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: '100%' }}
          >
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="export-formato" style={{ display: 'block', marginBottom: 4 }}>
            Formato
          </label>
          <select
            id="export-formato"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ width: '100%' }}
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={loading}
          style={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Solicitando...' : 'Exportar'}
        </button>

        {error && (
          <div className="error-banner">{error}</div>
        )}

        {jobId && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#064e3b',
            border: '1px solid #065f46',
            borderRadius: '6px',
            color: '#a7f3d0',
            fontSize: '14px',
          }}>
            <strong>Exportación encolada.</strong> Job ID: <code>{jobId}</code>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6ee7b7' }}>
              El archivo estará disponible para descarga en los próximos minutos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
