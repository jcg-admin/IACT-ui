import apiService from './apiClient'

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

  async getETLAvailability(trimestre) {
    const params = trimestre ? { trimestre } : {}
    return apiService.get('/api/v1/datos/disponibilidad/', { params })
  }

  async retryPipeline({ logId, motivo }) {
    return apiService.post(`/api/etl/logs/${logId}/retry/`, { motivo })
  }

  async getPipelineStatus() {
    return apiService.get('/api/v1/etl/supervision/')
  }

  async getPipelineErrors(params = {}) {
    return apiService.get('/api/v1/etl/errores/', { params })
  }
}

export default new LogsService()
