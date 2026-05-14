/**
 * FunctionCatalog — canonical permission strings for client-side RBAC checks.
 *
 * Values follow the {module}:{action} notation defined in RBAC v5.6.0.
 * See: IACT-docs/source/requisitos/reglas-negocio/rbac/catalogo-funciones.rst
 *
 * IMPORTANT: These strings are for UX only. The backend enforces authorization
 * independently on every request.
 */
export const FunctionCatalog = {
    // MOD_Reports — analytics and reporting (UC-RPT-01..11)
    VIEW_DASHBOARD:     'reports:dashboard',
    VIEW_METRICS:       'reports:kpis',
    VIEW_REPORTS:       'reports:view',
    FILTER_REPORTS:     'reports:filter',
    VIEW_CHARTS:        'reports:charts',
    EXPORT_CSV:         'reports:export_csv',
    EXPORT_EXCEL:       'reports:export_excel',
    EXPORT_PDF:         'reports:export_pdf',
    SCHEDULE_REPORTS:   'reports:schedule',
    SAVE_VIEW:          'reports:save_view',
    SHARE_REPORTS:      'reports:share',

    // MOD_Users — identity management (UC-006..009)
    VIEW_USERS:         'users:view',
    MANAGE_USERS:       'users:create',
    EDIT_USERS:         'users:update',
    DELETE_USERS:       'users:deactivate',

    // MOD_Access — RBAC assignment and separation rules (UC-010..011, UC_PERM_*)
    VIEW_ACCESS:        'access:view',
    MANAGE_ACCESS:      'access:assign',
    MANAGE_GROUPS:      'access:create_group',
    MANAGE_SEPARATION_RULES: 'access:view_separation_rules',

    // MOD_Audit — compliance and audit trail (UC-061..063)
    VIEW_AUDIT:         'audit:view',
    SEARCH_AUDIT:       'audit:search',
    EXPORT_AUDIT:       'audit:export',
    VIEW_COMPLIANCE:    'audit:compliance',

    // MOD_Alerts — alert configuration and history (UC-036..040)
    VIEW_ALERTS:        'alerts:view',
    MANAGE_ALERTS:      'alerts:configure',

    // MOD_Logs — technical observability (UC-LOG-01..07)
    VIEW_LOGS:               'logs:view_app',
    VIEW_PIPELINE_LOGS:      'logs:view_etl',
    VIEW_INFRA_LOGS:         'logs:view_infra',
    VIEW_SYSTEM_HEALTH:      'logs:view_health',
    VIEW_TECHNICAL_METRICS:  'logs:view_metrics',
    SEARCH_LOGS:             'logs:search',
    EXPORT_LOGS:             'logs:export',

    // MOD_Pipeline — ETL supervision (UC-050..053)
    VIEW_ETL_SUPERVISION: 'pipeline:view_status',
    RETRY_PIPELINE:       'pipeline:retry',

    // MOD_Admin — RBAC configuration plane (UC_ADM_*)
    MANAGE_CATALOG:          'adm:manage_catalog',
    CREATE_SEPARATION_RULE:  'adm:create_separation_rule',

    // MOD_Auth — session management (UC-005, UC-AUTH-05)
    VIEW_OWN_SESSIONS:  'auth:view_own_sessions',
    VIEW_ALL_SESSIONS:  'auth:view_all_sessions',

    // MOD_Access — extended (UC_PERM_02, UC_PERM_03)
    REVOKE_FUNCTION_GROUP: 'access:revoke_group',
    GRANT_EXCEPTIONAL:     'access:grant_exceptional',

    // MOD_Alerts — extended (NUEVAS v5.4.0 — ALR-003..010)
    CONFIGURE_TEAM_ALERTS:    'alerts:config_team',
    PAUSE_ALERTS:             'alerts:pause',
    DISABLE_ALERTS:           'alerts:disable',
    VIEW_ALERT_HISTORY:       'alerts:history',
    ACKNOWLEDGE_ALERT:        'alerts:acknowledge',
    SUBSCRIBE_ALERT:          'alerts:subscribe',
    UNSUBSCRIBE_ALERT:        'alerts:unsubscribe',
    CONFIGURE_ALERT_SEVERITY: 'alerts:config_severity',

    // MOD_Pipeline — extended (PIP-002/003)
    VIEW_PIPELINE_ERRORS:     'pipeline:view_errors',
    VIEW_DATA_AVAILABILITY:   'pipeline:availability',

    // MOD_Users — extended (USR-004..008)
    LIST_USERS:               'users:list',
    SEARCH_USERS:             'users:search',
    BLOCK_USERS:              'users:block',
    UNBLOCK_USERS:            'users:unblock',
    REACTIVATE_USERS:         'users:reactivate',

    // MOD_Access — extended v5.3.0/v5.4.0
    REVOKE_FUNCTIONS:         'access:revoke',
    ASSIGN_FUNCTION_GROUPS:   'access:assign_group',
    ASSIGN_TO_GROUP:          'access:assign_to_group',
    UPDATE_SEPARATION_RULE:   'access:update_separation_rule',
    DISABLE_SEPARATION_RULE:  'access:disable_separation_rule',
    REVOKE_EXCEPTIONAL:       'access:revoke_exceptional',

    // MOD_Auth — extended (AUTH-002/003)
    CLOSE_SESSION:            'auth:close_session',
    RESET_PASSWORD:           'auth:reset_password',

    // MOD_Admin — v5.6.x extension (ADM-004..006)
    MANAGE_MENU_CATALOG:      'adm:manage_menu_catalog',
    MANAGE_MENU_LIFECYCLE:    'adm:manage_menu_lifecycle',
    MANAGE_IS_CRITICAL:       'adm:manage_is_critical',
};
