import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { exportLogs, selectLogsLoading } from '../../redux/slices/logs'

export default function LogExport() {
  const dispatch = useDispatch()
  const loading = useSelector(selectLogsLoading)

  const [form, setForm] = useState({ dateFrom: '', dateTo: '', type: 'sistema', format: 'CSV' })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess(false)
    setError(null)
    const result = await dispatch(exportLogs({
      date_from: form.dateFrom,
      date_to: form.dateTo,
      type: form.type,
      format: form.format,
    }))
    if (exportLogs.fulfilled.match(result)) {
      setSuccess(true)
    } else {
      setError(result.payload ?? 'Error al iniciar exportación')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Exportar logs</h1>
      </div>

      {success && (
        <div className="alert-success" style={{ marginBottom: '16px', padding: '12px', background: '#d1fae5', borderRadius: '4px' }}>
          Exportación iniciada. Recibirás el archivo por email.
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label>Desde</label>
          <input type="date" name="dateFrom" value={form.dateFrom} onChange={handleChange} style={{ display: 'block', width: '100%' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>Hasta</label>
          <input type="date" name="dateTo" value={form.dateTo} onChange={handleChange} style={{ display: 'block', width: '100%' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label>Tipo</label>
          <select name="type" value={form.type} onChange={handleChange} style={{ display: 'block', width: '100%' }}>
            <option value="sistema">Sistema</option>
            <option value="etl">ETL</option>
            <option value="infra">Infraestructura</option>
          </select>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label>Formato</label>
          <select name="format" value={form.format} onChange={handleChange} style={{ display: 'block', width: '100%' }}>
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Exportando...' : 'Exportar'}
        </button>
      </form>
    </div>
  )
}
