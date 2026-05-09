/**
 * Redux Alerts Slice
 * IACT v4.0 - Alerts Module
 * State management para sistema de alertas y notificaciones
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import alertsService from '../../services/alertsGateway';

/**
 * Async Thunks
 */

export const fetchAlerts = createAsyncThunk(
    'alerts/fetchAlerts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await alertsService.getAlerts();
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const createAlert = createAsyncThunk(
    'alerts/createAlert',
    async (alertConfig, { rejectWithValue }) => {
        try {
            const response = await alertsService.createAlert(alertConfig);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const updateAlert = createAsyncThunk(
    'alerts/updateAlert',
    async ({ alertId, config }, { rejectWithValue }) => {
        try {
            const response = await alertsService.updateAlert(alertId, config);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const deleteAlert = createAsyncThunk(
    'alerts/deleteAlert',
    async (alertId, { rejectWithValue }) => {
        try {
            await alertsService.deleteAlert(alertId);
            return alertId;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchAlertHistory = createAsyncThunk(
    'alerts/fetchAlertHistory',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await alertsService.getAlertHistory(filters);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchTemplates = createAsyncThunk(
    'alerts/fetchTemplates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await alertsService.getTemplates();
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const subscribeToAlert = createAsyncThunk(
    'alerts/subscribeToAlert',
    async ({ alertId, channels, frequency }, { rejectWithValue }) => {
        try {
            const response = await alertsService.subscribeToAlert(alertId, channels, frequency);
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const unsubscribeFromAlert = createAsyncThunk(
    'alerts/unsubscribeFromAlert',
    async (alertId, { rejectWithValue }) => {
        try {
            await alertsService.unsubscribeFromAlert(alertId);
            return alertId;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const fetchMySubscriptions = createAsyncThunk(
    'alerts/fetchMySubscriptions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await alertsService.getMySubscriptions();
            return response;
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

export const acknowledgeAlert = createAsyncThunk(
    'alerts/acknowledgeAlert',
    async ({ alertId, note }, { rejectWithValue }) => {
        try {
            return await alertsService.acknowledgeAlert(alertId, note);
        } catch (error) {
            return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null });
        }
    }
);

/**
 * Initial State
 */

const initialState = {
    alerts: [],
    subscriptions: [],
    history: [],
    templates: [],
    loading: false,
    error: null,
    success: false,
};

/**
 * Alerts Slice
 */

const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        resetState: () => initialState,
    },
    extraReducers: (builder) => {
        /**
         * Fetch Alerts
         */
        builder
            .addCase(fetchAlerts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAlerts.fulfilled, (state, action) => {
                state.loading = false;
                state.alerts = action.payload;
            })
            .addCase(fetchAlerts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Create Alert
         */
        builder
            .addCase(createAlert.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createAlert.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.alerts.push(action.payload);
            })
            .addCase(createAlert.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Update Alert
         */
        builder
            .addCase(updateAlert.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAlert.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.alerts.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.alerts[index] = action.payload;
                }
            })
            .addCase(updateAlert.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Delete Alert
         */
        builder
            .addCase(deleteAlert.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteAlert.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.alerts = state.alerts.filter(a => a.id !== action.payload);
            })
            .addCase(deleteAlert.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch Alert History
         */
        builder
            .addCase(fetchAlertHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAlertHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(fetchAlertHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch Templates
         */
        builder
            .addCase(fetchTemplates.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.loading = false;
                state.templates = action.payload;
            })
            .addCase(fetchTemplates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Subscribe to Alert
         */
        builder
            .addCase(subscribeToAlert.pending, (state) => {
                state.loading = true;
            })
            .addCase(subscribeToAlert.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.subscriptions.push(action.payload);
            })
            .addCase(subscribeToAlert.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Unsubscribe from Alert
         */
        builder
            .addCase(unsubscribeFromAlert.pending, (state) => {
                state.loading = true;
            })
            .addCase(unsubscribeFromAlert.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.subscriptions = state.subscriptions.filter(s => s.alert_id !== action.payload);
            })
            .addCase(unsubscribeFromAlert.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /**
         * Fetch My Subscriptions
         */
        builder
            .addCase(fetchMySubscriptions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
                state.loading = false;
                state.subscriptions = action.payload;
            })
            .addCase(fetchMySubscriptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            /**
             * Acknowledge Alert (uc-alr-03)
             */
            .addCase(acknowledgeAlert.pending, (state) => {
                state.error = null;
            })
            .addCase(acknowledgeAlert.fulfilled, (state, action) => {
                const idx = state.alerts.findIndex(a => String(a.id) === String(action.payload.id));
                if (idx !== -1) {
                    state.alerts[idx] = {
                        ...state.alerts[idx],
                        state: 'acknowledged',
                        ack_by: action.payload.acknowledged_by,
                        ack_at: action.payload.acknowledged_at,
                        ack_note: action.payload.note,
                    };
                }
            })
            .addCase(acknowledgeAlert.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

/**
 * Selectors
 */

export const selectAlerts = (state) => state.alerts.alerts;
export const selectSubscriptions = (state) => state.alerts.subscriptions;
export const selectHistory = (state) => state.alerts.history;
export const selectTemplates = (state) => state.alerts.templates;
export const selectLoading = (state) => state.alerts.loading;
export const selectError = (state) => state.alerts.error;
export const selectSuccess = (state) => state.alerts.success;

export const selectActiveAlerts = (state) => state.alerts.alerts.filter(a => a.state === 'firing');
export const selectAlertsByCategory = (state, category) =>
    state.alerts.alerts.filter(a => a.category === category);
export const selectUserSubscribedAlerts = (state) =>
    state.alerts.subscriptions.map(s => s.rule_id);

export const { clearError, clearSuccess, resetState } = alertsSlice.actions;

export default alertsSlice.reducer;
