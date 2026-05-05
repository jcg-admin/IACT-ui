/**
 * Mock Interceptor
 * Intercepta requests y retorna mock data
 * Funciona con seguridad implementada (CSRF, cookies, etc)
 * 
 * USAR SOLO EN DEVELOPMENT
 */

import { SENSITIVE_FIELDS } from '@config/securityConfig';

class MockInterceptor {
  constructor() {
    this.enabled = process.env.REACT_APP_USE_MOCKS === 'true';
    this.mockDelay = 800; // ms
  }

  /**
   * Interceptar request y retornar mock
   */
  async intercept(url, options) {
    if (!this.enabled) {
      return null; // Pass through a apiService real
    }

    // Simular delay de red
    await this._delay(this.mockDelay);

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    // Logging seguro (sin datos sensibles)
    console.log(`[MOCK] ${method} ${url}`, this._sanitize(body));

    // Rutear a handlers por endpoint
    if (url.includes('/api/token/')) {
      return this._handleLogin(body);
    }
    if (url.includes('/api/logout/')) {
      return this._handleLogout();
    }
    if (url.includes('/api/user/')) {
      return this._handleGetUser();
    }
    if (url.includes('/api/metrics')) {
      return this._handleMetrics();
    }
    if (url.includes('/api/users')) {
      return this._handleUsers(method, body);
    }
    if (url.includes('/api/error-logs/')) {
      return this._handleErrorLog(body);
    }
    if (url.includes('/api/csrf-token/')) {
      return this._handleCSRFToken();
    }

    // TRANSACTION ENDPOINTS
    if (url.includes('/api/transaction/start/')) {
      return this._handleTransactionStart(body);
    }
    if (url.includes('/api/transaction/step/')) {
      return this._handleTransactionStep(body);
    }
    if (url.includes('/api/transaction/confirm/')) {
      return this._handleTransactionConfirm(body);
    }
    if (url.includes('/api/transaction/cancel/')) {
      return this._handleTransactionCancel(body);
    }

    // JOB ENDPOINTS
    if (url.includes('/api/job/start/')) {
      return this._handleJobStart(body);
    }
    if (url.includes('/api/job/status/')) {
      return this._handleJobStatus(url);
    }
    if (url.includes('/api/job/download/')) {
      return this._handleJobDownload(url);
    }
    if (url.includes('/api/job/cancel/')) {
      return this._handleJobCancel(url);
    }

    // ACCESS — UC-ACC-01: asignar funciones (bulk)
    if (url.match(/\/api\/users\/\d+\/functions\/$/) && method === 'POST') {
      return this._handleAssignFunctions(body);
    }

    // ACCESS — UC-ACC-02: revocar funciones (bulk)
    if (url.match(/\/api\/users\/\d+\/functions\/$/) && method === 'DELETE') {
      return this._handleRevokeFunctions(body);
    }

    // ACCESS — UC-ACC-04: asignar grupo de acceso (AGR)
    if (url.match(/\/api\/users\/\d+\/access-groups\/$/)) {
      return this._handleAssignAccessGroup(body);
    }

    // AUDIT — UC-AUD-03: exportar auditoría (async)
    if (url.includes('/api/audit/export/')) {
      return this._handleAuditExport(body);
    }

    // ALERT ENDPOINTS
    if (url.includes('/api/alerts')) {
      return this._handleGetAlerts(url);
    }

    // Default 404
    return this._error(404, 'Not found');
  }

  /**
   * Login - Retornar usuario sin tokens
   * Tokens configurados en httpOnly cookies por backend
   */
  _handleLogin(credentials) {
    if (!credentials || !credentials.username || !credentials.password) {
      return this._error(400, 'Missing credentials');
    }

    // Validar credenciales mock
    if (credentials.username === 'demo' && credentials.password === 'demo123') {
      // NO retornar tokens (serian en httpOnly cookies en real)
      return {
        status: 200,
        data: {
          user: {
            id: 1,
            username: 'demo',
            email: 'demo@example.com',
            first_name: 'Demo',
            last_name: 'User',
            role: 'admin',
            date_joined: new Date().toISOString(),
          },
          // NO retornar access/refresh (estan en cookies)
        },
      };
    }

    return this._error(401, 'Invalid credentials');
  }

