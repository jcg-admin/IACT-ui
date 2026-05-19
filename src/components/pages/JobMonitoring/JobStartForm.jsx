/**
 * JobStartForm Component
 * 
 * Form to configure and start a new job
 */

import React, { useState } from 'react'
import PropTypes from 'prop-types'

export default function JobStartForm({ onSubmit, onCancel }) {
  const [jobType, setJobType] = useState('export')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        id: `job-${Date.now()}`,
        type: jobType,
        name: `${jobType.charAt(0).toUpperCase() + jobType.slice(1)} Job`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="job-start-form">
      <div className="form-header">
        <h2>Start New Job</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="jobType">Job Type</label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="form-control"
          >
            <option value="export">Data Export</option>
            <option value="transform">Data Transformation</option>
            <option value="backup">Database Backup</option>
            <option value="sync">Data Sync</option>
            <option value="validation">Data Validation</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Starting...' : 'Start Job'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
JobStartForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
}
