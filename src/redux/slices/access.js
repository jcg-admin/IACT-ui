/**
 * Redux Access Control Slice
 * IACT v4.0 - Access Module
 * State management para control de acceso RBAC y reglas de separación
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accessService from '../../services/accessGateway';

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
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
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
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const assignFunction = createAsyncThunk(
    'access/assignFunction',
    // catalogId = numeric PK of the function in the RBAC catalog (UC_ACC_01 assignment).
    // This is NOT the codename used for runtime authorization checks.
    async ({ userId, catalogId, expiresAt }, { rejectWithValue }) => {
        try {
            const response = await accessService.assignFunctions(userId, [catalogId], expiresAt);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const revokeFunction = createAsyncThunk(
    'access/revokeFunction',
    // catalogId = numeric PK of the function in the RBAC catalog (UC_ACC_02 revocation).
    // This is NOT the codename used for runtime authorization checks.
    async ({ userId, catalogId, revokeReason }, { rejectWithValue }) => {
        try {
            const response = await accessService.revokeFunctions(userId, [catalogId], revokeReason);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const assignGroupToUser = createAsyncThunk(
    'access/assignGroupToUser',
    async ({ userId, groupId, expiresAt = null }, { rejectWithValue }) => {
        try {
            return await accessService.assignAccessGroup(userId, groupId, expiresAt);
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const revokeGroupFromUser = createAsyncThunk(
    'access/revokeGroupFromUser',
    async ({ userId, groupId }, { rejectWithValue }) => {
        try {
            return await accessService.revokeAccessGroup(userId, groupId);
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchSeparationRules = createAsyncThunk(
    'access/fetchSeparationRules',
    async (_, { rejectWithValue }) => {
        try {
            return await accessService.getSeparationRules();
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const createSeparationRule = createAsyncThunk(
    'access/createSeparationRule',
    async (data, { rejectWithValue }) => {
        try {
            return await accessService.createSeparationRule(data);
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const updateSeparationRule = createAsyncThunk(
    'access/updateSeparationRule',
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            return await accessService.updateSeparationRule(id, data);
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const deleteSeparationRule = createAsyncThunk(
    'access/deleteSeparationRule',
    async (id, { rejectWithValue }) => {
        try {
            await accessService.deleteSeparationRule(id);
            return id;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchUserAssignedFunctions = createAsyncThunk(
    'access/fetchUserAssignedFunctions',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await accessService.getUserPermissions(userId);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const validateSeparationRules = createAsyncThunk(
    'access/validateSeparationRules',
    // functionPk: PK de la función en el catálogo RBAC que se quiere asignar (UC-043).
    async ({ userId, functionPk }, { rejectWithValue }) => {
        try {
            const response = await accessService.validateSeparationRules(userId, functionPk);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
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
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const createGroup = createAsyncThunk(
    'access/createGroup',
    async (data, { rejectWithValue }) => {
        try {
            const response = await accessService.createGroup(data);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const updateGroup = createAsyncThunk(
    'access/updateGroup',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await accessService.updateGroup(id, data);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const deactivateGroup = createAsyncThunk(
    'access/deactivateGroup',
    async (id, { rejectWithValue }) => {
        try {
            const response = await accessService.deactivateGroup(id);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchGroupFunctions = createAsyncThunk(
    'access/fetchGroupFunctions',
    async (groupId, { rejectWithValue }) => {
        try {
            const response = await accessService.getGroupFunctions(groupId);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const assignFunctionsToGroup = createAsyncThunk(
    'access/assignFunctionsToGroup',
    async ({ groupId, functionIds }, { rejectWithValue }) => {
        try {
            const response = await accessService.assignFunctionsToGroup(groupId, functionIds);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

/**
 * Initial State
 */

