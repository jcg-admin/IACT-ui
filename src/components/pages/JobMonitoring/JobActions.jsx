/**
 * JobActions Component
 * 
 * Action buttons for job operations
 */

import React from 'react'

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
