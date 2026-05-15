/**
 * Admin Service
 *
 * Cliente API para administración de catálogos RBAC (funciones y AGRs).
 *
 * Endpoints:
 * GET   /api/access/functions/       - Listar funciones RBAC
 * POST  /api/access/functions/       - Crear función RBAC
 * PATCH /api/access/functions/{id}/  - Actualizar / desactivar función
 * GET   /api/access/access-groups/             - Listar AGRs (Agrupadores de Funciones)
 * POST  /api/access/access-groups/             - Crear AGR
 * PATCH /api/access/access-groups/{id}/        - Actualizar / desactivar AGR
 * GET   /api/access/separation-rules/ - Listar reglas de separación
 */

import apiService from './apiClient'

class AdminService {
  // ── Funciones RBAC ───────────────────────────────────────────────────────

  /**
   * Obtiene el catálogo completo de funciones RBAC.
   * @returns {Promise<Object>} Lista de funciones con metadata
   */
  async getFunctions() {
    return apiService.get('/api/access/functions/')
  }

  /**
   * Crea una nueva función RBAC.
   * @param {Object} data - { codename, name, description, domain }
   * @returns {Promise<Object>} Función creada con su ID
   */
  async createFunction(data) {
    return apiService.post('/api/access/functions/', data)
  }

  /**
   * Actualiza una función RBAC existente.
   * @param {number|string} id - ID de la función
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>} Función actualizada
   */
  async updateFunction(id, data) {
    return apiService.patch(`/api/access/functions/${id}/`, data)
  }

  /**
   * Desactiva una función RBAC (soft-delete).
   * @param {number|string} id - ID de la función
   * @returns {Promise<Object>} Función con active: false
   */
  async deactivateFunction(id) {
    return apiService.patch(`/api/access/functions/${id}/`, { active: false })
  }

  // ── AGRs (Agrupadores de Funciones Relacionadas) ─────────────────────────

  /**
   * Obtiene el catálogo completo de AGRs.
   * @returns {Promise<Object>} Lista de AGRs
   */
  async getAGRList() { return this.getAGRCatalog() }

  async getAGRCatalog() {
    return apiService.get('/api/access/access-groups/')
  }

  /**
   * Crea un nuevo AGR.
   * @param {Object} data - { codename, name, description }
   * @returns {Promise<Object>} AGR creado con su ID
   */
  async createAGR(data) {
    return apiService.post('/api/access/access-groups/', data)
  }

  /**
   * Actualiza un AGR existente.
   * @param {number|string} id - ID del AGR
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>} AGR actualizado
   */
  async updateAGR(id, data) {
    return apiService.patch(`/api/access/access-groups/${id}/`, data)
  }

  /**
   * Desactiva un AGR (soft-delete).
   * @param {number|string} id - ID del AGR
   * @returns {Promise<Object>} AGR con active: false
   */
  async deactivateAGR(id) {
    return apiService.patch(`/api/access/access-groups/${id}/`, { active: false })
  }

  // ── Reglas de separación de funciones ───────────────────────────────────

  /**
   * Obtiene las reglas de separación de funciones.
   * @returns {Promise<Object>} Lista de reglas de separación
   */
  async getSeparationRules() {
    return apiService.get('/api/access/separation-rules/')
  }

  async createSeparationRule(data) {
    return apiService.post('/api/access/separation-rules/', data)
  }

  async updateSeparationRule(id, data) {
    return apiService.patch(`/api/access/separation-rules/${id}/`, data)
  }

  async toggleSeparationRuleStatus(id) {
    return apiService.patch(`/api/access/separation-rules/${id}/`, {})
  }

  // ── Composición de AGR de sistema (UC-ADM-03) ────────────────────────────

  async getAGRComposition(agrId) {
    return apiService.get(`/api/access/system-groups/${agrId}/functions/`)
  }

  async addFunctionToAGR(agrId, functionCodename) {
    return apiService.post(`/api/access/system-groups/${agrId}/functions/`, {
      function_codename: functionCodename,
    })
  }

  async removeFunctionFromAGR(agrId, functionCodename) {
    return apiService.delete(`/api/access/system-groups/${agrId}/functions/${functionCodename}/`)
  }

  async getAGRImpact(agrId) {
    return apiService.get(`/api/access/system-groups/${agrId}/impact/`)
  }

  // ── Catálogo de MenuItems (UC-ADM-04/05) ────────────────────────────────

  async getMenuItems({ status, module: mod } = {}) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (mod) params.set('module', mod)
    const query = params.toString()
    return apiService.get(`/api/access/menu-items/${query ? `?${query}` : ''}`)
  }

  async createMenuItem(data) {
    return apiService.post('/api/access/menu-items/', data)
  }

  async updateMenuItem(id, data) {
    return apiService.patch(`/api/access/menu-items/${id}/`, data)
  }

  async publishMenuItem(id) {
    return apiService.post(`/api/access/menu-items/${id}/publish/`)
  }

  async deprecateMenuItem(id) {
    return apiService.post(`/api/access/menu-items/${id}/deprecate/`)
  }

  async reactivateMenuItem(id) {
    return apiService.post(`/api/access/menu-items/${id}/reactivate/`)
  }

  async archiveMenuItem(id) {
    return apiService.post(`/api/access/menu-items/${id}/archive/`)
  }

  async bulkReorderMenuItems(items) {
    return apiService.patch('/api/access/menu-items/bulk-reorder/', { items })
  }

  async blockAutoArchive(id, blockReason) {
    return apiService.post(`/api/access/menu-items/${id}/block-archive/`, {
      block_reason: blockReason,
    })
  }

  async unblockAutoArchive(id) {
    return apiService.delete(`/api/access/menu-items/${id}/block-archive/`)
  }
}

export const adminService = new AdminService()
export default adminService
