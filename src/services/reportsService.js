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

  /**
   * Obtiene transferencias IVR agrupadas por centro de transferencia.
   *
   * Endpoint: GET /api/reports/transfers/
   *
   * Schema de respuesta (por fila):
   *   trimestre         {string}  - Periodo: Q01_25, Q02_25, Q03_25
   *   fecha             {string}  - Mes en formato YYYYMM
   *   800_transfer      {string}  - Segmento: Nacional | Puebla
   *   centro_transferencia {string} - Código del centro (e.g. "19020086")
   *   menu              {string}  - Nombre del menú IVR
   *   opcion            {string}  - Opción seleccionada
   *   total_llamadas    {number}  - Volumen total del periodo/grupo
   *   porcentaje        {number}  - % sobre el total del segmento
   *   misma_linea       {number}  - Transferencias a la misma línea
   *   linea_diferente   {number}  - Transferencias a línea diferente
   *   no_digito_telefono {number} - Llamadas sin dígito de teléfono
   *
   * @param {Object} filters
   * @param {string} [filters.trimestre]  - Filtro de trimestre (e.g. "Q01_25")
   * @param {string} [filters.segmento]   - Filtro de segmento / 800_transfer
   * @param {string} [filters.fecha]      - Filtro de mes YYYYMM (opcional)
   * @returns {Promise<Array>} Arreglo de filas con el schema descrito
   */
  async getTransfersByCentro(filters = {}) {
    return apiService.get('/api/reports/transfers/', { params: filters })
  }

  /**
   * IVR menu distribution with call averages (prom_llamadas).
   *
   * Endpoint: GET /api/reports/ivr-menus/
   *
   * Schema per row:
   *   trimestre              {string}  Q01_25 | Q02_25 | Q03_25
   *   segmento               {string}  Nacional | Puebla
   *   cMenu                  {string}  IVR menu name
   *   promedio_llamadas      {number}  Average calls per unique customer
   *   min_llamadas_x_cliente {number}
   *   max_llamadas_x_cliente {number}
   *   total_llamadas         {number}
   *
   * @param {Object} filters
   * @param {string} [filters.trimestre]
   * @param {string} [filters.segmento]
   * @returns {Promise<Array>}
   */
  async getIvrMenus(filters = {}) {
    return apiService.get('/api/reports/ivr-menus/', { params: filters })
  }

  /**
   * Unique clients summary by segment and quarter.
   *
   * Endpoint: GET /api/reports/unique-clients/
   *
   * Schema per row:
   *   trimestre       {string}  Q01_25 | Q02_25 | Q03_25
   *   segmento        {string}  Nacional_A | Nacional_B | Puebla
   *   clientes_unicos {number}  Unique client count — total across all rows: 9,617,998
   *
   * @param {Object} filters
   * @param {string} [filters.trimestre]
   * @param {string} [filters.segmento]
   * @returns {Promise<Array>}
   */
  async getUniqueClients(filters = {}) {
    return apiService.get('/api/reports/unique-clients/', { params: filters })
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
  // Shape per uc-rpt-02: live call-center state via pub/sub (call_state_changes,
  // agent_state_changes, queue_state_snapshots) — NOT ETL batch data.
  async getRealTimeMetrics() {
    return {
      timestamp: new Date().toISOString(),
      queue_count: 12,
      agents_busy: 8,
      agents_idle: 4,
      answered_per_hour: 143,
      abandon_rate_5min: 3.2,
      service_level_15min: 87.5,
      lag_seconds: 5,
      segments_applied: [],
      schema_version: 1,
    }
  }

  generateShareUrl(type, filters = {}) {
    const params = new URLSearchParams({ type, ...filters }).toString()
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/reports/shared?${params}`
  }
}

export default new ReportsService()
