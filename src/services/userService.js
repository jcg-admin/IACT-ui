/**
 * User Service
 *
 * Cliente API para operaciones de gestión de usuarios.
 * Todos los cambios de estado se hacen vía baja lógica (INACTIVE), no DELETE.
 *
 * Endpoints:
 * GET    /api/users/         - Listar usuarios con filtros opcionales
 * GET    /api/users/{id}/    - Obtener usuario por ID
 * POST   /api/users/         - Crear nuevo usuario
 * PUT    /api/users/{id}/    - Actualizar datos de usuario
 * PATCH  /api/users/{id}/    - Baja lógica (status → INACTIVE)
 */

import apiService from './apiService'

class UserService {
  /**
   * Obtiene la lista de usuarios aplicando filtros opcionales.
   * @param {Object} filters - Filtros: status, role, search, etc.
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getUsers(filters = {}) {
    return apiService.get('/api/users/', { params: filters })
  }

  /**
   * Obtiene un usuario por su ID.
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserById(id) {
    return apiService.get(`/api/users/${id}/`)
  }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param {Object} data - Datos del usuario (username, email, role, etc.)
   * @returns {Promise<Object>} Usuario creado con su ID asignado
   */
  async createUser(data) {
    return apiService.post('/api/users/', data)
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param {number} id - ID del usuario
   * @param {Object} data - Campos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(id, data) {
    return apiService.put(`/api/users/${id}/`, data)
  }

  /**
   * Baja lógica: cambia el estado del usuario a INACTIVE.
   * No elimina el registro — cumple UC-USR-04.
   * @param {number} id - ID del usuario a dar de baja
   * @returns {Promise<Object>} Usuario con status INACTIVE
   */
  async deactivateUser(id) {
    return apiService.patch(`/api/users/${id}/`, { status: 'INACTIVE' })
  }

  /**
   * Retorna únicamente los usuarios activos (status = ACTIVE).
   * @returns {Promise<Array>} Lista de usuarios activos
   */
  async getActiveUsers() {
    return this.getUsers({ status: 'ACTIVE' })
  }
}

export default new UserService()
