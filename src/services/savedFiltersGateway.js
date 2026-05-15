/**
 * savedFiltersGateway.js — URLs canónicas IACT-api v2
 *
 * Filtros guardados del usuario (UC_RPT_09):
 *   GET    /api/reports/me/filters/         listar filtros (RPT-003)
 *   POST   /api/reports/me/filters/         crear filtro
 *   GET    /api/reports/me/filters/{id}/    detalle
 *   PATCH  /api/reports/me/filters/{id}/    actualizar
 *   DELETE /api/reports/me/filters/{id}/    eliminar
 */
import apiService from './apiClient'

class SavedFiltersService {
  async getFilters(params = {}) {
    return apiService.get('/api/reports/me/filters/', { params })
  }

  async getFilterDetail(id) {
    return apiService.get(`/api/reports/me/filters/${id}/`)
  }

  async createFilter(data) {
    return apiService.post('/api/reports/me/filters/', data)
  }

  async updateFilter(id, data) {
    return apiService.patch(`/api/reports/me/filters/${id}/`, data)
  }

  async deleteFilter(id) {
    return apiService.delete(`/api/reports/me/filters/${id}/`)
  }
}

export default new SavedFiltersService()
