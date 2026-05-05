import React from 'react'

export default function ReportTable({ columns, data, loading, emptyMessage = 'No hay datos para el período seleccionado.' }) {
  if (loading) return <div className="loading-state">Cargando...</div>
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
