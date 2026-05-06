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

    // REPORTS — UC-RPT-04: exportar reporte (async job)
    if (url.includes('/api/reports/export/')) {
      return {
        status: 202,
        data: { job_id: `report-export-${Date.now()}` },
      }
    }

    // ACCESS — UC-PERM-02: revocar grupo de usuario
    if (url.match(/\/api\/users\/[^/]+\/access-groups\/[^/]+\/$/) && method === 'DELETE') {
      return { status: 200, data: { revoked: true } }
    }

    // AUDIT — UC-AUD-03: exportar auditoría (async)
    if (url.includes('/api/audit/export/')) {
      return this._handleAuditExport(body);
    }

    // REPORTS: IVR menu distribution (prom_llamadas)
    if (url.includes('/api/reports/ivr-menus/')) {
      const params = options.params || {}
      return this._handleIvrMenus(params)
    }

    // REPORTS: unique clients per segment
    if (url.includes('/api/reports/unique-clients/')) {
      const params = options.params || {}
      return this._handleUniqueClients(params)
    }

    // REPORTS — UC-019: transferencias IVR por centro
    if (url.includes('/api/reports/transfers/')) {
      const params = options.params || {}
      return this._handleTransfersByCentro(params)
    }

    // REPORTS: IVR agents (virtual agents = menus)
    if (url.includes('/api/reports/agents/')) {
      const params = options.params || {}
      return this._handleAgentsReport(params)
    }

    // REPORTS: transfer queues by centro
    if (url.includes('/api/reports/queues/')) {
      const params = options.params || {}
      return this._handleQueuesReport(params)
    }

    // REPORTS: IVR campaign menus
    if (url.includes('/api/reports/campaigns/')) {
      const params = options.params || {}
      return this._handleCampaignsReport(params)
    }

    if (url.includes('/api/reports/history/')) {
      const params = options.params || {}
      return this._handleReportHistory(params)
    }

    // REPORTS — UC-RPT-10: vistas guardadas
    if (url.includes('/api/reports/saved-views/')) {
      return this._handleSavedViews(method, url)
    }

    // ADMIN — UC-ADM-02: catálogo de funciones RBAC
    if (url.includes('/api/admin/functions/')) {
      return this._handleAdminFunctions(method, body)
    }

    // ADMIN — UC-ADM-03: catálogo de AGRs
    if (url.includes('/api/admin/agr/')) {
      return this._handleAdminAGR(method, body)
    }

    if (url.includes('/api/admin/separation-rules/')) {
      return this._handleSeparationRules()
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

  // ====== REPORTS HANDLERS ======

  _handleTransfersByCentro(params) {
    const segmento = params.segmento || 'Nacional'
    const trimestre = params.trimestre || 'Q01_25'

    const ALL_ROWS = [
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020086', menu: 'cliente_colgo',     opcion: 'SIN_OPCION', total_llamadas: 901808, porcentaje: 7.7450435, misma_linea:  78589, linea_diferente: 177548, no_digito_telefono: 645671 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020085', menu: 'cliente_colgo',     opcion: 'SIN_OPCION', total_llamadas: 754321, porcentaje: 6.4726150, misma_linea:  65230, linea_diferente: 148760, no_digito_telefono: 540331 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020010', menu: 'menu_principal',    opcion: 'OPCION_1',   total_llamadas: 612450, porcentaje: 5.2565218, misma_linea:  52100, linea_diferente: 121800, no_digito_telefono: 438550 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020011', menu: 'menu_principal',    opcion: 'OPCION_2',   total_llamadas: 540102, porcentaje: 4.6357680, misma_linea:  47220, linea_diferente: 110540, no_digito_telefono: 382342 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020015', menu: 'atencion_cliente',  opcion: 'OPCION_1',   total_llamadas: 489730, porcentaje: 4.2039080, misma_linea:  41800, linea_diferente:  98760, no_digito_telefono: 349170 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020020', menu: 'atencion_cliente',  opcion: 'OPCION_2',   total_llamadas: 423560, porcentaje: 3.6353600, misma_linea:  37100, linea_diferente:  86200, no_digito_telefono: 300260 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020030', menu: 'ventas',            opcion: 'OPCION_1',   total_llamadas: 381200, porcentaje: 3.2718400, misma_linea:  32800, linea_diferente:  77400, no_digito_telefono: 271000 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020031', menu: 'ventas',            opcion: 'OPCION_2',   total_llamadas: 354800, porcentaje: 3.0453700, misma_linea:  30500, linea_diferente:  72100, no_digito_telefono: 252200 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020040', menu: 'soporte_tecnico',   opcion: 'OPCION_1',   total_llamadas: 312440, porcentaje: 2.6817000, misma_linea:  27200, linea_diferente:  64100, no_digito_telefono: 221140 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020041', menu: 'soporte_tecnico',   opcion: 'OPCION_2',   total_llamadas: 287650, porcentaje: 2.4688000, misma_linea:  24900, linea_diferente:  58700, no_digito_telefono: 204050 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020050', menu: 'cobranza',          opcion: 'OPCION_1',   total_llamadas: 254300, porcentaje: 2.1827000, misma_linea:  21800, linea_diferente:  51900, no_digito_telefono: 180600 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020051', menu: 'cobranza',          opcion: 'OPCION_2',   total_llamadas: 231800, porcentaje: 1.9896000, misma_linea:  19900, linea_diferente:  47300, no_digito_telefono: 164600 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020060', menu: 'reclamaciones',     opcion: 'OPCION_1',   total_llamadas: 198450, porcentaje: 1.7033000, misma_linea:  17100, linea_diferente:  40500, no_digito_telefono: 140850 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020061', menu: 'reclamaciones',     opcion: 'OPCION_2',   total_llamadas: 175230, porcentaje: 1.5043000, misma_linea:  15100, linea_diferente:  35700, no_digito_telefono: 124430 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Nacional', centro_transferencia: '19020070', menu: 'informacion',       opcion: 'OPCION_1',   total_llamadas: 152100, porcentaje: 1.3056000, misma_linea:  13100, linea_diferente:  31000, no_digito_telefono: 108000 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Puebla',   centro_transferencia: '29020086', menu: 'cliente_colgo',     opcion: 'SIN_OPCION', total_llamadas: 120300, porcentaje: 8.1200000, misma_linea:  10400, linea_diferente:  24500, no_digito_telefono:  85400 },
      { trimestre: 'Q01_25', fecha: '202503', '800_transfer': 'Puebla',   centro_transferencia: '29020085', menu: 'menu_principal',    opcion: 'OPCION_1',   total_llamadas:  98760, porcentaje: 6.6700000, misma_linea:   8540, linea_diferente:  20100, no_digito_telefono:  70120 },
      { trimestre: 'Q02_25', fecha: '202506', '800_transfer': 'Nacional', centro_transferencia: '19020086', menu: 'cliente_colgo',     opcion: 'SIN_OPCION', total_llamadas: 934150, porcentaje: 7.9800000, misma_linea:  81200, linea_diferente: 183600, no_digito_telefono: 669350 },
      { trimestre: 'Q02_25', fecha: '202506', '800_transfer': 'Nacional', centro_transferencia: '19020085', menu: 'cliente_colgo',     opcion: 'SIN_OPCION', total_llamadas: 780100, porcentaje: 6.6700000, misma_linea:  67500, linea_diferente: 153900, no_digito_telefono: 558700 },
      { trimestre: 'Q03_25', fecha: '202509', '800_transfer': 'Nacional', centro_transferencia: '19020086', menu: 'cliente_colgo',     opcion: 'SIN_OPCION', total_llamadas: 960200, porcentaje: 8.1300000, misma_linea:  83400, linea_diferente: 188600, no_digito_telefono: 688200 },
    ]

    const rows = ALL_ROWS.filter(
      (r) => r['800_transfer'] === segmento && r.trimestre === trimestre
    )

    return {
      status: 200,
      data: rows,
    }
  }

  _handleIvrMenus(params) {
    const seg = (params.segmento  || 'Nacional')
    const tri = (params.trimestre || 'Q01_25')

    const ALL = [
      // Nacional Q01_25
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'CLIENTE_COLGO',               promedio_llamadas:1.82, min_llamadas_x_cliente:1, max_llamadas_x_cliente:7320,  total_llamadas:2507905 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-FALLAINTERNET',            promedio_llamadas:1.62, min_llamadas_x_cliente:1, max_llamadas_x_cliente:7274,  total_llamadas:1650078 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'DESBORDE_CABECERA',            promedio_llamadas:2.27, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4392,  total_llamadas:1514344 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'NOTMX-SEGUIMIENTOINSTALACION', promedio_llamadas:2.03, min_llamadas_x_cliente:1, max_llamadas_x_cliente:15869, total_llamadas:1107914 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'VACIO',                        promedio_llamadas:1.42, min_llamadas_x_cliente:1, max_llamadas_x_cliente:10151, total_llamadas:894019  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-MADT-DETALLE',             promedio_llamadas:1.56, min_llamadas_x_cliente:1, max_llamadas_x_cliente:8439,  total_llamadas:538633  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-SALDOOPAGOS',              promedio_llamadas:1.94, min_llamadas_x_cliente:1, max_llamadas_x_cliente:862,   total_llamadas:481015  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'SINOPCION_CABECERA',           promedio_llamadas:1.24, min_llamadas_x_cliente:1, max_llamadas_x_cliente:2186,  total_llamadas:362598  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'DESBORDE_PROMOCIONAL',         promedio_llamadas:1.68, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3663,  total_llamadas:337120  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-FALLASLINEA',              promedio_llamadas:1.36, min_llamadas_x_cliente:1, max_llamadas_x_cliente:2687,  total_llamadas:333585  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'NOTMX-CONT-CONTRATACION',      promedio_llamadas:1.51, min_llamadas_x_cliente:1, max_llamadas_x_cliente:6622,  total_llamadas:296202  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'MARQUE3',                      promedio_llamadas:1.29, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3966,  total_llamadas:231828  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'NOTMX-CONT-PORTABILIDAD',      promedio_llamadas:1.41, min_llamadas_x_cliente:1, max_llamadas_x_cliente:11217, total_llamadas:154569  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-FALLASEGQJA',              promedio_llamadas:1.30, min_llamadas_x_cliente:1, max_llamadas_x_cliente:812,   total_llamadas:118325  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-SALDOS-WT',                promedio_llamadas:1.16, min_llamadas_x_cliente:1, max_llamadas_x_cliente:1326,  total_llamadas:102885  },
      // Puebla Q01_25
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'CLIENTE_COLGO',               promedio_llamadas:1.73, min_llamadas_x_cliente:1, max_llamadas_x_cliente:322,   total_llamadas:117215  },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'RES-FALLAS_2024',             promedio_llamadas:1.67, min_llamadas_x_cliente:1, max_llamadas_x_cliente:112,   total_llamadas:109507  },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'RES-CONTRATACIONINFINITUM_2024', promedio_llamadas:1.73, min_llamadas_x_cliente:1, max_llamadas_x_cliente:184, total_llamadas:63613  },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'NOTMX-SEGUIMIENTOINSTALACION',promedio_llamadas:1.81, min_llamadas_x_cliente:1, max_llamadas_x_cliente:41,   total_llamadas:40515   },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'RES-SALDOSPAGOS_2024',        promedio_llamadas:1.73, min_llamadas_x_cliente:1, max_llamadas_x_cliente:64,   total_llamadas:39401   },
      // Nacional Q02_25
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'CLIENTE_COLGO',               promedio_llamadas:1.75, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4196,  total_llamadas:2752431 },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'DESBORDE_CABECERA',           promedio_llamadas:2.26, min_llamadas_x_cliente:1, max_llamadas_x_cliente:2532,  total_llamadas:1882586 },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'NOTMX-SEGUIMIENTOINSTALACION',promedio_llamadas:1.97, min_llamadas_x_cliente:1, max_llamadas_x_cliente:2268,  total_llamadas:1231529 },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'RES-FALLAINTERNET',           promedio_llamadas:1.49, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4925,  total_llamadas:1126836 },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'VACIO',                       promedio_llamadas:1.44, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3949,  total_llamadas:1117580 },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'RES_FALLA_STOP',              promedio_llamadas:1.70, min_llamadas_x_cliente:1, max_llamadas_x_cliente:576,   total_llamadas:802032  },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'RES-MADT-DETALLE',            promedio_llamadas:1.52, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4968,  total_llamadas:529478  },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'RES-SALDOOPAGOS',             promedio_llamadas:1.64, min_llamadas_x_cliente:1, max_llamadas_x_cliente:458,   total_llamadas:438310  },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'SINOPCION_CABECERA',          promedio_llamadas:1.22, min_llamadas_x_cliente:1, max_llamadas_x_cliente:383,   total_llamadas:418662  },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'DESBORDE_PROMOCIONAL',        promedio_llamadas:1.72, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3669,  total_llamadas:381962  },
      // Puebla Q02_25
      { trimestre:'Q02_25', segmento:'Puebla',   cMenu:'DESBORDE_CABECERA',           promedio_llamadas:1.79, min_llamadas_x_cliente:1, max_llamadas_x_cliente:243,   total_llamadas:136984  },
      { trimestre:'Q02_25', segmento:'Puebla',   cMenu:'CLIENTE_COLGO',               promedio_llamadas:1.55, min_llamadas_x_cliente:1, max_llamadas_x_cliente:278,   total_llamadas:122636  },
      { trimestre:'Q02_25', segmento:'Puebla',   cMenu:'RES-FALLAS_2024',             promedio_llamadas:1.46, min_llamadas_x_cliente:1, max_llamadas_x_cliente:322,   total_llamadas:87741   },
      { trimestre:'Q02_25', segmento:'Puebla',   cMenu:'RES-CONTRATACIONINFINITUM_2024', promedio_llamadas:1.73, min_llamadas_x_cliente:1, max_llamadas_x_cliente:256, total_llamadas:69076  },
      { trimestre:'Q02_25', segmento:'Puebla',   cMenu:'RES_FALLA_STOP',              promedio_llamadas:1.55, min_llamadas_x_cliente:1, max_llamadas_x_cliente:37,   total_llamadas:60916   },
      // Nacional Q03_25
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'CLIENTE_COLGO',               promedio_llamadas:1.67, min_llamadas_x_cliente:1, max_llamadas_x_cliente:5595,  total_llamadas:1509164 },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'DESBORDE_CABECERA',           promedio_llamadas:2.54, min_llamadas_x_cliente:1, max_llamadas_x_cliente:752,   total_llamadas:1169335 },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'NOTMX-SEGUIMIENTOINSTALACION',promedio_llamadas:1.99, min_llamadas_x_cliente:1, max_llamadas_x_cliente:1940,  total_llamadas:859797  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'RES_FALLA_STOP',              promedio_llamadas:1.61, min_llamadas_x_cliente:1, max_llamadas_x_cliente:461,   total_llamadas:769015  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'VACIO',                       promedio_llamadas:1.47, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3317,  total_llamadas:767918  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'RES-FALLAINTERNET',           promedio_llamadas:1.56, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4367,  total_llamadas:517926  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'RES-MADT-DETALLE',            promedio_llamadas:1.60, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4573,  total_llamadas:404483  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'SINOPCION_CABECERA',          promedio_llamadas:1.28, min_llamadas_x_cliente:1, max_llamadas_x_cliente:331,   total_llamadas:326376  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'RES-SALDOOPAGOS',             promedio_llamadas:1.82, min_llamadas_x_cliente:1, max_llamadas_x_cliente:494,   total_llamadas:319869  },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'DESBORDE_PROMOCIONAL',        promedio_llamadas:1.72, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3074,  total_llamadas:263180  },
      // Puebla Q03_25
      { trimestre:'Q03_25', segmento:'Puebla',   cMenu:'NUMERO TELMEX',               promedio_llamadas:1.66, min_llamadas_x_cliente:1, max_llamadas_x_cliente:43,   total_llamadas:52010   },
      { trimestre:'Q03_25', segmento:'Puebla',   cMenu:'DESBORDE_CABECERA',           promedio_llamadas:1.87, min_llamadas_x_cliente:1, max_llamadas_x_cliente:41,   total_llamadas:40896   },
      { trimestre:'Q03_25', segmento:'Puebla',   cMenu:'CLIENTE_COLGO',               promedio_llamadas:1.33, min_llamadas_x_cliente:1, max_llamadas_x_cliente:131,  total_llamadas:39331   },
      { trimestre:'Q03_25', segmento:'Puebla',   cMenu:'RES_FALLA_STOP',              promedio_llamadas:1.51, min_llamadas_x_cliente:1, max_llamadas_x_cliente:28,   total_llamadas:36932   },
      { trimestre:'Q03_25', segmento:'Puebla',   cMenu:'RES-CONTRATACIONINFINITUM_2024', promedio_llamadas:1.58, min_llamadas_x_cliente:1, max_llamadas_x_cliente:110, total_llamadas:35754 },
    ]

    const rows = ALL.filter((r) => r.segmento === seg && r.trimestre === tri)
    return { status: 200, data: rows }
  }

  _handleUniqueClients(params) {
    const ALL = [
      { trimestre: 'Q01_25', segmento: 'Nacional_B', clientes_unicos: 3056531 },
      { trimestre: 'Q01_25', segmento: 'Puebla',     clientes_unicos: 155507  },
      { trimestre: 'Q02_25', segmento: 'Nacional_B', clientes_unicos: 1234307 },
      { trimestre: 'Q02_25', segmento: 'Puebla',     clientes_unicos: 266185  },
      { trimestre: 'Q02_25', segmento: 'Nacional_A', clientes_unicos: 2440333 },
      { trimestre: 'Q03_25', segmento: 'Nacional_B', clientes_unicos: 36756   },
      { trimestre: 'Q03_25', segmento: 'Puebla',     clientes_unicos: 132377  },
      { trimestre: 'Q03_25', segmento: 'Nacional_A', clientes_unicos: 2296002 },
    ]
    const rows = ALL.filter((r) => {
      if (params.trimestre && r.trimestre !== params.trimestre) return false
      if (params.segmento  && r.segmento  !== params.segmento)  return false
      return true
    })
    return { status: 200, data: rows }
  }

  _handleAgentsReport(params) {
    const tri = params.trimestre || 'Q01_25'
    const seg = params.segmento  || 'Nacional'
    const ALL = [
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'CLIENTE_COLGO',          promedio_llamadas:1.82, min_llamadas_x_cliente:1, max_llamadas_x_cliente:7320,  total_llamadas:2507905 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'DESBORDE_CABECERA',      promedio_llamadas:2.01, min_llamadas_x_cliente:1, max_llamadas_x_cliente:5103,  total_llamadas:1514344 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'VACIO',                  promedio_llamadas:1.47, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3317,  total_llamadas:1013259 },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-FALLAINTERNET',      promedio_llamadas:1.56, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4367,  total_llamadas:806020  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-MADT-DETALLE',       promedio_llamadas:1.60, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4573,  total_llamadas:721424  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'SINOPCION_CABECERA',     promedio_llamadas:1.28, min_llamadas_x_cliente:1, max_llamadas_x_cliente:331,   total_llamadas:596843  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'RES-SALDOOPAGOS',        promedio_llamadas:1.82, min_llamadas_x_cliente:1, max_llamadas_x_cliente:494,   total_llamadas:481621  },
      { trimestre:'Q01_25', segmento:'Nacional', cMenu:'DESBORDE_PROMOCIONAL',   promedio_llamadas:1.72, min_llamadas_x_cliente:1, max_llamadas_x_cliente:3074,  total_llamadas:341839  },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'NUMERO TELMEX',          promedio_llamadas:1.66, min_llamadas_x_cliente:1, max_llamadas_x_cliente:43,   total_llamadas:52010   },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'DESBORDE_CABECERA',      promedio_llamadas:1.87, min_llamadas_x_cliente:1, max_llamadas_x_cliente:41,   total_llamadas:40896   },
      { trimestre:'Q01_25', segmento:'Puebla',   cMenu:'CLIENTE_COLGO',          promedio_llamadas:1.33, min_llamadas_x_cliente:1, max_llamadas_x_cliente:131,  total_llamadas:39331   },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'CLIENTE_COLGO',          promedio_llamadas:1.79, min_llamadas_x_cliente:1, max_llamadas_x_cliente:6990,  total_llamadas:2350120 },
      { trimestre:'Q02_25', segmento:'Nacional', cMenu:'DESBORDE_CABECERA',      promedio_llamadas:1.98, min_llamadas_x_cliente:1, max_llamadas_x_cliente:4800,  total_llamadas:1420000 },
      { trimestre:'Q02_25', segmento:'Puebla',   cMenu:'NUMERO TELMEX',          promedio_llamadas:1.62, min_llamadas_x_cliente:1, max_llamadas_x_cliente:38,   total_llamadas:48500   },
      { trimestre:'Q03_25', segmento:'Nacional', cMenu:'CLIENTE_COLGO',          promedio_llamadas:1.85, min_llamadas_x_cliente:1, max_llamadas_x_cliente:7100,  total_llamadas:2480000 },
      { trimestre:'Q03_25', segmento:'Puebla',   cMenu:'CLIENTE_COLGO',          promedio_llamadas:1.35, min_llamadas_x_cliente:1, max_llamadas_x_cliente:125,  total_llamadas:37200   },
    ]
    const rows = ALL.filter((r) => r.segmento === seg && r.trimestre === tri)
    return { status: 200, data: rows }
  }

  _handleQueuesReport(params) {
    const tri = params.trimestre || 'Q01_25'
    const seg = params.segmento  || 'Nacional'
    const ALL = [
      { trimestre:'Q01_25', segmento:'Nacional', centro_transferencia:'19020086', total_llamadas:901808,  misma_linea:78589,  linea_diferente:177548, no_digito_telefono:645671 },
      { trimestre:'Q01_25', segmento:'Nacional', centro_transferencia:'19020032', total_llamadas:756432,  misma_linea:65210,  linea_diferente:148320, no_digito_telefono:542902 },
      { trimestre:'Q01_25', segmento:'Nacional', centro_transferencia:'19020018', total_llamadas:612877,  misma_linea:54100,  linea_diferente:122400, no_digito_telefono:436377 },
      { trimestre:'Q01_25', segmento:'Nacional', centro_transferencia:'19020051', total_llamadas:489230,  misma_linea:43500,  linea_diferente:96800,  no_digito_telefono:348930 },
      { trimestre:'Q01_25', segmento:'Nacional', centro_transferencia:'19020074', total_llamadas:378910,  misma_linea:34200,  linea_diferente:74500,  no_digito_telefono:270210 },
      { trimestre:'Q01_25', segmento:'Puebla',   centro_transferencia:'22020011', total_llamadas:98450,   misma_linea:9200,   linea_diferente:19800,  no_digito_telefono:69450  },
      { trimestre:'Q01_25', segmento:'Puebla',   centro_transferencia:'22020025', total_llamadas:75320,   misma_linea:6800,   linea_diferente:15200,  no_digito_telefono:53320  },
      { trimestre:'Q02_25', segmento:'Nacional', centro_transferencia:'19020086', total_llamadas:880000,  misma_linea:75000,  linea_diferente:172000, no_digito_telefono:633000 },
      { trimestre:'Q02_25', segmento:'Nacional', centro_transferencia:'19020032', total_llamadas:740000,  misma_linea:63000,  linea_diferente:145000, no_digito_telefono:532000 },
      { trimestre:'Q02_25', segmento:'Puebla',   centro_transferencia:'22020011', total_llamadas:95000,   misma_linea:8900,   linea_diferente:19000,  no_digito_telefono:67100  },
      { trimestre:'Q03_25', segmento:'Nacional', centro_transferencia:'19020086', total_llamadas:860000,  misma_linea:73000,  linea_diferente:168000, no_digito_telefono:619000 },
      { trimestre:'Q03_25', segmento:'Puebla',   centro_transferencia:'22020011', total_llamadas:92000,   misma_linea:8600,   linea_diferente:18500,  no_digito_telefono:64900  },
    ]
    const rows = ALL.filter((r) => r.segmento === seg && r.trimestre === tri)
    return { status: 200, data: rows }
  }

  _handleCampaignsReport(params) {
    const tri = params.trimestre || 'Q01_25'
    const seg = params.segmento  || 'Nacional'
    const ALL = [
      { trimestre:'Q01_25', segmento:'Nacional', campana:'NOTMX-CONT-CONTRATACION',     total_llamadas:312450, promedio_llamadas:2.14 },
      { trimestre:'Q01_25', segmento:'Nacional', campana:'NOTMX-CONT-PORTABILIDAD',     total_llamadas:187320, promedio_llamadas:1.98 },
      { trimestre:'Q01_25', segmento:'Nacional', campana:'RES-CONTRATACIONINFINITUM',   total_llamadas:145600, promedio_llamadas:2.31 },
      { trimestre:'Q01_25', segmento:'Nacional', campana:'DESBORDE_PROMOCIONAL',        total_llamadas:341839, promedio_llamadas:1.72 },
      { trimestre:'Q01_25', segmento:'Nacional', campana:'NOTMX-CONT-CONTRATACION_B2B', total_llamadas:89200,  promedio_llamadas:2.45 },
      { trimestre:'Q01_25', segmento:'Puebla',   campana:'NOTMX-CONT-CONTRATACION',     total_llamadas:28500,  promedio_llamadas:1.87 },
      { trimestre:'Q01_25', segmento:'Puebla',   campana:'RES-CONTRATACIONINFINITUM_2024', total_llamadas:35754, promedio_llamadas:1.58 },
      { trimestre:'Q02_25', segmento:'Nacional', campana:'NOTMX-CONT-CONTRATACION',     total_llamadas:298700, promedio_llamadas:2.08 },
      { trimestre:'Q02_25', segmento:'Nacional', campana:'NOTMX-CONT-PORTABILIDAD',     total_llamadas:178400, promedio_llamadas:1.91 },
      { trimestre:'Q02_25', segmento:'Puebla',   campana:'NOTMX-CONT-CONTRATACION',     total_llamadas:26800,  promedio_llamadas:1.82 },
      { trimestre:'Q03_25', segmento:'Nacional', campana:'NOTMX-CONT-CONTRATACION',     total_llamadas:285000, promedio_llamadas:2.01 },
      { trimestre:'Q03_25', segmento:'Nacional', campana:'NOTMX-CONT-PORTABILIDAD',     total_llamadas:170000, promedio_llamadas:1.88 },
      { trimestre:'Q03_25', segmento:'Puebla',   campana:'NOTMX-CONT-CONTRATACION',     total_llamadas:24500,  promedio_llamadas:1.75 },
    ]
    const rows = ALL.filter((r) => r.segmento === seg && r.trimestre === tri)
    return { status: 200, data: rows }
  }

  _handleReportHistory(params) {
    const periodo = params.periodo || 'last_7d'
    const seg = params.segmento || ''
    const ALL = [
      { periodo: 'last_7d',  segmento: 'Nacional', dimension: 'menu',     total_llamadas: 88500,  fecha_inicio: '2026-04-29', fecha_fin: '2026-05-06' },
      { periodo: 'last_7d',  segmento: 'Nacional', dimension: 'campana',  total_llamadas: 42300,  fecha_inicio: '2026-04-29', fecha_fin: '2026-05-06' },
      { periodo: 'last_7d',  segmento: 'Puebla',   dimension: 'menu',     total_llamadas: 9200,   fecha_inicio: '2026-04-29', fecha_fin: '2026-05-06' },
      { periodo: 'last_30d', segmento: 'Nacional', dimension: 'menu',     total_llamadas: 362000, fecha_inicio: '2026-04-06', fecha_fin: '2026-05-06' },
      { periodo: 'last_30d', segmento: 'Nacional', dimension: 'campana',  total_llamadas: 178500, fecha_inicio: '2026-04-06', fecha_fin: '2026-05-06' },
      { periodo: 'last_30d', segmento: 'Puebla',   dimension: 'menu',     total_llamadas: 38900,  fecha_inicio: '2026-04-06', fecha_fin: '2026-05-06' },
      { periodo: 'last_24h', segmento: 'Nacional', dimension: 'menu',     total_llamadas: 12800,  fecha_inicio: '2026-05-05', fecha_fin: '2026-05-06' },
      { periodo: 'last_90d', segmento: 'Nacional', dimension: 'menu',     total_llamadas: 1020000, fecha_inicio: '2026-02-05', fecha_fin: '2026-05-06' },
      { periodo: 'year-to-date', segmento: 'Nacional', dimension: 'menu', total_llamadas: 2507905, fecha_inicio: '2026-01-01', fecha_fin: '2026-05-06' },
    ]
    const rows = ALL.filter((r) =>
      r.periodo === periodo && (seg === '' || r.segmento === seg)
    )
    return { status: 200, data: rows }
  }

  // ====== REPORTS — SAVED VIEWS HANDLER (UC-RPT-10) ======

  _handleSavedViews(method, url) {
    const VIEWS = [
      { id: 1, name: 'Agentes Nacional Q01_25',  report_type: 'agents',    filters: { segmento: 'Nacional', trimestre: 'Q01_25' }, created_at: '2026-01-15T10:00:00Z' },
      { id: 2, name: 'Colas Puebla Q01_25',       report_type: 'queues',    filters: { segmento: 'Puebla',   trimestre: 'Q01_25' }, created_at: '2026-02-01T08:30:00Z' },
      { id: 3, name: 'Campañas Nacional Q02_25',  report_type: 'campaigns', filters: { segmento: 'Nacional', trimestre: 'Q02_25' }, created_at: '2026-03-10T14:00:00Z' },
    ]
    if (method === 'GET') {
      return { status: 200, data: { results: VIEWS, count: VIEWS.length } }
    }
    if (method === 'DELETE') {
      const id = parseInt(url.split('/').filter(Boolean).pop(), 10)
      return { status: 204, data: null }
    }
    return this._error(405, 'Method not allowed')
  }

  // ====== ADMIN — RBAC CATALOG HANDLERS (ITER-C: GET only) ======

  _handleAdminFunctions(method, body) {
    if (method === 'POST') {
      if (!body || !body.codename || !body.name) {
        return this._error(400, 'codename and name are required')
      }
      return {
        status: 201,
        data: {
          id: Math.floor(Math.random() * 900) + 100,
          codename: body.codename,
          name: body.name,
          description: body.description || '',
          domain: body.domain || '',
          active: true,
        },
      }
    }
    if (method === 'PATCH') {
      return {
        status: 200,
        data: { ...body, active: body.active !== false },
      }
    }
    if (method !== 'GET') {
      return this._error(405, 'Method not allowed')
    }
    const FUNCTIONS = [
      { id:  1, codename: 'reports:view',         name: 'Ver reportes',               domain: 'reports',  active: true },
      { id:  2, codename: 'reports:kpis',          name: 'Ver KPIs',                   domain: 'reports',  active: true },
      { id:  3, codename: 'reports:save_view',     name: 'Guardar vista de reporte',   domain: 'reports',  active: true },
      { id:  4, codename: 'users:view',            name: 'Ver usuarios',               domain: 'users',    active: true },
      { id:  5, codename: 'users:create',          name: 'Crear usuarios',             domain: 'users',    active: true },
      { id:  6, codename: 'access:view',           name: 'Ver asignaciones',           domain: 'access',   active: true },
      { id:  7, codename: 'access:assign',         name: 'Asignar funciones',          domain: 'access',   active: true },
      { id:  8, codename: 'audit:view',            name: 'Ver log de auditoría',       domain: 'audit',    active: true },
      { id:  9, codename: 'alerts:view',           name: 'Ver alertas',                domain: 'alerts',   active: true },
      { id: 10, codename: 'logs:view_app',         name: 'Ver logs de aplicación',     domain: 'logs',     active: true },
      { id: 11, codename: 'logs:view_etl',         name: 'Ver logs ETL/pipeline',      domain: 'logs',     active: true },
      { id: 12, codename: 'logs:view_infra',       name: 'Ver logs de infraestructura',domain: 'logs',     active: true },
      { id: 13, codename: 'logs:view_health',      name: 'Ver salud del sistema',      domain: 'logs',     active: true },
      { id: 14, codename: 'logs:view_metrics',     name: 'Ver métricas técnicas',      domain: 'logs',     active: true },
      { id: 15, codename: 'pipeline:view_status',  name: 'Ver estado del pipeline',    domain: 'pipeline', active: true },
      { id: 16, codename: 'pipeline:retry',        name: 'Reintentar pipeline',        domain: 'pipeline', active: true },
      { id: 17, codename: 'auth:view_own_sessions',name: 'Ver sesiones propias',       domain: 'auth',     active: true },
      { id: 18, codename: 'adm:manage_catalog',    name: 'Gestionar catálogo RBAC',    domain: 'admin',    active: true },
      { id: 19, codename: 'adm:create_sod',        name: 'Crear regla de separación',  domain: 'admin',    active: true },
      { id: 20, codename: 'access:view_sod',       name: 'Ver reglas de separación',   domain: 'access',   active: true },
    ]
    return { status: 200, data: { results: FUNCTIONS, count: FUNCTIONS.length } }
  }

  _handleAdminAGR(method, body) {
    if (method === 'POST') {
      if (!body || !body.codename || !body.name) {
        return this._error(400, 'codename and name are required')
      }
      return {
        status: 201,
        data: {
          id: Math.floor(Math.random() * 900) + 100,
          codename: body.codename,
          name: body.name,
          description: body.description || '',
          functions_count: 0,
          state: 'ACTIVE',
        },
      }
    }
    if (method === 'PATCH') {
      return {
        status: 200,
        data: { ...body },
      }
    }
    if (method !== 'GET') {
      return this._error(405, 'Method not allowed')
    }
    const AGRS = [
      { id:  1, codename: 'AGR-001', name: 'basic_operator_group',      description: 'Operador básico de call center',       functions_count: 6,  state: 'ACTIVE' },
      { id:  2, codename: 'AGR-002', name: 'report_viewer_group',        description: 'Visualizador de reportes IVR',         functions_count: 8,  state: 'ACTIVE' },
      { id:  3, codename: 'AGR-003', name: 'quality_supervisor_group',   description: 'Supervisor de calidad',                functions_count: 11, state: 'ACTIVE' },
      { id:  4, codename: 'AGR-004', name: 'data_exporter_group',        description: 'Exportador de datos y reportes',       functions_count: 14, state: 'ACTIVE' },
      { id:  5, codename: 'AGR-005', name: 'alert_manager_group',        description: 'Gestor de alertas y notificaciones',   functions_count: 6,  state: 'ACTIVE' },
      { id:  6, codename: 'AGR-006', name: 'user_admin_group',           description: 'Administrador de usuarios',            functions_count: 9,  state: 'ACTIVE' },
      { id:  7, codename: 'AGR-007', name: 'permission_admin_group',     description: 'Administrador de permisos',            functions_count: 5,  state: 'ACTIVE' },
      { id:  8, codename: 'AGR-008', name: 'auditor_group',              description: 'Auditor de cumplimiento',              functions_count: 4,  state: 'ACTIVE' },
      { id:  9, codename: 'AGR-009', name: 'pipeline_admin_group',       description: 'Administrador de pipelines ETL',       functions_count: 4,  state: 'ACTIVE' },
      { id: 10, codename: 'AGR-010', name: 'system_admin_group',         description: 'Administrador del sistema RBAC',       functions_count: 6,  state: 'ACTIVE' },
    ]
    return { status: 200, data: { results: AGRS, count: AGRS.length } }
  }

  _handleSeparationRules() {
    return {
      status: 200,
      data: [
        { id: 1, name: 'SOD-001', code: 'SOD-001', description: 'Pipeline vs Auditoría', group_a: ['pipeline:execute'], group_b: ['audit:export'], state: 'ACTIVE', violations: 0 },
        { id: 2, name: 'SOD-002', code: 'SOD-002', description: 'Usuario vs Auditoría', group_a: ['users:create'], group_b: ['audit:view'], state: 'ACTIVE', violations: 0 },
        { id: 3, name: 'SOD-003', code: 'SOD-003', description: 'Acceso vs Admin', group_a: ['access:assign'], group_b: ['adm:manage_catalog'], state: 'ACTIVE', violations: 0 },
      ],
    }
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
