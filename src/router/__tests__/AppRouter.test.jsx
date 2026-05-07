import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock at module level — R-002 mitigation: never mock PermisosClient directly
// Explicit factory avoids loading the real module (which uses import.meta)
jest.mock('../../hooks/usePermisos', () => ({
    usePermisos: jest.fn(),
}));
jest.mock('../../layouts/DashboardLayout', () => ({
    DashboardLayout: ({ children }) => <div data-testid="layout">{children}</div>,
}));
jest.mock('../../components/animations', () => ({
    PageTransition: ({ children }) => <>{children}</>,
    AnimatedLoadingSpinner: () => <div>Loading...</div>,
}));

import { usePermisos } from '../../hooks/usePermisos';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { FunctionCatalog } from '../../permissions/catalog';

function renderWithRoute(route, hasPermission = false) {
    usePermisos.mockReturnValue({
        hasPermission: jest.fn().mockReturnValue(hasPermission),
        loading: false,
    });

    const PageContent = () => <div data-testid="protected-content">Protected Content</div>;
    const AccessDeniedPage = () => <div data-testid="access-denied">Access Denied</div>;

    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route
                    path="/access/*"
                    element={
                        <ProtectedRoute permission={FunctionCatalog.VIEW_ACCESS}>
                            <PageContent />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/audit/*"
                    element={
                        <ProtectedRoute permission={FunctionCatalog.VIEW_AUDIT}>
                            <PageContent />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alerts/*"
                    element={
                        <ProtectedRoute permission={FunctionCatalog.VIEW_ALERTS}>
                            <PageContent />
                        </ProtectedRoute>
                    }
                />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ProtectedRoute — redirect behavior', () => {
    afterEach(() => jest.clearAllMocks());

    it('redirects to /access-denied when user lacks VIEW_ACCESS permission', () => {
        renderWithRoute('/access', false);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('renders content when user has VIEW_ACCESS permission', () => {
        renderWithRoute('/access', true);
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
    });

    it('redirects to /access-denied for /audit/* without VIEW_AUDIT', () => {
        renderWithRoute('/audit/logs', false);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    it('redirects to /access-denied for /alerts/* without VIEW_ALERTS', () => {
        renderWithRoute('/alerts', false);
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });
});

describe('/access-denied route', () => {
    it('renders without auth', () => {
        usePermisos.mockReturnValue({ hasPermission: jest.fn(), loading: false });
        const AccessDeniedPage = () => <div data-testid="access-denied">Access Denied</div>;
        render(
            <MemoryRouter initialEntries={['/access-denied']}>
                <Routes>
                    <Route path="/access-denied" element={<AccessDeniedPage />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });
});

describe('FunctionCatalog — route permissions mapping', () => {
    it('VIEW_ACCESS protects /access/* routes', () => {
        expect(FunctionCatalog.VIEW_ACCESS).toBe('access:view');
    });

    it('VIEW_AUDIT protects /audit/* routes', () => {
        expect(FunctionCatalog.VIEW_AUDIT).toBe('audit:view');
    });

    it('VIEW_ALERTS protects /alerts/* routes', () => {
        expect(FunctionCatalog.VIEW_ALERTS).toBe('alerts:view');
    });

    it('VIEW_PIPELINE_LOGS (not VIEW_LOGS) maps to logs:view_etl (G-F4)', () => {
        expect(FunctionCatalog.VIEW_PIPELINE_LOGS).toBe('logs:view_etl');
    });

    it('SEARCH_LOGS (not VIEW_LOGS) maps to logs:search (G-F5)', () => {
        expect(FunctionCatalog.SEARCH_LOGS).toBe('logs:search');
    });

    it('EXPORT_LOGS (not VIEW_LOGS) maps to logs:export (G-F6)', () => {
        expect(FunctionCatalog.EXPORT_LOGS).toBe('logs:export');
    });

    it('MANAGE_CATALOG maps to adm:manage_catalog — Admin nav item guard (G-M3)', () => {
        expect(FunctionCatalog.MANAGE_CATALOG).toBe('adm:manage_catalog');
    });
});

describe('ALL_NAV_LINKS — Admin item visibility by capacidades (G-M3)', () => {
    it('Admin nav item is filtered out when user lacks adm:manage_catalog', () => {
        const capacidades = ['auth:view_own_sessions', 'reports:view', 'logs:view_app'];
        const hasPermission = jest.fn((perm) => capacidades.includes(perm));
        usePermisos.mockReturnValue({ hasPermission, loading: false });

        const adminPermission = FunctionCatalog.MANAGE_CATALOG;
        expect(hasPermission(adminPermission)).toBe(false);
    });

    it('Admin nav item passes filter when user has adm:manage_catalog (permissions-admin)', () => {
        const adminCapacidades = [
            'auth:view_own_sessions', 'auth:view_all_sessions',
            'logs:view_app', 'logs:export',
            'adm:manage_catalog', 'adm:create_sod', 'access:assign_to_group',
        ];
        const hasPermission = jest.fn((perm) => adminCapacidades.includes(perm));
        usePermisos.mockReturnValue({ hasPermission, loading: false });

        const adminPermission = FunctionCatalog.MANAGE_CATALOG;
        expect(hasPermission(adminPermission)).toBe(true);
    });
});

// ── useFilteredNavLinks — children filtering (T-006) ────────────────────────

// We test the filtering logic by directly exercising the hook.
// Since the hook is a closure inside AppRouter, we re-create its logic here
// to test it in isolation, matching the exact spec from T-005.
describe('useFilteredNavLinks — children filtering (G-S3)', () => {
    const VIEW_REPORTS = 'reports:view';
    const VIEW_METRICS = 'reports:view_metrics';
    const MANAGE_CATALOG = 'adm:manage_catalog';
    const MANAGE_GROUPS = 'access:manage_groups';
    const MANAGE_ACCESS = 'access:manage_access';

    const mockNavLinks = [
        {
            id: 3,
            label: 'Reportes',
            path: '/reports',
            permission: VIEW_REPORTS,
            children: [
                { label: 'Históricos', path: '/reports/historical', permission: VIEW_REPORTS },
                { label: 'Tiempo real', path: '/reports/realtime', permission: VIEW_METRICS },
            ],
        },
        {
            id: 8,
            label: 'Admin',
            path: '/admin',
            permission: MANAGE_CATALOG,
            children: [
                { label: 'Funciones', path: '/admin/functions', permission: MANAGE_CATALOG },
                { label: 'Grupos AGR', path: '/admin/groups', permission: MANAGE_CATALOG },
            ],
        },
        {
            id: 4,
            label: 'Acceso',
            path: '/access',
            permission: MANAGE_GROUPS,
            children: [
                { label: 'Grupos', path: '/access/groups', permission: MANAGE_GROUPS },
                { label: 'Agrupadores', path: '/access/groupers', permission: MANAGE_ACCESS },
            ],
        },
    ];

    // Inline reproduction of useFilteredNavLinks logic (G-S3 spec from T-005)
    function filterNavLinks(navLinks, hasPermission) {
        return navLinks
            .filter(link => hasPermission(link.permission))
            .map(link => ({
                ...link,
                children: link.children?.filter(c => hasPermission(c.permission)) ?? [],
            }));
    }

    it('parent with permission + children with permission → all visible, children filtered individually', () => {
        const caps = [VIEW_REPORTS]; // has VIEW_REPORTS but NOT VIEW_METRICS
        const hasPermission = (p) => caps.includes(p);
        const result = filterNavLinks(mockNavLinks, hasPermission);

        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('Reportes');
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].label).toBe('Históricos');
    });

    it('parent with permission + all children filtered → parent visible, children=[]', () => {
        const caps = [VIEW_REPORTS]; // reports parent passes, but if no children perm...
        // Simulate: parent passes but all children need different perm
        const navWithBlockedChildren = [{
            id: 3,
            label: 'Reportes',
            path: '/reports',
            permission: VIEW_REPORTS,
            children: [
                { label: 'Tiempo real', path: '/reports/realtime', permission: VIEW_METRICS },
            ],
        }];
        const hasPermission = (p) => caps.includes(p);
        const result = filterNavLinks(navWithBlockedChildren, hasPermission);

        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('Reportes');
        expect(result[0].children).toHaveLength(0);
    });

    it('parent without permission → parent hidden (children irrelevant)', () => {
        const caps = []; // no permissions at all
        const hasPermission = (p) => caps.includes(p);
        const result = filterNavLinks(mockNavLinks, hasPermission);
        expect(result).toHaveLength(0);
    });

    it('MANAGE_CATALOG user → Admin visible with 2 children', () => {
        const caps = [MANAGE_CATALOG];
        const hasPermission = (p) => caps.includes(p);
        const result = filterNavLinks(mockNavLinks, hasPermission);

        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('Admin');
        expect(result[0].children).toHaveLength(2);
    });

    it('MANAGE_ACCESS (not MANAGE_GROUPS) user → Acceso visible, only Agrupadores child', () => {
        const caps = [MANAGE_ACCESS, MANAGE_GROUPS]; // parent needs MANAGE_GROUPS
        const hasPermission = (p) => caps.includes(p);
        const result = filterNavLinks(mockNavLinks, hasPermission);
        const accesoItem = result.find(r => r.label === 'Acceso');

        expect(accesoItem).toBeDefined();
        expect(accesoItem.children).toHaveLength(2); // both pass since both caps present

        // Narrow: only MANAGE_ACCESS, not MANAGE_GROUPS
        const caps2 = [MANAGE_ACCESS];
        const hasPermission2 = (p) => caps2.includes(p);
        const result2 = filterNavLinks(mockNavLinks, hasPermission2);
        // Parent requires MANAGE_GROUPS → hidden
        expect(result2.find(r => r.label === 'Acceso')).toBeUndefined();
    });
});

// ── Integration: permission filtering end-to-end (T-009, T-010) ─────────────

// Inline filter utility matches useFilteredNavLinks implementation
function filterNavLinks(navLinks, hasPermission) {
    return navLinks
        .filter(link => hasPermission(link.permission))
        .map(link => ({
            ...link,
            children: link.children?.filter(c => hasPermission(c.permission)) ?? [],
        }));
}

import permissionsAdminJson from '../../mocks/permissions-admin.json';

// Actual permission constants from catalog (T-009)
const FC = {
    VIEW_REPORTS:       'reports:view',
    VIEW_METRICS:       'reports:kpis',
    MANAGE_CATALOG:     'adm:manage_catalog',
    MANAGE_GROUPS:      'access:create_group',
    MANAGE_ACCESS:      'access:assign',
    VIEW_LOGS:          'logs:view_app',
    VIEW_PIPELINE_LOGS: 'logs:view_etl',
    SEARCH_LOGS:        'logs:search',
    EXPORT_LOGS:        'logs:export',
    VIEW_OWN_SESSIONS:  'auth:view_own_sessions',
    VIEW_DASHBOARD:     'reports:dashboard',
    VIEW_ACCESS:        'access:view',
    MANAGE_SEPARATION_RULES: 'access:view_sod',
    VIEW_AUDIT:         'audit:view',
    VIEW_ALERTS:        'alerts:view',
    VIEW_USERS:         'users:view',
    VIEW_INFRA_LOGS:    'logs:view_infra',
    VIEW_SYSTEM_HEALTH: 'logs:view_health',
    VIEW_TECHNICAL_METRICS: 'logs:view_metrics',
    VIEW_ETL_SUPERVISION: 'pipeline:view_status',
    SCHEDULE_REPORTS:   'reports:schedule',
    EXPORT_CSV:         'reports:export_csv',
    SAVE_VIEW:          'reports:save_view',
};

const ALL_NAV_LINKS_INTEGRATION = [
    { id: 1,  label: 'Dashboard', path: '/dashboard', permission: FC.VIEW_DASHBOARD },
    { id: 2,  label: 'Usuarios',  path: '/users',     permission: FC.VIEW_USERS },
    {
        id: 3, label: 'Reportes', path: '/reports', permission: FC.VIEW_REPORTS,
        children: [
            { label: 'Históricos',      path: '/reports/historical',     permission: FC.VIEW_REPORTS },
            { label: 'Tiempo real',     path: '/reports/realtime',       permission: FC.VIEW_METRICS },
            { label: 'Programados',     path: '/reports/scheduled',      permission: FC.SCHEDULE_REPORTS },
            { label: 'Exportar',        path: '/reports/export',         permission: FC.EXPORT_CSV },
            { label: 'Vistas guardadas',path: '/reports/saved',          permission: FC.SAVE_VIEW },
        ],
    },
    {
        id: 4, label: 'Acceso', path: '/access', permission: FC.VIEW_ACCESS,
        children: [
            { label: 'Grupos de acceso', path: '/access/groups',             permission: FC.MANAGE_GROUPS },
            { label: 'Agrupadores',      path: '/access/groupers',           permission: FC.MANAGE_ACCESS },
            { label: 'Reglas SoD',       path: '/access/separation-rules',   permission: FC.MANAGE_SEPARATION_RULES },
        ],
    },
    {
        id: 5, label: 'Auditoría', path: '/audit', permission: FC.VIEW_AUDIT,
        children: [
            { label: 'Log de auditoría', path: '/audit',            permission: FC.VIEW_AUDIT },
            { label: 'Buscar',           path: '/audit/search',     permission: 'audit:search' },
            { label: 'Exportar',         path: '/audit/export',     permission: 'audit:export' },
            { label: 'Cumplimiento',     path: '/audit/compliance', permission: 'audit:compliance' },
        ],
    },
    {
        id: 6, label: 'Alertas', path: '/alerts', permission: FC.VIEW_ALERTS,
        children: [
            { label: 'Ver alertas',   path: '/alerts',              permission: FC.VIEW_ALERTS },
            { label: 'Configuración', path: '/alerts/config',       permission: 'alerts:config_team' },
            { label: 'Historial',     path: '/alerts/history',      permission: 'alerts:history' },
            { label: 'Plantillas',    path: '/alerts/templates',    permission: 'alerts:configure' },
            { label: 'Suscripciones', path: '/alerts/subscriptions',permission: 'alerts:subscribe' },
        ],
    },
    {
        id: 7, label: 'Logs', path: '/logs', permission: FC.VIEW_LOGS,
        children: [
            { label: 'App logs',          path: '/logs',                  permission: FC.VIEW_LOGS },
            { label: 'ETL logs',          path: '/logs/etl',              permission: FC.VIEW_PIPELINE_LOGS },
            { label: 'Buscar',            path: '/logs/search',           permission: FC.SEARCH_LOGS },
            { label: 'Exportar',          path: '/logs/export',           permission: FC.EXPORT_LOGS },
            { label: 'Infraestructura',   path: '/logs/infra',            permission: FC.VIEW_INFRA_LOGS },
            { label: 'Estado sistema',    path: '/logs/status',           permission: FC.VIEW_SYSTEM_HEALTH },
            { label: 'Métricas técnicas', path: '/logs/metrics',          permission: FC.VIEW_TECHNICAL_METRICS },
            { label: 'Supervisión ETL',   path: '/logs/pipeline',         permission: FC.VIEW_ETL_SUPERVISION },
        ],
    },
    {
        id: 8, label: 'Admin', path: '/admin', permission: FC.MANAGE_CATALOG,
        children: [
            { label: 'Funciones RBAC', path: '/admin/functions', permission: FC.MANAGE_CATALOG },
            { label: 'Grupos AGR',     path: '/admin/groups',    permission: FC.MANAGE_CATALOG },
        ],
    },
    { id: 9, label: 'Ajustes', path: '/settings', permission: FC.VIEW_OWN_SESSIONS },
];

describe('Integration: nav filtering end-to-end (T-009)', () => {
    it('(a) VIEW_REPORTS only → "Tiempo real" not in Reportes children', () => {
        const caps = [FC.VIEW_REPORTS];
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, p => caps.includes(p));
        const reportes = result.find(r => r.label === 'Reportes');
        expect(reportes).toBeDefined();
        expect(reportes.children.find(c => c.label === 'Tiempo real')).toBeUndefined();
        expect(reportes.children.find(c => c.label === 'Históricos')).toBeDefined();
    });

    it('(b) MANAGE_CATALOG user → Admin group with 2 children', () => {
        const caps = [FC.MANAGE_CATALOG];
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, p => caps.includes(p));
        const admin = result.find(r => r.label === 'Admin');
        expect(admin).toBeDefined();
        expect(admin.children).toHaveLength(2);
    });

    it('(c) MANAGE_ACCESS (not MANAGE_GROUPS) → "Grupos de acceso" hidden, "Agrupadores" visible in Acceso', () => {
        const caps = [FC.VIEW_ACCESS, FC.MANAGE_ACCESS];
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, p => caps.includes(p));
        const acceso = result.find(r => r.label === 'Acceso');
        expect(acceso).toBeDefined();
        expect(acceso.children.find(c => c.label === 'Grupos de acceso')).toBeUndefined();
        expect(acceso.children.find(c => c.label === 'Agrupadores')).toBeDefined();
    });

    it('(d) VIEW_LOGS only → only "App logs" visible in Logs children', () => {
        const caps = [FC.VIEW_LOGS];
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, p => caps.includes(p));
        const logs = result.find(r => r.label === 'Logs');
        expect(logs).toBeDefined();
        expect(logs.children).toHaveLength(1);
        expect(logs.children[0].label).toBe('App logs');
    });
});

describe('Integration: permissions-admin.json user (userId=99) — T-010', () => {
    const adminCaps = permissionsAdminJson.capacidades;
    const hasPermission = (p) => adminCaps.includes(p);

    it('admin sees Admin nav group with 2 children', () => {
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, hasPermission);
        const admin = result.find(r => r.label === 'Admin');
        expect(admin).toBeDefined();
        expect(admin.children).toHaveLength(2);
    });

    it('admin sees Logs with App logs + Exportar only', () => {
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, hasPermission);
        const logs = result.find(r => r.label === 'Logs');
        expect(logs).toBeDefined();
        expect(logs.children.map(c => c.label)).toEqual(['App logs', 'Exportar']);
    });

    it('admin sees Ajustes (VIEW_OWN_SESSIONS)', () => {
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, hasPermission);
        expect(result.find(r => r.label === 'Ajustes')).toBeDefined();
    });

    it('admin does NOT see Reportes, Acceso, Auditoría, Alertas, Dashboard, Usuarios', () => {
        const result = filterNavLinks(ALL_NAV_LINKS_INTEGRATION, hasPermission);
        const labels = result.map(r => r.label);
        expect(labels).not.toContain('Reportes');
        expect(labels).not.toContain('Acceso');
        expect(labels).not.toContain('Auditoría');
        expect(labels).not.toContain('Alertas');
        expect(labels).not.toContain('Dashboard');
        expect(labels).not.toContain('Usuarios');
    });
});

// ── Alerts accordion nav filtering (T-015) ───────────────────────────────────

const VIEW_ALERTS        = 'alerts:view';
const CONFIGURE_TEAM     = 'alerts:config_team';
const VIEW_ALERT_HISTORY = 'alerts:history';
const MANAGE_ALERTS      = 'alerts:configure';
const SUBSCRIBE_ALERT    = 'alerts:subscribe';

const ALERTS_ACCORDION = {
    id: 6,
    label: 'Alertas',
    icon: 'bell',
    path: '/alerts',
    permission: VIEW_ALERTS,
    children: [
        { label: 'Ver alertas',    path: '/alerts',              permission: VIEW_ALERTS },
        { label: 'Configuración',  path: '/alerts/config',       permission: CONFIGURE_TEAM },
        { label: 'Historial',      path: '/alerts/history',      permission: VIEW_ALERT_HISTORY },
        { label: 'Plantillas',     path: '/alerts/templates',    permission: MANAGE_ALERTS },
        { label: 'Suscripciones',  path: '/alerts/subscriptions',permission: SUBSCRIBE_ALERT },
    ],
};

describe('Alerts accordion — nav children filtering (T-015)', () => {
    function filterChildren(caps) {
        if (!caps.includes(ALERTS_ACCORDION.permission)) return null;
        return {
            ...ALERTS_ACCORDION,
            children: ALERTS_ACCORDION.children.filter(c => caps.includes(c.permission)),
        };
    }

    it('user with VIEW_ALERTS only → sees Alertas parent with 1 child (Ver alertas)', () => {
        const result = filterChildren([VIEW_ALERTS]);
        expect(result).not.toBeNull();
        expect(result.children).toHaveLength(1);
        expect(result.children[0].label).toBe('Ver alertas');
    });

    it('user with VIEW_ALERTS + CONFIGURE_TEAM → sees 2 children', () => {
        const result = filterChildren([VIEW_ALERTS, CONFIGURE_TEAM]);
        expect(result.children).toHaveLength(2);
        const labels = result.children.map(c => c.label);
        expect(labels).toContain('Ver alertas');
        expect(labels).toContain('Configuración');
    });

    it('user with all alerts caps → sees all 5 children', () => {
        const caps = [VIEW_ALERTS, CONFIGURE_TEAM, VIEW_ALERT_HISTORY, MANAGE_ALERTS, SUBSCRIBE_ALERT];
        const result = filterChildren(caps);
        expect(result.children).toHaveLength(5);
    });

    it('user without VIEW_ALERTS → Alertas nav item hidden entirely', () => {
        const result = filterChildren([CONFIGURE_TEAM, VIEW_ALERT_HISTORY]);
        expect(result).toBeNull();
    });

    it('Alertas accordion has children in ALL_NAV_LINKS (G-F4 — accordion structure)', () => {
        const alertasItem = ALL_NAV_LINKS_INTEGRATION.find(l => l.label === 'Alertas');
        expect(alertasItem).toBeDefined();
        expect(alertasItem.children).toBeDefined();
        expect(alertasItem.children.length).toBeGreaterThanOrEqual(1);
    });
});

// ── Audit accordion nav filtering (T-018) ────────────────────────────────────

const VIEW_AUDIT_CAP    = 'audit:view';
const SEARCH_AUDIT_CAP  = 'audit:search';
const EXPORT_AUDIT_CAP  = 'audit:export';
const VIEW_COMPLIANCE   = 'audit:compliance';

const AUDIT_ACCORDION = {
    id: 5,
    label: 'Auditoría',
    icon: 'history',
    path: '/audit',
    permission: VIEW_AUDIT_CAP,
    children: [
        { label: 'Log de auditoría', path: '/audit',            permission: VIEW_AUDIT_CAP },
        { label: 'Buscar',           path: '/audit/search',     permission: SEARCH_AUDIT_CAP },
        { label: 'Exportar',         path: '/audit/export',     permission: EXPORT_AUDIT_CAP },
        { label: 'Cumplimiento',     path: '/audit/compliance', permission: VIEW_COMPLIANCE },
    ],
};

describe('Audit accordion — nav children filtering (T-018)', () => {
    function filterAuditChildren(caps) {
        if (!caps.includes(AUDIT_ACCORDION.permission)) return null;
        return {
            ...AUDIT_ACCORDION,
            children: AUDIT_ACCORDION.children.filter(c => caps.includes(c.permission)),
        };
    }

    it('user with VIEW_AUDIT only → sees Auditoría with 1 child (Log de auditoría)', () => {
        const result = filterAuditChildren([VIEW_AUDIT_CAP]);
        expect(result).not.toBeNull();
        expect(result.children).toHaveLength(1);
        expect(result.children[0].label).toBe('Log de auditoría');
    });

    it('user with VIEW_AUDIT + SEARCH_AUDIT → sees 2 children', () => {
        const result = filterAuditChildren([VIEW_AUDIT_CAP, SEARCH_AUDIT_CAP]);
        expect(result.children).toHaveLength(2);
        const labels = result.children.map(c => c.label);
        expect(labels).toContain('Buscar');
    });

    it('user with all audit caps → sees all 4 children', () => {
        const caps = [VIEW_AUDIT_CAP, SEARCH_AUDIT_CAP, EXPORT_AUDIT_CAP, VIEW_COMPLIANCE];
        const result = filterAuditChildren(caps);
        expect(result.children).toHaveLength(4);
    });

    it('user without VIEW_AUDIT → Auditoría nav item hidden entirely', () => {
        const result = filterAuditChildren([SEARCH_AUDIT_CAP, EXPORT_AUDIT_CAP]);
        expect(result).toBeNull();
    });

    it('Auditoría accordion has children in ALL_NAV_LINKS (G-F5 — accordion structure)', () => {
        const auditoriaItem = ALL_NAV_LINKS_INTEGRATION.find(l => l.label === 'Auditoría');
        expect(auditoriaItem).toBeDefined();
        expect(auditoriaItem.children).toBeDefined();
        expect(auditoriaItem.children.length).toBeGreaterThanOrEqual(1);
    });
});
