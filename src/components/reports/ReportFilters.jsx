import React from 'react'
import PropTypes from 'prop-types'

export default function ReportFilters({ filters, onChange, onApply, onReset }) {
  return (
    <div className="report-filters" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' }}>
      <div>
        <label>Desde</label>
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange('dateFrom', e.target.value)}
        />
      </div>
      <div>
        <label>Hasta</label>
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange('dateTo', e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={onApply}>Aplicar</button>
      <button className="btn btn-secondary" onClick={onReset}>Limpiar</button>
    </div>
  )
}
ReportFilters.propTypes = {
  filters:  PropTypes.object,
  onChange: PropTypes.func,
  onApply:  PropTypes.func,
  onReset:  PropTypes.func,
}
