/**
 * alertsGateway.js — IACT v2 — URLs canónicas IACT-api
 *
 * UC_ALR_01: Gestionar reglas de alerta
 *   GET   /api/alerts/rules/             listar reglas
 *   GET   /api/alerts/rules/{id}/        detalle de regla
 *   POST  /api/alerts/rules/             crear regla
 *   PATCH /api/alerts/rules/{id}/        actualizar regla
 *   DELETE /api/alerts/rules/{id}/       eliminar regla
 *   POST  /api/alerts/rules/dry-run/     validar sin persistir
 *   POST  /api/alerts/rules/{id}/pause/  pausar regla
 *   POST  /api/alerts/rules/{id}/resume/ reanudar regla
 *
 * UC_ALR_02: Ver alertas activas
 *   GET   /api/alerts/active/            alertas activas
 *
 * UC_ALR_03: Reconocer alerta
 *   POST  /api/alerts/{id}/acknowledge/  reconocer individual
 *   POST  /api/alerts/bulk-acknowledge/  reconocimiento masivo (≤50)
 *
 * UC_ALR_04: Historial de alertas
 *   GET   /api/alerts/history/           historial con filtros
 *
 * UC_ALR_05: Suscripciones
 *   GET   /api/alerts/me/subscriptions/        mis suscripciones
 *   POST  /api/alerts/me/subscriptions/        suscribirse
 *   DELETE /api/alerts/me/subscriptions/{id}/  cancelar suscripción
 *
 * ELIMINADOS (sin endpoint en IACT-api):
 *   getTemplates(), getTemplateById()         → /api/alerts/templates/ no existe
 *   updateSubscriptionPreferences()           → endpoint no existe
 *   exportAlertHistory()                      → endpoint no existe
 *   validateCondition()                       → endpoint no existe
 *   getAvailableMetrics()                     → endpoint no existe
 */
import apiService from './apiClient'

const AlertsGateway = {

  // ── UC_ALR_01 — Reglas de alerta ──────────────────────────────────────

  /** GET /api/alerts/rules/ — listar reglas */
  getAlertRules(params = {}) {
    return apiService.get('/api/alerts/rules/', { params })
  },

  /** GET /api/alerts/rules/{id}/ — detalle de regla */
  getAlertRuleDetail(ruleId) {
    return apiService.get(`/api/alerts/rules/${ruleId}/`)
  },

  /** POST /api/alerts/rules/ — crear regla */
  createAlert(config) {
    return apiService.post('/api/alerts/rules/', config)
  },

  /**
   * PATCH /api/alerts/rules/{id}/ — actualizar regla.
   * Verbo corregido: era PUT → PATCH (actualización parcial).
   */
  updateAlert(alertId, config) {
    return apiService.patch(`/api/alerts/rules/${alertId}/`, config)
  },

  /** DELETE /api/alerts/rules/{id}/ — eliminar regla */
  deleteAlert(alertId) {
    return apiService.delete(`/api/alerts/rules/${alertId}/`)
  },

  /** POST /api/alerts/rules/dry-run/ — validar regla sin persistir */
  dryRunAlertRule(config) {
    return apiService.post('/api/alerts/rules/dry-run/', config)
  },

  /** POST /api/alerts/rules/{id}/pause/ — pausar regla */
  pauseAlertRule(ruleId) {
    return apiService.post(`/api/alerts/rules/${ruleId}/pause/`)
  },

  /** POST /api/alerts/rules/{id}/resume/ — reanudar regla */
  resumeAlertRule(ruleId) {
    return apiService.post(`/api/alerts/rules/${ruleId}/resume/`)
  },

  // ── UC_ALR_02 — Alertas activas ───────────────────────────────────────

  /**
   * GET /api/alerts/active/ — alertas activas/reconocidas.
   * Alias: getAlerts() preservado por compatibilidad con código existente.
   */
  getActiveAlerts(params = {}) {
    return apiService.get('/api/alerts/active/', { params })
  },

  getAlerts(params = {}) {
    return this.getActiveAlerts(params)
  },

  // ── UC_ALR_03 — Reconocimiento ────────────────────────────────────────

  /**
   * POST /api/alerts/{id}/acknowledge/ — reconocer alerta individual.
   * URL corregida: era /api/alerts/{id}/ack/
   */
  acknowledgeAlert(alertId, note = null) {
    return apiService.post(`/api/alerts/${alertId}/acknowledge/`, { note })
  },

  /**
   * POST /api/alerts/bulk-acknowledge/ — reconocimiento masivo (≤50).
   * URL corregida: era /api/alerts/bulk-ack/
   */
  bulkAcknowledgeAlerts(alertIds) {
    return apiService.post('/api/alerts/bulk-acknowledge/', { alert_ids: alertIds })
  },

  // ── UC_ALR_04 — Historial ─────────────────────────────────────────────

  /** GET /api/alerts/history/ — historial con filtros opcionales */
  getAlertHistory(filters = {}) {
    return apiService.get('/api/alerts/history/', { params: filters })
  },

  // ── UC_ALR_05 — Suscripciones ─────────────────────────────────────────

  /**
   * GET /api/alerts/me/subscriptions/ — mis suscripciones activas.
   * URL corregida: era /api/alerts/subscriptions/me/
   */
  getMySubscriptions(params = {}) {
    return apiService.get('/api/alerts/me/subscriptions/', { params })
  },

  /**
   * POST /api/alerts/me/subscriptions/ — suscribirse a una alerta.
   * URL corregida: era /api/alerts/subscriptions/
   */
  subscribeToAlert(subscriptionData) {
    return apiService.post('/api/alerts/me/subscriptions/', subscriptionData)
  },

  /** POST /api/alerts/me/subscriptions/ — alias explícito */
  createSubscription(data) {
    return apiService.post('/api/alerts/me/subscriptions/', data)
  },

  /**
   * DELETE /api/alerts/me/subscriptions/{id}/ — cancelar suscripción.
   * URL corregida: era /api/alerts/subscriptions/{id}/
   */
  unsubscribeFromAlert(subscriptionId) {
    return apiService.delete(`/api/alerts/me/subscriptions/${subscriptionId}/`)
  },

  /** DELETE — alias explícito */
  cancelSubscription(subscriptionId) {
    return apiService.delete(`/api/alerts/me/subscriptions/${subscriptionId}/`)
  },
}

export default AlertsGateway
