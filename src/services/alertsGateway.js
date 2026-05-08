/**
 * Frontend Alerts Service
 * IACT v4.0 - Alerts Module
 * API client para endpoints de alertas y notificaciones
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AlertsGateway {
    /**
     * UC_ALR_01: Obtener todas las alertas
     */
    async getAlerts() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch alerts');
        }

        return response.json();
    }

    /**
     * UC_ALR_02: Crear nueva alerta
     */
    async createAlert(config) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create alert');
        }

        return response.json();
    }

    /**
     * Actualizar alerta existente
     */
    async updateAlert(alertId, config) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            throw new Error('Failed to update alert');
        }

        return response.json();
    }

    /**
     * Eliminar alerta
     */
    async deleteAlert(alertId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete alert');
        }

        return response.json();
    }

    /**
     * UC_ALR_03: Obtener historial de alertas disparadas
     */
    async getAlertHistory(filters = {}) {
        const token = localStorage.getItem('accessToken');
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/alerts/history?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch alert history');
        }

        return response.json();
    }

    /**
     * UC_ALR_05: Obtener plantillas de alertas
     */
    async getTemplates() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/templates`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch templates');
        }

        return response.json();
    }

    /**
     * Obtener plantilla por ID
     */
    async getTemplateById(templateId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/templates/${templateId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch template');
        }

        return response.json();
    }

    /**
     * UC_ALR_04: Suscribirse a una alerta
     */
    async subscribeToAlert(alertId, channels, frequency) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                alert_id: alertId,
                channels,
                frequency,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to subscribe to alert');
        }

        return response.json();
    }

    /**
     * Desuscribirse de una alerta
     */
    async unsubscribeFromAlert(alertId) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/subscriptions/${alertId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to unsubscribe from alert');
        }

        return response.json();
    }

    /**
     * Obtener mis suscripciones
     */
    async getMySubscriptions() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/subscriptions/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch subscriptions');
        }

        return response.json();
    }

    /**
     * Actualizar preferencias de suscripción
     */
    async updateSubscriptionPreferences(preferences) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/subscriptions/preferences`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        });

        if (!response.ok) {
            throw new Error('Failed to update preferences');
        }

        return response.json();
    }

    /**
     * Exportar historial de alertas
     */
    async exportAlertHistory(format = 'csv', filters = {}) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/history/export`, {
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
            throw new Error('Failed to export history');
        }

        return response.blob();
    }

    /**
     * Validar condición de alerta
     */
    async validateCondition(condition) {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/validate-condition`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(condition),
        });

        if (!response.ok) {
            throw new Error('Invalid condition');
        }

        return response.json();
    }

    /**
     * Obtener métricas disponibles para alertas
     */
    async getAvailableMetrics() {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/alerts/metrics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch metrics');
        }

        return response.json();
    }
}

export default new AlertsGateway();
