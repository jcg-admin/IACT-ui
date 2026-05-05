/**
 * Frontend Audit Service
 * IACT v4.0 - Audit Module
 * API client para endpoints de auditoria (READ-ONLY)
 * CNST-009: Auditoria Inmutable
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AuditService {
    /**
     * UC_AUD_01: Obtener logs de auditoria
     */
    async getAuditLogs(filters = {}) {
        const token = localStorage.getItem('accessToken');
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/audit/logs?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audit logs');
        }

        return response.json();
    }

    /**
     * UC_AUD_02: Buscar en logs de auditoria
     */
    async searchLogs(searchParams) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams),
        });

        if (!response.ok) {
            throw new Error('Failed to search logs');
        }

        return response.json();
    }

    /**
     * UC_AUD_03: Exportar logs de auditoria
     */
    async exportLogs(format = 'csv', filters = {}) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/export`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                format,
                filters,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to export logs');
        }

        return response.blob();
    }

    /**
     * UC_AUD_04: Obtener reporte de compliance
     */
    async getComplianceReport(filters = {}) {
        const token = localStorage.getItem('accessToken');
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/audit/compliance?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch compliance report');
        }

        return response.json();
    }

    /**
     * Obtener resumen de auditoria
     */
    async getAuditSummary() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/summary`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audit summary');
        }

        return response.json();
    }

    /**
     * Obtener detalles de un log específico
     */
    async getLogDetails(logId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/logs/${logId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch log details');
        }

        return response.json();
    }

    /**
     * Obtener logs por usuario
     */
    async getLogsByUser(userId, filters = {}) {
        const token = localStorage.getItem('accessToken');
        const queryParams = new URLSearchParams({ ...filters, user_id: userId });
        const response = await fetch(`${API_BASE_URL}/audit/logs/user/${userId}?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user logs');
        }

        return response.json();
    }

    /**
     * Obtener logs por recurso
     */
    async getLogsByResource(resourceType, resourceId, filters = {}) {
        const token = localStorage.getItem('accessToken');
        const queryParams = new URLSearchParams({
            ...filters,
            resource_type: resourceType,
            resource_id: resourceId,
        });
        const response = await fetch(`${API_BASE_URL}/audit/logs/resource?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch resource logs');
        }

        return response.json();
    }

    /**
     * Obtener logs críticos
     */
    async getCriticalLogs() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/logs/critical`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch critical logs');
        }

        return response.json();
    }

    /**
     * Validar integridad de logs (CNST-009)
     */
    async validateLogIntegrity(dateStart, dateEnd) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/validate-integrity`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date_start: dateStart,
                date_end: dateEnd,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to validate log integrity');
        }

        return response.json();
    }

    /**
     * Generar reporte de compliance con signature
     */
    async generateComplianceReport(filters = {}) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/audit/compliance/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filters),
        });

        if (!response.ok) {
            throw new Error('Failed to generate compliance report');
        }

        return response.blob();
    }

    /**
     * BR_008: Log an error event to the audit trail.
     * Append-only per BR_010 — no update/delete endpoint exists.
     * Fire-and-forget: errors here must not interrupt the UI flow.
     */
    async logEvent(event) {
        const token = localStorage.getItem('accessToken');
        if (!token) return; // Not authenticated — skip audit logging

        try {
            await fetch(`${API_BASE_URL}/audit/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });
        } catch {
            // Audit logging must never throw — it is observability, not business logic
        }
    }
}

export default new AuditService();
