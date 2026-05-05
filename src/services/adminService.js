/**
 * Admin Service
 *
 * Cliente API para administración de catálogos RBAC (funciones y AGRs).
 *
 * Endpoints:
 * GET   /api/admin/functions/       - Listar funciones RBAC
 * POST  /api/admin/functions/       - Crear función RBAC
 * PATCH /api/admin/functions/{id}/  - Actualizar / desactivar función
 * GET   /api/admin/agr/             - Listar AGRs (Agrupadores de Funciones)
 * POST  /api/admin/agr/             - Crear AGR
 * PATCH /api/admin/agr/{id}/        - Actualizar / desactivar AGR
 * GET   /api/admin/sod-rules/       - Listar reglas SoD
 */

import apiService from './apiService'

class AdminService {
  // ── Funciones RBAC ───────────────────────────────────────────────────────

  /**
   * Obtiene el catálogo completo de funciones RBAC.
   * @returns {Promise<Object>} Lista de funciones con metadata
   */
  async getFunctions() {
    return apiService.get('/api/admin/functions/')
  }

  /**
   * Crea una nueva función RBAC.
   * @param {Object} data - { codename, name, description, domain }
   * @returns {Promise<Object>} Función creada con su ID
   */
  async createFunction(data) {
    return apiService.post('/api/admin/functions/', data)
  }

  /**
   * Actualiza una función RBAC existente.
   * @param {number|string} id - ID de la función
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>} Función actualizada
   */
  async updateFunction(id, data) {
    return apiService.patch(`/api/admin/functions/${id}/`, data)
  }

  /**
   * Desactiva una función RBAC (soft-delete).
   * @param {number|string} id - ID de la función
   * @returns {Promise<Object>} Función con active: false
   */
  async deactivateFunction(id) {
    return apiService.patch(`/api/admin/functions/${id}/`, { active: false })
  }

  // ── AGRs (Agrupadores de Funciones Relacionadas) ─────────────────────────

  /**
   * Obtiene el catálogo completo de AGRs.
   * @returns {Promise<Object>} Lista de AGRs
   */
  async getAGRCatalog() {
    return apiService.get('/api/admin/agr/')
  }

  /**
   * Crea un nuevo AGR.
   * @param {Object} data - { codename, name, description }
   * @returns {Promise<Object>} AGR creado con su ID
   */
  async createAGR(data) {
    return apiService.post('/api/admin/agr/', data)
  }

  /**
   * Actualiza un AGR existente.
   * @param {number|string} id - ID del AGR
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>} AGR actualizado
   */
  async updateAGR(id, data) {
    return apiService.patch(`/api/admin/agr/${id}/`, data)
  }

  /**
   * Desactiva un AGR (soft-delete).
   * @param {number|string} id - ID del AGR
   * @returns {Promise<Object>} AGR con active: false
   */
  async deactivateAGR(id) {
    return apiService.patch(`/api/admin/agr/${id}/`, { active: false })
  }

  // ── Reglas SoD ───────────────────────────────────────────────────────────

  /**
   * Obtiene las reglas de Separación de Duties (SoD).
   * @returns {Promise<Object>} Lista de reglas SoD
   */
  async getSoDRules() {
    return apiService.get('/api/admin/sod-rules/')
  }
}

export const adminService = new AdminService()
export default adminService
