/**
 * Frontend Access Service
 * IACT v4.0 - Access Module
 * API client para endpoints de control de acceso
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AccessService {
    /**
     * Obtener todas las funciones disponibles
     */
    async getAllFunctions() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/functions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/permissions/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/functions/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/functions/revoke`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
     * Validar SoD en frontend (llamar a backend)
     */
    async validateSoD(userId, functionId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/validate-sod`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                functionId,
            }),
        });

        if (!response.ok) {
            throw new Error('SoD validation failed');
        }

        return response.json();
    }

    /**
     * UC_ACC_09: Obtener auditoria de cambios de acceso
     */
    async getAccessAudit(userId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/audit/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/audit/export`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
     * Obtener agrupadores
     */
    async getGroupers() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/groupers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch groupers');
        }

        return response.json();
    }

    /**
     * Asignar agrupador
     */
    async assignGrouper(userId, grouperId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/groupers/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                grouperId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to assign grouper');
        }

        return response.json();
    }

    /**
     * Obtener segmentos
     */
    async getSegments() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/segments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/access/segments/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
