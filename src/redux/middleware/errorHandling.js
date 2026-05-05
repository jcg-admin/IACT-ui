/**
 * Error Handling Middleware
 * Intercepta acciones rechazadas (async thunks) y las maneja automáticamente
 */

import {
  handleAPIError,
  setContextError,
  setErrorHandling,
} from '@redux/slices/errorSlice';
import {
  UnauthorizedError,
  RateLimitError,
  isRetryableError,
} from '@utils/apiErrors';

/**
 * Middleware para manejar errores de async thunks
 * Detecta cuando una acción es rechazada y dispatch setGlobalError
 */
export const errorHandlingMiddleware = (store) => (next) => (action) => {
  // Detectar acciones rechazadas (async thunks que fallaron)
  if (action.type && action.type.endsWith('/rejected')) {
    const error = action.payload;
    const context = _extractContextFromAction(action.type);

    // Marcar que estamos manejando un error
    store.dispatch(setErrorHandling(true));

    // Handle special error types
    if (error instanceof UnauthorizedError) {
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } else if (error instanceof RateLimitError) {
      // Show rate limit message
      console.warn('[API] Rate limit exceeded:', error.message);
    }

    // Set error context
    if (context) {
      store.dispatch(setContextError({ context, error }));
    } else {
      store.dispatch(handleAPIError(error));
    }

    // Dejar de marcar manejo de error
    setTimeout(() => {
      store.dispatch(setErrorHandling(false));
    }, 0);
  }

  return next(action);
};

/**
 * Extract context from action type
 * e.g., "dashboard/fetchMetrics/rejected" -> "dashboard"
 */
function _extractContextFromAction(actionType) {
  const parts = actionType.split('/');
  return parts[0] !== '@@INIT' ? parts[0] : null;
}

/**
 * Middleware para logging de errores
 */
export const errorLoggingMiddleware = (store) => (next) => (action) => {
  if (action.type && action.type.endsWith('/rejected')) {
    const error = action.payload;
    const state = store.getState();
    const timestamp = new Date().toISOString();

    const errorLog = {
      timestamp,
      action: action.type,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      },
      retryable: isRetryableError(error),
      state: {
        auth: {
          isAuthenticated: state.auth?.isAuthenticated,
          user: state.auth?.user?.id,
        },
      },
    };

    console.error('[Redux Error Middleware]', errorLog);

    // Send to error tracking service (Sentry, etc)
    if (typeof window !== 'undefined' && window.errorTracker) {
      window.errorTracker.captureException(error, {
        tags: {
          action: action.type,
          code: error.code,
        },
        extra: errorLog,
      });
    }
  }

  return next(action);
};

/**
 * Middleware para retry automático
 * Reintenta automáticamente errores retryables
 */
export const autoRetryMiddleware = (store) => (next) => (action) => {
  if (action.type && action.type.endsWith('/rejected')) {
    const error = action.payload;

    if (isRetryableError(error)) {
      console.log('[Auto Retry] Retrying action:', action.type);
      // El retry ya se maneja en apiService, este middleware es informativo
    }
  }

  return next(action);
};

export default errorHandlingMiddleware;
