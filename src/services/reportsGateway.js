/**
 * reportsGateway.js — URLs canónicas IACT-api v2
 *
 * Dashboard (UC_RPT_01):
 *   GET  /api/reports/dashboard/              Métricas del dashboard
 *
 * Reportes históricos (UC_RPT_03):
 *   GET  /api/reports/historical/             Histórico por período
 *
 * Exportación (UC_RPT_04):
 *   POST /api/reports/export/                 Exportar informe
 *   GET  /api/reports/export/{id}/            Estado del export
 *
 * Vistas guardadas (UC_RPT_10):
 *   GET  /api/reports/me/views/               Listar vistas
 *   POST /api/reports/me/views/               Crear vista
 *   GET  /api/reports/me/views/{id}/          Detalle
 *   PUT  /api/reports/me/views/{id}/          Actualizar
 *   POST /api/reports/me/views/{id}/clone/    Clonar
 *
 * Reportes programados (UC_RPT_07/08):
 *   GET  /api/reports/schedules/              Listar
 *   POST /api/reports/schedules/              Crear
 *   GET  /api/reports/schedules/{id}/         Detalle
 *
 * Compartir (UC_RPT_11):
 *   GET  /api/reports/shares/                 Listar
 *   POST /api/reports/shares/                 Crear
 *   DELETE /api/reports/shares/{id}/          Eliminar
 *
 * IVR — datos reales MariaDB (UC_RPT_12..17 + SLA):
 *   GET  /api/reports/ivr/clients/            Clientes únicos (sp_rpt_clientes)
 *   GET  /api/reports/ivr/transfer-centers/   Centros transferencia
 *   GET  /api/reports/ivr/abandoned/          Llamadas abandonadas
 *   GET  /api/reports/ivr/menu-errors/        Errores de menú
 *   GET  /api/reports/ivr/centers-by-segment/ Centros por segmento
 *   GET  /api/reports/ivr/menu-redirected/    Menús redirigidos
 *   GET  /api/reports/ivr/menu-center/        Menú→centro
 *   GET  /api/reports/ivr/menus/              Menús IVR
 *   GET  /api/reports/ivr/abandonment-summary/ Resumen abandono ROLLUP
 *   GET  /api/reports/ivr/sla/               Distribución SLA centros
 *
 * ACD/CTI — stubs (tablas no provisionadas):
 *   GET  /api/reports/agents/                 Agentes (stub ACD)
 *   GET  /api/reports/queues/                 Colas (stub ACD)
 *   GET  /api/reports/campaigns/             Campañas (stub ACD)
 *   GET  /api/reports/ivr/transfers/         Transferencias IVR ACD
 */

import apiService from './apiClient'

class ReportsService {

  // ── Dashboard ─────────────────────────────────────────────────────────
  async getDashboardMetrics() {
    return apiService.get('/api/reports/dashboard/')
  }

  // ── Histórico ─────────────────────────────────────────────────────────
  async getReportHistory(params = {}) {
    return apiService.get('/api/reports/historical/', { params })
  }

  // ── Exportación ───────────────────────────────────────────────────────
  async exportReport(type, format, filters = {}) {
    return apiService.post('/api/reports/export/', { type, format, filters })
  }

  async getExportJobStatus(exportId) {
    return apiService.get(`/api/reports/export/${exportId}/`)
  }

  // ── Vistas guardadas (UC_RPT_10) ──────────────────────────────────────
  async getSavedViews(params = {}) {
    return apiService.get('/api/reports/me/views/', { params })
  }

  async createSavedView(data) {
    return apiService.post('/api/reports/me/views/', data)
  }

  async getSavedViewDetail(id) {
    return apiService.get(`/api/reports/me/views/${id}/`)
  }

  async updateSavedView(id, data) {
    return apiService.put(`/api/reports/me/views/${id}/`, data)
  }

  async cloneSavedView(id) {
    return apiService.post(`/api/reports/me/views/${id}/clone/`, {})
  }

