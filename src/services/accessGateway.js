/**
 * accessGateway.js — IACT v2 (migrado de fetch() v4.0 a apiService)
 *
 * Dominio Control de Acceso / RBAC:
 *   Autenticación vía httpOnly cookies — gestionada por apiClient.js interceptor.
 *   NO usar localStorage ni fetch() directo.
 *
 * URLs basadas en schema OpenAPI IACT-api (drf-spectacular Errors: 0).
 *
 * ELIMINADOS (sin endpoint en IACT-api):
 *   getSegments()           → /access/segments no existe
 *   assignSegment()         → /access/segments/assign no existe
 *   validateGroupAssignment → /access/groups/{id}/validate-for-user no existe
 *   getGroupCascadeImpact   → /access/groups/{id}/cascade-impact no existe
 */
import apiService from './apiClient'

class AccessService {

  // ── Funciones ────────────────────────────────────────────────────────────

  /** GET /api/access/functions/ — catálogo de funciones (ACC-003) */
  async getAllFunctions(params = {}) {
    return apiService.get('/api/access/functions/', { params })
  }

  /** GET /api/access/permissions/{userId}/ — permisos del usuario (ACC-003) */
  async getUserPermissions(userId) {
    return apiService.get(`/api/access/permissions/${userId}/`)
  }

  /** GET /api/access/users/{userId}/effective-permissions/ — permisos efectivos (UC_ACC_03) */
  async getEffectivePermissions(userId) {
    return apiService.get(`/api/access/users/${userId}/effective-permissions/`)
  }

  /** GET /api/access/permissions/verify/ — verificar permiso de usuario (UC_PERM_07) */
  async verifyPermission(userId, functionCode) {
    return apiService.get('/api/access/permissions/verify/', {
      params: { user_id: userId, function_code: functionCode },
    })
  }

  // ── Asignación de funciones (UC_ACC_01 / UC_ACC_02) ──────────────────────

  /**
   * POST /api/access/users/{userId}/functions/assign/ — asignar funciones (bulk)
   * Preserva compatibilidad con código que llama assignFunctions(userId, ids, expiresAt).
   */
  async assignFunctions(userId, functionIds, expiresAt = null) {
    return apiService.post(`/api/access/users/${userId}/functions/assign/`, {
      function_ids: functionIds,
      expires_at: expiresAt,
    })
  }

  /**
   * DELETE /api/access/users/{userId}/functions/revoke/ — revocar funciones (bulk)
   */
  async revokeFunctions(userId, functionIds, revokeReason) {
    return apiService.delete(`/api/access/users/${userId}/functions/revoke/`, {
      data: { function_ids: functionIds, revoke_reason: revokeReason },
    })
  }

  // ── AGRs / Grupos de acceso ───────────────────────────────────────────────

  /** GET /api/access/access-groups/ — listar AGRs */
  async getFunctionGroups(params = {}) {
    return apiService.get('/api/access/access-groups/', { params })
  }

  /** GET /api/access/access-groups/{id}/ — detalle de AGR (incluye funciones) */
  async getGroupFunctions(groupId) {
    return apiService.get(`/api/access/access-groups/${groupId}/`)
  }

  /** POST /api/access/access-groups/ — crear AGR (UC_PERM_05) */
  async createGroup(data) {
    return apiService.post('/api/access/access-groups/', data)
  }

  /** PATCH /api/access/access-groups/{id}/ — actualizar AGR */
  async updateGroup(id, data) {
    return apiService.patch(`/api/access/access-groups/${id}/`, data)
  }

  /** DELETE /api/access/access-groups/{id}/ — retirar AGR (soft-delete) */
  async retireGroup(id, retireReason) {
    return apiService.delete(`/api/access/access-groups/${id}/`, {
      data: { retire_reason: retireReason },
    })
  }

  /** POST /api/access/access-groups/{groupId}/functions/ — asignar funciones a AGR */
  async assignFunctionsToGroup(groupId, functionIds, changeReason) {
    return apiService.post(`/api/access/access-groups/${groupId}/functions/`, {
      function_ids: functionIds,
      change_reason: changeReason,
    })
  }

  // ── Asignación de AGR a usuario ───────────────────────────────────────────

  /** POST /api/access/users/{userId}/agr/ — asignar AGR a usuario (UC_ACC_04) */
  async assignAccessGroup(userId, agrId, expiresAt = null) {
    return apiService.post(`/api/access/users/${userId}/agr/`, {
      agr_id: agrId,
      expires_at: expiresAt,
    })
  }

