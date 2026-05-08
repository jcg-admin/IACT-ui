/**
 * Redux Audit Slice
 * IACT v4.0 - Audit Module
 * State management para auditoria y logs (READ-ONLY)
 * CNST-009: Auditoria Inmutable - No se pueden editar/eliminar registros
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import auditService from '../../services/auditService';

/**
 * Async Thunks - LECTURA ÚNICAMENTE
 */

export const fetchAuditLogs = createAsyncThunk(
    'audit/fetchAuditLogs',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await auditService.getAuditLogs(filters);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const searchAuditLogs = createAsyncThunk(
    'audit/searchAuditLogs',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await auditService.searchLogs(searchParams);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchComplianceReport = createAsyncThunk(
    'audit/fetchComplianceReport',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await auditService.getComplianceReport(filters);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchAuditSummary = createAsyncThunk(
    'audit/fetchAuditSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await auditService.getAuditSummary();
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
    logs: [],
    searchResults: [],
    complianceReport: null,
    summary: {
        totalLogs: 0,
        logsByType: {},
        logsByUser: {},
        dateRange: null,
    },
    loading: false,
    error: null,
    filters: {
        dateStart: null,
        dateEnd: null,
        userId: null,
        action: null,
        resource: null,
        limit: 100,
    },
};

/**
 * Audit Slice - READ-ONLY (CNST-009)
 * No permite edición, eliminación o modificación de registros
 */

const auditSlice = createSlice({
    name: 'audit',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        /**
         * Fetch Audit Logs
         */
        builder
            .addCase(fetchAuditLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload;
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Search Audit Logs
         */
        builder
            .addCase(searchAuditLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch Compliance Report
         */
        builder
            .addCase(fetchComplianceReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComplianceReport.fulfilled, (state, action) => {
                state.loading = false;
                state.complianceReport = action.payload;
            })
            .addCase(fetchComplianceReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch Audit Summary
         */
        builder
            .addCase(fetchAuditSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.summary = action.payload;
            })
            .addCase(fetchAuditSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

/**
 * Selectors
 */

export const selectLogs = (state) => state.audit.logs;
export const selectSearchResults = (state) => state.audit.searchResults;
export const selectComplianceReport = (state) => state.audit.complianceReport;
export const selectSummary = (state) => state.audit.summary;
export const selectLoading = (state) => state.audit.loading;
export const selectError = (state) => state.audit.error;
export const selectFilters = (state) => state.audit.filters;

export const selectLogsByUser = (state, userId) =>
    state.audit.logs.filter(log => log.user_id === userId);

export const selectLogsByAction = (state, action) =>
    state.audit.logs.filter(log => log.action === action);

export const selectLogsByDateRange = (state, startDate, endDate) =>
    state.audit.logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });

export const selectCriticalLogs = (state) =>
    state.audit.logs.filter(log => log.severity === 'CRITICAL');

export const { clearError, setFilters, resetFilters, resetState } = auditSlice.actions;

export default auditSlice.reducer;
