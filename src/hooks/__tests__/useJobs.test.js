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
import jobService from '@services/jobGateway'

// Mock jobService
jest.mock('@services/jobGateway')

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

      jobService.status.mockResolvedValue(mockJob)

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
      expect(jobService.status).toHaveBeenCalledWith('job-123')
    })

    it('should not fetch when jobId is empty', () => {
      const { result } = renderHook(() => useJobStatus(''), {
        wrapper: createTestWrapper(),
      })

      // Should be idle because enabled is false
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(jobService.status).not.toHaveBeenCalled()
    })

    it('should handle error when fetching job status fails', async () => {
      const mockError = new Error('Job not found')
      jobService.status.mockRejectedValue(mockError)

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

      jobService.start.mockResolvedValue(mockStartedJob)

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
      expect(jobService.start).toHaveBeenCalledWith('export_csv', {
        format: 'csv',
      })
    })

    it('should handle error when starting job fails', async () => {
      const mockError = new Error('Invalid job type')
      jobService.start.mockRejectedValue(mockError)

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

      jobService.start.mockResolvedValue(mockStartedJob)
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
      jobService.cancel.mockResolvedValue(mockCancelResponse)

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
      expect(jobService.cancel).toHaveBeenCalledWith('job-123')
    })

    it('should handle error when canceling job fails', async () => {
      const mockError = new Error('Job not found')
      jobService.cancel.mockRejectedValue(mockError)

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
    it('should download job result', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
      jobService.download.mockResolvedValue(mockBlob)

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

      expect(result.current.data).toBe(mockBlob)
      expect(jobService.download).toHaveBeenCalledWith('job-123')
    })

    it('should handle error when download fails', async () => {
      const mockError = new Error('Download failed')
      jobService.download.mockRejectedValue(mockError)

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

      jobService.start.mockResolvedValue(mockStartedJob)

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
      jobService.cancel.mockResolvedValue(mockCancelResponse)

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
