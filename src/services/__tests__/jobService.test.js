/**
 * jobService Tests
 * 
 * Requerimientos:
 * - Usar apiService
 * - Polling support
 * - Blob download support
 * - Manejar errores
 */

import jobService from '@services/jobService'
import apiService from '@services/apiService'

jest.mock('@services/apiService')

describe('jobService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('start(_jobType, _filters)', () => {
    it('debería hacer POST a /api/job/start/', async () => {
      const _mockData = {
        jobId: 'job-123',
        type: 'export_csv',
        status: 'queued',
        progress: 0,
        eta: 60
      }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await jobService.start('export_csv', {})

      expect(apiService.post).toHaveBeenCalledWith('/api/job/start/', {
        type: 'export_csv',
        filters: {}
      })
      expect(_result.jobId).toBe('job-123')
      expect(_result.status).toBe('queued')
    })
  })

  describe('status(_jobId)', () => {
    it('debería hacer GET a /api/job/status/{jobId}/', async () => {
      const _mockData = {
        jobId: 'job-123',
        status: 'processing',
        progress: 45,
        eta: 30
      }

      apiService.get.mockResolvedValue(_mockData)

      const _result = await jobService.status('job-123')

      expect(apiService.get).toHaveBeenCalledWith('/api/job/job-123/status/')
      expect(_result.progress).toBe(45)
      expect(_result.status).toBe('processing')
    })

    it('debería retornar null eta si no hay', async () => {
      const _mockData = {
        jobId: 'job-124',
        status: 'completed',
        progress: 100
      }

      apiService.get.mockResolvedValue(_mockData)

      const _result = await jobService.status('job-124')

      expect(_result.eta).toBeNull()
    })
  })

  describe('download(_jobId)', () => {
    it('debería hacer GET a /api/job/download/{jobId}/ y retornar blob', async () => {
      const _mockBlob = new Blob(['csv,data'], { type: 'text/csv' })

      apiService.get.mockResolvedValue(_mockBlob)

      const _result = await jobService.download('job-123')

      expect(apiService.get).toHaveBeenCalledWith('/api/job/job-123/download/')
      expect(_result instanceof Blob).toBe(true)
    })
  })

  describe('cancel(_jobId)', () => {
    it('debería hacer POST a /api/job/cancel/{jobId}/', async () => {
      const _mockData = { status: 'cancelled' }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await jobService.cancel('job-123')

      expect(apiService.post).toHaveBeenCalledWith('/api/job/job-123/cancel/', {})
      expect(_result.status).toBe('cancelled')
    })
  })
})
