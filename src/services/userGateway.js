/**
 * userGateway.js — IACT v2 — URLs canónicas IACT-api
 *
 * UC_USR_01: Crear usuario  → POST /api/users/create/
 * UC_USR_02: Modificar      → PUT  /api/users/{id}/ (reemplazo) / PATCH (parcial)
 * UC_USR_03: Ver            → GET  /api/users/{id}/
 * UC_USR_04: Baja lógica    → DELETE /api/users/{id}/ (state→ELIMINATED, BR-009)
 * UC_USR_05: Bloquear       → POST /api/users/{id}/block/
 * UC_USR_06: Desbloquear    → POST /api/users/{id}/unblock/
 * UC_AUTH_03: Reset password → POST /api/users/{id}/reset-password/
 *
 * ELIMINADOS (sin endpoint canónico en IACT-api):
 *   updateMyProfile() → PATCH /api/users/me/profile/ no existe
 *   getMyProfile()    → cubierto por authGateway.getCurrentUser() → GET /api/auth/me/
 */
import apiService from './apiClient'

class UserService {
  // ── Listado ──────────────────────────────────────────────────────────────

  /** GET /api/users/ — listar usuarios con filtros */
  async getUsers(filters = {}) {
    return apiService.get('/api/users/', { params: filters })
  }

  /** Alias: solo usuarios activos */
  async getActiveUsers() {
    return this.getUsers({ state: 'ACTIVE' })
  }

  // ── Detalle ──────────────────────────────────────────────────────────────

  /**
   * GET /api/users/{id}/ — detalle de usuario.
   * Preserva compatibilidad con getUserById(id).
   */
  async getUserById(id) {
    return apiService.get(`/api/users/${id}/`)
  }

  async getUserDetail(id) {
    return this.getUserById(id)
  }

  // ── Creación ─────────────────────────────────────────────────────────────

  /**
   * POST /api/users/create/ — crear usuario (UC_USR_01).
   * URL corregida: era POST /api/users/ — el canónico de UC_USR_01 es /api/users/create/.
   */
  async createUser(data) {
    return apiService.post('/api/users/create/', data)
  }

  // ── Actualización ─────────────────────────────────────────────────────────

  /** PUT /api/users/{id}/ — reemplazo completo (UC_USR_02) */
  async updateUser(id, data) {
    return apiService.put(`/api/users/${id}/`, data)
  }

  /** PATCH /api/users/{id}/ — actualización parcial (UC_USR_03) */
  async patchUser(id, data) {
    return apiService.patch(`/api/users/${id}/`, data)
  }

  // ── Baja lógica ───────────────────────────────────────────────────────────

  /**
   * DELETE /api/users/{id}/ — baja lógica BR-009 (state→ELIMINATED).
   * El backend cierra sesiones activas, revoca AGRs y notifica al usuario.
   */
  async deleteUser(id) {
    return apiService.delete(`/api/users/${id}/`)
  }

  /** Alias compatible con código existente que usaba deactivateUser() con DELETE */
  async deactivateUser(id) {
    return apiService.post(`/api/users/${id}/deactivate/`)
  }

  // ── Estado ────────────────────────────────────────────────────────────────

  /** POST /api/users/{id}/activate/ — activar usuario */
  async activateUser(id) {
    return apiService.post(`/api/users/${id}/activate/`)
  }

  /** UC_USR_05: POST /api/users/{id}/block/ — bloquear (invalida sesiones) */
  async blockUser(id) {
    return apiService.post(`/api/users/${id}/block/`)
  }

  /** UC_USR_06: POST /api/users/{id}/unblock/ — desbloquear */
  async unblockUser(id) {
    return apiService.post(`/api/users/${id}/unblock/`)
  }

  // ── Contraseña ────────────────────────────────────────────────────────────

  /**
   * POST /api/users/{id}/reset-password/ — generar contraseña temporal (UC_AUTH_03).
   * Solo disponible para usuarios con AUTH-003 (reset_password).
   */
  async resetUserPassword(id) {
    return apiService.post(`/api/users/${id}/reset-password/`)
  }
}

export default new UserService()
