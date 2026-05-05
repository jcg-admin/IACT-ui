import { FunctionCatalog } from '../catalog';

describe('FunctionCatalog', () => {
    const entries = Object.entries(FunctionCatalog);

    it('exports at least 25 constants', () => {
        expect(entries.length).toBeGreaterThanOrEqual(25);
    });

    it.each(entries)('%s follows sistema.{domain}.{resource}.{action} format', (key, value) => {
        expect(typeof value).toBe('string');
        expect(value).not.toBe('');
        const parts = value.split('.');
        expect(parts.length).toBe(4);
        expect(parts[0]).toBe('sistema');
        parts.slice(1).forEach(part => {
            expect(part).toMatch(/^[a-z_]+$/);
            expect(part.length).toBeGreaterThan(0);
        });
    });

    it('has no duplicate values', () => {
        const values = entries.map(([, v]) => v);
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });

    it('exposes VIEW_ACCESS for RBAC access control route guard', () => {
        expect(FunctionCatalog.VIEW_ACCESS).toBe('sistema.administracion.acceso.ver');
    });

    it('exposes VIEW_AUDIT for audit route guard', () => {
        expect(FunctionCatalog.VIEW_AUDIT).toBe('sistema.auditoria.logs.ver');
    });
});
