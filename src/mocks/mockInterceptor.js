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
