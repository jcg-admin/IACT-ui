/**
 * ExportHistory Component
 * 
 * Display past exports
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function ExportHistory({ exports }) {
  if (exports.length === 0) {
    return (
      <div className="export-history empty">
        <h3>Export History</h3>
        <p>No exports yet</p>
      </div>
    )
  }

  return (
    <div className="export-history">
      <h3>Export History</h3>
      <div className="history-list">
        {exports.map((exp) => (
          <div key={exp.id} className="history-item">
            <div className="item-header">
              <span className="type-badge">{exp.type}</span>
              <span className="format-badge">{exp.format}</span>
            </div>
            <div className="item-details">
              <span>{exp.rows} rows</span>
              <span>{exp.size}</span>
              <span>{new Date(exp.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
ExportHistory.propTypes = {
  exports: PropTypes.array,
}
