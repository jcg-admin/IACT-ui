/**
 * JobList Component
 * 
 * Display completed/failed jobs in a table
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function JobList({ jobs, loading, onDownload, onRetry, onViewDetails }) {
  if (loading) {
    return <div className="job-list loading">Loading jobs...</div>
  }

  if (jobs.length === 0) {
    return <div className="job-list empty">No completed jobs yet.</div>
  }

  return (
    <div className="job-list">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Type</th>
            <th>Name</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Rows</th>
            <th>Duration</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className={`status-${job.status}`}>
              <td className="job-id">{job.id}</td>
              <td className="type">{job.type}</td>
              <td className="name">{job.name}</td>
              <td>
                <span className={`badge badge-${job.status}`}>
                  {job.status.toUpperCase()}
                </span>
              </td>
              <td className="progress">{job.progress}%</td>
              <td className="rows">{job.rowsProcessed?.toLocaleString() || '-'}</td>
              <td className="duration">{job.duration ? `${job.duration}s` : '-'}</td>
              <td className="created">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td className="actions">
                <button
                  onClick={() => onViewDetails(job)}
                  className="btn-action btn-details"
                >
                  View
                </button>
                {job.status === 'completed' && (
                  <button
                    onClick={() => onDownload(job.id)}
                    className="btn-action btn-download"
                  >
                    Download
                  </button>
                )}
                {job.status === 'failed' && (
                  <button
                    onClick={() => onRetry(job.id)}
                    className="btn-action btn-retry"
                  >
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
JobList.propTypes = {
  jobs:          PropTypes.array,
  loading:       PropTypes.bool,
  onDownload:    PropTypes.func,
  onRetry:       PropTypes.func,
  onViewDetails: PropTypes.func,
}
