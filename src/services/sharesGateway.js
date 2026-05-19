/**
 * sharesGateway.js — URLs canónicas IACT-api v2
 *
 * Dominio Compartir Reportes (UC_RPT_11):
 *   POST   /api/reports/shares/          crear share (RPT-011)
 *   DELETE /api/reports/shares/{id}/     revocar share
 *   GET    /api/reports/shares/          listar shares (con ?direction=sent|received)
 */
import apiService from './apiClient'

class SharesService {
  /**
   * UC_RPT_11 — Compartir una vista de reporte con otro usuario o grupo.
   */
  async createShare({ view_id, target_type, target_id, permission, expires_at, message }) {
    return apiService.post('/api/reports/shares/', {
      view_id, target_type, target_id, permission, expires_at, message,
    })
  }

  /**
   * UC_RPT_11 — Revocar un share existente.
   */
  async revokeShare(shareId) {
    return apiService.delete(`/api/reports/shares/${shareId}/`)
  }

  /**
   * Listar todos los shares (enviados y recibidos).
   */
  async getShares(params = {}) {
    return apiService.get('/api/reports/shares/', { params })
  }

  /**
   * Listar shares enviados por el usuario autenticado.
   */
  async getSharesSent(params = {}) {
    return apiService.get('/api/reports/shares/', { params: { direction: 'sent', ...params } })
  }

  /**
   * Listar shares recibidos por el usuario autenticado.
   */
  async getSharesReceived(params = {}) {
    return apiService.get('/api/reports/shares/', { params: { direction: 'received', ...params } })
  }
}

export default new SharesService()
