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
     * UC_ACC_03: Obtener permisos del usuario
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
     * UC_ACC_01: Asignar función
     */
    async assignFunction(userId, functionId, expiresAt = null) {
        const response = await fetch(`${API_BASE_URL}/access/functions/assign`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                userId,
                functionId,
                expiresAt,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to assign function');
        }

        return response.json();
    }

    /**
     * UC_ACC_02: Revocar función
     */
    async revokeFunction(userId, functionId) {
        const response = await fetch(`${API_BASE_URL}/access/functions/revoke`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                userId,
                functionId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to revoke function');
        }

        return response.json();
    }

    /**
     * Valida reglas de separación de funciones antes de asignar (UC-043 / CNST-005).
     * Equivalente frontend de validate_separation_rules del backend (v5.2.1).
     */
    async validateSeparationRules(userId, functionId) {
        const response = await fetch(`${API_BASE_URL}/access/validate-sod`, {
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
     * UC_ACC_09: Obtener auditoria de cambios de acceso
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
     * Exportar auditoria
     */
    async exportAudit(userId, format = 'csv') {
        const response = await fetch(`${API_BASE_URL}/access/audit/export`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                userId,
                format,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to export audit');
        }

        return response.blob();
    }

    /**
     * Obtener grupos de funciones
     */
    async getFunctionGroups() {
        const response = await fetch(`${API_BASE_URL}/access/function-groups`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch function groups');
        }

        return response.json();
    }

    /**
     * Asignar grupo de funciones
     */
    async assignFunctionGroup(userId, functionGroupId) {
        const response = await fetch(`${API_BASE_URL}/access/function-groups/assign`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                userId,
                functionGroupId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to assign function group');
        }

        return response.json();
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
     * Asignar segmento
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
}

export default new AccessService();
