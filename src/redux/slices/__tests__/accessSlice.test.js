import { configureStore } from '@reduxjs/toolkit';
import accessReducer, {
    assignFunction,
    revokeFunction,
    validateSoD,
    fetchAllFunctions,
    fetchUserPermissions,
    clearError,
    clearSuccess,
    selectLoading,
    selectError,
    selectSuccess,
    selectFunctions,
    selectUserPermissions,
    selectSoDConflicts,
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
        expect(state.sodConflicts).toEqual([]);
    });
});

describe('assignFunction thunk — catalogId invariant', () => {
    it('passes catalogId (not undefined) to accessService.assignFunction', async () => {
        accessService.assignFunction.mockResolvedValue({ newFunction: { id: 7 } });
        const store = buildStore();
        await store.dispatch(assignFunction({ userId: 1, catalogId: 7, expiresAt: null }));
        expect(accessService.assignFunction).toHaveBeenCalledWith(1, 7, null);
    });

    it('sets loading true while pending', () => {
        accessService.assignFunction.mockReturnValue(new Promise(() => {}));
        const store = buildStore();
        store.dispatch(assignFunction({ userId: 1, catalogId: 5 }));
        expect(selectLoading(store.getState())).toBe(true);
    });

    it('sets success true on fulfilled', async () => {
        accessService.assignFunction.mockResolvedValue({ newFunction: {} });
        const store = buildStore();
        await store.dispatch(assignFunction({ userId: 1, catalogId: 3 }));
        expect(selectSuccess(store.getState())).toBe(true);
        expect(selectLoading(store.getState())).toBe(false);
    });

    it('sets error on rejected', async () => {
        accessService.assignFunction.mockRejectedValue(new Error('Server error'));
        const store = buildStore();
        await store.dispatch(assignFunction({ userId: 1, catalogId: 2 }));
        expect(selectError(store.getState())).toBe('Server error');
        expect(selectLoading(store.getState())).toBe(false);
    });
});

describe('revokeFunction thunk — catalogId invariant', () => {
    it('passes catalogId to accessService.revokeFunction', async () => {
        accessService.revokeFunction.mockResolvedValue({});
        const store = buildStore();
        await store.dispatch(revokeFunction({ userId: 2, catalogId: 10 }));
        expect(accessService.revokeFunction).toHaveBeenCalledWith(2, 10);
    });

    it('does NOT call service with undefined catalogId', async () => {
        accessService.revokeFunction.mockResolvedValue({});
        const store = buildStore();
        await store.dispatch(revokeFunction({ userId: 2, catalogId: 10 }));
        const [, passedCatalogId] = accessService.revokeFunction.mock.calls[0];
        expect(passedCatalogId).not.toBeUndefined();
    });
});

describe('validateSoD thunk — catalogId invariant', () => {
    it('passes catalogId to accessService.validateSoD', async () => {
        accessService.validateSoD.mockResolvedValue({ conflicts: [] });
        const store = buildStore();
        await store.dispatch(validateSoD({ userId: 3, catalogId: 15 }));
        expect(accessService.validateSoD).toHaveBeenCalledWith(3, 15);
    });

    it('stores conflicts in state on fulfilled', async () => {
        const conflicts = [{ rule: 'SOD-001' }];
        accessService.validateSoD.mockResolvedValue({ conflicts });
        const store = buildStore();
        await store.dispatch(validateSoD({ userId: 1, catalogId: 5 }));
        expect(selectSoDConflicts(store.getState())).toEqual(conflicts);
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