  /** DELETE /api/access/users/{userId}/agr/{agrId}/ — revocar AGR de usuario (UC_PERM_02) */
  async revokeAccessGroup(userId, agrId) {
    return apiService.delete(`/api/access/users/${userId}/agr/${agrId}/`)
  }

  /** POST /api/access/groupers/assign — asignar agrupador a usuario (UC_ACC_04) */
  async assignGrouper(userId, agrId) {
    return apiService.post('/api/access/groupers/assign', {
      user_id: userId,
      agr_id: agrId,
    })
  }

  /** GET /api/access/groupers/ — listar agrupadores (UC_PERM_05) */
  async getGroupers(params = {}) {
    return apiService.get('/api/access/groupers/', { params })
  }

  // ── Reglas de separación de funciones (SoD) ───────────────────────────────

  /** GET /api/access/separation-rules/ — listar reglas SoD */
  async getSeparationRules(params = {}) {
    return apiService.get('/api/access/separation-rules/', { params })
  }

  /** GET /api/access/separation-rules/{id}/ — detalle de regla */
  async getSeparationRuleDetail(id) {
    return apiService.get(`/api/access/separation-rules/${id}/`)
  }

  /** POST /api/access/separation-rules/ — crear regla SoD */
  async createSeparationRule(data) {
    return apiService.post('/api/access/separation-rules/', data)
  }

  /** PATCH /api/access/separation-rules/{id}/ — actualizar regla */
  async updateSeparationRule(id, data) {
    return apiService.patch(`/api/access/separation-rules/${id}/`, data)
  }

  /** DELETE /api/access/separation-rules/{id}/ — eliminar regla */
  async deleteSeparationRule(id) {
    return apiService.delete(`/api/access/separation-rules/${id}/`)
  }

  /**
   * POST /api/access/separation-rules/validate — validar conflictos SoD antes de asignar.
   * Preserva firma: validateSeparationRules(userId, functionId)
   */
  async validateSeparationRules(userId, functionId) {
    return apiService.post('/api/access/separation-rules/validate', {
      user_id: userId,
      function_id: functionId,
    })
  }

  // ── Permisos excepcionales ────────────────────────────────────────────────

  /**
   * POST /api/access/users/{userId}/exceptional-permissions/ — conceder (UC_ACC_08)
   */
  async grantExceptionalPermission(userId, payload) {
    return apiService.post(
      `/api/access/users/${userId}/exceptional-permissions/`,
      payload
    )
  }

  /**
   * GET /api/access/users/{userId}/exceptional-permissions/ — listar excepcionales
   */
  async getExceptionalPermissions(userId) {
    return apiService.get(`/api/access/users/${userId}/exceptional-permissions/`)
  }

  /**
   * GET /api/access/users/{userId}/exceptional-permissions/preview/ — preview sin persistir (UC_PERM_03)
   */
  async previewExceptionalPermission(userId, params = {}) {
    return apiService.get(
      `/api/access/users/${userId}/exceptional-permissions/preview/`,
      { params }
    )
  }

  /**
   * DELETE /api/access/users/{userId}/exceptional-permissions/{permId}/ — revocar (UC_PERM_04)
   */
  async revokeExceptionalPermission(userId, permissionId, revokeReason) {
    return apiService.delete(
      `/api/access/users/${userId}/exceptional-permissions/${permissionId}/`,
      { data: { revoke_reason: revokeReason } }
    )
  }

  // ── Auditoría de acceso ───────────────────────────────────────────────────

  /**
   * GET /api/access/audit/ — listar eventos de cambios de acceso (UC_ACC_09).
   * Compatibilidad: getAccessAudit(userId) filtra por target_user_id.
   */
  async getAccessAudit(userId = null) {
    const params = userId != null ? { target_user_id: userId } : {}
    return apiService.get('/api/access/audit/', { params })
  }

  /**
   * POST /api/audit/export/ — exportar auditoría async → job_id.
   * NOTA: pertenece al dominio /api/audit/, no /api/access/audit/.
   * Preservado aquí por compatibilidad con código existente.
   */
  async exportAuditLog(filters, period, format, includeArchive) {
    return apiService.post('/api/audit/export/', {
      filters,
      period,
      format,
      include_archive: includeArchive,
    })
  }

  // ── Menú dinámico ────────────────────────────────────────────────────────

  /** GET /api/access/my-modules/ — módulos accesibles del usuario (UC_PERM_08) */
  async getMyModules() {
    return apiService.get('/api/access/my-modules/')
  }
}

export default new AccessService()
