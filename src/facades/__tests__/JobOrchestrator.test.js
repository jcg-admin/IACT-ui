/**
 * JobOrchestrator Facade Tests
 */

import jobOrchestrator from '../JobOrchestrator'
import jobService from '@services/jobService'
import { getNotificationService } from '@services/notificationService'

jest.mock('@services/jobService')
jest.mock('@services/notificationService')
jest.useFakeTimers()

describe('JobOrchestrator Facade', () => {
  let mockNotify

  beforeEach(() => {
    jest.clearAllMocks()
    mockNotify = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    }
    getNotificationService.mockReturnValue(mockNotify)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('startAndMonitor', () => {
    it('should start job and poll until completion', async () => {
      const mockJob = { jobId: 'job-1', status: 'running', progress: 50 }
      const mockCompleted = { jobId: 'job-1', status: 'completed', progress: 100 }

      jobService.start.mockResolvedValue(mockJob)
      jobService.status
        .mockResolvedValueOnce(mockJob)
        .mockResolvedValueOnce(mockCompleted)

      const resultPromise = jobOrchestrator.startAndMonitor('export', { type: 'xlsx' })

      // Advance timer to allow polling
      jest.advanceTimersByTime(2000)
      await Promise.resolve()
      jest.advanceTimersByTime(2000)

      const result = await resultPromise

      expect(jobService.start).toHaveBeenCalledWith('export', { type: 'xlsx' })
      expect(result.status).toBe('completed')
      expect(mockNotify.success).toHaveBeenCalled()
    })

    it('should call onProgress callback', async () => {
      const mockJob = { jobId: 'job-1', status: 'running', progress: 50 }
      const mockCompleted = { jobId: 'job-1', status: 'completed', progress: 100 }
      const onProgress = jest.fn()

      jobService.start.mockResolvedValue(mockJob)
      jobService.status
        .mockResolvedValueOnce({ ...mockJob, progress: 75 })
        .mockResolvedValueOnce(mockCompleted)

      const resultPromise = jobOrchestrator.startAndMonitor('export', {}, { onProgress })

      jest.advanceTimersByTime(2000)
      await Promise.resolve()
      jest.advanceTimersByTime(2000)

      await resultPromise

      expect(onProgress).toHaveBeenCalled()
    })

    it('should throw error if job fails', async () => {
      const mockJob = { jobId: 'job-1', status: 'running' }
      const mockFailed = { jobId: 'job-1', status: 'failed', error: 'Timeout' }

      jobService.start.mockResolvedValue(mockJob)
      jobService.status.mockResolvedValue(mockFailed)

      const resultPromise = jobOrchestrator.startAndMonitor('export', {})

      jest.advanceTimersByTime(2000)

      await expect(resultPromise).rejects.toThrow('Job failed')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('executeAndDownload', () => {
    it('should start, monitor, and download job result', async () => {
      const mockJob = { jobId: 'job-1', status: 'running' }
      const mockCompleted = { jobId: 'job-1', status: 'completed' }
      const mockDownload = {
        downloadUrl: 'https://example.com/file.xlsx',
        filename: 'export.xlsx',
        size: 1024
      }

      jobService.start.mockResolvedValue(mockJob)
      jobService.status.mockResolvedValue(mockCompleted)
      jobService.download.mockResolvedValue(mockDownload)

      const resultPromise = jobOrchestrator.executeAndDownload('export', {})

      jest.advanceTimersByTime(2000)

      const result = await resultPromise

      expect(jobService.start).toHaveBeenCalled()
      expect(jobService.download).toHaveBeenCalledWith('job-1')
      expect(result.downloadUrl).toBe('https://example.com/file.xlsx')
      expect(result.completedAt).toBeDefined()
    })
  })

  describe('cancelAndCleanup', () => {
    it('should cancel job and notify', async () => {
      jobService.cancel.mockResolvedValue({})

      const result = await jobOrchestrator.cancelAndCleanup('job-1')

      expect(jobService.cancel).toHaveBeenCalledWith('job-1')
      expect(result.status).toBe('cancelled')
      expect(mockNotify.success).toHaveBeenCalled()
    })

    it('should handle cancellation errors', async () => {
      const error = new Error('Already completed')
      jobService.cancel.mockRejectedValue(error)

      await expect(jobOrchestrator.cancelAndCleanup('job-1')).rejects.toThrow(
        'Already completed'
      )
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('retryJob', () => {
    it('should retry job with exponential backoff', async () => {
      const mockJob = { jobId: 'job-2', status: 'running' }
      const mockCompleted = { jobId: 'job-2', status: 'completed' }

      jobService.start.mockResolvedValue(mockJob)
      jobService.status.mockResolvedValue(mockCompleted)

      const resultPromise = jobOrchestrator.retryJob('job-1', 'export', {}, 1)

      jest.advanceTimersByTime(2000)

      const result = await resultPromise

      expect(result.retries).toBe(1)
      expect(result.succeeded).toBe(true)
      expect(mockNotify.info).toHaveBeenCalled()
    })

    it('should fail after max retries', async () => {
      jobService.start.mockRejectedValue(new Error('Service error'))

      const resultPromise = jobOrchestrator.retryJob('job-1', 'export', {}, 2)

      // Advance through retry delays
      jest.advanceTimersByTime(1000) // First retry delay
      jest.advanceTimersByTime(2000) // Second retry delay

      await expect(resultPromise).rejects.toThrow('failed after 2 retries')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('getJobSummary', () => {
    it('should return formatted job summary', async () => {
      const mockJob = {
        jobId: 'job-1',
        status: 'processing',
        progress: 75,
        eta: new Date(Date.now() + 30000).toISOString()
      }

      jobService.status.mockResolvedValue(mockJob)

      const result = await jobOrchestrator.getJobSummary('job-1')

      expect(result.status).toBe('processing')
      expect(result.progress).toBe(75)
      expect(result.displayText).toContain('PROCESSING')
      expect(result.displayText).toContain('75%')
    })

    it('should handle errors', async () => {
      jobService.status.mockRejectedValue(new Error('Not found'))

      await expect(jobOrchestrator.getJobSummary('job-1')).rejects.toThrow('Not found')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })
})
