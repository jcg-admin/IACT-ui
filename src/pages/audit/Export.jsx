/**
 * Export.jsx — IACT v2
 * UC_AUD_03: Exportar logs de auditoría.
 *
 * CORRECCIÓN T4.3:
 *   ANTES: auditService.exportLogs() directo — esperaba blob (incorrecto en T1.6).
 *   DESPUÉS: dispatch(exportAuditLogs()) → retorna { job_id } — modelo async.
 *            El usuario recibe un job_id para seguimiento; no descarga directamente.
 *
 * CNST-009: Los logs de auditoría no se modifican ni se eliminan.
 */
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportAuditLogs,
  selectLoading,
  selectError,
  selectExportJobId,
} from '../../redux/slices/audit'

export default function Export() {
  const dispatch   = useDispatch()
  const loading    = useSelector(selectLoading)
  const error      = useSelector(selectError)
  const exportJobId = useSelector(selectExportJobId)

  const [exportConfig, setExportConfig] = useState({
    format:           'csv',
    dateStart:        '',
    dateEnd:          '',
    includeDetails:   true,
    includeSignature: false,
    compression:      false,
  })

  const handleExport = async () => {
    if (!exportConfig.dateStart || !exportConfig.dateEnd) {
      alert('Especifica rango de fechas')
      return
    }
    const filters = {
      date_start:        exportConfig.dateStart,
      date_end:          exportConfig.dateEnd,
      include_details:   exportConfig.includeDetails,
      include_signature: exportConfig.includeSignature,
    }
    await dispatch(exportAuditLogs({ format: exportConfig.format, filters }))
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
          Exportar Logs
        </h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          UC_AUD_03 — Exportar registros de auditoría (async — entrega job_id)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Panel izquierdo — Configuración */}
        <div style={{ padding: '16px', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Configuración</h2>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Formato</label>
            <select
              value={exportConfig.format}
              onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '12px' }}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Desde</label>
              <input
                type="date"
                value={exportConfig.dateStart}
                onChange={(e) => setExportConfig({ ...exportConfig, dateStart: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Hasta</label>
              <input
                type="date"
                value={exportConfig.dateEnd}
                onChange={(e) => setExportConfig({ ...exportConfig, dateEnd: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            {[
              ['includeDetails',   'Incluir detalles completos'],
              ['includeSignature', 'Incluir firma digital (CNST-009)'],
              ['compression',      'Comprimir archivo'],
            ].map(([field, label]) => (
              <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#1f2937', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#fff', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={exportConfig[field]}
                  onChange={(e) => setExportConfig({ ...exportConfig, [field]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={handleExport}
            disabled={!exportConfig.dateStart || !exportConfig.dateEnd || loading}
            style={{
              width: '100%', padding: '12px', border: 'none', borderRadius: '4px',
              color: '#fff', cursor: !exportConfig.dateStart || !exportConfig.dateEnd ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: 600,
              backgroundColor: !exportConfig.dateStart || !exportConfig.dateEnd ? '#6b7280' : '#10b981',
            }}
          >
            {loading ? 'Solicitando exportación…' : 'Exportar'}
          </button>

          {error && (
            <div role="alert" className="error-banner" style={{ marginTop: '12px' }}>
              Error: {typeof error === 'object' ? error.message : error}
            </div>
          )}
        </div>

        {/* Panel derecho — Estado del job */}
        <div style={{ padding: '16px', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Estado de la exportación</h2>

          {exportJobId ? (
            <div style={{ padding: '12px', backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '4px', color: '#6ee7b7', fontSize: '13px' }}>
              <strong>Exportación encolada.</strong>
              <div style={{ marginTop: '8px' }}>
                Job ID: <code style={{ backgroundColor: '#065f46', padding: '2px 6px', borderRadius: '3px' }}>{exportJobId}</code>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#a7f3d0' }}>
                El archivo estará disponible cuando el job complete. Consulta el estado en la sección de jobs de exportación.
              </p>
            </div>
          ) : (
            <div style={{ padding: '24px', backgroundColor: '#1f2937', borderRadius: '4px', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>
              La exportación se procesa de forma asíncrona. Al solicitar, recibirás un job_id para seguimiento.
            </div>
          )}

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '4px', fontSize: '12px', color: '#9ca3af' }}>
            <strong style={{ color: '#d1d5db' }}>CNST-009:</strong> Los logs de auditoría son inmutables. La exportación genera una copia de solo lectura.
          </div>
        </div>
      </div>
    </div>
  )
}