const initialState = {
    functions: [],
    userPermissions: {},
    userAssignedFunctions: [],
    separationRules: [],
    separationConflicts: [],
    auditLog: [],
    groups: [],
    groupFunctions: [],
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
         * Fetch User Assigned Functions
         */
        builder
            .addCase(fetchUserAssignedFunctions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserAssignedFunctions.fulfilled, (state, action) => {
                state.loading = false;
                state.userAssignedFunctions = action.payload;
            })
            .addCase(fetchUserAssignedFunctions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Validate Separation Rules
         */
        builder
            .addCase(validateSeparationRules.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateSeparationRules.fulfilled, (state, action) => {
                state.loading = false;
                state.separationConflicts = action.payload.conflicts || [];
            })
            .addCase(validateSeparationRules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Assign / Revoke Group to/from User (uc-perm-01/02)
         */
        builder
            .addCase(assignGroupToUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(assignGroupToUser.fulfilled, (state) => { state.loading = false; state.success = true; })
            .addCase(assignGroupToUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(revokeGroupFromUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(revokeGroupFromUser.fulfilled, (state) => { state.loading = false; state.success = true; })
            .addCase(revokeGroupFromUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        /**
         * Separation Rules CRUD (uc-adm-01)
         */
        builder
            .addCase(fetchSeparationRules.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSeparationRules.fulfilled, (state, action) => { state.loading = false; state.separationRules = action.payload; })
            .addCase(fetchSeparationRules.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(createSeparationRule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(createSeparationRule.fulfilled, (state, action) => { state.loading = false; state.separationRules.push(action.payload); })
            .addCase(createSeparationRule.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(updateSeparationRule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateSeparationRule.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.separationRules.findIndex(r => r.id === action.payload.id);
                if (idx !== -1) state.separationRules[idx] = action.payload;
            })
            .addCase(updateSeparationRule.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(deleteSeparationRule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(deleteSeparationRule.fulfilled, (state, action) => {
                state.loading = false;
                state.separationRules = state.separationRules.filter(r => r.id !== action.payload);
            })
            .addCase(deleteSeparationRule.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

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

        /**
         * Create Group
         */
        builder
            .addCase(createGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.groups.push(action.payload);
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        /**
         * Update Group
         */
        builder
            .addCase(updateGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const idx = state.groups.findIndex(g => g.id === action.payload.id);
                if (idx !== -1) {
                    state.groups[idx] = action.payload;
                }
            })
            .addCase(updateGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        /**
         * Deactivate Group
         */
        builder
            .addCase(deactivateGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deactivateGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const idx = state.groups.findIndex(g => g.id === action.payload.id);
                if (idx !== -1) {
                    state.groups[idx] = action.payload;
                }
            })
            .addCase(deactivateGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });

        /**
         * Fetch Group Functions
         */
        builder
            .addCase(fetchGroupFunctions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupFunctions.fulfilled, (state, action) => {
                state.loading = false;
                state.groupFunctions = action.payload;
            })
            .addCase(fetchGroupFunctions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Assign Functions To Group
         */
        builder
            .addCase(assignFunctionsToGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(assignFunctionsToGroup.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.groupFunctions = action.payload;
            })
            .addCase(assignFunctionsToGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

/**
 * Selectors
 */

export const selectFunctions = (state) => state.access.functions;
export const selectUserPermissions = (state) => state.access.userPermissions;
export const selectUserAssignedFunctions = (state) => state.access.userAssignedFunctions;
export const selectSeparationRules = (state) => state.access.separationRules;
export const selectSeparationConflicts = (state) => state.access.separationConflicts;
export const selectAuditLog = (state) => state.access.auditLog;
export const selectGroups = (state) => state.access.groups;
export const selectGroupFunctions = (state) => state.access.groupFunctions;
export const selectLoading = (state) => state.access.loading;
export const selectError = (state) => state.access.error;
export const selectSuccess = (state) => state.access.success;
export const selectSelectedUser = (state) => state.access.selectedUser;

export const { clearError, clearSuccess, setSelectedUser, resetState } = accessSlice.actions;

export default accessSlice.reducer;
