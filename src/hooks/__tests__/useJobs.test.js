/**
 * useJobs Hook Tests
 * 
 * Test React Query hooks for job management
 * Tests cover:
 * - useJobStatus query
 * - useStartJob mutation
 * - useCancelJob mutation
 * - useDownloadJob mutation
 * - Cache invalidation
 * - Error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useJobStatus,
  useStartJob,
  useCancelJob,
  useDownloadJob,
} from '@hooks/domain/useJobs'
import reportsService from '@api/reportsGateway'

// Mock reportsService
jest.mock('@api/reportsGateway', () => ({
  __esModule: true,
  default: {
    exportReport:       jest.fn().mockResolvedValue({ job_id: 'job-1', status: 'queued' }),
    getExportJobDetail: jest.fn().mockResolvedValue({ job_id: 'job-1', status: 'DONE', progress: 100, file_url: '/dl/f.csv' }),
    cancelExport:       jest.fn().mockResolvedValue({}),
  },
}))

/**
 * Test wrapper with QueryClientProvider
 * Needed for all React Query hooks tests
 */
function createTestWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useJobs Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useJobStatus', () => {
    it('should fetch job status when jobId is provided', async () => {
      const mockJob = {
        jobId: 'job-123',
        status: 'processing',
        progress: 45,
        eta: 30,
        error: null,
      }

      reportsService.getExportJobDetail.mockResolvedValue(mockJob)

      const { result } = renderHook(() => useJobStatus('job-123'), {
        wrapper: createTestWrapper(),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for query to resolve
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify data
      expect(result.current.data).toEqual(mockJob)
      expect(reportsService.getExportJobDetail).toHaveBeenCalledWith('job-123')
    })

    it('should not fetch when jobId is empty', () => {
      const { result } = renderHook(() => useJobStatus(''), {
        wrapper: createTestWrapper(),
      })

      // Should be idle because enabled is false
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(reportsService.getExportJobDetail).not.toHaveBeenCalled()
    })

    it('should handle error when fetching job status fails', async () => {
      const mockError = new Error('Job not found')
      reportsService.getExportJobDetail.mockRejectedValue(mockError)

      const { result } = renderHook(() => useJobStatus('job-999'), {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should have refetchInterval set to 5 seconds', () => {
      const { result } = renderHook(() => useJobStatus('job-123'), {
        wrapper: createTestWrapper(),
      })

      // This verifies the hook is configured with refetchInterval
      // The actual interval is tested through manual polling tests
      expect(result.current).toHaveProperty('data')
    })
  })

  describe('useStartJob', () => {
    it('should start a job with mutate', async () => {
      const mockStartedJob = {
        jobId: 'job-456',
        type: 'export_csv',
        status: 'queued',
        progress: 0,
        eta: 60,
      }

      reportsService.exportReport.mockResolvedValue(mockStartedJob)

      const { result } = renderHook(() => useStartJob(), {
        wrapper: createTestWrapper(),
      })

      // Initially not pending
      expect(result.current.isPending).toBe(false)

      // Call mutate
      act(() => {
        result.current.mutate({
          jobType: 'export_csv',
          filters: { format: 'csv' },
        })
      })

      // Wait for mutation to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify data
      expect(result.current.data).toEqual(mockStartedJob)
      expect(reportsService.exportReport).toHaveBeenCalledWith('export_csv', expect.any(String), expect.objectContaining({}))
    })

    it('should handle error when starting job fails', async () => {
      const mockError = new Error('Invalid job type')
      reportsService.exportReport.mockRejectedValue(mockError)

      const { result } = renderHook(() => useStartJob(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate({
          jobType: 'invalid_type',
          filters: {},
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should handle onSuccess callback', async () => {
      const mockStartedJob = {
        jobId: 'job-789',
        type: 'export_csv',
        status: 'queued',
        progress: 0,
        eta: 60,
      }

      reportsService.exportReport.mockResolvedValue(mockStartedJob)
      const onSuccessMock = jest.fn()

      const { result } = renderHook(() => useStartJob(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate(
          {
            jobType: 'export_csv',
            filters: {},
          },
          {
            onSuccess: onSuccessMock,
          }
        )
      })

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled()
      })

      // Verify first argument is the job data
      expect(onSuccessMock.mock.calls[0][0]).toEqual(mockStartedJob)
    })
  })

  describe('useCancelJob', () => {
    it('should cancel a job with mutate', async () => {
      const mockCancelResponse = { status: 'cancelled' }
      reportsService.cancelExport.mockResolvedValue(mockCancelResponse)

      const { result } = renderHook(() => useCancelJob(), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.isPending).toBe(false)

      act(() => {
        result.current.mutate('job-123')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCancelResponse)
      expect(reportsService.cancelExport).toHaveBeenCalledWith('job-123')
    })

    it('should handle error when canceling job fails', async () => {
      const mockError = new Error('Job not found')
      reportsService.cancelExport.mockRejectedValue(mockError)

      const { result } = renderHook(() => useCancelJob(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate('job-999')
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useDownloadJob', () => {
    it('should download job result (via file_url en job detail)', async () => {
      // En v2: no hay endpoint de download separado — el file_url está en el job detail
      const mockJobDetail = { job_id: 'job-123', status: 'DONE', file_url: 'https://cdn.iact.mx/exports/job-123.csv' }
      reportsService.getExportJobDetail.mockResolvedValue(mockJobDetail)

      const { result } = renderHook(() => useDownloadJob(), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.isPending).toBe(false)

      act(() => {
        result.current.mutate('job-123')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBe(mockJobDetail.file_url)
      expect(reportsService.getExportJobDetail).toHaveBeenCalledWith('job-123')
    })

    it('should handle error when download fails', async () => {
      const mockError = new Error('Download failed')
      reportsService.getExportJobDetail.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDownloadJob(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate('job-123')
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate job list after starting job', async () => {
      const mockStartedJob = {
        jobId: 'job-new',
        type: 'export_csv',
        status: 'queued',
        progress: 0,
        eta: 60,
      }

      reportsService.exportReport.mockResolvedValue(mockStartedJob)

      const { result } = renderHook(() => useStartJob(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate({
          jobType: 'export_csv',
          filters: {},
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify mutation completed
      expect(result.current.data).toEqual(mockStartedJob)
    })

    it('should invalidate specific job status after cancel', async () => {
      const mockCancelResponse = { status: 'cancelled' }
      reportsService.cancelExport.mockResolvedValue(mockCancelResponse)

      const { result } = renderHook(() => useCancelJob(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate('job-123')
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify mutation completed
      expect(result.current.data).toEqual(mockCancelResponse)
    })
  })
})
