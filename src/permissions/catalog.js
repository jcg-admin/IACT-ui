/**
 * FunctionCatalog — canonical permission codes for client-side RBAC checks.
 *
 * Values follow the MOD-NNN notation defined in RBAC v5.4.0.
 * See: IACT-docs/source/requisitos/reglas-negocio/rbac/catalogo-funciones.rst
 *
 * These codes are used for UX-only guards (show/hide). Backend enforces
 * authorization independently on every request.
 *
 * Aligned with: IACT-api create_functions.py v5.4.0
 */
export const FunctionCatalog = {
  // ── MOD_RPT — Reportes (UC_RPT_01..11) ─────────────────────────────
  VIEW_DASHBOARD:       'RPT-002',   // view_dashboard
  VIEW_REPORTS:         'RPT-001',   // view_reports
  FILTER_REPORTS:       'RPT-003',   // filter_reports
  VIEW_CHARTS:          'RPT-008',   // view_charts
  VIEW_KPIS:            'RPT-007',   // view_kpis
  EXPORT_CSV:           'RPT-004',   // export_csv
  EXPORT_EXCEL:         'RPT-005',   // export_excel
  EXPORT_PDF:           'RPT-006',   // export_pdf
  SCHEDULE_REPORTS:     'RPT-009',   // schedule_report
  SAVE_VIEW:            'RPT-010',   // save_view
  SHARE_REPORTS:        'RPT-011',   // share_report
  VIEW_REALTIME:        'RPT-012',   // view_realtime_metrics (ASGI stub)
  VIEW_HISTORICAL:      'RPT-013',   // view_historical_reports
  // IVR + ACD reports
  VIEW_AGENT_REPORTS:       'RPT-014',  // view_agent_reports
  VIEW_AGENT_DETAIL:        'RPT-015',  // view_agent_detail (CA-06)
  VIEW_QUEUE_REPORTS:       'RPT-016',  // view_queue_reports
  VIEW_CAMPAIGN_REPORTS:    'RPT-017',  // view_campaign_reports
  VIEW_TRANSFER_REPORTS:    'RPT-018',  // view_transfer_reports
  VIEW_IVR_REPORTS:         'RPT-019',  // view_ivr_reports (SLA, menus, etc.)
  VIEW_UNIQUE_CLIENTS:      'RPT-020',  // view_unique_clients_reports

  // ── MOD_USR — Usuarios (UC_USR_01..04) ─────────────────────────────
  VIEW_USERS:    'USR-009',  // view_users
  MANAGE_USERS:  'USR-001',  // create_users
  EDIT_USERS:    'USR-002',  // update_users
  DELETE_USERS:  'USR-003',  // deactivate_users

  // ── MOD_ACC — Control de acceso (UC_ACC_01..09) ─────────────────────
  VIEW_ACCESS:              'ACC-003',  // view_assignments
  MANAGE_ACCESS:            'ACC-001',  // assign_functions
  MANAGE_GROUPS:            'ACC-006',  // create_function_group
  MANAGE_SEPARATION_RULES:  'ACC-005',  // view_separation_rules

  // ── MOD_AUD — Auditoría (UC_AUD_01..04) ─────────────────────────────
  VIEW_AUDIT:       'AUD-001',  // view_audit_log
  SEARCH_AUDIT:     'AUD-002',  // search_audit_log
  EXPORT_AUDIT:     'AUD-003',  // export_audit_log
  VIEW_COMPLIANCE:  'AUD-004',  // generate_compliance_report

  // ── MOD_ALR — Alertas (UC_ALR_01..05) ───────────────────────────────
  VIEW_ALERTS:    'ALR-001',  // view_alerts
  MANAGE_ALERTS:  'ALR-002',  // configure_alerts

  // ── MOD_LOG — Observabilidad (UC_LOG_01..07) ─────────────────────────
  VIEW_LOGS:              'LOG-001',  // view_application_logs
  VIEW_PIPELINE_LOGS:     'LOG-004',  // view_pipeline_logs
  VIEW_INFRA_LOGS:        'LOG-005',  // view_infra_logs
  VIEW_SYSTEM_HEALTH:     'LOG-006',  // view_system_health
  VIEW_TECHNICAL_METRICS: 'LOG-007',  // view_technical_metrics
  SEARCH_LOGS:            'LOG-003',  // search_logs
  EXPORT_LOGS:            'LOG-002',  // export_logs

  // ── MOD_PIP — Pipeline ETL (UC_PIP_01..05) ──────────────────────────
  VIEW_ETL_STATUS:       'PIP-001',  // view_pipeline_status
  VIEW_ETL_ERRORS:       'PIP-002',  // view_pipeline_errors
  VIEW_DATA_AVAIL:       'PIP-003',  // view_data_availability
  RETRY_PIPELINE:        'PIP-004',  // request_pipeline_retry
  MANAGE_PIPELINE_CONFIG:'PIP-005',  // manage_pipeline_config (nuevo)

  // ── MOD_ADM — Administración RBAC (UC_ADM_*) ────────────────────────
  MANAGE_CATALOG:          'ADM-001',  // manage_function_catalog
  MANAGE_MENU:             'ADM-002',  // manage_menu_items

  // Alias de compatibilidad — mapear nombres legacy del UI a nuevos códigos
  VIEW_OWN_SESSIONS:    'AUTH-001',  // view_own_sessions
  VIEW_ETL_SUPERVISION: 'PIP-001',   // alias legacy
  // ── Alias de compatibilidad adicionales ────────────────────────────
  ASSIGN_FUNCTION_GROUPS:     'ACC-004',     // assign_function_groups
  ASSIGN_TO_GROUP:     'ACC-007',     // assign_functions_to_group
  CONFIGURE_TEAM_ALERTS:     'ALR-003',     // configure_team_alerts
  CREATE_SEPARATION_RULE:     'ACC-011',     // update_separation_rule
  GRANT_EXCEPTIONAL:     'ACC-008',     // grant_exceptional_permission
  MANAGE_MENU_CATALOG:     'ADM-002',     // manage_menu_items
  REVOKE_EXCEPTIONAL:     'ACC-009',     // revoke_exceptional_permission
  REVOKE_FUNCTION_GROUP:     'ACC-010',     // revoke_function_group
  SUBSCRIBE_ALERT:     'ALR-008',     // subscribe_to_alert
  VIEW_ALERT_HISTORY:     'ALR-006',     // view_alert_history
  VIEW_ALL_SESSIONS:     'AUTH-004',     // view_all_active_sessions
  VIEW_DATA_AVAILABILITY:     'PIP-003',     // view_data_availability
  VIEW_METRICS:     'RPT-007',     // view_kpis
  VIEW_PIPELINE_ERRORS:     'PIP-002',     // view_pipeline_errors
  ACKNOWLEDGE_ALERT:     'ALR-007',     // acknowledge_alert
  BLOCK_USERS:     'USR-006',     // block_users
  CLOSE_SESSION:     'AUTH-002',     // close_user_session
  CONFIGURE_ALERT_SEVERITY:     'ALR-010',     // configure_subscription_severity
  DISABLE_ALERTS:     'ALR-005',     // disable_alerts
  DISABLE_SEPARATION_RULE:     'ACC-012',     // disable_separation_rule
  LIST_USERS:     'USR-004',     // list_users
  MANAGE_IS_CRITICAL:     'ADM-001',     // manage_catalog
  MANAGE_MENU_LIFECYCLE:     'ADM-002',     // manage_menu_lifecycle
  PAUSE_ALERTS:     'ALR-004',     // pause_alerts
  REACTIVATE_USERS:     'USR-008',     // reactivate_users
  RESET_PASSWORD:     'AUTH-003',     // reset_password
  REVOKE_FUNCTIONS:     'ACC-002',     // revoke_functions
  SEARCH_USERS:     'USR-005',     // search_users
  UNBLOCK_USERS:     'USR-007',     // unblock_users
  UNSUBSCRIBE_ALERT:     'ALR-009',     // unsubscribe_from_alert
  UPDATE_SEPARATION_RULE:     'ACC-011',     // update_separation_rule

}
