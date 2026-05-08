/**
 * Error Handling Middleware
 * Intercepta acciones rechazadas (async thunks) y las maneja automáticamente
 */

import {
  handleHttpError,
  setContextError,
  setErrorHandling,
} from '@redux/slices/error';
import {
  UnauthorizedError,
  RateLimitError,
  NetworkAuthRequiredError,
  isRetryableError,
} from '@utils/apiErrors';
import { navigateTo } from '@utils/navigation';
import auditService from '../../services/auditGateway';

/**
 * Middleware para manejar errores de async thunks
 * Detecta cuando una acción es rechazada y dispatch setGlobalError
 */
export const errorHandlingMiddleware = (store) => (next) => (action) => {
  // Detectar acciones rechazadas (async thunks que fallaron)
  if (action.type && action.type.endsWith('/rejected')) {
    const rawError = action.payload;
    const error = typeof rawError === 'string'
      ? { message: rawError, statusCode: null, code: 'UNKNOWN' }
      : (rawError ?? { message: 'Error desconocido', statusCode: null, code: 'UNKNOWN' })
    const context = _extractContextFromAction(action.type);

    // Marcar que estamos manejando un error
    store.dispatch(setErrorHandling(true));

    // Handle special error types
    if (error instanceof UnauthorizedError) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } else if (error instanceof RateLimitError) {
      // RFC 6585 §4: surface retryAfter so the UI can show a countdown
      store.dispatch(handleHttpError({
        ...error.toJSON(),
        retryAfter: error.retryAfter,
      }));
    } else if (error instanceof NetworkAuthRequiredError) {
      // RFC 6585 §6: captive portal — redirect to the network login page
      if (error.loginUrl) {
        navigateTo(error.loginUrl);
      }
      return next(action);
    }

    // Set error context
    if (context) {
      store.dispatch(setContextError({ context, error }));
    } else {
      store.dispatch(handleHttpError(error));
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
 * BR_008: Todo acceso/error autenticado se registra en el audit trail.
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
        code: error?.code,
        message: error?.message,
        statusCode: error?.statusCode,
        stack: error?.stack,
      },
      retryable: isRetryableError(error ?? {}),
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
        tags: { action: action.type, code: error?.code },
        extra: errorLog,
      });
    }

    // BR_008: log authenticated HTTP errors (4xx/5xx) to audit trail
    const statusCode = error?.statusCode;
    const isAuthenticated = state.auth?.isAuthenticated;
    if (isAuthenticated && statusCode >= 400) {
      auditService.logEvent({
        event_type: 'HTTP_ERROR',
        timestamp,
        user_id: state.auth?.user?.id ?? null,
        action: action.type,
        status_code: statusCode,
        error_code: error?.code ?? null,
        message: error?.message ?? null,
        retryable: isRetryableError(error ?? {}),
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
