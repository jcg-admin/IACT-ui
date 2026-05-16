/**
 * ExportOptions Component
 * 
 * Configure export format and options
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function ExportOptions({ selectedFormat, onFormatChange }) {
  return (
    <div className="export-options">
      <div className="option-group">
        <label>Format</label>
        <div className="format-buttons">
          <button
            onClick={() => onFormatChange('xlsx')}
            className={`format-btn ${selectedFormat === 'xlsx' ? 'active' : ''}`}
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => onFormatChange('csv')}
            className={`format-btn ${selectedFormat === 'csv' ? 'active' : ''}`}
          >
            CSV (.csv)
          </button>
          <button
            onClick={() => onFormatChange('pdf')}
            className={`format-btn ${selectedFormat === 'pdf' ? 'active' : ''}`}
          >
            PDF (.pdf)
          </button>
        </div>
      </div>

      <div className="option-group">
        <label>
          <input type="checkbox" defaultChecked /> Include Headers
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Format Dates
        </label>
        <label>
          <input type="checkbox" /> Compress File
        </label>
      </div>
    </div>
  )
}
ExportOptions.propTypes = {
  selectedFormat: PropTypes.string,
  onFormatChange: PropTypes.func.isRequired,
}
