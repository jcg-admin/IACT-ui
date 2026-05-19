import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { selectAllJobs } from '@store/slices/session'
import ProgressBar from './ProgressBar'
import '@styles/components/_job-tracker.scss'

function JobTracker() {
  const _jobs = useSelector(selectAllJobs)

  if (!_jobs || _jobs.length === 0) {
    return <div className="job-tracker"><p>No active jobs</p></div>
  }

  return (
    <div className="job-tracker">
      <h3>Active Jobs</h3>
      <div className="jobs-list">
        {_jobs.map(_job => (
          <div key={_job.id} className="job-item">
            <div className="job-header">
              <span className="job-type">{_job.type}</span>
              <span className={`job-status job-status--${_job.status}`}>{_job.status}</span>
            </div>
            <ProgressBar
              progress={_job.progress}
              etaSeconds={_job.eta}
              label={_job.id}
              size="md"
              showPercent
              showEta
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobTracker
