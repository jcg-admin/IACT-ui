/**
 * Alerts Gateway
 * IACT v4.0 — Alerts Module
 * UC_ALR_01: Gestionar reglas de alerta
 * UC_ALR_02: Ver y filtrar alertas activas
 * UC_ALR_03: Reconocer alerta
 * UC_ALR_04: Ver historial de alertas disparadas
 * UC_ALR_05: Gestionar suscripciones
 */

import apiService from './apiClient'

const AlertsGateway = {
  /** UC_ALR_02: Obtener alertas activas */
  getAlerts() {
    return apiService.get('/api/alerts/')
  },

  /** UC_ALR_01: Crear nueva regla de alerta */
  createAlert(config) {
    return apiService.post('/api/alerts/rules/', config)
  },

  /** UC_ALR_01: Actualizar regla de alerta existente */
  updateAlert(alertId, config) {
    return apiService.put(`/api/alerts/rules/${alertId}/`, config)
  },

  /** UC_ALR_01: Eliminar regla de alerta */
  deleteAlert(alertId) {
    return apiService.delete(`/api/alerts/rules/${alertId}/`)
  },

  /** UC_ALR_01: Cambiar estado de regla (active/paused) */
  toggleAlertStatus(alertId, status) {
    return apiService.patch(`/api/alerts/rules/${alertId}/`, { status })
  },

  /** UC_ALR_04: Obtener historial de alertas disparadas */
  getAlertHistory(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return apiService.get(`/api/alerts/history/${params ? `?${params}` : ''}`)
  },

  /** Templates */
  getTemplates() {
    return apiService.get('/api/alerts/templates/')
  },

  getTemplateById(templateId) {
    return apiService.get(`/api/alerts/templates/${templateId}/`)
  },

  /** UC_ALR_05: Suscribirse — body: { subscription_type, rule_id?, severity_filter?, scope_filter? } */
  subscribeToAlert(subscriptionData) {
    return apiService.post('/api/alerts/subscriptions/', subscriptionData)
  },

  /** UC_ALR_05: Desuscribirse */
  unsubscribeFromAlert(subscriptionId) {
    return apiService.delete(`/api/alerts/subscriptions/${subscriptionId}/`)
  },

  /** UC_ALR_05: Obtener mis suscripciones */
  getMySubscriptions() {
    return apiService.get('/api/alerts/subscriptions/me/')
  },

  /** UC_ALR_05: Actualizar preferencias de suscripción */
  updateSubscriptionPreferences(preferences) {
    return apiService.put('/api/alerts/subscriptions/preferences/', preferences)
  },

  /** UC_ALR_04: Exportar historial */
  exportAlertHistory(format = 'csv', filters = {}) {
    return apiService.post('/api/alerts/history/export/', { format, filters })
  },

  /** UC_ALR_01: Validar condición (dry-run) */
  validateCondition(condition) {
    return apiService.post('/api/alerts/validate-condition/', condition)
  },

  /** Obtener métricas disponibles para reglas */
  getAvailableMetrics() {
    return apiService.get('/api/alerts/metrics/')
  },

  /** UC_ALR_03: Reconocer alerta individual */
  acknowledgeAlert(alertId, note = null) {
    return apiService.post(`/api/alerts/${alertId}/ack/`, { note })
  },

  /** UC_ALR_03: Reconocimiento masivo (hasta 50 alertas) */
  bulkAcknowledgeAlerts(alertIds) {
    return apiService.post('/api/alerts/bulk-ack/', { alert_ids: alertIds })
  },
}

export default AlertsGateway
