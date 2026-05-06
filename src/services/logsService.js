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

  // TODO: replace mock — GET /api/v1/etl/supervision/
  async getPipelineStatus() {
    return {
      estado_general: 'ok',
      ultima_ejecucion_exitosa: {
        trimestre: 'Q2_26',
        finished_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
        base_records: 1_234_567,
      },
      ejecucion_en_curso: null,
      ultima_ejecucion_fallida: null,
      total_exitosas_24h: 2,
      total_fallidas_24h: 0,
    }
  }
}

export default new LogsService()
