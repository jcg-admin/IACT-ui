/**
 * Error Slice
 * Gestiona el estado global de errores de la aplicación
 */

import { createSlice } from '@reduxjs/toolkit';
import { UnauthorizedError } from '@utils/apiErrors';

const initialState = {
  global: null, // Error global de la aplicación
  byContext: {}, // Errores por contexto (dashboard, profile, etc)
  requestErrors: [], // Historial de errores (últimos 10)
  isHandling: false, // Flag para evitar loops infinitos
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    // Set error global
    setGlobalError: (state, action) => {
      state.global = action.payload;
      _addToHistory(state, action.payload);
    },

    // Clear error global
    clearGlobalError: (state) => {
      state.global = null;
    },

    // Set error por contexto
    setContextError: (state, action) => {
      const { context, error } = action.payload;
      state.byContext[context] = error;
      _addToHistory(state, error);
    },

    // Clear error por contexto
    clearContextError: (state, action) => {
      const context = action.payload;
      delete state.byContext[context];
    },

    // Clear todos los errores
    clearAllErrors: (state) => {
      state.global = null;
      state.byContext = {};
    },

    // Handle API error
    handleAPIError: (state, action) => {
      const error = action.payload;

      // Don't set unauthorized as global error (handled separately)
      if (error instanceof UnauthorizedError) {
        return;
      }

      state.global = {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
      };

      _addToHistory(state, error);
    },

    // Clear error history
    clearErrorHistory: (state) => {
      state.requestErrors = [];
    },

    // Toggle error handling flag
    setErrorHandling: (state, action) => {
      state.isHandling = action.payload;
    },
  },
});

/**
 * Helper para agregar error al historial (últimos 10)
 */
function _addToHistory(state, error) {
  const errorRecord = {
    code: error.code || 'UNKNOWN',
    message: error.message || 'Unknown error',
    statusCode: error.statusCode || null,
    timestamp: error.timestamp || new Date().toISOString(),
    context: error.context || null,
  };

  state.requestErrors.unshift(errorRecord);
  if (state.requestErrors.length > 10) {
    state.requestErrors.pop();
  }
}

export const {
  setGlobalError,
  clearGlobalError,
  setContextError,
  clearContextError,
  clearAllErrors,
  handleAPIError,
  clearErrorHistory,
  setErrorHandling,
} = errorSlice.actions;

export default errorSlice.reducer;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectGlobalError = (state) => state.error?.global;
export const selectContextError = (context) => (state) => 
  state.error?.byContext?.[context];
export const selectAllErrors = (state) => state.error?.byContext || {};
export const selectErrorHistory = (state) => state.error?.requestErrors || [];
export const selectIsErrorHandling = (state) => state.error?.isHandling || false;

/**
 * Check if there are any errors
 */
export const selectHasErrors = (state) => {
  const error = state.error;
  return !!(error?.global || Object.keys(error?.byContext || {}).length > 0);
};

/**
 * Get all errors flattened
 */
export const selectAllErrorsList = (state) => {
  const error = state.error;
  const errors = [];

  if (error?.global) {
    errors.push({ type: 'global', ...error.global });
  }

  Object.entries(error?.byContext || {}).forEach(([context, err]) => {
    errors.push({ type: 'context', context, ...err });
  });

  return errors;
};
