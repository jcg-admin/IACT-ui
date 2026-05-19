import React, { useState, useEffect, useRef } from 'react'
import reportsService from '../../services/reportsGateway'

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

const ERROR_MESSAGES = {
  ROW_LIMIT_EXCEEDED: 'El reporte supera el límite de filas exportables. Aplique filtros de fecha para reducir el rango.',
  EXPORT_LIMIT_EXCEEDED: 'Ya tiene exports activos en cola. Espere a que finalicen antes de solicitar uno nuevo.',
  PERMISSION_REVOKED: 'Su permiso de exportación fue revocado. Contacte al administrador.',
  TOO_LARGE: 'El dataset supera el límite de tamaño. Use filtros adicionales o solicite un formato más compacto.',
}

export default function ReportExport() {
  const [type, setType] = useState('agents')
  const [format, setFormat] = useState('csv')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const pollingRef = useRef(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup de intervalo al desmontar, sin deps intencional
  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  useEffect(() => {
    if (!jobId || jobStatus === 'done' || jobStatus === 'failed') return
    pollingRef.current = setInterval(async () => {
      try {
        const res = await reportsService.getExportJobStatus(jobId)
        setJobStatus(res.status)
        if (res.status === 'done') {
          setFileUrl(res.file_url)
          clearInterval(pollingRef.current)
        } else if (res.status === 'failed') {
          setError(res.error ?? 'La exportación falló')
          clearInterval(pollingRef.current)
        }
      } catch (err) {
        setError(err.message)
        clearInterval(pollingRef.current)
      }
    }, 3000)
    return () => clearInterval(pollingRef.current)
  }, [jobId])

  async function handleExport() {
    setLoading(true)
    setError(null)
    setJobId(null)
    setJobStatus(null)
    setFileUrl(null)
    try {
      const res = await reportsService.exportReport(type, format, {})
      setJobId(res?.job_id ?? null)
      setJobStatus('queued')
    } catch (err) {
      const code = err.code ?? err.data?.code
      setError(ERROR_MESSAGES[code] ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (pollingRef.current) clearInterval(pollingRef.current)
    await reportsService.cancelExport(jobId)
    setJobId(null)
    setJobStatus(null)
    setFileUrl(null)
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
          <div style={{ padding: '12px 16px', backgroundColor: '#1e3a5f', border: '1px solid #2563eb',
            borderRadius: '6px', fontSize: '14px', color: '#bfdbfe' }}>

            {jobStatus === 'done' ? (
              <>
                <strong style={{ color: '#a7f3d0' }}>✓ Exportación lista.</strong>
                {' '}Job ID: <code>{jobId}</code>
                <div style={{ marginTop: '12px' }}>
                  <a href={fileUrl} download className="btn btn-primary" style={{ fontSize: '13px' }}>
                    Descargar archivo
                  </a>
                </div>
              </>
            ) : jobStatus === 'failed' ? (
              <span style={{ color: '#fca5a5' }}>✗ La exportación falló. Intente nuevamente.</span>
            ) : (
              <>
                <strong>Exportación en progreso…</strong>
                {' '}Job ID: <code>{jobId}</code>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#93c5fd' }}>
                  {jobStatus === 'queued' ? 'En cola…' : 'Procesando…'}
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '8px', fontSize: '12px' }}
                  onClick={handleCancel}
                >
                  Cancelar exportación
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
