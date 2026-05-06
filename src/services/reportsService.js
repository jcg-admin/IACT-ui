/**
 * Reports Service
 *
 * Cliente API para métricas del dashboard y reportes programados.
 *
 * Endpoints:
 * GET  /api/reports/metrics/dashboard/  - Métricas del dashboard principal
 * GET  /api/reports/agents/             - Reporte de agentes con filtros opcionales
 * GET  /api/reports/queues/             - Reporte de colas con filtros opcionales
 * GET  /api/reports/campaigns/          - Reporte de campañas con filtros opcionales
 * POST /api/reports/scheduled/          - Programar nuevo reporte
 * GET  /api/reports/scheduled/          - Listar reportes programados
 * POST /api/reports/export/             - Solicitar exportación de reporte (async → job_id)
 */

import apiService from './apiService'

class ReportsService {
  /**
   * Obtiene las métricas del dashboard principal.
   * @returns {Promise<Object>} Objeto con métricas: totalUsers, activeUsers, etc.
   */
  async getDashboardMetrics() {
    return apiService.get('/api/reports/metrics/dashboard/')
  }

  /**
   * Obtiene el reporte de agentes con filtros opcionales.
   * @param {Object} filters - Filtros: state, team, period, etc.
   * @returns {Promise<Object>} Reporte de agentes con datos y metadatos
   */
  async getAgentsReport(filters = {}) {
    return apiService.get('/api/reports/agents/', { params: filters })
  }

  /**
   * Obtiene el reporte de colas con filtros opcionales.
   * @param {Object} filters - Filtros: queue_id, period, etc.
   * @returns {Promise<Object>} Reporte de colas
   */
  async getQueuesReport(filters = {}) {
    return apiService.get('/api/reports/queues/', { params: filters })
  }

  /**
   * Obtiene el reporte de campañas con filtros opcionales.
   * @param {Object} filters - Filtros: campaign_id, period, state, etc.
   * @returns {Promise<Object>} Reporte de campañas
   */
  async getCampaignsReport(filters = {}) {
    return apiService.get('/api/reports/campaigns/', { params: filters })
  }

  /**
   * Programa un nuevo reporte para ejecución periódica.
   * @param {Object} config - Configuración: name, type, schedule, recipients, format
   * @returns {Promise<Object>} Reporte programado creado con su ID
   */
  async scheduleReport(config) {
    return apiService.post('/api/reports/scheduled/', config)
  }

  /**
   * Obtiene la lista de reportes programados.
   * @returns {Promise<Object>} Respuesta paginada con reportes programados
   */
  async getScheduledReports() {
    return apiService.get('/api/reports/scheduled/')
  }

  /**
   * Solicita la exportación asíncrona de un reporte.
   * Retorna 202 + { job_id } — el archivo se descarga cuando el job completa.
   * @param {string} type - Tipo de reporte: agents, queues, campaigns, dashboard
   * @param {string} format - Formato de exportación: csv, json, xlsx
   * @param {Object} filters - Filtros aplicados al reporte
   * @returns {Promise<Object>} Objeto con job_id del proceso de exportación
   */
  async exportReport(type, format, filters = {}) {
    return apiService.post('/api/reports/export/', { type, format, filters })
  }

  async getReportHistory() {
    return apiService.get('/api/reports/history/')
  }

  // TODO: replace mock — PATCH /api/reports/scheduled/{id}/pause/
  async pauseSchedule(id) {
    return { id, status: 'paused' }
  }

  // TODO: replace mock — PATCH /api/reports/scheduled/{id}/resume/
  async resumeSchedule(id) {
    return { id, status: 'active' }
  }

  // TODO: replace mock — DELETE /api/reports/scheduled/{id}/
  async deleteSchedule(id) {
    return { id, deleted: true }
  }

  // TODO: replace mock — POST /api/reports/scheduled/{id}/run/
  async runScheduleNow(id) {
    return { id, jobId: `job-${Date.now()}`, status: 'running' }
  }

  // TODO: replace mock — GET /api/reports/scheduled/{id}/runs/?page=1
  async getScheduleHistory(id) {
    return {
      items: [
        {
          id: '1',
          scheduled_report_id: id,
          started_at: new Date(Date.now() - 86_400_000).toISOString(),
          completed_at: new Date(Date.now() - 86_400_000 + 42_000).toISOString(),
          status: 'ok',
          export_job_id: 'job-abc-1',
          error_code: null,
        },
        {
          id: '2',
          scheduled_report_id: id,
          started_at: new Date(Date.now() - 172_800_000).toISOString(),
          completed_at: new Date(Date.now() - 172_800_000 + 38_000).toISOString(),
          status: 'ok',
          export_job_id: 'job-abc-2',
          error_code: null,
        },
      ],
      pagination: { page: 1, page_size: 20, total: 2 },
    }
  }

  // TODO: replace mock — GET /api/realtime/metrics/ (SSE: Connection: text/event-stream)
  // Shape matches uc-rpt-02: IVR batch metrics (6-12h lag), not true real-time
  async getRealTimeMetrics() {
    return {
      timestamp: new Date().toISOString(),
      trimestre_activo: 'Q3_25',
      segmentos_activos: ['nacional_A', 'nacional_B'],
      total_llamadas_hoy: 842,
      tasa_abandono_5min: 6.3,
      centros_activos: [
        { centro: 'Servicio_General', llamadas_hoy: 340 },
        { centro: 'Soporte_Tecnico', llamadas_hoy: 280 },
        { centro: 'Cobranza', llamadas_hoy: 152 },
      ],
      ultima_ejecucion_etl: new Date(Date.now() - 6 * 3600_000).toISOString(),
      lag_seconds: 8,
    }
  }

  generateShareUrl(type, filters = {}) {
    const params = new URLSearchParams({ type, ...filters }).toString()
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/reports/shared?${params}`
  }
}

export default new ReportsService()
