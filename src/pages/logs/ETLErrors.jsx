import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPipelineErrors,
  selectPipelineErrors,
  selectLogsLoading,
  selectLogsError,
} from '@store/slices/logs'
import ReportTable from '@ui/reports/ReportTable'
import SelectDropdown from '@ui/DateTimeInputs/SelectDropdown'

const ERROR_TYPE_OPTIONS = [
  { value: 'TIMEOUT',         label: 'TIMEOUT' },
  { value: 'DATA_VALIDATION', label: 'DATA_VALIDATION' },
]

const ERROR_TYPE_BADGE = {
  TIMEOUT:         'badge-danger',
  DATA_VALIDATION: 'badge-warning',
}

const COLUMNS = [
  { key: 'pipeline_name', label: 'Pipeline' },
  { key: 'trimestre',     label: 'Trimestre' },
  {
    key: 'error_type',
    label: 'Tipo de error',
    render: (tipo) => (
      <span className={`badge ${ERROR_TYPE_BADGE[tipo] ?? 'badge-secondary'}`}>
        {tipo ?? '—'}
      </span>
    ),
  },
  { key: 'error_message',  label: 'Mensaje' },
  { key: 'correlation_id', label: 'Correlation ID' },
]

export default function ETLErrors() {
  const dispatch = useDispatch()
  const errors = useSelector(selectPipelineErrors)
  const loading = useSelector(selectLogsLoading)
  const error = useSelector(selectLogsError)

  const [errorType, setErrorType] = useState(null)
  const [trimestre, setTrimestre] = useState('')

  function buildParams() {
    const p = {}
    if (errorType?.value) p.error_type = errorType.value
    if (trimestre.trim()) p.trimestre = trimestre.trim()
    return p
  }

  useEffect(() => {
    dispatch(fetchPipelineErrors())
  }, [dispatch])

  function handleApply() {
    dispatch(fetchPipelineErrors(buildParams()))
  }

  function handleClear() {
    setErrorType(null)
    setTrimestre('')
    dispatch(fetchPipelineErrors())
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Errores del Pipeline ETL</h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
          UC-PIP-02 — Ejecuciones fallidas del ETL de Analytics
        </p>
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
          {typeof error === 'string' ? error : error.message ?? 'Error al cargar errores del pipeline'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ minWidth: '200px' }}>
          <SelectDropdown
            label="Tipo de error"
            options={ERROR_TYPE_OPTIONS}
            value={errorType}
            onChange={setErrorType}
            placeholder="Todos"
            isClearable
          />
        </div>
        <div>
          <label htmlFor="etl-errors-trimestre" style={{ display: 'block', marginBottom: 4, fontSize: '13px', color: '#9ca3af' }}>
            Trimestre
          </label>
          <input
            id="etl-errors-trimestre"
            type="text"
            placeholder="ej. Q1_26"
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px' }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleApply}>Aplicar</button>
        <button className="btn btn-secondary" onClick={handleClear}>Limpiar</button>
      </div>

      <ReportTable
        columns={COLUMNS}
        data={errors}
        loading={loading && errors.length === 0}
        emptyMessage="No hay errores de pipeline para los filtros seleccionados."
      />
    </div>
  )
}
