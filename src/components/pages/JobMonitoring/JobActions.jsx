/**
 * JobActions Component
 * 
 * Action buttons for job operations
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function JobActions({ job, onCancel, onViewDetails }) {
  return (
    <div className="job-actions">
      <button
        onClick={onViewDetails}
        className="btn-action btn-details"
      >
        Details
      </button>
      {job.status === 'running' && (
        <button
          onClick={onCancel}
          className="btn-action btn-cancel"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
JobActions.propTypes = {
  job:           PropTypes.object.isRequired,
  onCancel:      PropTypes.func,
  onViewDetails: PropTypes.func,
}
