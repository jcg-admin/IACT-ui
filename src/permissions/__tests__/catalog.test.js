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

    it('exposes VIEW_ALL_SESSIONS for profile sessions route guard (G-F7)', () => {
        expect(FunctionCatalog.VIEW_ALL_SESSIONS).toBe('auth:view_all_sessions');
    });

    it('exposes REVOKE_FUNCTION_GROUP for permissions revoke-group route guard (G-F8)', () => {
        expect(FunctionCatalog.REVOKE_FUNCTION_GROUP).toBe('access:revoke_group');
    });

    it('exposes GRANT_EXCEPTIONAL for permissions temp-permissions route guard (G-F9)', () => {
        expect(FunctionCatalog.GRANT_EXCEPTIONAL).toBe('access:grant_exceptional');
    });

    describe('FunctionCatalog v5.6.x extension — 26 new constants', () => {
        it('exports 66 total constants (40 baseline + 26 v5.6.x)', () => {
            expect(Object.keys(FunctionCatalog).length).toBe(66);
        });

        it('no key contains "SOD" in its name', () => {
            const hasSodKey = Object.keys(FunctionCatalog).some(k => k.includes('SOD'));
            expect(hasSodKey).toBe(false);
        });

        it('MOD_Alerts extended constants match RBAC v5.6.x spec', () => {
            expect(FunctionCatalog.CONFIGURE_TEAM_ALERTS).toBe('alerts:config_team');
            expect(FunctionCatalog.PAUSE_ALERTS).toBe('alerts:pause');
            expect(FunctionCatalog.DISABLE_ALERTS).toBe('alerts:disable');
            expect(FunctionCatalog.VIEW_ALERT_HISTORY).toBe('alerts:history');
            expect(FunctionCatalog.ACKNOWLEDGE_ALERT).toBe('alerts:acknowledge');
            expect(FunctionCatalog.SUBSCRIBE_ALERT).toBe('alerts:subscribe');
            expect(FunctionCatalog.UNSUBSCRIBE_ALERT).toBe('alerts:unsubscribe');
            expect(FunctionCatalog.CONFIGURE_ALERT_SEVERITY).toBe('alerts:config_severity');
        });

        it('MOD_Pipeline extended constants match spec', () => {
            expect(FunctionCatalog.VIEW_PIPELINE_ERRORS).toBe('pipeline:view_errors');
            expect(FunctionCatalog.VIEW_DATA_AVAILABILITY).toBe('pipeline:availability');
        });

        it('MOD_Users extended constants match spec', () => {
            expect(FunctionCatalog.LIST_USERS).toBe('users:list');
            expect(FunctionCatalog.SEARCH_USERS).toBe('users:search');
            expect(FunctionCatalog.BLOCK_USERS).toBe('users:block');
            expect(FunctionCatalog.UNBLOCK_USERS).toBe('users:unblock');
            expect(FunctionCatalog.REACTIVATE_USERS).toBe('users:reactivate');
        });

        it('MOD_Access extended constants match spec (no SOD in key names)', () => {
            expect(FunctionCatalog.REVOKE_FUNCTIONS).toBe('access:revoke');
            expect(FunctionCatalog.ASSIGN_FUNCTION_GROUPS).toBe('access:assign_group');
            expect(FunctionCatalog.ASSIGN_TO_GROUP).toBe('access:assign_to_group');
            expect(FunctionCatalog.UPDATE_SEPARATION_RULE).toBe('access:update_separation_rule');
            expect(FunctionCatalog.DISABLE_SEPARATION_RULE).toBe('access:disable_separation_rule');
            expect(FunctionCatalog.REVOKE_EXCEPTIONAL).toBe('access:revoke_exceptional');
        });

        it('MOD_Auth extended constants match spec', () => {
            expect(FunctionCatalog.CLOSE_SESSION).toBe('auth:close_session');
            expect(FunctionCatalog.RESET_PASSWORD).toBe('auth:reset_password');
        });

        it('MOD_Admin v5.6.x extension constants match spec', () => {
            expect(FunctionCatalog.MANAGE_MENU_CATALOG).toBe('adm:manage_menu_catalog');
            expect(FunctionCatalog.MANAGE_MENU_LIFECYCLE).toBe('adm:manage_menu_lifecycle');
            expect(FunctionCatalog.MANAGE_IS_CRITICAL).toBe('adm:manage_is_critical');
        });
    });
});
