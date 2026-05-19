import React from 'react'
import LoadingSpinner from '../shared/LoadingSpinner'
import PropTypes from 'prop-types'

export default function ReportTable({ columns, data, loading, emptyMessage = 'No hay datos para el período seleccionado.' }) {
  if (loading) return <LoadingSpinner message="Cargando..." />
  if (!data || data.length === 0) return <div className="empty-state">{emptyMessage}</div>

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.id ?? i}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
ReportTable.propTypes = {
  columns:      PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, label: PropTypes.string })).isRequired,
  data:         PropTypes.array.isRequired,
  loading:      PropTypes.bool,
  emptyMessage: PropTypes.string,
}
