import { configureStore } from '@reduxjs/toolkit';
import accessReducer, {
    assignFunction,
    revokeFunction,
    validateSeparationRules,
    fetchAllFunctions,
    fetchUserPermissions,
    clearError,
    clearSuccess,
    selectLoading,
    selectError,
    selectSuccess,
    selectFunctions,
    selectUserPermissions,
    selectSeparationConflicts,
} from '../accessSlice';
import accessService from '../../../services/accessService';

jest.mock('../../../services/accessService');

function buildStore(preloaded) {
    const config = { reducer: { access: accessReducer } };
    if (preloaded) config.preloadedState = { access: preloaded };
    return configureStore(config);
}

describe('accessSlice — initial state', () => {
    it('has correct default values', () => {
        const store = buildStore();
        const state = store.getState().access;
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.success).toBe(false);
        expect(state.functions).toEqual([]);
        expect(state.userPermissions).toEqual({});
        expect(state.separationConflicts).toEqual([]);
    });
});

describe('assignFunction thunk — catalogId invariant', () => {
    it('passes catalogId as array to accessService.assignFunctions', async () => {
        accessService.assignFunctions.mockResolvedValue({ assigned: 1 });
        const store = buildStore();
        await store.dispatch(assignFunction({ userId: 1, catalogId: 7, expiresAt: null }));
        expect(accessService.assignFunctions).toHaveBeenCalledWith(1, [7], null);
    });

    it('sets loading true while pending', () => {
        accessService.assignFunctions.mockReturnValue(new Promise(() => {}));
        const store = buildStore();
        store.dispatch(assignFunction({ userId: 1, catalogId: 5 }));
        expect(selectLoading(store.getState())).toBe(true);
    });

    it('sets success true on fulfilled', async () => {
        accessService.assignFunctions.mockResolvedValue({ assigned: 1 });
        const store = buildStore();
        await store.dispatch(assignFunction({ userId: 1, catalogId: 3 }));
        expect(selectSuccess(store.getState())).toBe(true);
        expect(selectLoading(store.getState())).toBe(false);
    });

    it('sets error on rejected', async () => {
        accessService.assignFunctions.mockRejectedValue(new Error('Server error'));
        const store = buildStore();
        await store.dispatch(assignFunction({ userId: 1, catalogId: 2 }));
        expect(selectError(store.getState())).toBe('Server error');
        expect(selectLoading(store.getState())).toBe(false);
    });
});

describe('revokeFunction thunk — catalogId invariant', () => {
    it('passes catalogId as array to accessService.revokeFunctions', async () => {
        accessService.revokeFunctions.mockResolvedValue({});
        const store = buildStore();
        await store.dispatch(revokeFunction({ userId: 2, catalogId: 10 }));
        expect(accessService.revokeFunctions).toHaveBeenCalledWith(2, [10], undefined);
    });

    it('does NOT call service with undefined catalogId array element', async () => {
        accessService.revokeFunctions.mockResolvedValue({});
        const store = buildStore();
        await store.dispatch(revokeFunction({ userId: 2, catalogId: 10 }));
        const [, passedIds] = accessService.revokeFunctions.mock.calls[0];
        expect(passedIds[0]).not.toBeUndefined();
    });
});

describe('validateSeparationRules thunk — functionPk invariant', () => {
    it('pasa functionPk a accessService.validateSeparationRules', async () => {
        accessService.validateSeparationRules.mockResolvedValue({ conflicts: [] });
        const store = buildStore();
        await store.dispatch(validateSeparationRules({ userId: 3, functionPk: 15 }));
        expect(accessService.validateSeparationRules).toHaveBeenCalledWith(3, 15);
    });

    it('almacena conflictos en separationConflicts al completarse', async () => {
        const conflicts = [{ rule: 'SOD-001' }];
        accessService.validateSeparationRules.mockResolvedValue({ conflicts });
        const store = buildStore();
        await store.dispatch(validateSeparationRules({ userId: 1, functionPk: 5 }));
        expect(selectSeparationConflicts(store.getState())).toEqual(conflicts);
    });
});

describe('selectors', () => {
    it('selectLoading reads state.access.loading', () => {
        const store = buildStore({ loading: true });
        expect(selectLoading(store.getState())).toBe(true);
    });

    it('selectError reads state.access.error', () => {
        const store = buildStore({ error: 'Some error' });
        expect(selectError(store.getState())).toBe('Some error');
    });

    it('selectFunctions reads state.access.functions', () => {
        const fns = [{ id: 1 }];
        const store = buildStore({ functions: fns });
        expect(selectFunctions(store.getState())).toEqual(fns);
    });

    it('selectUserPermissions reads state.access.userPermissions', () => {
        const perms = { functions: [] };
        const store = buildStore({ userPermissions: perms });
        expect(selectUserPermissions(store.getState())).toEqual(perms);
    });
});

describe('reducers', () => {
    it('clearError sets error to null', () => {
        const store = buildStore({ error: 'oops', loading: false });
        store.dispatch(clearError());
        expect(selectError(store.getState())).toBeNull();
    });

    it('clearSuccess sets success to false', () => {
        const store = buildStore({ success: true, loading: false });
        store.dispatch(clearSuccess());
        expect(selectSuccess(store.getState())).toBe(false);
    });
});
