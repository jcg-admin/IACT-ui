/**
 * auditGateway.js — IACT v2 (migrado de fetch() v4.0 a apiService)
 *
 * Dominio Auditoría (UC_AUD_01..04, UC_PERM_10):
 *   CNST-009: Auditoría Inmutable — solo append-only (no update/delete).
 *   Autenticación vía httpOnly cookies — interceptor de apiClient.js.
 *
 * URLs canónicas (schema OpenAPI IACT-api, Errors: 0):
 *   GET  /api/audit/logs/                    UC_AUD_01
 *   GET  /api/audit/logs/{id}/               UC_AUD_02
 *   POST /api/audit/search/                  UC_AUD_02
 *   POST /api/audit/export/                  UC_AUD_03 — retorna {job_id}, NO blob
 *   POST /api/audit/compliance-report/       UC_AUD_04
 *   POST /api/audit/compliance-verify/       UC_AUD_04
 *   GET  /api/audit/audit-events/            UC_PERM_10
 *   GET  /api/audit/audit-events/{id}/       UC_PERM_10
 *   GET  /api/audit/audit-events/aggregate/  UC_PERM_10
 *   POST /api/audit/audit-events/export/     UC_AUD_03 / UC_PERM_10
 *   GET  /api/audit/general/                 UC_AUD_01 (timeline cross-módulo)
 *   GET  /api/audit/integrity/               UC_AUD_04 (verificar HMAC-SHA256)
 *
 * ELIMINADOS (sin endpoint en IACT-api):
 *   getAuditSummary()      → /audit/summary no existe
 *   getLogsByUser()        → usar getAuditLogs({ user_id }) con filtros
 *   getLogsByResource()    → usar getAuditLogs({ resource_type, resource_id })
 *   getCriticalLogs()      → usar getAuditLogs({ severity: 'CRITICAL' })
 *   generateComplianceReport() → duplicado de getComplianceReport()
 *   logEvent()             → CNST-009: solo el backend emite eventos de auditoría
 */
import apiService from './apiClient'

class AuditService {

  // ── UC_AUD_01 — Consultar log de auditoría ────────────────────────────────

  /** GET /api/audit/logs/ — listar logs con filtros opcionales */
  async getAuditLogs(filters = {}) {
    return apiService.get('/api/audit/logs/', { params: filters })
  }

  /** GET /api/audit/logs/{id}/ — detalle de registro */
  async getAuditLogDetail(logId) {
    return apiService.get(`/api/audit/logs/${logId}/`)
  }

  // ── UC_AUD_02 — Buscar en log de auditoría ────────────────────────────────

  /** POST /api/audit/search/ — búsqueda avanzada */
  async searchLogs(searchParams) {
    return apiService.post('/api/audit/search/', searchParams)
  }

  // ── UC_AUD_03 — Exportar log de auditoría ────────────────────────────────

  /**
   * POST /api/audit/export/ — solicitar exportación async.
   * Retorna { job_id } — NO retorna blob.
   * El archivo se descarga cuando el job completa (ver reportsGateway.getExportJobs).
   */
  async exportLogs(format = 'csv', filters = {}) {
    return apiService.post('/api/audit/export/', { format, filters })
  }

  // ── UC_AUD_04 — Compliance ────────────────────────────────────────────────

  /**
   * POST /api/audit/compliance-report/ — generar reporte de compliance.
   * Preserva firma: getComplianceReport(filters)
   */
  async getComplianceReport(filters = {}) {
    return apiService.post('/api/audit/compliance-report/', filters)
  }

  /**
   * POST /api/audit/compliance-verify/ — verificar firma HMAC del reporte.
   * Preserva firma: verifyCompliance(reportId)
   */
  async verifyCompliance(reportId) {
    return apiService.post('/api/audit/compliance-verify/', { report_id: reportId })
  }

  // ── UC_PERM_10 — Audit Events ─────────────────────────────────────────────

  /** GET /api/audit/audit-events/ — listar eventos de auditoría */
  async getAuditEvents(params = {}) {
    return apiService.get('/api/audit/audit-events/', { params })
  }

  /** GET /api/audit/audit-events/{id}/ — detalle de evento */
  async getAuditEventDetail(eventId) {
    return apiService.get(`/api/audit/audit-events/${eventId}/`)
  }

  /** GET /api/audit/audit-events/aggregate/ — agregaciones */
  async getAuditEventAggregations(params = {}) {
    return apiService.get('/api/audit/audit-events/aggregate/', { params })
  }

  /** POST /api/audit/audit-events/export/ — exportar eventos */
  async exportAuditEvents(filters = {}) {
    return apiService.post('/api/audit/audit-events/export/', filters)
  }

  // ── UC_AUD_01 (ext) — Timeline general ────────────────────────────────────

  /** GET /api/audit/general/ — timeline cross-módulo */
  async getGeneralTimeline(params = {}) {
    return apiService.get('/api/audit/general/', { params })
  }

  // ── UC_AUD_04 (ext) — Integridad ──────────────────────────────────────────

  /** GET /api/audit/integrity/ — verificar integridad HMAC-SHA256 (CNST-009) */
  async verifyIntegrity(params = {}) {
    return apiService.get('/api/audit/integrity/', { params })
  }
}

export default new AuditService()
