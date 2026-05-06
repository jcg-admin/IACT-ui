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

    // MOD_Access — RBAC assignment and SoD (UC-010..011, UC_PERM_*)
    VIEW_ACCESS:        'access:view',
    MANAGE_ACCESS:      'access:assign',
    MANAGE_GROUPS:      'access:create_group',
    MANAGE_SEPARATION_RULES: 'access:view_sod',

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
    CREATE_SEPARATION_RULE:  'adm:create_sod',

    // MOD_Auth — session management (UC-005, UC-AUTH-05)
    VIEW_OWN_SESSIONS:  'auth:view_own_sessions',
    VIEW_ALL_SESSIONS:  'auth:view_all_sessions',

    // MOD_Access — extended (UC_PERM_02, UC_PERM_03)
    REVOKE_FUNCTION_GROUP: 'access:revoke_group',
    GRANT_EXCEPTIONAL:     'access:grant_exceptional',
};
