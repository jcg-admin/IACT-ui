/**
 * Redux Access Control Slice
 * IACT v4.0 - Access Module
 * State management para control de acceso RBAC + SoD
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accessService from '../../services/accessService';

/**
 * Async Thunks
 */

export const fetchAllFunctions = createAsyncThunk(
    'access/fetchAllFunctions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await accessService.getAllFunctions();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserPermissions = createAsyncThunk(
    'access/fetchUserPermissions',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await accessService.getUserPermissions(userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const assignFunction = createAsyncThunk(
    'access/assignFunction',
    async ({ userId, functionId, expiresAt }, { rejectWithValue }) => {
        try {
            const response = await accessService.assignFunction(userId, functionId, expiresAt);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const revokeFunction = createAsyncThunk(
    'access/revokeFunction',
    async ({ userId, functionId }, { rejectWithValue }) => {
        try {
            const response = await accessService.revokeFunction(userId, functionId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const validateSoD = createAsyncThunk(
    'access/validateSoD',
    async ({ userId, functionId }, { rejectWithValue }) => {
        try {
            const response = await accessService.validateSoD(userId, functionId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAccessAudit = createAsyncThunk(
    'access/fetchAccessAudit',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await accessService.getAccessAudit(userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Initial State
 */

const initialState = {
    functions: [],
    userPermissions: {},
    sodConflicts: [],
    auditLog: [],
    loading: false,
    error: null,
    success: false,
    selectedUser: null,
};

/**
 * Access Slice
 */

const accessSlice = createSlice({
    name: 'access',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        /**
         * Fetch All Functions
         */
        builder
            .addCase(fetchAllFunctions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllFunctions.fulfilled, (state, action) => {
                state.loading = false;
                state.functions = action.payload;
            })
            .addCase(fetchAllFunctions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch User Permissions
         */
        builder
            .addCase(fetchUserPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.userPermissions = action.payload;
            })
            .addCase(fetchUserPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Assign Function
         */
        builder
            .addCase(assignFunction.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(assignFunction.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Actualizar permisos del usuario
                if (state.userPermissions.functions) {
                    state.userPermissions.functions.push(action.payload.newFunction);
                }
            })
            .addCase(assignFunction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        /**
         * Revoke Function
         */
        builder
            .addCase(revokeFunction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(revokeFunction.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(revokeFunction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Validate SoD
         */
        builder
            .addCase(validateSoD.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateSoD.fulfilled, (state, action) => {
                state.loading = false;
                state.sodConflicts = action.payload.conflicts || [];
            })
            .addCase(validateSoD.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch Access Audit
         */
        builder
            .addCase(fetchAccessAudit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccessAudit.fulfilled, (state, action) => {
                state.loading = false;
                state.auditLog = action.payload;
            })
            .addCase(fetchAccessAudit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

/**
 * Selectors
 */

export const selectFunctions = (state) => state.access.functions;
export const selectUserPermissions = (state) => state.access.userPermissions;
export const selectSoDConflicts = (state) => state.access.sodConflicts;
export const selectAuditLog = (state) => state.access.auditLog;
export const selectLoading = (state) => state.access.loading;
export const selectError = (state) => state.access.error;
export const selectSuccess = (state) => state.access.success;
export const selectSelectedUser = (state) => state.access.selectedUser;

export const { clearError, clearSuccess, setSelectedUser, resetState } = accessSlice.actions;

export default accessSlice.reducer;
