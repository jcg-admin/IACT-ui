/**
 * FunctionCatalog — canonical permission strings for client-side RBAC checks.
 *
 * Values follow the sistema.{domain}.{resource}.{action} notation used by the
 * backend's calculate_effective_functions endpoint and surfaced in the
 * permissions mock under the "capacidades" array.
 *
 * IMPORTANT: These strings are for UX only. The backend enforces authorization
 * independently on every request.
 */
export const FunctionCatalog = {
    // Dashboard & reporting
    VIEW_DASHBOARD:     'sistema.vistas.dashboards.ver',
    VIEW_METRICS:       'sistema.analisis.metricas.ver',
    VIEW_REPORTS:       'sistema.analisis.reportes.ver',
    EXPORT_CSV:         'sistema.analisis.reportes.exportar',

    // Call operations
    VIEW_CALLS:         'sistema.operaciones.llamadas.ver',
    PERFORM_CALLS:      'sistema.operaciones.llamadas.realizar',

    // Tickets
    VIEW_TICKETS:       'sistema.operaciones.tickets.ver',
    CREATE_TICKETS:     'sistema.operaciones.tickets.crear',
    EDIT_TICKETS:       'sistema.operaciones.tickets.editar',

    // Clients
    VIEW_CLIENTS:       'sistema.operaciones.clientes.ver',

    // User administration
    VIEW_USERS:         'sistema.administracion.usuarios.ver',
    EDIT_USERS:         'sistema.administracion.usuarios.editar',
    DELETE_USERS:       'sistema.administracion.usuarios.eliminar',

    // Access control (RBAC management — ITER4)
    VIEW_ACCESS:        'sistema.administracion.acceso.ver',
    MANAGE_ACCESS:      'sistema.administracion.acceso.gestionar',
    ASSIGN_FUNCTIONS:   'sistema.administracion.acceso.asignar',
    MANAGE_SOD:         'sistema.administracion.acceso.sod',

    // Audit (ITER6)
    VIEW_AUDIT:         'sistema.auditoria.logs.ver',
    SEARCH_AUDIT:       'sistema.auditoria.logs.buscar',
    EXPORT_AUDIT:       'sistema.auditoria.logs.exportar',
    VIEW_COMPLIANCE:    'sistema.auditoria.compliance.ver',

    // Alerts (ITER5)
    VIEW_ALERTS:        'sistema.alertas.notificaciones.ver',
    MANAGE_ALERTS:      'sistema.alertas.notificaciones.gestionar',

    // Configuration
    VIEW_CONFIG:        'sistema.configuracion.parametros.ver',
    EDIT_CONFIG:        'sistema.configuracion.parametros.editar',
};
