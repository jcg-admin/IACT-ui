/**
 * Error Slice
 * Gestiona el estado global de errores de la aplicación
 */

import { createSlice } from '@reduxjs/toolkit';
import { UnauthorizedError } from '@shared/apiErrors';

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
    handleHttpError: (state, action) => {
      const error = action.payload;

      // Don't set unauthorized as global error (handled by auth:unauthorized event)
      if (error?.code === 'UNAUTHORIZED' || error instanceof UnauthorizedError) {
        return;
      }

      state.global = {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp || new Date().toISOString(),
        retryAfter: error.retryAfter ?? null,
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
  handleHttpError,
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

/** True when the global error has a retryAfter value (429 / 408 / 413) */
export const selectGlobalErrorIsRetryable = (state) =>
  state.error?.global?.retryAfter != null;

/** Returns retryAfter seconds for rate-limit countdown UI */
export const selectRetryAfter = (state) =>
  state.error?.global?.retryAfter ?? null;

/** True when the global error is a persistent maintenance error (502/503) */
export const selectIsPersistentError = (state) => {
  const code = state.error?.global?.statusCode;
  return code === 502 || code === 503;
};

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
