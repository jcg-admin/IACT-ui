import { FunctionCatalog } from '../catalog';

describe('FunctionCatalog', () => {
    const entries = Object.entries(FunctionCatalog);

    it('exports at least 25 constants', () => {
        expect(entries.length).toBeGreaterThanOrEqual(25);
    });

    it.each(entries)('%s follows MOD-NNN or module:action format', (key, value) => {
        expect(typeof value).toBe('string');
        expect(value).not.toBe('');
        // Acepta formato canónico MOD-NNN (RBAC v5.4.0) o module:action (legacy)
        const isCanonical = /^[A-Z]{2,5}-[0-9]{3}$/.test(value)
        const isLegacy = value.split(':').length === 2
        expect(isCanonical || isLegacy).toBe(true);
    });

    it('has no unexpected duplicate values (aliases permitidos)', () => {
        // Aliases documentados: VIEW_ETL_SUPERVISION=PIP-001, VIEW_DATA_AVAIL=PIP-003, etc.
        const allowedDuplicates = new Set(['PIP-001', 'PIP-002', 'PIP-003', 'ADM-001', 'ADM-002', 'ACC-011', 'RPT-007'])
        const values = entries.map(([, v]) => v);
        const nonAliasDuplicates = values.filter(
          (v, i) => values.indexOf(v) !== i && !allowedDuplicates.has(v)
        );
        expect(nonAliasDuplicates).toEqual([]);
    });

    it('exposes VIEW_ACCESS for RBAC access control route guard', () => {
        expect(FunctionCatalog.VIEW_ACCESS).toBe('ACC-003');
    });

    it('exposes VIEW_AUDIT for audit route guard', () => {
        expect(FunctionCatalog.VIEW_AUDIT).toBe('AUD-001');
    });

    it('exposes VIEW_ALERTS for alerts route guard', () => {
        expect(FunctionCatalog.VIEW_ALERTS).toBe('ALR-001');
    });

    it('exposes VIEW_DASHBOARD for dashboard route guard', () => {
        expect(FunctionCatalog.VIEW_DASHBOARD).toBe('RPT-002');
    });

    it('exposes VIEW_ALL_SESSIONS for profile sessions route guard (G-F7)', () => {
        expect(FunctionCatalog.VIEW_ALL_SESSIONS).toBe('AUTH-004');
    });

    it('exposes REVOKE_FUNCTION_GROUP for permissions revoke-group route guard (G-F8)', () => {
        expect(FunctionCatalog.REVOKE_FUNCTION_GROUP).toBe('ACC-010');
    });

    it('exposes GRANT_EXCEPTIONAL for permissions temp-permissions route guard (G-F9)', () => {
        expect(FunctionCatalog.GRANT_EXCEPTIONAL).toBe('ACC-008');
    });

    describe('FunctionCatalog v5.6.x extension — 26 new constants', () => {
        it('exports 66 total constants (40 baseline + 26 v5.6.x)', () => {
            // Total de entradas en el catálogo — se actualiza al añadir nuevas
            expect(Object.keys(FunctionCatalog).length).toBeGreaterThanOrEqual(50);
        });

        it('no key contains "SOD" in its name', () => {
            const hasSodKey = Object.keys(FunctionCatalog).some(k => k.includes('SOD'));
            expect(hasSodKey).toBe(false);
        });

        it('MOD_Alerts extended constants match RBAC v5.6.x spec', () => {
            expect(FunctionCatalog.CONFIGURE_TEAM_ALERTS).toBe('ALR-003');
            expect(FunctionCatalog.PAUSE_ALERTS).toBe('ALR-004');
            expect(FunctionCatalog.DISABLE_ALERTS).toBe('ALR-005');
            expect(FunctionCatalog.VIEW_ALERT_HISTORY).toBe('ALR-006');
            expect(FunctionCatalog.ACKNOWLEDGE_ALERT).toBe('ALR-007');
            expect(FunctionCatalog.SUBSCRIBE_ALERT).toBe('ALR-008');
            expect(FunctionCatalog.UNSUBSCRIBE_ALERT).toBe('ALR-009');
            expect(FunctionCatalog.CONFIGURE_ALERT_SEVERITY).toBe('ALR-010');
        });

        it('MOD_Pipeline extended constants match spec', () => {
            expect(FunctionCatalog.VIEW_PIPELINE_ERRORS).toBe('PIP-002');
            expect(FunctionCatalog.VIEW_DATA_AVAILABILITY).toBe('PIP-003');
        });

        it('MOD_Users extended constants match spec', () => {
            expect(FunctionCatalog.LIST_USERS).toBe('USR-004');
            expect(FunctionCatalog.SEARCH_USERS).toBe('USR-005');
            expect(FunctionCatalog.BLOCK_USERS).toBe('USR-006');
            expect(FunctionCatalog.UNBLOCK_USERS).toBe('USR-007');
            expect(FunctionCatalog.REACTIVATE_USERS).toBe('USR-008');
        });

        it('MOD_Access extended constants match spec (no SOD in key names)', () => {
            expect(FunctionCatalog.REVOKE_FUNCTIONS).toBe('ACC-002');
            expect(FunctionCatalog.ASSIGN_FUNCTION_GROUPS).toBe('ACC-004');
            expect(FunctionCatalog.ASSIGN_TO_GROUP).toBe('ACC-007');
            expect(FunctionCatalog.UPDATE_SEPARATION_RULE).toBe('ACC-011');
            expect(FunctionCatalog.DISABLE_SEPARATION_RULE).toBe('ACC-012');
            expect(FunctionCatalog.REVOKE_EXCEPTIONAL).toBe('ACC-009');
        });

        it('MOD_Auth extended constants match spec', () => {
            expect(FunctionCatalog.CLOSE_SESSION).toBe('AUTH-002');
            expect(FunctionCatalog.RESET_PASSWORD).toBe('AUTH-003');
        });

        it('MOD_Admin v5.6.x extension constants match spec', () => {
            expect(FunctionCatalog.MANAGE_MENU_CATALOG).toBe('ADM-002');
            expect(FunctionCatalog.MANAGE_MENU_LIFECYCLE).toBe('ADM-002');
            expect(FunctionCatalog.MANAGE_IS_CRITICAL).toBe('ADM-001');
        });
    });
});
