import React from 'react'
import PropTypes from 'prop-types'

function PreviewResults({ data }) {
  const _recordCount = Math.floor(Math.random() * 1000) + 100

  return (
    <div className="content-preview-results">
      <h3>Preview de Resultados</h3>
      <div className="preview-info">
        <p><strong>Registros a exportar:</strong> {_recordCount}</p>
        <p><strong>Rango de fechas:</strong> {data.startDate} a {data.endDate}</p>
        <p><strong>Estado filtrado:</strong> {data.status || 'Todos'}</p>
        <p><strong>Formato:</strong> {data.format?.toUpperCase() || 'CSV'}</p>
      </div>
      <div className="preview-sample">
        <p>Muestra de datos:</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td>Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

PreviewResults.propTypes = {
  data: PropTypes.object
}

export default PreviewResults
