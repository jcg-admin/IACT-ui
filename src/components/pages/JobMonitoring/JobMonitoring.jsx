/**
 * JobMonitoring Page
 * 
 * Real-time job monitoring and management interface
 * Features: Start, Monitor, Cancel, Retry, Download, Export
 */

import React, { useState, useEffect } from 'react'
import jobOrchestrator from '../../../facades/JobOrchestrator'
import reportExporter from '../../../facades/ReportExporter'
import { getNotificationService } from '@services/notificationService'
import JobList from './JobList'
import JobProgressBar from './JobProgressBar'
import JobStartForm from './JobStartForm'
import JobActions from './JobActions'
import './JobMonitoring.scss'

export default function JobMonitoring() {
  // State
  const [jobs, setJobs] = useState([])
  const [activeJobs, setActiveJobs] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showStartForm, setShowStartForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshInterval, setRefreshInterval] = useState(null)

  const notify = getNotificationService()

  // Load jobs on mount
  useEffect(() => {
    loadJobs()
    // Set up auto-refresh every 5 seconds for active jobs
    const interval = setInterval(() => {
      if (activeJobs.length > 0) {
        loadJobs()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  /**
   * Load all jobs and separate by status
   */
  const loadJobs = async () => {
    try {
      setLoading(true)

      // Mock data - in production, call API
      const mockJobs = [
        {
          id: 'job-001',
          type: 'export',
          name: 'User Export',
          status: 'completed',
          progress: 100,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3000000).toISOString(),
          duration: 600,
          rowsProcessed: 2500,
          fileSize: '5.2 MB'
        },
        {
          id: 'job-002',
          type: 'transform',
          name: 'Data Transformation',
          status: 'running',
          progress: 65,
          createdAt: new Date(Date.now() - 1200000).toISOString(),
          eta: new Date(Date.now() + 600000).toISOString(),
          rowsProcessed: 1650
        },
        {
          id: 'job-003',
          type: 'export',
          name: 'Transaction Export',
          status: 'running',
          progress: 35,
          createdAt: new Date(Date.now() - 900000).toISOString(),
          eta: new Date(Date.now() + 1200000).toISOString(),
          rowsProcessed: 875
        },
        {
          id: 'job-004',
          type: 'backup',
          name: 'Database Backup',
          status: 'failed',
          progress: 45,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          failedAt: new Date(Date.now() - 6300000).toISOString(),
          error: 'Connection timeout'
        },
        {
          id: 'job-005',
          type: 'export',
          name: 'Report Export',
          status: 'queued',
          progress: 0,
          createdAt: new Date().toISOString()
        }
      ]

      setJobs(mockJobs)

      // Separate by status
      setActiveJobs(
        mockJobs.filter(j => ['running', 'queued'].includes(j.status))
      )
      setCompletedJobs(
        mockJobs.filter(j => ['completed', 'failed'].includes(j.status))
      )

      setLoading(false)
    } catch (error) {
      notify.error(`Failed to load jobs: ${error.message}`)
      setLoading(false)
    }
  }

  /**
   * Handle start new job
   */
  const handleStartJob = async (jobConfig) => {
    try {
      notify.info(`Starting ${jobConfig.type} job...`)

      // Use JobOrchestrator to start and monitor
      const completedJob = await jobOrchestrator.startAndMonitor(
        jobConfig.type,
        jobConfig,
        {
          onProgress: (progress) => {
            // Update UI with progress
            setJobs(prev =>
              prev.map(j =>
                j.id === jobConfig.id
                  ? { ...j, progress }
                  : j
              )
            )
          }
        }
      )

      // Add completed job to list
      setCompletedJobs(prev => [completedJob, ...prev])
      setActiveJobs(prev => prev.filter(j => j.id !== completedJob.id))

      notify.success(`Job ${completedJob.id} completed successfully`)
      setShowStartForm(false)
    } catch (error) {
      notify.error(`Job failed: ${error.message}`)
    }
  }

  /**
   * Handle cancel job
   */
  const handleCancelJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to cancel this job?')) {
      return
    }

    try {
      await jobOrchestrator.cancelAndCleanup(jobId)

      setActiveJobs(prev => prev.filter(j => j.id !== jobId))
      setJobs(prev =>
        prev.map(j =>
          j.id === jobId ? { ...j, status: 'cancelled' } : j
        )
      )

      notify.success(`Job ${jobId} cancelled`)
    } catch (error) {
      notify.error(`Failed to cancel job: ${error.message}`)
    }
  }

  /**
   * Handle retry failed job
   */
  const handleRetryJob = async (jobId) => {
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job) return

      notify.info(`Retrying job ${jobId} with exponential backoff...`)

      const result = await jobOrchestrator.retryJob(
        jobId,
        job.type,
        { type: job.type },
        3 // max 3 retries
      )

      if (result.succeeded) {
        setCompletedJobs(prev =>
          prev.map(j =>
            j.id === jobId
              ? { ...j, status: 'completed', retries: result.retries }
              : j
          )
        )
        notify.success(`Job retried successfully (${result.retries} attempts)`)
      }
    } catch (error) {
      notify.error(`Retry failed: ${error.message}`)
    }
  }

  /**
   * Handle download job result
   */
  const handleDownloadResult = async (jobId) => {
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job || job.status !== 'completed') {
        notify.warning('Job not completed yet')
        return
      }

      notify.info('Downloading result...')

      // Use JobOrchestrator to download
      const result = await jobOrchestrator.executeAndDownload(
        job.type,
        { jobId }
      )

      notify.success(`Downloaded: ${result.filename}`)
    } catch (error) {
      notify.error(`Download failed: ${error.message}`)
    }
  }

  /**
   * Handle export job history
   */
  const handleExportHistory = async () => {
    try {
      const historyData = completedJobs.map(j => ({
        'Job ID': j.id,
        Type: j.type,
        Name: j.name,
        Status: j.status,
        Progress: `${j.progress}%`,
        'Rows Processed': j.rowsProcessed || 0,
        Duration: j.duration ? `${j.duration}s` : '-',
        'File Size': j.fileSize || '-',
        'Created': new Date(j.createdAt).toLocaleString(),
        'Completed': j.completedAt ? new Date(j.completedAt).toLocaleString() : '-'
      }))

      const result = await reportExporter.exportAsExcel(historyData, {
        filename: 'job-history.xlsx',
        headers: ['Job ID', 'Type', 'Name', 'Status', 'Progress', 'Rows Processed', 'Duration', 'File Size', 'Created', 'Completed']
      })

      notify.success(`Exported ${historyData.length} job records`)
    } catch (error) {
      notify.error(`Export failed: ${error.message}`)
    }
  }

  /**
   * Filter jobs by status
   */
  const getFilteredJobs = () => {
    if (filterStatus === 'active') return activeJobs
    if (filterStatus === 'completed') return completedJobs
    return [...activeJobs, ...completedJobs]
  }

  const filteredJobs = getFilteredJobs()

  return (
    <div className="job-monitoring">
      <div className="page-header">
        <h1>Job Monitoring</h1>
        <p>Monitor and manage long-running jobs with real-time progress tracking</p>
      </div>

      {!showStartForm ? (
        <>
          {/* Controls */}
          <div className="job-controls">
            <div className="filter-group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Jobs</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="action-buttons">
              <button
                onClick={() => setShowStartForm(true)}
                className="btn btn-primary"
              >
                Start New Job
              </button>
              <button
                onClick={handleExportHistory}
                disabled={completedJobs.length === 0}
                className="btn btn-secondary"
              >
                Export History
              </button>
              <button
                onClick={loadJobs}
                className="btn btn-secondary"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Active Jobs Section */}
          {activeJobs.length > 0 && (
            <div className="jobs-section active-jobs">
              <h2>Active Jobs ({activeJobs.length})</h2>
              <div className="jobs-grid">
                {activeJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.name}</h3>
                      <span className="badge badge-running">Running</span>
                    </div>
                    <JobProgressBar
                      progress={job.progress}
                      status={job.status}
                      rowsProcessed={job.rowsProcessed}
                    />
                    <div className="job-meta">
                      <span>ETA: {job.eta ? new Date(job.eta).toLocaleTimeString() : '-'}</span>
                    </div>
                    <JobActions
                      job={job}
                      onCancel={() => handleCancelJob(job.id)}
                      onViewDetails={() => setSelectedJob(job)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Jobs Section */}
          {completedJobs.length > 0 && (
            <div className="jobs-section completed-jobs">
              <h2>Job History ({completedJobs.length})</h2>
              <JobList
                jobs={completedJobs}
                loading={loading}
                onDownload={handleDownloadResult}
                onRetry={handleRetryJob}
                onViewDetails={setSelectedJob}
              />
            </div>
          )}

          {/* No Jobs State */}
          {jobs.length === 0 && !loading && (
            <div className="empty-state">
              <p>No jobs yet. Start a new job to get started.</p>
            </div>
          )}

          {/* Results Counter */}
          <div className="results-info">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </>
      ) : (
        // Job Start Form
        <JobStartForm
          onSubmit={handleStartJob}
          onCancel={() => setShowStartForm(false)}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.name}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="btn-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Job ID:</span>
                <span className="value">{selectedJob.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{selectedJob.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`badge badge-${selectedJob.status}`}>
                  {selectedJob.status.toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Progress:</span>
                <span className="value">{selectedJob.progress}%</span>
              </div>
              {selectedJob.rowsProcessed && (
                <div className="detail-row">
                  <span className="label">Rows Processed:</span>
                  <span className="value">{selectedJob.rowsProcessed.toLocaleString()}</span>
                </div>
              )}
              {selectedJob.error && (
                <div className="detail-row error">
                  <span className="label">Error:</span>
                  <span className="value">{selectedJob.error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