  /**
   * Logout
   */
  _handleLogout() {
    // Borrar cookies (en real seria backend)
    return {
      status: 200,
      data: { detail: 'Logout successful' },
    };
  }

  /**
   * Get current user
   */
  _handleGetUser() {
    return {
      status: 200,
      data: {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'admin',
        date_joined: new Date().toISOString(),
      },
    };
  }

  /**
   * Get metrics
   */
  _handleMetrics() {
    return {
      status: 200,
      data: {
        metrics: [
          {
            id: 1,
            label: 'Total Users',
            value: 1234,
            change: 12.5,
            trend: 'up',
          },
          {
            id: 2,
            label: 'Active Sessions',
            value: 456,
            change: -5.2,
            trend: 'down',
          },
          {
            id: 3,
            label: 'API Requests',
            value: 89234,
            change: 23.1,
            trend: 'up',
          },
          {
            id: 4,
            label: 'Error Rate',
            value: 0.12,
            change: -0.05,
            trend: 'down',
          },
        ],
      },
    };
  }

  /**
   * Handle users endpoint
   */
  _handleUsers(method, body) {
    if (method === 'GET') {
      return {
        status: 200,
        data: {
          results: this._generateMockUsers(25),
          count: 1250,
          next: null,
          previous: null,
        },
      };
    }

    if (method === 'POST') {
      if (!body.username || !body.email) {
        return this._error(400, 'Missing required fields');
      }
      return {
        status: 201,
        data: {
          id: 999,
          username: body.username,
          email: body.email,
          first_name: body.first_name || '',
          last_name: body.last_name || '',
          role: 'user',
          date_joined: new Date().toISOString(),
        },
      };
    }

    return this._error(405, 'Method not allowed');
  }

  /**
   * Generate mock users
   */
  _generateMockUsers(count) {
    const roles = ['admin', 'user', 'moderator'];
    // UC-USR-01: campo state con enum ACTIVE/INACTIVE/BLOCKED/ELIMINATED
    const states = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'BLOCKED'];
    const users = [];

