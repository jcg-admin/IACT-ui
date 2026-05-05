/**
 * Tests para reportsService
 *
 * Cubre: endpoints, parámetros y error handling de cada método.
 */

import reportsService from '../reportsService'
import apiService from '../apiService'

jest.mock('../apiService')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('reportsService.getDashboardMetrics', () => {
  it('llama GET /api/reports/metrics/dashboard/', async () => {
    apiService.get.mockResolvedValue({ totalUsers: 100 })
    const result = await reportsService.getDashboardMetrics()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/metrics/dashboard/')
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
  it('llama POST /api/reports/scheduled/ con config', async () => {
    const config = { name: 'Daily', type: 'agents', schedule: 'daily' }
    apiService.post.mockResolvedValue({ id: 99, ...config })
    const result = await reportsService.scheduleReport(config)
    expect(apiService.post).toHaveBeenCalledWith('/api/reports/scheduled/', config)
    expect(result.id).toBe(99)
  })
})

describe('reportsService.getScheduledReports', () => {
  it('llama GET /api/reports/scheduled/', async () => {
    apiService.get.mockResolvedValue({ results: [] })
    await reportsService.getScheduledReports()
    expect(apiService.get).toHaveBeenCalledWith('/api/reports/scheduled/')
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
