import logsService from '../logsGateway'

jest.mock('../apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue([]),
    post: jest.fn().mockResolvedValue({ jobId: 'abc' }),
  },
}))

const apiService = require('../apiClient').default

describe('logsService.getLogs', () => {
  it('calls GET /api/logs/ with params', async () => {
    await logsService.getLogs({ level: 'ERROR' })
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/', { params: { level: 'ERROR' } })
  })
})

describe('logsService.getETLLogs', () => {
  it('calls GET /api/logs/etl/', async () => {
    await logsService.getETLLogs()
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/etl/', { params: {} })
  })
})

describe('logsService.searchLogs', () => {
  it('calls GET /api/logs/search/ with q param', async () => {
    await logsService.searchLogs('timeout')
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/search/', { params: { q: 'timeout' } })
  })
})

describe('logsService.exportLogs', () => {
  it('calls POST /api/logs/export/', async () => {
    await logsService.exportLogs({ format: 'CSV' })
    expect(apiService.post).toHaveBeenCalledWith('/api/logs/export/', { format: 'CSV' })
  })
})

describe('logsService.getInfraLogs', () => {
  it('calls GET /api/logs/infra/', async () => {
    await logsService.getInfraLogs({ component: 'server' })
    expect(apiService.get).toHaveBeenCalledWith('/api/logs/infra/', { params: { component: 'server' } })
  })
})

describe('logsService.getSystemStatus', () => {
  it('calls GET /api/system/status/', async () => {
    await logsService.getSystemStatus()
    expect(apiService.get).toHaveBeenCalledWith('/api/system/status/')
  })
})

describe('logsService.getPerformanceMetrics', () => {
  it('calls GET /api/system/metrics/', async () => {
    await logsService.getPerformanceMetrics()
    expect(apiService.get).toHaveBeenCalledWith('/api/system/metrics/', { params: {} })
  })
})
