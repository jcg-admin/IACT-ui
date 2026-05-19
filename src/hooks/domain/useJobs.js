/**
 * useJobs Hook
 * 
 * React Query hooks for job management
 * Provides queries and mutations for job operations
 * 
 * Handles:
 * - Fetching job status
 * - Starting new jobs
 * - Canceling jobs
 * - Downloading results
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import reportsService from '@api/reportsGateway'

/**
 * useJobStatus - Fetch status of a single job
 * 
 * @param {string} jobId - Job ID to fetch
 * @returns {Object} Query object with { data, isLoading, error, isSuccess, isError }
 * 
 * Example:
 *   const { data: job, isLoading, error } = useJobStatus('job-123')
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error error={error} />
 *   return <JobStatus status={job.status} progress={job.progress} />
 */
export function useJobStatus(jobId) {
  return useQuery({
    queryKey: ['jobs', 'status', jobId],
    queryFn: () => reportsService.getExportJobDetail(jobId),
    // Only fetch if jobId is provided
    enabled: !!jobId,
    // Keep data fresh for 10 seconds
    staleTime: 10 * 1000,
    // Refetch every 5 seconds while component mounted
    refetchInterval: 5 * 1000,
  })
}

/**
 * useStartJob - Start a new job mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 * 
 * Example:
 *   const { mutate: startJob, isPending, isSuccess, data } = useStartJob()
 *   
 *   const handleStart = () => {
 *     startJob(
 *       { jobType: 'export_csv', filters: { format: 'csv' } },
 *       {
 *         onSuccess: (job) => {
 *           console.log('Job started:', job.jobId)
 *           navigate(`/jobs/${job.jobId}`)
 *         },
 *         onError: (error) => {
 *           console.error('Failed to start job:', error)
 *         }
 *       }
 *     )
 *   }
 */
export function useStartJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobType, format = 'csv', filters = {} }) =>
      reportsService.exportReport(jobType, format, filters),
    onSuccess: (data) => {
      // After starting a job, invalidate any job lists
      // This will refetch job lists to show the new job
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
        // Don't refetch immediately, just mark as stale
        exact: false,
      })
    },
  })
}

/**
 * useCancelJob - Cancel an existing job mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 * 
 * Example:
 *   const { mutate: cancelJob, isPending } = useCancelJob()
 *   
 *   const handleCancel = () => {
 *     cancelJob(jobId, {
 *       onSuccess: () => {
 *         console.log('Job cancelled')
 *       }
 *     })
 *   }
 */
export function useCancelJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId) => reportsService.cancelExport(jobId),
    onSuccess: (data, jobId) => {
      // Invalidate the specific job's status
      // This will refetch the job status to reflect cancellation
      queryClient.invalidateQueries({
        queryKey: ['jobs', 'status', jobId],
      })
    },
  })
}

/**
 * useDownloadJob - Download job result mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 * 
 * Example:
 *   const { mutate: downloadJob, isPending } = useDownloadJob()
 *   
 *   const handleDownload = () => {
 *     downloadJob(jobId, {
 *       onSuccess: (blob) => {
 *         // blob is the file data
 *         const url = URL.createObjectURL(blob)
 *         const a = document.createElement('a')
 *         a.href = url
 *         a.download = 'export.csv'
 *         a.click()
 *       }
 *     })
 *   }
 */
export function useDownloadJob() {
  return useMutation({
    mutationFn: (jobId) => reportsService.getExportJobDetail(jobId).then(j => j.file_url),
    // No cache invalidation needed for downloads
  })
}

/**
 * Combined export for backward compatibility
 */
const useJobs = {
  useJobStatus,
  useStartJob,
  useCancelJob,
  useDownloadJob,
}

export default useJobs
