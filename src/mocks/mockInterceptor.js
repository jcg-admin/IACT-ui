/**
 * Mock Interceptor
 * Intercepta requests y retorna mock data
 * Funciona con seguridad implementada (CSRF, cookies, etc)
 * 
 * USAR SOLO EN DEVELOPMENT
 */

import { SENSITIVE_FIELDS } from '@config/securityConfig';
import permissionsMock from './permissions.json';
import permissionsAdminMock from './permissions-admin.json';

const PERMISOS_BY_USER_ID = {
  10:  permissionsMock,
  99:  permissionsAdminMock,
};

class MockInterceptor {
  constructor() {
    this.enabled = process.env.REACT_APP_USE_MOCKS === 'true';
    this.mockDelay = 800; // ms
    this._pipelineRunning = false;
    this._acknowledgedAlerts = new Set();
    this._blockedMenuItems = new Map();
    this._inactiveFunctionsByItemId = new Set();

    // UC-ADM-03: composición de funciones por AGR de sistema
    this._systemGroupFunctions = new Map();
    const defaultCompositions = {
      1: ['pipeline:view_status', 'pipeline:execute'],
      2: ['reports:view', 'reports:export', 'reports:kpis'],
      3: ['audit:view', 'audit:search', 'audit:compliance'],
      4: [],
      5: ['alerts:view', 'alerts:acknowledge'],
      6: ['users:view', 'users:manage', 'users:create'],
      7: ['access:assign', 'access:revoke', 'access:view'],
      8: ['audit:view', 'audit:export'],
      9: ['pipeline:execute', 'pipeline:stop'],
      10: ['adm:manage_functions', 'adm:manage_catalog'],
    };
    Object.entries(defaultCompositions).forEach(([id, fns]) =>
      this._systemGroupFunctions.set(parseInt(id), new Set(fns))
    );
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
    if (url.includes('/api/reports/metrics/dashboard/')) {
      return this._handleDashboardMetrics();
    }
    if (url.includes('/api/metrics')) {
      return this._handleMetrics();
    }
    if (url.match(/\/api\/auth\/sessions\/[^/]+\/$/) && method === 'DELETE') {
      return this._handleRevokeSession(url);
    }
    if (url.includes('/api/auth/sessions/')) {
      return this._handleGetSessions();
    }
    if (url.includes('/api/auth/recover-password/') && method === 'POST') {
      return this._handleRecoverPassword(body);
    }
    if (url.includes('/api/auth/change-password/') && method === 'POST') {
      return this._handleChangePassword(body);
    }
    if (url.includes('/api/audit/logs') && method === 'GET') {
      return this._handleGetAuditLogs(url);
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

    // ACCESS — UC-ACC-01: catálogo de funciones disponibles
    if (url.includes('/api/access/functions') && method === 'GET') {
      return this._handleGetAllFunctions();
    }

    // ACCESS — UC-ACC-03: permisos efectivos de un usuario
    if (url.match(/\/api\/access\/permissions\/\d+/) && method === 'GET') {
      return this._handleGetUserPermissions(url);
    }

    // ACCESS — UC-ACC-09: auditoría de cambios de acceso
    if (url.match(/\/api\/access\/audit\/\d+/) && method === 'GET') {
      return this._handleGetAccessAuditLog(url);
    }

    // ACCESS — UC-ACC-01: asignar funciones (bulk)
    if (url.match(/\/api\/users\/\d+\/functions\/$/) && method === 'POST') {
      return this._handleAssignFunctions(body);
    }

    // ACCESS — UC-ACC-02: revocar funciones (bulk)
    if (url.match(/\/api\/users\/\d+\/functions\/$/) && method === 'DELETE') {
      return this._handleRevokeFunctions(body);
    }

    // UC_PERM_03: conceder permiso excepcional
    if (url.match(/\/api\/users\/\d+\/exceptional-permissions\/$/) && method === 'POST') {
      return this._handleGrantExceptionalPermission(url, body);
    }

    // UC-015: listar permisos excepcionales de un usuario
    if (url.match(/\/api\/users\/\d+\/exceptional-permissions\/$/) && method === 'GET') {
      return this._handleListExceptionalPermissions(url);
    }

    // UC-015: revocar permiso excepcional
    if (url.match(/\/api\/users\/\d+\/exceptional-permissions\/\d+\/$/) && method === 'DELETE') {
      return { status: 200, data: { revoked: true } };
    }

    // GAP-2: pre-validar asignación de grupo
    if (url.match(/\/api\/access\/groups\/[^/]+\/validate-for-user/) && method === 'POST') {
      return this._handleValidateGroupAssignment(body);
    }

    // GAP-5: cascade impact preview
    if (url.match(/\/api\/access\/groups\/[^/]+\/cascade-impact/)) {
      return this._handleGroupCascadeImpact(url);
    }

    // GAP-1: validar reglas de separación (usuario + función)
    if (url.includes('/api/access/separation-rules/validate') && method === 'POST') {
      return this._handleValidateSeparationRules(body);
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

    // ADMIN — UC-ADM-03: composición de funciones de AGR de sistema
    // Rutas específicas ANTES del bloque genérico agr/
    if (url.match(/\/api\/admin\/system-groups\/(\d+)\/impact\//) && method === 'GET') {
      return this._handleAGRImpact(url)
    }
    if (url.match(/\/api\/admin\/system-groups\/(\d+)\/functions\/([^/]+)\//) && method === 'DELETE') {
      return this._handleAGRRemoveFunction(url)
    }
    if (url.match(/\/api\/admin\/system-groups\/(\d+)\/functions\//)) {
      return this._handleAGRFunctions(url, method, body)
    }

    // ADMIN — UC-ADM-03: catálogo de AGRs
    if (url.includes('/api/admin/agr/')) {
      return this._handleAdminAGR(method, body)
    }

    // ADMIN — UC-ADM-04 CA-08: bulk reorder atómico (ANTES del bloque genérico)
    if (url.includes('/api/admin/menu-items/bulk-reorder/') && method === 'PATCH') {
      return this._handleMenuItemsBulkReorder(body)
    }
    // ADMIN — UC-ADM-05 CA-07: bloquear archivado automático
    if (url.match(/\/api\/admin\/menu-items\/(\d+)\/block-archive\//) && method === 'POST') {
      return this._handleBlockAutoArchive(url, body)
    }
    // ADMIN — UC-ADM-04/05: catálogo + lifecycle de MenuItems
    if (url.includes('/api/admin/menu-items/')) {
      return this._handleAdminMenuItems(method, url, body)
    }

    if (url.includes('/api/admin/separation-rules/')) {
      return this._handleAdminSeparationRules(method, url, body)
    }

    // PERMISOS — UC-PERM-07/08: capacidades del usuario (SP-01 — ADR-BACK-005)
    if (url.match(/\/api\/permisos\/verificar\/(\d+)\/capacidades\//)) {
      return this._handlePermisosCapacidades(url)
    }

    // ALERT ENDPOINTS
    if (url.match(/\/api\/alerts\/([^/]+)\/ack\//) && method === 'POST') {
      return this._handleAcknowledgeAlert(url, body);
    }

    if (url.includes('/api/alerts')) {
      return this._handleGetAlerts(url);
    }

    if (url.match(/\/api\/permisos\/verificar\/(\d+)\/menu\//)) {
      return this._handlePermisosMenu(url);
    }

    if (url.includes('/api/v1/etl/supervision/')) {
      return this._handlePipelineStatus();
    }

    if (url.match(/\/api\/etl\/logs\/\d+\/retry\//) && method === 'POST') {
      return this._handleRetryPipeline(url, body);
    }

    if (url.match(/\/api\/reports\/scheduled\/\d+\//) && method !== 'GET') {
      return this._handleScheduleSubAction(url, method);
    }
    if (url.match(/\/api\/reports\/scheduled\/\d+\/runs\//)) {
      return this._handleScheduleHistory(url);
    }

    if (url.includes('/api/reports/scheduled/')) {
      return this._handleScheduledReports(method, body);
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
            id: 10,
            username: 'demo',
            email: 'demo@example.com',
            first_name: 'Demo',
            last_name: 'User',
            date_joined: new Date().toISOString(),
          },
          // NO retornar access/refresh (estan en cookies)
        },
      };
    }

    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        status: 200,
        data: {
          user: {
            id: 99,
            username: 'admin',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'System',
            date_joined: new Date().toISOString(),
          },
        },
      };
    }

    // UC-AUTH-01 FA-01: primer login — backend indica que debe cambiar contraseña
    if (credentials.username === 'first_login_user' && credentials.password === 'changeme') {
      return {
        status: 200,
        data: {
          user: {
            id: 11,
            username: 'first_login_user',
            email: 'firstlogin@example.com',
            first_name: 'First',
            last_name: 'Login',
            date_joined: new Date().toISOString(),
          },
          next_step: 'change_password',
          first_login: true,
          warning: null,
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
        id: 10,
        username: 'demo',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
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
          access_groups: [],
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
    const sampleGroups = [['AGR-001'], ['AGR-002'], ['AGR-001', 'AGR-003'], []];
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
        access_groups: sampleGroups[i % sampleGroups.length],
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
      // MOD_Pipeline (8)
      { id:  1, codename: 'pipeline:view_status',  name: 'Ver estado del pipeline',         domain: 'pipeline', active: true },
      { id:  2, codename: 'pipeline:execute',      name: 'Ejecutar pipeline',               domain: 'pipeline', active: true },
      { id:  3, codename: 'pipeline:stop',         name: 'Detener pipeline',                domain: 'pipeline', active: true },
      { id:  4, codename: 'pipeline:request',      name: 'Solicitar ejecución',             domain: 'pipeline', active: true },
      { id:  5, codename: 'pipeline:view_data',    name: 'Ver datos del pipeline',          domain: 'pipeline', active: true },
      { id:  6, codename: 'pipeline:view_logs',    name: 'Ver logs del pipeline',           domain: 'pipeline', active: true },
      { id:  7, codename: 'pipeline:view_errors',  name: 'Ver errores del pipeline',        domain: 'pipeline', active: true },
      { id:  8, codename: 'pipeline:availability', name: 'Ver disponibilidad de datos',     domain: 'pipeline', active: true },
      // MOD_Users (10)
      { id:  9, codename: 'users:view',            name: 'Ver usuarios',                    domain: 'users',    active: true },
      { id: 10, codename: 'users:manage',          name: 'Gestionar usuarios',              domain: 'users',    active: true },
      { id: 11, codename: 'users:create',          name: 'Crear usuarios',                  domain: 'users',    active: true },
      { id: 12, codename: 'users:edit',            name: 'Editar usuarios',                 domain: 'users',    active: true },
      { id: 13, codename: 'users:delete',          name: 'Eliminar usuarios',               domain: 'users',    active: true },
      { id: 14, codename: 'users:list',            name: 'Listar usuarios',                 domain: 'users',    active: true },
      { id: 15, codename: 'users:search',          name: 'Buscar usuarios',                 domain: 'users',    active: true },
      { id: 16, codename: 'users:block',           name: 'Bloquear usuarios',               domain: 'users',    active: true },
      { id: 17, codename: 'users:unblock',         name: 'Desbloquear usuarios',            domain: 'users',    active: true },
      { id: 18, codename: 'users:reactivate',      name: 'Reactivar usuarios',              domain: 'users',    active: true },
      // MOD_Access (12)
      { id: 19, codename: 'access:view',           name: 'Ver asignaciones',                domain: 'access',   active: true },
      { id: 20, codename: 'access:assign',         name: 'Asignar funciones',               domain: 'access',   active: true },
      { id: 21, codename: 'access:assign_function',name: 'Asignar función individual',      domain: 'access',   active: true },
      { id: 22, codename: 'access:revoke_function',name: 'Revocar función individual',      domain: 'access',   active: true },
      { id: 23, codename: 'access:revoke_group',   name: 'Revocar grupo de funciones',      domain: 'access',   active: true },
      { id: 24, codename: 'access:grant_exceptional',name:'Otorgar permiso excepcional',    domain: 'access',   active: true },
      { id: 25, codename: 'access:revoke',         name: 'Revocar funciones',               domain: 'access',   active: true },
      { id: 26, codename: 'access:assign_group',   name: 'Asignar grupo de funciones',      domain: 'access',   active: true },
      { id: 27, codename: 'access:assign_to_group',name: 'Agregar usuario a grupo',         domain: 'access',   active: true },
      { id: 28, codename: 'access:update_sod',     name: 'Actualizar regla de separación',  domain: 'access',   active: true },
      { id: 29, codename: 'access:disable_sod',    name: 'Desactivar regla de separación',  domain: 'access',   active: true },
      { id: 30, codename: 'access:revoke_exceptional', name: 'Revocar permiso excepcional', domain: 'access',   active: true },
      // MOD_Audit (4)
      { id: 31, codename: 'audit:view',            name: 'Ver log de auditoría',            domain: 'audit',    active: true },
      { id: 32, codename: 'audit:search',          name: 'Buscar en auditoría',             domain: 'audit',    active: true },
      { id: 33, codename: 'audit:export',          name: 'Exportar auditoría',              domain: 'audit',    active: true },
      { id: 34, codename: 'audit:compliance',      name: 'Generar reporte de cumplimiento', domain: 'audit',    active: true },
      // MOD_Alerts (10)
      { id: 35, codename: 'alerts:view',           name: 'Ver alertas',                     domain: 'alerts',   active: true },
      { id: 36, codename: 'alerts:configure',      name: 'Configurar alertas',              domain: 'alerts',   active: true },
      { id: 37, codename: 'alerts:config_team',    name: 'Configurar alertas de equipo',    domain: 'alerts',   active: true },
      { id: 38, codename: 'alerts:pause',          name: 'Pausar alertas',                  domain: 'alerts',   active: true },
      { id: 39, codename: 'alerts:disable',        name: 'Deshabilitar alertas',            domain: 'alerts',   active: true },
      { id: 40, codename: 'alerts:history',        name: 'Ver historial de alertas',        domain: 'alerts',   active: true },
      { id: 41, codename: 'alerts:acknowledge',    name: 'Reconocer alerta',                domain: 'alerts',   active: true },
      { id: 42, codename: 'alerts:subscribe',      name: 'Suscribirse a alertas',           domain: 'alerts',   active: true },
      { id: 43, codename: 'alerts:unsubscribe',    name: 'Desuscribirse de alertas',        domain: 'alerts',   active: true },
      { id: 44, codename: 'alerts:config_severity',name: 'Configurar severidad de alertas', domain: 'alerts',   active: true },
      // MOD_Reports (4)
      { id: 45, codename: 'reports:dashboard',     name: 'Ver dashboard',                   domain: 'reports',  active: true },
      { id: 46, codename: 'reports:view',          name: 'Ver reportes',                    domain: 'reports',  active: true },
      { id: 47, codename: 'reports:kpis',          name: 'Ver KPIs',                        domain: 'reports',  active: true },
      { id: 48, codename: 'reports:export',        name: 'Exportar reportes',               domain: 'reports',  active: true },
      // MOD_Logs (5)
      { id: 49, codename: 'logs:view_app',         name: 'Ver logs de aplicación',          domain: 'logs',     active: true },
      { id: 50, codename: 'logs:view_etl',         name: 'Ver logs ETL/pipeline',           domain: 'logs',     active: true },
      { id: 51, codename: 'logs:view_infra',       name: 'Ver logs de infraestructura',     domain: 'logs',     active: true },
      { id: 52, codename: 'logs:view_health',      name: 'Ver salud del sistema',           domain: 'logs',     active: true },
      { id: 53, codename: 'logs:view_metrics',     name: 'Ver métricas técnicas',           domain: 'logs',     active: true },
      // MOD_Auth (5)
      { id: 54, codename: 'auth:view_own_sessions',name: 'Ver sesiones propias',            domain: 'auth',     active: true },
      { id: 55, codename: 'auth:manage_sessions',  name: 'Gestionar sesiones',              domain: 'auth',     active: true },
      { id: 56, codename: 'auth:view_all_sessions',name: 'Ver todas las sesiones',          domain: 'auth',     active: true },
      { id: 57, codename: 'auth:close_session',    name: 'Cerrar sesión de usuario',        domain: 'auth',     active: true },
      { id: 58, codename: 'auth:reset_password',   name: 'Resetear contraseña',             domain: 'auth',     active: true },
      // MOD_Admin (9)
      { id: 59, codename: 'adm:manage_menu',       name: 'Gestionar menú',                  domain: 'admin',    active: true },
      { id: 60, codename: 'adm:manage_catalog',    name: 'Gestionar catálogo RBAC',         domain: 'admin',    active: true },
      { id: 61, codename: 'adm:manage_functions',  name: 'Gestionar funciones RBAC',        domain: 'admin',    active: true },
      { id: 62, codename: 'adm:manage_groups',     name: 'Gestionar grupos RBAC',           domain: 'admin',    active: true },
      { id: 63, codename: 'adm:view_system',       name: 'Ver configuración del sistema',   domain: 'admin',    active: true },
      { id: 64, codename: 'adm:manage_menu_catalog',name:'Gestionar catálogo de menú',      domain: 'admin',    active: true },
      { id: 65, codename: 'adm:manage_menu_lifecycle',name:'Gestionar ciclo de vida menú',  domain: 'admin',    active: true },
      { id: 66, codename: 'adm:manage_is_critical',name: 'Gestionar criticidad de menú',   domain: 'admin',    active: true },
      { id: 67, codename: 'adm:create_sod',        name: 'Crear regla de separación',       domain: 'admin',    active: true },
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
          active: true,
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
      { id:  1, codename: 'basic_operator_group',      name: 'Operador Básico',           description: 'Operador básico de call center',       functions_count: 6,  active: true },
      { id:  2, codename: 'report_viewer_group',        name: 'Visualizador de Reportes',  description: 'Visualizador de reportes IVR',         functions_count: 8,  active: true },
      { id:  3, codename: 'quality_supervisor_group',   name: 'Supervisor de Calidad',     description: 'Supervisor de calidad',                functions_count: 11, active: true },
      { id:  4, codename: 'data_exporter_group',        name: 'Exportador de Datos',       description: 'Exportador de datos y reportes',       functions_count: 14, active: true },
      { id:  5, codename: 'alert_manager_group',        name: 'Gestor de Alertas',         description: 'Gestor de alertas y notificaciones',   functions_count: 6,  active: true },
      { id:  6, codename: 'user_admin_group',           name: 'Admin de Usuarios',         description: 'Administrador de usuarios',            functions_count: 9,  active: true },
      { id:  7, codename: 'permission_admin_group',     name: 'Admin de Permisos',         description: 'Administrador de permisos',            functions_count: 5,  active: true },
      { id:  8, codename: 'auditor_group',              name: 'Auditor',                   description: 'Auditor de cumplimiento',              functions_count: 4,  active: true },
      { id:  9, codename: 'pipeline_admin_group',       name: 'Admin de Pipeline',         description: 'Administrador de pipelines ETL',       functions_count: 4,  active: true },
      { id: 10, codename: 'system_admin_group',         name: 'Admin del Sistema',         description: 'Administrador del sistema RBAC',       functions_count: 9,  active: true },
    ]
    return { status: 200, data: { results: AGRS, count: AGRS.length } }
  }

  _handleGrantExceptionalPermission(url, body) {
    const match = url.match(/\/api\/users\/(\d+)\/exceptional-permissions\//);
    const targetUserId = match ? parseInt(match[1], 10) : null;

    if (!body || !body.justification || body.justification.trim().length === 0) {
      return this._error(422, 'justification is required');
    }
    if (!body.expires_at) {
      return this._error(422, 'expires_at is required');
    }
    // Anti-self P-11: detected via invoker_id in body (set by frontend)
    if (body.invoker_id && body.invoker_id === targetUserId) {
      return this._error(403, 'Cannot grant exceptional permission to yourself (P-11 anti-self)');
    }

    return {
      status: 201,
      data: {
        id: Date.now(),
        user_id: targetUserId,
        permission_code: body.permission_code || null,
        justification: body.justification,
        expires_at: body.expires_at,
        granted_at: new Date().toISOString(),
        granted_by: body.invoker_id || 'current-user',
        supervisor_notified: true,
        audit_event: 'EXCEPTIONAL_PERMISSION_GRANTED',
      },
    };
  }

  _handleListExceptionalPermissions(url) {
    const match = url.match(/\/api\/users\/(\d+)\/exceptional-permissions\//);
    const userId = match ? parseInt(match[1], 10) : null;
    return {
      status: 200,
      data: [
        {
          id: 1001,
          user_id: userId,
          permission_code: 'access:assign_function_groups',
          justification: 'Cobertura temporal por ausencia del responsable de acceso.',
          expires_at: '2026-06-01T23:59:00.000Z',
          granted_at: '2026-05-01T10:00:00.000Z',
          granted_by: 'admin.sistema',
          supervisor_notified: true,
        },
        {
          id: 1002,
          user_id: userId,
          permission_code: 'audit:export',
          justification: 'Acceso temporal para auditoría de Q1.',
          expires_at: '2026-05-20T18:00:00.000Z',
          granted_at: '2026-05-05T09:00:00.000Z',
          granted_by: 'admin.sistema',
          supervisor_notified: true,
        },
      ],
    };
  }

  _handleValidateGroupAssignment(body) {
    // Simula SOFT conflict si user_id termina en '9' para facilitar pruebas
    const userId = String(body?.user_id || '');
    if (userId.endsWith('9')) {
      return {
        status: 200,
        data: {
          valid: false,
          conflicts: [{
            rule: 'SR-003',
            severity: 'SOFT',
            message: 'El grupo incluye funciones de acceso que pueden solapar con funciones de auditoría ya asignadas.',
            setA: ['access:assign'],
            setB: ['audit:view'],
          }],
        },
      };
    }
    return { status: 200, data: { valid: true, conflicts: [] } };
  }

  _handleGroupCascadeImpact(url) {
    const params = url.includes('add_function_ids=') ? url.split('add_function_ids=')[1] : '';
    const functionCount = params ? params.split(',').length : 0;
    return {
      status: 200,
      data: {
        cascade_affected_user_count: functionCount > 0 ? 2 : 0,
        conflicts: [],
      },
    };
  }

  _handleValidateSeparationRules(body) {
    const functionIds = body?.function_ids || [];
    if (functionIds.length === 0) {
      return { status: 200, data: { valid: true, conflicts: [] } };
    }
    return { status: 200, data: { valid: true, conflicts: [] } };
  }

  _separationRulesData() {
    return [
      { id: 1, code: 'SR-001', name: 'Pipeline vs Auditoría',  description: 'Quien ejecuta pipelines no puede auditarlos', group_a: ['pipeline:view_status', 'pipeline:view_data', 'pipeline:request'], group_b: ['audit:view', 'audit:search', 'audit:export', 'audit:compliance'], isActive: true, violations: 0 },
      { id: 2, code: 'SR-002', name: 'Usuarios vs Auditoría',  description: 'Quien gestiona usuarios no puede auditarlos',  group_a: ['users:manage', 'users:create', 'users:edit'],                       group_b: ['audit:view', 'audit:search', 'audit:export'],                      isActive: true, violations: 0 },
      { id: 3, code: 'SR-003', name: 'Acceso vs Auditoría',    description: 'Quien asigna funciones no puede auditarlas',   group_a: ['access:assign', 'access:assign_function', 'access:revoke_function'],  group_b: ['audit:view', 'audit:search', 'audit:export'],                      isActive: true, violations: 0 },
    ]
  }

  _handleSeparationRules() {
    return { status: 200, data: this._separationRulesData() }
  }

  _handleAdminSeparationRules(method, url, body) {
    const rules = this._separationRulesData()
    if (method === 'GET') {
      return { status: 200, data: rules }
    }
    if (method === 'POST') {
      const newRule = { id: rules.length + 1, code: `SR-00${rules.length + 1}`, isActive: true, violations: 0, ...body }
      return { status: 201, data: newRule }
    }
    const match = url.match(/\/api\/admin\/separation-rules\/(\d+)\//)
    const id = parseInt(match?.[1], 10)
    const rule = rules.find(r => r.id === id) || rules[0]
    if (method === 'PUT') {
      return { status: 200, data: { ...rule, ...body } }
    }
    if (method === 'PATCH') {
      return { status: 200, data: { ...rule, isActive: !rule.isActive } }
    }
    return this._error(405, 'Method not allowed')
  }

  // ====== PERMISOS HANDLERS ======

  _handlePermisosCapacidades(url) {
    const match = url.match(/\/api\/permisos\/verificar\/(\d+)\/capacidades\//)
    const userId = parseInt(match[1], 10)
    const data = PERMISOS_BY_USER_ID[userId]

    if (!data) {
      return this._error(404, `Usuario ${userId} no encontrado en mock`)
    }

    return {
      status: 200,
      data: {
        user_id: userId,
        capacidades: data.capacidades,
        access_groups: data.user.grupos.map((g) => g.codigo),
        expires_at: null,
      },
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
            isRead: false,
            state: this._acknowledgedAlerts.has('alert-1') ? 'acknowledged' : 'firing',
          },
          {
            id: 'alert-2',
            title: 'Security Alert',
            message: 'Multiple failed login attempts detected',
            severity: 'warning',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            isRead: false,
            state: this._acknowledgedAlerts.has('alert-2') ? 'acknowledged' : 'firing',
          },
        ],
      },
    };
  }

  _handleAcknowledgeAlert(url, body) {
    const match = url.match(/\/api\/alerts\/([^/]+)\/ack\//)
    const alertId = match ? match[1] : null
    if (this._acknowledgedAlerts.has(alertId)) {
      return { status: 409, data: { error: 'Ya reconocida', code: 'ALREADY_ACKNOWLEDGED' } }
    }
    this._acknowledgedAlerts.add(alertId)
    return {
      status: 200,
      data: {
        id: alertId,
        state: 'acknowledged',
        acknowledged_by: 'demo',
        acknowledged_at: new Date().toISOString(),
        note: body?.note ?? null,
      },
    }
  }

  _handlePermisosMenu(url) {
    const match = url.match(/\/api\/permisos\/verificar\/(\d+)\/menu\//)
    const userId = parseInt(match[1], 10)
    const data = PERMISOS_BY_USER_ID[userId]
    if (!data) {
      return this._error(404, `Usuario ${userId} no encontrado en mock`)
    }
    const capacidades = data.capacidades
    const allMenuItems = [
      { key: 'dashboard',   label: 'Dashboard',          required: 'reports:dashboard',     path: '/dashboard' },
      { key: 'pipeline',    label: 'Pipeline',           required: 'pipeline:view_status',  path: '/pipeline' },
      { key: 'logs',        label: 'Logs',               required: 'logs:view_app',         path: '/logs' },
      { key: 'reports',     label: 'Reportes',           required: 'reports:view',          path: '/reports' },
      { key: 'alerts',      label: 'Alertas',            required: 'alerts:view',           path: '/alerts' },
      { key: 'audit',       label: 'Auditoría',          required: 'audit:view',            path: '/audit' },
      { key: 'users',       label: 'Usuarios',           required: 'users:view',            path: '/users' },
      { key: 'access',      label: 'Control de Acceso',  required: 'access:view',           path: '/access' },
    ]
    const allowedMenu = allMenuItems.filter((item) => capacidades.includes(item.required))
    return { status: 200, data: { menu: allowedMenu } }
  }

  _handleDashboardMetrics() {
    return {
      status: 200,
      data: {
        queue_count: 12,
        agents_busy: 8,
        agents_idle: 4,
        answered_per_hour: 143,
        abandon_rate_5min: 3.2,
        service_level_15min: 87.5,
        lag_seconds: 5,
        timestamp: new Date().toISOString(),
        schema_version: 1,
      },
    }
  }

  _handleGetSessions() {
    return {
      status: 200,
      data: [
        {
          id: 'session-1',
          device: 'Chrome on MacOS',
          ip: '192.168.1.100',
          location: 'San Francisco, CA',
          lastActive: new Date(Date.now() - 300_000).toISOString(),
          isCurrent: true,
        },
        {
          id: 'session-2',
          device: 'Safari on iPhone',
          ip: '192.168.1.101',
          location: 'San Francisco, CA',
          lastActive: new Date(Date.now() - 3_600_000).toISOString(),
          isCurrent: false,
        },
        {
          id: 'session-3',
          device: 'Firefox on Windows',
          ip: '192.168.1.102',
          location: 'New York, NY',
          lastActive: new Date(Date.now() - 86_400_000).toISOString(),
          isCurrent: false,
        },
      ],
    }
  }

  _handleRevokeSession(url) {
    const sessionId = url.split('/').filter(Boolean).pop()
    return { status: 204, data: { revoked: true, id: sessionId } }
  }

  _handlePipelineStatus() {
    return {
      status: 200,
      data: {
        estado_general: 'ok',
        ultima_ejecucion_exitosa: {
          trimestre: 'Q2_26',
          finished_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
          base_records: 1_234_567,
        },
        ejecucion_en_curso: null,
        ultima_ejecucion_fallida: null,
        total_exitosas_24h: 2,
        total_fallidas_24h: 0,
      },
    }
  }

  _handleRetryPipeline(url, body) {
    const match = url.match(/\/api\/etl\/logs\/(\d+)\/retry\//)
    const logId = match ? parseInt(match[1], 10) : null
    const motivo = body?.motivo ?? ''
    if (motivo.length < 20) {
      return { status: 422, data: { error: 'Motivo demasiado corto', min_length: 20 } }
    }
    if (this._pipelineRunning) {
      return { status: 409, data: { error: 'Ya hay una ejecución activa' } }
    }
    return {
      status: 202,
      data: {
        message: 'Pipeline iniciado',
        job_id: `manual-${logId}`,
        trimestre: body?.trimestre ?? null,
        executed_by: 'manual',
      },
    }
  }

  _handleScheduleSubAction(url, method) {
    const parts = url.split('/').filter(Boolean)
    const id = parseInt(parts[parts.indexOf('scheduled') + 1], 10)
    if (method === 'DELETE') {
      return { status: 204, data: { id, deleted: true } }
    }
    const action = parts[parts.indexOf('scheduled') + 2]
    if (action === 'pause') return { status: 200, data: { id, status: 'paused' } }
    if (action === 'resume') return { status: 200, data: { id, status: 'active' } }
    if (action === 'run') return { status: 202, data: { id, jobId: `job-${Date.now()}`, status: 'running' } }
    return this._error(404, 'Unknown schedule action')
  }

  _handleScheduleHistory(url) {
    const parts = url.split('/').filter(Boolean)
    const id = parseInt(parts[parts.indexOf('scheduled') + 1], 10)
    return {
      status: 200,
      data: {
        items: [
          {
            id: '1',
            scheduled_report_id: id,
            started_at: new Date(Date.now() - 86_400_000).toISOString(),
            completed_at: new Date(Date.now() - 86_400_000 + 42_000).toISOString(),
            status: 'ok',
            export_job_id: 'job-abc-1',
            error_code: null,
          },
          {
            id: '2',
            scheduled_report_id: id,
            started_at: new Date(Date.now() - 172_800_000).toISOString(),
            completed_at: new Date(Date.now() - 172_800_000 + 38_000).toISOString(),
            status: 'ok',
            export_job_id: 'job-abc-2',
            error_code: null,
          },
        ],
        pagination: { page: 1, page_size: 20, total: 2 },
      },
    }
  }

  _handleScheduledReports(method, body) {
    if (method === 'POST') {
      if (!body || !body.name || !body.frequency) {
        return this._error(400, 'name and frequency are required')
      }
      return {
        status: 201,
        data: {
          id: Math.floor(Math.random() * 900) + 100,
          name: body.name,
          frequency: body.frequency,
          format: body.format || 'PDF',
          recipients: body.recipients || [],
          active: true,
          last_run: null,
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }
    }
    return {
      status: 200,
      data: {
        results: [
          { id: 1, name: 'Reporte Diario KPIs',       frequency: 'DAILY',   format: 'PDF',  active: true, last_run: new Date(Date.now() - 86400000).toISOString(), next_run: new Date(Date.now() + 3600000).toISOString() },
          { id: 2, name: 'Reporte Semanal Auditoría', frequency: 'WEEKLY',  format: 'XLSX', active: true, last_run: new Date(Date.now() - 604800000).toISOString(), next_run: new Date(Date.now() + 86400000).toISOString() },
          { id: 3, name: 'Cumplimiento Mensual',      frequency: 'MONTHLY', format: 'PDF',  active: false, last_run: null, next_run: null },
        ],
        count: 3,
      },
    }
  }

  // ====== ADMIN MENU ITEMS (UC-ADM-04/05) ======

  _menuItemsData() {
    return [
      { id: 1, label: 'Dashboard',   icon: 'grid-alt',  route_path: '/dashboard',  display_order: 1, parent: null, status: 'ACTIVE',       function_codename: 'reports:view',  is_critical: false },
      { id: 2, label: 'Usuarios',    icon: 'users',     route_path: '/users',       display_order: 2, parent: null, status: 'ACTIVE',       function_codename: 'users:view',    is_critical: false },
      { id: 3, label: 'Reportes',    icon: 'chart-bar', route_path: '/reports',     display_order: 3, parent: null, status: 'ACTIVE',       function_codename: 'reports:view',  is_critical: false },
      { id: 4, label: 'Admin',       icon: 'shield',    route_path: '/admin',       display_order: 8, parent: null, status: 'ACTIVE',       function_codename: 'adm:manage_catalog', is_critical: true },
      { id: 5, label: 'Beta Feature',icon: 'flask',     route_path: '/beta',        display_order: 9, parent: null, status: 'DRAFT',        function_codename: 'reports:view',  is_critical: false },
      { id: 6, label: 'Legacy View', icon: 'archive',   route_path: '/legacy',      display_order: 10,parent: null, status: 'DEPRECATED',   function_codename: 'reports:view',  is_critical: false },
    ]
  }

  _handleAdminMenuItems(method, url, body) {
    const items = this._menuItemsData()
    if (method === 'GET') {
      return { status: 200, data: items }
    }
    if (method === 'POST') {
      return { status: 201, data: { id: items.length + 1, status: 'DRAFT', ...body } }
    }
    const match = url.match(/\/api\/admin\/menu-items\/(\d+)\//)
    const id = parseInt(match?.[1], 10)
    const item = items.find(i => i.id === id) || items[0]
    if (method === 'PUT') {
      return { status: 200, data: { ...item, ...body } }
    }
    if (method === 'PATCH') {
      const transitions = { DRAFT: 'ACTIVE', ACTIVE: 'DEPRECATED', DEPRECATED: 'ARCHIVED', ARCHIVED: 'ACTIVE' }
      const newStatus = body?.status || transitions[item.status] || 'ACTIVE'
      return { status: 200, data: { ...item, status: newStatus } }
    }
    return this._error(405, 'Method not allowed')
  }

  // ====== ACCESS HANDLERS (UC-ACC-01/03/09) ======

  _handleGetAllFunctions() {
    return {
      status: 200,
      data: [
        { id: 1,  codename: 'reports:view',              name: 'Ver reportes',               domain: 'reports', active: true },
        { id: 2,  codename: 'reports:export',            name: 'Exportar reportes',          domain: 'reports', active: true },
        { id: 3,  codename: 'reports:schedule',          name: 'Programar reportes',         domain: 'reports', active: true },
        { id: 4,  codename: 'reports:share',             name: 'Compartir reportes',         domain: 'reports', active: true },
        { id: 5,  codename: 'access:view',               name: 'Ver acceso',                 domain: 'access',  active: true },
        { id: 6,  codename: 'access:assign',             name: 'Asignar funciones',          domain: 'access',  active: true },
        { id: 7,  codename: 'access:revoke',             name: 'Revocar funciones',          domain: 'access',  active: true },
        { id: 8,  codename: 'access:create_group',       name: 'Crear grupos de acceso',     domain: 'access',  active: true },
        { id: 9,  codename: 'access:assign_group',       name: 'Asignar agrupador',          domain: 'access',  active: true },
        { id: 10, codename: 'access:view_sod',           name: 'Ver reglas SoD',             domain: 'access',  active: true },
        { id: 11, codename: 'audit:view',                name: 'Ver auditoría',              domain: 'audit',   active: true },
        { id: 12, codename: 'audit:search',              name: 'Buscar auditoría',           domain: 'audit',   active: true },
        { id: 13, codename: 'alerts:view',               name: 'Ver alertas',                domain: 'alerts',  active: true },
        { id: 14, codename: 'pipeline:view_status',      name: 'Ver estado ETL',             domain: 'pipeline',active: true },
        { id: 15, codename: 'pipeline:retry',            name: 'Reintentar pipeline',        domain: 'pipeline',active: true },
      ],
    }
  }

  _handleGetUserPermissions(url) {
    const match = url.match(/\/api\/access\/permissions\/(\d+)/)
    const userId = parseInt(match?.[1], 10)
    const allPerms = [
      { id: 1, codename: 'reports:view',    name: 'Ver reportes',    domain: 'reports', granted_at: '2026-01-15', expires_at: null, is_temporary: false },
      { id: 2, codename: 'access:view',     name: 'Ver acceso',      domain: 'access',  granted_at: '2026-01-15', expires_at: null, is_temporary: false },
      { id: 3, codename: 'audit:view',      name: 'Ver auditoría',   domain: 'audit',   granted_at: '2026-02-01', expires_at: null, is_temporary: false },
    ]
    return { status: 200, data: userId === 1 ? allPerms : allPerms.slice(0, 1) }
  }

  // UC-AUD-01 / UC-AUTH-05-C: logs de auditoría (filtrables por type, user)
  _handleGetAuditLogs(url) {
    const urlObj = new URL(url, 'http://localhost');
    const type = urlObj.searchParams.get('type');
    const allLogs = [
      { id: '1', timestamp: new Date(Date.now() - 300_000).toISOString(),  device: 'Chrome on MacOS',   ip: '192.168.1.100', location: 'San Francisco, CA', status: 'success', event_type: 'LOGIN' },
      { id: '2', timestamp: new Date(Date.now() - 3_600_000).toISOString(), device: 'Safari on iPhone',  ip: '192.168.1.101', location: 'San Francisco, CA', status: 'success', event_type: 'LOGIN' },
      { id: '3', timestamp: new Date(Date.now() - 86_400_000).toISOString(), device: 'Unknown Browser',  ip: '203.0.113.50',  location: 'Unknown',           status: 'failed',  event_type: 'LOGIN' },
    ];
    const data = type ? allLogs.filter((l) => l.event_type === type) : allLogs;
    return { status: 200, data };
  }

  // UC-AUTH-03: recuperar contraseña
  _handleRecoverPassword(body) {
    const knownUsers = ['demo', 'admin', 'first_login_user'];
    if (!body?.username) {
      return this._error(400, 'username is required');
    }
    if (!knownUsers.includes(body.username)) {
      return this._error(404, 'Usuario no encontrado');
    }
    return {
      status: 200,
      data: { message: 'Correo de recuperación enviado' },
    };
  }

  // UC-AUTH-04: cambiar contraseña
  _handleChangePassword(body) {
    if (!body?.current_password || !body?.new_password) {
      return this._error(400, 'current_password and new_password are required');
    }
    const validCurrentPasswords = ['demo123', 'admin123', 'changeme'];
    if (!validCurrentPasswords.includes(body.current_password)) {
      return this._error(400, 'Contraseña actual incorrecta');
    }
    return {
      status: 200,
      data: { message: 'Contraseña actualizada', next_step: null },
    };
  }

  // ====== UC-ADM-03: AGR COMPOSITION HANDLERS (system-groups) ======

  _handleAGRFunctions(url, method, body) {
    const id = parseInt(url.match(/\/system-groups\/(\d+)\//)[1])
    const fns = this._systemGroupFunctions.get(id) || new Set()
    if (method === 'GET') {
      return { status: 200, data: { functions: [...fns], count: fns.size } }
    }
    if (method === 'POST') {
      const codename = body?.function_codename
      if (!codename) return this._error(400, 'function_codename required')
      if (fns.has(codename)) {
        return { status: 409, data: { error: 'Función ya asignada al AGR', code: 'ALREADY_ASSIGNED' } }
      }
      fns.add(codename)
      this._systemGroupFunctions.set(id, fns)
      return { status: 201, data: { agr_id: id, function_codename: codename, assigned_at: new Date().toISOString() } }
    }
    return this._error(405, 'Method not allowed')
  }

  _handleAGRRemoveFunction(url) {
    const match = url.match(/\/system-groups\/(\d+)\/functions\/([^/]+)\//)
    const groupId = parseInt(match[1])
    const codename = match[2]
    const fns = this._systemGroupFunctions.get(groupId)
    if (fns) fns.delete(codename)
    return { status: 204, data: null }
  }

  _handleAGRImpact(url) {
    const id = parseInt(url.match(/\/system-groups\/(\d+)\//)[1])
    const fns = this._systemGroupFunctions.get(id) || new Set()
    return {
      status: 200,
      data: {
        agr_id: id,
        affected_users: fns.size * 2,
        preview_function_count: fns.size,
        functions_preview: [...fns].slice(0, 5),
      },
    }
  }

  // ====== UC-ADM-04 CA-08: BULK REORDER HANDLER ======

  _handleMenuItemsBulkReorder(body) {
    const items = body?.items ?? []
    if (!Array.isArray(items) || items.length === 0) {
      return this._error(400, 'items array required')
    }
    const validIds = new Set(this._menuItemsData().map(i => i.id))
    const invalidIds = items.filter(i => !validIds.has(i.id)).map(i => i.id)
    if (invalidIds.length > 0) {
      return { status: 422, data: { error: 'invalid_ids', invalid_ids: invalidIds } }
    }
    const updated = items.map(({ id, display_order }) => ({
      ...this._menuItemsData().find(i => i.id === id),
      display_order,
    }))
    return { status: 200, data: { items: updated, audit: 'MENU_ITEM_BULK_REORDERED' } }
  }

  // ====== UC-ADM-05 CA-07: BLOCK AUTO-ARCHIVE HANDLER ======

  _handleBlockAutoArchive(url, body) {
    const id = parseInt(url.match(/\/menu-items\/(\d+)\//)[1])
    const reason = body?.block_reason ?? ''
    if (reason.length < 20) {
      return {
        status: 422,
        data: {
          error: 'block_reason_too_short',
          message: `La razón debe tener al menos 20 caracteres (actual: ${reason.length})`,
          min_length: 20,
        },
      }
    }
    this._blockedMenuItems.set(id, {
      block_auto_archive: true,
      block_reason: reason,
      block_set_by: 'demo',
      block_set_at: new Date().toISOString(),
    })
    const item = this._menuItemsData().find(i => i.id === id) || { id }
    return {
      status: 200,
      data: {
        ...item,
        block_auto_archive: true,
        block_reason: reason,
        block_set_by: 'demo',
        block_set_at: new Date().toISOString(),
      },
    }
  }

  // ====== EXISTING ACCESS AUDIT LOG ======

  _handleGetAccessAuditLog(url) {
    const match = url.match(/\/api\/access\/audit\/(\d+)/)
    const userId = parseInt(match?.[1], 10)
    return {
      status: 200,
      data: [
        { id: 1, action: 'ASSIGN_FUNCTION',  codename: 'reports:view',  performed_by: 'admin', performed_at: '2026-05-01T10:00:00Z', target_user_id: userId, reason: 'Onboarding' },
        { id: 2, action: 'REVOKE_FUNCTION',  codename: 'access:assign', performed_by: 'admin', performed_at: '2026-04-15T09:30:00Z', target_user_id: userId, reason: 'Role change' },
        { id: 3, action: 'ASSIGN_FUNCTION',  codename: 'audit:view',    performed_by: 'admin', performed_at: '2026-03-20T14:00:00Z', target_user_id: userId, reason: 'Compliance team' },
      ],
    }
  }
}

const mockInterceptor = new MockInterceptor();

export default mockInterceptor;
export { MockInterceptor };