    for (let i = 0; i < count; i++) {
      users.push({
        id: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        first_name: `User${i + 1}`,
        last_name: `Test`,
        role: roles[i % roles.length],
        state: states[i % states.length],
        date_joined: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return users;
  }

  /**
   * Handle error logging
   */
  _handleErrorLog(errorData) {
    if (!errorData || !errorData.code) {
      return this._error(400, 'Missing error code');
    }

    console.log('[MOCK ERROR LOG]', {
      code: errorData.code,
      message: errorData.message,
      level: errorData.level,
    });

    return {
      status: 201,
      data: {
        id: Math.random(),
        code: errorData.code,
        message: errorData.message,
        level: errorData.level,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Handle CSRF token request
   */
  _handleCSRFToken() {
    // Generar token mock
    const token = this._generateCSRFToken();

    return {
      status: 200,
      data: { csrfToken: token },
      headers: {
        'Set-Cookie': `csrftoken=${token}; Path=/; HttpOnly; SameSite=Strict`,
      },
    };
  }

  /**
   * Generar CSRF token mock
   */
  _generateCSRFToken() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Error response
   */
  _error(status, message) {
    return {
      status,
      data: {
        detail: message,
        error: message,
      },
    };
  }

  /**
   * Sanitizar data para logging
   */
  _sanitize(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Redactar campos sensibles
    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Delay promise
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ====== TRANSACTION HANDLERS ======

  _handleTransactionStart(body) {
    if (!body || !body.type) {
      return this._error(400, 'Missing transaction type');
    }

    return {
      status: 200,
      data: {
        txId: `tx-${Date.now()}`,
        type: body.type,
        step: 0,
        totalSteps: body.type === 'assign_function' ? 3 : body.type === 'create_user' ? 4 : 2,
        status: 'initiated',
        conflicts: body.type === 'assign_function' ? this._generateMockConflicts(2) : []
      }
    };
  }

  _handleTransactionStep(body) {
    if (!body || !body.transaction_id) {
      return this._error(400, 'Missing transaction_id');
    }

    return {
      status: 200,
      data: {
        step: (body.step || 0) + 1,
        status: 'validating',
        conflicts: []
      }
    };
  }

  _handleTransactionConfirm(body) {
    if (!body || !body.transaction_id) {
      return this._error(400, 'Missing transaction_id');
    }

    return {
      status: 200,
      data: {
        status: 'completed',
        result: { id: Math.random(), timestamp: new Date().toISOString() }
      }
    };
  }

  _handleTransactionCancel(body) {
    return {
      status: 200,
      data: { status: 'cancelled' }
    };
  }

  _generateMockConflicts(count) {
    const _conflicts = [];
    for (let i = 0; i < count; i++) {
      _conflicts.push({
        id: `conflict-${i}`,
        field: `Function-${i + 1}`,
        message: `Conflicto de separación de funciones detectado`,
        severity: 'warning',
        suggestion: 'Remover función conflictiva'
      });
    }
    return _conflicts;
  }

  // ====== JOB HANDLERS ======

  _handleJobStart(body) {
    if (!body || !body.type) {
      return this._error(400, 'Missing job type');
    }

    return {
      status: 200,
      data: {
        jobId: `job-${Date.now()}`,
        type: body.type,
        status: 'queued',
        progress: 0,
        eta: 60
      }
    };
  }

  _handleJobStatus(url) {
    const _jobId = url.split('/').slice(-2)[0];

    return {
      status: 200,
      data: {
        jobId: _jobId,
        status: 'processing',
        progress: Math.floor(Math.random() * 100),
        eta: Math.floor(Math.random() * 60)
      }
    };
  }

  _handleJobDownload(url) {
    // Mock retorna CSV content
    const _csv = 'id,name,email\n1,User1,user1@example.com\n2,User2,user2@example.com';
    return {
      status: 200,
      data: _csv,
      blob: true
    };
  }

  _handleJobCancel(url) {
    return {
      status: 200,
      data: { status: 'cancelled' }
    };
  }

  // ====== ACCESS HANDLERS (UC-ACC-01, UC-ACC-02, UC-ACC-04) ======

  _handleAssignFunctions(body) {
    if (!body || !body.function_ids || !Array.isArray(body.function_ids)) {
      return this._error(400, 'function_ids array required');
    }
    return {
      status: 201,
      data: {
        assigned: body.function_ids.length,
        expires_at: body.expires_at || null,
        timestamp: new Date().toISOString(),
      },
    };
  }

  _handleRevokeFunctions(body) {
    if (!body || !body.function_ids || !Array.isArray(body.function_ids)) {
      return this._error(400, 'function_ids array required');
    }
    return {
      status: 200,
      data: {
        revoked: body.function_ids.length,
        revoke_reason: body.revoke_reason || null,
        timestamp: new Date().toISOString(),
      },
    };
  }

  _handleAssignAccessGroup(body) {
    if (!body || !body.agr_id) {
      return this._error(400, 'agr_id required');
    }
    return {
      status: 201,
      data: {
        agr_id: body.agr_id,
        expires_at: body.expires_at || null,
        timestamp: new Date().toISOString(),
      },
    };
  }

  _handleAuditExport(body) {
    if (!body || !body.format) {
      return this._error(400, 'format required');
    }
    return {
      status: 202,
      data: {
        job_id: `audit-export-${Date.now()}`,
        format: body.format,
        status: 'queued',
      },
    };
  }

  // ====== ALERT HANDLERS ======

  _handleGetAlerts(url) {
    return {
      status: 200,
      data: {
        alerts: [
          {
            id: 'alert-1',
            title: 'New User Login',
            message: 'User logged in from new device',
            severity: 'info',
            timestamp: new Date().toISOString(),
            isRead: false
          },
          {
            id: 'alert-2',
            title: 'Security Alert',
            message: 'Multiple failed login attempts detected',
            severity: 'warning',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            isRead: false
          }
        ]
      }
    };
  }
}

const mockInterceptor = new MockInterceptor();

export default mockInterceptor;
export { MockInterceptor };
