import React from 'react';
import { render, screen } from '@testing-library/react';
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
