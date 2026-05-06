/**
 * Frontend Access Service
 * IACT v4.0 - Access Module
 * API client para endpoints de control de acceso
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AccessService {
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Obtener todas las funciones disponibles
     */
    async getAllFunctions() {
        const response = await fetch(`${API_BASE_URL}/access/functions`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch functions');
        }

        return response.json();
    }

    /**
     * UC-ACC-03: Obtener permisos del usuario
     */
    async getUserPermissions(userId) {
        const response = await fetch(`${API_BASE_URL}/access/permissions/${userId}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user permissions');
        }

        return response.json();
    }

    /**
     * UC-ACC-01: Asignar funciones a un usuario (operación bulk).
     * POST /users/{userId}/functions/
     */
    async assignFunctions(userId, functionIds, expiresAt = null) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/functions/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                function_ids: functionIds,
                expires_at: expiresAt,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to assign functions');
        }

        return response.json();
    }

    /**
     * UC-ACC-02: Revocar funciones de un usuario (operación bulk).
     * DELETE /users/{userId}/functions/
     */
    async revokeFunctions(userId, functionIds, revokeReason) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/functions/`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                function_ids: functionIds,
                revoke_reason: revokeReason,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to revoke functions');
        }

        return response.json();
    }

    /**
     * Valida reglas de separación de funciones antes de asignar (UC-043 / CNST-005).
     * POST /access/separation-rules/validate
     */
    async validateSeparationRules(userId, functionId) {
        const response = await fetch(`${API_BASE_URL}/access/separation-rules/validate`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                userId,
                functionId,
            }),
        });

        if (!response.ok) {
            throw new Error('Separation rules validation failed');
        }

        return response.json();
    }

    /**
     * UC-ACC-09: Obtener auditoría de cambios de acceso
     */
    async getAccessAudit(userId) {
        const response = await fetch(`${API_BASE_URL}/access/audit/${userId}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audit log');
        }

        return response.json();
    }

    /**
     * UC-AUD-03: Exportar auditoría de forma asíncrona.
     * POST /audit/export/ — retorna 202 + { job_id } (NO blob).
     * El archivo se descarga por separado cuando el job completa.
     */
    async exportAuditLog(filters, period, format, includeArchive) {
        const response = await fetch(`${API_BASE_URL}/audit/export/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                filters,
                period,
                format,
                include_archive: includeArchive,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request audit export');
        }

        return response.json();
    }

    /**
     * UC-ACC-04: Asignar grupo de acceso (AGR) a un usuario.
     * POST /users/{userId}/access-groups/
     */
    async assignAccessGroup(userId, agrId, expiresAt = null) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/access-groups/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                agr_id: agrId,
                expires_at: expiresAt,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to assign access group');
        }

        return response.json();
    }

    /**
     * UC-PERM-02: Revocar grupo de acceso de un usuario.
     * DELETE /users/{userId}/access-groups/{agrId}
     */
    async revokeAccessGroup(userId, agrId) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/access-groups/${agrId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to revoke access group');
        }
        return response.json().catch(() => ({}));
    }

    /**
     * Obtener segmentos
     */
    async getSegments() {
        const response = await fetch(`${API_BASE_URL}/access/segments`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch segments');
        }

        return response.json();
    }

    /**
     * Asignar segmento (deferred — sin spec UC verificada)
     */
    async assignSegment(userId, segmentId) {
        const response = await fetch(`${API_BASE_URL}/access/segments/assign`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                userId,
                segmentId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to assign segment');
        }

        return response.json();
    }

    // Gestión de grupos/AGRs

    /**
     * Crear grupo de acceso (AGR).
     * POST /api/access/groups/
     */
    async createGroup(data) {
        const response = await fetch(`${API_BASE_URL}/access/groups/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create group');
        }

        return response.json();
    }

    /**
     * Actualizar grupo de acceso (AGR).
     * PATCH /api/access/groups/{id}/
     */
    async updateGroup(id, data) {
        const response = await fetch(`${API_BASE_URL}/access/groups/${id}/`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update group');
        }

        return response.json();
    }

    /**
     * Desactivar grupo de acceso (AGR).
     * PATCH /api/access/groups/{id}/ con { active: false }
     */
    async deactivateGroup(id) {
        const response = await fetch(`${API_BASE_URL}/access/groups/${id}/`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ active: false }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to deactivate group');
        }

        return response.json();
    }

    /**
     * Asignar funciones a un grupo (AGR).
     * POST /api/access/groups/{groupId}/functions/
     */
    async assignFunctionsToGroup(groupId, functionIds) {
        const response = await fetch(`${API_BASE_URL}/access/groups/${groupId}/functions/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ function_ids: functionIds }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to assign functions to group');
        }

        return response.json();
    }

    /**
     * Obtener funciones de un grupo (AGR).
     * GET /api/access/groups/{groupId}/functions/
     */
    async getGroupFunctions(groupId) {
        const response = await fetch(`${API_BASE_URL}/access/groups/${groupId}/functions/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch group functions');
        }

        return response.json();
    }

    /**
     * Obtener todos los grupos de acceso (AGR).
     * GET /api/access/groups/
     */
    async getFunctionGroups() {
        const response = await fetch(`${API_BASE_URL}/access/groups/`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch function groups');
        }

        return response.json();
    }

    // uc-adm-01: separation rules CRUD (mock-first — backend endpoint pending)

    async getSeparationRules() {
        const response = await fetch(`${API_BASE_URL}/access/separation-rules`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch separation rules');
        return response.json();
    }

    async createSeparationRule(data) {
        const response = await fetch(`${API_BASE_URL}/access/separation-rules`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create separation rule');
        return response.json();
    }

    async updateSeparationRule(id, data) {
        const response = await fetch(`${API_BASE_URL}/access/separation-rules/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update separation rule');
        return response.json();
    }

    async deleteSeparationRule(id) {
        const response = await fetch(`${API_BASE_URL}/access/separation-rules/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete separation rule');
        return response.json();
    }
}

export default new AccessService();
