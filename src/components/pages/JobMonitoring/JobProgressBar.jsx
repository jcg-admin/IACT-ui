/**
 * JobProgressBar Component
 * 
 * Visual progress indicator with metadata
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function JobProgressBar({ progress, status, rowsProcessed }) {
  return (
    <div className="job-progress-container">
      <div className="progress-bar">
        <div
          className={`progress-fill progress-${status}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-info">
        <span className="percentage">{progress}%</span>
        {rowsProcessed && (
          <span className="rows">{rowsProcessed.toLocaleString()} rows</span>
        )}
      </div>
    </div>
  )
}
JobProgressBar.propTypes = {
  progress:      PropTypes.number,
  status:        PropTypes.string,
  rowsProcessed: PropTypes.number,
}
