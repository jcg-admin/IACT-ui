/**
 * navigationGateway.js — IACT v2
 *
 * Menú y módulos de navegación dinámica (UC_PERM_08):
 *   GET /api/navigation/menu/      menú del usuario según sus funciones RBAC
 *   GET /api/navigation/modules/   módulos accesibles del usuario
 */
import apiService from './apiClient'

class NavigationService {
  /** GET /api/navigation/menu/ — estructura de menú según funciones del usuario */
  async getNavigationMenu(params = {}) {
    return apiService.get('/api/navigation/menu/', { params })
  }

  /** GET /api/navigation/modules/ — módulos accesibles */
  async getNavigationModules(params = {}) {
    return apiService.get('/api/navigation/modules/', { params })
  }
}

export default new NavigationService()
