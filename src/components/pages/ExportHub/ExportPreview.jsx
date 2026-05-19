/**
 * ExportPreview Component
 * 
 * Preview data before export
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function ExportPreview({ preview }) {
  return (
    <div className="export-preview">
      <h3>Preview</h3>
      <div className="preview-stats">
        <div className="stat">
          <span className="label">Type:</span>
          <span className="value">{preview.type.toUpperCase()}</span>
        </div>
        <div className="stat">
          <span className="label">Rows:</span>
          <span className="value">{preview.rowCount}</span>
        </div>
        <div className="stat">
          <span className="label">Columns:</span>
          <span className="value">{preview.columnCount}</span>
        </div>
      </div>

      <div className="preview-table">
        <table>
          <thead>
            <tr>
              {preview.sample.length > 0 &&
                Object.keys(preview.sample[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {preview.sample.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{String(val).substring(0, 20)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
ExportPreview.propTypes = {
  preview: PropTypes.object,
}
