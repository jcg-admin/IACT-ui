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
}

export default new LogsService()
