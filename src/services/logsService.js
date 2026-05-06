import apiService from './apiService'

class LogsService {
  async getLogs(params = {}) {
    return apiService.get('/api/logs/', { params })
  }

  async getETLLogs(params = {}) {
    return apiService.get('/api/logs/etl/', { params })
  }

  async searchLogs(query, params = {}) {
    return apiService.get('/api/logs/search/', { params: { q: query, ...params } })
  }

  async exportLogs(params = {}) {
    return apiService.post('/api/logs/export/', params)
  }

  async getInfraLogs(params = {}) {
    return apiService.get('/api/logs/infra/', { params })
  }

  async getSystemStatus() {
    return apiService.get('/api/system/status/')
  }

  async getPerformanceMetrics(params = {}) {
    return apiService.get('/api/system/metrics/', { params })
  }

  async getETLAvailability() {
    return apiService.get('/api/etl/availability/')
  }

  async retryPipeline(logId) {
    return apiService.post(`/api/etl/logs/${logId}/retry/`)
  }

  // TODO: replace mock — GET /api/etl/pipeline/status/
  async getPipelineStatus() {
    return {
      jobs: { running: 3, completed: 142, failed: 2 },
      sources: [
        { name: 'CRM', lag: '12 min', throughputRowsPerMin: 1840, bytesProcessed: 2400000, avgLatencyMs: 320 },
        { name: 'PBX', lag: '2 min', throughputRowsPerMin: 560, bytesProcessed: 890000, avgLatencyMs: 110 },
        { name: 'IVR', lag: '45 min', throughputRowsPerMin: 0, bytesProcessed: 0, avgLatencyMs: null },
      ],
      updatedAt: new Date().toISOString(),
    }
  }
}

export default new LogsService()
