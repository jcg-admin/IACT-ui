import { FunctionCatalog } from '../catalog';

describe('FunctionCatalog', () => {
    const entries = Object.entries(FunctionCatalog);

    it('exports at least 25 constants', () => {
        expect(entries.length).toBeGreaterThanOrEqual(25);
    });

    it.each(entries)('%s follows module:action format', (key, value) => {
        expect(typeof value).toBe('string');
        expect(value).not.toBe('');
        const parts = value.split(':');
        expect(parts.length).toBe(2);
        parts.forEach(part => {
            expect(part).toMatch(/^[a-z][a-z_]*$/);
            expect(part.length).toBeGreaterThan(0);
        });
    });

    it('has no duplicate values', () => {
        const values = entries.map(([, v]) => v);
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });

    it('exposes VIEW_ACCESS for RBAC access control route guard', () => {
        expect(FunctionCatalog.VIEW_ACCESS).toBe('access:view');
    });

    it('exposes VIEW_AUDIT for audit route guard', () => {
        expect(FunctionCatalog.VIEW_AUDIT).toBe('audit:view');
    });

    it('exposes VIEW_ALERTS for alerts route guard', () => {
        expect(FunctionCatalog.VIEW_ALERTS).toBe('alerts:view');
    });

    it('exposes VIEW_DASHBOARD for dashboard route guard', () => {
        expect(FunctionCatalog.VIEW_DASHBOARD).toBe('reports:dashboard');
    });
});