  async deleteSavedView(id) {
    return apiService.delete(`/api/reports/me/views/${id}/`)
  }

  // ── Filtros guardados (UC_RPT_09) ─────────────────────────────────────
  async getSavedFilters(params = {}) {
    return apiService.get('/api/reports/me/filters/', { params })
  }

  async createSavedFilter(data) {
    return apiService.post('/api/reports/me/filters/', data)
  }

  async deleteSavedFilter(id) {
    return apiService.delete(`/api/reports/me/filters/${id}/`)
  }

  // ── Reportes programados (UC_RPT_07/08) ───────────────────────────────
  async getScheduledReports(params = {}) {
    return apiService.get('/api/reports/schedules/', { params })
  }

  async scheduleReport(config) {
    return apiService.post('/api/reports/schedules/', config)
  }

  async getScheduledDetail(id) {
    return apiService.get(`/api/reports/schedules/${id}/`)
  }

  async pauseSchedule(id) {
    return apiService.post(`/api/reports/schedules/${id}/pause/`, {})
  }

  async resumeSchedule(id) {
    return apiService.post(`/api/reports/schedules/${id}/resume/`, {})
  }

  async runScheduleNow(id) {
    return apiService.post(`/api/reports/schedules/${id}/run/`)
  }

  async getScheduleHistory(id) {
    return apiService.get(`/api/reports/schedules/${id}/runs/`)
  }

  async deleteSchedule(id) {
    return apiService.delete(`/api/reports/schedules/${id}/`)
  }

  // ── Compartir (UC_RPT_11) ─────────────────────────────────────────────
  async getShares(params = {}) {
    return apiService.get('/api/reports/shares/', { params })
  }

  async createShare(data) {
    return apiService.post('/api/reports/shares/', data)
  }

  async revokeShare(id) {
    return apiService.delete(`/api/reports/shares/${id}/`)
  }

  // ── IVR — datos reales MariaDB ────────────────────────────────────────
  async getUniqueClientsReport(params = {}) {
    return apiService.get('/api/reports/ivr/clients/', { params })
  }

  async getTransfersReport(params = {}) {
    return apiService.get('/api/reports/ivr/transfer-centers/', { params })
  }

  async getAbandonedReport(params = {}) {
    return apiService.get('/api/reports/ivr/abandoned/', { params })
  }

  async getMenuErrorsReport(params = {}) {
    return apiService.get('/api/reports/ivr/menu-errors/', { params })
  }

  async getCentersBySegmentReport(params = {}) {
    return apiService.get('/api/reports/ivr/centers-by-segment/', { params })
  }

  async getMenuRedirectedReport(params = {}) {
    return apiService.get('/api/reports/ivr/menu-redirected/', { params })
  }

  async getMenuCenterReport(params = {}) {
    return apiService.get('/api/reports/ivr/menu-center/', { params })
  }

  async getIVRMenusReport(params = {}) {
    return apiService.get('/api/reports/ivr/menus/', { params })
  }

  async getAbandonmentSummary(params = {}) {
    return apiService.get('/api/reports/ivr/abandonment-summary/', { params })
  }

  async getSLADistribucion(params = {}) {
    return apiService.get('/api/reports/ivr/sla/', { params })
  }

  // ── ACD/CTI — stubs (tablas no provisionadas en ivr_legacy) ──────────
  async getAgentsReport(filters = {}) {
    return apiService.get('/api/reports/agents/', { params: filters })
  }

  async getQueuesReport(filters = {}) {
    return apiService.get('/api/reports/queues/', { params: filters })
  }

  async getCampaignsReport(filters = {}) {
    return apiService.get('/api/reports/campaigns/', { params: filters })
  }

  async getIVRTransfersReport(filters = {}) {
    return apiService.get('/api/reports/ivr/transfers/', { params: filters })
  }
}

export default new ReportsService()
