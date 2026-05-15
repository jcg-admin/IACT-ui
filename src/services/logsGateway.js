/**
 * logsGateway.js — URLs canónicas IACT-api v2
 *
 * Dominio Logs (UC_LOG_01..07):
 *   GET /api/logs/django/tail/           UC_LOG_01 — logs Django
 *   GET /api/logs/etl/tail/              UC_LOG_02 — logs ETL
 *   GET /api/logs/search/                UC_LOG_03 — búsqueda
 *   POST /api/logs/export/               UC_LOG_04 — exportar
 *   GET /api/logs/infra/                 UC_LOG_05 — infraestructura
 *   GET /api/logs/health/                UC_LOG_06 — estado sistema
 *   GET /api/logs/metrics/               UC_LOG_07 — métricas técnicas
 *
 * Dominio Pipeline (UC_PIP_01..04):
 *   GET  /api/pipeline/status/           UC_PIP_01 — estado ETL
 *   GET  /api/pipeline/errors/           UC_PIP_02 — errores ETL
 *   GET  /api/pipeline/data-availability/ UC_PIP_03 — disponibilidad
 *   POST /api/pipeline/retry/            UC_PIP_04 — reintento
 *   GET  /api/pipeline/performance/      observabilidad — v_etl_rendimiento
 *   GET  /api/pipeline/events/           UC_PIP_02 ext — v_eventos_recientes
 *   GET  /api/pipeline/job-config/       UC_PIP_05 — configuración jobs
 *   PATCH /api/pipeline/job-config/{n}/  UC_PIP_05 — habilitar/deshabilitar
 *   GET  /api/pipeline/monitor/weekdays/ monitor — vw_monitor_dias_semana
 */

import apiService from './apiClient'

class LogsService {
  // ── UC_LOG_01..07 ────────────────────────────────────────────────────

  async getLogs(params = {}) {
    return apiService.get('/api/logs/django/tail/', { params })
  }

  async getETLLogs(params = {}) {
    return apiService.get('/api/logs/etl/tail/', { params })
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
    return apiService.get('/api/logs/health/')
  }

  async getPerformanceMetrics(params = {}) {
    return apiService.get('/api/logs/metrics/', { params })
  }

  // ── UC_PIP_01..04 ────────────────────────────────────────────────────

  async getPipelineStatus() {
    return apiService.get('/api/pipeline/status/')
  }

  async getPipelineErrors(params = {}) {
    return apiService.get('/api/pipeline/errors/', { params })
  }

  async getETLAvailability(quarter) {
    const params = quarter ? { quarter } : {}
    return apiService.get('/api/pipeline/data-availability/', { params })
  }

  async retryPipeline({ quarter, motivo } = {}) {
    return apiService.post('/api/pipeline/retry/', { quarter, motivo })
  }

  // ── UC_PIP_05 + extensiones ──────────────────────────────────────────

  async getPipelinePerformance(params = {}) {
    return apiService.get('/api/pipeline/performance/', { params })
  }

  async getPipelineEvents(params = {}) {
    return apiService.get('/api/pipeline/events/', { params })
  }

  async getJobConfig(jobName) {
    if (jobName) {
      return apiService.get(`/api/pipeline/job-config/${jobName}/`)
    }
    return apiService.get('/api/pipeline/job-config/')
  }

  async updateJobConfig(jobName, data) {
    return apiService.patch(`/api/pipeline/job-config/${jobName}/`, data)
  }

  async getMonitorWeekdays(params = {}) {
    return apiService.get('/api/pipeline/monitor/weekdays/', { params })
  }
}

export default new LogsService()
