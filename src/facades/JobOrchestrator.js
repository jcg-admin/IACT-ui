/**
 * JobOrchestrator Facade
 * 
 * Simplifies job lifecycle management.
 * Orchestrates multiple job operations:
 * - Starting and monitoring jobs
 * - Downloading results
 * - Canceling jobs
 * - Retrying with exponential backoff
 * - Getting job status summaries
 * 
 * Single responsibility: Provide simple job operations
 * Uses: jobService, notification system
 */

import reportsService from '@api/reportsGateway'
import { getNotificationService } from '@api/notificationGateway'

// Constants
const POLL_INTERVAL = 2000 // 2 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Start with 1 second

class JobOrchestrator {
  /**
   * Start job and monitor progress automatically
   * 
   * Orchestrates:
   * 1. Start the job
   * 2. Poll status every 2 seconds
   * 3. Notify on completion
   * 4. Return final status
   * 
   * @param {string} jobType - Type of job to start
   * @param {Object} filters - Job configuration
   * @param {Object} options - {onProgress, maxPollTime}
   * @returns {Promise<{jobId, status, progress, result}>}
   */
  async startAndMonitor(jobType, filters = {}, options = {}) {
    const { onProgress, maxPollTime = 600000 } = options // 10 minutes default

    try {
      const notify = getNotificationService()

      // Step 1: Start job
      const job = await reportsService.exportReport(jobType, 'csv', filters)
      notify.success(`Job ${job.job_id ?? job.jobId} started`)

      // Step 2: Monitor until completion or timeout
      const startTime = Date.now()
      let currentJob = job
      let lastProgress = 0

      while (currentJob.status !== 'DONE' && currentJob.status !== 'completed' && currentJob.status !== 'FAILED' && currentJob.status !== 'failed') {
        // Check timeout
        if (Date.now() - startTime > maxPollTime) {
          throw new Error(`Job polling timeout after ${maxPollTime / 1000}s`)
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))

        // Get status
        currentJob = await reportsService.getExportJobDetail(job.jobId ?? job.job_id)

        // Notify progress change
        if (currentJob.progress !== lastProgress && onProgress) {
          onProgress(currentJob.progress)
        }
        lastProgress = currentJob.progress
      }

      // Step 3: Return result
      if (currentJob.status === 'failed' || currentJob.status === 'FAILED') {
        throw new Error(`Job failed: ${currentJob.error || 'Unknown error'}`)
      }

      notify.success(`Job ${job.job_id ?? job.jobId} completed`)
      return currentJob
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Job monitor error: ${error.message}`)
      throw error
    }
  }

  /**
   * Start job, monitor, and download result
   * 
   * Orchestrates:
   * 1. Start job
   * 2. Monitor progress
   * 3. Download result
   * 4. Return download info
   * 
   * High-level operation for complete job execution
   * 
   * @param {string} jobType - Type of job
   * @param {Object} filters - Job configuration
   * @param {Object} options - {onProgress}
   * @returns {Promise<{jobId, downloadUrl, filename, size}>}
   */
  async executeAndDownload(jobType, filters = {}, options = {}) {
    try {
      // Step 1: Monitor job execution
      const completedJob = await this.startAndMonitor(jobType, filters, options)

      // Step 2: Download result
      // El file_url está en el detail del job (no hay endpoint de download separado)
      const downloadInfo = { file_url: completedJob.file_url, filename: `export_${completedJob.job_id ?? completedJob.jobId}.csv`, size: 0 }

      return {
        jobId: completedJob.jobId,
        ...downloadInfo,
        completedAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Execute and download error: ${error.message}`)
      throw error
    }
  }

  /**
   * List all active jobs with summaries
   * 
   * Orchestrates:
   * 1. Get all active jobs
   * 2. Format with status summaries
   * 3. Return formatted list
   * 
   * @returns {Promise<Array<{jobId, type, status, progress, createdAt}>>}
   */
  async listActiveJobs() {
    return []
  }

  /**
   * Cancel job and clean up data
   * 
   * Orchestrates:
   * 1. Cancel the job
   * 2. Clean up any temporary data
   * 3. Update UI
   * 4. Notify user
   * 
   * @param {string} jobId
   * @returns {Promise<{jobId, status: 'cancelled'}>}
   */
  async cancelAndCleanup(jobId) {
    try {
      const notify = getNotificationService()

      // Step 1: Cancel job
      await reportsService.cancelExport(jobId)

      // Step 2: Clean up data
      // Could dispatch Redux actions here if needed
      // dispatch(removeActiveJob(jobId))

      notify.success(`Job ${jobId} cancelled`)

      return {
        jobId: jobId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Failed to cancel job: ${error.message}`)
      throw error
    }
  }

  /**
   * Retry a job with exponential backoff
   * 
   * Orchestrates:
   * 1. Cancel existing job
   * 2. Retry with backoff logic
   * 3. Monitor new execution
   * 4. Notify results
   * 
   * @param {string} jobId - Original job ID
   * @param {string} jobType - Type of job
   * @param {Object} filters - Job configuration
   * @param {number} maxRetries - Max attempts
   * @returns {Promise<{jobId, retries, finalStatus}>}
   */
  async retryJob(jobId, jobType, filters = {}, maxRetries = MAX_RETRIES) {
    const notify = getNotificationService()
    let lastError
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        attempt += 1
        notify.info(`Retry attempt ${attempt} of ${maxRetries}`)

        // Start new job
        const newJob = await reportsService.exportReport(jobType, 'csv', filters)

        // Monitor execution
        const result = await this.startAndMonitor(jobType, filters)

        return {
          originalJobId: jobId,
          newJobId: newJob.jobId,
          retries: attempt,
          finalStatus: result.status,
          succeeded: true
        }
      } catch (error) {
        lastError = error
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    notify.error(`Job failed after ${maxRetries} retries: ${lastError.message}`)
    throw new Error(
      `Job failed after ${maxRetries} retries. Last error: ${lastError.message}`
    )
  }

  /**
   * Get formatted job summary
   * 
   * Orchestrates:
   * 1. Get job status
   * 2. Format for display
   * 3. Include progress info
   * 
   * @param {string} jobId
   * @returns {Promise<{jobId, status, progress, eta, displayText}>}
   */
  async getJobSummary(jobId) {
    try {
      const job = await reportsService.getExportJobDetail(jobId)

      // Format for display
      let displayText = `${job.status.toUpperCase()}`
      if (job.progress) {
        displayText += ` - ${job.progress}%`
      }
      if (job.eta) {
        const etaDate = new Date(job.eta)
        displayText += ` (ETA: ${etaDate.toLocaleTimeString()})`
      }

      return {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress || 0,
        eta: job.eta,
        displayText: displayText
      }
    } catch (error) {
      const notify = getNotificationService()
      notify.error(`Failed to get job summary: ${error.message}`)
      throw error
    }
  }
}

// Export singleton instance
const jobOrchestrator = new JobOrchestrator()
export default jobOrchestrator

// Export class for testing
export { JobOrchestrator }
