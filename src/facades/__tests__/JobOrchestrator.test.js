/**
 * JobOrchestrator Facade Tests
 */

import jobOrchestrator from '../JobOrchestrator'
import reportsService from '@api/reportsGateway'
import { getNotificationService } from '@api/notificationGateway'

jest.mock('@api/reportsGateway', () => ({
  __esModule: true,
  default: {
    exportReport:       jest.fn().mockResolvedValue({ job_id: 'job-123', jobId: 'job-123', status: 'queued', progress: 0 }),
    getExportJobDetail: jest.fn().mockResolvedValue({ job_id: 'job-123', jobId: 'job-123', status: 'DONE', progress: 100, file_url: '/dl/report.csv' }),
    cancelExport:       jest.fn().mockResolvedValue({ status: 'cancelled' }),
  },
}))
jest.mock('@api/notificationGateway')
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

      reportsService.exportReport.mockResolvedValue(mockJob)
      reportsService.getExportJobDetail
        .mockResolvedValueOnce(mockJob)
        .mockResolvedValueOnce(mockCompleted)

      const resultPromise = jobOrchestrator.startAndMonitor('export', { type: 'xlsx' })
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(reportsService.exportReport).toHaveBeenCalledWith('export', expect.any(String), expect.objectContaining({}))
      expect(result.status).toBe('completed')
      expect(mockNotify.success).toHaveBeenCalled()
    })

    it('should call onProgress callback', async () => {
      const mockJob = { jobId: 'job-1', status: 'running', progress: 50 }
      const mockCompleted = { jobId: 'job-1', status: 'completed', progress: 100 }
      const onProgress = jest.fn()

      reportsService.exportReport.mockResolvedValue(mockJob)
      reportsService.getExportJobDetail
        .mockResolvedValueOnce({ ...mockJob, progress: 75 })
        .mockResolvedValueOnce(mockCompleted)

      const resultPromise = jobOrchestrator.startAndMonitor('export', {}, { onProgress })
      await jest.runAllTimersAsync()
      await resultPromise

      expect(onProgress).toHaveBeenCalled()
    })

    it('should throw error if job fails', async () => {
      const mockJob = { jobId: 'job-1', status: 'running' }
      const mockFailed = { jobId: 'job-1', status: 'failed', error: 'Timeout' }

      reportsService.exportReport.mockResolvedValue(mockJob)
      reportsService.getExportJobDetail.mockResolvedValue(mockFailed)

      const resultPromise = jobOrchestrator.startAndMonitor('export', {})
      await Promise.allSettled([resultPromise, jest.runAllTimersAsync()])
      await expect(resultPromise).rejects.toThrow('Job failed')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })

  describe('executeAndDownload', () => {
    it('should start, monitor, and download job result', async () => {
      // En v2: el download está en file_url del job detail (no hay endpoint separado)
      const mockJob = { jobId: 'job-1', job_id: 'job-1', status: 'running', progress: 0 }
      const mockCompleted = {
        jobId: 'job-1', job_id: 'job-1', status: 'completed', progress: 100,
        file_url: 'https://example.com/file.xlsx'
      }

      reportsService.exportReport.mockResolvedValue(mockJob)
      reportsService.getExportJobDetail
        .mockResolvedValueOnce(mockCompleted)  // primera llamada ya retorna completed

      const resultPromise = jobOrchestrator.executeAndDownload('export', {})
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(reportsService.exportReport).toHaveBeenCalled()
      expect(reportsService.getExportJobDetail).toHaveBeenCalledWith('job-1')
      expect(result.completedAt).toBeDefined()
    })
  })

  describe('cancelAndCleanup', () => {
    it('should cancel job and notify', async () => {
      reportsService.cancelExport.mockResolvedValue({})

      const result = await jobOrchestrator.cancelAndCleanup('job-1')

      expect(reportsService.cancelExport).toHaveBeenCalledWith('job-1')
      expect(result.status).toBe('cancelled')
      expect(mockNotify.success).toHaveBeenCalled()
    })

    it('should handle cancellation errors', async () => {
      const error = new Error('Already completed')
      reportsService.cancelExport.mockRejectedValue(error)

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

      reportsService.exportReport.mockResolvedValue(mockJob)
      reportsService.getExportJobDetail.mockResolvedValue(mockCompleted)

      const resultPromise = jobOrchestrator.retryJob('job-1', 'export', {}, 1)
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(result.retries).toBe(1)
      expect(result.succeeded).toBe(true)
      expect(mockNotify.info).toHaveBeenCalled()
    })

    it('should fail after max retries', async () => {
      reportsService.exportReport.mockRejectedValue(new Error('Service error'))

      const resultPromise = jobOrchestrator.retryJob('job-1', 'export', {}, 2)
      await Promise.allSettled([resultPromise, jest.runAllTimersAsync()])
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

      reportsService.getExportJobDetail.mockResolvedValue(mockJob)

      const result = await jobOrchestrator.getJobSummary('job-1')

      expect(result.status).toBe('processing')
      expect(result.progress).toBe(75)
      expect(result.displayText).toContain('PROCESSING')
      expect(result.displayText).toContain('75%')
    })

    it('should handle errors', async () => {
      reportsService.getExportJobDetail.mockRejectedValue(new Error('Not found'))

      await expect(jobOrchestrator.getJobSummary('job-1')).rejects.toThrow('Not found')
      expect(mockNotify.error).toHaveBeenCalled()
    })
  })
})
