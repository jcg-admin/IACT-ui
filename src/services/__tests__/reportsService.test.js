/**
 * Tests para reportsService
 *
 * Cubre: endpoints, parámetros y error handling de cada método.
 */

import reportsService from '../reportsGateway'
import apiService from '../apiClient'

jest.mock('../apiClient')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('reportsService.getDashboardMetrics', () => {
  it('llama GET /api/reports/dashboard/', async () => {
    apiService.get.mockResolvedValue({ totalUsers: 100 })
    const result = await reportsService.getDashboardMetrics()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/dashboard/')
    expect(result.totalUsers).toBe(100)
  })

  it('propaga error cuando apiService falla', async () => {
    apiService.get.mockRejectedValue(new Error('Network error'))
    await expect(reportsService.getDashboardMetrics()).rejects.toThrow('Network error')
  })
})

describe('reportsService.getAgentsReport', () => {
  it('llama GET /api/reports/agents/ con filtros como params', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await reportsService.getAgentsReport({ state: 'ACTIVE' })
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/agents/', {
      params: { state: 'ACTIVE' },
    })
  })

  it('llama sin filtros cuando no se pasan parámetros', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await reportsService.getAgentsReport()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/agents/', { params: {} })
  })
})

describe('reportsService.getQueuesReport', () => {
  it('llama GET /api/reports/queues/ con filtros', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await reportsService.getQueuesReport({ queue_id: 5 })
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/queues/', {
      params: { queue_id: 5 },
    })
  })
})

describe('reportsService.getCampaignsReport', () => {
  it('llama GET /api/reports/campaigns/ con filtros', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await reportsService.getCampaignsReport({ campaign_id: 7 })
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/campaigns/', {
      params: { campaign_id: 7 },
    })
  })
})

describe('reportsService.scheduleReport', () => {
  it('llama POST /api/reports/schedules/ con config', async () => {
    const config = { name: 'Daily', type: 'agents', schedule: 'daily' }
    apiService.post.mockResolvedValue({ id: 99, ...config })
    const result = await reportsService.scheduleReport(config)
    expect(apiService.post).toHaveBeenCalledWith('/api/reports/schedules/', config)
    expect(result.id).toBe(99)
  })
})

describe('reportsService.getScheduledReports', () => {
  it('llama GET /api/reports/schedules/', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await reportsService.getScheduledReports()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/schedules/', { params: {} })
  })
})

describe('reportsService.pauseSchedule', () => {
  it('llama POST /api/reports/schedules/{id}/pause/', async () => {
    apiService.post.mockResolvedValue({ status: 'paused' })
    const result = await reportsService.pauseSchedule(42)
    expect(apiService.post).toHaveBeenCalledWith('/api/reports/schedules/42/pause/', {})
    expect(result.status).toBe('paused')
  })
})

describe('reportsService.resumeSchedule', () => {
  it('llama POST /api/reports/schedules/{id}/resume/', async () => {
    apiService.post.mockResolvedValue({ status: 'active' })
    const result = await reportsService.resumeSchedule(42)
    expect(apiService.post).toHaveBeenCalledWith('/api/reports/schedules/42/resume/', {})
    expect(result.status).toBe('active')
  })
})

describe('reportsService.deleteSchedule', () => {
  it('llama DELETE /api/reports/schedules/{id}/', async () => {
    apiService.delete.mockResolvedValue({})
    await reportsService.deleteSchedule(42)
    expect(apiService.delete).toHaveBeenCalledWith('/api/reports/schedules/42/')
  })
})

describe('reportsService.runScheduleNow', () => {
  it('llama POST /api/reports/schedules/{id}/run/', async () => {
    apiService.post.mockResolvedValue({ job_id: 'run-1' })
    const result = await reportsService.runScheduleNow(42)
    expect(apiService.post).toHaveBeenCalledWith('/api/reports/schedules/42/run/')
    expect(result.job_id).toBe('run-1')
  })
})

describe('reportsService.getScheduleHistory', () => {
  it('llama GET /api/reports/schedules/{id}/runs/', async () => {
    apiService.get.mockResolvedValue([{ run_id: 'r-1' }])
    const result = await reportsService.getScheduleHistory(42)
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/schedules/42/runs/')
    expect(result[0].run_id).toBe('r-1')
  })
})

describe('reportsService.exportReport', () => {
  it('llama POST /api/reports/export/ con type, format y filters', async () => {
    apiService.post.mockResolvedValue({ job_id: 'j-1' })
    const result = await reportsService.exportReport('agents', 'csv', { state: 'ACTIVE' })
    expect(apiService.post).toHaveBeenCalledWith('/api/reports/export/', {
      type: 'agents',
      format: 'csv',
      filters: { state: 'ACTIVE' },
    })
    expect(result.job_id).toBe('j-1')
  })

  it('usa filters vacío por defecto', async () => {
    apiService.post.mockResolvedValue({ job_id: 'j-2' })
    await reportsService.exportReport('dashboard', 'json')
    const body = apiService.post.mock.calls[0][1]
    expect(body.filters).toEqual({})
  })
})
